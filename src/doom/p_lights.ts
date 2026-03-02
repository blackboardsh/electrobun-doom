// p_lights.ts — Light effects (stub)
import type { Sector } from "./doomdata";

export function P_SpawnLightFlash(sector: Sector): void {}
export function P_SpawnStrobeFlash(sector: Sector, fastOrSlow: number, inSync: number): void {}
export function P_SpawnGlowingLight(sector: Sector): void {}
export function P_SpawnFireFlicker(sector: Sector): void {}
export function EV_StartLightStrobing(line: any): void {}
export function EV_TurnTagLightsOff(line: any): void {}
export function EV_LightTurnOn(line: any, bright: number): void {}
export function T_LightFlash(flash: any): void {}
export function T_StrobeFlash(flash: any): void {}
export function T_Glow(glow: any): void {}
export function T_FireFlicker(flicker: any): void {}
