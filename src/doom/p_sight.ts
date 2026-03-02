// p_sight.ts — Line of sight (simplified)
import type { MapObject } from "./doomdata";
import { FRACBITS, FRACUNIT, ML_BLOCKING } from "./doomdef";
import { P_AproxDistance, P_BlockLinesIterator, P_PointOnLineSide } from "./p_maputl";
import * as doomstat from "./doomstat";
import type { Line } from "./doomdata";

export function P_CheckSight(t1: MapObject, t2: MapObject): boolean {
  // Simplified: distance-gated LOS to prevent "across the map" attacks
  const dist = P_AproxDistance(t1.x - t2.x, t1.y - t2.y);
  if (dist > 1024 * FRACUNIT) return false;

  // Crude line-of-sight: if a blocking line segment intersects the ray, fail.
  const x1 = t1.x;
  const y1 = t1.y;
  const x2 = t2.x;
  const y2 = t2.y;

  const minx = Math.min(x1, x2);
  const maxx = Math.max(x1, x2);
  const miny = Math.min(y1, y2);
  const maxy = Math.max(y1, y2);

  const bxl = Math.max(0, ((minx - doomstat.bmaporgx) >> FRACBITS) >> 7);
  const bxh = Math.min(doomstat.bmapwidth - 1, ((maxx - doomstat.bmaporgx) >> FRACBITS) >> 7);
  const byl = Math.max(0, ((miny - doomstat.bmaporgy) >> FRACBITS) >> 7);
  const byh = Math.min(doomstat.bmapheight - 1, ((maxy - doomstat.bmaporgy) >> FRACBITS) >> 7);

  let blocked = false;

  const crossesBlockingLine = (ld: Line): boolean => {
    // Only consider blocking or one-sided lines for LOS
    if (ld.sidenum[1] !== -1) return false;

    // Quick bbox reject
    if (maxx <= ld.bbox[2] || minx >= ld.bbox[3] || maxy <= ld.bbox[1] || miny >= ld.bbox[0]) {
      return false;
    }

    // If endpoints are on different sides, the ray crosses the line
    const s1 = P_PointOnLineSide(x1, y1, ld);
    const s2 = P_PointOnLineSide(x2, y2, ld);
    return s1 !== s2;
  };

  for (let bx = bxl; bx <= bxh && !blocked; bx++) {
    for (let by = byl; by <= byh && !blocked; by++) {
      P_BlockLinesIterator(bx, by, (ld) => {
        if (crossesBlockingLine(ld)) {
          blocked = true;
          return false;
        }
        return true;
      });
    }
  }

  return !blocked;
}
