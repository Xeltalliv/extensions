(function (Scratch) {
  'use strict';

  class DropdownFnsExt {
    getInfo() {
      return {
        id: 'dropdownfns',
        name: 'Dropdown Functions',
        blocks: [
          {
            opcode: 'dropdown',
            blockType: Scratch.BlockType.COMMAND,
            text: 'dropdown [LIST]',
            arguments: {
              LIST: {
                type: Scratch.ArgumentType.STRING,
                menu: 'myMenu',
                defaultValue: ''
              }
            }
          }
        ],
        menus: {
          myMenu: [
            {text: "value 1", value: "1"},
            {text: "value 2", value: "2"},
            {text: "function 1", value: ()=>alert("1")},
            {text: "function 2", value: ()=>alert("2")},
          ]
        }
      };
    }
    dropdown() {}
  }
  Scratch.extensions.register(new DropdownFnsExt());
})(Scratch);