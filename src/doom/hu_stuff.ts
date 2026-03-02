// hu_stuff.ts — HUD messages (simplified)
import * as doomstat from "./doomstat";

export function HU_Init(): void {}
export function HU_Start(): void {}
export function HU_Ticker(): void {}
export function HU_Drawer(): void {
  // Draw HUD messages (simplified - no-op for now)
}
export function HU_Responder(ev: any): boolean { return false; }
