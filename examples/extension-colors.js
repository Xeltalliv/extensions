(function (Scratch) {
  'use strict';

  // Testing what else can be done with code originally made for context-menu.js
  // To prevent this, while keeping that, everything inside 'extensions' can be namespaced

  class Extension {
    getInfo() {
      return {
        id: 'colors',
        name: 'Colors',
        blocks: [
          {
            opcode: 'motion',
            blockType: Scratch.BlockType.COMMAND,
            text: 'motion',
            extensions: ['colours_motion']
          },
          {
            opcode: 'looks',
            blockType: Scratch.BlockType.COMMAND,
            text: 'looks',
            extensions: ['colours_looks']
          },
          {
            opcode: 'sounds',
            blockType: Scratch.BlockType.COMMAND,
            text: 'sounds',
            extensions: ['colours_sounds']
          },
          {
            opcode: 'event',
            blockType: Scratch.BlockType.COMMAND,
            text: 'event',
            extensions: ['colours_event']
          },
          {
            opcode: 'control',
            blockType: Scratch.BlockType.COMMAND,
            text: 'control',
            extensions: ['colours_control']
          },
          {
            opcode: 'sensing',
            blockType: Scratch.BlockType.COMMAND,
            text: 'sensing',
            extensions: ['colours_sensing']
          },
          {
            opcode: 'operators',
            blockType: Scratch.BlockType.COMMAND,
            text: 'operators',
            extensions: ['colours_operators']
          },
          {
            opcode: 'data',
            blockType: Scratch.BlockType.COMMAND,
            text: 'data',
            extensions: ['colours_data']
          },
          {
            opcode: 'data_lists',
            blockType: Scratch.BlockType.COMMAND,
            text: 'data_lists',
            extensions: ['colours_data_lists']
          },
          {
            opcode: 'more',
            blockType: Scratch.BlockType.COMMAND,
            text: 'more',
            extensions: ['colours_more']
          },
          {
            opcode: 'pen',
            blockType: Scratch.BlockType.COMMAND,
            text: 'pen',
            extensions: ['colours_pen']
          },
        ]
      };
    }
  }


  // Adding support for 'extensions' block argument
  const runtime = Scratch.vm.runtime;
  const cbfsb = runtime._convertBlockForScratchBlocks.bind(runtime);
  runtime._convertBlockForScratchBlocks = function(blockInfo, categoryInfo) {
    const res = cbfsb(blockInfo, categoryInfo);
    if (blockInfo.extensions) {
      if (!res.json.extensions) res.json.extensions = [];
      res.json.extensions.push(...blockInfo.extensions);
    }
    return res;
  }
  Scratch.extensions.register(new Extension());
})(Scratch);