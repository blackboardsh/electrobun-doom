// p_switch.ts — Switch/button actions (stub)
import type { Line, MapObject } from "./doomdata";

export function P_InitSwitchList(): void {}
export function P_ChangeSwitchTexture(line: Line, useAgain: boolean): void {}
export function P_UseSpecialLine(thing: MapObject, line: Line, side: number): boolean { return false; }
