(function (Scratch) {
  'use strict';

  let connected = false;

  class StatusButtonExt {
    getInfo() {
      return {
        id: 'statusbutton',
        name: 'Status',
        showStatusButton: true,
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'block',
            arguments: {},
          },
        ]
      };
    }
    block() {}
    isConnected() {
      return connected;
    }
    scan(...args) {
      console.log('scan', args);
      setTimeout(() => Scratch.vm.runtime.emit('PERIPHERAL_LIST_UPDATE', [{peripheralId:'no',name:'no',rssi:-50}]), 100); //rssi is -100 to 0
    }
    disconnect(...args) {
      console.log('disconnect', args);
      connected = false;
      setTimeout(() => Scratch.vm.runtime.emit('PERIPHERAL_DISCONNECTED'), 100);
    }
    connect(...args) {
      console.log('connect', args);
      connected = true;
      setTimeout(() => Scratch.vm.runtime.emit('PERIPHERAL_CONNECTED'), 100);
    }
  }
  const ext = new StatusButtonExt();
  Scratch.vm.runtime.registerPeripheralExtension('statusbutton', ext);
  Scratch.extensions.register(ext);
})(Scratch);