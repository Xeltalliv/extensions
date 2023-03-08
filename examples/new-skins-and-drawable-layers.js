(function(Scratch) {
	"use strict";

	const DRAWABLE_GROUP_NAME = "rectangles";
	const DRAW_BEFORE = "pen";

	const renderer = Scratch.vm.renderer;
	const runtime = Scratch.vm.runtime;

	// Make canvas which new skin will represent
	const canvas = document.createElement("canvas");
	canvas.width = 480;
	canvas.height = 360;
	const ctx = canvas.getContext("2d");
	ctx.translate(240, 180);
	ctx.textAlign = "center";
	ctx.font = "20px sans serif";
	ctx.fillText("This extension adds a new '"+DRAWABLE_GROUP_NAME+"' layer", 0, -30);
	ctx.fillText("to an already existing background,", 0, 0);
	ctx.fillText("video, pen and sprite layers", 0, 30);
	ctx.scale(1, -1);


	// Obtain "Skin"
	const tempSkin = renderer.createTextSkin("say", "", true);
	const Skin = renderer._allSkins[tempSkin].__proto__.__proto__.constructor;
	renderer.destroySkin(tempSkin);


	// Define custom skin
	class NewCanvasSkin extends Skin {
		constructor(id, renderer) {
			super(id, renderer);
			const gl = renderer.gl;
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			this._texture = texture;
			this._rotationCenter = [240, 180];
		}
		dispose() {
			if(this._texture) {
				this._renderer.gl.deleteTexture(this._texture);
				this._texture = null;
			}
			super.dispose();
		}
		get size() {
			return [480, 360];
		}
		getTexture(scale) {
			return this._texture || super.getTexture();
		}
		setContent(textureData) {
			const gl = this._renderer.gl;
			gl.bindTexture(gl.TEXTURE_2D, this._texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
			this.emitWasAltered();
		}
	}


	// Register new drawable group DRAWABLE_GROUP_NAME drawn before DRAW_BEFORE
	let index = renderer._groupOrdering.indexOf(DRAW_BEFORE);
	let copy = renderer._groupOrdering.slice();
	copy.splice(index, 0, DRAWABLE_GROUP_NAME);
	renderer.setLayerGroupOrdering(copy);


	// Create skin NewCanvasSkin
	let skinId = renderer._nextSkinId++;
	let skin = new NewCanvasSkin(skinId, renderer);
	renderer._allSkins[skinId] = skin;


	// Create drawable of DRAWABLE_GROUP_NAME
	let drawableId = renderer.createDrawable(DRAWABLE_GROUP_NAME);


	// Link drawable and skin
	renderer.updateDrawableSkinId(drawableId, skinId);


	// Make skin auto-update it's WebGL texture
	const drawOriginal = renderer.draw;
	renderer.draw = function() {
		if(this.dirty) redraw();
		drawOriginal.call(this);
	}
	function redraw() {
		skin.setContent(canvas);
		runtime.requestRedraw();
	}
	redraw();


	class Extension {
		getInfo() {
			return {
				id: "skins",
				name: "Skins + Drawables",
				blocks: [
					{
						opcode: "clear",
						blockType: Scratch.BlockType.COMMAND,
						text: "clear"
					},
					{
						opcode: "rectangle",
						blockType: Scratch.BlockType.COMMAND,
						text: "rectangle [X1] [Y1] [X2] [Y2] color [COLOR]",
						arguments: {
							X1: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: "-100"
							},
							Y1: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: "-100"
							},
							X2: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: "100"
							},
							Y2: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: "100"
							},
							COLOR: {
								type: Scratch.ArgumentType.COLOR,
								defaultValue: "#0000ff"
							},
						}
					}
				]
			};
		}
		clear() {
			ctx.clearRect(-240, -180, 480, 360);
			renderer.dirty = true;
			runtime.requestRedraw();
		}
		rectangle({X1, Y1, X2, Y2, COLOR}) {
			ctx.fillStyle = "rgb("+Scratch.Cast.toRgbColorList(COLOR).join(",")+")";
			let minX = Math.min(X1, X2);
			let minY = Math.min(Y1, Y2);
			let maxX = Math.max(X1, X2);
			let maxY = Math.max(Y1, Y2);
			ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
			renderer.dirty = true;
			runtime.requestRedraw();
		}
	}

	Scratch.extensions.register(new Extension());
})(Scratch);