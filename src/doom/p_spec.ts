// p_spec.ts — Special sectors, triggers, and line specials
import { FRACUNIT, FRACBITS } from "./doomdef";
import * as doomstat from "./doomstat";
import type { Line, Sector, MapObject } from "./doomdata";

// Animation types
export interface AnimDef {
  istexture: boolean;
  endname: string;
  startname: string;
  speed: number;
}

// Line special list
export let numlinespecials: number = 0;
export let linespeciallist: Line[] = [];

// Animated textures/flats
let animatedFlats: { basepic: number; numpics: number; speed: number }[] = [];
let animatedTextures: { basepic: number; numpics: number; speed: number }[] = [];

export function P_InitPicAnims(): void {
  // Initialize texture/flat animation sequences
  // These would normally read from ANIMATED lump or hardcoded list
  // Simplified for now
}

export function P_SpawnSpecials(): void {
  // Spawn sector specials based on sector type
  P_InitPicAnims();

  numlinespecials = 0;
  linespeciallist = [];

  for (let i = 0; i < doomstat.numsectors; i++) {
    const sector = doomstat.sectors[i]!;
    switch (sector.special) {
      case 1: // LIGHT FLICKER
        // P_SpawnLightFlash(sector);
        break;
      case 2: // STROBE FAST
        // P_SpawnStrobeFlash(sector, 15, 0);
        break;
      case 3: // STROBE SLOW
        // P_SpawnStrobeFlash(sector, 35, 0);
        break;
      case 8: // GLOWING
        // P_SpawnGlowingLight(sector);
        break;
      case 9: // SECRET
        doomstat.sectors[i]!.special = 9;
        const { totalsecret } = require("./p_setup");
        break;
      case 10: // DOOR CLOSE IN 30 SECONDS
        // P_SpawnDoorCloseIn30(sector);
        break;
      case 12: // SYNC STROBE SLOW
        // P_SpawnStrobeFlash(sector, 35, 1);
        break;
      case 13: // SYNC STROBE FAST
        // P_SpawnStrobeFlash(sector, 15, 1);
        break;
      case 14: // DOOR RAISE IN 5 MINUTES
        // P_SpawnDoorRaiseIn5Mins(sector);
        break;
      case 17: // FIRE FLICKER
        // P_SpawnFireFlicker(sector);
        break;
    }
  }

  // Find scrolling lines
  for (let i = 0; i < doomstat.numlines; i++) {
    if (doomstat.lines[i]!.special === 48) {
      numlinespecials++;
      linespeciallist.push(doomstat.lines[i]!);
    }
  }
}

export function P_UpdateSpecials(): void {
  // Update animated flats/textures
  // Update scrolling lines
  for (let i = 0; i < numlinespecials; i++) {
    const line = linespeciallist[i]!;
    doomstat.sides[line.sidenum[0]!]!.textureoffset += FRACUNIT;
  }
}

export function P_CrossSpecialLine(linenum: number, side: number, thing: MapObject): void {
  const line = doomstat.lines[linenum]!;
  if (!line) return;

  // Handle line crossing triggers
  switch (line.special) {
    case 11: // Exit level
      if (thing.player) {
        const { G_ExitLevel } = require("./g_game");
        G_ExitLevel();
      }
      break;
    case 51: // Secret exit
      if (thing.player) {
        const { G_SecretExitLevel } = require("./g_game");
        G_SecretExitLevel();
      }
      break;
    case 52: // Exit level
      if (thing.player) {
        const { G_ExitLevel } = require("./g_game");
        G_ExitLevel();
      }
      break;
    // Many more triggers would go here
  }
}

export function P_ShootSpecialLine(thing: MapObject, line: Line): void {
  // Handle gun-triggered specials
}

export function P_UseSpecialLine(thing: MapObject, line: Line, side: number): void {
  // Handle use-triggered specials (doors, switches)
  switch (line.special) {
    case 1: // Door open
    case 26: case 27: case 28: // Colored key doors
    case 31: case 32: case 33: case 34: // More doors
      // EV_DoDoor -- simplified
      if (line.backsector) {
        // Toggle door
        const { EV_DoDoor } = require("./p_doors");
        EV_DoDoor(line, 0);
      }
      break;
    // Many more switch types would go here
  }
}

// Sector height queries
export function P_FindLowestFloorSurrounding(sec: Sector): number {
  let floor = sec.floorheight;
  for (const line of sec.lines) {
    const other = getOtherSector(line, sec);
    if (other && other.floorheight < floor) floor = other.floorheight;
  }
  return floor;
}

export function P_FindHighestFloorSurrounding(sec: Sector): number {
  let floor = -0x7fffffff;
  for (const line of sec.lines) {
    const other = getOtherSector(line, sec);
    if (other && other.floorheight > floor) floor = other.floorheight;
  }
  return floor === -0x7fffffff ? sec.floorheight : floor;
}

export function P_FindLowestCeilingSurrounding(sec: Sector): number {
  let ceil = 0x7fffffff;
  for (const line of sec.lines) {
    const other = getOtherSector(line, sec);
    if (other && other.ceilingheight < ceil) ceil = other.ceilingheight;
  }
  return ceil;
}

export function P_FindHighestCeilingSurrounding(sec: Sector): number {
  let ceil = 0;
  for (const line of sec.lines) {
    const other = getOtherSector(line, sec);
    if (other && other.ceilingheight > ceil) ceil = other.ceilingheight;
  }
  return ceil;
}

export function P_FindNextHighestFloor(sec: Sector, currentheight: number): number {
  let height = 0x7fffffff;
  for (const line of sec.lines) {
    const other = getOtherSector(line, sec);
    if (other && other.floorheight > currentheight && other.floorheight < height) {
      height = other.floorheight;
    }
  }
  return height === 0x7fffffff ? currentheight : height;
}

function getOtherSector(line: Line, sec: Sector): Sector | null {
  if (line.frontsector === sec) return line.backsector;
  return line.frontsector;
}

export function P_FindSectorFromLineTag(line: Line, start: number): number {
  for (let i = start + 1; i < doomstat.numsectors; i++) {
    if (doomstat.sectors[i]!.tag === line.tag) return i;
  }
  return -1;
}

export function P_FindMinSurroundingLight(sector: Sector, max: number): number {
  let min = max;
  for (const line of sector.lines) {
    const other = getOtherSector(line, sector);
    if (other && other.lightlevel < min) min = other.lightlevel;
  }
  return min;
}
