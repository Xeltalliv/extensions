(function (Scratch) {
  'use strict';

  class Extension {
    getInfo() {
      return {
        id: 'wokingButton',
        name: 'Button',
        blocks: [
          {
            blockType: Scratch.BlockType.BUTTON,
            text: 'Working button',
            func: 'CUSTOM_BUTTON'
          }
        ]
      };
    }
  }

  vm.addListener('EXTENSION_ADDED', tryUseBlockly);
  vm.addListener('BLOCKSINFO_UPDATE', tryUseBlockly);
  tryUseBlockly();

  function tryUseBlockly() {
    if (!window.Blockly) return;

    vm.removeListener('EXTENSION_ADDED', tryUseBlockly);
    vm.removeListener('BLOCKSINFO_UPDATE', tryUseBlockly);

    Blockly.getMainWorkspace().registerButtonCallback('CUSTOM_BUTTON', () => alert('It works!'));
  }

  Scratch.extensions.register(new Extension());
})(Scratch);