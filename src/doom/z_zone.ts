// z_zone.ts — Simplified zone memory allocator for TypeScript
// In the original Doom, zone memory is a custom allocator. In TS, we rely on GC.
// This module provides the zone tag constants and a simple allocation tracking interface.

// Zone tags
export const PU_STATIC = 1;     // static entire execution time
export const PU_SOUND = 2;      // static while playing
export const PU_MUSIC = 3;      // static while playing
export const PU_LEVEL = 50;     // freed when level is completed
export const PU_LEVSPEC = 51;   // freed when level is completed, used for line specials
export const PU_PURGELEVEL = 100; // can be freed
export const PU_CACHE = 101;     // can be freed

// In TS we don't need real zone management - GC handles it
// These are stubs to maintain API compatibility

export function Z_Init(): void {
	// No-op in TS
}

export function Z_Malloc(size: number, tag: number): any {
	// Just allocate - GC handles the rest
	return new Uint8Array(size);
}

export function Z_Free(_ptr: any): void {
	// GC handles this
}

export function Z_ChangeTag(_ptr: any, _tag: number): void {
	// No-op
}

export function Z_FreeTags(lowtag: number, hightag: number): void {
	// No-op - GC handles everything
}
