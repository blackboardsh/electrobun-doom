// p_sight.ts — Line of sight (simplified)
import type { MapObject } from "./doomdata";
import { P_AproxDistance } from "./p_maputl";

export function P_CheckSight(t1: MapObject, t2: MapObject): boolean {
  // Simplified: always return true (enemies always see player)
  // A proper implementation would trace a line through the BSP tree and check the reject table
  return true;
}
