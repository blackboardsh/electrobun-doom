// tables.ts — Fixed-point math utilities and trig lookup tables

import { FRACBITS, FRACUNIT } from "./doomdef";

// Angle definitions
export const FINEANGLES = 8192;
export const FINEMASK = FINEANGLES - 1;
export const ANGLETOFINESHIFT = 19; // 0x100000000 >> 13 = 19 bits shift
export const ANG45 = 0x20000000;
export const ANG90 = 0x40000000;
export const ANG180 = 0x80000000;
export const ANG270 = 0xc0000000;
export const ANG1 = (ANG45 / 45) >>> 0;
export const SLOPERANGE = 2048;
export const SLOPEBITS = 11;
export const DBITS = FRACBITS - SLOPEBITS;

// Fixed-point math helpers
export function fixedMul(a: number, b: number): number {
	// Multiply two 16.16 fixed-point numbers
	// Use Math.floor to match C's arithmetic right shift (>> 16) which rounds
	// toward negative infinity, NOT toward zero like Math.trunc.
	return Math.floor((a * b) / 65536);
}

export function fixedDiv(a: number, b: number): number {
	if ((Math.abs(a) >> 14) >= Math.abs(b)) {
		return (a ^ b) < 0 ? -0x7fffffff : 0x7fffffff;
	}
	return fixedDivExact(a, b);
}

export function fixedDivExact(a: number, b: number): number {
	const result = (a / b) * FRACUNIT;
	return result | 0;
}

// Build sine table (8192 entries + 1 for cosine overshoot)
function buildFineSine(): Int32Array {
	const table = new Int32Array(FINEANGLES + (FINEANGLES / 4));
	for (let i = 0; i < FINEANGLES + FINEANGLES / 4; i++) {
		const angle = (i * 2 * Math.PI) / FINEANGLES;
		table[i] = Math.round(Math.sin(angle) * FRACUNIT);
	}
	return table;
}

// Build tangent table (2048 entries for slope range)
function buildFineTangent(): Int32Array {
	const table = new Int32Array(FINEANGLES / 2);
	for (let i = 0; i < FINEANGLES / 2; i++) {
		const angle = ((i - FINEANGLES / 4 + 0.5) * Math.PI * 2) / FINEANGLES;
		const tan = Math.tan(angle);
		const clamped = Math.max(-0x7fffffff / FRACUNIT, Math.min(0x7fffffff / FRACUNIT, tan));
		table[i] = Math.round(clamped * FRACUNIT);
	}
	return table;
}

// Build angle-to-slope table
function buildTanToAngle(): Uint32Array {
	const table = new Uint32Array(SLOPERANGE + 1);
	for (let i = 0; i <= SLOPERANGE; i++) {
		const f = Math.atan(i / SLOPERANGE) / (Math.PI * 2);
		table[i] = (f * 0x100000000) >>> 0;
	}
	return table;
}

export const finesine = buildFineSine();
export const finecosine = new Int32Array(finesine.buffer, (FINEANGLES / 4) * 4); // offset by FINEANGLES/4 entries (cos = sin + 90°)

// In original Doom, finetangent[4096] is followed by finesine[10240] in memory.
// Code indexes finetangent with values 0-8191, where indices 4096+ fall through
// into finesine. We replicate this with a combined array.
function buildFineTangentWithOverflow(): Int32Array {
	const tangent = buildFineTangent(); // 4096 entries
	// Combined: finetangent[0..4095] + finesine[0..4095] = 8192 entries
	const combined = new Int32Array(FINEANGLES);
	combined.set(tangent, 0);
	// Indices 4096+ map to finesine[index - 4096]
	for (let i = 0; i < FINEANGLES / 2; i++) {
		combined[FINEANGLES / 2 + i] = finesine[i]!;
	}
	return combined;
}
export const finetangent = buildFineTangentWithOverflow();
export const tantoangle = buildTanToAngle();

// Point-to-angle lookup
export function pointToAngle2(x1: number, y1: number, x2: number, y2: number): number {
	return pointToAngle(x2 - x1, y2 - y1);
}

export function pointToAngle(x: number, y: number): number {
	if (x === 0 && y === 0) return 0;

	if (x >= 0) {
		if (y >= 0) {
			if (x > y) {
				return tantoangle[slopeDiv(y, x)]!;
			} else {
				return ANG90 - 1 - tantoangle[slopeDiv(x, y)]!;
			}
		} else {
			const ny = -y;
			if (x > ny) {
				return ((-tantoangle[slopeDiv(ny, x)]!) & 0xFFFFFFFF) >>> 0;
			} else {
				return ANG270 + tantoangle[slopeDiv(x, ny)]!;
			}
		}
	} else {
		const nx = -x;
		if (y >= 0) {
			if (nx > y) {
				return ANG180 - 1 - tantoangle[slopeDiv(y, nx)]!;
			} else {
				return ANG90 + tantoangle[slopeDiv(nx, y)]!;
			}
		} else {
			const ny = -y;
			if (nx > ny) {
				return ANG180 + tantoangle[slopeDiv(ny, nx)]!;
			} else {
				return ANG270 - 1 - tantoangle[slopeDiv(nx, ny)]!;
			}
		}
	}
}

export function slopeDiv(num: number, den: number): number {
	if (den < 512) return SLOPERANGE;
	const ans = Math.min((num << 3) / (den >>> 8), SLOPERANGE);
	return ans | 0;
}

// Angle to index conversions
export function angleToFineIndex(angle: number): number {
	return (angle >>> ANGLETOFINESHIFT) & FINEMASK;
}
