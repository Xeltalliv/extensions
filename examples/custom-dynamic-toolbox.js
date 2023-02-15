(function (Scratch) {
  'use strict';

  class Extension {
    getInfo() {
      return {
        id: 'customToolbox',
        name: 'Custom Toolbox',
        custom: 'MY_CUSTOM_TOOLBOX',
        blocks: []
      };
    }
  }

  // Adding support for 'custom' property to all extensions
  // Probably needs to be sanitized
  const runtime = Scratch.vm.runtime;
  const fec = runtime._fillExtensionCategory.bind(runtime);
  runtime._fillExtensionCategory = function(categoryInfo, extensionInfo) {
    if(extensionInfo.custom) categoryInfo.custom = extensionInfo.custom;
    fec(categoryInfo, extensionInfo);
  }
  const gbx = runtime.getBlocksXML.bind(runtime);
  runtime.getBlocksXML = function(target) {
    const categoryInfo = this._blockInfo;
    const res = gbx(target);
    res.forEach((elem, idx) => {
      const custom = categoryInfo[idx].custom;
      if (custom) {
        elem.xml = `${elem.xml.substr(0,10)} custom='${custom}' ${elem.xml.substr(9)}`
      }
    });
    return res;
  }



  // Adding styles for styled label
  const style = document.createElement('style');
  style.textContent = '.myLabelStyle>.blocklyFlyoutLabelText { font-style: italic; fill: green; }';
  document.body.append(style);




  // Defining custom toolbox
  const vm = Scratch.vm;
  vm.addListener('EXTENSION_ADDED', tryUseBlockly);
  vm.addListener('BLOCKSINFO_UPDATE', tryUseBlockly);
  tryUseBlockly();

  function tryUseBlockly() {
    if (!window.Blockly) return;

    vm.removeListener('EXTENSION_ADDED', tryUseBlockly);
    vm.removeListener('BLOCKSINFO_UPDATE', tryUseBlockly);

    Blockly.getMainWorkspace().registerToolboxCategoryCallback('MY_CUSTOM_TOOLBOX', () => {
      const block1 = document.createElement('block');
      block1.setAttribute('type', 'looks_show');
      const label1 = document.createElement('label');
      label1.setAttribute('text', 'This is label');
      const block2 = document.createElement('block');
      block2.setAttribute('type', 'looks_hide');
      // https://developers.google.com/blockly/guides/configure/web/toolbox#buttons_and_labels
      const label2 = document.createElement('label');
      label2.setAttribute('text', 'This is styled label');
      label2.setAttribute('web-class', 'myLabelStyle');
      return [block1, label1, block2, label2];
    })
  }
  Scratch.extensions.register(new Extension());
})(Scratch);