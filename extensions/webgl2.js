// https://github.com/Xeltalliv/extensions/blob/webgl2-dev/extensions/webgl2.js

(function(Scratch) {
	"use strict";

	setTimeout(() => alert("(WebGL2 extension / Arpil 2024) Please refrain from adding it to your collections of usable extensions, because it's still far from a usable state."), 3000);

	if (!Scratch.extensions.unsandboxed) {
		throw new Error("WebGL extension must be run unsandboxed");
	}

	const TypedArrays = {
		Int8Array,
		Uint8Array,
		Int16Array,
		Uint16Array,
		Int32Array,
		Uint32Array,
		Float32Array,
		Float64Array
	}
	const WebGLTypes = [
		WebGLVertexArrayObject,
		WebGLUniformLocation,
		WebGLTransformFeedback,
		WebGLTexture,
		WebGLSync,
		WebGLShader,
		WebGLSampler,
		WebGLRenderbuffer,
		WebGLQuery,
		WebGLProgram,
		WebGLFramebuffer,
		WebGLContextEvent,
		WebGLBuffer,
		WebGLActiveInfo
	];
	const Category = {
		BUFFERS: "Buffers",
		VAO: "VAO",
		SHADERS: "Shaders",
		PROGRAMS: "Programs",
		UNIFORMS: "Uniforms",
		ATTRIBUTES: "Attributes",
		TEXTURES: "Textures",
		RENDERBUFFERS: "Render Buffers",
		FRAMEBUFFERS: "Frame Buffers",
		SAMPLERS: "Samplers",
		QUERIES: "Queries",
		TRANSFORMFEEDBACK: "Transform Feedback",
		SYNC: "Sync",
		RENDERING: "Rendering",
		WRITEOPTIONS: "Write Options",
	}
	const ArgumentType = {
		...Scratch.ArgumentType,
		"LIST":                   "list",
		"VECTOR":                 "vector",
		"PROPERTY":               "property",
		"WebGLVertexArrayObject": "WebGLVertexArrayObject",
		"WebGLUniformLocation":   "WebGLUniformLocation",
		"WebGLTransformFeedback": "WebGLTransformFeedback",
		"WebGLTexture":           "WebGLTexture",
		"WebGLSync":              "WebGLSync",
		"WebGLShader":            "WebGLShader",
		"WebGLSampler":           "WebGLSampler",
		"WebGLRenderbuffer":      "WebGLRenderbuffer",
		"WebGLQuery":             "WebGLQuery",
		"WebGLProgram":           "WebGLProgram",
		"WebGLFramebuffer":       "WebGLFramebuffer",
		"WebGLBuffer":            "WebGLBuffer"
	};
	const {BlockType, Cast, vm} = Scratch;
	const {renderer, runtime} = vm;

	const num  = Cast.toNumber;
	const str  = Cast.toString;
	const bool = Cast.toBoolean;

	let OUTPUT_LIST = [];

	let canvas, gl;

	let onContextRecreatedCbs = [];
	function recreateContext(params) {
		let newCanvas = document.createElement("canvas");
		if (canvas) {
			newCanvas.width  = canvas.width;
			newCanvas.height = canvas.height;
		} else {
			newCanvas.width  = 480;
			newCanvas.height = 360;
		}
		let newGl = newCanvas.getContext("webgl2", params);
		if (!newGl) return;
		canvas = newCanvas;
		window.gl = gl = newGl;
		renderer.dirty = true;
		runtime.requestRedraw();
		onContextRecreatedCbs.forEach(fn => fn(canvas, gl));
	}
	recreateContext({ preserveDrawingBuffer: true });


	//https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_PIXELS_TYPE_TABLE
	const GlTypeToTypedArray = {
		[gl.BYTE]: Int8Array,
		[gl.UNSIGNED_BYTE]: Uint8Array,
		[gl.UNSIGNED_BYTE]: Uint8ClampedArray,
		[gl.SHORT]: Int16Array,
		[gl.UNSIGNED_SHORT]: Uint16Array,
		[gl.UNSIGNED_SHORT_5_6_5]: Uint16Array,
		[gl.UNSIGNED_SHORT_5_5_5_1]: Uint16Array,
		[gl.UNSIGNED_SHORT_4_4_4_4]: Uint16Array,
		[gl.INT]: Int32Array,
		[gl.UNSIGNED_INT]: Uint32Array,
		[gl.UNSIGNED_INT_5_9_9_9_REV]: Uint32Array,
		[gl.UNSIGNED_INT_2_10_10_10_REV]: Uint32Array,
		[gl.UNSIGNED_INT_10F_11F_11F_REV]: Uint32Array,
		[gl.UNSIGNED_INT_24_8]: Uint32Array,
		[gl.HALF_FLOAT]: Uint16Array,
		[gl.FLOAT]: Float32Array
	}
	const GlTypeFitsChannels = {
		[gl.BYTE]: 1,
		[gl.UNSIGNED_BYTE]: 1,
		[gl.UNSIGNED_BYTE]: 1,
		[gl.SHORT]: 1,
		[gl.UNSIGNED_SHORT]: 1,
		[gl.UNSIGNED_SHORT_5_6_5]: 2,
		[gl.UNSIGNED_SHORT_5_5_5_1]: 4,
		[gl.UNSIGNED_SHORT_4_4_4_4]: 4,
		[gl.INT]: 1,
		[gl.UNSIGNED_INT]: 1,
		[gl.UNSIGNED_INT_5_9_9_9_REV]: 4,
		[gl.UNSIGNED_INT_2_10_10_10_REV]: 4,
		[gl.UNSIGNED_INT_10F_11F_11F_REV]: 4,
		[gl.UNSIGNED_INT_24_8]: 2,
		[gl.HALF_FLOAT]: 1,
		[gl.FLOAT]: 1
	}
	const GlFormatChannels = {
		[gl.RED]: 1,
		[gl.RED_INTEGER]: 1,
		[gl.ALPHA]: 1,
		[gl.RG]: 2,
		[gl.RG_INTEGER]: 2,
		[gl.RGB]: 3,
		[gl.RGB_INTEGER]: 3,
		[gl.RGBA]: 4,
		[gl.RGBA_INTEGER]: 4
	}


	let skin = null;
	let skinId = null;
	let drawableId = null;

	// Obtain Skin
	let tempSkin = renderer.createTextSkin("say", "", true);
	let Skin = renderer._allSkins[tempSkin].__proto__.__proto__.constructor;
	renderer.destroySkin(tempSkin);

	class SimpleSkin extends Skin {
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
			this._renderer = renderer; // vanilla Scratch compat
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
			this.emitWasAltered ? this.emitWasAltered() : this.emit(Skin.Events.WasAltered); // vanilla Scratch compat
		}
	}

	// Register new drawable group "webgl2"
	let index = renderer._groupOrdering.indexOf("video");
	renderer._groupOrdering.splice(index+1, 0, "webgl2");
	renderer._layerGroups["webgl2"] = {
		groupIndex: 0,
		drawListOffset: renderer._layerGroups["video"].drawListOffset
	};
	for (let i = 0; i < renderer._groupOrdering.length; i++) {
		renderer._layerGroups[renderer._groupOrdering[i]].groupIndex = i;
	}

	// Create drawable and skin
	skinId = renderer._nextSkinId++;
	renderer._allSkins[skinId] = skin = new SimpleSkin(skinId, renderer);
	drawableId = renderer.createDrawable("webgl2"); // TODO change to "webgl"
	renderer.updateDrawableSkinId(drawableId, skinId);
	redraw();

	const drawOriginal = renderer.draw;
	renderer.draw = function() {
		if(this.dirty) redraw();
		drawOriginal.call(this);
	}
	function redraw() {
		skin.setContent(canvas);
		runtime.requestRedraw();
	}




	const allConsts = [];
	const glEnumName = {};
	Object.entries(Object.getOwnPropertyDescriptors(gl.__proto__))
	.filter(([, desc]) => desc.hasOwnProperty("value") && typeof desc.value !== "function")
	.forEach(([key]) => {
		if(typeof gl[key] == "number") {
			allConsts.push({text: "gl."+key, value: ""+gl[key]});
			let old = glEnumName[gl[key]];
			if (old) {
				old += " ";
			} else {
				old = "";
			}
			glEnumName[gl[key]] = old+key;
		}
	});


	class ObjectStorage {
		constructor() {
			this.id2ob = new Map(); // id -> [object, type, extra]
			this.ob2id = new Map(); // object -> id
			this.id = 1;
			onContextRecreatedCbs.push(this.clear.bind(this));
		}
		getTyped(id, type) {
			const res = this.id2ob.get(num(id));
			if (!res || res[1] !== type) return null;
			return res[0];
		}
		getTypedWithExtra(id, type) {
			const res = this.id2ob.get(num(id));
			if (!res || res[1] !== type) return [null, null];
			return [res[0], res[2]];
		}
		get(id) {
			const res = this.id2ob.get(num(id));
			if (res) return res[0];
			return null;
		}
		getIdByObject(object) {
			return this.ob2id.get(object);
		}
		add(object, type, extra) {
			if (!object) return null;
			this.id2ob.set(this.id, [object, type, extra]);
			this.ob2id.set(object, this.id);
			return this.id++;
		}
		deleteById(id) {
			id = num(id);
			const object = this.id2ob.get(id)[0];
			this.id2ob.delete(id);
			this.ob2id.delete(object);
		}
		deleteByObject(object) {
			const id = this.ob2id.get(object);
			this.id2ob.delete(id);
			this.ob2id.delete(object);
		}
		clear() {
			this.id2ob.forEach((item) => {
				const o = item[0];
				const t = item[1];
				if (t == "WebGLBuffer")            gl.deleteBuffer(o);
				if (t == "WebGLFramebuffer")       gl.deleteFramebuffer(o);
				if (t == "WebGLProgram")           gl.deleteProgram(o);
				if (t == "WebGLQuery")             gl.deleteQuery(o);
				if (t == "WebGLRenderbuffer")      gl.deleteRenderbuffer(o);
				if (t == "WebGLSampler")           gl.deleteSampler(o);
				if (t == "WebGLShader")            gl.deleteShader(o);
				if (t == "WebGLSync")              gl.deleteSync(o);
				if (t == "WebGLTexture")           gl.deleteTexture(o);
				if (t == "WebGLTransformFeedback") gl.deleteTransformFeedback(o);
				if (t == "WebGLVertexArray")       gl.deleteVertexArray(o);
			});
			this.id2ob.clear();
			this.ob2id.clear();
			this.id = 1;
		}
	}

	let objectStorage = window.objectStorage = new ObjectStorage();

	function sanitizeOutput(value) {
		const type = typeof value;
		if (type == "number" || type == "boolean" || type  == "string") return value;
		if (Array.isArray(value) || ArrayBuffer.isView(value)) {
			OUTPUT_LIST = value;
			return "[list]";
		}
		const id = objectStorage.getIdByObject(value);
		if (id) return id;
		for(let type of WebGLTypes) {
			if (value instanceof type) {
				const extra = {};
				if (type.name == "WebGLProgram") extra.uniforms = {};
				return objectStorage.add(value, type.name, extra);
			}
		}
		return "";
	}

	// TODO: use
	function getCostume(COSTUME, target) {
		const costume = COSTUME === "current" ? target.getCurrentCostume() : target.getCostumes()[target.getCostumeIndexByName(str(COSTUME))];
		if (!costume) return;
		const skin = renderer._allSkins[costume.skinId];
		if (!skin._textureSize) return; // Not bitmap
		const texture = skin.getTexture();
		const width = skin._textureSize[0];
		const height = skin._textureSize[1];
		const rgl = renderer.gl;
		const fb = rgl.createFramebuffer();
		rgl.bindFramebuffer(rgl.FRAMEBUFFER, fb);
		rgl.framebufferTexture2D(rgl.FRAMEBUFFER, rgl.COLOR_ATTACHMENT0, rgl.TEXTURE_2D, texture, 0);
		if (rgl.checkFramebufferStatus(rgl.FRAMEBUFFER) !== rgl.FRAMEBUFFER_COMPLETE) return;
		const pixels = new Uint8Array(width * height * 4);
		rgl.readPixels(0, 0, width, height, rgl.RGBA, rgl.UNSIGNED_BYTE, pixels);
		rgl.bindFramebuffer(rgl.FRAMEBUFFER, null);
		rgl.deleteFramebuffer(fb);
		return {pixels, width, height};
	}
	function copyArrayInto(src, dest, start, length) {
		if (start > dest.length) {
			const oldLength = dest.length;
			dest[start-1] = 0;
			dest.fill(0, oldLength, start);
		}
		for(let i=0, j=start; i<length; i++, j++) {
			dest[j] = src[i];
		}
	}


	let definitions = [
		{
			opcode: "recreateContext",
			blockType: BlockType.COMMAND,
			text: "recreate context with [PARAMS]",
			arguments: {
				PARAMS: {
					type: ArgumentType.STRING,
					defaultValue: '{"preserveDrawingBuffer":true}'
				},
			},
			def: function({PARAMS}) {
				try {
					recreateContext(JSON.parse(PARAMS));
				} finally {};
			}
		},
		{
			opcode: "resizeCanvas",
			blockType: BlockType.COMMAND,
			text: "resize canvas to width [WIDTH] height [HEIGHT]",
			arguments: {
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 480
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 360
				},
			},
			def: function({WIDTH, HEIGHT}) {
				canvas.width = Cast.toNumber(WIDTH);
				canvas.height = Cast.toNumber(HEIGHT);
			}
		},
		{
			opcode: "getConst",
			blockType: BlockType.REPORTER,
			text: "[CONSTANT]",
			disableMonitor: true,
			arguments: {
				CONSTANT: {
					type: ArgumentType.NUMBER,
					menu: "allConsts"
				},
			},
			def: function({CONSTANT}) {
				return CONSTANT;
			}
		},
		{
			opcode: "getName",
			blockType: BlockType.REPORTER,
			text: "name of [CONSTANT]",
			arguments: {
				CONSTANT: {
					type: ArgumentType.NUMBER
				},
			},
			def: function({CONSTANT}) {
				return glEnumName[str(CONSTANT)] || "";
			}
		},
		{
			opcode: "outputToList",
			blockType: BlockType.COMMAND,
			text: "output [VALUE] to list [OUTPUT]",
			arguments: {
				VALUE: {
					type: ArgumentType.EMPTY
				},
				OUTPUT: {
					type: ArgumentType.EMPTY,
					menu: "lists",
					defaultValue: ""
				},
			},
			def: function({VALUE, OUTPUT}) {
				if (VALUE !== "[list]") return;
				const list = target.lookupVariableByNameAndType(OUTPUT, "list");
				if(!list) return;
				list.value = Array.from(OUTPUT_LIST);
			}
		},
		"---",
		{
			glfn: "activeTexture",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TEXTURE: {
					type: ArgumentType.NUMBER,
					menu: "textureUnits"
				},
			},
		},
		{
			glfn: "attachShader",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram,
				},
				SHADER: {
					type: ArgumentType.WebGLShader,
				},
			},
		},
		{
			glfn: "beginQuery",
			category: Category.QUERIES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "queryTarget",
					defaultValue: gl.ANY_SAMPLES_PASSED
				},
				QUERY: {
					type: ArgumentType.WebGLQuery
				},
			},
		},
		{
			glfn: "beginTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.COMMAND,
			arguments: {
				PRIMITIVES: {
					type: ArgumentType.NUMBER,
					menu: "primitiveTypeMain",
					defaultValue: gl.POINTS
				}
			},
		},
		{
			glfn: "bindAttribLocation",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
				NAME: {
					type: ArgumentType.STRING
				}
			},
		},
		{
			glfn: "bindBufferBase",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bindBufferTarget",
					defaultValue: gl.TRANSFORM_FEEDBACK_BUFFER
				},
				INDEX: {
					type: ArgumentType.NUMBER,
					defaultValue: 0
				},
				BUFFER: {
					type: ArgumentType.WebGLBuffer
				}
			},
		},
		{
			glfn: "bindBufferRange",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bindBufferTarget",
					defaultValue: gl.TRANSFORM_FEEDBACK_BUFFER
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
				BUFFER: {
					type: ArgumentType.WebGLBuffer
				},
				OFFSET: {
					type: ArgumentType.NUMBER
				},
				SIZE: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "bindRenderbuffer",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferTarget",
					defaultValue: gl.RENDERBUFFER
				},
				RENDERBUFFER: {
					type: ArgumentType.WebGLRenderbuffer
				}
			},
		},
		{
			glfn: "bindSampler",
			category: Category.SAMPLERS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIT: {
					type: ArgumentType.NUMBER
				},
				SAMPLER: {
					type: ArgumentType.WebGLSampler
				}
			},
		},
		{
			glfn: "bindTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "transformFeedbackTarget",
					defaultValue: gl.TRANSFORM_FEEDBACK
				},
				TRANSFORMFEEDBACK: {
					type: ArgumentType.WebGLTransformFeedback,
				},
			},
		},
		{
			glfn: "bindVertexArray",
			category: Category.VAO,
			blockType: BlockType.COMMAND,
			arguments: {
				VAO: {
					type: ArgumentType.WebGLVertexArrayObject,
				},
			},
		},
		{
			glfn: "blendColor",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				RED: {
					type: ArgumentType.NUMBER,
				},
				GREEN: {
					type: ArgumentType.NUMBER,
				},
				BLUE: {
					type: ArgumentType.NUMBER,
				},
				ALPHA: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "blendEquation",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				MODE: {
					type: ArgumentType.NUMBER,
					menu: "blendEquation",
					defaultValue: gl.FUNC_ADD
				},
			},
		},
		{
			glfn: "blendEquationSeparate",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				MODERGB: {
					type: ArgumentType.NUMBER,
					menu: "blendEquation",
					defaultValue: gl.FUNC_ADD
				},
				MODEA: {
					type: ArgumentType.NUMBER,
					menu: "blendEquation",
					defaultValue: gl.FUNC_ADD
				},
			},
		},
		{
			glfn: "blendFunc",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				SRC: {
					type: ArgumentType.NUMBER,
					menu: "blendFunc",
					defaultValue: gl.SRC_ALPHA
				},
				DST: {
					type: ArgumentType.NUMBER,
					menu: "blendFunc",
					defaultValue: gl.ONE_MINUS_SRC_ALPHA
				}
			},
		},
		{
			glfn: "blendFuncSeparate",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				SRCRGB: {
					type: ArgumentType.NUMBER,
					menu: "blendFunc",
					defaultValue: gl.SRC_ALPHA
				},
				DSTRGB: {
					type: ArgumentType.NUMBER,
					menu: "blendFunc",
					defaultValue: gl.ONE_MINUS_SRC_ALPHA
				},
				SRCA: {
					type: ArgumentType.NUMBER,
					menu: "blendFunc",
					defaultValue: gl.SRC_ALPHA
				},
				DSTA: {
					type: ArgumentType.NUMBER,
					menu: "blendFunc",
					defaultValue: gl.ONE_MINUS_SRC_ALPHA
				}
			},
		},
		{
			glfn: "blitFramebuffer",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				SRCX1: {
					type: ArgumentType.NUMBER,
				},
				SRCY1: {
					type: ArgumentType.NUMBER,
				},
				SRCX2: {
					type: ArgumentType.NUMBER,
				},
				SRCY2: {
					type: ArgumentType.NUMBER,
				},
				DSTX1: {
					type: ArgumentType.NUMBER,
				},
				DSTY1: {
					type: ArgumentType.NUMBER,
				},
				DSTX2: {
					type: ArgumentType.NUMBER,
				},
				DSTY2: {
					type: ArgumentType.NUMBER,
				},
				MASK: {
					type: ArgumentType.NUMBER,
					menu: "clearBufferBits"
				},
				FILTER: {
					type: ArgumentType.NUMBER,
					menu: "textureFiltering"
				}
			},
		},
		{
			glfn: "bufferData-1",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				USAGE: {
					type: ArgumentType.NUMBER,
					menu: "bufferUsage"
				},
			},
		},
		{
			glfn: "bufferData-2",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				SIZE: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				USAGE: {
					type: ArgumentType.NUMBER,
					menu: "bufferUsage"
				},
			},
		},
		{
			glfn: "bufferData-3",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				DATA: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeLookup: "TypedArrays"
				},
				USAGE: {
					type: ArgumentType.NUMBER,
					menu: "bufferUsage"
				},
			},
		},
		{
			glfn: "bufferData-4",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				USAGE: {
					type: ArgumentType.NUMBER,
					menu: "bufferUsage"
				},
				SRCOFFSET: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "bufferData-5",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				DATA: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeLookup: "TypedArrays"
				},
				USAGE: {
					type: ArgumentType.NUMBER,
					menu: "bufferUsage"
				},
				SRCOFFSET: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "bufferData-6",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				DATA: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeLookup: "TypedArrays"
				},
				USAGE: {
					type: ArgumentType.NUMBER,
					menu: "bufferUsage"
				},
				SRCOFFSET: {
					type: ArgumentType.NUMBER
				},
				LENGTH: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "bufferSubData-1",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "bufferSubData-2",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeLookup: "TypedArrays"
				},
			},
		},
		{
			glfn: "bufferSubData-3",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				DSTOFFSET: {
					type: ArgumentType.NUMBER,
				},
				SRCOFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "bufferSubData-4",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				DSTOFFSET: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeLookup: "TypedArrays"
				},
				SRCOFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "bufferSubData-5",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				DSTOFFSET: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeLookup: "TypedArrays"
				},
				SRCOFFSET: {
					type: ArgumentType.NUMBER,
				},
				LENGTH: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "checkFramebufferStatus",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
					defaultValue: gl.FRAMEBUFFER
				}
			},
		},
		{
			glfn: "clientWaitSync",
			category: Category.SYNC,
			blockType: BlockType.REPORTER,
			arguments: {
				SYNC: {
					type: ArgumentType.WebGLSync
				},
				FLAGS: {
					type: ArgumentType.NUMBER
				},
				TIMEOUT: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "compileShader",
			category: Category.SHADERS,
			blockType: BlockType.COMMAND,
			arguments: {
				SHADER: {
					type: ArgumentType.WebGLShader
				},
			},
		},
/*compressedTexImage2D
compressedTexImage3D
compressedTexSubImage2D
compressedTexSubImage3D*/
		{
			glfn: "copyBufferSubData",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				RTARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferReadWriteTarget",
					defaultValue: gl.ARRAY_BUFFER
				},
				WTARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferReadWriteTarget",
					defaultValue: gl.ELEMENT_ARRAY_BUFFER
				},
				ROFFSET: {
					type: ArgumentType.NUMBER
				},
				WOFFSET: {
					type: ArgumentType.NUMBER
				},
				SIZE: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "copyTexImage2D",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2",
					defaultValue: gl.TEXTURE_2D
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat2",
					defaulValue: gl.RGBA
				},
				X: {
					type: ArgumentType.NUMBER
				},
				Y: {
					type: ArgumentType.NUMBER
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
				BORDER: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "copyTexSubImage2D",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2",
					defaultValue: gl.TEXTURE_2D
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat2",
					defaulValue: gl.RGBA
				},
				XOFFSET: {
					type: ArgumentType.NUMBER
				},
				YOFFSET: {
					type: ArgumentType.NUMBER
				},
				X: {
					type: ArgumentType.NUMBER
				},
				Y: {
					type: ArgumentType.NUMBER
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
			},
		},
		{
			glfn: "copyTexSubImage3D",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget3",
					defaultValue: gl.TEXTURE_3D
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat2",
					defaulValue: gl.RGBA
				},
				XOFFSET: {
					type: ArgumentType.NUMBER
				},
				YOFFSET: {
					type: ArgumentType.NUMBER
				},
				ZOFFSET: {
					type: ArgumentType.NUMBER
				},
				X: {
					type: ArgumentType.NUMBER
				},
				Y: {
					type: ArgumentType.NUMBER
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
			},
		},
		{
			glfn: "createBuffer",
			category: Category.BUFFERS,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createFramebuffer",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createProgram",
			category: Category.PROGRAMS,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createQuery",
			category: Category.QUERIES,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createRenderbuffer",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createSampler",
			category: Category.SAMPLERS,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createShader",
			category: Category.SHADERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "shaderType"
				},
			},
		},
		{
			glfn: "createTexture",
			category: Category.TEXTURES,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "createVertexArray",
			category: Category.VAO,
			blockType: BlockType.REPORTER,
		},
		{
			glfn: "cullFace",
			blockType: BlockType.COMMAND,
			arguments: {
				FACE: {
					type: ArgumentType.NUMBER,
					menu: "faces",
					defaultValue: gl.BACK
				},
			},
		},
		{
			glfn: "deleteBuffer",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLBuffer
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteFramebuffer",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLFramebuffer
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteProgram",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLProgram
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteQuery",
			category: Category.QUERIES,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLQuery
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteRenderbuffer",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLRenderbuffer
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteSampler",
			category: Category.SAMPLERS,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLSampler
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteShader",
			category: Category.SHADERS,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLShader
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteSync",
			category: Category.SYNC,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLSync
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteTexture",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLTexture
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLTransformFeedback
				},
			},
			deletes: true,
		},
		{
			glfn: "deleteVertexArray",
			category: Category.VAO,
			blockType: BlockType.COMMAND,
			arguments: {
				THINGTODELETE: {
					type: ArgumentType.WebGLVertexArrayObject
				},
			},
			deletes: true,
		},
		{
			glfn: "depthFunc",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				FUNC: {
					type: ArgumentType.NUMBER,
					menu: "compareFunc"
				},
			},
		},
		{
			glfn: "depthMask",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				FLAG: {
					type: ArgumentType.BOOLEAN
				},
			},
		},
		{
			glfn: "depthRange",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				ZNEAR: {
					type: ArgumentType.NUMBER,
				},
				ZFAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
			},
		},
		{
			glfn: "detachShader",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram,
				},
				SHADER: {
					type: ArgumentType.WebGLShader,
				},
			},
		},
		{
			glfn: "disable",
			blockType: BlockType.COMMAND,
			arguments: {
				CAPABILITY: {
					type: ArgumentType.NUMBER,
					menu: "capability"
				},
			},
		},
		{
			glfn: "drawArraysInstanced",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				PRIMITIVE: {
					type: ArgumentType.NUMBER,
					menu: "primitiveType",
					defaultValue: gl.TRIANGLES
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
				COUNT: {
					type: ArgumentType.NUMBER,
				},
				INSTANCES: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
			},
		},
		{
			glfn: "drawElementsInstanced",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				PRIMITIVE: {
					type: ArgumentType.NUMBER,
					menu: "primitiveType",
					defaultValue: gl.TRIANGLES
				},
				COUNT: {
					type: ArgumentType.NUMBER,
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "unsignedInts",
					defaultValue: gl.UNSIGNED_SHORT
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
				INSTANCES: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
			},
		},
		{
			glfn: "drawRangeElements",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				PRIMITIVE: {
					type: ArgumentType.NUMBER,
					menu: "primitiveType",
					defaultValue: gl.TRIANGLES
				},
				START: {
					type: ArgumentType.NUMBER,
				},
				END: {
					type: ArgumentType.NUMBER,
				},
				COUNT: {
					type: ArgumentType.NUMBER,
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "unsignedInts",
					defaultValue: gl.UNSIGNED_SHORT
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "enable",
			blockType: BlockType.COMMAND,
			arguments: {
				CAPABILITY: {
					type: ArgumentType.NUMBER,
					menu: "capability"
				},
			},
		},
		{
			glfn: "endQuery",
			category: Category.QUERIES,
			blockType: BlockType.COMMAND,
			arguments: {
				QUERY: {
					type: ArgumentType.WebGLQuery
				},
			},
		},
		{
			glfn: "endTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.COMMAND,
		},
		{
			glfn: "fenceSync",
			category: Category.SYNC,
			blockType: BlockType.REPORTER,
			arguments: {
				CONDITION: {
					type: ArgumentType.NUMBER,
					menu: "syncCondition",
					defaultValue: gl.SYNC_GPU_COMMANDS_COMPLETE
				},
				FLAGS: {
					type: ArgumentType.NUMBER,
				}
			},
		},
		{
			glfn: "finish",
			blockType: BlockType.COMMAND,
		},
		{
			glfn: "flush",
			blockType: BlockType.COMMAND,
		},
		{
			glfn: "framebufferRenderbuffer",
			blockType: BlockType.COMMAND,
			category: Category.FRAMEBUFFERS,
			arguments: {
				FBTARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
					defaultValue: gl.FRAMEBUFFER
				},
				ATTACHMENT: {
					type: ArgumentType.NUMBER,
					menu: "attachment",
					defaultValue: gl.COLOR_ATTACHMENT0
				},
				RBTARGET: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferTarget",
					defaultValue: gl.RENDERBUFFER
				},
				RENDERBUFFER: {
					type: ArgumentType.WebGLRenderbuffer
				}
			},
		},
		{
			glfn: "framebufferTexture2D",
			blockType: BlockType.COMMAND,
			category: Category.FRAMEBUFFERS,
			arguments: {
				FBTARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
					defaultValue: gl.FRAMEBUFFER
				},
				ATTACHMENT: {
					type: ArgumentType.NUMBER,
					menu: "attachment",
					defaultValue: gl.COLOR_ATTACHMENT0
				},
				TEXTARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2",
					defaultValue: gl.TEXTURE2D
				},
				TEXTURE: {
					type: ArgumentType.WebGLTexture
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "framebufferTextureLayer",
			blockType: BlockType.COMMAND,
			category: Category.FRAMEBUFFERS,
			arguments: {
				FBTARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
					defaultValue: gl.FRAMEBUFFER
				},
				ATTACHMENT: {
					type: ArgumentType.NUMBER,
					menu: "attachment",
					defaultValue: gl.COLOR_ATTACHMENT0
				},
				TEXTURE: {
					type: ArgumentType.WebGLTexture
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				LAYER: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "frontFace",
			blockType: BlockType.COMMAND,
			arguments: {
				MODE: {
					type: ArgumentType.NUMBER,
					menu: "frontFace",
					defaultValue: gl.CCW
				},
			},
		},
		{
			glfn: "generateMipmap",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget",
					defaultValue: gl.TEXTURE_2D
				},
			},
		},
		{
			glfn: "getActiveAttrib",
			category: Category.PROGRAMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
				PROP: {
					type: ArgumentType.PROPERTY,
					menu: "activeInfo",
					defaultValue: "name"
				},
			},
		},
		{
			glfn: "getActiveUniform",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
				PROP: {
					type: ArgumentType.PROPERTY,
					menu: "activeInfo",
					defaultValue: "name"
				},
			},
		},
		{
			glfn: "getActiveUniformBlockName",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "getActiveUniformBlockParameter",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "uniformBlockParam",
					defaultValue: gl.UNIFORM_BLOCK_BINDING
				},
			},
		},
		{
			glfn: "getActiveUniforms",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDICIES: {
					type: ArgumentType.LIST,
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "activeUniformsPname",
					defaultValue: gl.UNIFORM_TYPE
				},
			},
		},
		{
			glfn: "getAttachedShaders",
			category: Category.PROGRAMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
			},
			mapObjectsToIds: true,
		},
		{
			glfn: "getAttribLocation",
			category: Category.ATTRIBUTES,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "a_position"
				},
			},
		},
		{
			glfn: "getBufferParameter",
			category: Category.BUFFERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget",
					defaultValue: gl.ARRAY_BUFFER
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "bufferParam",
					defaultValue: gl.BUFFER_SIZE
				},
			},
		},
		{
			opcode: "getBufferSubData",
			blockType: BlockType.COMMAND,
			category: Category.BUFFERS,
			text: "gl.getBufferSubData [TARGET] [SRCBYTEOFFSET] [ARRAYTYPE] [DSTDATA] [DSTOFFSET] [LENGTH]",
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget",
				},
				SRCBYTEOFFSET: {
					type: ArgumentType.NUMBER,
				},
				ARRAYTYPE: {
					type: ArgumentType.STRING,
					menu: "typedArrays",
					defaultValue: "Float32Array"
				},
				DSTDATA: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				DSTOFFSET: {
					type: ArgumentType.NUMBER,
				},
				LENGTH: {
					type: ArgumentType.NUMBER,
				},
			},
			def: function({TARGET, SRCBYTEOFFSET, ARRAYTYPE, DSTDATA, DSTOFFSET, LENGTH}, {target}) {
				DSTDATA = target.lookupVariableByNameAndType(DSTDATA, "list");
				if (!DSTDATA) return;
				const dest = DSTDATA.value;
				const src = new (TypedArrays[ARRAYTYPE])(LENGTH);
				gl.getBufferSubData(num(TARGET), num(SRCBYTEOFFSET), src);
				copyArrayInto(src, dest, num(DSTOFFSET), num(LENGTH));
				DSTDATA._monitorUpToDate = false;
			},
		},
		{
			glfn: "getContextAttributes",
			blockType: BlockType.REPORTER,
			arguments: {
				PARAM: {
					type: ArgumentType.PROPERTY,
					menu: "contextAttributes",
				},
			},
		},
		{
			glfn: "getError",
			blockType: BlockType.REPORTER,
		},
/*
!!!!!getExtension*/
		{
			glfn: "getFragDataLocation",
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				NAME: {
					type: ArgumentType.STRING
				},
			},
		},
		{
			glfn: "getFramebufferAttachmentParameter",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
					defaultValue: gl.FRAMEBUFFER
				},
				ATTACHMENT: {
					type: ArgumentType.NUMBER,
					menu: "attachment",
					defaultValue: gl.COLOR_ATTACHMENT0
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "framebufferAttachmentParam",
					defaultValue: gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE
				},
			},
		},
		{
			glfn: "getIndexedParameter",
			category: Category.BUFFERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "indexedTarget",
				},
				INDEX: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "getInternalformatParameter",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferTarget",
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormatRenderable"
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "internalFormatParam"
				},
			},
		},
		{
			glfn: "getParameter",
			blockType: BlockType.REPORTER,
			arguments: {
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "parameter",
					defaultValue: gl.ACTIVE_TEXTURE
				},
			},
		},
		{
			glfn: "getProgramInfoLog",
			category: Category.PROGRAMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
			},
		},
		{
			glfn: "getProgramParameter",
			category: Category.PROGRAMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				PARAM: {
					type: ArgumentType.NUMBER,
					menu: "programParameter"
				},
			},
		},
		{
			glfn: "getQuery",
			category: Category.QUERIES,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "queryTarget",
					defaultValue: gl.ANY_SAMPLES_PASSED
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "queryPname1",
					defaultValue: gl.CURRENT_QUERY
				},
			},
		},
		{
			glfn: "getQueryParameter",
			category: Category.QUERIES,
			blockType: BlockType.REPORTER,
			arguments: {
				QUERY: {
					type: ArgumentType.WebGLQuery,
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "queryPname2",
					defaultValue: gl.QUERY_RESULT
				},
			},
		},
		{
			glfn: "getRenderbufferParameter",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferTarget",
					defaultValue: gl.RENDERBUFFER
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferParam",
					defaultValue: gl.RENDERBUFFER_WIDTH
				},
			},
		},
		{
			glfn: "getSamplerParameter",
			category: Category.SAMPLERS,
			blockType: BlockType.REPORTER,
			arguments: {
				SAMPLER: {
					type: ArgumentType.WebGLSampler
				},
				PARAM: {
					type: ArgumentType.NUMBER,
					menu: "samplerParam",
					defaultValue: gl.TEXTURE_COMPARE_FUNC
				},
			},
		},
		{
			glfn: "getShaderInfoLog",
			category: Category.SHADERS,
			blockType: BlockType.REPORTER,
			arguments: {
				SHADER: {
					type: ArgumentType.WebGLShader
				},
			},
		},
		{
			glfn: "getShaderParameter",
			category: Category.SHADERS,
			blockType: BlockType.REPORTER,
			arguments: {
				SHADER: {
					type: ArgumentType.WebGLShader
				},
				PARAM: {
					type: ArgumentType.NUMBER,
					menu: "shaderParameter"
				},
			},
		},
		{
			glfn: "getShaderPrecisionFormat",
			category: Category.SHADERS,
			blockType: BlockType.REPORTER,
			arguments: {
				SHADERTYPE: {
					type: ArgumentType.NUMBER,
					menu: "shaderType"
				},
				PRECTYPE: {
					type: ArgumentType.NUMBER,
					menu: "shaderPrecisionType"
				},
				COMPONENT: {
					type: ArgumentType.PROPERTY,
					menu: "shaderPrecisionComponent"
				},
			},
		},
		{
			glfn: "getShaderSource",
			category: Category.SHADERS,
			blockType: BlockType.REPORTER,
			arguments: {
				SHADER: {
					type: ArgumentType.WebGLShader
				},
			},
		},
/*!!!!!getSupportedExtensions*/
		{
			glfn: "getSyncParameter",
			category: Category.SYNC,
			blockType: BlockType.REPORTER,
			arguments: {
				SYNC: {
					type: ArgumentType.WebGLSync
				},
				PARAM: {
					type: ArgumentType.NUMBER,
					menu: "syncParameter",
					defaultValue: gl.SYNC_STATUS
				},
			},
		},
		{
			glfn: "getTexParameter",
			category: Category.TEXTURES,
			blockType: BlockType.REPORTER,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget",
					defaultValue: gl.TEXTURE_2D
				},
				PARAM: {
					type: ArgumentType.NUMBER,
					menu: "textureParameter",
					defaultValue: gl.TEXTURE_MAG_FILTER
				},
			},
		},
		{
			glfn: "getTransformFeedbackVarying",
			category: Category.PROGRAMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				PROP: {
					type: ArgumentType.PROPERTY,
					menu: "activeInfo",
					defaultValue: "name"
				}
			},
		},
		{
			glfn: "getUniform",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				}
			},
		},
		{
			glfn: "getUniformBlockIndex",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				UNIFORMNAME: {
					type: ArgumentType.STRING,
				}
			},
		},
		{
			glfn: "getUniformIndices",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				UNIFORMNAMES: {
					type: ArgumentType.LIST,
				}
			},
		},
		{
			opcode: "getUniformLocation",
			category: Category.UNIFORMS,
			blockType: BlockType.REPORTER,
			text: "gl.getUniformLocation [PROGRAM] [NAME]",
			arguments: {
				PROGRAM: {
					type: ArgumentType.EMPTY
				},
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "u_resolution"
				},
			},
			def: function({PROGRAM, NAME}) {
				let extra;
				[PROGRAM, extra] = objectStorage.getTypedWithExtra(num(PROGRAM), "WebGLProgram");
				let res = sanitizeOutput(gl.getUniformLocation(PROGRAM, str(NAME)));
				if (res) extra.uniforms[str(NAME)] = res;
				return res;
			}
		},
		{
			glfn: "getVertexAttrib",
			blockType: BlockType.REPORTER,
			category: Category.ATTRIBUTES,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "vertexParam",
				},
			},
		},
		{
			glfn: "getVertexAttribOffset",
			blockType: BlockType.REPORTER,
			category: Category.ATTRIBUTES,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "vertexParamOffset",
				},
			},
		},
		{
			glfn: "hint",
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "hintTarget",
					defaultValue: gl.FRAGMENT_SHADER_DERIVATIVE_HINT
				},
				MODE: {
					type: ArgumentType.NUMBER,
					menu: "hintMode",
					defaultValue: gl.DONT_CARE
				},
			},
		},
		{
			glfn: "invalidateFramebuffer",
			blockType: BlockType.COMMAND,
			category: Category.FRAMEBUFFERS,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
				},
				ATTACHMENTS: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "invalidateSubFramebuffer",
			blockType: BlockType.COMMAND,
			category: Category.FRAMEBUFFERS,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget",
				},
				ATTACHMENTS: {
					type: ArgumentType.LIST,
				},
				X: {
					type: ArgumentType.NUMBER
				},
				Y: {
					type: ArgumentType.NUMBER
				},
				WIDTH: {
					type: ArgumentType.NUMBER
				},
				HEIGHT: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "isBuffer",
			blockType: BlockType.BOOLEAN,
			category: Category.BUFFERS,
			arguments: {
				BUFFER: {
					type: ArgumentType.WebGLBuffer,
				},
			},
		},
		{
			glfn: "isContextLost",
			blockType: BlockType.BOOLEAN,
		},
		{
			glfn: "isEnabled",
			blockType: BlockType.BOOLEAN,
			arguments: {
				CAPABILITY: {
					type: ArgumentType.NUMBER,
					menu: "capability"
				},
			},
		},
		{
			glfn: "isFramebuffer",
			blockType: BlockType.BOOLEAN,
			category: Category.FRAMEBUFFERS,
			arguments: {
				FRAMEBUFFER: {
					type: ArgumentType.WebGLFramebuffer,
				},
			},
		},
		{
			glfn: "isProgram",
			blockType: BlockType.BOOLEAN,
			category: Category.PROGRAMS,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram,
				},
			},
		},
		{
			glfn: "isQuery",
			blockType: BlockType.BOOLEAN,
			category: Category.QUERIES,
			arguments: {
				QUERY: {
					type: ArgumentType.WebGLQuery,
				},
			},
		},
		{
			glfn: "isRenderbuffer",
			blockType: BlockType.BOOLEAN,
			category: Category.RENDERBUFFERS,
			arguments: {
				RENDERBUFFER: {
					type: ArgumentType.WebGLRenderbuffer,
				},
			},
		},
		{
			glfn: "isSampler",
			blockType: BlockType.BOOLEAN,
			category: Category.SAMPLERS,
			arguments: {
				SAMPLER: {
					type: ArgumentType.WebGLSampler,
				},
			},
		},
		{
			glfn: "isShader",
			blockType: BlockType.BOOLEAN,
			category: Category.SHADERS,
			arguments: {
				SHADER: {
					type: ArgumentType.WebGLShader,
				},
			},
		},
		{
			glfn: "isSync",
			blockType: BlockType.BOOLEAN,
			category: Category.SYNC,
			arguments: {
				SYNCS: {
					type: ArgumentType.WebGLSync,
				},
			},
		},
		{
			glfn: "isTexture",
			blockType: BlockType.BOOLEAN,
			category: Category.TEXTURES,
			arguments: {
				TEXTURES: {
					type: ArgumentType.WebGLTexture,
				},
			},
		},
		{
			glfn: "isTransformFeedback",
			blockType: BlockType.BOOLEAN,
			category: Category.TRANSFORMFEEDBACK,
			arguments: {
				TRANSFORMFEEDBACK: {
					type: ArgumentType.WebGLTransformFeedback,
				},
			},
		},
		{
			glfn: "isVertexArray",
			blockType: BlockType.BOOLEAN,
			category: Category.VAO,
			arguments: {
				VERTEXARRAY: {
					type: ArgumentType.WebGLVertexArrayObject,
				},
			},
		},
		{
			glfn: "lineWidth",
			blockType: BlockType.COMMAND,
			arguments: {
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
			},
		},
		{
			glfn: "linkProgram",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
			},
		},
		{
			glfn: "pauseTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.COMMAND,
		},
		{
			glfn: "pixelStorei",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "pixelstorei",
					defaultVlaue: gl.PACK_ALIGNMENT
				},
				PARAM: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "polygonOffset",
			blockType: BlockType.COMMAND,
			arguments: {
				FACTOR: {
					type: ArgumentType.NUMBER
				},
				UNITS: {
					type: ArgumentType.NUMBER
				},
			},
		},
		{
			glfn: "readBuffer",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "readBuffer",
					defaultValue: gl.BACK
				}
			},
		},
		{
			opcode: "readPixels-1",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.COMMAND,
			text: "gl.readPixels [X] [Y] [WIDTH] [HEIGHT] [FORMAT] [TYPE] [PIXELS] [DSTOFFSET]",
			arguments: {
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
				},
				FORMAT: {
					type: ArgumentType.NUMBER,
					menu: "format2"
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "textureDataType"
				},
				PIXELS: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				DSTOFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
			def: function({X, Y, WIDTH, HEIGHT, FORMAT, TYPE, PIXELS, DSTOFFSET}, {target}) {
				PIXELS = target.lookupVariableByNameAndType(PIXELS, "list");
				if (!PIXELS) return;
				const dest = PIXELS.value;
				const length = WIDTH * HEIGHT * GlFormatChannels[FORMAT] / GlTypeFitsChannels[TYPE];
				const src = new (GlTypeToTypedArray[TYPE])(length);
				gl.getReadPixels(num(X), num(Y), num(WIDTH), num(HEIGHT), num(FORMAT), num(TYPE), src, num(DSTOFFSET));
				copyArrayInto(src, dest, num(DSTOFFSET), length);
				PIXELS._monitorUpToDate = false;
			},
		},
		{
			glfn: "renderbufferStorage",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferTarget",
					defaultValue: gl.RENDERBUFFER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat",
					defaultValue: gl.RGBA
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				}
			},
		},
		{
			glfn: "renderbufferStorageMultisample",
			category: Category.RENDERBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "renderbufferTarget",
					defaultValue: gl.RENDERBUFFER
				},
				SAMPLES: {
					type: ArgumentType.NUMBER,
					defaultValue: gl.getParameter(gl.MAX_SAMPLES)
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat",
					defaultValue: gl.RGBA
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				}
			},
		},
		{
			glfn: "resumeTransformFeedback",
			category: Category.TRANSFORMFEEDBACK,
			blockType: BlockType.COMMAND,
		},
		{
			glfn: "sampleCoverage",
			blockType: BlockType.COMMAND,
			arguments: {
				VALUE: {
					type: ArgumentType.NUMBER
				},
				INVERT: {
					type: ArgumentType.BOOLEAN
				},
			},
		},
		{
			glfn: "samplerParameterf",
			category: Category.SAMPLERS,
			blockType: BlockType.COMMAND,
			arguments: {
				SAMPLER: {
					type: ArgumentType.WebGLSampler
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "samplerParameterf",
					defaultValue: gl.TEXTURE_MAX_LOD
				},
				PARAM: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "samplerParameteri",
			category: Category.SAMPLERS,
			blockType: BlockType.COMMAND,
			arguments: {
				SAMPLER: {
					type: ArgumentType.WebGLSampler
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "samplerParameteri",
					defaultValue: gl.TEXTURE_COMPARE_FUNC
				},
				PARAM: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "shaderSource",
			category: Category.SHADERS,
			blockType: BlockType.COMMAND,
			arguments: {
				SHADER: {
					type: ArgumentType.WebGLShader
				},
				SOURCE: {
					type: ArgumentType.LIST,
					join: "\n"
				},
			},
		},
		{
			glfn: "stencilFunc",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				FUNC: {
					type: ArgumentType.NUMBER,
					menu: "compareFunc"
				},
				REF: {
					type: ArgumentType.NUMBER,
				},
				FLAG: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				}
			},
		},
		{
			glfn: "stencilFuncSeparate",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				FACE: {
					type: ArgumentType.NUMBER,
					menu: "faces"
				},
				FUNC: {
					type: ArgumentType.NUMBER,
					menu: "compareFunc"
				},
				REF: {
					type: ArgumentType.NUMBER,
				},
				FLAG: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				}
			},
		},
		{
			glfn: "stencilMask",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				MASK: {
					type: ArgumentType.NUMBER,
					defaultvalue: "0b11111111"
				},
			},
		},
		{
			glfn: "stencilMaskSeparate",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				FACE: {
					type: ArgumentType.NUMBER,
					menu: "faces"
				},
				MASK: {
					type: ArgumentType.NUMBER,
					defaultvalue: "0b11111111"
				},
			},
		},
		{
			glfn: "stencilOp",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				SFAIL: {
					type: ArgumentType.NUMBER,
					menu: "stencilOp",
					defaultValue: gl.KEEP
				},
				ZFAIL: {
					type: ArgumentType.NUMBER,
					menu: "stencilOp",
					defaultValue: gl.KEEP
				},
				PASS: {
					type: ArgumentType.NUMBER,
					menu: "stencilOp",
					defaultValue: gl.KEEP
				},
			},
		},
		{
			glfn: "stencilOpSeparate",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				FACE: {
					type: ArgumentType.NUMBER,
					menu: "faces"
				},
				SFAIL: {
					type: ArgumentType.NUMBER,
					menu: "stencilOp",
					defaultValue: gl.KEEP
				},
				ZFAIL: {
					type: ArgumentType.NUMBER,
					menu: "stencilOp",
					defaultValue: gl.KEEP
				},
				PASS: {
					type: ArgumentType.NUMBER,
					menu: "stencilOp",
					defaultValue: gl.KEEP
				},
			},
		},
		{
			glfn: "texImage2D-1",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2"
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat",
					defaultValue: gl.RGBA
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				BORDER: {
					type: ArgumentType.NUMBER,
				},
				FORMAT: {
					type: ArgumentType.NUMBER,
					menu: "format",
					defaultValue: gl.RGBA
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "textureDataType",
					defaultValue: gl.UNSIGNED_BYTE
				},
			},
		},
		{
			opcode: "texImage2D-2",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			text: "gl.texImage2D [TARGET] [LEVEL] [INTERNALFORMAT] [COSTUME]",
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2"
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat",
					defaultValue: gl.RGBA
				},
				COSTUME: {
					type: ArgumentType.STRING,
					menu: "costumes"
				},
			},
			def: function({TARGET, LEVEL, INTERNALFORMAT, COSTUME}, {target}) {
				const {pixels, width, height} = getCostume(COSTUME, target);
				if (pixels === null) return;
				gl.texImage2D(num(TARGET), num(LEVEL), num(INTERNALFORMAT), width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			}
		},
		{
			glfn: "texImage2D-4",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2"
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat",
					defaultValue: gl.RGBA
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				BORDER: {
					type: ArgumentType.NUMBER,
				},
				FORMAT: {
					type: ArgumentType.NUMBER,
					menu: "format",
					defaultValue: gl.RGBA
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "textureDataType",
					defaultValue: gl.UNSIGNED_BYTE
				},
				PBOOFFSET: {
					type: ArgumentType.NUMBER,
					defaultValue: 0
				},
			},
		},
		{
			glfn: "texImage2D-5",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2"
				},
				LEVEL: {
					type: ArgumentType.NUMBER
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat",
					defaultValue: gl.RGBA
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				BORDER: {
					type: ArgumentType.NUMBER,
				},
				FORMAT: {
					type: ArgumentType.NUMBER,
					menu: "format",
					defaultValue: gl.RGBA
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "textureDataType",
					defaultValue: gl.UNSIGNED_BYTE
				},
				ARRAY: {
					type: ArgumentType.LIST,
					typedArray: true,
					typeSource: "TYPE",
					typeLookup: "GlTypeToTypedArray"
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},

//texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView? pixels);
//texImage2D(target, level, internalformat,                        format, type, TexImageSource source); // May throw DOMException
//texImage2D(target, level, internalformat, width, height, border, format, type, GLintptr pboOffset);
//texImage2D(target, level, internalformat, width, height, border, format, type, TexImageSource source); // May throw DOMException
//texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView srcData, srcOffset);
// VVV
//texImage2D(target, level, internalformat, width, height, border, format, type);
//texImage2D(target, level, internalformat, width, height, border, format, type, TexImageSource source);
//texImage2D(target, level, internalformat,                        format, type, TexImageSource source); // May throw DOMException
//texImage2D(target, level, internalformat, width, height, border, format, type, GLintptr pboOffset);
//texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView srcData, srcOffset);



//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, ArrayBufferView? pixels);
//texSubImage2D(target, level, xoffset, yoffset,                format, type, TexImageSource source); // May throw DOMException
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, GLintptr pboOffset);
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, TexImageSource source); // May throw DOMException
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, ArrayBufferView srcData, srcOffset);
// VVV
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type);
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, TexImageSource source); // May throw DOMException
//texSubImage2D(target, level, xoffset, yoffset,                format, type, TexImageSource source); // May throw DOMException
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, GLintptr pboOffset);
//texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, ArrayBufferView srcData, srcOffset);
/*
texImage2D
texImage3D*/
		{
			glfn: "texParameterf",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "texParamTarget",
					defaultValue: gl.TEXTURE_2D
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "texParamPnameF",
					defaultValue: gl.TEXTURE_MAX_LOD
				},
				PARAM: {
					type: ArgumentType.NUMBER,
					defaultValue: 0
				}
			},
		},
		{
			glfn: "texParameteri",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "texParamTarget",
					defaultValue: gl.TEXTURE_2D
				},
				PNAME: {
					type: ArgumentType.NUMBER,
					menu: "texParamPnameI",
					defaultValue: gl.TEXTURE_MAG_FILTER
				},
				PARAM: {
					type: ArgumentType.NUMBER,
				}
			},
		},
		{
			glfn: "texStorage2D",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget2D",
				},
				LEVELS: {
					type: ArgumentType.NUMBER,
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat3",
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "texStorage3D",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget3D",
				},
				LEVELS: {
					type: ArgumentType.NUMBER,
				},
				INTERNALFORMAT: {
					type: ArgumentType.NUMBER,
					menu: "internalFormat3",
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
				},
			},
		},
/*texSubImage2D
texSubImage3D*/
		{
			glfn: "transformFeedbackVaryings",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				VARYINGS: {
					type: ArgumentType.LIST,
				},
				BUFFERMODE: {
					type: ArgumentType.STRING,
					menu: "bufferMode",
					defaultValue: gl.SEPARATE_ATTRIBS
				}
			},
		},
		{
			glfn: "uniformBlockBinding",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
				INDEX: {
					type: ArgumentType.NUMBER
				},
				BINDING: {
					type: ArgumentType.NUMBER
				}
			},
		},
		{
			glfn: "useProgram",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram
				},
			},
		},
		{
			glfn: "validateProgram",
			category: Category.PROGRAMS,
			blockType: BlockType.COMMAND,
			arguments: {
				PROGRAM: {
					type: ArgumentType.WebGLProgram,
				},
			},
		},
		{
			glfn: "vertexAttribDivisor",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER
				},
				DIVISOR: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				}
			},
		},
		{
			glfn: "vertexAttribIPointer",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				LOCATION: {
					type: ArgumentType.NUMBER,
				},
				SIZE: {
					type: ArgumentType.NUMBER,
					defaultvalue: 2
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "dataTypeInt",
					defaultValue: gl.SHORT
				},
				STRIDE: {
					type: ArgumentType.NUMBER,
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "waitSync",
			category: Category.SYNC,
			blockType: BlockType.REPORTER,
			arguments: {
				SYNC: {
					type: ArgumentType.WebGLSync
				},
				FLAGS: {
					type: ArgumentType.NUMBER
				},
				TIMEOUT: {
					type: ArgumentType.NUMBER,
					defaultValue: -1
				},
			},
		},
		{
			glfn: "bindBuffer",
			category: Category.BUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "bufferTarget"
				},
				BUFFER: {
					type: ArgumentType.WebGLBuffer,
				},
			},
		},
		{
			glfn: "bindFramebuffer",
			category: Category.FRAMEBUFFERS,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "framebufferTarget"
				},
				FRAMEBUFFER: {
					type: ArgumentType.WebGLFramebuffer,
				},
			},
		},
		{
			glfn: "bindTexture",
			category: Category.TEXTURES,
			blockType: BlockType.COMMAND,
			arguments: {
				TARGET: {
					type: ArgumentType.NUMBER,
					menu: "textureTarget"
				},
				TEXTURE: {
					type: ArgumentType.WebGLTexture,
				},
			},
		},
		{
			glfn: "clear",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				BITS: {
					type: ArgumentType.NUMBER,
					menu: "clearBufferBits",
				},
			},
		},
		{
			glfn: "clearBufferfi",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				BUFFER_TYPE: {
					type: ArgumentType.NUMBER,
					menu: "bufferType",
				},
				BUFFER_INDEX: {
					type: ArgumentType.NUMBER,
				},
				DEPTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 1,
				},
				STENCIL: {
					type: ArgumentType.NUMBER,
				}
			},
		},
		{
			glfn: "clearBufferfv",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				BUFFER_TYPE: {
					type: ArgumentType.NUMBER,
					menu: "bufferType",
				},
				BUFFER_INDEX: {
					type: ArgumentType.NUMBER,
				},
				COLOR: {
					type: ArgumentType.VECTOR,
					values: {
						RED: {
							type: ArgumentType.NUMBER,
						},
						GREEN: {
							type: ArgumentType.NUMBER,
						},
						BLUE: {
							type: ArgumentType.NUMBER,
						},
						ALPHA: {
							type: ArgumentType.NUMBER,
						},
					}
				},
			},
		},
		{
			glfn: "clearBufferiv",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				BUFFER_TYPE: {
					type: ArgumentType.NUMBER,
					menu: "bufferType",
				},
				BUFFER_INDEX: {
					type: ArgumentType.NUMBER,
				},
				COLOR: {
					type: ArgumentType.VECTOR,
					values: {
						RED: {
							type: ArgumentType.NUMBER,
						},
						GREEN: {
							type: ArgumentType.NUMBER,
						},
						BLUE: {
							type: ArgumentType.NUMBER,
						},
						ALPHA: {
							type: ArgumentType.NUMBER,
						},
					}
				},
			},
		},
		{
			glfn: "clearBufferuiv",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				BUFFER_TYPE: {
					type: ArgumentType.NUMBER,
					menu: "bufferType",
				},
				BUFFER_INDEX: {
					type: ArgumentType.NUMBER,
				},
				COLOR: {
					type: ArgumentType.VECTOR,
					values: {
						RED: {
							type: ArgumentType.NUMBER,
						},
						GREEN: {
							type: ArgumentType.NUMBER,
						},
						BLUE: {
							type: ArgumentType.NUMBER,
						},
						ALPHA: {
							type: ArgumentType.NUMBER,
						},
					}
				},
			},
		},
		{
			glfn: "clearColor",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				RED: {
					type: ArgumentType.NUMBER,
				},
				GREEN: {
					type: ArgumentType.NUMBER,
				},
				BLUE: {
					type: ArgumentType.NUMBER,
				},
				ALPHA: {
					type: ArgumentType.NUMBER,
					defaultValue: 1,
				},
			},
		},
		{
			glfn: "clearDepth",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				DEPTH: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "clearStencil",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "colorMask",
			category: Category.WRITEOPTIONS,
			blockType: BlockType.COMMAND,
			arguments: {
				RED: {
					type: ArgumentType.BOOLEAN,
				},
				GREEN: {
					type: ArgumentType.BOOLEAN,
				},
				BLUE: {
					type: ArgumentType.BOOLEAN,
				},
				ALPHA: {
					type: ArgumentType.BOOLEAN,
				},
			},
		},
		{
			glfn: "disableVertexAttribArray",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				LOCATION: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "drawArrays",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				PRIMITIVE: {
					type: ArgumentType.NUMBER,
					menu: "primitiveType",
					defaultValue: gl.TRIANGLES
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
				COUNT: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "drawBuffers",
			blockType: BlockType.COMMAND,
			arguments: {
				BUFFERS: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "drawElements",
			category: Category.RENDERING,
			blockType: BlockType.COMMAND,
			needsRefresh: true,
			arguments: {
				PRIMITIVE: {
					type: ArgumentType.NUMBER,
					menu: "primitiveType",
					defaultValue: gl.TRIANGLES
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
				COUNT: {
					type: ArgumentType.NUMBER,
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "unsignedInts",
					defaultValue: gl.UNSIGNED_SHORT
				},
			},
		},
		{
			glfn: "enableVertexAttribArray",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				LOCATION: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "scissor",
			blockType: BlockType.COMMAND,
			arguments: {
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "uniform1$",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "uniform1$v",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "uniform2$",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "uniform2$v",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "uniform3$",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "uniform3$v",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "uniform4$",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
				W: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "uniform4$v",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				UNIFORM: {
					type: ArgumentType.STRING,
					menu: "uniform",
					defaultValue: "f",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "uniformMatrix$fv",
			category: Category.UNIFORMS,
			blockType: BlockType.COMMAND,
			arguments: {
				SIZE: {
					type: ArgumentType.STRING,
					menu: "uniformMatrix",
					defaultValue: "4",
				},
				LOCATION: {
					type: ArgumentType.WebGLUniformLocation,
				},
				TRANSPOSE: {
					type: ArgumentType.BOOLEAN,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "vertexAttrib1f",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "vertexAttrib1fv",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "vertexAttrib2f",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "vertexAttrib2fv",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "vertexAttrib3f",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "vertexAttrib3fv",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "vertexAttrib4f",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
				W: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "vertexAttrib4fv",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "vertexAttribI4$",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				ATTRIBUTE: {
					type: ArgumentType.STRING,
					menu: "iui",
				},
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
				W: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "vertexAttribI4$v",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				ATTRIBUTE: {
					type: ArgumentType.STRING,
					menu: "iui",
				},
				INDEX: {
					type: ArgumentType.NUMBER,
				},
				DATA: {
					type: ArgumentType.LIST,
				},
			},
		},
		{
			glfn: "vertexAttribPointer",
			category: Category.ATTRIBUTES,
			blockType: BlockType.COMMAND,
			arguments: {
				LOCATION: {
					type: ArgumentType.NUMBER,
				},
				SIZE: {
					type: ArgumentType.NUMBER,
					defaultvalue: 2
				},
				TYPE: {
					type: ArgumentType.NUMBER,
					menu: "dataType",
					defaultValue: gl.FLOAT
				},
				NORMALIZED: {
					type: ArgumentType.BOOLEAN,
				},
				STRIDE: {
					type: ArgumentType.NUMBER,
				},
				OFFSET: {
					type: ArgumentType.NUMBER,
				},
			},
		},
		{
			glfn: "viewport",
			blockType: BlockType.COMMAND,
			arguments: {
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				WIDTH: {
					type: ArgumentType.NUMBER,
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
				},
			},
		},
	]





	function subset(array) {
		array.forEach(name => { //TODO: remove this
			if(gl[name] === undefined) throw new Error(`gl.${name} not found`);
		});
		return {
			acceptReporters: true,
			items: array.map(name => ({
				text: `gl.${name}`,
				value: ""+gl[name]
			}))
		}
	}
	function range(name, length) {
		return new Array(length).fill(name).map((e,i) => e+i);
	}

	let extInfo = {
				id: "webgl2",
				name: "WebGL 2 bindings",
				color1: "#d10000",
				color2: "#bd0000",
				color3: "#af0100",
				blocks: [
					...definitions
				],
				menus: {
					lists: {
						acceptReporters: false,
						items: "listsMenu"
					},
					costumes: {
						acceptReporters: true,
						items: "costumes"
					},
					listsCostume: {
						acceptReporters: false,
						items: "listsMenuCostume"
					},
					typedArrays: {
						acceptReporters: false,
						items: Object.keys(TypedArrays)
					},
					contextAttributes: {
						acceptReporters: true,
						items: ["alpha", "antialias", "depth", "failIfMajorPerformanceCaveat", "powerPreference", "premultipliedAlpha", "preserveDrawingBuffer",
							"stencil", "desynchronized"],
					},
					iui: ["i", "ui"],
					uniform: ["f", "i", "ui"],
					uniformMatrix: ["2", "2x3", "2x4", "3", "3x2", "3x4", "4", "4x2", "4x3"],
					activeInfo: ["name", "size", "type"],
					allConsts: {
						acceptReporters: false,
						items: allConsts
					},
					textureUnits: {
						acceptReporters: true,
						items: allConsts.filter(e => {let v=e.value-gl.TEXTURE0; return v>=0 && v<32;})
					},
					clearBufferBits: {
						acceptReporters: true,
						items: [
							["gl.COLOR_BUFFER_BIT", gl.COLOR_BUFFER_BIT],
							["gl.DEPTH_BUFFER_BIT", gl.DEPTH_BUFFER_BIT],
							["gl.STENCIL_BUFFER_BIT", gl.STENCIL_BUFFER_BIT],
							["gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT", gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT],
							["gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT", gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT],
							["gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT", gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT],
							["gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT", gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT],
						].map(e => ({text: e[0], value: ""+e[1]}))
					},
					shaderType: subset(["VERTEX_SHADER", "FRAGMENT_SHADER"]),
					shaderParameter: subset(["SHADER_TYPE", "DELETE_STATUS", "COMPILE_STATUS"]),
					programParameter: subset(["DELETE_STATUS", "LINK_STATUS", "VALIDATE_STATUS", "ATTACHED_SHADERS", "ACTIVE_ATTRIBUTES", "ACTIVE_UNIFORMS",
						"TRANSFORM_FEEDBACK_BUFFER_MODE", "TRANSFORM_FEEDBACK_VARYINGS", "ACTIVE_UNIFORM_BLOCKS"]),
					bufferTarget: subset(["ARRAY_BUFFER", "ELEMENT_ARRAY_BUFFER", "COPY_READ_BUFFER", "COPY_WRITE_BUFFER", "TRANSFORM_FEEDBACK_BUFFER", "UNIFORM_BUFFER",
						"PIXEL_PACK_BUFFER", "PIXEL_UNPACK_BUFFER"]),
					bufferUsage: subset(["STATIC_DRAW", "DYNAMIC_DRAW", "STREAM_DRAW", "STATIC_READ", "DYNAMIC_READ", "STREAM_READ", "STATIC_COPY", "DYNAMIC_COPY",
						"STREAM_COPY"]),
					dataType: subset(["FLOAT", "HALF_FLOAT", "BYTE", "UNSIGNED_BYTE", "SHORT", "UNSIGNED_SHORT", "INT", "UNSIGNED_INT", "INT_2_10_10_10_REV",
						"UNSIGNED_INT_2_10_10_10_REV"]),
					dataTypeInt: subset(["BYTE", "UNSIGNED_BYTE", "SHORT", "UNSIGNED_SHORT", "INT", "UNSIGNED_INT"]),
					primitiveType: subset(["POINTS", "LINE_STRIP", "LINE_LOOP", "LINES", "TRIANGLE_STRIP", "TRIANGLE_FAN", "TRIANGLES"]),
					primitiveTypeMain: subset(["POINTS", "LINES", "TRIANGLES"]),
					capability: subset(["BLEND", "CULL_FACE", "DEPTH_TEST", "DITHER", "POLYGON_OFFSET_FILL", "SAMPLE_ALPHA_TO_COVERAGE", "SAMPLE_COVERAGE", "SCISSOR_TEST",
						"STENCIL_TEST"]),
					unsignedInts: subset(["UNSIGNED_BYTE", "UNSIGNED_SHORT", "UNSIGNED_INT"]),
					faces: subset(["FRONT", "BACK", "FRONT_AND_BACK"]),
					framebufferTarget: subset(["FRAMEBUFFER", "DRAW_FRAMEBUFFER", "READ_FRAMEBUFFER"]),
					textureTarget: subset(["TEXTURE_2D", "TEXTURE_CUBE_MAP", "TEXTURE_3D", "TEXTURE_2D_ARRAY"]),
					textureTarget2: subset(["TEXTURE_2D", "TEXTURE_CUBE_MAP_POSITIVE_X", "TEXTURE_CUBE_MAP_NEGATIVE_X", "TEXTURE_CUBE_MAP_POSITIVE_Y",
						"TEXTURE_CUBE_MAP_NEGATIVE_Y", "TEXTURE_CUBE_MAP_POSITIVE_Z", "TEXTURE_CUBE_MAP_NEGATIVE_Z"]),
					textureTarget3: subset(["TEXTURE_3D", "TEXTURE_2D_ARRAY"]),
					textureTarget2D: subset(["TEXTURE_2D", "TEXTURE_CUBE_MAP"]),
					textureTarget3D: subset(["TEXTURE_3D", "TEXTURE_2D_ARRAY"]),
					internalFormat: subset(["RGBA", "RGB", "LUMINANCE_ALPHA", "LUMINANCE", "ALPHA", "R8", "R8_SNORM", "RG8", "RG8_SNORM", "RGB8", "RGB8_SNORM", "RGB565",
						"RGBA4", "RGB5_A1", "RGBA8", "RGBA8_SNORM", "RGB10_A2", "RGB10_A2UI", "SRGB8", "SRGB8_ALPHA8", "R16F", "RG16F", "RGB16F", "RGBA16F", "R32F",
						"RG32F", "RGB32F", "RGBA32F", "R11F_G11F_B10F", "RGB9_E5", "R8I", "R8UI", "R16I", "R16UI", "R32I", "R32UI", "RG8I", "RG8UI", "RG16I","RG16UI",
						"RG32I", "RG32UI", "RGB8I", "RGB8UI", "RGB16I", "RGB16UI", "RGB32I", "RGB32UI", "RGBA8I", "RGBA8UI", "RGBA16I", "RGBA16UI", "RGBA32I", "RGBA32UI"]),
					internalFormat2: subset(["RGBA", "RGB", "LUMINANCE_ALPHA", "LUMINANCE", "ALPHA"]),
					internalFormatRenderable: subset(["RGBA", "RGB", "R8", "RG8", "RGB8", "RGB565", "RGBA4", "RGB5_A1", "RGBA8", "RGB10_A2", "RGB10_A2UI", "SRGB8_ALPHA8",
						"R8I", "R8UI", "R16I", "R16UI", "R32I", "R32UI", "RG8I", "RG8UI", "RG16I", "RG16UI", "RG32I", "RG32UI", "RGBA8I", "RGBA8UI", "RGBA16I", "RGBA16UI",
						"RGBA32I", "RGBA32UI"]),
					internalFormat3: subset(["R8", "R16F", "R32F", "R8UI", "RG8", "RG16F", "RG32F", "RG8UI", "RGB8", "SRGB8", "RGB565", "R11F_G11F_B10F", "RGB9_E5",
						"RGB16F", "RGB32F", "RGB8UI", "RGBA8", "SRGB8_ALPHA8", "RGB5_A1", "RGBA4", "RGBA16F", "RGBA32F", "RGBA8UI"]),
					format: subset(["RED", "RED_INTEGER", "RG", "RG_INTEGER", "RGB", "RGB_INTEGER", "RGBA", "RGBA_INTEGER", "LUMINANCE_ALPHA", "LUMINANCE", "ALPHA"]),
					format2: subset(["RED", "RED_INTEGER", "RG", "RG_INTEGER", "RGB", "RGB_INTEGER", "RGBA", "RGBA_INTEGER", "ALPHA"]),
					textureDataType: subset(["UNSIGNED_BYTE", "BYTE", "UNSIGNED_SHORT", "SHORT", "UNSIGNED_INT", "INT", "HALF_FLOAT", "FLOAT",
						"UNSIGNED_INT_2_10_10_10_REV", "UNSIGNED_INT_10F_11F_11F_REV", "UNSIGNED_INT_5_9_9_9_REV", "UNSIGNED_INT_24_8", "UNSIGNED_SHORT_5_6_5",
						"UNSIGNED_SHORT_4_4_4_4", "UNSIGNED_SHORT_5_5_5_1", "FLOAT_32_UNSIGNED_INT_24_8_REV"]),
					frontFace: subset(["CW", "CCW"]),
					hintTarget: subset(["GENERATE_MIPMAP_HINT", "FRAGMENT_SHADER_DERIVATIVE_HINT"]),
					hintMode: subset(["FASTEST", "NICEST", "DONT_CARE"]),
					texParamTarget: subset(["TEXTURE_2D", "TEXTURE_3D", "TEXTURE_CUBE_MAP", "TEXTURE_2D_ARRAY"]),
					texParamPnameI: subset(["TEXTURE_MAG_FILTER", "TEXTURE_MIN_FILTER", "TEXTURE_WRAP_S", "TEXTURE_WRAP_T", "TEXTURE_WRAP_R", "TEXTURE_BASE_LEVEL",
						"TEXTURE_COMPARE_FUNC", "TEXTURE_COMPARE_MODE", "TEXTURE_MAX_LEVEL"]),
					texParamPnameF: subset(["TEXTURE_MIN_LOD", "TEXTURE_MAX_LOD"]),
					syncCondition: subset(["SYNC_GPU_COMMANDS_COMPLETE"]),
					syncParameter: subset(["OBJECT_TYPE", "SYNC_STATUS", "SYNC_CONDITION", "SYNC_FLAGS"]),
					shaderPrecisionType: subset(["LOW_FLOAT", "MEDIUM_FLOAT", "HIGH_FLOAT", "LOW_INT", "MEDIUM_INT", "HIGH_INT"]),
					shaderPrecisionComponent: ["rangeMin", "rangeMax", "precision"],
					textureFiltering: subset(["NEAREST", "LINEAR"]),
					compareFunc: subset(["NEVER", "LESS", "EQUAL", "LEQUAL", "GREATER", "NOTEQUAL", "GEQUAL", "ALWAYS"]),
					stencilOp: subset(["KEEP", "ZERO", "REPLACE", "INCR", "INCR_WRAP", "DECR", "DECR_WRAP", "INVERT"]),
					blendEquation: subset(["FUNC_ADD", "FUNC_SUBTRACT", "FUNC_REVERSE_SUBTRACT", "MIN", "MAX"]),
					blendFunc: subset(["ZERO", "ONE", "SRC_COLOR", "ONE_MINUS_SRC_COLOR", "DST_COLOR", "ONE_MINUS_DST_COLOR", "SRC_ALPHA", "ONE_MINUS_SRC_ALPHA",
						"DST_ALPHA", "ONE_MINUS_DST_ALPHA", "CONSTANT_COLOR", "ONE_MINUS_CONSTANT_COLOR", "CONSTANT_ALPHA", "ONE_MINUS_CONSTANT_ALPHA",
						"SRC_ALPHA_SATURATE"]),
					pixelstorei: subset(["PACK_ALIGNMENT", "UNPACK_ALIGNMENT", "UNPACK_FLIP_Y_WEBGL", "UNPACK_PREMULTIPLY_ALPHA_WEBGL",
						"UNPACK_COLORSPACE_CONVERSION_WEBGL", "PACK_ROW_LENGTH", "PACK_SKIP_PIXELS", "PACK_SKIP_ROWS", "UNPACK_ROW_LENGTH", "UNPACK_IMAGE_HEIGHT",
						"UNPACK_SKIP_PIXELS", "UNPACK_SKIP_ROWS", "UNPACK_SKIP_IMAGES"]),
					transformFeedbackTarget: subset(["TRANSFORM_FEEDBACK"]),
					bufferMode: subset(["SEPARATE_ATTRIBS", "INTERLEAVED_ATTRIBS"]),
					queryTarget: subset(["ANY_SAMPLES_PASSED", "ANY_SAMPLES_PASSED_CONSERVATIVE", "TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN"]),
					queryPname1: subset(["CURRENT_QUERY"]),
					queryPname2: subset(["QUERY_RESULT", "QUERY_RESULT_AVAILABLE"]),
					bufferType: subset(["COLOR", "DEPTH", "STENCIL", "DEPTH_STENCIL"]),
					bindBufferTarget: subset(["TRANSFORM_FEEDBACK_BUFFER", "UNIFORM_BUFFER"]),
					renderbufferTarget: subset(["RENDERBUFFER"]),
					readBuffer: subset(["BACK","NONE",...range("COLOR_ATTACHMENT",16)]),
					samplerParameterf: subset(["TEXTURE_MAX_LOD", "TEXTURE_MIN_LOD"]),
					samplerParameteri: subset(["TEXTURE_COMPARE_FUNC", "TEXTURE_COMPARE_MODE", "TEXTURE_MAG_FILTER", "TEXTURE_MIN_FILTER", "TEXTURE_WRAP_R",
						"TEXTURE_WRAP_S", "TEXTURE_WRAP_T"]),
					attachment: subset([...range("COLOR_ATTACHMENT",16), "DEPTH_ATTACHMENT", "DEPTH_STENCIL_ATTACHMENT", "STENCIL_ATTACHMENT"]),
					bufferReadWriteTarget: subset(["ARRAY_BUFFER", "ELEMENT_ARRAY_BUFFER", "COPY_READ_BUFFER", "COPY_WRITE_BUFFER", "TRANSFORM_FEEDBACK_BUFFER",
						"UNIFORM_BUFFER", "PIXEL_PACK_BUFFER", "PIXEL_UNPACK_BUFFER"]),
					activeUniformsPname: subset(["UNIFORM_TYPE", "UNIFORM_SIZE", "UNIFORM_BLOCK_INDEX", "UNIFORM_OFFSET", "UNIFORM_ARRAY_STRIDE", "UNIFORM_MATRIX_STRIDE",
						"UNIFORM_IS_ROW_MAJOR"]),
					uniformBlockParam: subset(["UNIFORM_BLOCK_BINDING", "UNIFORM_BLOCK_DATA_SIZE", "UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES", "UNIFORM_BLOCK_ACTIVE_UNIFORMS",
						"UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER", "UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER"]),
					parameter: subset(["ACTIVE_TEXTURE", "ALIASED_LINE_WIDTH_RANGE", "ALIASED_POINT_SIZE_RANGE", "ALPHA_BITS", "ARRAY_BUFFER_BINDING", "BLEND",
						"BLEND_COLOR", "BLEND_DST_ALPHA", "BLEND_DST_RGB", "BLEND_EQUATION", "BLEND_EQUATION_ALPHA", "BLEND_EQUATION_RGB", "BLEND_SRC_ALPHA",
						"BLEND_SRC_RGB", "BLUE_BITS", "COLOR_CLEAR_VALUE", "COLOR_WRITEMASK", "COMPRESSED_TEXTURE_FORMATS", "CULL_FACE", "CULL_FACE_MODE",
						"CURRENT_PROGRAM", "DEPTH_BITS", "DEPTH_CLEAR_VALUE", "DEPTH_FUNC", "DEPTH_RANGE", "DEPTH_TEST", "DEPTH_WRITEMASK", "DITHER",
						"ELEMENT_ARRAY_BUFFER_BINDING", "FRAMEBUFFER_BINDING", "FRONT_FACE", "GENERATE_MIPMAP_HINT", "GREEN_BITS", "IMPLEMENTATION_COLOR_READ_FORMAT",
						"IMPLEMENTATION_COLOR_READ_TYPE", "LINE_WIDTH", "MAX_COMBINED_TEXTURE_IMAGE_UNITS", "MAX_CUBE_MAP_TEXTURE_SIZE", "MAX_FRAGMENT_UNIFORM_VECTORS",
						"MAX_RENDERBUFFER_SIZE", "MAX_TEXTURE_IMAGE_UNITS", "MAX_TEXTURE_SIZE", "MAX_VARYING_VECTORS", "MAX_VERTEX_ATTRIBS",
						"MAX_VERTEX_TEXTURE_IMAGE_UNITS", "MAX_VERTEX_UNIFORM_VECTORS", "MAX_VIEWPORT_DIMS", "PACK_ALIGNMENT", "POLYGON_OFFSET_FACTOR",
						"POLYGON_OFFSET_FILL", "POLYGON_OFFSET_UNITS", "RED_BITS", "RENDERBUFFER_BINDING", "RENDERER", "SAMPLE_BUFFERS", "SAMPLE_COVERAGE_INVERT",
						"SAMPLE_COVERAGE_VALUE", "SAMPLES", "SCISSOR_BOX", "SCISSOR_TEST", "SHADING_LANGUAGE_VERSION", "STENCIL_BACK_FAIL", "STENCIL_BACK_FUNC",
						"STENCIL_BACK_PASS_DEPTH_FAIL", "STENCIL_BACK_PASS_DEPTH_PASS", "STENCIL_BACK_REF", "STENCIL_BACK_VALUE_MASK", "STENCIL_BACK_WRITEMASK",
						"STENCIL_BITS", "STENCIL_CLEAR_VALUE", "STENCIL_FAIL", "STENCIL_FUNC", "STENCIL_PASS_DEPTH_FAIL", "STENCIL_PASS_DEPTH_PASS", "STENCIL_REF",
						"STENCIL_TEST", "STENCIL_VALUE_MASK", "STENCIL_WRITEMASK", "SUBPIXEL_BITS", "TEXTURE_BINDING_2D", "TEXTURE_BINDING_CUBE_MAP", "UNPACK_ALIGNMENT",
						"UNPACK_COLORSPACE_CONVERSION_WEBGL", "UNPACK_FLIP_Y_WEBGL", "UNPACK_PREMULTIPLY_ALPHA_WEBGL", "VENDOR", "VERSION", "VIEWPORT",
						"COPY_READ_BUFFER_BINDING", "COPY_WRITE_BUFFER_BINDING", ...range("DRAW_BUFFER",16), "DRAW_FRAMEBUFFER_BINDING", "FRAGMENT_SHADER_DERIVATIVE_HINT",
						"MAX_3D_TEXTURE_SIZE", "MAX_ARRAY_TEXTURE_LAYERS", "MAX_CLIENT_WAIT_TIMEOUT_WEBGL", "MAX_COLOR_ATTACHMENTS",
						"MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS", "MAX_COMBINED_UNIFORM_BLOCKS", "MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS", "MAX_DRAW_BUFFERS",
						"MAX_ELEMENT_INDEX", "MAX_ELEMENTS_INDICES", "MAX_ELEMENTS_VERTICES", "MAX_FRAGMENT_INPUT_COMPONENTS", "MAX_FRAGMENT_UNIFORM_BLOCKS",
						"MAX_FRAGMENT_UNIFORM_COMPONENTS", "MAX_PROGRAM_TEXEL_OFFSET", "MAX_SAMPLES", "MAX_SERVER_WAIT_TIMEOUT", "MAX_TEXTURE_LOD_BIAS",
						"MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS", "MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS", "MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS",
						"MAX_UNIFORM_BLOCK_SIZE", "MAX_UNIFORM_BUFFER_BINDINGS", "MAX_VARYING_COMPONENTS", "MAX_VERTEX_OUTPUT_COMPONENTS", "MAX_VERTEX_UNIFORM_BLOCKS",
						"MAX_VERTEX_UNIFORM_COMPONENTS", "MIN_PROGRAM_TEXEL_OFFSET", "PACK_ROW_LENGTH", "PACK_SKIP_PIXELS", "PACK_SKIP_ROWS", "PIXEL_PACK_BUFFER_BINDING",
						"PIXEL_UNPACK_BUFFER_BINDING", "RASTERIZER_DISCARD", "READ_BUFFER", "READ_FRAMEBUFFER_BINDING", "SAMPLE_ALPHA_TO_COVERAGE", "SAMPLE_COVERAGE",
						"SAMPLER_BINDING", "TEXTURE_BINDING_2D_ARRAY", "TEXTURE_BINDING_3D", "TRANSFORM_FEEDBACK_ACTIVE", "TRANSFORM_FEEDBACK_BINDING",
						"TRANSFORM_FEEDBACK_BUFFER_BINDING", "TRANSFORM_FEEDBACK_PAUSED", "UNIFORM_BUFFER_BINDING", "UNIFORM_BUFFER_OFFSET_ALIGNMENT",
						"UNPACK_IMAGE_HEIGHT", "UNPACK_ROW_LENGTH", "UNPACK_SKIP_IMAGES", "UNPACK_SKIP_PIXELS", "UNPACK_SKIP_ROWS", "VERTEX_ARRAY_BINDING"]),
					textureParameter: subset(["TEXTURE_MAG_FILTER", "TEXTURE_MIN_FILTER", "TEXTURE_WRAP_S", "TEXTURE_WRAP_T", "TEXTURE_BASE_LEVEL", "TEXTURE_COMPARE_FUNC",
						"TEXTURE_COMPARE_MODE", "TEXTURE_IMMUTABLE_FORMAT", "TEXTURE_IMMUTABLE_LEVELS", "TEXTURE_MAX_LEVEL", "TEXTURE_MAX_LOD", "TEXTURE_MIN_LOD",
						"TEXTURE_WRAP_R"]),
					framebufferAttachmentParam: subset(["FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE", "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME", "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",
						"FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE", "FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE", "FRAMEBUFFER_ATTACHMENT_BLUE_SIZE",
						"FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING", "FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE", "FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE",
						"FRAMEBUFFER_ATTACHMENT_GREEN_SIZE", "FRAMEBUFFER_ATTACHMENT_RED_SIZE", "FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE",
						"FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER"]),
					renderbufferParam: subset(["RENDERBUFFER_WIDTH", "RENDERBUFFER_HEIGHT", "RENDERBUFFER_INTERNAL_FORMAT", "RENDERBUFFER_GREEN_SIZE",
						"RENDERBUFFER_BLUE_SIZE", "RENDERBUFFER_RED_SIZE", "RENDERBUFFER_ALPHA_SIZE", "RENDERBUFFER_DEPTH_SIZE", "RENDERBUFFER_STENCIL_SIZE",
						"RENDERBUFFER_SAMPLES"]),
					bufferParam: subset(["BUFFER_SIZE", "BUFFER_USAGE"]),
					samplerParam: subset(["TEXTURE_COMPARE_FUNC", "TEXTURE_COMPARE_MODE", "TEXTURE_MAG_FILTER", "TEXTURE_MAX_LOD", "TEXTURE_MIN_FILTER", "TEXTURE_MIN_LOD",
						"TEXTURE_WRAP_R", "TEXTURE_WRAP_S", "TEXTURE_WRAP_T"]),
					vertexParam: subset(["VERTEX_ATTRIB_ARRAY_BUFFER_BINDING", "VERTEX_ATTRIB_ARRAY_ENABLED", "VERTEX_ATTRIB_ARRAY_SIZE", "VERTEX_ATTRIB_ARRAY_STRIDE",
						"VERTEX_ATTRIB_ARRAY_TYPE", "VERTEX_ATTRIB_ARRAY_NORMALIZED", "CURRENT_VERTEX_ATTRIB", "VERTEX_ATTRIB_ARRAY_INTEGER",
						"VERTEX_ATTRIB_ARRAY_DIVISOR"]),
					vertexParamOffset: subset(["VERTEX_ATTRIB_ARRAY_POINTER"]),
					indexedTarget: subset(["TRANSFORM_FEEDBACK_BUFFER_BINDING", "TRANSFORM_FEEDBACK_BUFFER_SIZE", "TRANSFORM_FEEDBACK_BUFFER_START",
						"UNIFORM_BUFFER_BINDING", "UNIFORM_BUFFER_SIZE", "UNIFORM_BUFFER_START"]),
					internalFormatParam: subset(["SAMPLES"]),
				}
			};

	class Extension {
		getInfo() {
			return extInfo;
		}
		listsMenu() {
			let stage = vm.runtime.getTargetForStage();
			let editingTarget = vm.editingTarget;
			let local = editingTarget ? Object.values(editingTarget.variables).filter(v => v.type == "list").map(v => v.name) : [];
			let global = stage ? Object.values(stage.variables).filter(v => v.type == "list").map(v => v.name) : [];
			let all = [...local, ...global];
			all.sort();
			if(all.length == 0) return ["my list"];
			return all;
		}
		costumes() {
			let all = ["current", "svgs not supported"];
			let editingTarget = vm.editingTarget;
			if(editingTarget) {
				editingTarget.getCostumes().forEach(e => all.push(e.name));
			}
			return all;
		}
	}

	function alertUnimplemented() {
		const def = {
			makeXRCompatible: true,
		};
		for (let i=0; i<definitions.length; i++) {
			const block = definitions[i];
			if (block === "---") continue;
			let name = block.opcode || block.glfn;
			if (name.includes("-")) name = name.split("-")[0];
			if (name.includes("$")) {
				const menuName = Object.values(block.arguments)[0].menu;
				
				let menuItems = extInfo.menus[menuName];
				if (menuItems.items) menuItems = menuItems.items;
				if (!Array.isArray(menuItems)) throw new Error("invalid menu");
				menuItems = menuItems.map(e => (typeof e == "object") ? e.value : e);
				
				for(const item of menuItems) {
					def[name.replace("$", item)] = true;
				}
			} else {
				def[name] = true;
			}
		}
		const out = [];
		for (let i in gl) {
			if (!def[i] && typeof gl[i] == "function") out.push(i);
		}
		console.warn(`${out.join("\n")}\nleft: ${out.length}\ndone: ${definitions.length}`);
	}
	alertUnimplemented();


	// Debug console log
	const ogl = gl;
	gl = {}
	for (let i in ogl) {
		if (typeof ogl[i] == "function") {
			gl[i] = function(...args) {
				let res = ogl[i](...args);
				if (res === undefined) {
					console.log("gl."+i+"(",...args,")");
				} else {
					console.log("gl."+i+"(",...args,") =>",res);
				}
				return res;
			}
		}
		if (typeof ogl[i] == "number") {
			gl[i] = ogl[i];
		}
	}
	gl.__proto__ = ogl;


	// Compiler
	function processBlockArgs(block, blockArgs, fnSrc, fnArgs, glArgs, blArgs, settings) {
		for (let name in blockArgs) {
			let readAs = name;
			const blockArg = blockArgs[name];
			const type = blockArg.type;
			if (!type) console.warn(block);
			if (type == ArgumentType.LIST) {
				readAs = `${readAs}.value`;
				if (blockArg.join) {
					readAs = `${readAs}.join(${JSON.stringify(blockArg.join)})`;
				}
				blockArg.type = ArgumentType.STRING;
				blockArg.menu = "lists";
				fnSrc += `    ${name} = target.lookupVariableByNameAndType(${name}, "list");\n`;
				if (settings.returns) {
					fnSrc += `    if (!${name}) return "";\n`;
				} else {
					fnSrc += `    if (!${name}) return;\n`;
				}
				if (blockArg.typedArray) {
					const typeLookup = blockArg.typeLookup ?? "TypedArrays";
					if (blockArg.typeSource) {
						readAs = `new (${typeLookup}[${blockArg.typeSource}])(${readAs}.map(Number))`;
					} else {
						blArgs["ARRAYTYPE"] = {
							type: ArgumentType.STRING,
							menu: "typedArrays",
							defaultValue: "Float32Array"
						};
						fnArgs.push("ARRAYTYPE");
						readAs = `new (${typeLookup}[ARRAYTYPE])(${readAs}.map(Number))`;
					}
				}
				settings.usesTarget = true;
			}
			if (type == ArgumentType.VECTOR) {
				let glArgsFake = [];
				fnSrc = processBlockArgs(block, blockArg.values, fnSrc, fnArgs, glArgsFake, blArgs, settings);
				readAs = `[${glArgsFake.join(", ")}]`;
			}
			if (type == ArgumentType.PROPERTY) {
				blockArg.type = ArgumentType.STRING;
				settings.propertyArgument = name;
			}
			if (type.startsWith("WebGL")) {
				fnSrc += `    ${name} = objectStorage.getTyped(num(${name}), "${type}");\n`;
				if (block.deletes) fnSrc += `    objectStorage.deleteByObject(${name});\n`;
			}
			if (type == ArgumentType.NUMBER) {
				readAs = `num(${readAs})`;
			}
			if (type == ArgumentType.STRING) {
				readAs = `str(${readAs})`;
			}
			if (type == ArgumentType.BOOLEAN) {
				readAs = `bool(${readAs})`;
			}
			// ---------------------------------
			if (type !== ArgumentType.PROPERTY) {
				glArgs.push(readAs);
			}
			if (type !== ArgumentType.VECTOR) {
				blArgs[name] = blockArg;
				fnArgs.push(name);
			}
		}
		return fnSrc;
	}

	let status = "";
	let status2 = "";
	let statusTotal = -5;
	let statusGood = 0;
	let totalSrc = "let {Scratch, vm, runtime, renderer, gl, num, str, bool, objectStorage, sanitizeOutput, getCostume, Extension, TypedArrays, GlTypeToTypedArray, onContextRecreatedCbs} = all;\n\n";
	totalSrc += "onContextRecreatedCbs.push((newCanvas, newGl) => {\n";
	totalSrc += "    gl = newGl;\n";
	totalSrc += "})\n\n";
	for (let block of definitions) {
		if (block == "---") continue;
		statusTotal++;
		if (statusTotal > 0) {
			if (block.glfn) {
				status += "🟩";
				statusGood++;
			} else {
				status += "🟥";
				status2 += `\n❌ ${block.opcode}`;
			}
		}

		if (block.category) block.hideFromPalette = true;

		if (block.glfn) {
			block.opcode = block.glfn.replaceAll("$","");
			block.glfn = block.glfn.split("-")[0];
			if (block.text) console.error("text", block.glfn);
			if (block.def) console.error("def", block.glfn);
			const settings = {
				returns: false,
				propertyArgument: null,
				usesTarget: false
			};
			if (block.blockType == BlockType.REPORTER || block.blockType == BlockType.BOOLEAN) {
				block.disableMonitor = true;
				settings.returns = true;
			}

			let blockArgs = block.arguments || {};
			
			let fnSrc = "\n";
			let fnArgs = [];
			let glArgs = [];
			let blArgs = block.arguments = {};
			fnSrc = processBlockArgs(block, blockArgs, fnSrc, fnArgs, glArgs, blArgs, settings);
			let fnArgsWrapped = fnArgs.map(name => `[${name}]`);

			let fnToCall = `gl.${block.glfn}`;
			let blockText = `gl.${block.glfn}`;
			if (block.glfn.includes("$")) {
				let parts = block.glfn.split("$");
				let param1 = glArgs.shift();
				let param2 = fnArgsWrapped.shift();
				fnToCall = `gl["${parts[0]}"+${param1}+"${parts[1]}"]`;
				blockText = `gl.${parts[0]}${param2}${parts[1]}`;
			} else if (!gl[block.glfn]) {
				console.warn("gl not found", block.glfn);
			}

			let glCall = `${fnToCall}(${glArgs.join(", ")})`;
			if (block.mapObjectsToIds) {
				glCall = `${glCall}.map(o => objectStorage.getIdByObject(o))`;
			}
			if (settings.propertyArgument) {
				glCall = `${glCall}?.[${settings.propertyArgument}] ?? ""`;
				fnArgsWrapped.splice(fnArgsWrapped.length-1, 0, ".");
			}
			if (settings.returns) {
				fnSrc += `    return sanitizeOutput(${glCall});\n`;
			} else {
				fnSrc += `    ${glCall};\n`;
			}

			if (block.needsRefresh) {
				fnSrc += `    renderer.dirty = true;\n`;
				fnSrc += `    runtime.requestRedraw();\n`;
			}

			block.text = `${blockText} ${fnArgsWrapped.join(" ")}`;
			totalSrc += `// ${block.text}\n`;
			totalSrc += `Extension.prototype[${JSON.stringify(block.opcode)}] = function({${fnArgs}}${settings.usesTarget ? ", {target}" : ""}) {${fnSrc}}\n\n`;
		}
		if (block.def) {
			Extension.prototype[block.opcode] = block.def;
		}
	}
	(new Function("all", totalSrc))({Scratch, vm, runtime, renderer, gl, num, str, bool, objectStorage, sanitizeOutput, getCostume, Extension, TypedArrays, GlTypeToTypedArray, onContextRecreatedCbs});
	console.log(totalSrc);
	console.log(status, `${statusGood}/${statusTotal} ${Math.round(statusGood/statusTotal*1000)/10}%${status2}`);


	

	// Categories
	// TODO: precalc!
	const gbx = vm.runtime.getBlocksXML;
	vm.runtime.getBlocksXML = function(target) {
		const res = gbx.call(this, target);
		try {
			const blocks = this._blockInfo.find(categoryInfo => categoryInfo.id == "webgl2").blocks;
			for(let name in Category) {
				const paletteBlocks = blocks.filter(block => (block.info && block.info.category == Category[name]));
				res.push({
					id: Category[name],
					xml: `<category name="${Category[name]}" id="gl_${Category[name].toLowerCase()}" colour="#d10000" secondaryColour="#bd0000">${
							paletteBlocks.map(block => block.xml).join('')}</category>`
				});
			}
		} catch(e) {
			console.error(e);
		}
		return res;
	}

	Scratch.extensions.register(new Extension());
})(Scratch);