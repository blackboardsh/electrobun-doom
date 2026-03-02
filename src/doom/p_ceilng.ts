// p_ceilng.ts — Ceiling movement (stub)
import type { Line } from "./doomdata";

export function EV_DoCeiling(line: Line, type: number): boolean { return false; }
export function T_MoveCeiling(ceiling: any): void {}
export function EV_CeilingCrushStop(line: Line): boolean { return false; }
export function P_ActivateInStasisCeiling(line: Line): void {}
