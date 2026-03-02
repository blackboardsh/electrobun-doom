import { SCREENWIDTH, FRACBITS } from "./doomdef";
import { ANG90, ANGLETOFINESHIFT } from "./tables";
import * as doomstat from "./doomstat";

export let skyflatnum: number = -1;
export let skytexture: number = 0;
export let skytexturemid: number = 0;

export function setSkyflatnum(n: number) { skyflatnum = n; }
export function setSkyTexture(n: number) { skytexture = n; }

export function R_InitSkyMap(): void {
	skytexturemid = 100 * (1 << FRACBITS);
}
