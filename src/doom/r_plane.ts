// r_plane.ts — Visplane rendering: floors and ceilings
//
// Each visplane represents a contiguous horizontal region of a floor or ceiling
// at a given height, light level, and flat texture. For each column the visplane
// covers, top[] and bottom[] store the vertical extent that needs to be drawn.
// After all walls are rendered (r_segs), R_DrawPlanes iterates every visplane
// and emits horizontal spans via R_DrawSpan.

import { SCREENWIDTH, SCREENHEIGHT, FRACBITS, FRACUNIT, MAXVISPLANES } from "./doomdef";
import { viewx, viewy, viewz, viewangle } from "./doomstat";
import {
	finesine,
	finecosine,
	fixedMul,
	fixedDiv,
	ANG90,
	ANGLETOFINESHIFT,
	angleToFineIndex,
} from "./tables";
import {
	colormaps,
	firstflat,
	flatTranslation,
	R_GetColumn,
	textures,
} from "./r_data";
import { W_CacheLumpNumAsBytes } from "./w_wad";
import { skyflatnum, skytexture, skytexturemid } from "./r_sky";
import {
	R_DrawColumn,
	R_DrawSpan,
	setDcColormap,
	setDcX,
	setDcYl,
	setDcYh,
	setDcIscale,
	setDcTexturemid,
	setDcSource,
	setDcTexheight,
	setDsColormap,
	setDsY,
	setDsX1,
	setDsX2,
	setDsXfrac,
	setDsYfrac,
	setDsXstep,
	setDsYstep,
	setDsSource,
} from "./r_draw";

// ===== Visplane structure =====

export interface Visplane {
	height: number;       // fixed_t — world z of this plane
	picnum: number;       // flat texture number (relative to firstflat)
	lightlevel: number;
	minx: number;
	maxx: number;
	top: Uint16Array;     // SCREENWIDTH entries; 0xffff = not yet set
	bottom: Uint16Array;  // SCREENWIDTH entries
}

// ===== Module state =====

export let visplanes: Visplane[] = [];
export let lastvisplane: number = 0;   // next free index

export let floorplane: Visplane | null = null;
export let ceilingplane: Visplane | null = null;

// For each screen row, the starting x of the current open span
export let spanstart: Int32Array = new Int32Array(SCREENHEIGHT);
export let spanstop: Int32Array = new Int32Array(SCREENHEIGHT);

// Base texture-mapping scales derived from viewangle at frame start
export let basexscale: number = 0; // fixed_t
export let baseyscale: number = 0;

// Planeheight is |height - viewz| for the plane currently being drawn
let planeheight: number = 0;

// Cached y→distance table (recomputed per visplane)
const yslope: Int32Array = new Int32Array(SCREENHEIGHT);
const distscale: Int32Array = new Int32Array(SCREENWIDTH);

// Lighting
const LIGHTLEVELS = 16;
const LIGHTSEGSHIFT = 4;
const MAXLIGHTSCALE = 48;
const MAXLIGHTZ = 128;
const LIGHTZSHIFT = 20;

const NUMCOLORMAPS = 32;

// centery — the vertical center of the projection, in screen pixels
const centery = SCREENHEIGHT / 2;
const centerx = SCREENWIDTH / 2;
const centerxfrac = centerx << FRACBITS;
const centeryfrac = centery << FRACBITS;

// Projection constant: distance from eye to projection plane
// projection = centerx (in fixed point) — standard for 320-wide, 90-degree FOV
const projection = centerx << FRACBITS;

// ===== Setters =====

export function setFloorPlane(p: Visplane | null): void { floorplane = p; }
export function setCeilingPlane(p: Visplane | null): void { ceilingplane = p; }

// ===== Helpers: xtoviewangle =====
// This is typically computed once in R_InitTextureMapping (r_main) and shared.
// We store a local reference that can be set from outside.

let _xtoviewangle: Uint32Array = new Uint32Array(SCREENWIDTH + 1);

export function setXToViewAngle(table: Uint32Array): void {
	_xtoviewangle = table;
}

export function getXToViewAngle(): Uint32Array {
	return _xtoviewangle;
}

// ===== Public API =====

/**
 * One-time initialisation (call at startup).
 */
export function R_InitPlanes(): void {
	// Nothing required — tables are computed each frame in R_ClearPlanes.
}

/**
 * Called at the start of every frame to reset visplanes and clipping arrays.
 */
export function R_ClearPlanes(): void {
	// Reset counters
	_mapPlaneCount = 0;
	_spanPixelCount = 0;
	_spanSampleLogged = false;

	// Reset visplane pool
	lastvisplane = 0;

	// We always keep at least one dummy visplane at index 0 so that
	// index 0 is never returned as a valid plane (matches original Doom).
	_allocVisplane();

	floorplane = null;
	ceilingplane = null;

	// Compute basexscale / baseyscale from viewangle
	// Original Doom: angle = (viewangle-ANG90)>>ANGLETOFINESHIFT
	//   basexscale = FixedDiv(finecosine[angle], centerxfrac)
	//   baseyscale = -FixedDiv(finesine[angle], centerxfrac)
	const planeAng = (viewangle - ANG90) >>> 0;
	const planeFineAng = angleToFineIndex(planeAng);
	basexscale = fixedDiv(finecosine[planeFineAng]!, centerxfrac);
	baseyscale = fixedDiv(-finesine[planeFineAng]!, centerxfrac);

	// Build yslope: maps screen row → distance multiplier
	for (let i = 0; i < SCREENHEIGHT; i++) {
		const dy = Math.abs(((i - centery) << FRACBITS) + FRACUNIT / 2);
		yslope[i] = dy !== 0 ? fixedDiv(projection, dy) : 0x7fffffff;
	}

	// Build distscale: compensates for screen-column angle
	for (let i = 0; i < SCREENWIDTH; i++) {
		const cosAngle = Math.abs(finecosine[angleToFineIndex(_xtoviewangle[i]!)]!);
		distscale[i] = fixedDiv(FRACUNIT, cosAngle);
	}
}

/**
 * Find (or create) a visplane with the given properties.
 */
export function R_FindPlane(height: number, picnum: number, lightlevel: number): Visplane {
	// Sky ceilings use a special height sentinel so they always share one plane
	if (picnum === skyflatnum) {
		height = 0;
		lightlevel = 0;
	}

	for (let i = 0; i < lastvisplane; i++) {
		const pl = visplanes[i]!;
		if (pl.height === height && pl.picnum === picnum && pl.lightlevel === lightlevel) {
			return pl;
		}
	}

	// Not found — allocate a new one
	return _allocVisplane(height, picnum, lightlevel);
}

/**
 * Ensure the visplane can accept columns [start..stop]. If the existing range
 * overlaps, clone the plane so we don't corrupt already-recorded columns.
 */
export function R_CheckPlane(pl: Visplane, start: number, stop: number): Visplane {
	let intrl: number;
	let intrh: number;

	if (start < pl.minx) {
		intrl = pl.minx;
	} else {
		intrl = start;
	}

	if (stop > pl.maxx) {
		intrh = pl.maxx;
	} else {
		intrh = stop;
	}

	// Check for overlap in the intersection range
	let overlap = false;
	for (let x = intrl; x <= intrh; x++) {
		if (pl.top[x] !== 0xffff) {
			overlap = true;
			break;
		}
	}

	if (!overlap) {
		// No overlap — just extend the range
		if (start < pl.minx) pl.minx = start;
		if (stop > pl.maxx) pl.maxx = stop;
		return pl;
	}

	// Overlap — need a new visplane with the same properties
	const newPl = _allocVisplane(pl.height, pl.picnum, pl.lightlevel);
	newPl.minx = start;
	newPl.maxx = stop;
	return newPl;
}

/**
 * After BSP traversal and seg rendering are complete, draw every visplane.
 */
let _debugPlaneFrame = 0;
export function R_DrawPlanes(): void {
	_debugPlaneFrame++;
	let drawnPlanes = 0;
	let drawnSpans = 0;
	for (let i = 0; i < lastvisplane; i++) {
		const pl = visplanes[i]!;

		if (pl.minx > pl.maxx) continue;

		// Sky planes are drawn as columns, not spans.
		if (pl.picnum === skyflatnum) {
			if (skytexture > 0) {
				const skyTex = textures[skytexture];
				const texH = skyTex ? skyTex.height : 128;
				// Use first colormap (full brightness) for sky
				setDcColormap(colormaps.subarray(0, 256));
				setDcTexheight(texH);
				setDcTexturemid(skytexturemid);
				setDcIscale(FRACUNIT);
				for (let x = pl.minx; x <= pl.maxx; x++) {
					if (pl.top[x] === 0xffff) continue;
					setDcYl(pl.top[x]!);
					setDcYh(pl.bottom[x]!);
					setDcX(x);
					// Sky texture column from viewangle + screen column angle
					// ANGLETOSKYSHIFT = 22 maps full rotation to 1024 columns
					const angle = ((viewangle + _xtoviewangle[x]!) >>> 0);
					const col = angle >>> 22;
					setDcSource(R_GetColumn(skytexture, col));
					R_DrawColumn();
				}
			}
			continue;
		}

		// Load the flat (64x64 raw pixels)
		const flatLump = firstflat + flatTranslation[pl.picnum]!;
		const flatData = W_CacheLumpNumAsBytes(flatLump);
		setDsSource(flatData);

		// Planeheight for this plane
		planeheight = Math.abs(pl.height - viewz);

		// Light table selection
		const lightnum = (pl.lightlevel >>> LIGHTSEGSHIFT) + (viewplayer_extralight ?? 0);
		const lightBase = _clamp(lightnum, 0, LIGHTLEVELS - 1);

		drawnPlanes++;

		// Walk columns left to right, emitting spans where top/bottom change
		let stop = pl.maxx + 1;

		// "Previous" column boundaries — initialise to sentinel
		let prevTop = 0xffff;
		let prevBottom = 0;

		for (let x = pl.minx; x <= stop; x++) {
			const t2 = x <= pl.maxx ? pl.top[x]! : 0xffff;
			const b2 = x <= pl.maxx ? pl.bottom[x]! : 0;

			const t1 = prevTop === 0xffff ? 0xffff : prevTop;
			const b1 = prevTop === 0xffff ? 0 : prevBottom;

			_makeSpans(x, t1, b1, t2, b2, pl.lightlevel);

			prevTop = t2;
			prevBottom = b2;
		}
	}
	if (_debugPlaneFrame === 1) {
		// No-op: debug-only instrumentation removed
	}
}

/**
 * Emit horizontal spans as the column boundaries change.
 *
 * For each row y:
 *   - If a span was open in the previous column but closes here, draw it.
 *   - If a span opens here but was not open in the previous column, record start.
 */
export function R_MakeSpans(
	x: number,
	t1: number,
	b1: number,
	t2: number,
	b2: number,
): void {
	_makeSpans(x, t1, b1, t2, b2, 0);
}

// ===== Sky flat number =====
// skyflatnum imported from r_sky.ts at the top of this file

// Extralight from player (used for gun flash, etc.)
let viewplayer_extralight: number = 0;
export function setViewplayerExtralight(n: number): void { viewplayer_extralight = n; }

// ===== Internal helpers =====

function _allocVisplane(
	height: number = 0,
	picnum: number = 0,
	lightlevel: number = 0,
): Visplane {
	if (lastvisplane >= visplanes.length) {
		// Grow the pool
		visplanes.push(_newVisplane());
	}
	const pl = visplanes[lastvisplane]!;
	pl.height = height;
	pl.picnum = picnum;
	pl.lightlevel = lightlevel;
	pl.minx = SCREENWIDTH;
	pl.maxx = -1;
	pl.top.fill(0xffff);
	pl.bottom.fill(0);
	lastvisplane++;
	return pl;
}

function _newVisplane(): Visplane {
	return {
		height: 0,
		picnum: 0,
		lightlevel: 0,
		minx: SCREENWIDTH,
		maxx: -1,
		top: new Uint16Array(SCREENWIDTH).fill(0xffff),
		bottom: new Uint16Array(SCREENWIDTH),
	};
}

// Pre-allocate a reasonable number
for (let i = 0; i < MAXVISPLANES; i++) {
	visplanes.push(_newVisplane());
}

/**
 * Map and draw one horizontal span at screen row y.
 */
let _mapPlaneCount = 0;
let _spanPixelCount = 0;
let _spanSampleLogged = false;
function _mapPlane(y: number, x1: number, x2: number, lightlevel: number): void {
	if (x1 > x2) return;
	_mapPlaneCount++;
	_spanPixelCount += (x2 - x1 + 1);

	// Distance from viewer to this row of the plane
	const distance = fixedMul(planeheight, yslope[y]!);

	const length_xstep = fixedMul(distance, basexscale);
	const length_ystep = fixedMul(distance, baseyscale);

	// Apply distscale correction for perspective at screen edges
	const length = fixedMul(distance, distscale[x1]!);

	// Angle for the leftmost pixel of this span
	const angle = ((viewangle + _xtoviewangle[x1]!) >>> 0);
	const fineAng = angleToFineIndex(angle);

	setDsXfrac(viewx + fixedMul(finecosine[fineAng]!, length));
	setDsYfrac(-viewy - fixedMul(finesine[fineAng]!, length));

	setDsXstep(length_xstep);
	setDsYstep(length_ystep);

	// Light level: distance-based attenuation
	const index = _clamp((distance >>> LIGHTZSHIFT) | 0, 0, MAXLIGHTZ - 1);
	const lightIdx = _clamp(
		((lightlevel >>> LIGHTSEGSHIFT) + (viewplayer_extralight ?? 0)) - index,
		0,
		NUMCOLORMAPS - 1,
	);
	setDsColormap(colormaps.subarray(lightIdx * 256, lightIdx * 256 + 256));

	setDsY(y);
	setDsX1(x1);
	setDsX2(x2);

	if (!_spanSampleLogged && _debugPlaneFrame === 1) {
		_spanSampleLogged = true;
		const { ds_source: src, ds_colormap: cm } = require("./r_draw");
		// debug logging removed
	}

	R_DrawSpan();
}

/**
 * Transition span boundaries from the previous column to the current one.
 */
function _makeSpans(
	x: number,
	t1: number,
	b1: number,
	t2: number,
	b2: number,
	lightlevel: number,
): void {
	// Original Doom's R_MakeSpans — four simple loops
	while (t1 < t2 && t1 <= b1) {
		_mapPlane(t1, spanstart[t1]!, x - 1, lightlevel);
		t1++;
	}
	while (b1 > b2 && b1 >= t1) {
		_mapPlane(b1, spanstart[b1]!, x - 1, lightlevel);
		b1--;
	}
	while (t2 < t1 && t2 <= b2) {
		spanstart[t2] = x;
		t2++;
	}
	while (b2 > b1 && b2 >= t2) {
		spanstart[b2] = x;
		b2--;
	}
}

function _clamp(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v;
}
