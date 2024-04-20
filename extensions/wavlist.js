// Name: Fetch
// ID: fetch
// Description: Make requests to the broader internet.

(function (Scratch) {
  "use strict";

  const Formats = {
    "f64": Float64Array,
    "f32": Float32Array,
    "i32": Int32Array,
    "i16": Int16Array,
    "i8": Int8Array,
    "u32": Uint32Array,
    "u16": Uint16Array,
    "u8": Uint8Array
  }

  class WavList {
    getInfo() {
      return {
        id: "xeltallivwavlist",
        name: "Wav -> List",
        blocks: [
          {
            opcode: "wavtolist",
            blockType: Scratch.BlockType.COMMAND,
            text: "wav [SOUND] to list [DSTLIST] as [FORMAT]",
            arguments: {
              SOUND: {
                type: Scratch.ArgumentType.SOUND,
              },
              DSTLIST: {
                type: Scratch.ArgumentType.STRING,
                menu: "lists"
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "formats"
              }
            },
          },
        ],
        menus: {
          lists: {
            acceptReporters: false,
            items: "listsMenu"
          },
          formats: {
            acceptReporters: false,
            items: ["f64", "f32", "i32", "i16", "i8", "u32", "u16", "u8"]
          }
        }
      };
    }

    wavtolist({SOUND, DSTLIST, FORMAT}, {target}) {
      const sound = target.getSounds().find(s => s.name == SOUND);
      const list = target.lookupVariableByNameAndType(DSTLIST, "list");
      if (!list || !sound || sound.dataFormat !== "wav" || !Formats[FORMAT]) return;
      list.value = Array.from(new (Formats[FORMAT])(sound.asset.data.buffer));
      list._monitorUpToDate = false;
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
  }

  Scratch.extensions.register(new WavList());
})(Scratch);
