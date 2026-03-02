// w_wad.ts — WAD file loader and lump management

export interface LumpInfo {
	name: string;
	position: number;  // file offset
	size: number;
}

let wadData: ArrayBuffer | null = null;
let lumps: LumpInfo[] = [];
let lumpLookup: Map<string, number> = new Map();

export function W_NumLumps(): number {
	return lumps.length;
}

export function W_GetLumpInfo(lump: number): LumpInfo {
	if (lump < 0 || lump >= lumps.length) {
		throw new Error(`W_GetLumpInfo: lump ${lump} out of range`);
	}
	return lumps[lump]!;
}

export function W_GetNameForNum(lump: number): string {
	return lumps[lump]?.name ?? "";
}

export async function W_InitFromFile(path: string): Promise<void> {
	const file = Bun.file(path);
	wadData = await file.arrayBuffer();
	const view = new DataView(wadData);

	// Read header
	const id = String.fromCharCode(
		view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
	);
	if (id !== "IWAD" && id !== "PWAD") {
		throw new Error(`W_InitFromFile: ${path} is not a WAD file (got ${id})`);
	}

	const numlumps = view.getInt32(4, true);
	const infotableofs = view.getInt32(8, true);

	// Read lump directory
	lumps = [];
	lumpLookup = new Map();

	for (let i = 0; i < numlumps; i++) {
		const offset = infotableofs + i * 16;
		const filepos = view.getInt32(offset, true);
		const size = view.getInt32(offset + 4, true);

		// Read 8-byte name (null terminated)
		let name = "";
		for (let j = 0; j < 8; j++) {
			const ch = view.getUint8(offset + 8 + j);
			if (ch === 0) break;
			name += String.fromCharCode(ch);
		}
		name = name.toUpperCase();

		lumps.push({ name, position: filepos, size });
		// Store last occurrence (overrides earlier ones, like PWAD patching)
		lumpLookup.set(name, i);
	}

}

export function W_CheckNumForName(name: string): number {
	const upper = name.toUpperCase();
	return lumpLookup.get(upper) ?? -1;
}

export function W_GetNumForName(name: string): number {
	const num = W_CheckNumForName(name);
	if (num === -1) {
		throw new Error(`W_GetNumForName: ${name} not found!`);
	}
	return num;
}

export function W_LumpLength(lump: number): number {
	if (lump < 0 || lump >= lumps.length) {
		throw new Error(`W_LumpLength: lump ${lump} out of range`);
	}
	return lumps[lump]!.size;
}

export function W_CacheLumpNum(lump: number): DataView {
	if (!wadData) throw new Error("W_CacheLumpNum: no WAD loaded");
	if (lump < 0 || lump >= lumps.length) {
		throw new Error(`W_CacheLumpNum: lump ${lump} out of range`);
	}
	const info = lumps[lump]!;
	return new DataView(wadData, info.position, info.size);
}

export function W_CacheLumpName(name: string): DataView {
	return W_CacheLumpNum(W_GetNumForName(name));
}

// Get raw bytes for a lump
export function W_CacheLumpNumAsBytes(lump: number): Uint8Array {
	if (!wadData) throw new Error("no WAD loaded");
	if (lump < 0 || lump >= lumps.length) {
		throw new Error(`W_CacheLumpNumAsBytes: lump ${lump} out of range`);
	}
	const info = lumps[lump]!;
	return new Uint8Array(wadData, info.position, info.size);
}

export function W_CacheLumpNameAsBytes(name: string): Uint8Array {
	return W_CacheLumpNumAsBytes(W_GetNumForName(name));
}

// Find lump number after a marker (e.g., between S_START and S_END)
export function W_FindLumpAfterMarker(name: string, startMarker: string): number {
	const markerIdx = W_CheckNumForName(startMarker);
	if (markerIdx === -1) return -1;

	const upper = name.toUpperCase();
	for (let i = markerIdx + 1; i < lumps.length; i++) {
		if (lumps[i]!.name === upper) return i;
		// Stop at end marker
		if (lumps[i]!.name.endsWith("_END")) break;
	}
	return -1;
}

// Get range of lumps between markers
export function W_GetLumpRange(startMarker: string, endMarker: string): { start: number; end: number } {
	const start = W_CheckNumForName(startMarker);
	const end = W_CheckNumForName(endMarker);
	if (start === -1 || end === -1) return { start: -1, end: -1 };
	return { start: start + 1, end: end };
}

// Read a null-terminated string from a DataView
export function readString(view: DataView, offset: number, maxLen: number): string {
	let s = "";
	for (let i = 0; i < maxLen; i++) {
		const ch = view.getUint8(offset + i);
		if (ch === 0) break;
		s += String.fromCharCode(ch);
	}
	return s.toUpperCase();
}
