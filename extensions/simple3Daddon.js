(function(Scratch) {
	"use strict";
	class Extension {
		getInfo() {
			return {
				id: "simple3dAddon",
				name: "Simple 3D addon",
				color1: "#5CB1D6",
				color2: "#47A8D1",
				color3: "#2E8EB8",
				blocks: [],
			};
		}
	}
	const runtime = Scratch.vm.runtime;
	const publicApi = runtime.ext_xeltallivsimple3d ?? (runtime.ext_xeltallivsimple3d = {});
	const externalTransforms = publicApi.externalTransforms ?? (publicApi.externalTransforms = {});
	externalTransforms["test"] = {
		name: "just a test",
		get() {
			return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
		}
	}
	Scratch.extensions.register(new Extension());
})(Scratch);