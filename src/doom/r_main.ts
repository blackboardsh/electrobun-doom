// r_main.ts — Main renderer entry point (orchestrates BSP traversal, plane rendering, sprite rendering)

import { SCREENWIDTH, SCREENHEIGHT, FRACBITS, FRACUNIT } from "./doomdef";
import * as doomstat from "./doomstat";
import { ANG90, ANG270, ANGLETOFINESHIFT, FINEMASK, finesine, finecosine, fixedMul, fixedDiv, pointToAngle2, tantoangle, SLOPERANGE } from "./tables";

// Rendering constants
export const FIELDOFVIEW = 2048;  // fov = 90 degrees
export let centerx: number = SCREENWIDTH / 2;
export let centery: number = SCREENHEIGHT / 2;
export let centerxfrac: number = centerx * FRACUNIT;
export let centeryfrac: number = centery * FRACUNIT;
export let projection: number = centerxfrac;

// Angles for each screen column
export let viewangletox: Int32Array = new Int32Array(0);
export let xtoviewangle: Uint32Array = new Uint32Array(0);

// Validcount for checking visited state
export let validcount: number = 1;

// Light tables
export const LIGHTLEVELS = 16;
export const LIGHTSEGSHIFT = 4;
export const MAXLIGHTSCALE = 48;
export const LIGHTSCALESHIFT = 12;
export const MAXLIGHTZ = 128;
export const LIGHTZSHIFT = 20;

export let scalelight: Uint8Array[][] = [];
export let scalelightfixed: Uint8Array[] = [];
export let zlight: Uint8Array[][] = [];
export let fixedcolormap: Uint8Array | null = null;

export function R_Init(): void {
	R_InitTables();
	R_InitLightTables();

	const { R_InitData } = require("./r_data");
	R_InitData();

	const { R_InitDrawFunctions, R_InitTranslationTables } = require("./r_draw");
	R_InitDrawFunctions();
	R_InitTranslationTables();

	const { R_InitSkyMap } = require("./r_sky");
	R_InitSkyMap();

	const { R_InitPlanes } = require("./r_plane");
	R_InitPlanes();

	const { sprnames } = require("./info");
	const { R_InitSprites } = require("./r_things");
	R_InitSprites(sprnames);
}

function R_InitTables(): void {
	// Original Doom algorithm from r_main.c R_InitTextureMapping()
	const { finetangent } = require("./tables");
	const FINEANGLES = 8192;

	// focallength = centerx / tan(fov/2)
	// finetangent[FINEANGLES/4 + FIELDOFVIEW/2] = tan(fov/2) in fixed point
	const fovTan = finetangent[FINEANGLES / 4 + FIELDOFVIEW / 2]!;
	const focallength = fovTan !== 0 ? fixedDiv(centerxfrac, fovTan) : centerxfrac;

	// viewangletox: for each fine angle, compute which screen column it maps to
	// t = centerx - tan(angle) * focallength (both in fixed point)
	viewangletox = new Int32Array(FINEANGLES / 2);
	for (let i = 0; i < FINEANGLES / 2; i++) {
		const tangent = finetangent[i]!;
		let t: number;
		if (tangent > FRACUNIT * 2) {
			t = -1;
		} else if (tangent < -FRACUNIT * 2) {
			t = SCREENWIDTH + 1;
		} else {
			t = centerx - ((fixedMul(tangent, focallength) + FRACUNIT - 1) >> FRACBITS);
		}
		if (t < -1) t = -1;
		if (t > SCREENWIDTH + 1) t = SCREENWIDTH + 1;
		viewangletox[i] = t;
	}

	// Scan viewangletox to create xtoviewangle (reverse mapping)
	// For each screen column, find the largest fine angle index that maps to column <= x
	xtoviewangle = new Uint32Array(SCREENWIDTH + 1);
	for (let x = 0; x <= SCREENWIDTH; x++) {
		let i = 0;
		while (i < viewangletox.length - 1 && viewangletox[i]! > x) {
			i++;
		}
		// Fine angle i maps to BAM angle: (i << ANGLETOFINESHIFT) wraps around
		// i=0 is 90 degrees right of center, i=2048 is center, i=4095 is 90 left
		// BAM: subtract ANG90 to center it
		xtoviewangle[x] = ((i << ANGLETOFINESHIFT) - ANG90) >>> 0;
	}

	// clipangle = angle at column 0 (left edge of screen = rightmost visible angle)
	const { setClipangle } = require("./r_bsp");
	const ca = xtoviewangle[0]!;
	setClipangle(ca);

	// Fencepost fix: only patch sentinel values, matching original Doom's
	// R_InitTextureMapping. The original's third loop computes 't' but never
	// assigns it — it only clamps -1 → 0 and viewwidth+1 → viewwidth.
	for (let i = 0; i < FINEANGLES / 2; i++) {
		if (viewangletox[i] === -1) viewangletox[i] = 0;
		else if (viewangletox[i] === SCREENWIDTH + 1) viewangletox[i] = SCREENWIDTH;
	}

	// Share tables with other modules
	const { setXToViewAngle } = require("./r_plane");
	setXToViewAngle(xtoviewangle);
}

function R_InitLightTables(): void {
	const { colormaps: cm } = require("./r_data");
	// Will be called after R_InitData loads colormaps
	// Initialize scale light and z light arrays
	scalelight = [];
	for (let i = 0; i < LIGHTLEVELS; i++) {
		scalelight.push([]);
		for (let j = 0; j < MAXLIGHTSCALE; j++) {
			const level = Math.max(0, Math.min(31, i * 2 - (MAXLIGHTSCALE - 1 - j) / 2));
			scalelight[i]!.push(new Uint8Array(256)); // placeholder, populated after colormaps load
		}
	}

	zlight = [];
	for (let i = 0; i < LIGHTLEVELS; i++) {
		zlight.push([]);
		for (let j = 0; j < MAXLIGHTZ; j++) {
			const level = Math.max(0, Math.min(31, i * 2 - (MAXLIGHTZ - 1 - j)));
			zlight[i]!.push(new Uint8Array(256));
		}
	}
}

export function R_SetupLightTables(): void {
	// Called after colormaps are loaded to populate actual colormap references
	const { colormaps: cm } = require("./r_data");
	if (!cm) return;

	for (let i = 0; i < LIGHTLEVELS; i++) {
		for (let j = 0; j < MAXLIGHTSCALE; j++) {
			const level = Math.max(0, Math.min(31, ((i * 16) + 16 - (MAXLIGHTSCALE - 1 - j)) >> 1));
			scalelight[i]![j] = cm.subarray((31 - level) * 256, (31 - level) * 256 + 256);
		}
		for (let j = 0; j < MAXLIGHTZ; j++) {
			const scale = ((160 * FRACUNIT) / ((j + 1) << LIGHTZSHIFT)) >> LIGHTSCALESHIFT;
			const level = Math.max(0, Math.min(31, ((i * 16) + 16 - scale) >> 1));
			zlight[i]![j] = cm.subarray((31 - level) * 256, (31 - level) * 256 + 256);
		}
	}
}

export function R_SetupFrame(player: any): void {
	const mo = player.mo;
	if (!mo) return;

	doomstat.setViewX(mo.x);
	doomstat.setViewY(mo.y);
	doomstat.setViewAngle(mo.angle);
	doomstat.setViewZ(player.viewz);

	const viewangle = mo.angle;
	const fineAngle = (viewangle >>> ANGLETOFINESHIFT) & FINEMASK;
	doomstat.setViewSin(finesine[fineAngle]!);
	doomstat.setViewCos(finecosine[fineAngle]!);

	validcount++;

	if (player.fixedcolormap) {
		const { colormaps: cm } = require("./r_data");
		fixedcolormap = cm ? cm.subarray(player.fixedcolormap * 256, (player.fixedcolormap + 1) * 256) : null;
	} else {
		fixedcolormap = null;
	}
}

export function R_RenderPlayerView(player: any): void {
	R_SetupFrame(player);

	// Clear screen buffer each frame to prevent smearing
	const { screens: scr } = require("./v_video");
	scr[0].fill(0);

	// Clear buffers
	const { R_ClearClipSegs, R_RenderBSPNode } = require("./r_bsp");
	const { R_ClearDrawSegs, floorclip, ceilingclip, initClipArrays } = require("./r_segs");
	const { R_ClearPlanes, R_DrawPlanes } = require("./r_plane");
	const { R_ClearSprites, R_DrawMasked, R_DrawPlayerSprites } = require("./r_things");

	R_ClearClipSegs();
	R_ClearDrawSegs();
	R_ClearPlanes();
	R_ClearSprites();

	// Reset clip arrays
	initClipArrays();

	// Render BSP (fills drawsegs, visplanes, vissprites)
	if (doomstat.numnodes > 0) {
		R_RenderBSPNode(doomstat.numnodes - 1);
	}

	// debug instrumentation removed

	// Draw floors and ceilings
	R_DrawPlanes();

	// debug instrumentation removed

	// Draw sprites and masked textures
	R_DrawMasked();

	// Draw player weapon sprites
	R_DrawPlayerSprites();
}

export function R_PointInSubsector(x: number, y: number): any {
	// Trace specifically for player spawn position (-416, 256) = (-27262976, 16777216)
	const shouldTrace = false;
	let nodenum = doomstat.numnodes - 1;
	let depth = 0;
	if (shouldTrace) {}
	while (!(nodenum & 0x8000)) {
		const node = doomstat.nodes[nodenum]!;
		const dx = x - node.x;
		const dy = y - node.y;

		let side: number;
		if (node.dx === 0) {
			side = x <= node.x ? (node.dy > 0 ? 1 : 0) : (node.dy < 0 ? 1 : 0);
		} else if (node.dy === 0) {
			side = y <= node.y ? (node.dx < 0 ? 1 : 0) : (node.dx > 0 ? 1 : 0);
		} else {
			const left = Math.floor(((node.dy >> FRACBITS) * dx) / 65536);
			const right = Math.floor((dy * (node.dx >> FRACBITS)) / 65536);
			side = right < left ? 0 : 1;
			if (shouldTrace) {}
		}
		if (shouldTrace) {}
		nodenum = node.children[side]!;
		depth++;
	}
	const ssnum = nodenum & (~0x8000);
	if (shouldTrace) {}
	return doomstat.subsectors[ssnum]!;
}
