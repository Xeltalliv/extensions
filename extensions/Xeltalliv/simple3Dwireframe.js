// Name: Simple 3D: Wireframe
// ID: xeltallivSimple3Dwireframe
// Description: Wireframes
// By: Vadik1 <https://scratch.mit.edu/users/Vadik1/>
// License: MPL-2.0
// Version: 1.0.0
// For Simple3D version: 1.2.0

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed)
    throw new Error("Simple 3D: wireframe extension must be run unsandboxed");

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;
  const vm = Scratch.vm;
  const renderer = vm.renderer;
  const runtime = vm.runtime;

  const extensionId = "xeltallivSimple3Dwireframe";
  let gl, ext_pm;

  function linkToSimple3D() {
    if (gl) return;
    if (!runtime.ext_xeltallivSimple3Dapi) return;
    if (!runtime.ext_xeltallivSimple3Dapi.i_will_not_ask_for_help_when_these_break) return;
    const all = runtime.ext_xeltallivSimple3Dapi.i_will_not_ask_for_help_when_these_break();
    gl = all.gl;
    ext_pm = gl.getExtension("WEBGL_polygon_mode");
  }
  vm.on("EXTENSION_ADDED", function(data) {
    if (data.id == "xeltallivSimple3D") {
      linkToSimple3D();
    }
  });
  linkToSimple3D();

  const definitions = [
    {
      blockType: BlockType.XML,
      xml: "<sep gap='6'/><label text='Those features can be'/><sep gap='-12'/><label text='useful during development, but'/><sep gap='-12'/><label text='should not be distributed to end'/><sep gap='-12'/><label text='users because on many devices'/><sep gap='-12'/><label text='it is not supported'/><sep gap='24'/>",
    },
    {
      opcode: "setLineWidth",
      blockType: BlockType.COMMAND,
      text: "set line width [WIDTH]",
      arguments: {
        WIDTH: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ WIDTH }) {
        if (!gl) return;
        gl.lineWidth(Math.max(0, Cast.toNumber(WIDTH)));
      },
    },
    {
      opcode: "setWireframe",
      blockType: BlockType.COMMAND,
      text: "enable wireframe mode [STATE]",
      arguments: {
        STATE: {
          type: ArgumentType.NUMBER,
          menu: "onOff",
          defaultValue: "on",
        },
      },
      def: function ({ STATE }) {
        if (!ext_pm) return;
        const value = Cast.toBoolean(STATE) ? ext_pm.LINE_WEBGL : ext_pm.FILL_WEBGL;
        console.log(ext_pm, ext_pm.LINE_WEBGL, ext_pm.FILL_WEBGL, value);
        ext_pm.polygonModeWEBGL(gl.FRONT_AND_BACK, value);
      },
    },
    {
      opcode: "wireframeSupported",
      blockType: BlockType.BOOLEAN,
      text: "is wireframe supported?",
      def: function () {
        return !!ext_pm;
      },
    },
  ];

  const extInfo = {
    id: extensionId,
    name: "Simple 3D: wireframe",
    color1: "#5CB1D6",
    color2: "#47A8D1",
    color3: "#2E8EB8",
    blocks: definitions,
    menus: {
      onOff: {
        acceptReporters: true,
        items: [
          { text: "on", value: "true" },
          { text: "off", value: "false" },
        ],
      },
    },
  };

  class Extension {
    getInfo() {
      return extInfo;
    }
  }

  for (let block of definitions) {
    if (block == "---") continue;
    Extension.prototype[block.opcode ?? block.func] = block.def;
  }

  Scratch.extensions.register(new Extension());
})(Scratch);
