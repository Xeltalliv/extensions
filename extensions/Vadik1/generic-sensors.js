(function(Scratch) {
	"use strict";

	// https://www.w3.org/TR/generic-sensor/
	// https://developer.mozilla.org/en-US/docs/Web/API/Sensor_APIs

	const sensors = {
		"absolute orientation sensor": {
			internalName: "AbsoluteOrientationSensor",
			props: ["x","y","z","w"],
			quaternionMode: true
		},
		"accelerometer": {
			internalName: "Accelerometer",
			props: ["x","y","z"]
		},
		"ambient light sensor": {
			internalName: "AmbientLightSensor",
			props: ["illuminance"]
		},
		"gravity sensor": {
			internalName: "GravitySensor",
			props: ["x","y","z"]
		},
		"gyroscope": {
			internalName: "Gyroscope",
			props: ["x","y","z"]
		},
		"linear acceleration sensor": {
			internalName: "LinearAccelerationSensor",
			props: ["x","y","z"]
		},
		"magnetometer": {
			internalName: "Magnetometer",
			props: ["x","y","z"]
		},
		"relative orientation sensor": {
			internalName: "AbsoluteOrientationSensor",
			props: ["x","y","z", "w"],
			quaternionMode: true
		},
	}
	const sensorList = Object.keys(sensors).sort();
	const xyzwToNumber = {x:0, y:1, z:2, w:3};

	const ArgumentType = Scratch.ArgumentType;
	const BlockType = Scratch.BlockType;

	const vm = Scratch.vm;
	let ws = null;

	class GenericSensorsExtension {
		getInfo() {
			return {
				id: "genericsensors",
				name: "Generic Sensors",
				color1: "#d10000",
				color2: "#bd0000",
				color3: "#af0100",
				blocks: [
					{
						opcode: "setSensorActive",
						blockType: BlockType.COMMAND,
						text: "[STATE] [SENSOR]",
						arguments: {
							STATE: {
								type: ArgumentType.STRING,
								menu: "state",
								defaultValue: "enable"
							},
							SENSOR: {
								type: ArgumentType.STRING,
								menu: "sensor",
								defaultValue: sensorList[0]
							}
						}
					},
					{
						opcode: "isSensorActive",
						blockType: BlockType.BOOLEAN,
						text: "is [SENSOR] active?",
						arguments: {
							SENSOR: {
								type: ArgumentType.STRING,
								menu: "sensor",
								defaultValue: sensorList[0]
							}
						}
					},
					{
						opcode: "getSensorData",
						blockType: BlockType.REPORTER,
						text: "[PROPERTY] of [SENSOR]",
						arguments: {
							SENSOR: {
								type: ArgumentType.STRING,
								menu: "sensor",
								defaultValue: sensorList[0]
							},
							PROPERTY: {
								type: ArgumentType.STRING,
								menu: "property",
								defaultValue: sensors[sensorList[0]].props[0]
							}
						}
					},
				],
				menus: {
					state: ["enable","disable"],
					sensor: "sensor",
					property: "property"
				}
			};
		}
		setSensorActive({STATE, SENSOR}) {
			const s = sensors[SENSOR];
			if (!s) return;
			try {
				if (STATE === "enabled") {
					if (!s.sensor) {
						s.sensor = new window[s.internalName]();
					}
					s.sensor.start();
				} else {
					if (!s.sensor) return;
					s.sensor.stop();
				}
			} catch(e) {}
		}
		isSensorActive({SENSOR}) {
			const s = sensors[SENSOR];
			if (!s || !s.sensor) return false;
			return s.sensor.activated;
		}
		getSensorData({SENSOR, PROPERTY}) {
			const s = sensors[SENSOR];
			if (!s || !s.sensor || !s.sensor.activated) return "";
			if (s.props.indexOf(PROPERTY) === -1) return "";
			if (s.quaternionMode) {
				if (! s.sensor.quaternion) return "";
				return s.sensor.quaternion[xyzwToNumber[PROPERTY]];
			} else {
				return s.sensor[PROPERTY];
			}
		}
		property(targetId, blockId) { // blockId was added by the code below
			if(vm.editingTarget && blockId) {
				let lookupBlocks = vm.editingTarget.blocks;
				let block = lookupBlocks.getBlock(blockId);

				if (!block) {
					block = vm.runtime.flyoutBlocks.getBlock(blockId);
					if (!block) {
						return [""];
					}
					lookupBlocks = vm.runtime.flyoutBlocks;
				}
				const selectedItem = block.fields.SENSOR.value;

				return sensors[selectedItem]?.props ?? [""];
			}
			return [""];
		}
		sensor(targetId, blockId) {
			if(vm.editingTarget && blockId) {
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
						let field = blocklyBlock.getField("SENSOR")
						if (field && !field.getValidator()) {
							field.setValidator((accept) => {
								let field2 = blocklyBlock.getField("PROPERTY")
								if (field2) {
									let currentVal = field2.getValue();
									let validValues = sensors[accept]?.props ?? [""];
									if (validValues.indexOf(currentVal) === -1) {
										field2.setValue(validValues[0]);
									}
								}
								return accept;
							});
						}
					}
				}
			}
			return sensorList;
		}
	}




	// Adding the second parameter "blockId" to extension menus.
	// It is an id of a block, for which the menu was opened.
	if (!vm.extChanges) {
		vm.extChanges = {};
	}
	if (!vm.extChanges.dynamicMenuBlockId) {
		vm.extChanges.dynamicMenuBlockId = true;

		const extensionManager = Scratch.vm.runtime.extensionManager;
		const gemi = extensionManager._getExtensionMenuItems.bind(extensionManager);
		extensionManager._getExtensionMenuItems = function(extensionObject, menuItemFunctionName, block) {
			const menuFunc = extensionObject[menuItemFunctionName];
			const menuFunc2 = function(...args) {
				return menuFunc(...args, block);
			}
			return gemi({fn: menuFunc2}, "fn");
		};

		vm.addListener("EXTENSION_ADDED", tryUseScratchBlocks);
		vm.addListener("BLOCKSINFO_UPDATE", tryUseScratchBlocks);
		tryUseScratchBlocks();
	}

	function tryUseScratchBlocks() {
		if (!window.ScratchBlocks) return;

		vm.removeListener("EXTENSION_ADDED", tryUseScratchBlocks);
		vm.removeListener("BLOCKSINFO_UPDATE", tryUseScratchBlocks);

		window.ScratchBlocks.defineBlocksWithJsonArray = function(jsonArray) {
			for (var i = 0; i < jsonArray.length; i++) {
				let jsonDef = jsonArray[i];
				if (!jsonDef) {
					console.warn(
						'Block definition #' + i + ' in JSON array is ' + jsonDef + '. ' +
						'Skipping.');
				} else {
					let typename = jsonDef.type;
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
							while (jsonDef["args"+row]) {
								let blockArgs = jsonDef["args"+row];
								for (let arg of blockArgs) {
									if (typeof arg.options === "function") {
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
	}

	Scratch.extensions.register(new GenericSensorsExtension());
})(Scratch);