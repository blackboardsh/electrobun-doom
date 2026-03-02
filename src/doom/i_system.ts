// i_system.ts — System interface (Bun-specific timing, etc.)

const startTime = performance.now();

export function I_GetTime(): number {
	// Returns time in tics (35 per second)
	return Math.floor((performance.now() - startTime) * 35 / 1000);
}

export function I_GetTimeMS(): number {
	return performance.now() - startTime;
}

export function I_StartTic(): void {
	// Input events are handled externally via the GpuWindow events
}

export function I_Error(msg: string): never {
	console.error(`I_Error: ${msg}`);
	throw new Error(msg);
}

export function I_Quit(): void {
	process.exit(0);
}

export function I_WaitVBL(_count: number): void {
	// No-op in modern rendering
}
