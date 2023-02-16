(function (Scratch) {
  'use strict';

  const all = {
    en: "Try changing language",
    ru: "Попробуй переключать язык",
    uk: "Спробуй перемикати мову",
  }

  // https://github.com/LLK/scratch-gui/blob/ba76db7350bd43b79119cac2701bc10f6c511f0c/src/containers/language-selector.jsx#L22
  class Extension {
    getInfo() {
      return {
        id: 'locales',
        name: 'Languages',
        blocks: [
          {
            opcode: 'languageBlock',
            blockType: Scratch.BlockType.COMMAND,
            text: all[document.documentElement.lang]
          }
        ]
      };
    }
    languageBlock() {}
  }

  Scratch.extensions.register(new Extension());
})(Scratch);

