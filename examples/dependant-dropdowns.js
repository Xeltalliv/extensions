(function(Scratch) {
	"use strict";

	const all = {
		"natural numbers": ["1","2","3","4","5","6","7","8","9","10"],
		"integer numbers": ["-10", "-9","-8","-7","-6","-5","-4","-3","-2","-1","0","1","2","3","4","5","6","7","8","9","10"],
		"coordinates": ["x","y","z"],
		"letters": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
		"words": ["coding","this","was","hard"]
	}
	const allList = Object.keys(all).sort();

	const ArgumentType = Scratch.ArgumentType;
	const BlockType = Scratch.BlockType;

	const vm = Scratch.vm;
	let ws = null;

	class DependantDropdowns {
		getInfo() {
			return {
				id: "dependantdropdowns",
				name: "Dependant Dropdowns",
				blocks: [
					{
						opcode: "getPropOfThing",
						blockType: BlockType.REPORTER,
						text: "[PROPERTY] of [THING]",
						arguments: {
							THING: {
								type: ArgumentType.STRING,
								menu: "thing",
								defaultValue: allList[0]
							},
							PROPERTY: {
								type: ArgumentType.STRING,
								menu: "property",
								defaultValue: all[allList[0]][0]
							}
						}
					},
				],
				menus: {
					thing: "thing",
					property: "property"
				}
			};
		}
		getPropOfThing({THING, PROPERTY}) {
			return PROPERTY+" of "+THING;
		}
		property(targetId, blockId) {
			if(vm.editingTarget) {
				let lookupBlocks = vm.editingTarget.blocks;
				let block = lookupBlocks.getBlock(blockId);
				if (!block) {
					block = vm.runtime.flyoutBlocks.getBlock(blockId);
					if (!block) {
						return [''];
					}
				}
				const selectedItem = block.fields.THING.value;
				return all[selectedItem] ?? [''];
			}
			return [''];
		}
		thing(targetId, blockId) {
			if(vm.editingTarget) {
				let lookupBlocks = vm.editingTarget.blocks;
				let block = lookupBlocks.getBlock(blockId);
				if (!block) {
					block = vm.runtime.flyoutBlocks.getBlock(blockId);
				}
				if (!ws && window.Blockly) {
					ws = Blockly.getMainWorkspace();
				}
				if (ws && block) {
					let blocklyBlock = ws.getBlockById(block.id);
					if (blocklyBlock) {
						let field = blocklyBlock.getField("THING")
						if (field && !field.getValidator()) field.setValidator((accept) => {
							let field2 = blocklyBlock.getField("PROPERTY")
							if (field2) {
								let currentVal = field2.getValue();
								let validValues = all[accept] ?? [''];
								if (validValues.indexOf(currentVal) === -1) {
									field2.setValue(validValues[0]);
								}
							}
							return accept;
						});
					}
				}
			}
			return allList;
		}
	}




	const extensionManager = Scratch.vm.runtime.extensionManager;
	const gemi = extensionManager._getExtensionMenuItems.bind(extensionManager);
	extensionManager._getExtensionMenuItems = function(extensionObject, menuItemFunctionName, block) {
		const menuFunc = extensionObject[menuItemFunctionName];
		const menuFunc2 = function(...args) {
			return menuFunc(...args, block);
		}
		return gemi({fn: menuFunc2}, "fn");
	};
	ScratchBlocks.defineBlocksWithJsonArray = function(jsonArray) {
		for (var i = 0; i < jsonArray.length; i++) {
			let jsonDef = jsonArray[i];
			if (!jsonDef) {
				console.warn(
					'Block definition #' + i + ' in JSON array is ' + jsonDef + '. ' +
					'Skipping.');
			} else {
				var typename = jsonDef.type;
				if (typename == null || typename === '') {
					console.warn(
						'Block definition #' + i +
						' in JSON array is missing a type attribute. Skipping.');
				} else {
					if (ScratchBlocks.Blocks[typename]) {
						console.warn(
							'Block definition #' + i + ' in JSON array' +
							' overwrites prior definition of "' + typename + '".');
					}
					ScratchBlocks.Blocks[typename] = {init: function() {
						let block = this;
						let row = 0;
						while(jsonDef["args"+row]) {
							let blockArgs = jsonDef["args"+row];
							for(let arg of blockArgs) {
								if(typeof arg.options === "function") {
									const menuGen = arg.options;
									arg.options = function(...args) {
										return menuGen(...args, block.id);
									}
								}
							}
							row++;
						}
						this.jsonInit(jsonDef);
					}}
				}
			}
		}
	};

	Scratch.extensions.register(new DependantDropdowns());
})(Scratch);