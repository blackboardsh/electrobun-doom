// p_doors.ts — Door actions (stub)
import type { Line } from "./doomdata";

export function EV_DoDoor(line: Line, type: number): boolean {
  // Simplified door opening - would normally create a door thinker
  return false;
}

export function EV_VerticalDoor(line: Line, thing: any): void {
  // Vertical door activation
}
