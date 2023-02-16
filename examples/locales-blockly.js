(function (Scratch) {
  'use strict';

  class Extension {
    getInfo() {
      return {
        id: 'locales',
        name: 'Languages',
        blocks: [
          {
            opcode: 'languageBlock',
            blockType: Scratch.BlockType.COMMAND,
            text: '%{BKY_LANGUAGE_BLOCK}'
          }
        ]
      };
    }
    languageBlock() {}
  }

  const ScratchMsgs = ScratchBlocks.ScratchMsgs
  const locales = ScratchMsgs.locales;
  locales.en.LANGUAGE_BLOCK = "Try changing language";
  locales.ru.LANGUAGE_BLOCK = "Попробуй переключать язык";
  locales.uk.LANGUAGE_BLOCK = "Спробуй перемикати мову";
  ScratchMsgs.setLocale(ScratchMsgs.currentLocale_); // Refresh ScratchBlocks.Msg

  Scratch.extensions.register(new Extension());
})(Scratch);