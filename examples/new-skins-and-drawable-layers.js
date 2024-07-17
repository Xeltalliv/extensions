(function(Scratch) {
	"use strict";

	const DRAWABLE_GROUP_NAME = "rectangles";
	const DRAW_BEFORE = "pen";
	const DRAWABLE_DISPLAY_NAME = "My Test Layer";

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


	const Skin = renderer.exports.Skin;

	// Or if that isn't an option, Skin can be obtained like this:
	//   const tempSkin = renderer.createTextSkin("say", "", true);
	//   const Skin = renderer._allSkins[tempSkin].__proto__.__proto__.constructor;
	//   renderer.destroySkin(tempSkin);


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
			this._rotationCenter = [240, 180]; // In scratch units, not the size of the canvas/texture
		}
		dispose() {
			if(this._texture) {
				this._renderer.gl.deleteTexture(this._texture);
				this._texture = null;
			}
			super.dispose();
		}
		get size() {
			return [480, 360]; // In scratch units, not the size of the canvas/texture
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


	// To undertsand how the following code works, it's important
	// to understand how those are interconnected:
	// renderer._groupOrdering => renderer._layerGroups => renderer._drawList => renderer._allDrawables

	// The first step is to register new drawable group DRAWABLE_GROUP_NAME drawn before DRAW_BEFORE.
	// renderer._groupOrdering is just an array of strings that stores
	// the order in which all drawable groups are displayed.

	// Start by finding index of DRAW_BEFORE in that array
	// and inserting new drawable group after it.
	let index = renderer._groupOrdering.indexOf(DRAW_BEFORE);
	renderer._groupOrdering.splice(index + 1, 0, DRAWABLE_GROUP_NAME);

	// renderer._layerGroups is an object with drawable group names as keys
	// and objects with groupIndex and drawListOffset as values, where:
	//  * groupIndex describes the index of that drawable group within
	//    renderer._groupOrdering array.
	//  * drawListOffset describes the index of the first element of that
	//    group within renderer._drawList or if there are none, index of
	//    where it would've been if there was one.

	// So now we need to descibe the newly added drawable group.
	// Since groupIndex is corrected later, it can be set to anything,
	// here, in this case 0.
	// Since there are no drawables in this group yet, the drawListOffset
	// can be taken from the next one. If the next group doesn't have any
	// drawables in it either, it will have the same value of
	// drawListOffset as it's next one, so it will be correct regardless.
	renderer._layerGroups[DRAWABLE_GROUP_NAME] = {
		groupIndex: 0,
		drawListOffset: renderer._layerGroups[DRAW_BEFORE].drawListOffset,
	};

	// Also inserting new value into renderer._groupOrdering means that,
	// many of the groupIndexes within renderer._layerGroups are no longer
	// correct and need to be shifted. Instead of figuring out which ones
	// need to be shifted, it's easier to just recalucated all of them.
	for (let i = 0; i < renderer._groupOrdering.length; i++) {
		renderer._layerGroups[renderer._groupOrdering[i]].groupIndex = i;
	}

	// Create skin NewCanvasSkin
	let skinId = renderer._nextSkinId++;
	let skin = new NewCanvasSkin(skinId, renderer);
	renderer._allSkins[skinId] = skin;


	// Create drawable of DRAWABLE_GROUP_NAME
	let drawableId = renderer.createDrawable(DRAWABLE_GROUP_NAME);


	// (Optional) Set drawable name for identification by SharkPool's
	// "Layer Control" extension and possibly other extensions.
	renderer._allDrawables[drawableId].customDrawableName = DRAWABLE_DISPLAY_NAME;


	// Tell the drawable to use the skin.
	renderer.updateDrawableSkinId(drawableId, skinId);


	// Make skin auto-update it's WebGL texture
	const drawOriginal = renderer.draw;
	renderer.draw = function() {
		// TODO: only re-upload canvas into texture when canvas
		// itself changes, instead of on any stage change in general
		if (this.dirty) redraw();
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