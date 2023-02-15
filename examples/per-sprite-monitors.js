(function (Scratch) {
  'use strict';

  class PerSpriteReportersExt {
    getInfo() {
      return {
        id: 'psr',
        name: 'Per sprite reporter',
        blocks: [
          {
            opcode: 'reporter',
            blockType: Scratch.BlockType.REPORTER,
            text: "reporter",
            noLabel: true,
          }
        ]
      };
    }
    reporter(args, util, bi) {
      return `At ${Math.round(util.target.x)} ${Math.round(util.target.y)}`;
    }
  }
  const runtime = Scratch.vm.runtime;
  runtime.monitorBlockInfo.psr_reporter = {
    isSpriteSpecific: true,
    getId: targetId => `${targetId}_reporter`  // getId is only used for saving/loading
  }


  // Same as monitors-with-fields.js
  // Adding 'noLabel' and (not used) 'labelFn'
  runtime.getLabelForOpcode = function(extendedOpcode) {
    const pos = extendedOpcode.indexOf('_');
    const category = extendedOpcode.substr(0, pos);
    const opcode = extendedOpcode.substr(pos+1);

    const categoryInfo = this._blockInfo.find(ci => ci.id === category);
    if (!categoryInfo) return;

    const block = categoryInfo.blocks.find(b => b.info.opcode === opcode);
    if (!block) return;

    return {
      category: 'extension',
      label: block.info.noLabel ? block.info.text : `${categoryInfo.name}: ${block.info.text}`,
      labelFn: block.info.labelFn
    };
  }


  // Change block xml depending on target.
  // Basically this: https://github.com/LLK/scratch-gui/blob/tree/src/lib/make-toolbox-xml.js
  // Can also be achieved with custom dynamic toolboxes,
  // but working with Blockly/ScratchBlocks is ugly and less stable
  const gbx = runtime.getBlocksXML.bind(runtime);
  runtime.getBlocksXML = function(target) {
    const ext = runtime._blockInfo.find(ext => ext.id == 'psr');
    const block = ext.blocks.find(block => block.info.opcode == 'reporter');
    block.xml = `<block id="${target.id}_reporter" type="psr_reporter"/>`;
    return gbx(target);
  }

  Scratch.extensions.register(new PerSpriteReportersExt());
})(Scratch);