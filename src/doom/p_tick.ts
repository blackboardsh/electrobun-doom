// p_tick.ts — Thinker list management
// The thinker list is a circular doubly-linked list of active game objects
// that get updated each tic.

import type { Thinker } from "./doomdata";

// Sentinel node (head of the circular list)
export const thinkercap: Thinker = { prev: null, next: null, func: null };

export function P_InitThinkers(): void {
	thinkercap.prev = thinkercap;
	thinkercap.next = thinkercap;
}

export function P_AddThinker(thinker: Thinker): void {
	// Insert at end of list (before cap)
	thinker.next = thinkercap;
	thinker.prev = thinkercap.prev;
	thinkercap.prev!.next = thinker;
	thinkercap.prev = thinker;
}

export function P_RemoveThinker(thinker: Thinker): void {
	// Mark for removal by setting function to null
	thinker.func = null;
	// Actually unlink
	if (thinker.next) thinker.next.prev = thinker.prev;
	if (thinker.prev) thinker.prev.next = thinker.next;
}

export function P_RunThinkers(): void {
	let current = thinkercap.next!;
	while (current !== thinkercap) {
		const next = current.next!;
		if (current.func === null) {
			// Remove from list
			if (current.next) current.next.prev = current.prev;
			if (current.prev) current.prev.next = current.next;
		} else {
			current.func(current);
		}
		current = next;
	}
}

export function P_Ticker(): void {
	// Run all thinkers
	P_RunThinkers();

	// Update specials (lights, doors, platforms, etc.)
	const { P_UpdateSpecials } = require("./p_spec");
	P_UpdateSpecials();

	// Respawn stuff in deathmatch
	// P_RespawnSpecials();
}
