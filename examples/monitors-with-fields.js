(function (Scratch) {
  'use strict';

  const fnToGetDate = {
    second: "getSeconds",
    minute: "getMinutes",
    hour: "getHours"
  }

  class FieldMonitorsExt {
    getInfo() {
      return {
        id: 'fieldMonitors',
        name: 'Field monitors',
        blocks: [
          {
            opcode: 'current',
            blockType: Scratch.BlockType.REPORTER,
            text: 'current [THING]',
            enableMonitor: true,
            labelFn: ({THING}) => THING,
            arguments: {
              THING: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'second',
                menu: 'thing'
              }
            }
          }
        ],
        menus: {
          thing: ["second", "minute", "hour"]
        }
      };
    }
    current({THING}) {
      const date = new Date();
      const fnName = fnToGetDate[THING];
      if (!fnName) return -1;
      return date[fnName]();
    }
  }
  const runtime = Scratch.vm.runtime;





  // Same as per-sprite-monitors.js
  // Adding (not used) 'noLabel' and 'labelFn'
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


  // Normally extensions can't have blocks with inputs and checkboxes at the same time.
  // Adding an option 'enableMonitor' to be able to do it, similarly to existing 'disableMonitor'
  const cbfsb = runtime._convertBlockForScratchBlocks.bind(runtime);
  runtime._convertBlockForScratchBlocks = function(blockInfo, categoryInfo) {
    const res = cbfsb(blockInfo, categoryInfo);
    if (blockInfo.enableMonitor) res.json.checkboxInFlyout = true;
    return res;
  }


  Scratch.extensions.register(new FieldMonitorsExt());
})(Scratch);