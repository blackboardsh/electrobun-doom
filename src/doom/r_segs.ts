// r_segs.ts — Wall segment rendering
//
// For each visible seg discovered by the BSP traversal (r_bsp), R_StoreWallRange
// calculates the wall's screen projection, determines which textures to draw,
// and renders individual columns via R_DrawColumn. It also records floor/ceiling
// boundaries into visplanes and builds drawsegs for later sprite clipping.

import {
	SCREENWIDTH,
	SCREENHEIGHT,
	FRACBITS,
	FRACUNIT,
	MAXDRAWSEGS,
	MAXOPENINGS,
	ML_DONTPEGBOTTOM,
	ML_DONTPEGTOP,
} from "./doomdef";
import { viewx, viewy, viewz, viewangle } from "./doomstat";
import {
	finesine,
	finecosine,
	finetangent as finetangentTable,
	fixedMul,
	fixedDiv,
	ANG90,
	ANG180,
	ANGLETOFINESHIFT,
	FINEMASK,
	DBITS,
	tantoangle,
	angleToFineIndex,
} from "./tables";
import {
	R_GetColumn,
	textureheight,
	textures,
	colormaps,
} from "./r_data";
import {
	R_DrawColumn,
	setDcColormap,
	setDcX,
	setDcYl,
	setDcYh,
	setDcIscale,
	setDcTexturemid,
	setDcSource,
	setDcTexheight,
	viewwidth,
} from "./r_draw";
import {
	R_CheckPlane,
	setFloorPlane,
	setCeilingPlane,
	floorplane,
	ceilingplane,
	getXToViewAngle,
} from "./r_plane";
import { skyflatnum } from "./r_sky";
import type { Seg, Sector, Line, Side } from "./doomdata";

// ===== Constants =====

const HEIGHTBITS = 12;
const HEIGHTUNIT = 1 << HEIGHTBITS;
const centery = SCREENHEIGHT / 2;
const centeryfrac = centery << FRACBITS;
const centerx = SCREENWIDTH / 2;
const centerxfrac = centerx << FRACBITS;
const projection = centerx << FRACBITS;

// Lighting constants
const LIGHTLEVELS = 16;
const LIGHTSEGSHIFT = 4;
const MAXLIGHTSCALE = 48;
const LIGHTSCALESHIFT = 12;
const NUMCOLORMAPS = 32;

// ===== DrawSeg — records a rendered wall segment for sprite clipping =====

export interface DrawSeg {
	curline: Seg;
	x1: number;
	x2: number;
	scale1: number;   // fixed_t
	scale2: number;
	scalestep: number;
	silhouette: number; // bit flags for top/bottom silhouette
	bsilheight: number; // fixed_t — bottom sil height
	tsilheight: number; // fixed_t — top sil height
	// Pointers into openings array for sprite clip
	sprtopclip: number;   // index into openings
	sprbottomclip: number;
	maskedtexturecol: number; // index into openings, -1 if none
}

export const SIL_NONE = 0;
export const SIL_BOTTOM = 1;
export const SIL_TOP = 2;
export const SIL_BOTH = 3;

// ===== Module state =====

// Current seg being rendered (set by R_StoreWallRange)
export let rw_x: number = 0;
export let rw_stopx: number = 0;
export let rw_angle1: number = 0;
export let rw_distance: number = 0;    // fixed_t
export let rw_normalangle: number = 0;
export let rw_centerangle: number = 0;
export let rw_offset: number = 0;      // fixed_t
export let rw_scale: number = 0;       // fixed_t
export let rw_scalestep: number = 0;   // fixed_t
export let rw_midtexturemid: number = 0;
export let rw_toptexturemid: number = 0;
export let rw_bottomtexturemid: number = 0;

export let worldtop: number = 0;       // fixed_t
export let worldbottom: number = 0;
export let worldhigh: number = 0;
export let worldlow: number = 0;

export let markfloor: boolean = false;
export let markceiling: boolean = false;

export let toptexture: number = 0;
export let bottomtexture: number = 0;
export let midtexture: number = 0;
export let maskedtexture: boolean = false;

export let segtextured: boolean = false;

// Drawsegs array
export let drawsegs: DrawSeg[] = [];
export let ds_p: number = 0; // next free drawseg index

// Openings array — shared clip data for sprite clipping
export let openings: Int16Array = new Int16Array(MAXOPENINGS);
export let lastopening: number = 0;

// Clipping arrays — floor and ceiling clip boundaries per column
// These are shared with r_bsp; r_bsp initialises them each subsector.
export let floorclip: Int16Array = new Int16Array(SCREENWIDTH);
export let ceilingclip: Int16Array = new Int16Array(SCREENWIDTH);
// Per-column nearest wall scale (for sprite occlusion)
export let wallscale: Int32Array = new Int32Array(SCREENWIDTH);

// Current seg/line references (set by r_bsp before calling us)
let curline: Seg | null = null;
let frontsector: Sector | null = null;
let backsector: Sector | null = null;
let sidedef: Side | null = null;
let linedef: Line | null = null;

// Local column-clipping arrays for the current wall range
const walllights: Uint8Array[] = [];

// xtoviewangle reference
let xtoviewangle: Uint32Array;

// ===== Setters =====

export function setCurline(seg: Seg): void { curline = seg; }
export function setFrontsector(sec: Sector): void { frontsector = sec; }
export function setBacksector(sec: Sector | null): void { backsector = sec; }
export function setRwAngle1(a: number): void { rw_angle1 = a; }
export function setRwNormalangle(a: number): void { rw_normalangle = a; }

export function R_ClearDrawSegs(): void {
	ds_p = 0;
	lastopening = 0;
}

export function initClipArrays(): void {
	for (let i = 0; i < SCREENWIDTH; i++) {
		floorclip[i] = SCREENHEIGHT;
		ceilingclip[i] = -1;
		wallscale[i] = 0;
	}
}

// ===== R_ScaleFromGlobalAngle =====

function R_ScaleFromGlobalAngle(visangle: number): number {
	const anglea = ((ANG90 + visangle - viewangle) >>> 0);
	const angleb = ((ANG90 + visangle - rw_normalangle) >>> 0);

	const sinea = finesine[angleToFineIndex(anglea)]!;
	const sineb = finesine[angleToFineIndex(angleb)]!;

	// num = projection * sineb (original: FixedMul(projection, sineb) << detailshift)
	const num = fixedMul(projection, sineb);
	// den = rw_distance * sinea
	const den = fixedMul(rw_distance, sinea);

	// Overflow guard matching original: if den > num>>16, safe to divide
	if (den > (num >> 16)) {
		let scale = fixedDiv(num, den);
		if (scale > 64 * FRACUNIT) scale = 64 * FRACUNIT;
		else if (scale < 256) scale = 256;
		return scale;
	}
	return 64 * FRACUNIT;
}

// ===== Main entry point =====

/**
 * Render the wall columns for a visible seg from screen column `start` to `stop` (inclusive).
 * Called by R_AddLine in r_bsp after clip-checking.
 */
export function R_StoreWallRange(start: number, stop: number): void {
	if (!curline || !frontsector) return;

	xtoviewangle = getXToViewAngle();

	sidedef = curline.sidedef;
	linedef = curline.linedef;

	// Mark the line as mapped (for automap)
	linedef.flags |= 256; // ML_MAPPED

	// ---- 1. Calculate perpendicular distance ----

	// Original Doom: offsetangle = abs(rw_normalangle - rw_angle1)
	// For unsigned 32-bit angles, abs means: if > ANG180, negate
	let offsetangle = ((rw_normalangle - rw_angle1) >>> 0);
	if (offsetangle > ANG180) offsetangle = ((-offsetangle) >>> 0);
	// Clamp to ANG90
	if (offsetangle > ANG90) offsetangle = ANG90;

	// distangle = ANG90 - offsetangle; sineval = sin(distangle) = cos(offsetangle)
	// This gives the perpendicular distance from viewpoint to the wall line
	const distangle = ((ANG90 - offsetangle) >>> 0);
	const sineval = finesine[angleToFineIndex(distangle)]!;
	// hyp = Euclidean distance from viewpoint to seg's first vertex
	const hyp = R_PointToDist(curline.v1.x, curline.v1.y);

	rw_distance = fixedMul(hyp, sineval);
	if (rw_distance < 1) rw_distance = 1;

	// ---- 2. Calculate scale at start and end ----

	rw_x = start;
	rw_stopx = stop + 1;

	rw_scale = R_ScaleFromGlobalAngle(
		(viewangle + xtoviewangle[start]!) >>> 0,
	);

	if (stop > start) {
		const scale2 = R_ScaleFromGlobalAngle(
			(viewangle + xtoviewangle[stop]!) >>> 0,
		);
		rw_scalestep = ((scale2 - rw_scale) / (stop - start)) | 0;
	} else {
		rw_scalestep = 0;
	}

	// ---- 3. World-space heights ----

	worldtop = frontsector.ceilingheight - viewz;
	worldbottom = frontsector.floorheight - viewz;

	// ---- 4. Determine textures ----

	midtexture = 0;
	toptexture = 0;
	bottomtexture = 0;
	maskedtexture = false;
	segtextured = false;

	if (backsector === null) {
		// ---- One-sided line: solid wall ----
		midtexture = sidedef.midtexture;
		segtextured = midtexture > 0;

		// Texture alignment
		if (linedef.flags & ML_DONTPEGBOTTOM) {
			// Bottom of texture at bottom
			const texH = textureheight[midtexture]!;
			rw_midtexturemid = frontsector.floorheight + texH - viewz;
		} else {
			// Top of texture at top
			rw_midtexturemid = worldtop;
		}
		rw_midtexturemid += sidedef.rowoffset;

		markfloor = true;
		markceiling = true;
	} else {
		// ---- Two-sided line ----
		worldhigh = backsector.ceilingheight - viewz;
		worldlow = backsector.floorheight - viewz;

		// Sky hack: prevent HOM at sky sector boundaries
		if (frontsector.ceilingpic === skyflatnum &&
			backsector.ceilingpic === skyflatnum) {
			worldtop = worldhigh;
		}

		// Upper texture (when back ceiling is lower)
		if (worldhigh < worldtop) {
			toptexture = sidedef.toptexture;
			if (linedef.flags & ML_DONTPEGTOP) {
				rw_toptexturemid = worldtop;
			} else {
				const texH = textureheight[toptexture]!;
				rw_toptexturemid = worldhigh + texH;
			}
		}

		// Lower texture (when back floor is higher)
		if (worldlow > worldbottom) {
			bottomtexture = sidedef.bottomtexture;
			if (linedef.flags & ML_DONTPEGBOTTOM) {
				rw_bottomtexturemid = worldtop;
			} else {
				rw_bottomtexturemid = worldlow;
			}
		}
		rw_toptexturemid += sidedef.rowoffset;
		rw_bottomtexturemid += sidedef.rowoffset;

		// Masked midtexture (e.g. grates, fences)
		if (sidedef.midtexture) {
			maskedtexture = true;
		}

		segtextured = toptexture > 0 || bottomtexture > 0 || maskedtexture;

		// Determine whether to mark floor/ceiling for flat rendering
		markfloor = frontsector.floorheight !== backsector.floorheight ||
			frontsector.floorpic !== backsector.floorpic ||
			frontsector.lightlevel !== backsector.lightlevel;

		markceiling = frontsector.ceilingheight !== backsector.ceilingheight ||
			frontsector.ceilingpic !== backsector.ceilingpic ||
			frontsector.lightlevel !== backsector.lightlevel;

		// Closed door: always mark both
		if (backsector.ceilingheight <= frontsector.floorheight ||
			backsector.floorheight >= frontsector.ceilingheight) {
			markceiling = true;
			markfloor = true;
		}
	}

	// View-plane culling: don't mark surfaces we can't see from this side
	if (frontsector.floorheight >= viewz) {
		markfloor = false;
	}
	if (frontsector.ceilingheight <= viewz &&
		frontsector.ceilingpic !== skyflatnum) {
		markceiling = false;
	}

	// ---- 5. Texture column offset ----

	if (segtextured) {
		// Original Doom recomputes sineval for offset using sin(offsetangle), not sin(distangle)
		const offsetsineval = finesine[angleToFineIndex(offsetangle)]!;
		rw_offset = fixedMul(hyp, offsetsineval);
		if (((rw_normalangle - rw_angle1) >>> 0) < ANG180) {
			rw_offset = -rw_offset;
		}
		rw_offset += sidedef.textureoffset + curline.offset;
		rw_centerangle = ((ANG90 + viewangle - rw_normalangle) >>> 0);
	}

	// ---- 6. Create drawseg for sprite clipping ----

	if (ds_p >= drawsegs.length) {
		drawsegs.push(_newDrawSeg());
	}
	const seg = drawsegs[ds_p]!;
	seg.curline = curline;
	seg.x1 = start;
	seg.x2 = stop;
	seg.scale1 = rw_scale;
	seg.scale2 = stop > start
		? R_ScaleFromGlobalAngle((viewangle + xtoviewangle[stop]!) >>> 0)
		: rw_scale;
	seg.scalestep = rw_scalestep;
	seg.silhouette = SIL_NONE;
	seg.bsilheight = 0;
	seg.tsilheight = 0;
	seg.sprtopclip = -1;
	seg.sprbottomclip = -1;
	seg.maskedtexturecol = -1;

	// Set silhouette flags
	if (backsector === null) {
		seg.silhouette = SIL_BOTH;
		seg.sprtopclip = 0;
		seg.sprbottomclip = 0;
		seg.bsilheight = 0x7fffffff;
		seg.tsilheight = -0x7fffffff;
	} else {
		// Closed door: back ceiling <= front floor
		if (backsector.ceilingheight <= frontsector.floorheight) {
			seg.silhouette |= SIL_BOTTOM;
			seg.bsilheight = 0x7fffffff;
		}
		// Closed door: back floor >= front ceiling
		if (backsector.floorheight >= frontsector.ceilingheight) {
			seg.silhouette |= SIL_TOP;
			seg.tsilheight = -0x7fffffff;
		}

		if (frontsector.floorheight > backsector.floorheight) {
			seg.silhouette |= SIL_BOTTOM;
			seg.bsilheight = frontsector.floorheight;
		} else if (backsector.floorheight > viewz) {
			seg.silhouette |= SIL_BOTTOM;
			seg.bsilheight = 0x7fffffff;
		}

		if (frontsector.ceilingheight < backsector.ceilingheight) {
			seg.silhouette |= SIL_TOP;
			seg.tsilheight = frontsector.ceilingheight;
		} else if (backsector.ceilingheight < viewz) {
			seg.silhouette |= SIL_TOP;
			seg.tsilheight = -0x7fffffff;
		}
	}

	// Allocate masked texture column indices if needed
	if (maskedtexture) {
		seg.maskedtexturecol = lastopening - start;
		lastopening += rw_stopx - start;
	}

	// ---- 7. Check visplanes for floor/ceiling ----
	// R_Subsector already created the planes; we just need to ensure
	// the current column range [start..stop] can be accepted.

	if (markfloor && floorplane) {
		setFloorPlane(R_CheckPlane(floorplane, start, stop));
	}

	if (markceiling && ceilingplane) {
		setCeilingPlane(R_CheckPlane(ceilingplane, start, stop));
	}

	// ---- 8. Render columns ----

	R_RenderSegLoop();

	// Save sprite clip data into openings
	if ((seg.silhouette & SIL_TOP || maskedtexture) && seg.sprtopclip === -1) {
		seg.sprtopclip = lastopening;
		for (let i = start; i <= stop; i++) {
			openings[lastopening++] = ceilingclip[i]!;
		}
	}
	if ((seg.silhouette & SIL_BOTTOM || maskedtexture) && seg.sprbottomclip === -1) {
		seg.sprbottomclip = lastopening;
		for (let i = start; i <= stop; i++) {
			openings[lastopening++] = floorclip[i]!;
		}
	}

	if (maskedtexture && seg.maskedtexturecol >= 0) {
		// Store the texture column offset for each screen column
		for (let i = start; i <= stop; i++) {
			openings[seg.maskedtexturecol + i] = _textureColumn(i);
		}
	}

	ds_p++;
}

// ===== R_RenderSegLoop =====

/**
 * Iterate over columns [rw_x .. rw_stopx) and draw wall textures,
 * updating floor/ceiling clip arrays and visplanes.
 */
function R_RenderSegLoop(): void {
	let scale = rw_scale;

	for (let x = rw_x; x < rw_stopx; x++) {
		// Track nearest wall for sprite occlusion (larger scale == closer)
		if (scale > wallscale[x]!) wallscale[x] = scale;

		// Project top and bottom of the wall at this column
		let yl = ((centeryfrac - fixedMul(worldtop, scale)) + FRACUNIT - 1) >> FRACBITS;
		let yh = ((centeryfrac - fixedMul(worldbottom, scale))) >> FRACBITS;

		// Clip to floor/ceiling clip arrays
		const cceil = ceilingclip[x]! + 1;
		const cfloor = floorclip[x]! - 1;

		// ---- Ceiling flat ----
		if (markceiling) {
			let top = cceil;
			let bottom = yl - 1;
			if (bottom >= cfloor) bottom = cfloor;
			if (top <= bottom && ceilingplane) {
				ceilingplane.top[x] = top;
				ceilingplane.bottom[x] = bottom;
			}
		}

		// ---- Floor flat ----
		if (markfloor) {
			let top = yh + 1;
			let bottom = cfloor;
			if (top <= cceil) top = cceil;
			if (top <= bottom && floorplane) {
				floorplane.top[x] = top;
				floorplane.bottom[x] = bottom;
			}
		}

		// Clamp drawing bounds
		if (yl < cceil) yl = cceil;
		if (yh > cfloor) yh = cfloor;

		// ---- Select light level based on scale ----
		let lightIndex = (scale >> LIGHTSCALESHIFT) | 0;
		if (lightIndex < 0) lightIndex = 0;
		if (lightIndex >= MAXLIGHTSCALE) lightIndex = MAXLIGHTSCALE - 1;

		const lightnum = _clamp(
			(frontsector!.lightlevel >> LIGHTSEGSHIFT),
			0,
			NUMCOLORMAPS - 1,
		);
		// Combine wall light with distance attenuation
		const cmapIdx = _clamp(lightnum - lightIndex, 0, NUMCOLORMAPS - 1);
		const cmap = colormaps.subarray(cmapIdx * 256, cmapIdx * 256 + 256);

		// ---- Mid texture (one-sided wall) ----
		if (midtexture > 0) {
			setDcColormap(cmap);
			setDcX(x);
			setDcYl(yl);
			setDcYh(yh);

			const texH = textures[midtexture]!.height;
			setDcTexheight(texH);
			setDcTexturemid(rw_midtexturemid);
			setDcIscale(Math.abs(fixedDiv(FRACUNIT, scale)));

			const texturecolumn = _textureColumn(x);
			setDcSource(R_GetColumn(midtexture, texturecolumn));

			R_DrawColumn();

			// One-sided — fully clips
			ceilingclip[x] = SCREENHEIGHT;
			floorclip[x] = -1;
		} else {
			// ---- Two-sided line ----

			// Upper texture
			if (toptexture > 0) {
				const mid = ((centeryfrac - fixedMul(worldhigh, scale))) >> FRACBITS;
				let pixhigh = mid;
				if (pixhigh > cfloor) pixhigh = cfloor;

				if (yl <= pixhigh) {
					setDcColormap(cmap);
					setDcX(x);
					setDcYl(yl);
					setDcYh(pixhigh);

					const texH = textures[toptexture]!.height;
					setDcTexheight(texH);
					setDcTexturemid(rw_toptexturemid);
					setDcIscale(Math.abs(fixedDiv(FRACUNIT, scale)));

					const texturecolumn = _textureColumn(x);
					setDcSource(R_GetColumn(toptexture, texturecolumn));

					R_DrawColumn();
					// Original Doom: ceilingclip[rw_x] = mid;
					ceilingclip[x] = pixhigh;
				} else {
					// Original Doom: ceilingclip[rw_x] = yl-1;
					ceilingclip[x] = yl - 1;
				}
			} else if (markceiling) {
				// No upper texture, but ceiling needs marking — update clip
				ceilingclip[x] = yl - 1;
			}

			// Lower texture
			if (bottomtexture > 0) {
				const mid = ((centeryfrac - fixedMul(worldlow, scale)) + FRACUNIT - 1) >> FRACBITS;
				let pixlow = mid;
				if (pixlow < cceil) pixlow = cceil;

				if (yh >= pixlow) {
					setDcColormap(cmap);
					setDcX(x);
					setDcYl(pixlow);
					setDcYh(yh);

					const texH = textures[bottomtexture]!.height;
					setDcTexheight(texH);
					setDcTexturemid(rw_bottomtexturemid);
					setDcIscale(Math.abs(fixedDiv(FRACUNIT, scale)));

					const texturecolumn = _textureColumn(x);
					setDcSource(R_GetColumn(bottomtexture, texturecolumn));

					R_DrawColumn();
					// Original Doom: floorclip[rw_x] = mid;
					floorclip[x] = pixlow;
				} else {
					// Original Doom: floorclip[rw_x] = yh+1;
					floorclip[x] = yh + 1;
				}
			} else if (markfloor) {
				// No lower texture, but floor needs marking — update clip
				floorclip[x] = yh + 1;
			}
		}

		scale += rw_scalestep;
	}
}

// ===== Internal helpers =====

/**
 * Compute the Euclidean distance from the viewpoint to (x, y).
 * Matches the original Doom R_PointToDist from r_main.c.
 */
function R_PointToDist(x: number, y: number): number {
	let dx = Math.abs(x - viewx);
	let dy = Math.abs(y - viewy);

	if (dy > dx) {
		const temp = dx;
		dx = dy;
		dy = temp;
	}

	if (dx === 0) return 0;

	// angle = atan(dy/dx) + 90°, looked up via tantoangle
	const frac = fixedDiv(dy, dx);
	const angle = ((tantoangle[(frac >>> DBITS)]! + ANG90) >>> ANGLETOFINESHIFT) & FINEMASK;
	// dist = dx / sin(angle) = dx / cos(atan(dy/dx)) ≈ sqrt(dx² + dy²)
	const dist = fixedDiv(dx, finesine[angle]!);
	return dist;
}

/**
 * Compute the texture column index for screen column x.
 */
function _textureColumn(x: number): number {
	const angle = ((rw_centerangle + getXToViewAngle()[x]!) >>> 0);
	// Original Doom indexes finetangent with full 13-bit fine angle (0-8191).
	// Indices 4096+ overflow into finesine — our combined table handles this.
	const fineIdx = (angle >>> ANGLETOFINESHIFT) & FINEMASK;
	let col = (rw_offset - fixedMul(finetangentTable[fineIdx]!, rw_distance)) >> FRACBITS;
	return col;
}

function _newDrawSeg(): DrawSeg {
	return {
		curline: null as any,
		x1: 0,
		x2: 0,
		scale1: 0,
		scale2: 0,
		scalestep: 0,
		silhouette: SIL_NONE,
		bsilheight: 0,
		tsilheight: 0,
		sprtopclip: -1,
		sprbottomclip: -1,
		maskedtexturecol: -1,
	};
}

// Pre-allocate drawsegs
for (let i = 0; i < MAXDRAWSEGS; i++) {
	drawsegs.push(_newDrawSeg());
}

function _clamp(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v;
}
