import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Electrobun Doom",
		identifier: "doom.electrobun.dev",
		version: "1.0.0",
	},
	build: {
		bun: {
			entrypoint: "src/bun/index.ts",
		},
		views: {
			launcher: {
				entrypoint: "src/launcher/index.ts",
			},
		},
		copy: {
			"src/launcher/index.html": "views/launcher/index.html",
			"src/launcher/index.css": "views/launcher/index.css",
			"src/assets/freedoom1.wad": "assets/freedoom1.wad",
			"native/libdoom.dylib": "native/libdoom.dylib",
		},
		mac: {
			bundleCEF: true,
			bundleWGPU: true,
		},
		linux: {
			bundleCEF: true,
			bundleWGPU: true,
		},
		win: {
			bundleCEF: true,
			bundleWGPU: true,
		},
	},
} satisfies ElectrobunConfig;
