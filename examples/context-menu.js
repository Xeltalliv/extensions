(function (Scratch) {
  'use strict';

  const vm = Scratch.vm;
  const runtime = vm.runtime;

  class ContextMenuExt {
    getInfo() {
      return {
        id: 'contextmenu',
        name: 'Context menu',
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'block',
            extensions: ['test_context_menu']
          }
        ]
      };
    }
    block() {}
  }


  // Adding support for "extensions" block argument
  const cbfsb = runtime._convertBlockForScratchBlocks.bind(runtime);
  runtime._convertBlockForScratchBlocks = function(blockInfo, categoryInfo) {
    const res = cbfsb(blockInfo, categoryInfo);
    if (blockInfo.extensions) {
      if (!res.json.extensions) res.json.extensions = [];
      res.json.extensions.push(...blockInfo.extensions);
    }
    return res;
  }



  // Waiting for ScratchBlocks to become availible
  vm.addListener("EXTENSION_ADDED", tryUseScratchBlocks);
  vm.addListener("BLOCKSINFO_UPDATE", tryUseScratchBlocks);

  function tryUseScratchBlocks() {
    if (!window.ScratchBlocks) return;

    vm.removeListener("EXTENSION_ADDED", tryUseScratchBlocks);
    vm.removeListener("BLOCKSINFO_UPDATE", tryUseScratchBlocks);

    // Just a simple example. For more advanced ways to use it see:
    // https://github.com/LLK/scratch-blocks/blob/bdfeaef0f2021997b85385253604690aa24f299a/blocks_vertical/data.js#L569-L617
    window.ScratchBlocks.Extensions.registerMixin('test_context_menu', {
      customContextMenu: function(options) {
        options.splice(0, 0, {
          text: 'Alert start',
          enabled: true,
          callback: () => alert(1)
        });
        options.push({
          text: 'Alert end',
          enabled: true,
          callback: () => alert(1)
        });
      }
    });
  }
  Scratch.extensions.register(new ContextMenuExt());
})(Scratch);