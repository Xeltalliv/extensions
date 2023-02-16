(function (Scratch) {
  'use strict';

  //const locales = document.getElementById('app')._reactRootContainer._internalRoot.current.child.pendingProps.store.getState().locales.messagesByLocale
  const locales = ReduxStore.getState().locales.messagesByLocale;
  let formatMessage = null;

  class Extension {
    getInfo() {
      return {
        id: 'locales',
        name: 'Languages',
        blocks: [
          {
            opcode: 'languageBlock',
            blockType: Scratch.BlockType.COMMAND,
            text: formatMessage ? formatMessage({
              id: 'locales.languageBlock',
              default: 'Try changing language',
              description: 'a block that changes depending on a language'
            }) : "haven't caught intl.formatMessage yet"
          }
        ]
      };
    }
    block() {}
  }
  locales.en['locales.languageBlock'] = "Try changing language";
  locales.ru['locales.languageBlock'] = "Попробуй переключать язык";
  locales.uk['locales.languageBlock'] = "Спробуй перемикати мову";

  const a = Object.assign;
  Object.assign = function(...args) {
    args.forEach(arg => {
      if(arg && arg.intl) {
        formatMessage = arg.intl.formatMessage;
      }
    });
    return a(...args);
  }

  Scratch.extensions.register(new Extension());
})(Scratch);