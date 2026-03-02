import { SCREENWIDTH, SCREENHEIGHT, FRACBITS } from "./doomdef";
import { screens } from "./v_video";

// Drawing state (set before calling draw functions)
export let dc_colormap: Uint8Array;  // light-level colormap
export let dc_x: number;             // column x position
export let dc_yl: number;            // top of column
export let dc_yh: number;            // bottom of column
export let dc_iscale: number;        // fixed_t vertical scaling
export let dc_texturemid: number;    // fixed_t
export let dc_source: Uint8Array;    // column data
export let dc_texheight: number;     // texture height for wrapping

export let ds_colormap: Uint8Array;  // span colormap
export let ds_y: number;
export let ds_x1: number;
export let ds_x2: number;
export let ds_xfrac: number;         // fixed_t
export let ds_yfrac: number;
export let ds_xstep: number;
export let ds_ystep: number;
export let ds_source: Uint8Array;    // flat data (64x64)

export let translationtables: Uint8Array;
export let dc_translation: Uint8Array;

// Column clipping arrays
export const viewwidth = SCREENWIDTH;
export const viewheight = SCREENHEIGHT;
export let columnofs: number[];      // x offset lookup into screen buffer

// Setters
export function setDcColormap(cm: Uint8Array) { dc_colormap = cm; }
export function setDcX(x: number) { dc_x = x; }
export function setDcYl(yl: number) { dc_yl = yl; }
export function setDcYh(yh: number) { dc_yh = yh; }
export function setDcIscale(s: number) { dc_iscale = s; }
export function setDcTexturemid(t: number) { dc_texturemid = t; }
export function setDcSource(s: Uint8Array) { dc_source = s; }
export function setDcTexheight(h: number) { dc_texheight = h; }
export function setDsColormap(cm: Uint8Array) { ds_colormap = cm; }
export function setDsY(y: number) { ds_y = y; }
export function setDsX1(x: number) { ds_x1 = x; }
export function setDsX2(x: number) { ds_x2 = x; }
export function setDsXfrac(x: number) { ds_xfrac = x; }
export function setDsYfrac(y: number) { ds_yfrac = y; }
export function setDsXstep(x: number) { ds_xstep = x; }
export function setDsYstep(y: number) { ds_ystep = y; }
export function setDsSource(s: Uint8Array) { ds_source = s; }

export function R_InitDrawFunctions(): void {
	columnofs = [];
	for (let i = 0; i < SCREENWIDTH; i++) {
		columnofs.push(i);
	}
}

// Draw a vertical column (wall/sprite)
export function R_DrawColumn(): void {
	const screen = screens[0]!;
	let count = dc_yh - dc_yl;
	if (count < 0) return;

	let dest = dc_yl * SCREENWIDTH + dc_x;
	let frac = dc_texturemid + (dc_yl - (SCREENHEIGHT / 2)) * dc_iscale;

	// Note: using >> FRACBITS and masking for texture height
	const heightmask = dc_texheight - 1;

	if (dc_texheight & heightmask) {
		// Not power of 2 -- need modulo
		if (frac < 0) {
			while ((frac >> FRACBITS) % dc_texheight < 0) frac += dc_texheight << FRACBITS;
		}
		while (count >= 0) {
			screen[dest] = dc_colormap[dc_source[((frac >> FRACBITS) % dc_texheight)]!]!;
			dest += SCREENWIDTH;
			frac += dc_iscale;
			count--;
		}
	} else {
		// Power of 2 fast path
		while (count >= 0) {
			screen[dest] = dc_colormap[dc_source[(frac >> FRACBITS) & heightmask]!]!;
			dest += SCREENWIDTH;
			frac += dc_iscale;
			count--;
		}
	}
}

// Draw a translucent column (spectre/invisibility)
export function R_DrawFuzzColumn(): void {
	const screen = screens[0]!;
	let count = dc_yh - dc_yl;
	if (count < 0) return;

	// Fuzz effect: darken pixels using colormap 6
	if (dc_yl <= 0) dc_yl = 1;
	if (dc_yh >= SCREENHEIGHT - 1) dc_yh = SCREENHEIGHT - 2;
	count = dc_yh - dc_yl;
	if (count < 0) return;

	let dest = dc_yl * SCREENWIDTH + dc_x;

	const fuzzoffset = [
		SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH,
		-SCREENWIDTH, SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH,
		SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH, SCREENWIDTH,
		SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH,
		SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH, SCREENWIDTH,
		SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH,
		SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH,
		SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH, -SCREENWIDTH,
		SCREENWIDTH, SCREENWIDTH, SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH,
		SCREENWIDTH, SCREENWIDTH, -SCREENWIDTH, SCREENWIDTH,
	];
	let fuzzpos = 0;

	while (count >= 0) {
		const adj = dest + fuzzoffset[fuzzpos % fuzzoffset.length]!;
		if (adj >= 0 && adj < screen.length) {
			screen[dest] = dc_colormap[screen[adj]!]!;
		}
		dest += SCREENWIDTH;
		fuzzpos++;
		count--;
	}
}

// Draw a translated column (player colors)
export function R_DrawTranslatedColumn(): void {
	const screen = screens[0]!;
	let count = dc_yh - dc_yl;
	if (count < 0) return;

	let dest = dc_yl * SCREENWIDTH + dc_x;
	let frac = dc_texturemid + (dc_yl - (SCREENHEIGHT / 2)) * dc_iscale;
	const heightmask = dc_texheight - 1;

	while (count >= 0) {
		screen[dest] = dc_colormap[dc_translation[dc_source[(frac >> FRACBITS) & heightmask]!]!]!;
		dest += SCREENWIDTH;
		frac += dc_iscale;
		count--;
	}
}

// Draw a horizontal span (floor/ceiling)
export function R_DrawSpan(): void {
	const screen = screens[0]!;
	let count = ds_x2 - ds_x1;
	if (count < 0) return;

	let dest = ds_y * SCREENWIDTH + ds_x1;
	let xfrac = ds_xfrac;
	let yfrac = ds_yfrac;

	while (count >= 0) {
		const spot = ((yfrac >> (FRACBITS - 6)) & (63 * 64)) + ((xfrac >> FRACBITS) & 63);
		screen[dest] = ds_colormap[ds_source[spot]!]!;
		dest++;
		xfrac += ds_xstep;
		yfrac += ds_ystep;
		count--;
	}
}

// Initialize translation tables for player colors
export function R_InitTranslationTables(): void {
	translationtables = new Uint8Array(256 * 3);
	for (let i = 0; i < 256 * 3; i++) {
		translationtables[i] = i % 256;
	}
	// Player color translations (green -> gray, brown, red)
	for (let i = 0; i < 256; i++) {
		// Table 0: Green -> Gray (0x60-0x6f -> 0x00-0x0f)
		if (i >= 0x70 && i <= 0x7f) {
			translationtables[i] = 0x60 + (i - 0x70);
		}
		// Table 1: Green -> Brown
		if (i >= 0x70 && i <= 0x7f) {
			translationtables[256 + i] = 0x40 + (i - 0x70);
		}
		// Table 2: Green -> Red
		if (i >= 0x70 && i <= 0x7f) {
			translationtables[512 + i] = 0x20 + (i - 0x70);
		}
	}
}
