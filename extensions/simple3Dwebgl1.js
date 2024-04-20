(function(Scratch) {
	"use strict";

	/*
	 * A modified version of m4 library based on one of the earlier lessons on webglfundamentals.org
	 * All lessons can be found on https://github.com/gfxfundamentals/webgl-fundamentals/tree/master
	 * licensed under BSD 3-Clause license
	 */
	
	/*
	 * Copyright 2021 GFXFundamentals.
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *     * Redistributions of source code must retain the above copyright
	 * notice, this list of conditions and the following disclaimer.
	 *     * Redistributions in binary form must reproduce the above
	 * copyright notice, this list of conditions and the following disclaimer
	 * in the documentation and/or other materials provided with the
	 * distribution.
	 *     * Neither the name of GFXFundamentals. nor the names of his
	 * contributors may be used to endorse or promote products derived from
	 * this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	const m4 = {
		perspective(fieldOfViewInRadians, aspect, near, far) {
			const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
			const rangeInv = 1.0 / (near - far);
			return [
				f / aspect, 0, 0, 0,
				0, f, 0, 0,
				0, 0, (near + far) * rangeInv, -1,
				0, 0, near * far * rangeInv * 2, 0
			];
		},
		orthographic(aspect, near, far) {
			const rangeInv = 1.0 / (near - far);
			return [
				1 / aspect, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, (near + far) * rangeInv, 0,
				0, 0, near * far * rangeInv * 2, 0
			];
		},
		translation(tx, ty, tz) {
			return [
				1,  0,  0,  0,
				0,  1,  0,  0,
				0,  0,  1,  0,
				tx, ty, tz, 1,
			];
		},
		xRotation(angleInRadians) {
			const c = Math.cos(angleInRadians);
			const s = Math.sin(angleInRadians);
			return [
				1, 0, 0, 0,
				0, c, s, 0,
				0, -s, c, 0,
				0, 0, 0, 1,
			];
		},
		yRotation(angleInRadians) {
			const c = Math.cos(angleInRadians);
			const s = Math.sin(angleInRadians);
			return [
				c, 0, -s, 0,
				0, 1, 0, 0,
				s, 0, c, 0,
				0, 0, 0, 1,
			];
		},
		zRotation(angleInRadians) {
			const c = Math.cos(angleInRadians);
			const s = Math.sin(angleInRadians);
			return [
				 c, s, 0, 0,
				-s, c, 0, 0,
				 0, 0, 1, 0,
				 0, 0, 0, 1,
			];
		},
		scaling(sx, sy, sz) {
			return [
				sx, 0,  0,  0,
				0, sy,  0,  0,
				0,  0, sz,  0,
				0,  0,  0,  1,
			];
		},
		translate(m, tx, ty, tz) {
			return m4.multiply(m, m4.translation(tx, ty, tz));
		},
		xRotate(m, angleInRadians) {
			return m4.multiply(m, m4.xRotation(angleInRadians));
		},
		yRotate(m, angleInRadians) {
			return m4.multiply(m, m4.yRotation(angleInRadians));
		},
		zRotate(m, angleInRadians) {
			return m4.multiply(m, m4.zRotation(angleInRadians));
		},
		scale(m, sx, sy, sz) {
			return m4.multiply(m, m4.scaling(sx, sy, sz));
		},
		multiply(a, b) {
			const a00 = a[0 * 4 + 0];
			const a01 = a[0 * 4 + 1];
			const a02 = a[0 * 4 + 2];
			const a03 = a[0 * 4 + 3];
			const a10 = a[1 * 4 + 0];
			const a11 = a[1 * 4 + 1];
			const a12 = a[1 * 4 + 2];
			const a13 = a[1 * 4 + 3];
			const a20 = a[2 * 4 + 0];
			const a21 = a[2 * 4 + 1];
			const a22 = a[2 * 4 + 2];
			const a23 = a[2 * 4 + 3];
			const a30 = a[3 * 4 + 0];
			const a31 = a[3 * 4 + 1];
			const a32 = a[3 * 4 + 2];
			const a33 = a[3 * 4 + 3];
			const b00 = b[0 * 4 + 0];
			const b01 = b[0 * 4 + 1];
			const b02 = b[0 * 4 + 2];
			const b03 = b[0 * 4 + 3];
			const b10 = b[1 * 4 + 0];
			const b11 = b[1 * 4 + 1];
			const b12 = b[1 * 4 + 2];
			const b13 = b[1 * 4 + 3];
			const b20 = b[2 * 4 + 0];
			const b21 = b[2 * 4 + 1];
			const b22 = b[2 * 4 + 2];
			const b23 = b[2 * 4 + 3];
			const b30 = b[3 * 4 + 0];
			const b31 = b[3 * 4 + 1];
			const b32 = b[3 * 4 + 2];
			const b33 = b[3 * 4 + 3];
			return [
				b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
				b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
				b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
				b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
				b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
				b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
				b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
				b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
				b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
				b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
				b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
				b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
				b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
				b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
				b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
				b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
			];
		},
		multiplyVec: function(a, b) {
			var a00 = a[0 * 4 + 0];
			var a01 = a[0 * 4 + 1];
			var a02 = a[0 * 4 + 2];
			var a03 = a[0 * 4 + 3];
			var a10 = a[1 * 4 + 0];
			var a11 = a[1 * 4 + 1];
			var a12 = a[1 * 4 + 2];
			var a13 = a[1 * 4 + 3];
			var a20 = a[2 * 4 + 0];
			var a21 = a[2 * 4 + 1];
			var a22 = a[2 * 4 + 2];
			var a23 = a[2 * 4 + 3];
			var a30 = a[3 * 4 + 0];
			var a31 = a[3 * 4 + 1];
			var a32 = a[3 * 4 + 2];
			var a33 = a[3 * 4 + 3];
			var b00 = b[0 * 4 + 0];
			var b01 = b[0 * 4 + 1];
			var b02 = b[0 * 4 + 2];
			var b03 = b[0 * 4 + 3];
			return [
				b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
				b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
				b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
				b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
			];
		},
		identity() {
			return [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1,
			];
		},
		zero: function() {
			return [
				0, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0
			];
		},
		inverse: function(m) {
			const inv = m4.zero();
			inv[0]  =  m[5] * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
			inv[4]  = -m[4] * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
			inv[8]  =  m[4] * m[9]  * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
			inv[12] = -m[4] * m[9]  * m[14] + m[4]  * m[10] * m[13] + m[8]  * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
			inv[1]  = -m[1] * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
			inv[5]  =  m[0] * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
			inv[9]  = -m[0] * m[9]  * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
			inv[13] =  m[0] * m[9]  * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
			inv[2]  =  m[1] * m[6]  * m[15] - m[1]  * m[7]  * m[14] - m[5]  * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7]  - m[13] * m[3] * m[6];
			inv[6]  = -m[0] * m[6]  * m[15] + m[0]  * m[7]  * m[14] + m[4]  * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7]  + m[12] * m[3] * m[6];
			inv[10] =  m[0] * m[5]  * m[15] - m[0]  * m[7]  * m[13] - m[4]  * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7]  - m[12] * m[3] * m[5];
			inv[14] = -m[0] * m[5]  * m[14] + m[0]  * m[6]  * m[13] + m[4]  * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6]  + m[12] * m[2] * m[5];
			inv[3]  = -m[1] * m[6]  * m[11] + m[1]  * m[7]  * m[10] + m[5]  * m[2] * m[11] - m[5] * m[3] * m[10] - m[9]  * m[2] * m[7]  + m[9]  * m[3] * m[6];
			inv[7]  =  m[0] * m[6]  * m[11] - m[0]  * m[7]  * m[10] - m[4]  * m[2] * m[11] + m[4] * m[3] * m[10] + m[8]  * m[2] * m[7]  - m[8]  * m[3] * m[6];
			inv[11] = -m[0] * m[5]  * m[11] + m[0]  * m[7]  * m[9]  + m[4]  * m[1] * m[11] - m[4] * m[3] * m[9]  - m[8]  * m[1] * m[7]  + m[8]  * m[3] * m[5];
			inv[15] =  m[0] * m[5]  * m[10] - m[0]  * m[6]  * m[9]  - m[4]  * m[1] * m[10] + m[4] * m[2] * m[9]  + m[8]  * m[1] * m[6]  - m[8]  * m[2] * m[5];
			const det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
			if (det == 0) return m4.zero();
			const invDet = 1 / det;
			for(let i=0; i<16; i++) {
				inv[i] *= invDet;
			}
			return inv;
		},
	};
	/* End of m4 */

	if (!Scratch.extensions.unsandboxed) {
		throw new Error("Simple 3D extension must be run unsandboxed");
	}

	const ArgumentType = Scratch.ArgumentType;
	const BlockType = Scratch.BlockType;
	const Cast = Scratch.Cast;
	let   Skin = null;
	const vm = Scratch.vm;
	const renderer = vm.renderer;
	const runtime = vm.runtime;

	let transforms = {
		modelToWorld: m4.identity(),
		worldToView: m4.identity(),
		viewToProjected: m4.identity(),
		import: m4.identity(),
		custom: m4.identity()
	}
	let transformed = [0,0,0,0];
	let selectedTransform = "viewToProjected";
	let colorMultiplier = [1,1,1,1];
	let colorAdder = [0,0,0,0];
	let fogColor = [1,1,1];
	let fogDistance = [10,90];
	let fogEnabled = false;
	let imageSource = null;
	let canvasRenderTarget = null;
	let currentRenderTarget = null;

	const canvas = document.createElement("canvas");
	//document.body.append(canvas);
	//canvas.style.position = "absolute";
	//canvas.style["z-index"] = 99999;
	let gl = canvas.getContext("webgl");
	window.gl = gl; //!!!!!
	gl.enable(gl.DEPTH_TEST);

/*
	const ogl = gl;
	gl = {}
	for(let i in ogl) {
		if(typeof ogl[i] == "function") {
			gl[i] = function(...args) {
				let res = ogl[i](...args);
				if(res === undefined) {
					console.log("gl."+i+"(",...args,")");
				} else {
					console.log("gl."+i+"(",...args,") =>",res);
				}
				return res;
			}
		}
		if(typeof ogl[i] == "number") {
			gl[i] = ogl[i];
		}
	}
	gl.__proto__ = ogl;
*/


	let meshes = new Map();
	class Buffer {
		constructor() {
			this.buffer = gl.createBuffer();
			this.size = 1;
			this.length = 0;
		}
		destroy() {
			gl.deleteBuffer(this.buffer);
		}
	}
	class RenderTarget {
		setAsRenderTarget() {
			currentRenderTarget = this;
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.getFramebuffer());
			this.updateViewport();
			this.updateDepth();
		}
		updateViewport() {
			gl.viewport(0, 0, this.width, this.height);
		}
		updateDepth() {
			if (this.depthTest) {
				gl.enable(gl.DEPTH_TEST);
			} else {
				gl.disable(gl.DEPTH_TEST);
			}
			gl.depthMask(this.depthWrite);
		}
		getAspectRatio() {
			if (this.width == 0) return 1;
			return this.width/this.height;
		}
	}
	class CanvasRenderTarget extends RenderTarget {
		constructor() {
			super();
			this.depthTest = true;
			this.depthWrite = true;
		}
		get width() {
			return canvas.width;
		}
		get height() {
			return canvas.height;
		}
		getFramebuffer() {
			return null;
		}
	}
	class Texture extends RenderTarget {
		constructor() {
			super();
			this.texture = gl.createTexture();
			this.depthTexture = null;
			this.framebuffer = null;
			this.width = 0;
			this.height = 0;
			this.depthTest = false;
			this.depthWrite = false;
			this.wrap = gl.CLAMP_TO_EDGE;
			this.filter = gl.NEAREST;
			this.mipFilter = gl.NEAREST;
			this.mipEnabled = false;
			this.update();
		}
		update() {
			let minFilter = this.filter;
			if (this.mipEnabled) {
				const lookup = [[gl.NEAREST_MIP_NEAREST, gl.NEAREST_MIP_LINEAR], [gl.LINEAR_MIP_NEAREST, gl.LINEAR_MIP_LINEAR]];
				minFilter = lookup[+(this.filter == gl.LINEAR)][+(this.mipFilter == gl.LINEAR)];
			}
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
		}
		isPowerOf2() {
			return ((this.width & (this.width - 1)) == 0) && ((this.height & (this.height - 1)) == 0);
		}
		setTexture(data, width, height, wrap, filter) {
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			if (data instanceof Image) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
			}
			this.width = width;
			this.height = height;
			this.wrap = wrap;
			this.filter = filter;
			if (!this.isPowerOf2()) {
				this.mipEnabled = false;
				this.wrap = gl.CLAMP_TO_EDGE;
			}
			this.update();
			if (this.mipEnabled) {
				gl.generateMipmap(gl.TEXTURE_2D);
			}
			if (this.depthTexture) {
				gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthTexture);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
			}
		}
		getFramebuffer() {
			if (this.framebuffer) return this.framebuffer;
			this.framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
			return this.framebuffer;
		}
		setDepth(test, write) {
			this.depthTest = test;
			this.depthWrite = write;
			if (this.depthTexture == null && write) {
				const framebuffer = this.getFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
				this.depthTexture = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthTexture);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthTexture);
			}
		}
		destroy() {
			gl.deleteTexture(this.texture);
			if (this.depthTexture) gl.deleteRenderbuffer(this.depthTexture);
			if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
		}
	}
	class Mesh {
		constructor(name) {
			this.name = name;
			this.buffers = {};
			this.myBuffers = {};
			this.data = {};
			this.myData = {};
			// texture
			// primitives
			// blending
			// culling
			this.isValid = true;
			this.dependants = new Set();
			this.dependencies = new Set();
		}
		update() {
			const buffers = {};
			const data = {};
			for(const otherMesh of this.dependencies) {
				Object.assign(buffers, otherMesh.buffers);
				Object.assign(data, otherMesh.data);
			}
			this.buffers = Object.assign(buffers, this.myBuffers);
			this.data = Object.assign(data, this.myData);
			for(const otherMesh of this.dependants) {
				otherMesh.update();
			}
		}
		dependsOn(mesh) {
			if (mesh == this) return true;
			for(const otherMesh of this.dependencies) {
				if (otherMesh.dependsOn(mesh)) return true;
			}
			return false;
		}
		destroy() {
			for(let name in this.myBuffers) {
				this.myBuffers[name].destroy();
			}
			this.myData.texture?.destroy();
			for(const otherMesh of this.dependants) {
				otherMesh.dependencies.delete(this.name);
			}
			for(const otherMesh of this.dependants) {
				otherMesh.update();
			}
			//TODO: continue
		}
	}
	canvasRenderTarget = new CanvasRenderTarget();
	currentRenderTarget = canvasRenderTarget;


	let skin = null;
	let skinId = null;
	let drawableId = null;

	// Obtain Skin
	let tempSkin = renderer.createTextSkin("say", "", true);
	Skin = renderer._allSkins[tempSkin].__proto__.__proto__.constructor;
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
			this._nativeSize = renderer.getNativeSize();
			this._rotationCenter = [this._nativeSize[0]/2, this._nativeSize[1]/2];
			renderer.on('NativeSizeChanged', this.onNativeSizeChanged.bind(this));
			const urq = renderer._updateRenderQuality.bind(renderer);
			renderer._updateRenderQuality = (...args) => {
				urq(args);
				this.resizeCanvas();
			}
			this.resizeCanvas();
		}
		dispose() {
			if(this._texture) {
				this._renderer.gl.deleteTexture(this._texture);
				this._texture = null;
			}
			super.dispose();
		}
		get size() {
			return this._nativeSize;
		}
		getTexture(scale) {
			return this._texture || super.getTexture();
		}
		updateContent() {
			const gl = this._renderer.gl;
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, this._texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			this.emitWasAltered();
		}
		resizeCanvas() {
			if (renderer.useHighQualityRender) {
				canvas.width  = renderer.canvas.width;
				canvas.height = renderer.canvas.height;
			} else {
				canvas.width  = this._nativeSize[0];
				canvas.height = this._nativeSize[1];
			}
			if (currentRenderTarget == canvasRenderTarget) currentRenderTarget.updateViewport();
			this.updateContent();
		}
		onNativeSizeChanged(event) {
			this._nativeSize = event.newSize;
			this._rotationCenter = [this._nativeSize[0]/2, this._nativeSize[1]/2];
			this.resizeCanvas();
		}
	}

	// Register new drawable group "simple3D"
	let index = renderer._groupOrdering.indexOf("video");
	let copy = renderer._groupOrdering.slice();
	copy.splice(index, 0, "simple3D");
	renderer.setLayerGroupOrdering(copy);


	// Create drawable and skin
	skinId = renderer._nextSkinId++;
	renderer._allSkins[skinId] = skin = new SimpleSkin(skinId, renderer);
	drawableId = renderer.createDrawable("simple3D");
	renderer.updateDrawableSkinId(drawableId, skinId);
	redraw();

	const drawOriginal = renderer.draw;
	renderer.draw = function() {
		if(this.dirty) redraw();
		drawOriginal.call(this);
	}

	function redraw() {
		skin.updateContent(canvas);
		runtime.requestRedraw();
	}



	const vshSrc = `
precision mediump float;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_uv;
#ifdef SKINNING
#if SKINNING == 1
attribute float a_index;
#elif SKINNING == 2
attribute vec2 a_index;
attribute vec2 a_weight;
#elif SKINNING == 3
attribute vec3 a_index;
attribute vec3 a_weight;
#elif SKINNING == 4
attribute vec4 a_index;
attribute vec4 a_weight;
#endif
#endif

varying vec4 v_color;
varying vec2 v_uv;
varying vec3 v_viewpos;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
#ifdef BONE_COUNT
uniform mat4 u_bones[BONE_COUNT];
#endif

void main() {
	vec4 pos = a_position;
#ifdef SKINNING
#if SKINNING == 1
	pos = u_bones[int(a_index)] * a_position;
#elif SKINNING == 2
	pos = u_bones[int(a_index.x)] * a_position * a_weight.x +
	      u_bones[int(a_index.y)] * a_position * a_weight.y;
#elif SKINNING == 3
	pos = u_bones[int(a_index.x)] * a_position * a_weight.x +
	      u_bones[int(a_index.y)] * a_position * a_weight.y +
	      u_bones[int(a_index.z)] * a_position * a_weight.z;
#elif SKINNING == 4
	pos = u_bones[int(a_index.x)] * a_position * a_weight.x +
	      u_bones[int(a_index.y)] * a_position * a_weight.y +
	      u_bones[int(a_index.z)] * a_position * a_weight.z +
	      u_bones[int(a_index.w)] * a_position * a_weight.w;
#endif
#endif
	vec4 view = u_view * u_model * pos;
	gl_Position = u_projection * view;
	v_color = a_color;
	v_uv = a_uv;
	v_viewpos = view.xyz;

}
`;

	const fshSrc = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_uv;
varying vec3 v_viewpos;

uniform sampler2D u_texture;
uniform vec4 u_color_mul;
uniform vec4 u_color_add;
uniform vec3 u_fog_color;
uniform vec2 u_fog_dist;

void main() {
#ifdef TEXTURES
	vec4 color = texture2D(u_texture, v_uv);
#else
	vec4 color = vec4(1);
#endif
	color = color * v_color;
	color = color * u_color_mul + u_color_add;
#ifdef FOG
	float fog = (length(v_viewpos) - u_fog_dist.x) / u_fog_dist.y;
	color = mix(color, vec4(u_fog_color, 1), clamp(fog, 0.0, 1.0));
#endif
	gl_FragColor = color;
}
`;
	function compileProgram(flags) {
		console.log("Compiling program with flags:", flags);
		const defines = flags.map(flag => `#define ${flag}\n`).join("");
		const vsh = gl.createShader(gl.VERTEX_SHADER);
		const fsh = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(vsh, defines + vshSrc);
		gl.shaderSource(fsh, defines + fshSrc);
		gl.compileShader(vsh);
		gl.compileShader(fsh);
		const program = gl.createProgram();
		gl.attachShader(program, vsh);
		gl.attachShader(program, fsh);
		gl.linkProgram(program);
		const success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!success) {
			console.log("Shader error:");
			console.log(gl.getShaderInfoLog(vsh));
			console.log(gl.getShaderInfoLog(fsh));
			console.log(gl.getProgramInfoLog(program));
		}
		gl.deleteShader(vsh);
		gl.deleteShader(fsh);
		if (!success) return {};
		gl.useProgram(program);
		const aloc = {};
		const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for(let i = 0; i < numAttribs; i++) {
			const info = gl.getActiveAttrib(program, i);
			aloc[info.name.split("[")[0]] = gl.getAttribLocation(program, info.name);
		}
		const uloc = {};
		const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for(let i = 0; i < numUniforms; i++) {
			const info = gl.getActiveUniform(program, i);
			uloc[info.name.split("[")[0]] = gl.getUniformLocation(program, info.name);
		}
		return {program, aloc, uloc}
	}

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	let image = new Image();
	image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVQTuIOmSoThZERR21CkWoEGqFVh1MLv0QmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQq3ENKttFNB020wl4mImuyKGXiFgAD2Ygigzy5iVpCR8x9c9Any9i/Es/3N/ji41ZzEgIBLPMMO0ideJJzdtg/M+cYQVZZX4nHjEpAsSP3Jd8fiNc8FlgWdGzHRqjjhCLBZaWGlhVjQ14gniqKrplC9kPFY5b3HWShXWuCd/YTinLy9xneYgEljAIiSIUFDBBkqwEaNVJ8VCivbjPv5+1y+RSyHXBhg55lGGBtn1g//B726t/PiYlxSOA+0vjvMxBIR2gXrVcb6PHad+AgSfgSu96S/XgOlP0qtNLXoEdG8DF9dNTdkDLneAvidDNmVXCtIU8nng/Yy+KQv03gKdq15vjX2cPgBp6ip5AxwcAsMFyl7zeXdHa2//nmn09wO7fHLEriaHDAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+UCGxQSKCHrcOoAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAABy0lEQVQoz11STWvbQBAdRx/udmmQ6MRgYRQaMBSZnAQ+FV3yj/IP8td0NPgYXYwO8kEk6VDhpLMrLCXKYRIl7R6W3Z03s++9mcnV1a80XVl7BACl/O32FjE8P48AwNrjwwNZ2zJbwSjlOxcXcdf1zAYxqKramNaY9vHxL7NlNoJGDMtyH8dza48nWbYmaoiaqqqJGsQQMWS2RI2gk2SZJEt4X87l5c84nkfRrCz3WbaeTE4QgzAMhmE4HJ7SdBUEp0TNMAxluT87++4q5QtXAGBmuSrlEzWftUl5pXxnsYiYzRj2PKfvn+v63pi263qtv/b9s+c5d3e/u67vut4laiRbilVVDQCSv93evodaZptl6zzfTG5urgEgzzdaK6W+SP6osih2WqvR1jfRw/ASRTPxNE1Xy+WPYXgJglNj2jieV1WNGE6nU9Hwj+ixjOxyQAyJmtkMBeksFhHRn8PhCTEMgm+e54hLAOB5Tl3fC0lxGTH4EC2HsdI4FNLZotgJzM2ytXRAa53nG/EEAJitkJT2p+lKRsFlZuGqtf5sZZIshZhSflHsxt/csZdEzSh91C3chK3Wiqh5cwkAJPDfOMhjlq2Z2dpjUexeAX32b6d+O+QBAAAAAElFTkSuQmCC";
	image.onload = function() {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	}

	class ProgramManager {
		constructor() {
			this.programs = {};
		}
		get(flags) {
			const key = flags.join("-");
			let program = this.programs[key]
			if (program) return program;
			program = compileProgram(flags)
			this.programs[key] = program;
			return program;
		}
	}
	const programs = new ProgramManager();

	function compact(target, names, typedArray, scale=1) {
		const lists = names.map(name => target.lookupVariableByNameAndType(name, "list"));
		if (lists.includes(null)) return null;
		const targetLength = lists[0].value.length;
		const listCount = lists.length;
		if (lists.find(list => list.value.length !== targetLength)) return null;
		const value = new typedArray(targetLength * listCount);
		if (scale !== 1) {
			for(let i=0, j=0; i<targetLength; i++) {
				for(let k=0; k<listCount; k++) {
					value[j++] = Cast.toNumber(lists[k].value[i]) * scale;
				}
			}
		} else {
			for(let i=0, j=0; i<targetLength; i++) {
				for(let k=0; k<listCount; k++) {
					value[j++] = Cast.toNumber(lists[k].value[i]);
				}
			}
		}
		return value;
	}

	let definitions = [
/*		{
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
		"---",*/
		{
			opcode: "resetEverything",
			blockType: BlockType.COMMAND,
			text: "reset everything",
			def: function() {
				//TODO
			}
		},
		"---",
		{
			opcode: "clear",
			blockType: BlockType.COMMAND,
			text: "clear [LAYERS]",
			arguments: {
				LAYERS: {
					type: ArgumentType.STRING,
					menu: "clearLayers",
					defaultValue: ""+(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
				},
			},
			def: function({LAYERS}) {
				gl.clear(Cast.toNumber(LAYERS));
				renderer.dirty = true;   //TODO: only if canvas (framebuffer is null)
				runtime.requestRedraw(); //TODO
			}
		},
		{
			opcode: "clearColor",
			blockType: BlockType.COMMAND,
			text: "set clear color R: [RED] G: [GREEN] B: [BLUE] A: [ALPHA]",
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
			def: function({RED, GREEN, BLUE, ALPHA}) {
				gl.clearColor(Cast.toNumber(RED), Cast.toNumber(GREEN), Cast.toNumber(BLUE), Cast.toNumber(ALPHA));
			}
		},
		{
			opcode: "depth",
			blockType: BlockType.COMMAND,
			text: "depth test [TEST] write [WRITE]",
			arguments: {
				TEST: {
					type: ArgumentType.STRING,
					defaultValue: "true",
					menu: "onOff"
				},
				WRITE: {
					type: ArgumentType.STRING,
					defaultValue: "true",
					menu: "onOff"
				},
			},
			def: function({TEST, WRITE}) {
				currentRenderTarget.setDepth(Cast.toBoolean(TEST), Cast.toBoolean(WRITE));
				currentRenderTarget.updateDepth();
			}
		},
		{
			blockType: BlockType.LABEL,
			text: "Meshes",
		},
		{
			opcode: "allMeshes",
			blockType: BlockType.REPORTER,
			text: "all meshes",
			disableMonitor: true,
			def: function() {
				return Array.from(meshes.keys()).join(" ");
			}
		},
		{
			opcode: "createMesh",
			blockType: BlockType.COMMAND,
			text: "create mesh [NAME]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
			},
			def: function({NAME}) {
				NAME = Cast.toString(NAME);
				if (NAME.length == 0) return;
				meshes.get(NAME)?.destroy();
				meshes.set(NAME, new Mesh(NAME));
			}
		},
		{
			opcode: "deleteMesh",
			blockType: BlockType.COMMAND,
			text: "delete mesh [NAME]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
			},
			def: function({NAME}) {
				NAME = Cast.toString(NAME);
				meshes.get(NAME)?.destroy();
				meshes.delete(NAME);
			}
		},
		{
			opcode: "inheritMeshes",
			blockType: BlockType.COMMAND,
			text: "make [NAME] inherit from meshes [NAMES]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh 3"
				},
				NAMES: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh 1,my mesh 2"
				},
			},
			def: function({NAME, NAMES}) {
				const mesh = meshes.get(Cast.toString(NAME));
				if (!mesh) return;
				const parentMeshes = Cast.toString(NAMES).split(",").map(s => meshes.get(s.trim())).filter(m => m);
				for(let otherMesh of parentMeshes) {
					if (otherMesh.dependsOn(mesh)) return;
				}
				mesh.dependencies = parentMeshes;
				for(let otherMesh of parentMeshes) {
					otherMesh.dependants.add(mesh);
				}
				mesh.update();
			}
		},
		{
			opcode: "meshInfo",
			blockType: BlockType.REPORTER,
			text: "mesh [NAME] [PROP]",
			arguments: {
				PROP: {
					type: ArgumentType.STRING,
					menu: "meshProperties"
				},
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
			},
			def: function({NAME, PROP}) {
				const mesh = meshes.get(Cast.toString(NAME));
				if (!mesh) return;
				if (PROP == "inherits from") {
					return Array.from(mesh.dependencies).map(m => m.name).join(",");
				}
				if (PROP == "is inherited by") {
					return Array.from(mesh.dependants).map(m => m.name).join(",");
				}
			}
		},
		"---",
		{
			opcode: "setMeshIndices",
			blockType: BlockType.COMMAND,
			text: "set [NAME] vertex indices [INDICES]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				INDICES: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, X, Y}, {target}) {
				//TODO
			}
		},
		{
			opcode: "setMeshPositionsXY",
			blockType: BlockType.COMMAND,
			text: "set [NAME] positions XY [X] [Y]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				X: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				Y: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				Z: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, X, Y}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const value = compact(target, [X, Y], Float32Array);
				if (!mesh || !value) return;
				const buffer = mesh.myBuffers.position ?? (mesh.myBuffers.position = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
				buffer.size = 2;
				buffer.length = value.length / 2;
				mesh.update();
			}
		},
		{
			opcode: "setMeshPositionsXYZ",
			blockType: BlockType.COMMAND,
			text: "set [NAME] positions XYZ [X] [Y] [Z]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				X: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				Y: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				Z: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, X, Y, Z}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const value = compact(target, [X, Y, Z], Float32Array);
				if (!mesh || !value) return;
				const buffer = mesh.myBuffers.position ?? (mesh.myBuffers.position = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
				buffer.size = 3;
				buffer.length = value.length / 3;
				mesh.update();
			}
		},
		{
			opcode: "setMeshColorsRGB",
			blockType: BlockType.COMMAND,
			text: "set [NAME] colors RGB [R] [G] [B]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				R: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				G: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				B: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, R, G, B}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const value = compact(target, [R, G, B], Uint8Array);
				if (!mesh || !value) return;
				const buffer = mesh.myBuffers.colors ?? (mesh.myBuffers.colors = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
				buffer.size = 3;
				buffer.length = value.length / 3;
				mesh.update();
			}
		},
		{
			opcode: "setMeshColorsRGBA",
			blockType: BlockType.COMMAND,
			text: "set [NAME] colors RGBA [R] [G] [B] [A]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				R: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				G: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				B: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				A: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, R, G, B, A}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const value = compact(target, [R, G, B, A], Uint8Array);
				if (!mesh || !value) return;
				const buffer = mesh.myBuffers.colors ?? (mesh.myBuffers.colors = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
				buffer.size = 4;
				buffer.length = value.length / 4;
				mesh.update();

			}
		},
		{
			opcode: "setMeshTexCoordUV",
			blockType: BlockType.COMMAND,
			text: "set [NAME] texture coordinates UV [U] [V]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				U: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				V: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, U, V}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const value = compact(target, [U, V], Float32Array);
				if (!mesh || !value) return;
				const buffer = mesh.myBuffers.texCoords ?? (mesh.myBuffers.texCoords = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
				buffer.size = 2;
				buffer.length = value.length / 2;
				mesh.update();
			}
		},
		{
			opcode: "setMeshTexture",
			blockType: BlockType.COMMAND,
			text: "set [NAME] texture [TEXTURE] [WRAP] [FILTER]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				TEXTURE: {
					type: ArgumentType.EMPTY,
				},
				WRAP: {
					type: ArgumentType.STRING,
					menu: "textureWrap"
				},
				FILTER: {
					type: ArgumentType.STRING,
					menu: "textureFilter"
				},
			},
			def: function({NAME, TEXTURE, WRAP, FILTER}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				if (!mesh) return;
				const texture = Cast.toString(TEXTURE);
				const wrap = Cast.toString(WRAP) == "repeat" ? gl.REPEAT : gl.CLAMP_TO_EDGE;
				const filter = Cast.toString(FILTER) == "blurred" ? gl.LINEAR : gl.NEAREST;
				let textureObj = mesh.data.texture ?? (mesh.myData.texture = new Texture());
				mesh.update();
				(async function() {
					let data = await imageSource;
					if (data == null || mesh.destroyed) return;
					textureObj.setTexture(data.data, data.width, data.height, wrap, filter);
				})();
			}
/*
				const mesh = meshes.get(Cast.toString(NAME));
				const texture = Cast.toString(TEXTURE);
				const textureDivider = texture.indexOf(":");
				const textureType = texture.substring(0, textureDivider);
				const textureName = texture.substring(textureDivider+1);
				const wrap = Cast.toString(WRAP) == "repeat" ? gl.REPEAT : gl.CLAMP_TO_EDGE;
				const filter = Cast.toString(FILTER) == "blurred" ? gl.LINEAR : gl.NEAREST;
				let textureObj = null;
				switch (textureType) {
					case "costume":
						break;
					case "rendertarget":
						const rendertarget = rendertargets.get(textureName);
						if (!rendertarget) break;
						if (mesh.myTexture instanceof Texture) {
							mesh.myTexture.destroy();
						}
						mesh.myTexture = rendertarget.texture;
						break;
					case "list":
						textureObj = mesh.myTexture ?? (mesh.myTexture = new Texture());
						mesh.update();

						const list = target.lookupVariableByNameAndType(textureName, "list");
						if (!list) break;
						const values = list.value.map(Cast.toNumber);
						const width = values[0];
						const height = values[1];
						if (width * height * 4 + 2 !== values.length) break;
						textureObj.setTexture(new Uint8Array(values.slice(2)), width, height, wrap, filter);
						break;
					case "data":
					case "http":
					case "https":
						textureObj = mesh.myTexture ?? (mesh.myTexture = new Texture());
						mesh.update();

						Scratch.canFetch(texture).then((result) => {
							if (!result) return;
							const img = new Image();
							if ((new URL(texture, window.location.href)).origin !== window.location.origin) {
								img.crossOrigin = "";
							}
							img.src = texture;
							img.onload = function() {
								const width = textureObj.width = Math.ceil(img.width);
								const height = textureObj.height = Math.ceil(img.height);
								textureObj.setTexture(img, width, height, wrap, filter);
							}
						}).catch(() => {});
						break;
					default:
						return;
				}
			}

*/

		},
		{
			opcode: "setMeshTexCoordUVW",
			blockType: BlockType.COMMAND,
			text: "set [NAME] cube texture coordinates UVW [U] [V] [W]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				U: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				V: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				W: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, U, V, W}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const value = compact(target, [U, V, W], Float32Array);
				if (!mesh || !value) return;
				const buffer = mesh.myBuffers.texCoords ?? (mesh.myBuffers.texCoords = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
				buffer.size = 3;
				buffer.length = value.length / 3;
				mesh.update();
			}
		},
		{
			opcode: "setMeshCubeTexture",
			blockType: BlockType.COMMAND,
			text: "set [NAME] cube texture [SIDE] [TEXTURE] [WRAP] [FILTER]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				SIDE: {
					type: ArgumentType.STRING,
					menu: "cubeSide"
				},
				TEXTURE: {
					type: ArgumentType.EMPTY,
				},
				WRAP: {
					type: ArgumentType.STRING,
					menu: "textureWrap"
				},
				FILTER: {
					type: ArgumentType.STRING,
					menu: "textureFilter"
				},
			},
			def: function({NAME, SIDE, TEXTURE, WRAP, FILTER}, {target}) {
			}
		},
		{
			opcode: "setMeshTextureMipmap",
			blockType: BlockType.COMMAND,
			text: "set [NAME] texture mipmapping [MIPMAPPING]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				MIPMAPPING: {
					type: ArgumentType.STRING,
					menu: "textureMipmapping"
				},
			},
			def: function({NAME, TEXTURE, WRAP, FILTER}, {target}) {
				//TODO
			}
		},
		{
			opcode: "setMeshTexCoordOffsetUV",
			blockType: BlockType.COMMAND,
			text: "set [NAME] texture coordinate offset UV [U] [V]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				U: {
					type: ArgumentType.NUMBER,
				},
				V: {
					type: ArgumentType.NUMBER,
				},
			},
			def: function({NAME, U, V}, {target}) {
				//TODO
			}
		},
		{
			opcode: "setMeshWeights",
			blockType: BlockType.COMMAND,
			text: "set [NAME] bone indices [INDICES] weights [WEIGHTS] count per vertex [COUNT]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				INDICES: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				WEIGHTS: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				COUNT: {
					type: ArgumentType.NUMBER,
					defaultValue: 3
				},
			},
			def: function({NAME, INDICES, WEIGHTS, COUNT}, {target}) {
				COUNT = Cast.toNumber(COUNT) | 0;
				if (COUNT < 1 || COUNT > 4) return;
				const mesh = meshes.get(Cast.toString(NAME));
				let valueI = compact(target, [INDICES], Uint8Array), valueW;
				if (!mesh || !valueI || valueI.length % COUNT > 0) return;
				if (COUNT > 1) {
					valueW = compact(target, [WEIGHTS], Uint16Array, 65535);
					if (!valueW || valueW.length % COUNT > 0 || valueW.length !== valueI.length) return;
				}
				const bufferI = mesh.myBuffers.boneIndices ?? (mesh.myBuffers.boneIndices = new Buffer());
				gl.bindBuffer(gl.ARRAY_BUFFER, bufferI.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, valueI, gl.STATIC_DRAW);
				bufferI.size = COUNT;
				bufferI.length = valueI.length / COUNT;
				if (COUNT > 1) {
					const bufferW = mesh.myBuffers.boneWeights ?? (mesh.myBuffers.boneWeights = new Buffer());
					gl.bindBuffer(gl.ARRAY_BUFFER, bufferW.buffer);
					gl.bufferData(gl.ARRAY_BUFFER, valueW, gl.STATIC_DRAW);
					bufferW.size = COUNT;
					bufferW.length = valueW.length / COUNT;
				}
				mesh.update();
			}
		},
		{
			opcode: "setMeshTransforms",
			blockType: BlockType.COMMAND,
			text: "set [NAME] [TRANSFORMS] transforms [MATRIXES]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				TRANSFORMS: {
					type: ArgumentType.STRING,
					menu: "skinningTransforms"
				},
				MATRIXES: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME, TRANSFORMS, MATRIXES}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const list = target.lookupVariableByNameAndType(Cast.toString(MATRIXES), "list");
				if (!mesh || !list) return;
				const value = list.value.map(Cast.toNumber);
				const value2 = [];
				for(let i=0; i<value.length; i+=16) {
					value2.push(value.slice(i,i+16));
				}
				if (TRANSFORMS == "original" || !mesh.bonesOrig || mesh.bonesOrig.length !== value2.length) mesh.bonesOrig = value2.map(m4.inverse);
				if (TRANSFORMS == "current" || !mesh.bonesCurr || mesh.bonesCurr.length !== value2.length) mesh.bonesCurr = value2;
				const diff = [];
				for(let i=0; i<mesh.bonesCurr.length; i++) {
					diff.push(m4.multiply(mesh.bonesCurr[i], mesh.bonesOrig[i]));
				}
				mesh.bonesDiff = diff.flat();
				mesh.update();
			}
		},
		{
			opcode: "setMeshFromFile",
			blockType: BlockType.COMMAND,
			text: "set [NAME] from [FILETYPE] [LIST]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				FILETYPE: {
					type: ArgumentType.STRING,
					menu: "filetype"
				},
				LIST: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
			},
			def: function({NAME}, {target}) {
				//TODO
			}
		},
		{
			opcode: "setMeshPrimitives",
			blockType: BlockType.COMMAND,
			text: "set [NAME] primitives [PRIMITIVES]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				PRIMITIVES: {
					type: ArgumentType.STRING,
					menu: "primitives"
				},
			},
			def: function({NAME, PRIMITIVES}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const primitives = Cast.toNumber(PRIMITIVES);
				if (!mesh) return;
				mesh.data.primitives = primitives;
				mesh.update();
			}
		},
		{
			opcode: "setMeshBlending",
			blockType: BlockType.COMMAND,
			text: "set [NAME] blending [BLENDING]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				BLENDING: {
					type: ArgumentType.STRING,
					menu: "blending",
					defaultValue: "default"
				},
			},
			def: function({NAME, BLENDING}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const blending = Cast.toNumber(BLENDING);
				if (!mesh) return;
				mesh.data.blending = blending;
				mesh.update();
			}
		},
		{
			opcode: "setMeshCulling",
			blockType: BlockType.COMMAND,
			text: "set [NAME] cull [CULLING]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				CULLING: {
					type: ArgumentType.STRING,
					menu: "culling"
				},
			},
			def: function({NAME, CULLING}, {target}) {
				const mesh = meshes.get(Cast.toString(NAME));
				const culling = Cast.toNumber(CULLING);
				if (!mesh) return;
				mesh.data.culling = culling;
				mesh.update();
			}
		},
		{
			opcode: "setMeshTransparency",
			blockType: BlockType.COMMAND,
			text: "set [NAME] transparent pixel handling [ALPHATEST]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
				ALPHATEST: {
					type: ArgumentType.STRING,
					menu: "alphaTest"
				},
			},
			def: function({NAME, CULLING}, {target}) {
			}
		},
		{
			opcode: "drawMesh",
			blockType: BlockType.COMMAND,
			text: "draw mesh [NAME]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
			},
			def: function({NAME}, util) {
				NAME = Cast.toString(NAME);
				const mesh = meshes.get(NAME);
				if (!mesh || !mesh.isValid) return;

				// TODO: optimize
				let length = -1;
				for(const name in mesh.buffers) {
					if (length == -1) length = mesh.buffers[name].length;
					else if (length !== mesh.buffers[name].length) return;
				}

				let flags = [];
				if (mesh.buffers.texCoords) flags.push("TEXTURES");
				if (fogEnabled) flags.push("FOG");
				if (mesh.buffers.boneIndices && mesh.bonesDiff) {
					flags.push(`SKINNING ${mesh.buffers.boneIndices.size}`);
					flags.push(`BONE_COUNT ${mesh.bonesDiff.length/16}`);
				}
				const program = programs.get(flags);
				gl.useProgram(program.program);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.position.buffer);
				gl.enableVertexAttribArray(program.aloc.a_position);
				gl.vertexAttribPointer(program.aloc.a_position, mesh.buffers.position.size, gl.FLOAT, false, 0, 0);

				if (mesh.buffers.colors) {
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.colors.buffer);
					gl.enableVertexAttribArray(program.aloc.a_color);
					gl.vertexAttribPointer(program.aloc.a_color, mesh.buffers.colors.size, gl.UNSIGNED_BYTE, true, 0, 0);
				} else {
					gl.disableVertexAttribArray(program.aloc.a_color);
					gl.vertexAttrib4f(program.aloc.a_color, 1,1,1,1);
				}

				if (mesh.buffers.texCoords) {
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.texCoords.buffer);
					gl.enableVertexAttribArray(program.aloc.a_uv);
					gl.vertexAttribPointer(program.aloc.a_uv, mesh.buffers.texCoords.size, gl.FLOAT, false, 0, 0);
				}

				if (mesh.buffers.boneIndices) {
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.boneIndices.buffer);
					gl.enableVertexAttribArray(program.aloc.a_index);
					gl.vertexAttribPointer(program.aloc.a_index, mesh.buffers.boneIndices.size, gl.BYTE, false, 0, 0);
				}

				if (mesh.buffers.boneWeights) {
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.boneWeights.buffer);
					gl.enableVertexAttribArray(program.aloc.a_weight);
					gl.vertexAttribPointer(program.aloc.a_weight, mesh.buffers.boneWeights.size, gl.UNSIGNED_SHORT, true, 0, 0);
				}

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, mesh.data.texture?.texture ?? texture);

				gl.uniform1i(program.uloc.u_texture, 0);

				gl.uniform4fv(program.uloc.u_color_mul, colorMultiplier);
				gl.uniform4fv(program.uloc.u_color_add, colorAdder);
				gl.uniform3fv(program.uloc.u_fog_color, fogColor);
				gl.uniform2fv(program.uloc.u_fog_dist, fogDistance);

				if (mesh.bonesDiff) {
					gl.uniformMatrix4fv(program.uloc.u_bones, false, mesh.bonesDiff);
				}

				gl.uniformMatrix4fv(program.uloc.u_projection, false, transforms.viewToProjected);
				gl.uniformMatrix4fv(program.uloc.u_view, false, transforms.worldToView);
				gl.uniformMatrix4fv(program.uloc.u_model, false, transforms.modelToWorld);

				gl.drawArrays(mesh.data.primitives ?? gl.TRIANGLES, 0, length);
				renderer.dirty = true;   //TODO: only if canvas (framebuffer is null)
				runtime.requestRedraw(); //TODO

				if (mesh.buffers.texCoords) {
					gl.disableVertexAttribArray(program.aloc.a_uv);
				}
				if (mesh.buffers.boneIndices) {
					gl.disableVertexAttribArray(program.aloc.a_index);
				}
				if (mesh.buffers.boneWeights) {
					gl.disableVertexAttribArray(program.aloc.a_weight);
				}
			}
		},
		{
			blockType: BlockType.LABEL,
			text: "Textures"
		},
		{
			opcode: "textureFromUrl",
			blockType: BlockType.REPORTER,
			text: "texture from URL [TEXURL]",
			disableMonitor: true,
			arguments: {
				TEXURL: {
					type: ArgumentType.STRING,
					defaultValue: "https://extensions.turbowarp.org/dango.png"
				},
			},
			def: function({TEXURL}, {target}) {
				imageSource = new Promise((resolve, reject) => {
					Scratch.canFetch(TEXURL).then((result) => {
						if (!result) return;
						const img = new Image();
						if ((new URL(TEXURL, window.location.href)).origin !== window.location.origin) {
							img.crossOrigin = "";
						}
						img.src = TEXURL;
						img.onload = function() {
							resolve({
								width: img.width,
								height: img.height,
								data: img
							});
						}
						img.onerror = function() {
							resolve(null);
						}
					}).catch(() => {});
				});
				return "[texture data]";
			}
		},
		{
			opcode: "textureFromCostume",
			blockType: BlockType.REPORTER,
			text: "texture from costume [NAME]",
			disableMonitor: true,
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					menu: "costumes"
				},
			},
			def: function({NAME}, {target}) {
				//TODO
			}
		},
		{
			opcode: "textureFromList",
			blockType: BlockType.REPORTER,
			text: "texture from list [NAME] at [POS] of size [WIDTH] [HEIGHT]",
			disableMonitor: true,
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				POS: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
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
			def: function({NAME, POS, WIDTH, HEIGHT}, {target}) {
				let retStatus = "[texture data]";
				imageSource = new Promise((resolve, reject) => {
					const width = Cast.toNumber(WIDTH);
					const height = Cast.toNumber(HEIGHT);
					const listName = Cast.toString(NAME);
					const lengthRequired = width * height * 4;
					if (width < 1 || height < 1 || !Number.isFinite(width) || !Number.isFinite(height)) {
						retStatus = "invalid texture size";
						resolve(null);
						return;
					}
					const list = target.lookupVariableByNameAndType(listName, "list");
					if (!list) {
						retStatus = "list not found";
						resolve(null);
						return;
					};
					const pos = Cast.toNumber(POS) - 1;
					if (!Number.isFinite(pos) || pos < 0) {
						retStatus = "invalid position";
						resolve(null);
						return;
					}
					if (list.value.length < pos+lengthRequired) {
						retStatus = "insufficient list length";
						resolve(null);
						return;
					}
					const values = list.value.slice(pos, pos+lengthRequired).map(Cast.toNumber);
					resolve({
						width: width,
						height: height,
						data: new Uint8Array(values)
					});
				});
				return retStatus;
			}
		},
		{
			opcode: "textureFromSize",
			blockType: BlockType.REPORTER,
			text: "texture of size [WIDTH] [HEIGHT]",
			disableMonitor: true,
			arguments: {
				WIDTH: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
				HEIGHT: {
					type: ArgumentType.NUMBER,
					defaultValue: 16
				},
			},
			def: function({WIDTH, HEIGHT}, {target}) {
				let retStatus = "[texture data]";
				imageSource = new Promise((resolve, reject) => {
					const width = Cast.toNumber(WIDTH);
					const height = Cast.toNumber(HEIGHT);
					const lengthRequired = width * height * 4;
					if (width < 1 || height < 1 || !Number.isFinite(width) || !Number.isFinite(height)) {
						retStatus = "invalid texture size";
						resolve(null);
						return;
					}
					resolve({
						width: width,
						height: height,
						data: null
					});
				});
				return retStatus;
			}
		},
		{
			opcode: "textureFromStageSize",
			blockType: BlockType.REPORTER,
			text: "texture of stage size",
			disableMonitor: true,
			def: function() {
				//TODO
			}
		},
		{
			blockType: BlockType.LABEL,
			text: "View transformations"
		},
		{
			opcode: "matSelect",
			blockType: BlockType.COMMAND,
			text: "configure [TRANSFORM] transformation",
			arguments: {
				TRANSFORM: {
					type: ArgumentType.STRING,
					menu: "renderTransforms"
				},
			},
			def: function({TRANSFORM}, {target}) {
				if (transforms[TRANSFORM]) {
					selectedTransform = TRANSFORM;
				}
			}
		},
		{
			opcode: "matStartWithPerspective",
			blockType: BlockType.COMMAND,
			text: "start with perspective FOV [FOV] near [NEAR] far [FAR]",
			arguments: {
				FOV: {
					type: ArgumentType.NUMBER,
					defaultValue: 90
				},
				NEAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 0.01
				},
				FAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 1000
				},
			},
			def: function({FOV, NEAR, FAR}) {
				transforms[selectedTransform] = m4.perspective(
					Cast.toNumber(FOV) / 180 * Math.PI,
					currentRenderTarget.getAspectRatio(),
					Cast.toNumber(NEAR),
					Cast.toNumber(FAR),
				);
			}
		},
		{
			opcode: "matStartWithOrthographic",
			blockType: BlockType.COMMAND,
			text: "start with orthographic near [NEAR] far [FAR]",
			arguments: {
				NEAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 0.01
				},
				FAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 1000
				},
			},
			def: function({NEAR, FAR}) {
				transforms[selectedTransform] = m4.orthographic(
					480/360, //TODO
					Cast.toNumber(NEAR),
					Cast.toNumber(FAR),
				);
			}
		},
		{
			opcode: "matStartWithIdentity",
			blockType: BlockType.COMMAND,
			text: "start with no transformation",
			def: function() {
				transforms[selectedTransform] = m4.identity();
			}
		},
		{
			opcode: "matStartWithSavedIn",
			blockType: BlockType.COMMAND,
			text: "start with saved in [SRCLIST] at [POS]",
			arguments: {
				SRCLIST: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				POS: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
			},
			def: function({SRCLIST, POS}, {target}) {
				const pos = Cast.toNumber(POS);
				const list = target.lookupVariableByNameAndType(Cast.toString(SRCLIST), "list");
				if (!list) return;
				if (pos < 1 || !Number.isFinite(pos)) return;

				transforms[selectedTransform] = list.value.slice(pos-1, pos+15).map(Cast.toNumber);
			}
		},
		{
			opcode: "matMove",
			blockType: BlockType.COMMAND,
			text: "move X [X] Y [Y] Z [Z]",
			arguments: {
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
			def: function({X, Y, Z}, {target}) {
				transforms[selectedTransform] = m4.translate(
					transforms[selectedTransform],
					Cast.toNumber(X),
					Cast.toNumber(Y),
					Cast.toNumber(Z)
				);
			}
		},
		{
			opcode: "matRotate",
			blockType: BlockType.COMMAND,
			text: "rotate around [AXIS] by [ANGLE] degrees",
			arguments: {
				AXIS: {
					type: ArgumentType.STRING,
					menu: "axis"
				},
				ANGLE: {
					type: ArgumentType.ANGLE,
				},
			},
			def: function({AXIS, ANGLE}, {target}) {
				let fn;
				if (AXIS == "X") fn = m4.xRotate;
				if (AXIS == "Y") fn = m4.yRotate;
				if (AXIS == "Z") fn = m4.zRotate;
				if (!fn) return;
				transforms[selectedTransform] = fn(
					transforms[selectedTransform],
					Cast.toNumber(ANGLE) / 180 * Math.PI
				);
			}
		},
		{
			opcode: "matScale",
			blockType: BlockType.COMMAND,
			text: "scale X [X] Y [Y] Z [Z]",
			arguments: {
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
			def: function({X, Y, Z}, {target}) {
				transforms[selectedTransform] = m4.scale(
					transforms[selectedTransform],
					Cast.toNumber(X),
					Cast.toNumber(Y),
					Cast.toNumber(Z)
				);
			}
		},
		{
			opcode: "matWrapper",
			blockType: BlockType.CONDITIONAL,
			text: "wrapper",
			def: function({}, util) {
				if (util.stackFrame.undoWrapper) {
					util.stackFrame.undoWrapper = false;
					transforms = util.stackFrame.mat3Dstack.pop();
				} else {
					util.stackFrame.undoWrapper = true;
					if (!util.stackFrame.mat3Dstack) util.stackFrame.mat3Dstack = [];
					util.stackFrame.mat3Dstack.push(Object.assign({}, transforms));
					util.startBranch(1, true);
				}
			}
		},
		{
			opcode: "matSaveInto",
			blockType: BlockType.COMMAND,
			text: "save into [DSTLIST] at [POS]",
			arguments: {
				DSTLIST: {
					type: ArgumentType.STRING,
					menu: "lists"
				},
				POS: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
			},
			def: function({DSTLIST, POS}, {target}) {
				const pos = Cast.toNumber(POS) - 1;
				const list = target.lookupVariableByNameAndType(Cast.toString(DSTLIST), "list");
				if (!list) return;
				if (pos < 0 || !Number.isFinite(pos)) return;

				const value = list.value;
				const mat = transforms[selectedTransform];
				while (value.length < pos+15) {
					value.push(0);
				}
				for(let i=0; i<16; i++) {
					value[pos+i] = mat[i];
				}
				list._monitorUpToDate = false;
			}
		},
		{
			blockType: BlockType.LABEL,
			text: "Manual transformations"
		},
		{
			opcode: "matTransform",
			blockType: BlockType.COMMAND,
			text: "transform X [X] Y [Y] Z [Z] from [FROM] to [TO]",
			arguments: {
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
				FROM: {
					type: ArgumentType.STRING,
					menu: "vectorTransformsMin2",
					defaultValue: "world space"
				},
				TO: {
					type: ArgumentType.STRING,
					menu: "vectorTransforms",
					defaultValue: "model space"
				},
			},
			def: function({X, Y, Z, FROM, TO}, {target}) {
				const lookup = {"projected":4, "projected (scratch units)":4, "view space":3, "world space":2, "model space":1};
				const lookup2 = [null, transforms.modelToWorld, transforms.worldToView, transforms.viewToProjected];
				let from = lookup[FROM];
				let to = lookup[TO];
				if (!from || !to) return;
				const vec = [
					Cast.toNumber(X),
					Cast.toNumber(Y),
					Cast.toNumber(Z),
					1
				];
				if (from == to) {
					transformed = vec;
					return;
				}
				let swapped = false;
				if (from > to) {
					[from, to] = [to, from];
					swapped = true;
				}
				let totalMat = lookup2[from];
				for(let i=from+1; i<to; i++) {
					totalMat = m4.multiply(lookup2[i], totalMat);
				}
				if (swapped) totalMat = m4.inverse(totalMat);
				transformed = m4.multiplyVec(totalMat, vec);
				if (TO == "projected (scratch units)") {
					transformed[0] /= transformed[3] * runtime.stageWidth / 2
					transformed[1] /= transformed[3] * runtime.stageHeight / 2;
					transformed[2]  = transformed[3];
				}
			}
		},
		{
			opcode: "matTransformDir",
			blockType: BlockType.COMMAND,
			text: "transform direction X [X] Y [Y] Z [Z] from [FROM] to [TO]",
			arguments: {
				X: {
					type: ArgumentType.NUMBER,
				},
				Y: {
					type: ArgumentType.NUMBER,
				},
				Z: {
					type: ArgumentType.NUMBER,
				},
				FROM: {
					type: ArgumentType.STRING,
					menu: "vectorTransformsMin2",
					defaultValue: "world space"
				},
				TO: {
					type: ArgumentType.STRING,
					menu: "vectorTransformsMin1",
					defaultValue: "model space"
				},
			},
			def: function({X, Y, Z, FROM, TO}, {target}) {
				const lookup = {"projected":4, "projected (scratch units)":4, "view space":3, "world space":2, "model space":1};
				const lookup2 = [null, transforms.modelToWorld, transforms.worldToView, transforms.viewToProjected];
				let from = lookup[FROM];
				let to = lookup[TO];
				if (!from || !to) return;
				const vec = [
					Cast.toNumber(X),
					Cast.toNumber(Y),
					Cast.toNumber(Z),
					1
				];
				if (from == to) {
					transformed = vec;
					return;
				}
				let swapped = false;
				if (from > to) {
					[from, to] = [to, from];
					swapped = true;
				}
				let totalMat = lookup2[from];
				for(let i=from+1; i<to; i++) {
					totalMat = m4.multiply(lookup2[i], totalMat);
				}
				totalMat[12] = totalMat[13] = totalMat[14] = 0;
				if (swapped) totalMat = m4.inverse(totalMat);
				transformed = m4.multiplyVec(totalMat, vec);
			}
		},
		{
			opcode: "matTransformResult",
			blockType: BlockType.REPORTER,
			text: "transformed [AXIS]",
			disableMonitor: true,
			arguments: {
				AXIS: {
					type: ArgumentType.STRING,
					menu: "axis"
				},
			},
			def: function({AXIS}, {target}) {
				const lookup = {X:1, Y:2, Z:3};
				const index = lookup[AXIS];
				return index ? transformed[index-1] : "";
			}
		},
		{
			blockType: BlockType.LABEL,
			text: "Rendering into textures"
		},
		{
			opcode: "renderToStage",
			blockType: BlockType.COMMAND,
			text: "render to stage",
			def: function({}) {
				canvasRenderTarget.setAsRenderTarget();
			}
		},
		{
			opcode: "renderToTexture",
			blockType: BlockType.COMMAND,
			text: "render to texture of [NAME]",
			arguments: {
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
			},
			def: function({NAME}) {
				const mesh = meshes.get(Cast.toString(NAME));
				if (!mesh) return;
				if (!mesh.data.texture) return;
				mesh.data.texture.setAsRenderTarget();
			}
		},
		{
			opcode: "renderToCubeTexture",
			blockType: BlockType.COMMAND,
			text: "render to cube texture [SIDE] of [NAME]",
			arguments: {
				SIDE: {
					type: ArgumentType.STRING,
					menu: "cubeSide"
				},
				NAME: {
					type: ArgumentType.STRING,
					defaultValue: "my mesh"
				},
			},
			def: function({}) {}
		},
		{
			opcode: "readRenderTarget",
			blockType: BlockType.COMMAND,
			text: "read current render target into [LIST]",
			arguments: {
				LIST: {
					type: ArgumentType.STRING,
					menu: "lists"
				}
			},
			def: function({NAME}) {}
		},
		{
			blockType: BlockType.LABEL,
			text: "Tinting and fog"
		},
		{
			opcode: "setGlobalColor",
			blockType: BlockType.COMMAND,
			text: "set global color [OPERATION] R: [RED] G: [GREEN] B: [BLUE] A: [ALPHA]",
			arguments: {
				OPERATION: {
					type: ArgumentType.STRING,
					menu: "globalColor"
				},
				RED: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
				GREEN: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
				BLUE: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
				ALPHA: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
			},
			def: function({OPERATION, RED, GREEN, BLUE, ALPHA}) {
				const color = [
					Cast.toNumber(RED),
					Cast.toNumber(GREEN),
					Cast.toNumber(BLUE),
					Cast.toNumber(ALPHA)
				];
				if (OPERATION == "multiplier") colorMultiplier = color;
				if (OPERATION == "adder") colorAdder = color;
			}
		},
		{
			opcode: "setFogEnabled",
			blockType: BlockType.COMMAND,
			text: "turn fog [STATE]",
			arguments: {
				STATE: {
					type: ArgumentType.STRING,
					menu: "onOff"
				},
			},
			def: function({STATE}) {
				fogEnabled = Cast.toBoolean(STATE);
			}
		},
		{
			opcode: "setFogColor",
			blockType: BlockType.COMMAND,
			text: "set fog color R: [RED] G: [GREEN] B: [BLUE]",
			arguments: {
				RED: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
				GREEN: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
				BLUE: {
					type: ArgumentType.NUMBER,
					defaultValue: 1
				},
			},
			def: function({RED, GREEN, BLUE}) {
				fogColor = [
					Cast.toNumber(RED),
					Cast.toNumber(GREEN),
					Cast.toNumber(BLUE)
				];
			}
		},
		{
			opcode: "setFogDistance",
			blockType: BlockType.COMMAND,
			text: "set fog distance near: [NEAR] far: [FAR]",
			arguments: {
				NEAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 10
				},
				FAR: {
					type: ArgumentType.NUMBER,
					defaultValue: 100
				},
			},
			def: function({NEAR, FAR}) {
				NEAR = Cast.toNumber(NEAR);
				FAR = Cast.toNumber(FAR);
				fogDistance = [NEAR, FAR-NEAR];
			}
		},
	]

	let extInfo = {
				id: "simple3D",
				name: "Simple 3D",
				color1: "#5CB1D6",
				color2: "#47A8D1",
				color3: "#2E8EB8",
/*				color1: "#0fBD8C",
				color2: "#0DA57A",
				color3: "#0B8E69",*/
				blocks: [
					...definitions
				],
				menus: {
					lists: {
						acceptReporters: false,
						items: "listsMenu"
					},
					textures: {
						acceptReporters: true,
						items: "texturesMenu"
					},
					costumes: {
						acceptReporters: true,
						items: "costumes"
					},
					clearLayers: {
						acceptReporters: false,
						items: [
							{text: "color", value: ""+gl.COLOR_BUFFER_BIT},
							{text: "depth", value: ""+gl.DEPTH_BUFFER_BIT},
							{text: "color and depth", value: ""+(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)},
						]
					},
					primitives: {
						acceptReporters: false,
						items: [
							{text: "points", value: ""+gl.POINTS},
							{text: "lines", value: ""+gl.LINES},
							{text: "line loop", value: ""+gl.LINE_LOOP},
							{text: "line strip", value: ""+gl.LINE_STRIP},
							{text: "triangles", value: ""+gl.TRIANGLES},
							{text: "triangle strip", value: ""+gl.TRIANGLE_STRIP},
							{text: "triangle fan", value: ""+gl.TRIANGLE_FAN},
						]
					},
					onOff: {
						acceptReporters: true,
						items: [
							{text: "on", value: "true"},
							{text: "off", value: "false"},
						]
					},
					meshProperties: {
						acceptReporters: false,
						items: [
							"inherits from",
							"is inherited by",
						]
					},
					axis: {
						acceptReporters: false,
						items: ["X", "Y", "Z"]
					},
					textureWrap: {
						acceptReporters: false,
						items: ["clamp to edge", "repeat"]
					},
					textureFilter: {
						acceptReporters: false,
						items: ["pixelated", "blurred"]
					},
					textureMipmapping: {
						acceptReporters: false,
						items: ["off", "sharp transitions", "smooth transitions"]
					},
					cubeSide: {
						acceptReporters: true,
						items: ["X+", "X-", "Y+", "Y-", "Z+", "Z-"]
					},
					blending: {
						acceptReporters: true,
						items: ["invisible", "overwrite color (fastest)", "default", "additive", "subtractive", "multiply", "invert"]
					},
					culling: {
						acceptReporters: true,
						items: ["nothing", "back faces", "front faces"]
					},
					skinningTransforms: {
						acceptReporters: true,
						items: ["original", "current"]
					},
					renderTransforms: {
						acceptReporters: false,
						items: [{
							text: "to projected from view space",
							value: "viewToProjected",
						}, {
							text: "to view space from world space",
							value: "worldToView",
						}, {
							text: "to world space from model space",
							value: "modelToWorld",
						}, {
							text: "importing from file",
							value: "import",
						}, {
							text: "custom",
							value: "custom"
						}]
					},
					vectorTransforms: {
						acceptReporters: false,
						items: ["projected (scratch units)", "projected", "view space", "world space", "model space"]
					},
					vectorTransformsMin1: {
						acceptReporters: false,
						items: ["projected", "view space", "world space", "model space"]
					},
					vectorTransformsMin2: {
						acceptReporters: false,
						items: ["view space", "world space", "model space"]
					},
					renderTargetProp: {
						acceptReporters: false,
						items: ["width", "height"]
					},
					filetype: {
						acceptReporters: false,
						items: [".obj .mtl", ".off"]
					},
					globalColor: {
						acceptReporters: false,
						items: ["multiplier", "adder"]
					},
					alphaTest: {
						acceptReporters: false,
						items: ["draw everything", "discard fully transparent", "discard fully transparent, make others fully opaque"]
					},
				}
			};

	class Extension {
		getInfo() {
			return extInfo;
		}
		listsMenu() {
			const stage = vm.runtime.getTargetForStage();
			const editingTarget = vm.editingTarget;
			const local = editingTarget ? Object.values(editingTarget.variables).filter(v => v.type == "list").map(v => v.name) : [];
			const global = stage ? Object.values(stage.variables).filter(v => v.type == "list").map(v => v.name) : [];
			const all = [...local, ...global];
			all.sort();
			if (all.length == 0) return ["list"];
			return all;
		}
		texturesMenu() {
			const stage = vm.runtime.getTargetForStage();
			const editingTarget = vm.editingTarget;
			const listsLocal = editingTarget ? Object.values(editingTarget.variables).filter(v => v.type == "list").map(v => "list:"+v.name) : [];
			const listsGlobal = stage ? Object.values(stage.variables).filter(v => v.type == "list").map(v => "list:"+v.name) : [];
			const costumes = editingTarget ? editingTarget.getCostumes().map(e => "costume:"+e.name) : [];
			const all = [...costumes, ...listsLocal, ...listsGlobal];
			all.sort();
			if (all.length == 0) return ["empty"];
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

	for(let block of definitions) {
		if(block == "---") continue;
		Extension.prototype[block.opcode] = block.def;
	}

	Scratch.extensions.register(new Extension());
})(Scratch);