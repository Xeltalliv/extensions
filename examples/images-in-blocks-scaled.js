(function (Scratch) {
  'use strict';

  const img1 = 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20width%3D%2220px%22%20height%3D%2220px%22%20viewBox%3D%220%200%2020%2020%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cg%20id%3D%22Paint-Editor-V1%22%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M16.1998226%2C6.58685277%20C15.5417294%2C7.94213763%2014.5662678%2C9.50539101%2013.6457617%2C10.6638734%20C12.8750097%2C11.639511%2012.2567593%2C12.2117734%2011.6659868%2C12.4909258%20C11.5972923%2C12.5341944%2011.5299717%2C12.5481521%2011.4461644%2C12.5481521%20C11.3912089%2C12.5481521%2011.3362533%2C12.5341944%2011.2675588%2C12.5048834%20C11.1439087%2C12.4644063%2011.0339976%2C12.366703%2010.979042%2C12.2410844%20C10.8141752%2C11.8628329%2010.580614%2C11.5432035%2010.2659932%2C11.2905705%20C9.94862474%2C11.053291%209.59141344%2C10.871842%209.18062043%2C10.7741386%20C9.05559648%2C10.7462234%208.93194641%2C10.6638734%208.86325193%2C10.5368591%20C8.79455745%2C10.4251981%208.76845354%2C10.2856219%208.79455745%2C10.1474415%20C8.9594242%2C9.50539101%209.38532999%2C8.75167956%2010.1272304%2C7.81651905%20C11.5849273%2C5.94480227%2014.4975733%2C3.16863175%2015.9113058%2C3.01370218%20C16.2959949%2C2.9578717%2016.5158172%2C3.08349028%2016.6532062%2C3.19515123%20C17.0117914%2C3.50221886%2017.3690027%2C4.17358036%2016.1998226%2C6.58685277%20Z%20M10.2654437%2C13.9990466%20C10.3478771%2C14.6969276%2010.1692714%2C15.3808509%209.74199174%2C15.9251981%20C9.37241543%2C16.412319%208.85033737%2C16.7486977%208.25956482%2C16.8882738%20C8.23208703%2C16.9022315%208.19087034%2C16.9161891%208.16339255%2C16.9161891%20L8.0246297%2C16.9301467%20C7.76496455%2C16.9720196%207.51766442%2C16.9999348%207.2689904%2C16.9999348%20C5.29196321%2C16.9999348%203.90296079%2C15.6586076%203.35477883%2C14.7806733%20C3.14732149%2C14.4317328%202.83270076%2C13.7896823%203.10747869%2C13.3849114%20C3.17617317%2C13.287208%203.36714383%2C13.0778437%203.77931072%2C13.1615894%20C5.08450588%2C13.4407418%205.55162835%2C12.8545218%205.63543562%2C12.7428609%20C6.51472499%2C11.5843784%208.14965365%2C11.3750141%209.27486926%2C12.2403866%20C9.82579901%2C12.6730728%2010.1816364%2C13.3011656%2010.2654437%2C13.9990466%20Z%22%20id%3D%22Fill-4%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%0A%20%20%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E';
  const img2 = 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20width%3D%2220px%22%20height%3D%2220px%22%20viewBox%3D%220%200%2020%2020%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cg%20id%3D%22Code-V2%22%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M15%2C14.51%20C15%2C14.786%2014.776%2C15.01%2014.5%2C15.01%20L9.197%2C15.01%20C9.064%2C15.01%208.937%2C15.062%208.844%2C15.156%20L8.146%2C15.854%20C8.053%2C15.947%207.926%2C16%207.793%2C16%20L6.207%2C16%20C6.074%2C16%205.947%2C15.947%205.854%2C15.854%20L5.156%2C15.156%20C5.062%2C15.062%204.936%2C15.01%204.803%2C15.01%20L3.5%2C15.01%20C3.224%2C15.01%203%2C14.786%203%2C14.51%20L3%2C11.5%20C3%2C11.224%203.224%2C11%203.5%2C11%20L4.793%2C11%20C4.926%2C11%205.053%2C11.053%205.146%2C11.146%20L5.854%2C11.854%20C5.947%2C11.947%206.074%2C12%206.207%2C12%20L7.793%2C12%20C7.926%2C12%208.053%2C11.947%208.146%2C11.854%20L8.854%2C11.146%20C8.947%2C11.053%209.074%2C11%209.207%2C11%20L14.5%2C11%20C14.776%2C11%2015%2C11.224%2015%2C11.5%20L15%2C14.51%20Z%20M17%2C9.51%20C17%2C9.786%2016.776%2C10.01%2016.5%2C10.01%20L9.197%2C10.01%20C9.064%2C10.01%208.937%2C10.062%208.844%2C10.156%20L8.146%2C10.854%20C8.053%2C10.947%207.926%2C11%207.793%2C11%20L6.207%2C11%20C6.074%2C11%205.947%2C10.947%205.854%2C10.854%20L5.156%2C10.156%20C5.062%2C10.062%204.936%2C10.01%204.803%2C10.01%20L3.5%2C10.01%20C3.224%2C10.01%203%2C9.786%203%2C9.51%20L3%2C6.5%20C3%2C6.224%203.224%2C6%203.5%2C6%20L4.793%2C6%20C4.926%2C6%205.053%2C6.053%205.146%2C6.146%20L5.854%2C6.854%20C5.947%2C6.947%206.074%2C7%206.207%2C7%20L7.793%2C7%20C7.926%2C7%208.053%2C6.947%208.146%2C6.854%20L8.854%2C6.146%20C8.947%2C6.053%209.074%2C6%209.207%2C6%20L16.5%2C6%20C16.776%2C6%2017%2C6.224%2017%2C6.5%20L17%2C9.51%20Z%22%20id%3D%22Code%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%0A%20%20%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E';

  class ImageExt {
    getInfo() {
      return {
        id: 'images',
        name: 'Images',
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.COMMAND,
            text: 'adding [IMAGE11] [IMAGE12] [IMAGE13] [IMAGE14] to [IMAGE2]',
            arguments: {
              IMAGE11: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: img1,
                size: 64
              },
              IMAGE12: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: img1,
                size: 32
              },
              IMAGE13: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: img1,
                size: 16
              },
              IMAGE14: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: img1,
                size: 8
              },
              IMAGE2: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: img2
              }
            }
          }
        ]
      };
    }
    block() {}
  }

  Scratch.vm.runtime._constructInlineImageJson = function(argInfo) {
    if (!argInfo.dataURI) {
      log.warn('Missing data URI in extension block with argument type IMAGE');
    }
    return {
      type: 'field_image',
      src: argInfo.dataURI || '',
      width: argInfo.size || 24,
      height: argInfo.size || 24, //Setting width and height to different values doesn't work as you expect
      flip_rtl: argInfo.flipRTL || false
    };
  }

  Scratch.extensions.register(new ImageExt());
})(Scratch);