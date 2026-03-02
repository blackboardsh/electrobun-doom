// st_stuff.ts — Status bar
// Draws the Doom status bar at the bottom of the screen using WAD patches.

import { SCREENWIDTH, SCREENHEIGHT } from "./doomdef";
import * as doomstat from "./doomstat";
import { screens } from "./v_video";

// Status bar height is 32 pixels; it occupies the bottom of the 200-line screen.
const ST_HEIGHT = 32;
const ST_Y = SCREENHEIGHT - ST_HEIGHT;

// Patch references (loaded on first use)
let stbar: any = null; // STBAR background patch
let tallnum: any[] = []; // STTNUM0..STTNUM9 — tall red number patches
let tallpercent: any = null; // STTPRCNT
let tallminus: any = null; // STTMINUS
let smallnum: any[] = []; // STYSNUM0..STYSNUM9 — small yellow number patches
let smallnumGreen: any[] = []; // STGNUM0..STGNUM9 — small green number patches
let fontDigits: any[] = []; // STCFN048..STCFN057 — fallback small digits
let facePatch: any = null; // Current face patch
let facePatches: any[] = []; // STFST00..STFST42 etc.
let sbarLoaded = false;

// Face state
let faceIndex = 0;
let faceCount = 0;

function ensureLoaded(): boolean {
	if (sbarLoaded) return true;
	try {
		const { W_CachePatchName } = require("./v_video");

		// Load status bar background
		stbar = W_CachePatchName("STBAR");

		// Load number patches
		tallnum = [];
		for (let i = 0; i < 10; i++) {
			tallnum.push(W_CachePatchName(`STTNUM${i}`));
		}

		// Load percent and minus
		try { tallpercent = W_CachePatchName("STTPRCNT"); } catch { tallpercent = null; }
		try { tallminus = W_CachePatchName("STTMINUS"); } catch { tallminus = null; }

		// Load small yellow numbers (arms/ammo)
		smallnum = [];
		for (let i = 0; i < 10; i++) {
			try {
				smallnum.push(W_CachePatchName(`STYSNUM${i}`));
			} catch {
				smallnum = [];
				break;
			}
		}

		// Load small green numbers (selected weapon)
		smallnumGreen = [];
		for (let i = 0; i < 10; i++) {
			try {
				smallnumGreen.push(W_CachePatchName(`STGNUM${i}`));
			} catch {
				smallnumGreen = [];
				break;
			}
		}

		// Load menu font digits as a fallback (STCFN048..057)
		fontDigits = [];
		for (let i = 0; i < 10; i++) {
			const code = 48 + i; // '0'..'9'
			try {
				fontDigits.push(W_CachePatchName(`STCFN${code.toString().padStart(3, "0")}`));
			} catch {
				fontDigits = [];
				break;
			}
		}

		// Load a few face patches for the default expression
		facePatches = [];
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 3; j++) {
				try {
					facePatches.push(W_CachePatchName(`STFST${i}${j}`));
				} catch {
					// Some face patches may not exist
				}
			}
		}
		if (facePatches.length > 0) {
			facePatch = facePatches[0];
		}

		sbarLoaded = true;
		return true;
	} catch (e) {
		// WAD patches not available yet
		return false;
	}
}

export function ST_Init(): void {
	// Patches loaded lazily in ensureLoaded()
}

export function ST_Start(): void {
	sbarLoaded = false; // Force reload on new level
}

export function ST_Stop(): void {
	// Nothing to do
}

export function ST_Ticker(): void {
	// Update face animation
	faceCount++;
	if (faceCount > 15) {
		faceCount = 0;
		faceIndex = (faceIndex + 1) % 3;
		if (facePatches.length > faceIndex) {
			facePatch = facePatches[faceIndex];
		}
	}
}

export function ST_Drawer(): void {
	if (!ensureLoaded()) return;

	const { V_DrawPatch } = require("./v_video");
	const player = doomstat.players[doomstat.displayplayer]!;
	if (!player) return;

	// Draw the status bar background (STBAR is 320 wide, drawn at y=168)
	if (stbar) {
		V_DrawPatch(0, ST_Y, 0, stbar);
	}

	// Draw ammo count (left area, x=44, y=171) — 3 digits, right-aligned
	const { weaponinfo } = require("./p_pspr");
	const { AmmoType } = require("./doomdef");
	const wp = weaponinfo[player.readyweapon];
	if (wp && wp.ammo !== AmmoType.NoAmmo) {
		const ammo = player.ammo[wp.ammo] ?? 0;
		STlib_drawNum(44, ST_Y + 3, ammo, 3);
	}

	// Draw health (x=90, y=171) — 3 digits + percent
	STlib_drawNum(90, ST_Y + 3, player.health, 3);
	if (tallpercent) {
		V_DrawPatch(90, ST_Y + 3, 0, tallpercent);
	}

	// Draw armor (x=221, y=171) — 3 digits + percent
	const armor = player.armorpoints ?? 0;
	STlib_drawNum(221, ST_Y + 3, armor, 3);
	if (tallpercent) {
		V_DrawPatch(221, ST_Y + 3, 0, tallpercent);
	}

	// Draw face (center, x=143, y=168)
	if (facePatch) {
		V_DrawPatch(143, ST_Y, 0, facePatch);
	}

	// ---- Arms (weapon ownership/selection) ----
	// Layout: two columns, four rows (1-4 left, 5-7 right)
	// Tuned to align with the "ARMS" box on the status bar.
	const armsX = 130;
	const armsY = ST_Y + 4;
	const armsColGap = 12;
	const armsRowGap = 8;
	const weaponSlots = [
		{ num: 1, weapon: 0 }, // Fist (also chainsaw)
		{ num: 2, weapon: 1 }, // Pistol
		{ num: 3, weapon: 2 }, // Shotgun
		{ num: 4, weapon: 3 }, // Chaingun
		{ num: 5, weapon: 4 }, // Missile
		{ num: 6, weapon: 5 }, // Plasma
		{ num: 7, weapon: 6 }, // BFG
	];

	for (let i = 0; i < weaponSlots.length; i++) {
		const row = i < 4 ? i : i - 4;
		const col = i < 4 ? 0 : 1;
		const x = armsX + col * armsColGap;
		const y = armsY + row * armsRowGap;
		const slot = weaponSlots[i]!;
		const owned = player.weaponowned[slot.weapon];
		const selected = player.readyweapon === slot.weapon;
		if (owned) {
			STlib_drawSmallNum(x + 6, y, slot.num, selected);
		}
	}

	// ---- Ammo counts for each type (right side) ----
	// Two columns, four rows: left = max, right = current
	const ammoXLeft = 276;
	const ammoXRight = 304;
	const ammoY = ST_Y + 4;
	const ammoRowGap = 8;
	const ammoOrder = [0, 1, 2, 3]; // AmmoType.Clip, Shell, Cell, Missile
	const { maxAmmo } = require("./doomdef");
	for (let i = 0; i < ammoOrder.length; i++) {
		const y = ammoY + i * ammoRowGap;
		const ammo = player.ammo[ammoOrder[i]!] ?? 0;
		const max = maxAmmo[ammoOrder[i]!] ?? 0;
		// Max on left, current on right
		STlib_drawSmallNumRaw(ammoXLeft, y, max, true);
		STlib_drawSmallNumRaw(ammoXRight, y, ammo, false);
	}
}

// Draw a multi-digit number right-aligned ending at x
function STlib_drawNum(x: number, y: number, num: number, digits: number): void {
	const { V_DrawPatch } = require("./v_video");
	if (tallnum.length < 10) return;

	const negative = num < 0;
	if (negative) num = -num;

	// Draw digits right-to-left
	let dx = x;
	const numWidth = tallnum[0]?.width ?? 14;

	if (num === 0) {
		dx -= numWidth;
		V_DrawPatch(dx, y, 0, tallnum[0]);
	} else {
		let n = num;
		while (n > 0 && digits > 0) {
			dx -= numWidth;
			const d = n % 10;
			V_DrawPatch(dx, y, 0, tallnum[d]!);
			n = (n / 10) | 0;
			digits--;
		}
	}

	if (negative && tallminus) {
		dx -= tallminus.width;
		V_DrawPatch(dx, y, 0, tallminus);
	}
}

// Draw a small number (uses STYSNUM / STGNUM if available, otherwise falls back)
function STlib_drawSmallNum(x: number, y: number, num: number, selected: boolean): void {
	const { V_DrawPatch } = require("./v_video");
	const useFontDigits = fontDigits.length === 10 && smallnum.length !== 10;
	const patches =
		(selected && smallnumGreen.length === 10) ? smallnumGreen
		: (smallnum.length === 10) ? smallnum
		: (fontDigits.length === 10) ? fontDigits
		: tallnum;
	if (patches.length < 10) return;

	const negative = num < 0;
	if (negative) num = -num;

	const numWidth = patches[0]?.width ?? 8;
	let dx = x;

	if (num === 0) {
		dx -= numWidth;
		if (useFontDigits) drawPatchThird(dx, y, patches[0]);
		else V_DrawPatch(dx, y, 0, patches[0]);
	} else {
		let n = num;
		while (n > 0) {
			dx -= numWidth;
			const d = n % 10;
			if (useFontDigits) drawPatchThird(dx, y, patches[d]!);
			else V_DrawPatch(dx, y, 0, patches[d]!);
			n = (n / 10) | 0;
		}
	}

	if (negative && tallminus) {
		dx -= tallminus.width;
		if (useFontDigits) drawPatchThird(dx, y, tallminus);
		else V_DrawPatch(dx, y, 0, tallminus);
	}
}

// Draw a small number using explicit color selection (left-aligned at x)
function STlib_drawSmallNumRaw(x: number, y: number, num: number, useGreen: boolean): void {
	const { V_DrawPatch } = require("./v_video");
	const useFontDigits = fontDigits.length === 10 && smallnum.length !== 10;
	const patches =
		(useGreen && smallnumGreen.length === 10) ? smallnumGreen
		: (smallnum.length === 10) ? smallnum
		: (fontDigits.length === 10) ? fontDigits
		: tallnum;
	if (patches.length < 10) return;

	const negative = num < 0;
	if (negative) num = -num;

	const numWidth = patches[0]?.width ?? 8;
	let dx = x;

	if (num === 0) {
		if (useFontDigits) drawPatchThird(dx, y, patches[0]);
		else V_DrawPatch(dx, y, 0, patches[0]);
	} else {
		// draw left-aligned: precompute digits then draw in order
		const digits: number[] = [];
		let n = num;
		while (n > 0) {
			digits.push(n % 10);
			n = (n / 10) | 0;
		}
		for (let i = digits.length - 1; i >= 0; i--) {
			if (useFontDigits) drawPatchThird(dx, y, patches[digits[i]!]!);
			else V_DrawPatch(dx, y, 0, patches[digits[i]!]!);
			dx += numWidth;
		}
	}

	if (negative && tallminus) {
		if (useFontDigits) drawPatchThird(dx, y, tallminus);
		else V_DrawPatch(dx, y, 0, tallminus);
	}
}

// Draw a patch at ~1/3 scale (nearest-neighbor)
function drawPatchThird(x: number, y: number, patch: any): void {
	const dest = screens[0]!;
	const left = Math.floor((patch.leftoffset ?? 0) / 3);
	const top = Math.floor((patch.topoffset ?? 0) / 3);
	x -= left;
	y -= top;

	for (let col = 0; col < patch.width; col += 3) {
		const dx = x + Math.floor(col / 3);
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
				if ((j % 3) !== 0) { offset++; continue; }
				const dy = y + Math.floor((topdelta + j) / 3);
				if (dy >= 0 && dy < SCREENHEIGHT) {
					dest[dy * SCREENWIDTH + dx] = data.getUint8(offset);
				}
				offset++;
			}
			offset++; // skip padding byte
		}
	}
}

export function ST_Responder(ev: any): boolean {
	return false;
}
