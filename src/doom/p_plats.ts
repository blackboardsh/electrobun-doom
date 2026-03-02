// p_plats.ts — Platform actions (stub)
import type { Line } from "./doomdata";

export function EV_DoPlat(line: Line, type: number, amount: number): boolean { return false; }
export function EV_StopPlat(line: Line): void {}
export function T_PlatRaise(plat: any): void {}
export function P_ActivateInStasis(tag: number): void {}
