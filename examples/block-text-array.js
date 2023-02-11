(function (Scratch) {
  'use strict';

  class TextArrayExt {
    getInfo() {
      return {
        id: 'textarray',
        name: 'Text Array',
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.COMMAND,
            branchCount: 3,
            text: [
              'part 1',
              'part 2',
              'part 3',
              'end'
            ]
          }
        ]
      };
    }
    block() {}
  }
  Scratch.extensions.register(new TextArrayExt());
})(Scratch);