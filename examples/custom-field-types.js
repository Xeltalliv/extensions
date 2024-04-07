(function (Scratch) {
  'use strict';

  const vm = Scratch.vm;
  const runtime = vm.runtime;

  // This is optional but makes changing the name easier.
  Scratch.ArgumentType.YESNO = 'FieldXeltallivYesNo';

  // Scratch devs forgot to add functionality to change color1, color2, color3
  // for custom fields separately from the category colors, even though
  // it is important feature used by almost all default inputs. Example:
  // https://github.com/LLK/scratch-blocks/blob/bdfeaef0f2021997b85385253604690aa24f299a/blocks_common/math.js#L52-L54
  const bcfi = runtime._buildCustomFieldInfo.bind(runtime);
  const bcftfsb = runtime._buildCustomFieldTypeForScratchBlocks.bind(runtime);
  let fi = null;
  runtime._buildCustomFieldInfo = function (fieldName, fieldInfo, extensionId, categoryInfo) {
    fi = fieldInfo;
    return bcfi(fieldName, fieldInfo, extensionId, categoryInfo);
  };
  runtime._buildCustomFieldTypeForScratchBlocks = function (fieldName, output, outputShape, categoryInfo) {
    let res = bcftfsb(fieldName, output, outputShape, categoryInfo);
    if (fi) {
      if (fi.color1) res.json.colour = fi.color1;
      if (fi.color2) res.json.colourSecondary = fi.color2;
      if (fi.color3) res.json.colourTertiary = fi.color3;
      fi = null;
    }
    return res;
  };

  // Fields are added later
  const customFieldTypes = {},
    toRegisterOnBlocklyGot = [];
  let implementations = {}, Blockly = null;

  // Implement the field types setup
  implementations[Scratch.ArgumentType.YESNO] = null;
  customFieldTypes[Scratch.ArgumentType.YESNO] = {
    output: 'string',
    outputShape: 2,
    color1: '#FFFFFF',
    color2: '#FFFFFF',
    color3: '#FFFFFF',
    implementation: {
      // args is seemingly useless
      // and we use new implementations[...] instead of the class itself
      fromJson: (args) => new implementations[Scratch.ArgumentType.YESNO](args['yesno']),
      /*              fromJson: (args) => {console.log(args); return new FieldYesNo(args['yesno']);}*/
      /*              fromJson: (args) => {console.log(args); return new Blockly.FieldCheckbox(args['checked'] ? 'TRUE' : 'FALSE')}*/
      /*              fromJson: (args) => new Blockly.FieldColour(args['colour']) */
      /*              fromJson: (args) => {console.log(args); return new Blockly.FieldNote(args['note'])}*/
    },
  };

  // Some patching based on https://github.com/AshimeeAlt/survs-gallery/blob/main/extensions/0znzw/MoreFields.js
  function onBlockly(_Blockly) {
    Blockly = _Blockly;
    // This fixes a bug where modifying size_.height in updateWidth causes weird issues when dragged,
    // See MoreFields.js at FieldInlineTextarea for reference of usage.
    // https://github.com/FurryR/ Made this patch.
    const _endBlockDrag = Blockly.BlockDragger.prototype.endBlockDrag;
    Blockly.BlockDragger.prototype.endBlockDrag = function (...a) {
      _endBlockDrag.call(this, ...a);
      for (const childBlock of this.draggingBlock_.childBlocks_) {
        const inputList = childBlock.inputList;
        if (inputList.length === 1 && inputList[0].fieldRow.length === 1 && !!inputList[0].fieldRow[0]?.inlineDblRender) childBlock.render();
      }
    };

    // Create the classes and update the implementations to be the classes
    implementations[Scratch.ArgumentType.YESNO] = class FieldYesNo extends Blockly.FieldTextInput {
      // For future reference on field functions please refer to:
      // https://developers.google.com/blockly/reference/js/blockly.field_class
      // field based on https://github.com/LLK/scratch-blocks/blob/893c7e7ad5bfb416eaed75d9a1c93bdce84e36ab/core/field_angle.js
      constructor(opt_value, opt_validator) {
        opt_value = opt_value && !isNaN(opt_value) ? String(opt_value) : '0';
        super(opt_value, opt_validator);
        this.addArgType('yesno'); // Not sure what this it, whether I'm using it correctly or even if it is needed
      }

      showEditor_() {
        // Basically: Blockly.FieldTextInput.prototype.showEditor_.call(this, this.useTouchInteraction_);
        this.__proto__.__proto__.showEditor_.call(this, this.useTouchInteraction_);
        Blockly.DropDownDiv.hideWithoutAnimation();
        Blockly.DropDownDiv.clearContent();
        var div = Blockly.DropDownDiv.getContentDiv();
        var yesButton = document.createElement('button');
        var noButton = document.createElement('button');
        yesButton.style['background-color'] = this.sourceBlock_.getColourTertiary();
        noButton.style['background-color'] = this.sourceBlock_.getColourTertiary();
        yesButton.style['border'] = 'none';
        noButton.style['border'] = 'none';
        yesButton.style['border-radius'] = '5px';
        noButton.style['border-radius'] = '5px';
        yesButton.style['margin'] = '2px';
        noButton.style['margin'] = '2px';
        yesButton.textContent = 'Yes';
        noButton.textContent = 'No';
        yesButton.addEventListener('click', () => {
          Blockly.FieldTextInput.htmlInput_.value = 'Yes';
          this.setValue('Yes');
        });
        noButton.addEventListener('click', () => {
          Blockly.FieldTextInput.htmlInput_.value = 'No';
          this.setValue('No');
        });
        div.append(yesButton, noButton);
        //console.log(this);

        Blockly.DropDownDiv.setColour(this.sourceBlock_.parentBlock_.getColour(), this.sourceBlock_.getColourTertiary());
        Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
        Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);
      }
    };

    // Registering anything we might have missed
    while (toRegisterOnBlocklyGot.length > 0) {
      const [name, impl] = toRegisterOnBlocklyGot.shift();
      Blockly.Field.register(name, impl);
    }

    // Forcefully refreshing stuff
    // https://github.com/TurboWarp/addons/blob/tw/addons/custom-block-shape/update-all-blocks.js
    const eventsOriginallyEnabled = Blockly.Events.isEnabled(),
      workspace = Blockly.getMainWorkspace();
    Blockly.Events.disable();
    if (workspace) {
      if (vm.editingTarget) {
        vm.emitWorkspaceUpdate();
      }
      const flyout = workspace.getFlyout();
      if (flyout) {
        const flyoutWorkspace = flyout.getWorkspace();
        Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.workspaceToDom(flyoutWorkspace), flyoutWorkspace);
        workspace.getToolbox().refreshSelection();
        workspace.toolboxRefreshEnabled_ = true;
      }
    }
    if (eventsOriginallyEnabled) Blockly.Events.enable();

    // Exposing the field if you want
    Blockly[Scratch.ArgumentType.YESNO] = implementations[Scratch.ArgumentType.YESNO];
  }

  // https://github.com/LLK/scratch-vm/blob/f405e59d01a8f9c0e3e986fb5276667a8a3c7d40/test/unit/extension_conversion.js#L85-L124
  // https://github.com/LLK/scratch-vm/commit/ceaa3c7857b79459ccd1b14d548528e4511209e7
  vm.addListener('EXTENSION_FIELD_ADDED', (fieldInfo) => {
    if (Blockly) Blockly.Field.register(fieldInfo.name, fieldInfo.implementation);
    else toRegisterOnBlocklyGot.push([fieldInfo.name, fieldInfo.implementation]);
  });

  // Passes "Blockly" to onBlockly if Scratch.gui is avalible as it does not exist when packaged.
  if (typeof Scratch?.gui === 'object') Scratch.gui.getBlockly().then((Blockly) => onBlockly(Blockly));

  class CustomFieldsExt {
    getInfo() {
      return {
        id: 'customfields',
        name: 'Custom Fields',
        blocks: [
          {
            opcode: 'test',
            blockType: Scratch.BlockType.COMMAND,
            text: 'test x: [X] y: [Y]',
            arguments: {
              X: {
                type: Scratch.ArgumentType.YESNO,
                defaultValue: 'No', //#ff0000,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
        ],
        customFieldTypes,
      };
    }
    test(args) {
      console.log(args);
    }
  }
  Scratch.extensions.register(new CustomFieldsExt());
})(Scratch);
// u will never notice but ashime says hi :P
