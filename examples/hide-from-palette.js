(function (Scratch) {
  'use strict';

  class Extension {
    getInfo() {
      return {
        id: 'hide',
        name: 'Hide from palette',
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.COMMAND,
            hideFromPalette: true,
            text: 'block'
          }
        ]
      };
    }
    block() {}
  }
  Scratch.extensions.register(new Extension());
})(Scratch);