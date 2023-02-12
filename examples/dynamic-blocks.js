(function (Scratch) {
  'use strict';

  const vm = Scratch.vm;
  const runtime = vm.runtime;

  class IsDynamicExtension {
    getInfo () {
      return {
        id: 'dynamic',
        name: 'isDynamic property',
        blocks: [
          {
            isDynamic: true,
            opcode: 'customBlock',
            text: 'Customizable block'
          },
          {
            isDynamic: true,
            opcode: 'customBlock',
            text: 'Same block'
          }
        ],
      };
    }

    customBlock(args, util, blockInfo) {
      if (!blockInfo) alert('Please disable compiler');
      else console.log(blockInfo);
    }
  }


  
  let Blockly = null;
  let interval = setInterval(check, 1000);
  function check() {
    if (ScratchBlocks) {
      clearInterval(interval);
      Blockly = ScratchBlocks;
      addContextMenu();
    }
  }

  function addContextMenu() {
    // Modifying https://github.com/LLK/scratch-blocks/blob/997b9911aad3f7800f3ae2573e06d61182cce0c0/core/block_svg.js#L669-L694
    // This is a bad way to do it. Please don't do this in actual extensions
    Blockly.BlockSvg.prototype.showContextMenu_ = function(a) {
      if (!this.workspace.options.readOnly && this.contextMenu) {
        var b = [];
        // START OF NEW
        var json = this.blockInfoText ? JSON.parse(this.blockInfoText) : {};
        var next = json.isTerminal ? 'Enable' : 'Disbale';
        if (this.type == 'dynamic_customBlock') {
          b.push({text:'Rename', enabled: true, callback: () => {
            modify(this, info => info.text = prompt('Block name'));
          }}); 
          b.push({text:'Colour', enabled: true, callback: () => {
            modify(this, info => info.color1 = prompt('Colour (example #FFFFFF)'));
          }}); 
          b.push({text: next+' bottom connector', enabled: this.childBlocks_.length === 0, callback: () => {
            modify(this, info => info.isTerminal = !info.isTerminal);
          }}); 
        }
        // END OF NEW
        if (this.isDeletable() && this.isMovable() && !this.isInFlyout)
          b.push(Blockly.ContextMenu.blockDuplicateOption(this, a)),
          this.isEditable() && this.workspace.options.comments && b.push(Blockly.ContextMenu.blockCommentOption(this)),
          b.push(Blockly.ContextMenu.blockDeleteOption(this));
        else if (this.parentBlock_ && this.isShadow_) {
          this.parentBlock_.showContextMenu_(a);
          return
        }
        this.customContextMenu && this.customContextMenu(b);
        Blockly.ContextMenu.show(a, b, this.RTL);
        Blockly.ContextMenu.currentBlock = this;
      }
    }
  }

  function modify(block, change) {
    let mutation = block.mutationToDom();
    let bi = JSON.parse(mutation.getAttribute('blockInfo'));
    change(bi);
    mutation.setAttribute('blockInfo', JSON.stringify(bi));
    block.needsBlockInfoUpdate = true;
    for (let input of block.inputList) {
      block.removeInput(input.name, true); // true = disable warnings when missing. names are often the same
    }
    updateMutation(block, mutation);
  }

  // Based on https://github.com/LLK/scratch-blocks/blob/develop/core/procedures.js
  function updateMutation(block, mutation) {
    var oldMutationDom = block.mutationToDom();
    var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
    block.domToMutation(mutation);
    var newMutationDom = block.mutationToDom();
    var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
    Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldMutation, newMutation));
  }


  Scratch.extensions.register(new IsDynamicExtension());
})(Scratch);