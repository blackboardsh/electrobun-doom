// v_video.ts — Video buffer operations (screen management, palette, drawing)

import { SCREENWIDTH, SCREENHEIGHT } from "./doomdef";
import { W_CacheLumpName, W_CacheLumpNameAsBytes } from "./w_wad";

// Screen buffers (indexed color, 8-bit per pixel)
// Screen 0 is the main display buffer
// Screen 1-4 are used for wipes, status bar, etc.
export const screens: Uint8Array[] = [];
for (let i = 0; i < 5; i++) {
	screens.push(new Uint8Array(SCREENWIDTH * SCREENHEIGHT));
}

// RGBA output buffer for GPU upload
export const rgbaBuffer = new Uint8Array(SCREENWIDTH * SCREENHEIGHT * 4);

// Current palette (256 RGB entries → RGBA for output)
export const palette = new Uint8Array(256 * 4);

// Gamma correction tables
const gammatable: number[][] = [
	// Gamma 0 (off)
	Array.from({ length: 256 }, (_, i) => i),
	// Gamma 1
	Array.from({ length: 256 }, (_, i) => Math.min(255, Math.round(Math.pow(i / 255, 1 / 1.2) * 255))),
	// Gamma 2
	Array.from({ length: 256 }, (_, i) => Math.min(255, Math.round(Math.pow(i / 255, 1 / 1.5) * 255))),
	// Gamma 3
	Array.from({ length: 256 }, (_, i) => Math.min(255, Math.round(Math.pow(i / 255, 1 / 1.8) * 255))),
	// Gamma 4
	Array.from({ length: 256 }, (_, i) => Math.min(255, Math.round(Math.pow(i / 255, 1 / 2.0) * 255))),
];

export let usegamma = 0;

export function V_SetPalette(paletteNum: number): void {
	const raw = W_CacheLumpNameAsBytes("PLAYPAL");
	const offset = paletteNum * 768;
	const gamma = gammatable[usegamma]!;

	for (let i = 0; i < 256; i++) {
		palette[i * 4] = gamma[raw[offset + i * 3]!]!;      // R
		palette[i * 4 + 1] = gamma[raw[offset + i * 3 + 1]!]!; // G
		palette[i * 4 + 2] = gamma[raw[offset + i * 3 + 2]!]!; // B
		palette[i * 4 + 3] = 255;                               // A
	}
}

// Convert indexed screen buffer to RGBA
export function V_ScreenToRGBA(screenNum: number = 0): Uint8Array {
	const src = screens[screenNum]!;
	for (let i = 0; i < SCREENWIDTH * SCREENHEIGHT; i++) {
		const colorIndex = src[i]!;
		const pi = colorIndex * 4;
		const oi = i * 4;
		rgbaBuffer[oi] = palette[pi]!;
		rgbaBuffer[oi + 1] = palette[pi + 1]!;
		rgbaBuffer[oi + 2] = palette[pi + 2]!;
		rgbaBuffer[oi + 3] = 255;
	}
	return rgbaBuffer;
}

// Draw a patch (graphic) to a screen buffer
export interface Patch {
	width: number;
	height: number;
	leftoffset: number;
	topoffset: number;
	columnofs: number[];
	data: DataView;
}

export function W_CachePatchName(name: string): Patch {
	const data = W_CacheLumpName(name);
	return parsePatch(data);
}

export function W_CachePatchNum(lump: number): Patch {
	const { W_CacheLumpNum } = require("./w_wad");
	const data = W_CacheLumpNum(lump);
	return parsePatch(data);
}

function parsePatch(data: DataView): Patch {
	const width = data.getInt16(0, true);
	const height = data.getInt16(2, true);
	const leftoffset = data.getInt16(4, true);
	const topoffset = data.getInt16(6, true);
	const columnofs: number[] = [];
	for (let i = 0; i < width; i++) {
		columnofs.push(data.getInt32(8 + i * 4, true));
	}
	return { width, height, leftoffset, topoffset, columnofs, data };
}

export function V_DrawPatch(x: number, y: number, scrn: number, patch: Patch): void {
	const dest = screens[scrn]!;
	x -= patch.leftoffset;
	y -= patch.topoffset;

	for (let col = 0; col < patch.width; col++) {
		const dx = x + col;
		if (dx < 0 || dx >= SCREENWIDTH) continue;

		let offset = patch.columnofs[col]!;
		const data = patch.data;

		while (true) {
			const topdelta = data.getUint8(offset);
			offset++;
			if (topdelta === 0xff) break;

			const length = data.getUint8(offset);
			offset++;
			offset++; // skip padding byte

			for (let j = 0; j < length; j++) {
				const dy = y + topdelta + j;
				if (dy >= 0 && dy < SCREENHEIGHT) {
					dest[dy * SCREENWIDTH + dx] = data.getUint8(offset);
				}
				offset++;
			}
			offset++; // skip padding byte
		}
	}
}

export function V_DrawPatchDirect(x: number, y: number, patch: Patch): void {
	V_DrawPatch(x, y, 0, patch);
}

// Copy screen buffer to another
export function V_CopyRect(
	srcx: number, srcy: number, srcscrn: number,
	width: number, height: number,
	destx: number, desty: number, destscrn: number
): void {
	const src = screens[srcscrn]!;
	const dest = screens[destscrn]!;
	for (let y = 0; y < height; y++) {
		const si = (srcy + y) * SCREENWIDTH + srcx;
		const di = (desty + y) * SCREENWIDTH + destx;
		dest.set(src.subarray(si, si + width), di);
	}
}

// Fill a box with a color
export function V_FillRect(x: number, y: number, width: number, height: number, color: number, scrn: number = 0): void {
	const dest = screens[scrn]!;
	for (let row = 0; row < height; row++) {
		const offset = (y + row) * SCREENWIDTH + x;
		dest.fill(color, offset, offset + width);
	}
}

// Draw a flat-textured background
export function V_DrawBackground(flatname: string, scrn: number): void {
	// Load flat (64x64 raw pixel data)
	let flatData: Uint8Array;
	try {
		flatData = W_CacheLumpNameAsBytes(flatname);
	} catch {
		// If flat not found, fill with a default color
		screens[scrn]!.fill(0);
		return;
	}

	const dest = screens[scrn]!;
	for (let y = 0; y < SCREENHEIGHT; y++) {
		for (let x = 0; x < SCREENWIDTH; x++) {
			dest[y * SCREENWIDTH + x] = flatData[(y & 63) * 64 + (x & 63)]!;
		}
	}
}

// Mark the whole screen dirty (for screen wipe etc.)
export function V_MarkRect(_x: number, _y: number, _width: number, _height: number): void {
	// No-op in our implementation — we always redraw the full frame
}
