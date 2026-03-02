// p_doors.ts — Door actions (stub)
import type { Line, Sector } from "./doomdata";
import * as doomstat from "./doomstat";
import { P_FindLowestCeilingSurrounding } from "./p_spec";

export function EV_DoDoor(line: Line, type: number): boolean {
  // Simplified door opening: instantly raise door sector ceiling
  let doorsec: Sector | null = null;

  if (line.backsector) {
    doorsec = line.backsector;
  } else if (line.frontsector) {
    doorsec = line.frontsector;
  }

  if (!doorsec) return false;

  const dest = P_FindLowestCeilingSurrounding(doorsec);
  if (dest <= doorsec.ceilingheight) {
    // Already open or no valid destination
    return false;
  }

  doorsec.ceilingheight = dest;
  doorsec.interpceilingheight = dest;
  return true;
}

export function EV_VerticalDoor(line: Line, thing: any): void {
  // Vertical door activation
  EV_DoDoor(line, 0);
}
