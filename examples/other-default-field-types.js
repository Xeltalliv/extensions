(function (Scratch) {
  'use strict';

  const ArgumentType = Scratch.ArgumentType
  const runtime = vm.runtime;
  ArgumentType.VARIABLE = 'variable';
  ArgumentType.VERTICAL_SEPARATOR = 'vertical_separator';
  ArgumentType.VARIABLE_GETTER = 'variable_getter';
  ArgumentType.LABEL = 'label';
  ArgumentType.LABEL_SERIALIZABLE = 'label_serializable';

  class Extension {
    getInfo() {
      return {
        id: 'fields',
        name: 'Fields',
        blocks: [
          {
            opcode: 'varPicker',
            func: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'var [TEST]',
            arguments: {
              TEST: {
                type: Scratch.ArgumentType.VARIABLE,
                variableType: '',
                variable: 'my variable'
              }
            }
          },
          {
            opcode: 'listPicker',
            func: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'list [TEST]',
            arguments: {
              TEST: {
                type: Scratch.ArgumentType.VARIABLE,
                variableType: 'list',
                variable: 'my list'
              }
            }
          },
          {
            opcode: 'separators',
            func: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'separated [SEP1] separated [SEP2] separated',
            arguments: {
              SEP1: {
                type: Scratch.ArgumentType.VERTICAL_SEPARATOR,
              },
              SEP2: {
                type: Scratch.ArgumentType.VERTICAL_SEPARATOR,
              }
            }
          },
          {
            opcode: 'variablegetter',
            func: 'block',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[TEST]',
            arguments: {
              TEST: {
                type: Scratch.ArgumentType.VARIABLE_GETTER,
                text: 'HELLO',
                variableType: ''
              }
            }
          },
          {
            opcode: 'label',
            func: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'label block [TEST]',
            arguments: {
              TEST: {
                type: Scratch.ArgumentType.LABEL,
                text: 'LABEL',
                class: 'red-bold'
              }
            }
          },
          {
            opcode: 'slabel',
            func: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'serializable label block [TEST]',
            arguments: {
              TEST: {
                type: Scratch.ArgumentType.LABEL_SERIALIZABLE,
                text: 'LABEL',
                class: 'red-bold'
              }
            }
          },
        ]
      };
    }
    block(args) {
      console.log(args);
    }
  }


  const cp = runtime._convertPlaceholders.bind(runtime);
  runtime._convertPlaceholders = function(context, match, placeholder) {
    const retVal = cp(context, match, placeholder);

    const argInfo = context.blockInfo.arguments[placeholder] || {};
    const argsName = `args${context.outLineNum}`;
    const blockArgs = context.blockJSON[argsName];
    const argJSON = blockArgs[blockArgs.length-1];
    
    if (argInfo.type === ArgumentType.VARIABLE) {
      argJSON.type = 'field_variable';
      argJSON.variableTypes = [argInfo.variableType ?? ''];
      if (argInfo.variable) argJSON.variable = argInfo.variable;
    }
    if (argInfo.type === ArgumentType.VERTICAL_SEPARATOR) {
      argJSON.type = 'field_vertical_separator';
    }
    if (argInfo.type === ArgumentType.VARIABLE_GETTER) {
      argJSON.type = 'field_variable_getter';
      argJSON.text = argInfo.text;
      argJSON.class = argInfo.variableType; // THIS IS A MISTAKE IN SCRATCH CODE
    }
    if (argInfo.type === ArgumentType.LABEL_SERIALIZABLE) {
      argJSON.type = 'field_label_serializable';
      argJSON.text = argInfo.text;
      argJSON.class = argInfo.class;
    }
    if (argInfo.type === ArgumentType.LABEL) {
      argJSON.type = 'field_label_serializable';
      argJSON.text = argInfo.text;
      argJSON.class = argInfo.class;
    }
    return retVal;
  }

  const style = document.createElement('style');
  style.textContent = '.red-bold { font-weight: bold; fill: red; } .red-bold:hover {fill: blue;}';
  document.body.append(style);

  Scratch.extensions.register(new Extension());
})(Scratch);