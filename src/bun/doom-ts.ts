// doom-ts.ts — TypeScript Doom engine launcher
// Creates a GpuWindow, initializes the TS Doom engine, runs the game loop

import { GpuFramebuffer } from "./gpu-framebuffer";
import { macKeyToDoomKey } from "./doom-keys";
import { D_DoomMain, D_DoomLoop_Tick, D_PostEvent, D_StartTitle } from "../doom/d_main";
import { SCREENWIDTH, SCREENHEIGHT } from "../doom/doomdef";
import { V_ScreenToRGBA, V_SetPalette } from "../doom/v_video";
import { resolve, join } from "path";

let gpu: GpuFramebuffer | null = null;
let running = false;

export async function launchTSDoom(): Promise<void> {
	if (running) {
		console.log("TS Doom is already running");
		return;
	}
	running = true;

	// Find the WAD file
	const wadPath = findWadPath();
	console.log(`Loading WAD from: ${wadPath}`);

	// Initialize the Doom engine
	await D_DoomMain(wadPath);

	// Create GPU window for rendering
	gpu = new GpuFramebuffer(
		"Electrobun Doom — TypeScript Engine",
		SCREENWIDTH,
		SCREENHEIGHT,
		640,
		480,
	);

	// Wire up keyboard events
	gpu.setKeyCallback((keyCode: number, pressed: boolean) => {
		const doomKey = macKeyToDoomKey(keyCode);
		if (doomKey !== null) {
			D_PostEvent({
				type: pressed ? "keydown" : "keyup",
				key: doomKey,
			});
		}
	});

	// Start at title/menu like classic Doom
	D_StartTitle();
	const { M_StartControlPanel } = require("../doom/m_menu");
	M_StartControlPanel();

	// Run the game loop at 35 tics per second (Doom's native rate)
	const ticInterval = 1000 / 35;
	let lastTic = performance.now();

	function gameLoop() {
		if (!running || !gpu) return;

		const now = performance.now();
		const elapsed = now - lastTic;

		if (elapsed >= ticInterval) {
			lastTic = now - (elapsed % ticInterval);

			try {
				// Run one game tic
				D_DoomLoop_Tick();

				// Convert the indexed framebuffer to RGBA
				const rgba = V_ScreenToRGBA(0);

				// Upload to GPU and present
				gpu.uploadFrame(rgba);
				gpu.present();
			} catch (err) {
				console.error("Game loop error:", err);
			}
		}

		// Schedule next frame
		setTimeout(gameLoop, Math.max(1, ticInterval - (performance.now() - lastTic)));
	}

	// Start the loop
	gameLoop();
	console.log("TypeScript Doom is running!");
}

export function stopTSDoom(): void {
	running = false;
	if (gpu) {
		gpu.stop();
		gpu.close();
		gpu = null;
	}
}

function findWadPath(): string {
	// Try multiple locations for the WAD file
	const candidates = [
		join(import.meta.dir, "../../assets/freedoom1.wad"),
		join(import.meta.dir, "../assets/freedoom1.wad"),
		resolve("src/assets/freedoom1.wad"),
		resolve("assets/freedoom1.wad"),
		resolve("freedoom1.wad"),
	];

	for (const path of candidates) {
		const file = Bun.file(path);
		if (file.size > 0) {
			return path;
		}
	}

	throw new Error(
		`Could not find freedoom1.wad! Searched:\n${candidates.join("\n")}`,
	);
}
