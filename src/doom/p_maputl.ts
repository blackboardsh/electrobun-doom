// p_maputl.ts — Map utility functions (line intersection, blockmap traversal)
import { FRACBITS, FRACUNIT } from "./doomdef";
import * as doomstat from "./doomstat";
import type { Line, MapObject, Sector } from "./doomdata";
import { SlopeType } from "./doomdata";
import { fixedMul, fixedDiv } from "./tables";

export interface DivLine {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Intercept {
  frac: number;  // fixed_t, 0.0-1.0 along the trace
  isaline: boolean;
  line: Line | null;
  thing: MapObject | null;
}

// Fixed-point line side test
export function P_PointOnLineSide(x: number, y: number, line: Line): number {
  if (!line.dx) {
    return x <= line.v1.x ? (line.dy > 0 ? 1 : 0) : (line.dy < 0 ? 1 : 0);
  }
  if (!line.dy) {
    return y <= line.v1.y ? (line.dx < 0 ? 1 : 0) : (line.dx > 0 ? 1 : 0);
  }

  const dx = x - line.v1.x;
  const dy = y - line.v1.y;
  const left = (line.dy >> FRACBITS) * (dx >> FRACBITS);
  const right = (dy >> FRACBITS) * (line.dx >> FRACBITS);

  return right >= left ? 0 : 1;
}

export function P_PointOnDivlineSide(x: number, y: number, line: DivLine): number {
  if (!line.dx) {
    return x <= line.x ? (line.dy > 0 ? 1 : 0) : (line.dy < 0 ? 1 : 0);
  }
  if (!line.dy) {
    return y <= line.y ? (line.dx < 0 ? 1 : 0) : (line.dx > 0 ? 1 : 0);
  }

  const dx = x - line.x;
  const dy = y - line.y;
  const left = (line.dy >> FRACBITS) * (dx >> FRACBITS);
  const right = (dy >> FRACBITS) * (line.dx >> FRACBITS);

  return right >= left ? 0 : 1;
}

export function P_BoxOnLineSide(tmbox: number[], ld: Line): number {
  let p1: number, p2: number;

  switch (ld.slopetype) {
    case SlopeType.Horizontal:
      p1 = tmbox[0]! > ld.v1.y ? 1 : 0; // BOXTOP
      p2 = tmbox[1]! > ld.v1.y ? 1 : 0; // BOXBOTTOM
      if (ld.dx < 0) { p1 ^= 1; p2 ^= 1; }
      break;
    case SlopeType.Vertical:
      p1 = tmbox[3]! < ld.v1.x ? 1 : 0; // BOXRIGHT
      p2 = tmbox[2]! < ld.v1.x ? 1 : 0; // BOXLEFT
      if (ld.dy < 0) { p1 ^= 1; p2 ^= 1; }
      break;
    case SlopeType.Positive:
      p1 = P_PointOnLineSide(tmbox[2]!, tmbox[0]!, ld); // BOXLEFT, BOXTOP
      p2 = P_PointOnLineSide(tmbox[3]!, tmbox[1]!, ld); // BOXRIGHT, BOXBOTTOM
      break;
    case SlopeType.Negative:
    default:
      p1 = P_PointOnLineSide(tmbox[3]!, tmbox[0]!, ld); // BOXRIGHT, BOXTOP
      p2 = P_PointOnLineSide(tmbox[2]!, tmbox[1]!, ld); // BOXLEFT, BOXBOTTOM
      break;
  }

  if (p1 === p2) return p1;
  return -1; // box crosses line
}

// Unlink a thing from blockmap
export function P_UnsetThingPosition(thing: MapObject): void {
  const { P_UnsetMobjPosition } = require("./p_mobj");
  P_UnsetMobjPosition(thing);
}

// Link a thing into blockmap
export function P_SetThingPosition(thing: MapObject): void {
  const { P_SetMobjPosition } = require("./p_mobj");
  P_SetMobjPosition(thing);
}

// Get the opening (gaps) at a linedef
export let opentop: number = 0;
export let openbottom: number = 0;
export let openrange: number = 0;
export let lowfloor: number = 0;

export function P_LineOpening(linedef: Line): void {
  if (linedef.sidenum[1] === -1) {
    // Single sided line
    openrange = 0;
    return;
  }

  const front = linedef.frontsector!;
  const back = linedef.backsector!;

  opentop = Math.min(front.ceilingheight, back.ceilingheight);

  if (front.floorheight > back.floorheight) {
    openbottom = front.floorheight;
    lowfloor = back.floorheight;
  } else {
    openbottom = back.floorheight;
    lowfloor = front.floorheight;
  }

  openrange = opentop - openbottom;
}

// Intercept-related
export function P_InterceptVector(v2: DivLine, v1: DivLine): number {
  const den = fixedMul(v1.dy >> 8, v2.dx) - fixedMul(v1.dx >> 8, v2.dy);
  if (den === 0) return 0;

  const num = fixedMul((v1.x - v2.x) >> 8, v1.dy) + fixedMul((v2.y - v1.y) >> 8, v1.dx);
  return fixedDiv(num, den);
}

// Block map iterator
export function P_BlockThingsIterator(x: number, y: number, func: (thing: MapObject) => boolean): boolean {
  if (x < 0 || y < 0 || x >= doomstat.bmapwidth || y >= doomstat.bmapheight) return true;

  let mobj = doomstat.blocklinks[y * doomstat.bmapwidth + x];
  while (mobj) {
    if (!func(mobj)) return false;
    mobj = mobj.bnext;
  }
  return true;
}

export function P_BlockLinesIterator(x: number, y: number, func: (line: Line) => boolean): boolean {
  if (x < 0 || y < 0 || x >= doomstat.bmapwidth || y >= doomstat.bmapheight) return true;

  let offset = doomstat.blockmaplump[4 + y * doomstat.bmapwidth + x]!;
  // Offsets are stored as unsigned 16-bit indices; normalize negatives.
  if (offset < 0) offset = (offset & 0xffff);
  if (offset === undefined) return true;

  let index = offset;
  while (true) {
    let linenum = doomstat.blockmaplump[index]!;
    if (linenum === undefined) break;
    if (linenum < 0) linenum = (linenum & 0xffff);
    if (linenum === 0xffff) break;
    if (linenum === 0 && index !== offset) { index++; continue; }

    const line = doomstat.lines[linenum];
    if (!line) { index++; continue; }

    if (!func(line)) return false;
    index++;
  }
  return true;
}

// Distance approximation
export function P_AproxDistance(dx: number, dy: number): number {
  dx = Math.abs(dx);
  dy = Math.abs(dy);
  if (dx < dy) return dx + dy - (dx >> 1);
  return dx + dy - (dy >> 1);
}
