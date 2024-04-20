// Name: StrUtils
// ID: strutils
// Description: String utils
// By: Vadik1 <https://scratch.mit.edu/users/Vadik1>

((Scratch) => {
  "use strict";

  const {Cast, ArgumentType, BlockType, extensions} = Scratch;

  class StrUtils {
    getInfo() {
      return {
        id: "strutils",
        name: "StringUtils",

        blocks: [
          {
            opcode: "substring1",
            blockType: BlockType.REPORTER,
            text: "substring [STRING] [FROM]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FROM: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "substring2",
            blockType: BlockType.REPORTER,
            text: "substring [STRING] [FROM] [TO]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FROM: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
              TO: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          "---",
          {
            opcode: "indexOf",
            blockType: BlockType.REPORTER,
            text: "index of [STRING] [FIND]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FIND: {
                type: ArgumentType.STRING,
                defaultValue: "l",
              },
            },
          },
          {
            opcode: "lastIndexOf",
            blockType: BlockType.REPORTER,
            text: "last index of [STRING] [FIND]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FIND: {
                type: ArgumentType.STRING,
                defaultValue: "l",
              },
            },
          },
          {
            opcode: "indexOfStart",
            blockType: BlockType.REPORTER,
            text: "index of [STRING] [FIND] [START]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FIND: {
                type: ArgumentType.STRING,
                defaultValue: "l",
              },
              START: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "lastIndexOfStart",
            blockType: BlockType.REPORTER,
            text: "last index of [STRING] [FIND] [START]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FIND: {
                type: ArgumentType.STRING,
                defaultValue: "l",
              },
              START: {
                type: ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          "---",
          {
            opcode: "replaceAll",
            blockType: BlockType.REPORTER,
            text: "replace [STRING] [FIND] [REPLACE]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              FIND: {
                type: ArgumentType.STRING,
                defaultValue: "l",
              },
              REPLACE: {
                type: ArgumentType.STRING,
                defaultValue: "_",
              },
            },
          },
          "---",
          {
            opcode: "trim",
            blockType: BlockType.REPORTER,
            text: "trim [STRING]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "    hello    ",
              },
            },
          },
          {
            opcode: "trimStart",
            blockType: BlockType.REPORTER,
            text: "trim start [STRING]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "    hello    ",
              },
            },
          },
          {
            opcode: "trimEnd",
            blockType: BlockType.REPORTER,
            text: "trim end [STRING]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "    hello    ",
              },
            },
          },
          {
            opcode: "padStart",
            blockType: BlockType.REPORTER,
            text: "pad start [STRING] [LENGTH] [FILL]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "12345",
              },
              LENGTH: {
                type: ArgumentType.NUMBER,
                defaultValue: 16,
              },
              FILL: {
                type: ArgumentType.STRING,
                defaultValue: "0",
              },
            },
          },
          {
            opcode: "padEnd",
            blockType: BlockType.REPORTER,
            text: "pad end [STRING] [LENGTH] [FILL]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "12345",
              },
              LENGTH: {
                type: ArgumentType.NUMBER,
                defaultValue: 16,
              },
              FILL: {
                type: ArgumentType.STRING,
                defaultValue: "0",
              },
            },
          },
          "---",
          {
            opcode: "repeat",
            blockType: BlockType.REPORTER,
            text: "repeat [STRING] [COUNT]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              COUNT: {
                type: ArgumentType.NUMBER,
                defaultValue: 5,
              },
            },
          },
          "---",
          {
            opcode: "startsWith",
            blockType: BlockType.BOOLEAN,
            text: "starts with [STRING] [START]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              START: {
                type: ArgumentType.STRING,
                defaultValue: "he",
              },
            },
          },
          {
            opcode: "endsWith",
            blockType: BlockType.BOOLEAN,
            text: "ends with [STRING] [END]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello",
              },
              END: {
                type: ArgumentType.STRING,
                defaultValue: "lo",
              },
            },
          },
          "---",
          {
            opcode: "split",
            blockType: BlockType.COMMAND,
            text: "split [STRING] by [DELIMITER] into [OUTLIST]",
            arguments: {
              STRING: {
                type: ArgumentType.STRING,
                defaultValue: "hello world",
              },
              DELIMITER: {
                type: ArgumentType.STRING,
                defaultValue: " ",
              },
              OUTLIST: {
                type: ArgumentType.STRING,
                menu: "lists",
                defaultValue: "list",
              },
            },
          },
          {
            opcode: "join",
            blockType: BlockType.REPORTER,
            text: "join [INLIST] [DELIMITER]",
            arguments: {
              INLIST: {
                type: ArgumentType.STRING,
                menu: "lists",
                defaultValue: "list",
              },
              DELIMITER: {
                type: ArgumentType.STRING,
                defaultValue: " ",
              },
            },
          },
        ],
        menus: {
          lists: {
            acceptReporters: false,
            items: "listsMenu"
          },
        },
      };
    }

    startsWith({STRING, START}) {
      return Cast.toString(STRING).startsWith(Cast.toString(START));
    }
    endsWith({STRING, END}) {
      return Cast.toString(STRING).endsWith(Cast.toString(END));
    }
    trim({STRING}) {
      return Cast.toString(STRING).trim();
    }
    trimStart({STRING}) {
      return Cast.toString(STRING).trimStart();
    }
    trimEnd({STRING}) {
      return Cast.toString(STRING).trimEnd();
    }
    padStart({STRING, LENGTH, FILL}) {
      return Cast.toString(STRING).padStart(Cast.toNumber(LENGTH), Cast.toString(FILL));
    }
    padEnd({STRING, LENGTH, FILL}) {
      return Cast.toString(STRING).padEnd(Cast.toNumber(LENGTH), Cast.toString(FILL));
    }
    repeat({STRING, COUNT}) {
      return Cast.toString(STRING).repeat(Cast.toNumber(COUNT));
    }
    split({STRING, DELIMITER, OUTLIST}, {target}) {
      const list = target.lookupVariableByNameAndType(OUTLIST, "list");
      if (!list) return;
      list.value = Cast.toString(STRING).split(Cast.toString(DELIMITER));
      list._monitorUpToDate = false;
    }
    substring1({STRING, FROM}) {
      return Cast.toString(STRING).substring(Cast.toNumber(FROM));
    }
    substring2({STRING, FROM, TO}) {
      return Cast.toString(STRING).substring(Cast.toNumber(FROM), Cast.toNumber(TO));
    }
    indexOf({STRING, FIND}) {
      return Cast.toString(STRING).indexOf(Cast.toString(FIND));
    }
    lastIndexOf({STRING, FIND}) {
      return Cast.toString(STRING).lastIndexOf(Cast.toString(FIND));
    }
    indexOfStart({STRING, FIND, START}) {
      return Cast.toString(STRING).indexOf(Cast.toString(FIND), Cast.toNumber(START));
    }
    lastIndexOfStart({STRING, FIND, START}) {
      return Cast.toString(STRING).lastIndexOf(Cast.toString(FIND), Cast.toNumber(START));
    }
    replaceAll({STRING, FIND, REPLACE}) {
      return Cast.toString(STRING).replaceAll(Cast.toString(FIND), Cast.toString(REPLACE));
    }
    join({INLIST, DELIMITER}, {target}) {
      const list = target.lookupVariableByNameAndType(INLIST, "list");
      if (!list) return "";
      return list.join(Cast.toString(DELIMITER));
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

  Scratch.extensions.register(new StrUtils());
})(Scratch);


// [string] [starts/ends] with [search]
// in [string] split by [delimiter] replace [item] with [value]
// [string] trim [both ends/inside/start/end]
// [string] pad [start/end] with [amount] of [fill]
// split [string] by [delimiter] into [list]
// join [list] with [delimiter]
// last index of [find] in [string]
// index of [find] in [string] starting from [start]
// last index of [find] in [string] starting from [start]