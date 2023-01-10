(function(Scratch) {
	"use strict";
	
	if(!Scratch.extensions.unsandboxed) {
		throw new Error("AR-like fullscreen extension must be run unsandboxed");
	}
	
	const ArgumentType = Scratch.ArgumentType;
	const BlockType = Scratch.BlockType;
	
	const vm = Scratch.vm;
	const runtime = vm.runtime;
	const mouse = runtime.ioDevices.mouse;
	
	let lastState = false;
	let oldWidth = 0;
	let oldHeight = 0;
	let isPackaged = false;
	
	let stageWrapper;
	let stageWrapperParent;
	const div = document.createElement("div");
	document.body.append(div);
	const canvas = vm.renderer.canvas;
	
	const updateState = function() {
		const state = !!document.fullscreenElement;
		if(state === lastState) return;
		lastState = state;
		
		if(state) {
			setTimeout(() => {
				oldWidth  = runtime.stageWidth;
				oldHeight = runtime.stageHeight;
				
				runtime.setStageSize(div.clientWidth/div.clientHeight*oldHeight, oldHeight);
				
				const scale = div.clientHeight / canvas.clientHeight;
				console.log(div.clientHeight, canvas.clientHeight, scale)
				stageWrapper.style = "transform-origin: top left; transform: scale("+scale+","+scale+")";
				
				if(!isPackaged) {
					const borderThing = stageWrapper.children[0].children[0].style;
					borderThing["border"] = "none";
					borderThing["border-radius"] = "0";
					borderThing["transform"] = ""; // Removes translateX which I don't even know why it appers
				}
			}, 100);
		} else {
			if(!isPackaged) {
				const borderThing = stageWrapper.children[0].children[0].style;
				borderThing["border"] = "";
				borderThing["border-radius"] = "";
			}
			stageWrapper.style = "";
			stageWrapperParent.append(stageWrapper);
			
			runtime.setStageSize(oldWidth, oldHeight);
		}
	};
	document.addEventListener("fullscreenchange", updateState);
	
	// Patching _pickTarget incorrect position bug when scaled using transform:scale
	const postDataOriginal = mouse.postData.bind(mouse);
	mouse.postData = function(data) {
		this._canvasWidth = data.canvasWidth;
		this._canvasHeight = data.canvasHeight;
		postDataOriginal(data);
	}.bind(mouse);
	
	const _pickTargetOriginal = mouse._pickTarget.bind(mouse);
	mouse._pickTarget = function (x, y) {
		return _pickTargetOriginal(
			x / this._canvasWidth * canvas.clientWidth,
			y / this._canvasHeight * canvas.clientHeight
		);
	}.bind(mouse);
	
	
	class ARLikeFullscreenExtension {
		getInfo() {
			return {
				id: "ARFullscreen",
				color1: "#d10000",
				color2: "#bd0000",
				color3: "#af0100",
				blocks: [
					{
						opcode: "enterFullscreen",
						blockType: BlockType.COMMAND,
						text: "enter fullscreen",
						arguments: {}
					}
				]
			}
		}
		enterFullscreen(args) {
			if(document.fullscreenElement) return;

			stageWrapper = document.querySelector("[class*='stage-wrapper_stage-canvas-wrapper']"); // Entering and exiting editor recreates this element
			if(!stageWrapper) {
				stageWrapper = document.querySelector("[class='sc-root']");
				isPackaged = true;
			}
			stageWrapperParent = stageWrapper.parentElement;
			console.log(stageWrapper, stageWrapperParent);
			
			div.append(stageWrapper);
			div.requestFullscreen();
		}
	}
	
	Scratch.extensions.register(new ARLikeFullscreenExtension());
})(Scratch);