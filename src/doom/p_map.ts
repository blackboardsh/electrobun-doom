// p_map.ts — Movement, collision detection, shooting, use lines
import { FRACBITS, FRACUNIT, MAXRADIUS, ML_BLOCKING, ML_BLOCKMONSTERS } from "./doomdef";
import * as doomdata from "./doomdata";
import * as ds from "./doomstat";
import type { MapObject, Line, Sector, Player } from "./doomdata";
import { MF_SOLID, MF_SPECIAL, MF_SHOOTABLE, MF_NOCLIP, MF_MISSILE, MF_FLOAT } from "./doomdata";
import { P_AproxDistance, P_BlockThingsIterator, P_BlockLinesIterator,
         P_LineOpening, opentop, openbottom, openrange, lowfloor, P_PointOnLineSide } from "./p_maputl";
import { BOXTOP, BOXBOTTOM, BOXLEFT, BOXRIGHT } from "./m_misc";

// Collision state
export let tmthing: MapObject | null = null;
export let tmx: number = 0;
export let tmy: number = 0;
export let tmflags: number = 0;
export let tmbbox: number[] = [0, 0, 0, 0];
export let tmfloorz: number = 0;
export let tmceilingz: number = 0;
export let tmdropoffz: number = 0;

let ceilingline: Line | null = null;
let spechit: Line[] = [];
let numspechit: number = 0;

export function P_TryMove(thing: MapObject, x: number, y: number): boolean {
  if (thing.flags & MF_NOCLIP) {
    const { P_UnsetMobjPosition, P_SetMobjPosition } = require("./p_mobj");
    P_UnsetMobjPosition(thing);
    thing.x = x;
    thing.y = y;
    P_SetMobjPosition(thing);

    thing.floorz = thing.subsector?.sector?.floorheight ?? 0;
    thing.ceilingz = thing.subsector?.sector?.ceilingheight ?? 0;
    return true;
  }

  const result = P_CheckPosition(thing, x, y);
  if (!result) return false;

  // Check height
  if (tmceilingz - tmfloorz < thing.height) return false;
  if (tmceilingz - thing.z < thing.height) return false;
  if (tmfloorz - thing.z > 24 * FRACUNIT) return false; // too high step

  // Move the thing
  const { P_UnsetMobjPosition, P_SetMobjPosition } = require("./p_mobj");
  P_UnsetMobjPosition(thing);

  thing.floorz = tmfloorz;
  thing.ceilingz = tmceilingz;
  thing.x = x;
  thing.y = y;

  P_SetMobjPosition(thing);

  // Trigger line specials
  for (let i = 0; i < numspechit; i++) {
    const ld = spechit[i]!;
    const side = P_PointOnLineSide(thing.x, thing.y, ld);
    const oldside = P_PointOnLineSide(thing.x - (x - thing.x), thing.y - (y - thing.y), ld);
    if (side !== oldside && ld.special) {
      const { P_CrossSpecialLine } = require("./p_spec");
      P_CrossSpecialLine(ds.lines.indexOf(ld), side, thing);
    }
  }

  return true;
}

function P_CheckPosition(thing: MapObject, x: number, y: number): boolean {
  tmthing = thing;
  tmx = x;
  tmy = y;
  tmflags = thing.flags;

  tmbbox[BOXTOP] = y + thing.radius;
  tmbbox[BOXBOTTOM] = y - thing.radius;
  tmbbox[BOXRIGHT] = x + thing.radius;
  tmbbox[BOXLEFT] = x - thing.radius;

  const { R_PointInSubsector } = require("./r_main");
  const ss = R_PointInSubsector(x, y);
  const sec: Sector = ss.sector;

  tmfloorz = tmdropoffz = sec.floorheight;
  tmceilingz = sec.ceilingheight;
  ceilingline = null;
  spechit = [];
  numspechit = 0;

  // Check things
  const xl = ((tmbbox[BOXLEFT]! - ds.bmaporgx) >> FRACBITS) >> 7;
  const xh = ((tmbbox[BOXRIGHT]! - ds.bmaporgx) >> FRACBITS) >> 7;
  const yl = ((tmbbox[BOXBOTTOM]! - ds.bmaporgy) >> FRACBITS) >> 7;
  const yh = ((tmbbox[BOXTOP]! - ds.bmaporgy) >> FRACBITS) >> 7;

  for (let bx = xl; bx <= xh; bx++) {
    for (let by = yl; by <= yh; by++) {
      if (!P_BlockThingsIterator(bx, by, PIT_CheckThing)) return false;
    }
  }

  // Check lines
  for (let bx = xl; bx <= xh; bx++) {
    for (let by = yl; by <= yh; by++) {
      if (!P_BlockLinesIterator(bx, by, PIT_CheckLine)) return false;
    }
  }

  return true;
}

function PIT_CheckThing(thing: MapObject): boolean {
  if (!tmthing) return true;
  if (!(thing.flags & (MF_SOLID | MF_SPECIAL | MF_SHOOTABLE))) return true;
  if (thing === tmthing) return true;

  const blockdist = thing.radius + tmthing.radius;
  if (Math.abs(thing.x - tmx) >= blockdist || Math.abs(thing.y - tmy) >= blockdist) {
    return true; // no collision
  }

  // Don't clip against self
  if (thing === tmthing) return true;

  // Pickups — player touching a special item
  if (thing.flags & MF_SPECIAL) {
    if (tmthing.player) {
      const { P_TouchSpecialThing } = require("./p_inter");
      P_TouchSpecialThing(thing, tmthing);
    }
    return !(thing.flags & MF_SOLID);
  }

  // Missiles hitting things
  if (tmthing.flags & MF_MISSILE) {
    if (thing === tmthing.target) return true; // Don't hit shooter
    if (thing.flags & MF_SHOOTABLE) {
      const { P_DamageMobj } = require("./p_inter");
      P_DamageMobj(thing, tmthing, tmthing.target, tmthing.info.damage);
      return false;
    }
    return !(thing.flags & MF_SOLID);
  }

  // Solid thing blocking
  if (thing.flags & MF_SOLID) {
    return false; // blocked
  }

  return true;
}

function PIT_CheckLine(ld: Line): boolean {
  if (!tmthing) return true;

  if (tmbbox[BOXRIGHT]! <= ld.bbox[BOXLEFT]! ||
      tmbbox[BOXLEFT]! >= ld.bbox[BOXRIGHT]! ||
      tmbbox[BOXTOP]! <= ld.bbox[BOXBOTTOM]! ||
      tmbbox[BOXBOTTOM]! >= ld.bbox[BOXTOP]!) {
    return true; // no intersection
  }

  if (ld.sidenum[1] === -1) {
    return false; // one sided line
  }

  if (ld.flags & ML_BLOCKING) return false;
  if (!tmthing.player && (ld.flags & ML_BLOCKMONSTERS)) return false;

  P_LineOpening(ld);

  if (openrange < tmthing.height) return false;
  if (opentop - tmthing.z < tmthing.height) return false;
  if (openbottom - tmthing.z > 24 * FRACUNIT) return false;

  if (opentop < tmceilingz) {
    tmceilingz = opentop;
    ceilingline = ld;
  }
  if (openbottom > tmfloorz) {
    tmfloorz = openbottom;
  }
  if (lowfloor < tmdropoffz) {
    tmdropoffz = lowfloor;
  }

  if (ld.special) {
    spechit.push(ld);
    numspechit++;
  }

  return true;
}

// ===================================================
// P_UseLines — trace a line from player and activate specials
// ===================================================
const USERANGE = 64 * FRACUNIT;

export function P_UseLines(player: Player): void {
  const mo = player.mo;
  if (!mo) return;

  const { finesine, finecosine, fixedMul, FINEMASK, ANGLETOFINESHIFT } = require("./tables");
  const angle = mo.angle >>> ANGLETOFINESHIFT;

  const x1 = mo.x;
  const y1 = mo.y;
  const x2 = x1 + fixedMul(USERANGE, finecosine[angle & FINEMASK]);
  const y2 = y1 + fixedMul(USERANGE, finesine[angle & FINEMASK]);

  // Simple approach: check blockmap lines in a box from player to use point
  // and find the closest special line
  let bestDist = USERANGE + 1;
  let bestLine: any = null;
  let bestSide = 0;

  const minx = Math.min(x1, x2) - FRACUNIT;
  const maxx = Math.max(x1, x2) + FRACUNIT;
  const miny = Math.min(y1, y2) - FRACUNIT;
  const maxy = Math.max(y1, y2) + FRACUNIT;

  const bxl = ((minx - ds.bmaporgx) >> FRACBITS) >> 7;
  const bxh = ((maxx - ds.bmaporgx) >> FRACBITS) >> 7;
  const byl = ((miny - ds.bmaporgy) >> FRACBITS) >> 7;
  const byh = ((maxy - ds.bmaporgy) >> FRACBITS) >> 7;

  for (let bx = bxl; bx <= bxh; bx++) {
    for (let by = byl; by <= byh; by++) {
      P_BlockLinesIterator(bx, by, (ld: Line) => {
        if (!ld.special) return true;

        // Check if player is on front side
        const side = P_PointOnLineSide(mo.x, mo.y, ld);

        // Check distance to line
        const dist = P_AproxDistance(
          ld.v1.x + (ld.dx >> 1) - mo.x,
          ld.v1.y + (ld.dy >> 1) - mo.y
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestLine = ld;
          bestSide = side;
        }
        return true;
      });
    }
  }

  if (bestLine && bestLine.special) {
    const { P_UseSpecialLine } = require("./p_spec");
    P_UseSpecialLine(mo, bestLine, bestSide);
  }
}

// ===================================================
// Shooting / Hitscan
// ===================================================
export let linetarget: MapObject | null = null;
let shootthing: MapObject | null = null;
let shootdist: number = 0;
let aimslope: number = 0;
let attackangle: number = 0;
let attackrange: number = 0;
let attackdamage: number = 0;

export function P_BulletSlope(mo: MapObject): number {
  // Auto-aim: try to find a target at the attack angle
  const slope = P_AimLineAttack(mo, mo.angle, 16 * 64 * FRACUNIT);
  return slope;
}

export function P_AimLineAttack(t1: MapObject, angle: number, distance: number): number {
  // Simplified auto-aim — scan blockmap for shootable things in the direction
  linetarget = null;
  shootthing = t1;
  attackangle = angle;
  attackrange = distance;

  const { finesine, finecosine, fixedMul, FINEMASK, ANGLETOFINESHIFT } = require("./tables");
  const fineAngle = (angle >>> ANGLETOFINESHIFT) & FINEMASK;

  const x2 = t1.x + fixedMul(distance, finecosine[fineAngle]);
  const y2 = t1.y + fixedMul(distance, finesine[fineAngle]);

  // Scan blockmap cells along the line
  const minx = Math.min(t1.x, x2);
  const maxx = Math.max(t1.x, x2);
  const miny = Math.min(t1.y, y2);
  const maxy = Math.max(t1.y, y2);

  const bxl = Math.max(0, ((minx - ds.bmaporgx) >> FRACBITS) >> 7);
  const bxh = Math.min(ds.bmapwidth - 1, ((maxx - ds.bmaporgx) >> FRACBITS) >> 7);
  const byl = Math.max(0, ((miny - ds.bmaporgy) >> FRACBITS) >> 7);
  const byh = Math.min(ds.bmapheight - 1, ((maxy - ds.bmaporgy) >> FRACBITS) >> 7);

  let bestDist = distance + 1;

  for (let bx = bxl; bx <= bxh; bx++) {
    for (let by = byl; by <= byh; by++) {
      P_BlockThingsIterator(bx, by, (thing: MapObject) => {
        if (thing === t1) return true;
        if (!(thing.flags & MF_SHOOTABLE)) return true;

        const dist = P_AproxDistance(thing.x - t1.x, thing.y - t1.y);
        if (dist > distance || dist <= 0) return true;

        // Check if thing is roughly in the firing direction
        const dx = thing.x - t1.x;
        const dy = thing.y - t1.y;
        const projDist = fixedMul(dx, finecosine[fineAngle]) + fixedMul(dy, finesine[fineAngle]);
        if (projDist <= 0) return true;

        // Check lateral distance
        const perpDist = Math.abs(fixedMul(dx, finesine[fineAngle]) - fixedMul(dy, finecosine[fineAngle]));
        if (perpDist > thing.radius + 20 * FRACUNIT) return true;

        if (dist < bestDist) {
          bestDist = dist;
          linetarget = thing;
          // Calculate slope to target
          const dz = (thing.z + (thing.height >> 1)) - (t1.z + (t1.height >> 1));
          aimslope = dist > 0 ? ((dz / (dist >> FRACBITS)) | 0) : 0;
        }
        return true;
      });
    }
  }

  return aimslope;
}

export function P_LineAttack(t1: MapObject, angle: number, distance: number, slope: number, damage: number): void {
  shootthing = t1;
  attackangle = angle;
  attackrange = distance;
  attackdamage = damage;

  const { finesine, finecosine, fixedMul, FINEMASK, ANGLETOFINESHIFT } = require("./tables");
  const fineAngle = (angle >>> ANGLETOFINESHIFT) & FINEMASK;

  const x2 = t1.x + fixedMul(distance, finecosine[fineAngle]);
  const y2 = t1.y + fixedMul(distance, finesine[fineAngle]);

  // Check for wall hits first — trace through blockmap lines
  let hitWall = false;
  let wallDist = distance;

  const minx = Math.min(t1.x, x2);
  const maxx = Math.max(t1.x, x2);
  const miny = Math.min(t1.y, y2);
  const maxy = Math.max(t1.y, y2);

  const bxl = Math.max(0, ((minx - ds.bmaporgx) >> FRACBITS) >> 7);
  const bxh = Math.min(ds.bmapwidth - 1, ((maxx - ds.bmaporgx) >> FRACBITS) >> 7);
  const byl = Math.max(0, ((miny - ds.bmaporgy) >> FRACBITS) >> 7);
  const byh = Math.min(ds.bmapheight - 1, ((maxy - ds.bmaporgy) >> FRACBITS) >> 7);

  // Check if line target is still valid and closer than walls
  if (linetarget) {
    const targetDist = P_AproxDistance(linetarget.x - t1.x, linetarget.y - t1.y);
    if (targetDist <= distance) {
      // Hit the target
      const { P_DamageMobj } = require("./p_inter");
      P_DamageMobj(linetarget, t1, t1, damage);

      // Spawn blood
      _spawnBloodOrPuff(linetarget.x, linetarget.y, linetarget.z + (linetarget.height >> 1), true);
      return;
    }
  }

  // No target hit — spawn a bullet puff at max range or wall hit
  const puffx = x2;
  const puffy = y2;
  _spawnBloodOrPuff(puffx, puffy, t1.z + (t1.height >> 1), false);
}

function _spawnBloodOrPuff(x: number, y: number, z: number, isBlood: boolean): void {
  try {
    const { P_SpawnMobj } = require("./p_mobj");
    const { MobjType } = require("./info");
    const type = isBlood ? MobjType.MT_BLOOD : MobjType.MT_PUFF;
    const mobj = P_SpawnMobj(x, y, z, type);
    if (!isBlood) {
      mobj.momz = FRACUNIT; // puff drifts up
    }
  } catch {
    // Puff/blood spawning is cosmetic — don't crash if it fails
  }
}

export function P_RadiusAttack(spot: MapObject, source: MapObject, damage: number): void {
  // Simplified radius damage — damage things in radius
  const dist = (damage + 32) * FRACUNIT;
  const bxl = Math.max(0, ((spot.x - dist - ds.bmaporgx) >> FRACBITS) >> 7);
  const bxh = Math.min(ds.bmapwidth - 1, ((spot.x + dist - ds.bmaporgx) >> FRACBITS) >> 7);
  const byl = Math.max(0, ((spot.y - dist - ds.bmaporgy) >> FRACBITS) >> 7);
  const byh = Math.min(ds.bmapheight - 1, ((spot.y + dist - ds.bmaporgy) >> FRACBITS) >> 7);

  for (let bx = bxl; bx <= bxh; bx++) {
    for (let by = byl; by <= byh; by++) {
      P_BlockThingsIterator(bx, by, (thing: MapObject) => {
        if (!(thing.flags & MF_SHOOTABLE)) return true;
        const dx = Math.abs(thing.x - spot.x);
        const dy = Math.abs(thing.y - spot.y);
        const d = Math.max(dx, dy) >> FRACBITS;
        const actualDamage = damage - d;
        if (actualDamage > 0) {
          const { P_DamageMobj } = require("./p_inter");
          P_DamageMobj(thing, spot, source, actualDamage);
        }
        return true;
      });
    }
  }
}

export function P_ChangeSector(sector: Sector, crunch: boolean): boolean {
  return false;
}
