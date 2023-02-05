// It doesn't fully work

// TODO:
// try https://github.com/LLK/scratch-gui/blob/9d065daabc1bf5fe47b06225cc2e04594a06d5b6/src/containers/blocks.jsx#L455

(function (Scratch) {
  'use strict';

  // https://stackoverflow.com/a/11127438
  // https://github.com/google/closure-library/blob/78d73f799d02225d1404f29013a589f35037a597/closure/goog/base.js#L1832-L1838
  const inherits = function(childCtor, parentCtor) {
    /** @constructor */
    function tempCtor() {};
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    /** @override */
    childCtor.prototype.constructor = childCtor;
  };

  // https://github.com/LLK/scratch-blocks/blob/893c7e7ad5bfb416eaed75d9a1c93bdce84e36ab/core/field_angle.js
  ScratchBlocks.FieldYesNo = function(opt_value, opt_validator) {
    opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
    ScratchBlocks.FieldYesNo.superClass_.constructor.call(
        this, opt_value, opt_validator);
    this.addArgType('yesno');
  };
  inherits(ScratchBlocks.FieldYesNo, ScratchBlocks.FieldTextInput);

  ScratchBlocks.FieldYesNo.prototype.showEditor_ = function() {
    ScratchBlocks.FieldYesNo.superClass_.showEditor_.call(this, this.useTouchInteraction_);
    ScratchBlocks.DropDownDiv.hideWithoutAnimation();
    ScratchBlocks.DropDownDiv.clearContent();
    var div = ScratchBlocks.DropDownDiv.getContentDiv();
    var yesButton = document.createElement("button");
    var noButton = document.createElement("button");
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
    console.log(this);

    ScratchBlocks.DropDownDiv.setColour(this.sourceBlock_.parentBlock_.getColour(), this.sourceBlock_.getColourTertiary());
    ScratchBlocks.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
    ScratchBlocks.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);
  };

  // https://github.com/LLK/scratch-vm/blob/f405e59d01a8f9c0e3e986fb5276667a8a3c7d40/test/unit/extension_conversion.js#L85-L124
  // https://github.com/LLK/scratch-vm/commit/ceaa3c7857b79459ccd1b14d548528e4511209e7
  vm.addListener('EXTENSION_FIELD_ADDED', fieldInfo => {
     ScratchBlocks.Field.register(fieldInfo.name, fieldInfo.implementation);
  });

  class CustomFieldsExt {
    getInfo() {
      return {
        id: 'customfields',
        name: 'CF',
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
            implementation: {
              fromJson: (args) => {console.log(args); return new ScratchBlocks.FieldYesNo(args['yesno']);}
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