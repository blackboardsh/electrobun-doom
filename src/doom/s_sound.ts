// s_sound.ts — Sound system (stub)
// Sound is not implemented yet — all functions are no-ops

import type { MapObject, DegenmObj } from "./doomdata";

export function S_Init(sfxVolume: number, musicVolume: number): void {
	// Stub
}

export function S_Start(): void {
	// Stub
}

export function S_StartSound(origin: MapObject | DegenmObj | null, sfxId: number): void {
	// Stub
}

export function S_StartMusic(musicId: number): void {
	// Stub
}

export function S_ChangeMusic(musicId: number, looping: boolean): void {
	// Stub
}

export function S_StopSound(origin: MapObject | null): void {
	// Stub
}

export function S_StopMusic(): void {
	// Stub
}

export function S_PauseSound(): void {
	// Stub
}

export function S_ResumeSound(): void {
	// Stub
}

export function S_SetMusicVolume(volume: number): void {
	// Stub
}

export function S_SetSfxVolume(volume: number): void {
	// Stub
}

export function S_UpdateSounds(listener: MapObject | null): void {
	// Stub
}
