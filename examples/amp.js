(function (Scratch) {
  'use strict';

  class Extension {
    getInfo() {
      return {
        id: 'amp',
        name: '&lt;Things &amp; things&gt;',
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'block'
          }
        ]
      };
    }
    block() {}
  }

  // https://github.com/TurboWarp/scratch-blocks/blob/5f1ef75ed769f185df945e2ed6b34ea8639ae67e/core/toolbox.js#L195-L214
  ScratchBlocks.Toolbox.prototype.showAll_ = function() {
    var allContents = [];
    for (var i = 0; i < this.categoryMenu_.categories_.length; i++) {
      var category = this.categoryMenu_.categories_[i];
      //                                       VVVVVVV              V
      var labelString = '<xml><label text="' + encode(category.name_) + '"' +
        ' id="' + category.id_ + '"' +
        ' category-label="true"' +
        ' showStatusButton="' + category.showStatusButton_ + '"' +
        ' web-class="categoryLabel">' +
        '</label></xml>';
      var labelXML = Blockly.Xml.textToDom(labelString);
  
      allContents.push(labelXML.firstChild);
  
      allContents = allContents.concat(category.getContents());
    }
    this.flyout_.show(allContents);
  };

  function encode(string) {
    let out = '';
    for(let i=0; i<string.length; i++) {
      const char = string[i];
      switch(char) {
        case '>':
        case '<':
        case '"':
        case '&':
          out += '&#'+char.charCodeAt(0)+";";
          break;
        default:
          out += char;
      }
    }
    return out;
  };

  Scratch.extensions.register(new Extension());
})(Scratch);