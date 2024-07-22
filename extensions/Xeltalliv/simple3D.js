// Name: Simple 3D Transformations
// ID: xeltallivSimple3D
// Description: Just math blocks from Simple3D
// By: Vadik1 <https://scratch.mit.edu/users/Vadik1/>
// License: MPL-2.0 AND BSD-3-Clause
// Version: 1.1.0

(function (Scratch) {
  "use strict";

  /*
   * A modified version of m4 library based on one of the earlier lessons on webglfundamentals.org
   * All lessons can be found on https://github.com/gfxfundamentals/webgl-fundamentals/tree/master
   * licensed under BSD 3-Clause license.
   * Only this section of the code is BSD 3-Clause. The rest of the extension is MPL-2.0.
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
  // prettier-ignore
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
      const a = 2 / (near - far);
      const b = -1 + near * a;
      return [
        1 / aspect, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, a, 0,
        0, 0, b, 1
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
        c,  s, 0, 0,
        -s, c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1,
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

  /**
   * hasOwn but it works in older browsers
   * @param {object} obj
   * @param {string} name
   * @returns {boolean}
   */
  const hasOwn = (obj, name) => Object.prototype.hasOwnProperty.call(obj, name);

  function resizeCanvas() {
    runtime.startHats(`${extensionId}_whenCanvasResized`);
  }

  function detectResize() {
    const urq = renderer._updateRenderQuality;
    renderer._updateRenderQuality = function (...args) {
      urq.apply(this, args);
      resizeCanvas();
    };
    renderer.on("NativeSizeChanged", resizeCanvas);
  }

  if (!Scratch.extensions.unsandboxed)
    throw new Error("Simple 3D extension must be run unsandboxed");

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;
  const vm = Scratch.vm;
  const renderer = vm.renderer;
  const runtime = vm.runtime;

  const extensionId = "xeltallivSimple3D";
  const publicApi =
    runtime.ext_xeltallivSimple3Dapi ?? (runtime.ext_xeltallivSimple3Dapi = {});
  const externalTransforms =
    publicApi.externalTransforms ?? (publicApi.externalTransforms = {});

  let transforms;
  let transformed;
  let selectedTransform;

  function resetEverything() {
    transforms = {
      modelToWorld: m4.identity(),
      worldToView: m4.identity(),
      viewToProjected: m4.identity(),
      import: m4.identity(),
      custom: m4.identity(),
    };
    transformed = [0, 0, 0, 0];
    selectedTransform = "viewToProjected";
  }
  resetEverything();
  detectResize();
  runtime.on("PROJECT_LOADED", resetEverything);

  const definitions = [
    {
      blockType: BlockType.BUTTON,
      text: "Open extra resources",
      func: "openSite",
      def: function () {
        Scratch.openWindow("https://xeltalliv.github.io/simple3d-extension/");
      },
    },
    {
      blockType: BlockType.BUTTON,
      text: "Open sample project",
      func: "getSampleProject",
      def: function () {
        const url = new URL(location.href);
        url.searchParams.set(
          "project_url",
          "https://extensions.turbowarp.org/samples/Simple3D%20template.sb3"
        );
        // Exempted from Scratch.openWindow as it is in response to a user gesture and it does not
        // bring in third-party websites at all.
        // eslint-disable-next-line no-restricted-syntax
        window.open(url.href);
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "Clearing",
    },
    {
      opcode: "resetEverything",
      blockType: BlockType.COMMAND,
      text: "reset everything",
      def: function () {
        resetEverything();
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "View transformations",
    },
    {
      opcode: "matSelect",
      blockType: BlockType.COMMAND,
      text: "configure [TRANSFORM] transformation",
      arguments: {
        TRANSFORM: {
          type: ArgumentType.STRING,
          menu: "renderTransforms",
        },
      },
      def: function ({ TRANSFORM }, { target }) {
        if (hasOwn(transforms, TRANSFORM)) {
          selectedTransform = TRANSFORM;
        }
      },
    },
    {
      opcode: "matStartWithPerspective",
      blockType: BlockType.COMMAND,
      text: "start with perspective FOV: [FOV] near: [NEAR] far: [FAR]",
      arguments: {
        FOV: {
          type: ArgumentType.NUMBER,
          defaultValue: 90,
        },
        NEAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.1,
        },
        FAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 1000,
        },
      },
      def: function ({ FOV, NEAR, FAR }) {
        transforms[selectedTransform] = m4.perspective(
          (Cast.toNumber(FOV) / 180) * Math.PI,
          runtime.stageWidth / runtime.stageHeight,
          Cast.toNumber(NEAR),
          Cast.toNumber(FAR)
        );
      },
    },
    {
      opcode: "matStartWithPerspectiveAspect",
      blockType: BlockType.COMMAND,
      text: "start with perspective FOV: [FOV] near: [NEAR] far: [FAR] aspect ratio: [ASPECT]",
      arguments: {
        FOV: {
          type: ArgumentType.NUMBER,
          defaultValue: 90,
        },
        NEAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.1,
        },
        FAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 1000,
        },
        ASPECT: {
          type: ArgumentType.NUMBER,
          defaultValue: runtime.stageWidth / runtime.stageHeight,
        },
      },
      def: function ({ FOV, NEAR, FAR, ASPECT }) {
        transforms[selectedTransform] = m4.perspective(
          (Cast.toNumber(FOV) / 180) * Math.PI,
          Cast.toNumber(ASPECT),
          Cast.toNumber(NEAR),
          Cast.toNumber(FAR)
        );
      },
    },
    {
      opcode: "matStartWithOrthographic",
      blockType: BlockType.COMMAND,
      text: "start with orthographic near: [NEAR] far: [FAR]",
      arguments: {
        NEAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.1,
        },
        FAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 1000,
        },
      },
      def: function ({ NEAR, FAR }) {
        transforms[selectedTransform] = m4.orthographic(
          runtime.stageWidth / runtime.stageHeight,
          Cast.toNumber(NEAR),
          Cast.toNumber(FAR)
        );
      },
    },
    {
      opcode: "matStartWithOrthographicAspect",
      blockType: BlockType.COMMAND,
      text: "start with orthographic near: [NEAR] far: [FAR] aspect ratio: [ASPECT]",
      arguments: {
        NEAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.1,
        },
        FAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 1000,
        },
        ASPECT: {
          type: ArgumentType.NUMBER,
          defaultValue: runtime.stageWidth / runtime.stageHeight,
        }
      },
      def: function ({ NEAR, FAR, ASPECT }) {
        transforms[selectedTransform] = m4.orthographic(
          Cast.toNumber(ASPECT),
          Cast.toNumber(NEAR),
          Cast.toNumber(FAR)
        );
      },
    },
    {
      opcode: "matStartWithIdentity",
      blockType: BlockType.COMMAND,
      text: "start with no transformation",
      def: function () {
        transforms[selectedTransform] = m4.identity();
      },
    },
    {
      opcode: "matStartWithExternal",
      blockType: BlockType.COMMAND,
      text: "start with [SOURCE]",
      arguments: {
        SOURCE: {
          type: ArgumentType.STRING,
          menu: "externalTransforms",
        },
      },
      def: function ({ SOURCE }, util) {
        if (!hasOwn(externalTransforms, SOURCE)) return;
        const src = externalTransforms[SOURCE];
        transforms[selectedTransform] = src.get() ?? m4.identity();
      },
    },
    {
      opcode: "matStartWithSavedIn",
      blockType: BlockType.COMMAND,
      text: "start with saved in [SRCLIST] at [POS]",
      arguments: {
        SRCLIST: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        POS: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ SRCLIST, POS }, { target }) {
        const pos = Math.floor(Cast.toNumber(POS));
        const list = target.lookupVariableByNameAndType(
          Cast.toString(SRCLIST),
          "list"
        );
        if (!list) return;
        if (!Number.isFinite(pos) || pos < 1 || pos + 15 > list.value.length)
          return;

        transforms[selectedTransform] = list.value
          .slice(pos - 1, pos + 15)
          .map(Cast.toNumber);
      },
    },
    {
      opcode: "matMove",
      blockType: BlockType.COMMAND,
      text: "move X: [X] Y: [Y] Z: [Z]",
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
      def: function ({ X, Y, Z }) {
        transforms[selectedTransform] = m4.translate(
          transforms[selectedTransform],
          Cast.toNumber(X),
          Cast.toNumber(Y),
          Cast.toNumber(Z)
        );
      },
    },
    {
      opcode: "matRotate",
      blockType: BlockType.COMMAND,
      text: "rotate around [AXIS] by [ANGLE] degrees",
      arguments: {
        AXIS: {
          type: ArgumentType.STRING,
          menu: "axis",
        },
        ANGLE: {
          type: ArgumentType.ANGLE,
        },
      },
      def: function ({ AXIS, ANGLE }) {
        let fn;
        if (AXIS == "X") fn = m4.xRotate;
        if (AXIS == "Y") fn = m4.yRotate;
        if (AXIS == "Z") fn = m4.zRotate;
        if (!fn) return;
        transforms[selectedTransform] = fn(
          transforms[selectedTransform],
          (Cast.toNumber(ANGLE) / 180) * Math.PI
        );
      },
    },
    {
      opcode: "matScale",
      blockType: BlockType.COMMAND,
      text: "scale X: [X] Y: [Y] Z: [Z]",
      arguments: {
        X: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        Y: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        Z: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ X, Y, Z }) {
        transforms[selectedTransform] = m4.scale(
          transforms[selectedTransform],
          Cast.toNumber(X),
          Cast.toNumber(Y),
          Cast.toNumber(Z)
        );
      },
    },
    {
      opcode: "matWrapper",
      blockType: BlockType.CONDITIONAL,
      text: "wrapper",
      def: function (_, util) {
        if (util.stackFrame.undoWrapper) {
          util.stackFrame.undoWrapper = false;
          transforms = util.stackFrame.mat3Dstack.pop();
        } else {
          util.stackFrame.undoWrapper = true;
          if (!util.stackFrame.mat3Dstack) util.stackFrame.mat3Dstack = [];
          util.stackFrame.mat3Dstack.push(Object.assign({}, transforms));
          util.startBranch(1, true);
        }
      },
    },
    {
      opcode: "matSaveInto",
      blockType: BlockType.COMMAND,
      text: "save into [DSTLIST] at [POS]",
      arguments: {
        DSTLIST: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        POS: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ DSTLIST, POS }, { target }) {
        const pos = Math.floor(Cast.toNumber(POS)) - 1;
        const list = target.lookupVariableByNameAndType(
          Cast.toString(DSTLIST),
          "list"
        );
        if (!list) return;
        if (pos < 0 || !Number.isFinite(pos)) return;

        const value = list.value;
        const mat = transforms[selectedTransform];
        while (value.length < pos + 15) {
          value.push(0);
        }
        for (let i = 0; i < 16; i++) {
          value[pos + i] = mat[i];
        }
        list._monitorUpToDate = false;
      },
    },
    {
      opcode: "matReset",
      blockType: BlockType.COMMAND,
      text: "reset transformation's [COMPONENT]",
      arguments: {
        COMPONENT: {
          type: ArgumentType.STRING,
          menu: "matComponent",
        },
      },
      def: function ({ COMPONENT }) {
        const a = transforms[selectedTransform];
        if (COMPONENT == "rotation") {
          // prettier-ignore
          transforms[selectedTransform] = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            a[12], a[13], a[14], 1,
          ];
        }
        if (COMPONENT == "offset") {
          // prettier-ignore
          transforms[selectedTransform] = [
            a[0], a[1], a[2], 0,
            a[4], a[5], a[6], 0,
            a[8], a[9], a[10], 0,
            0, 0, 0, 1,
          ];
        }
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "Manual transformations",
    },
    {
      opcode: "matTransform",
      blockType: BlockType.COMMAND,
      text: "transform X: [X] Y: [Y] Z: [Z]",
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
      def: function ({ X, Y, Z }) {
        const vec = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z), 1];
        transformed = m4.multiplyVec(transforms[selectedTransform], vec);
      },
    },

    {
      opcode: "matTransformFromTo",
      blockType: BlockType.COMMAND,
      text: "transform X: [X] Y: [Y] Z: [Z] from [FROM] to [TO]",
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
          defaultValue: "world space",
        },
        TO: {
          type: ArgumentType.STRING,
          menu: "vectorTransforms",
          defaultValue: "model space",
        },
      },
      def: function ({ X, Y, Z, FROM, TO }) {
        const lookup = {
          projected: 4,
          "projected (scratch units)": 4,
          "view space": 3,
          "world space": 2,
          "model space": 1,
        };
        const lookup2 = [
          null,
          transforms.modelToWorld,
          transforms.worldToView,
          transforms.viewToProjected,
        ];
        let from = lookup[FROM];
        let to = lookup[TO];
        if (!from || !to) return;
        const vec = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z), 1];
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
        for (let i = from + 1; i < to; i++) {
          totalMat = m4.multiply(lookup2[i], totalMat);
        }
        if (swapped) totalMat = m4.inverse(totalMat);
        transformed = m4.multiplyVec(totalMat, vec);
        if (TO == "projected (scratch units)") {
          transformed[0] =
            ((transformed[0] / transformed[3]) * runtime.stageWidth) / 2;
          transformed[1] =
            ((transformed[1] / transformed[3]) * runtime.stageHeight) / 2;
          transformed[2] = transformed[3];
        }
      },
    },
    {
      opcode: "matTransformFromToDir",
      blockType: BlockType.COMMAND,
      text: "transform direction X: [X] Y: [Y] Z: [Z] from [FROM] to [TO]",
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
          defaultValue: "world space",
        },
        TO: {
          type: ArgumentType.STRING,
          menu: "vectorTransformsMin1",
          defaultValue: "model space",
        },
      },
      def: function ({ X, Y, Z, FROM, TO }) {
        const lookup = {
          projected: 4,
          "projected (scratch units)": 4,
          "view space": 3,
          "world space": 2,
          "model space": 1,
        };
        const lookup2 = [
          null,
          transforms.modelToWorld,
          transforms.worldToView,
          transforms.viewToProjected,
        ];
        let from = lookup[FROM];
        let to = lookup[TO];
        if (!from || !to) return;
        const vec = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z), 1];
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
        for (let i = from + 1; i < to; i++) {
          totalMat = m4.multiply(lookup2[i], totalMat);
        }
        if (from + 1 == to) {
          totalMat = totalMat.slice();
        }
        totalMat[12] = totalMat[13] = totalMat[14] = 0;
        if (swapped) totalMat = m4.inverse(totalMat);
        transformed = m4.multiplyVec(totalMat, vec);
      },
    },
    {
      opcode: "matTransformResult",
      blockType: BlockType.REPORTER,
      text: "transformed [AXIS]",
      disableMonitor: true,
      arguments: {
        AXIS: {
          type: ArgumentType.STRING,
          menu: "axis",
        },
      },
      def: function ({ AXIS }) {
        const lookup = { X: 1, Y: 2, Z: 3 };
        const index = lookup[AXIS];
        return index ? transformed[index - 1] : "";
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "Resolution changes",
    },
    {
      opcode: "whenCanvasResized",
      blockType: BlockType.EVENT,
      text: "when resolution changes",
      isEdgeActivated: false,
    },
    {
      opcode: "canvasWidth",
      blockType: BlockType.REPORTER,
      text: "stage width",
      def: function () {
        return renderer.useHighQualityRender ? renderer.canvas.width : runtime.stageWidth;
      },
    },
    {
      opcode: "canvasHeight",
      blockType: BlockType.REPORTER,
      text: "stage height",
      def: function () {
        return renderer.useHighQualityRender ? renderer.canvas.height : runtime.stageHeight;
      },
    },
  ];

  const extInfo = {
    id: extensionId,
    name: "Simple 3D Transformations",
    color1: "#5CB1D6",
    color2: "#47A8D1",
    color3: "#2E8EB8",
    docsURI: "https://extensions.turbowarp.org/Xeltalliv/simple3D",
    blocks: definitions,
    menus: {
      lists: {
        acceptReporters: false,
        items: "listsMenu",
      },
      externalTransforms: {
        acceptReporters: true,
        items: "externalTransformsMenu",
      },
      axis: {
        acceptReporters: false,
        items: ["X", "Y", "Z"],
      },
      renderTransforms: {
        acceptReporters: false,
        items: [
          {
            text: "to projected from view space",
            value: "viewToProjected",
          },
          {
            text: "to view space from world space",
            value: "worldToView",
          },
          {
            text: "to world space from model space",
            value: "modelToWorld",
          },
          {
            text: "importing from file",
            value: "import",
          },
          {
            text: "custom",
            value: "custom",
          },
        ],
      },
      matComponent: {
        acceptReporters: true,
        items: ["offset", "rotation"],
      },
      vectorTransforms: {
        acceptReporters: false,
        items: [
          "projected (scratch units)",
          "projected",
          "view space",
          "world space",
          "model space",
        ],
      },
      vectorTransformsMin1: {
        acceptReporters: false,
        items: ["projected", "view space", "world space", "model space"],
      },
      vectorTransformsMin2: {
        acceptReporters: false,
        items: ["view space", "world space", "model space"],
      },
    },
  };

  class Extension {
    getInfo() {
      definitions.find(
        (b) => b.opcode == "matStartWithExternal"
      ).hideFromPalette = Object.keys(externalTransforms).length == 0;
      return extInfo;
    }
    dispose() {
      resetEverything();
      runtime.removeListener("PROJECT_LOADED", resetEverything);
    }
    listsMenu() {
      const stage = vm.runtime.getTargetForStage();
      const editingTarget =
        vm.editingTarget !== stage ? vm.editingTarget : null;
      const local = editingTarget
        ? Object.values(editingTarget.variables)
            .filter((v) => v.type == "list")
            .map((v) => v.name)
        : [];
      const global = stage
        ? Object.values(stage.variables)
            .filter((v) => v.type == "list")
            .map((v) => v.name)
        : [];
      const all = [...local, ...global];
      all.sort();
      if (all.length == 0) return ["list"];
      return all;
    }
    externalTransformsMenu() {
      const out = [];
      for (let key in externalTransforms) {
        out.push({
          value: key,
          text: externalTransforms[key].name,
        });
      }
      if (out.length == 0)
        out.push({ value: "", text: "- no external sources -" });
      return out;
    }
  }

  for (let block of definitions) {
    if (block == "---") continue;
    Extension.prototype[block.opcode ?? block.func] = block.def;
  }

  Scratch.extensions.register(new Extension());
})(Scratch);
