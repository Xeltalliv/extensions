(function (Scratch) {
  'use strict';

  if (!window.ScratchBlocks) alert("ScratchBlocks is not defined! Enter the editor and try refreshing the page");

  // based on https://github.com/LLK/scratch-blocks/blob/893c7e7ad5bfb416eaed75d9a1c93bdce84e36ab/core/field_angle.js
  class FieldYesNo extends ScratchBlocks.FieldTextInput {
    constructor(opt_value, opt_validator) {
      opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
      super(opt_value, opt_validator);
      this.addArgType('yesno'); // Not sure what this it, whether I'm using it correctly or even if it is needed
    }

    showEditor_() {
      this.__proto__.__proto__.showEditor_.call(this, this.useTouchInteraction_);
      ScratchBlocks.DropDownDiv.hideWithoutAnimation();
      ScratchBlocks.DropDownDiv.clearContent();
      var div = ScratchBlocks.DropDownDiv.getContentDiv();
      var yesButton = document.createElement("button");
      var noButton = document.createElement("button");
      yesButton.style['background-color'] = this.sourceBlock_.getColourTertiary();
      noButton.style['background-color'] = this.sourceBlock_.getColourTertiary();
      yesButton.style['border'] = 'none';
      noButton.style['border'] = 'none';
      yesButton.style['border-radius'] = '5px';
      noButton.style['border-radius'] = '5px';
      yesButton.style['margin'] = '2px';
      noButton.style['margin'] = '2px';
      yesButton.textContent = "Yes";
      noButton.textContent = "No";
      yesButton.addEventListener("click", () => {
        ScratchBlocks.FieldTextInput.htmlInput_.value = "Yes";
        this.setValue("Yes");
      });
      noButton.addEventListener("click", () => {
        ScratchBlocks.FieldTextInput.htmlInput_.value = "No";
        this.setValue("No");
      });
      div.append(yesButton, noButton);
      //console.log(this);
  
      ScratchBlocks.DropDownDiv.setColour(this.sourceBlock_.parentBlock_.getColour(), this.sourceBlock_.getColourTertiary());
      ScratchBlocks.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
      ScratchBlocks.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);
    };
  }

  // Scratch devs forgot to add functionality to change color1, color2, color3
  // for custom fields separately from the category colors, even though
  // it is important feature used by almost all default inputs. Example:
  // https://github.com/LLK/scratch-blocks/blob/bdfeaef0f2021997b85385253604690aa24f299a/blocks_common/math.js#L52-L54
  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const bcfi = runtime._buildCustomFieldInfo.bind(runtime);
  const bcftfsb = runtime._buildCustomFieldTypeForScratchBlocks.bind(runtime);
  let fi = null;
  runtime._buildCustomFieldInfo = function(fieldName, fieldInfo, extensionId, categoryInfo) {
    fi = fieldInfo;
    return bcfi(fieldName, fieldInfo, extensionId, categoryInfo);
  }
  runtime._buildCustomFieldTypeForScratchBlocks = function(fieldName, output, outputShape, categoryInfo) {
    let res = bcftfsb(fieldName, output, outputShape, categoryInfo);
    if (fi) {
      if (fi.color1) res.json.colour = fi.color1;
      if (fi.color2) res.json.colourSecondary = fi.color2;
      if (fi.color3) res.json.colourTertiary = fi.color3;
      fi = null;
    }
    return res;
  }

  // https://github.com/LLK/scratch-vm/blob/f405e59d01a8f9c0e3e986fb5276667a8a3c7d40/test/unit/extension_conversion.js#L85-L124
  // https://github.com/LLK/scratch-vm/commit/ceaa3c7857b79459ccd1b14d548528e4511209e7
  vm.addListener('EXTENSION_FIELD_ADDED', fieldInfo => {
     ScratchBlocks.Field.register(fieldInfo.name, fieldInfo.implementation);
  });

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
                type: "yesno",
                defaultValue: "No", //#ff0000,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100,
              },
            },
          },
        ],
        customFieldTypes: {
          yesno: {
            output: 'string',
            outputShape: 2,
            color1: '#FFFFFF',
            color2: '#FFFFFF',
            color3: '#FFFFFF',
            implementation: {
              fromJson: (args) => new FieldYesNo(args['yesno'])
/*              fromJson: (args) => {console.log(args); return new FieldYesNo(args['yesno']);}*/
/*              fromJson: (args) => {console.log(args); return new ScratchBlocks.FieldCheckbox(args['checked'] ? 'TRUE' : 'FALSE')}*/
/*              fromJson: (args) => new ScratchBlocks.FieldColour(args['colour']) */
/*              fromJson: (args) => {console.log(args); return new ScratchBlocks.FieldNote(args['note'])}*/
            }
          }
        }
      };
    }
    test(args) {
      console.log(args);
    }
  }
  Scratch.extensions.register(new CustomFieldsExt());
})(Scratch);