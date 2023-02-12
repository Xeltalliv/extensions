(function (Scratch) {
  'use strict';

  class Extension {
    getInfo() {
      return {
        id: 'motion',
        name: 'Replaced Motion',
        //color1: '#4C97FF',
        //color2: '#3373CC',
        blocks: [
          {
            opcode: 'newblock',
            blockType: Scratch.BlockType.COMMAND,
            text: 'newblock',
            arguments: {},
          }
        ]
      };
    }
    newblock(args, util) {
      util.target.setXY(Math.random() * 200 - 100, Math.random() * 200 - 100);
    }
  }

  // https://github.com/LLK/scratch-gui/blob/79c46e54058de2eb92aa751ea1cb0bee7e17c87a/src/containers/blocks.jsx#L338-L359
  // https://github.com/LLK/scratch-vm/blob/eca3e1be10b7df9a30f014c42ecfbb42b8819e5d/src/engine/runtime.js#L1390-L1432
  // https://github.com/LLK/scratch-gui/blob/79c46e54058de2eb92aa751ea1cb0bee7e17c87a/src/lib/make-toolbox-xml.js#L737-L785
  // https://github.com/LLK/scratch-gui/blob/79c46e54058de2eb92aa751ea1cb0bee7e17c87a/src/lib/make-toolbox-xml.js#L8-L140
  const motion = function (isInitialSetup, isStage, targetId) {
    const stageSelected = ScratchBlocks.ScratchMsgs.translate(
        'MOTION_STAGE_SELECTED',
        'Stage selected: no motion blocks'
    );
    return `
    <category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="#4C97FF" secondaryColour="#3373CC">
        ${isStage ? `
        <label text="${stageSelected}"></label>
        ` : `
        <block id="motion_newblock" type="motion_newblock"/>
        ${blockSeparator}
        <block type="motion_movesteps">
            <value name="STEPS">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnright">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnleft">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_goto">
            <value name="TO">
                <shadow type="motion_goto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_gotoxy">
            <value name="X">
                <shadow id="movex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="movey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_glideto" id="motion_glideto">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="motion_glideto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_glidesecstoxy">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="X">
                <shadow id="glidex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="glidey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_pointindirection">
            <value name="DIRECTION">
                <shadow type="math_angle">
                    <field name="NUM">90</field>
                </shadow>
            </value>
        </block>
        <block type="motion_pointtowards">
            <value name="TOWARDS">
                <shadow type="motion_pointtowards_menu">
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_changexby">
            <value name="DX">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_setx">
            <value name="X">
                <shadow id="setx" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_changeyby">
            <value name="DY">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_sety">
            <value name="Y">
                <shadow id="sety" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_ifonedgebounce"/>
        ${blockSeparator}
        <block type="motion_setrotationstyle"/>
        ${blockSeparator}
        <block id="${targetId}_xposition" type="motion_xposition"/>
        <block id="${targetId}_yposition" type="motion_yposition"/>
        <block id="${targetId}_direction" type="motion_direction"/>`}
        ${categorySeparator}
    </category>
    `;
  }

  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const categorySeparator = '<sep gap="36"/>';
  const blockSeparator = '<sep gap="36"/>'
  const gbx = runtime.getBlocksXML.bind(runtime);
  runtime.getBlocksXML = function(target) {
    const categoryInfo = this._blockInfo;
    const res = gbx(target);
    res.forEach((elem, idx) => {
      if (categoryInfo[idx].id === "motion") {
        let {editingTarget: target, runtime} = vm;
        const stage = runtime.getTargetForStage();
        if (!target) target = stage;
        elem.xml = motion(false, target.isStage, target.id);
      }
    });
    return res;
  }

  Scratch.extensions.register(new Extension());
})(Scratch);