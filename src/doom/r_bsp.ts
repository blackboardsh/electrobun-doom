import { SCREENWIDTH, SCREENHEIGHT, FRACBITS, FRACUNIT } from "./doomdef";
import * as doomstat from "./doomstat";
import { fixedDiv } from "./tables";
import { ANG90, ANG180, ANG270, finesine, finecosine, ANGLETOFINESHIFT, FINEMASK, pointToAngle2 } from "./tables";
import type { Node, SubSector, Seg, Line, Sector } from "./doomdata";
import { NF_SUBSECTOR } from "./doomdata";
import { BOXTOP, BOXBOTTOM, BOXLEFT, BOXRIGHT } from "./m_misc";

// Current seg being processed (set by r_segs)
export let curline: Seg | null = null;
export function setCurline(seg: Seg | null) { curline = seg; }

// Segs found during BSP traversal, to be rendered
export interface DrawSeg {
	curline: Seg;
	x1: number;
	x2: number;
	scale1: number;       // fixed_t
	scale2: number;
	scalestep: number;
	silhouette: number;
	bsilheight: number;    // fixed_t
	tsilheight: number;
	sprtopclip: Int16Array | null;
	sprbottomclip: Int16Array | null;
	maskedtexturecol: Int16Array | null;
}

// Clip values
export const MAXDRAWSEGS = 256;
export let drawsegs: DrawSeg[] = [];
export let ds_p: number = 0; // current drawseg index

// Solid segs
interface ClipRange {
	first: number;
	last: number;
}

export let solidsegs: ClipRange[] = [];

// BSP clipangle
export let clipangle: number = 0;
export function setClipangle(a: number) { clipangle = a; }

// Screen edge angles
export let viewangletox: Int32Array = new Int32Array(0);
export let xtoviewangle: Uint32Array = new Uint32Array(0);

export function setViewangletox(v: Int32Array) { viewangletox = v; }
export function setXtoviewangle(v: Uint32Array) { xtoviewangle = v; }

// Rendering to these arrays
export const floorclip = new Int16Array(SCREENWIDTH);
export const ceilingclip = new Int16Array(SCREENWIDTH);

// Opening arrays for 2-sided lines
export const openings = new Int16Array(SCREENWIDTH * 64);
export let lastopening = 0;
export function setLastopening(v: number) { lastopening = v; }

// Clipping result
export const SIL_NONE = 0;
export const SIL_BOTTOM = 1;
export const SIL_TOP = 2;
export const SIL_BOTH = 3;

// New subsector callback reference (set by r_main)
export let newSubsectorCallback: ((subsec: SubSector) => void) | null = null;
export let addLineCallback: ((seg: Seg) => void) | null = null;

export function setNewSubsectorCallback(cb: (subsec: SubSector) => void) { newSubsectorCallback = cb; }
export function setAddLineCallback(cb: (seg: Seg) => void) { addLineCallback = cb; }

// Initialize
export function R_ClearClipSegs(): void {
	solidsegs = [
		{ first: -0x7fffffff, last: -1 },
		{ first: SCREENWIDTH, last: 0x7fffffff },
	];
}

export function R_ClearDrawSegs(): void {
	drawsegs = [];
	ds_p = 0;
}

// Main BSP traversal
export function R_RenderBSPNode(bspnum: number): void {
	if (bspnum & NF_SUBSECTOR) {
		if (bspnum === -1) {
			R_Subsector(0);
		} else {
			R_Subsector(bspnum & (~NF_SUBSECTOR));
		}
		return;
	}

	const bsp = doomstat.nodes[bspnum]!;

	// Decide which side the viewpoint is on
	const side = R_PointOnSide(doomstat.viewx, doomstat.viewy, bsp);

	// Recursively render front space
	R_RenderBSPNode(bsp.children[side]!);

	// Check if back space needs rendering
	if (R_CheckBBox(bsp.bbox[side ^ 1 as 0 | 1]!)) {
		R_RenderBSPNode(bsp.children[side ^ 1 as 0 | 1]!);
	}
}

function R_PointOnSide(x: number, y: number, node: Node): number {
	if (node.dx === 0) {
		if (x <= node.x) return node.dy > 0 ? 1 : 0;
		return node.dy < 0 ? 1 : 0;
	}
	if (node.dy === 0) {
		if (y <= node.y) return node.dx < 0 ? 1 : 0;
		return node.dx > 0 ? 1 : 0;
	}

	const dx = x - node.x;
	const dy = y - node.y;

	// Cross product: partition_dx * point_dy - partition_dy * point_dx
	// Use full-precision FixedMul matching original Doom
	const left = Math.floor(((node.dy >> FRACBITS) * dx) / 65536);
	const right = Math.floor((dy * (node.dx >> FRACBITS)) / 65536);

	return right < left ? 0 : 1;
}

function R_CheckBBox(bspcoord: number[]): boolean {
	// Check if any part of the bounding box is visible
	const boxx = doomstat.viewx <= bspcoord[BOXLEFT]! ? 0 :
	             doomstat.viewx < bspcoord[BOXRIGHT]! ? 1 : 2;
	const boxy = doomstat.viewy >= bspcoord[BOXTOP]! ? 0 :
	             doomstat.viewy > bspcoord[BOXBOTTOM]! ? 1 : 2;

	const boxpos = boxy * 4 + boxx;
	if (boxpos === 5) return true; // viewpoint inside box

	const checkcoord: number[][] = [
		[3, 0, 2, 1], [3, 0, 2, 0], [3, 1, 2, 0], [0, 0, 0, 0],
		[2, 0, 2, 1], [0, 0, 0, 0], [3, 1, 3, 0], [0, 0, 0, 0],
		[2, 0, 3, 1], [2, 1, 3, 1], [2, 1, 3, 0],
	];

	const cc = checkcoord[boxpos]!;
	// Simplified bbox check
	const x1 = bspcoord[cc[0]!]!;
	const y1 = bspcoord[cc[1]!]!;
	const x2 = bspcoord[cc[2]!]!;
	const y2 = bspcoord[cc[3]!]!;

	// All angle_t arithmetic must be unsigned 32-bit (>>> 0) to match C
	const angle1 = (pointToAngle2(doomstat.viewx, doomstat.viewy, x1, y1) - doomstat.viewangle) >>> 0;
	const angle2 = (pointToAngle2(doomstat.viewx, doomstat.viewy, x2, y2) - doomstat.viewangle) >>> 0;

	const span = (angle1 - angle2) >>> 0;
	if (span >= ANG180) return true; // sitting on a line

	let tspan = (angle1 + clipangle) >>> 0;
	if (tspan > (2 * clipangle) >>> 0) {
		tspan = (tspan - (2 * clipangle) >>> 0) >>> 0;
		if (tspan >= span) return false;
	}

	tspan = (clipangle - angle2) >>> 0;
	if (tspan > (2 * clipangle) >>> 0) {
		tspan = (tspan - (2 * clipangle) >>> 0) >>> 0;
		if (tspan >= span) return false;
	}

	return true;
}

function R_Subsector(num: number): void {
	if (num >= doomstat.numsubsectors) return;
	_subsectorCount++;
	const sub = doomstat.subsectors[num]!;

	// Set up floor/ceiling visplanes for this subsector (original Doom pattern:
	// R_Subsector sets the globals, R_StoreWallRange uses R_CheckPlane on them)
	const frontsector = sub.sector;
	if (frontsector) {
		const { R_FindPlane, setFloorPlane, setCeilingPlane } = require("./r_plane");
		const { skyflatnum } = require("./r_sky");
		if (frontsector.floorheight < doomstat.viewz) {
			setFloorPlane(R_FindPlane(frontsector.floorheight, frontsector.floorpic, frontsector.lightlevel));
		} else {
			setFloorPlane(null);
		}
		if (frontsector.ceilingheight > doomstat.viewz || frontsector.ceilingpic === skyflatnum) {
			setCeilingPlane(R_FindPlane(frontsector.ceilingheight, frontsector.ceilingpic, frontsector.lightlevel));
		} else {
			setCeilingPlane(null);
		}
	}

	// Add sprites from this sector
	if (frontsector) {
		const { R_AddSprites } = require("./r_things");
		R_AddSprites(frontsector);
	}

	// Render each seg
	for (let i = 0; i < sub.numlines; i++) {
		const seg = doomstat.segs[sub.firstline + i]!;
		R_AddLine(seg);
	}
}

let _addLineCount = 0;
let _storeCount = 0;
let _debugDone = false;
let _subsectorCount = 0;
let _rejectBackface = 0;
let _rejectLeftClip = 0;
let _rejectRightClip = 0;
let _rejectX1X2 = 0;
function R_AddLine(seg: Seg): void {
	_addLineCount++;
	// Get ABSOLUTE angles to the seg endpoints
	const absAngle1 = pointToAngle2(doomstat.viewx, doomstat.viewy, seg.v1.x, seg.v1.y);
	const absAngle2 = pointToAngle2(doomstat.viewx, doomstat.viewy, seg.v2.x, seg.v2.y);

	// debug logging removed

	// View-relative angles
	const angle1 = (absAngle1 - doomstat.viewangle) >>> 0;
	const angle2 = (absAngle2 - doomstat.viewangle) >>> 0;

	// Check if the seg is facing us (span > 0 in unsigned angle space)
	const span = (angle1 - angle2) >>> 0;
	if (span >= ANG180) { _rejectBackface++; return; } // Back side

	// Clip to the view frustum
	let clippedAngle1 = angle1;

	// Left clip
	let tspan = (angle1 + clipangle) >>> 0;
	if (tspan > (2 * clipangle) >>> 0) {
		tspan = (tspan - (2 * clipangle) >>> 0) >>> 0;
		if (tspan >= span) { _rejectLeftClip++; return; }
		clippedAngle1 = clipangle;
	}

	// Right clip
	let clippedAngle2 = angle2;
	tspan = (clipangle - angle2) >>> 0;
	if (tspan > (2 * clipangle) >>> 0) {
		tspan = (tspan - (2 * clipangle) >>> 0) >>> 0;
		if (tspan >= span) { _rejectRightClip++; return; }
		clippedAngle2 = (0 - clipangle) >>> 0;
	}

	// Convert view-relative angles to screen columns
	const { viewangletox: vat } = require("./r_main");
	const x1 = viewangleToX((clippedAngle1 + ANG90) >>> 0, vat);
	const x2 = viewangleToX((clippedAngle2 + ANG90) >>> 0, vat) - 1;

	if (x1 > x2) { _rejectX1X2++; return; }

	_storeCount++;

	const backsector = seg.backsector;
	const frontsector = seg.frontsector;

	// Determine if this is a solid wall (blocks view) or pass-through (window/step)
	if (!backsector) {
		// One-sided line: always solid
		R_ClipSolidWallSegment(x1, x2, seg, absAngle1);
		return;
	}

	// Closed door: treat as solid
	if (backsector.ceilingheight <= frontsector.floorheight ||
		backsector.floorheight >= frontsector.ceilingheight) {
		R_ClipSolidWallSegment(x1, x2, seg, absAngle1);
		return;
	}

	// Window (different heights)
	if (backsector.ceilingheight !== frontsector.ceilingheight ||
		backsector.floorheight !== frontsector.floorheight) {
		R_ClipPassWallSegment(x1, x2, seg, absAngle1);
		return;
	}

	// Reject empty lines with identical sectors (trigger lines)
	if (backsector.ceilingpic === frontsector.ceilingpic &&
		backsector.floorpic === frontsector.floorpic &&
		backsector.lightlevel === frontsector.lightlevel &&
		seg.sidedef.midtexture === 0) {
		return;
	}

	// Different textures or light — pass-through
	R_ClipPassWallSegment(x1, x2, seg, absAngle1);
}

export function _debugPrintAndReset(): void {
	if (!_debugDone) {
		_debugDone = true;
	}
	_addLineCount = 0;
	_storeCount = 0;
	_subsectorCount = 0;
	_rejectBackface = 0;
	_rejectLeftClip = 0;
	_rejectRightClip = 0;
	_rejectX1X2 = 0;
}

function viewangleToX(angle: number, vat: Int32Array): number {
	// angle is (viewRelativeAngle + ANG90) in BAM. Convert to fine angle index.
	// For visible angles, this gives fine indices ~1024..3072 (center of the vat table).
	let fineangle = (angle >>> ANGLETOFINESHIFT) & FINEMASK;

	// viewangletox has 4096 entries (indices 0..4095)
	if (fineangle < vat.length) {
		let x = vat[fineangle]!;
		if (x < 0) x = 0;
		if (x > SCREENWIDTH) x = SCREENWIDTH;
		return x;
	}

	// Fine angles >= 4096 represent the back half-circle
	// Clamp to screen edges
	if (fineangle >= 4096 && fineangle < 6144) return 0;  // Left behind
	return SCREENWIDTH; // Right behind
}

function _setupSegState(seg: Seg, rwAngle1: number): void {
	const { setCurline, setFrontsector, setBacksector, setRwAngle1, setRwNormalangle } = require("./r_segs");
	setCurline(seg);
	setFrontsector(seg.frontsector);
	setBacksector(seg.backsector);
	setRwAngle1(rwAngle1);
	setRwNormalangle((seg.angle + ANG90) >>> 0);
}

// R_ClipSolidWallSegment: for solid walls (1-sided, closed doors).
// Renders visible portions and adds the range to solidsegs.
function R_ClipSolidWallSegment(first: number, last: number, seg: Seg, rwAngle1: number): void {
	const { R_StoreWallRange } = require("./r_segs");

	_setupSegState(seg, rwAngle1);

	// Find the first solid seg that ends at or after first-1
	let startIdx = 0;
	while (startIdx < solidsegs.length && solidsegs[startIdx]!.last < first - 1) {
		startIdx++;
	}

	if (first < solidsegs[startIdx]!.first) {
		if (last < solidsegs[startIdx]!.first - 1) {
			// Entirely visible, insert new solidsegs entry
			R_StoreWallRange(first, last);
			solidsegs.splice(startIdx, 0, { first, last });
			return;
		}
		// Visible up to the first solid seg
		R_StoreWallRange(first, solidsegs[startIdx]!.first - 1);
		// Extend solidsegs leftward
		solidsegs[startIdx]!.first = first;
	}

	// Bottom contained in existing solid seg?
	if (last <= solidsegs[startIdx]!.last) {
		return;
	}

	// Walk through solid segs, rendering gaps and crunching
	let nextIdx = startIdx;
	while (last >= (solidsegs[nextIdx + 1]?.first ?? 0x7fffffff) - 1) {
		R_StoreWallRange(solidsegs[nextIdx]!.last + 1, solidsegs[nextIdx + 1]!.first - 1);
		nextIdx++;
		if (last <= solidsegs[nextIdx]!.last) {
			// Crunch: merge start..next
			solidsegs[startIdx]!.last = solidsegs[nextIdx]!.last;
			if (nextIdx > startIdx) {
				solidsegs.splice(startIdx + 1, nextIdx - startIdx);
			}
			return;
		}
	}

	// Render remaining visible portion
	R_StoreWallRange(solidsegs[nextIdx]!.last + 1, last);

	// Merge: extend start to cover everything
	solidsegs[startIdx]!.last = last;
	if (nextIdx > startIdx) {
		solidsegs.splice(startIdx + 1, nextIdx - startIdx);
	}
}

// R_ClipPassWallSegment: for 2-sided lines (windows, steps).
// Renders visible portions but does NOT modify solidsegs.
function R_ClipPassWallSegment(first: number, last: number, seg: Seg, rwAngle1: number): void {
	const { R_StoreWallRange } = require("./r_segs");

	_setupSegState(seg, rwAngle1);

	// Find the first solid seg that ends at or after first-1
	let idx = 0;
	while (idx < solidsegs.length && solidsegs[idx]!.last < first - 1) {
		idx++;
	}

	if (first < solidsegs[idx]!.first) {
		if (last < solidsegs[idx]!.first - 1) {
			// Entirely visible
			R_StoreWallRange(first, last);
			return;
		}
		// Visible up to the first solid seg
		R_StoreWallRange(first, solidsegs[idx]!.first - 1);
	}

	if (last <= solidsegs[idx]!.last) {
		return; // Fully behind solid
	}

	while (last >= (solidsegs[idx + 1]?.first ?? 0x7fffffff) - 1) {
		R_StoreWallRange(solidsegs[idx]!.last + 1, solidsegs[idx + 1]!.first - 1);
		idx++;
		if (last <= solidsegs[idx]!.last) {
			return;
		}
	}

	// Render remaining visible portion
	R_StoreWallRange(solidsegs[idx]!.last + 1, last);
}

// Angle-to-screen-x conversion
export function R_PointToAngle(x: number, y: number): number {
	return pointToAngle2(doomstat.viewx, doomstat.viewy, x, y);
}

export function R_ScaleFromGlobalAngle(visangle: number): number {
	const anglea = ANG90 + (visangle - doomstat.viewangle);
	const angleb = ANG90 + (visangle - (curline?.angle ?? 0));

	const sinea = finesine[(anglea >>> 19) & FINEMASK]!;
	const sineb = finesine[(angleb >>> 19) & FINEMASK]!;

	const projection = SCREENWIDTH / 2 * FRACUNIT;
	const num = fixedDiv(projection, sineb);
	const den = sinea;

	if (den > (num >> 16)) {
		return fixedDiv(num, den);
	}
	return 64 * FRACUNIT;
}
