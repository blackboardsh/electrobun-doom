// r_data.ts — Rendering data initialization: textures, flats, colormaps, sprites

import { FRACBITS } from "./doomdef";
import {
	W_GetNumForName,
	W_CheckNumForName,
	W_CacheLumpNum,
	W_CacheLumpNumAsBytes,
	W_LumpLength,
	W_NumLumps,
	W_GetLumpInfo,
	readString,
} from "./w_wad";

// ===== Types =====

export interface TextureColumn {
	data: Uint8Array; // Column pixel data (height pixels)
}

export interface TexturePatch {
	originx: number;
	originy: number;
	patch: number; // patch lump number
}

export interface Texture {
	name: string;
	width: number;
	height: number;
	masked: boolean;
	columns: (Uint8Array | null)[]; // One column per pixel width, null = transparent
	patchcount: number;
	patches: TexturePatch[];
	columnlump: Int16Array;
	columnofs: Uint16Array;
	compositeData: Uint8Array | null;
	compositeColumnofs: Int32Array | null;
}

// ===== Global data =====

export let colormaps: Uint8Array;
export let numtextures: number = 0;
export let textures: Texture[] = [];
export let textureheight: Int32Array = new Int32Array(0); // fixed_t
export let texturewidthmask: number[] = [];
export let texturecolumnlump: Int16Array[] = [];
export let texturecolumnofs: Int32Array[] = [];
export let texturecomposite: (Uint8Array | null)[] = [];
export let texturecompositesize: Int32Array = new Int32Array(0);
export let numflats: number = 0;
export let firstflat: number = 0;
export let lastflat: number = 0;
export let flatTranslation: Int32Array = new Int32Array(0);
export let textureTranslation: Int32Array = new Int32Array(0);
export let firstspritelump: number = 0;
export let lastspritelump: number = 0;
export let numspritelumps: number = 0;
export let spritewidth: Int32Array = new Int32Array(0);   // fixed_t
export let spriteoffset: Int32Array = new Int32Array(0);  // fixed_t
export let spritetopoffset: Int32Array = new Int32Array(0); // fixed_t

// ===== Texture name lookup map =====

let textureNameMap: Map<string, number> = new Map();

// ===== Functions =====

/**
 * Initialize all rendering data: textures, flats, sprites, colormaps.
 */
export function R_InitData(): void {
	R_InitTextures();
	R_InitFlats();
	R_InitSpriteLumps();
	R_InitColormaps();
}

/**
 * Load and parse TEXTURE1/TEXTURE2 + PNAMES to build texture definitions.
 */
export function R_InitTextures(): void {
	// Load PNAMES — patch name to lump number mapping
	const pnamesLump = W_GetNumForName("PNAMES");
	const pnamesView = W_CacheLumpNum(pnamesLump);
	const nummappatches = pnamesView.getInt32(0, true);
	const patchlookup: number[] = new Array(nummappatches);

	for (let i = 0; i < nummappatches; i++) {
		const name = readString(pnamesView, 4 + i * 8, 8);
		patchlookup[i] = W_CheckNumForName(name);
	}

	// Load TEXTURE1 and optionally TEXTURE2
	const textureLumps: number[] = [W_GetNumForName("TEXTURE1")];
	const texture2 = W_CheckNumForName("TEXTURE2");
	if (texture2 !== -1) {
		textureLumps.push(texture2);
	}

	// Count total textures
	numtextures = 0;
	for (const lumpNum of textureLumps) {
		const view = W_CacheLumpNum(lumpNum);
		numtextures += view.getInt32(0, true);
	}

	// Allocate arrays
	textures = new Array(numtextures);
	textureheight = new Int32Array(numtextures);
	texturewidthmask = new Array(numtextures);
	texturecolumnlump = new Array(numtextures);
	texturecolumnofs = new Array(numtextures);
	texturecomposite = new Array(numtextures).fill(null);
	texturecompositesize = new Int32Array(numtextures);
	textureTranslation = new Int32Array(numtextures);
	textureNameMap = new Map();

	let texIdx = 0;

	for (const lumpNum of textureLumps) {
		const view = W_CacheLumpNum(lumpNum);
		const numInLump = view.getInt32(0, true);

		for (let i = 0; i < numInLump; i++) {
			// Read offset to texture definition
			const offset = view.getInt32(4 + i * 4, true);

			// Parse texture header (22 bytes)
			const name = readString(view, offset, 8);
			const masked = view.getInt32(offset + 8, true) !== 0;
			const width = view.getInt16(offset + 12, true);
			const height = view.getInt16(offset + 14, true);
			// offset + 16: columndirectory (obsolete, 4 bytes)
			const patchcount = view.getInt16(offset + 20, true);

			const patches: TexturePatch[] = new Array(patchcount);

			for (let j = 0; j < patchcount; j++) {
				const patchOfs = offset + 22 + j * 10;
				const originx = view.getInt16(patchOfs, true);
				const originy = view.getInt16(patchOfs + 2, true);
				const patchIdx = view.getInt16(patchOfs + 4, true);
				// +6: stepdir (unused), +8: colormap (unused)

				patches[j] = {
					originx,
					originy,
					patch: patchlookup[patchIdx] ?? -1,
				};
			}

			const tex: Texture = {
				name,
				width,
				height,
				masked,
				columns: new Array(width).fill(null),
				patchcount,
				patches,
				columnlump: new Int16Array(width),
				columnofs: new Uint16Array(width),
				compositeData: null,
				compositeColumnofs: null,
			};

			textures[texIdx] = tex;

			// Store height in fixed point
			textureheight[texIdx] = height << FRACBITS;

			// Width mask for power-of-2 tiling
			let w = 1;
			while (w * 2 <= width) {
				w *= 2;
			}
			texturewidthmask[texIdx] = w - 1;

			// Build column lookup
			R_GenerateLookup(texIdx);

			// Name→index mapping
			textureNameMap.set(name, texIdx);

			// Identity translation by default
			textureTranslation[texIdx] = texIdx;

			texIdx++;
		}
	}

}

/**
 * Build column lump/offset lookup for a texture.
 * Determines which patch lump and offset each column comes from,
 * and computes composite size for multi-patch textures.
 */
function R_GenerateLookup(texnum: number): void {
	const tex = textures[texnum]!;
	const colLump = new Int16Array(tex.width);
	const colOfs = new Int32Array(tex.width);

	// Track how many patches cover each column
	const patchcount = new Uint8Array(tex.width);

	// For each patch, mark which columns it covers
	for (const tp of tex.patches) {
		if (tp.patch === -1) continue;

		const patchLump = tp.patch;
		const patchView = W_CacheLumpNum(patchLump);
		const patchWidth = patchView.getInt16(0, true);

		const x1 = Math.max(0, tp.originx);
		const x2 = Math.min(tex.width, tp.originx + patchWidth);

		for (let x = x1; x < x2; x++) {
			// Column offset within the patch
			const patchCol = x - tp.originx;
			patchcount[x]++;

			// If only one patch covers this column, we can reference patch directly
			colLump[x] = (patchcount[x] === 1) ? patchLump : -1;
			colOfs[x] = (patchcount[x] === 1) ? patchView.getInt32(8 + patchCol * 4, true) : 0;
		}
	}

	// Mark multi-patch columns as needing composite
	let compositeSize = 0;
	const compositeColOfs = new Int32Array(tex.width);
	let needsComposite = false;

	for (let x = 0; x < tex.width; x++) {
		if (patchcount[x] === 0) {
			// No patch covers this column — transparent
			colLump[x] = -1;
			colOfs[x] = 0;
		} else if (patchcount[x] > 1) {
			// Multiple patches — need composite
			colLump[x] = -1;
			needsComposite = true;
		}

		if (colLump[x] === -1 && patchcount[x] > 0) {
			compositeColOfs[x] = compositeSize;
			compositeSize += tex.height;
		}
	}

	texturecolumnlump[texnum] = colLump;
	texturecolumnofs[texnum] = colOfs;

	if (needsComposite) {
		texturecompositesize[texnum] = compositeSize;
	}
}

/**
 * Generate the composite image for a multi-patch texture.
 */
export function R_GenerateComposite(texnum: number): void {
	const tex = textures[texnum]!;
	const size = texturecompositesize[texnum];

	if (size === 0) {
		// Single-patch texture — composite is just the height * width
		const totalSize = tex.width * tex.height;
		tex.compositeData = new Uint8Array(totalSize);
		tex.compositeColumnofs = new Int32Array(tex.width);
		for (let x = 0; x < tex.width; x++) {
			tex.compositeColumnofs[x] = x * tex.height;
		}
	} else {
		tex.compositeData = new Uint8Array(size);
		tex.compositeColumnofs = new Int32Array(tex.width);

		// Copy offsets
		const colOfs = texturecolumnofs[texnum]!;
		for (let x = 0; x < tex.width; x++) {
			tex.compositeColumnofs[x] = colOfs[x];
		}
	}

	const composite = tex.compositeData;
	const compOfs = tex.compositeColumnofs;

	// Draw each patch onto the composite
	for (const tp of tex.patches) {
		if (tp.patch === -1) continue;

		const patchData = W_CacheLumpNumAsBytes(tp.patch);
		const patchView = new DataView(patchData.buffer, patchData.byteOffset, patchData.byteLength);
		const patchWidth = patchView.getInt16(0, true);

		const x1 = Math.max(0, tp.originx);
		const x2 = Math.min(tex.width, tp.originx + patchWidth);

		for (let x = x1; x < x2; x++) {
			const patchCol = x - tp.originx;
			let colOffset = patchView.getUint32(8 + patchCol * 4, true);

			// Walk column posts
			while (true) {
				const topdelta = patchData[colOffset]!;
				if (topdelta === 0xff) break; // End of column

				const length = patchData[colOffset + 1]!;
				// colOffset + 2 = padding byte
				const srcStart = colOffset + 3;

				const dstCol = compOfs[x];
				for (let j = 0; j < length; j++) {
					const destY = tp.originy + topdelta + j;
					if (destY >= 0 && destY < tex.height) {
						composite[dstCol + destY] = patchData[srcStart + j]!;
					}
				}

				colOffset += length + 4; // topdelta + length + padding + data + padding
			}
		}
	}

	texturecomposite[texnum] = composite;
}

/**
 * Get a column of pixels from a texture.
 */
export function R_GetColumn(texnum: number, col: number): Uint8Array {
	const tex = textures[texnum]!;
	col = col & texturewidthmask[texnum]!;

	const lump = texturecolumnlump[texnum]![col];

	if (lump !== undefined && lump > 0) {
		// Single-patch column — read directly from patch lump
		const ofs = texturecolumnofs[texnum]![col];
		return R_DrawColumnFromPatch(lump, ofs, tex.height);
	}

	// Multi-patch or needs composite
	if (!tex.compositeData) {
		R_GenerateComposite(texnum);
	}

	const composite = tex.compositeData!;
	const compOfs = tex.compositeColumnofs![col];
	return composite.subarray(compOfs, compOfs + tex.height);
}

/**
 * Extract a column of pixel data from a patch lump at the given offset.
 * Walks the post structure and writes into a flat column buffer.
 */
function R_DrawColumnFromPatch(lump: number, offset: number, height: number): Uint8Array {
	const patchData = W_CacheLumpNumAsBytes(lump);
	const column = new Uint8Array(height);

	let colOfs = offset;

	while (true) {
		const topdelta = patchData[colOfs]!;
		if (topdelta === 0xff) break;

		const length = patchData[colOfs + 1]!;
		const srcStart = colOfs + 3; // skip topdelta, length, padding

		for (let j = 0; j < length; j++) {
			const destY = topdelta + j;
			if (destY < height) {
				column[destY] = patchData[srcStart + j]!;
			}
		}

		colOfs += length + 4; // topdelta + length + padding + data[length] + padding
	}

	return column;
}

/**
 * Initialize flats (floor/ceiling textures).
 * Found between F_START/F_END (or FF_START/FF_END) markers.
 */
export function R_InitFlats(): void {
	// Try F_START/F_END first, fall back to FF_START/FF_END
	let startLump = W_CheckNumForName("F_START");
	let endLump = W_CheckNumForName("F_END");

	if (startLump === -1) {
		startLump = W_CheckNumForName("FF_START");
		endLump = W_CheckNumForName("FF_END");
	}

	if (startLump === -1 || endLump === -1) {
		throw new Error("R_InitFlats: no flat markers found");
	}

	firstflat = startLump + 1;
	lastflat = endLump - 1;
	numflats = lastflat - firstflat + 1;

	// Identity translation table
	flatTranslation = new Int32Array(numflats);
	for (let i = 0; i < numflats; i++) {
		flatTranslation[i] = i;
	}

}

/**
 * Initialize sprite lumps — read width, offset, topoffset from patch headers.
 * Sprites are found between S_START/S_END (or SS_START/SS_END) markers.
 */
export function R_InitSpriteLumps(): void {
	// Some WADs contain multiple S_START/S_END ranges.
	// Use the earliest start and the latest end to cover all sprites.
	const numLumps = W_NumLumps();
	let startLump = -1;
	let endLump = -1;

	for (let i = 0; i < numLumps; i++) {
		const name = W_GetLumpInfo(i).name;
		if (name === "S_START" || name === "SS_START") {
			if (startLump === -1 || i < startLump) startLump = i;
		}
		if (name === "S_END" || name === "SS_END") {
			if (endLump === -1 || i > endLump) endLump = i;
		}
	}

	if (startLump === -1 || endLump === -1 || endLump <= startLump) {
		throw new Error("R_InitSpriteLumps: no sprite markers found");
	}

	firstspritelump = startLump + 1;
	lastspritelump = endLump - 1;
	numspritelumps = lastspritelump - firstspritelump + 1;

	spritewidth = new Int32Array(numspritelumps);
	spriteoffset = new Int32Array(numspritelumps);
	spritetopoffset = new Int32Array(numspritelumps);

	for (let i = 0; i < numspritelumps; i++) {
		const lump = firstspritelump + i;
		const lumpInfo = W_GetLumpInfo(lump);

		if (lumpInfo.size === 0) {
			// Empty lump (marker or placeholder)
			spritewidth[i] = 0;
			spriteoffset[i] = 0;
			spritetopoffset[i] = 0;
			continue;
		}

		const view = W_CacheLumpNum(lump);
		// Patch header: width (short), height (short), leftoffset (short), topoffset (short)
		const width = view.getInt16(0, true);
		const leftoffset = view.getInt16(4, true);
		const topoffset = view.getInt16(6, true);

		spritewidth[i] = width << FRACBITS;
		spriteoffset[i] = leftoffset << FRACBITS;
		spritetopoffset[i] = topoffset << FRACBITS;
	}

}

/**
 * Load the COLORMAP lump (34 * 256 byte light-level palette remapping table).
 */
export function R_InitColormaps(): void {
	const lump = W_GetNumForName("COLORMAP");
	colormaps = W_CacheLumpNumAsBytes(lump);
}

/**
 * Look up a flat by name. Returns index relative to firstflat.
 */
export function R_FlatNumForName(name: string): number {
	const upper = name.toUpperCase();
	const numLumps = W_NumLumps();

	for (let i = firstflat; i <= lastflat; i++) {
		const info = W_GetLumpInfo(i);
		if (info.name === upper) {
			return i - firstflat;
		}
	}

	// Not found — return 0 as fallback (like original Doom)
	return 0;
}

/**
 * Look up a texture by name. Returns texture index, or 0 if not found.
 */
export function R_TextureNumForName(name: string): number {
	const idx = R_CheckTextureNumForName(name);
	if (idx === -1) {
		return 0;
	}
	return idx;
}

/**
 * Look up a texture by name. Returns texture index, or -1 if not found.
 */
export function R_CheckTextureNumForName(name: string): number {
	const upper = name.toUpperCase();
	if (upper === "-") {
		return 0;
	}
	return textureNameMap.get(upper) ?? -1;
}

/**
 * Precache textures, flats, and sprites for the current level.
 * This is a hint to load data ahead of time; in our JS implementation
 * we pre-generate composites for all textures.
 */
export function R_PrecacheLevel(): void {
	// Pre-generate composite textures
	for (let i = 0; i < numtextures; i++) {
		if (!texturecomposite[i]) {
			R_GenerateComposite(i);
		}
	}
}
