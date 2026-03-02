// r_things.ts — Sprite rendering (monsters, items, decorations, player weapon sprites)

import { SCREENWIDTH, SCREENHEIGHT, FRACBITS, FRACUNIT, MAXVISSPRITES } from "./doomdef";
import * as doomstat from "./doomstat";
import { fixedMul, fixedDiv, pointToAngle2, ANG45, ANG90, ANGLETOFINESHIFT, finesine, finecosine, FINEMASK } from "./tables";
import type { MapObject, SubSector, Seg, Sector } from "./doomdata";

// Visible sprite structure
export interface VisSpriteT {
	x1: number;
	x2: number;
	gx: number;         // fixed_t, global position
	gy: number;
	gz: number;
	gzt: number;        // top of sprite
	startfrac: number;  // fixed_t, horizontal offset
	scale: number;      // fixed_t
	xiscale: number;    // fixed_t, inverse scale (neg = flip)
	texturemid: number;
	patch: number;       // lump number
	colormap: Uint8Array | null;
	mobjflags: number;
}

// Sprite frame/rotation definition
export interface SpriteFrame {
	rotate: boolean;
	lump: number[];    // 8 rotations (or 1 if no rotation)
	flip: boolean[];
}

export interface SpriteDef {
	numframes: number;
	spriteframes: SpriteFrame[];
}

export let vissprites: VisSpriteT[] = [];
export let vissprite_p: number = 0;
export let sprites: SpriteDef[] = [];
export let numsprites: number = 0;

export function R_InitSprites(namelist: string[]): void {
	// Build sprite rotation tables from WAD
	R_InitSpriteDefs(namelist);
}

function R_InitSpriteDefs(namelist: string[]): void {
	// For each sprite name, find all frames and rotations in the S_START/S_END range
	// This searches sprite lumps and organizes them by name/frame/rotation

	const { firstspritelump, lastspritelump, numspritelumps } = require("./r_data");
	const { W_GetLumpInfo } = require("./w_wad");

	numsprites = namelist.length;
	sprites = [];

	for (let i = 0; i < numsprites; i++) {
		const spriteName = namelist[i]!;
		const frames: Map<number, SpriteFrame> = new Map();

		// Search through sprite lumps
		for (let l = 0; l < numspritelumps; l++) {
			const lumpInfo = W_GetLumpInfo(firstspritelump + l);
			if (lumpInfo.name.substring(0, 4) !== spriteName) continue;

			const frame = lumpInfo.name.charCodeAt(4) - 65; // 'A' = 0
			const rotation = lumpInfo.name.charCodeAt(5) - 48; // '0' = 0

			if (!frames.has(frame)) {
				frames.set(frame, {
					rotate: false,
					lump: new Array(8).fill(-1),
					flip: new Array(8).fill(false),
				});
			}

			const sf = frames.get(frame)!;
			if (rotation === 0) {
				// No rotation — use for all angles
				for (let r = 0; r < 8; r++) {
					sf.lump[r] = firstspritelump + l;
					sf.flip[r] = false;
				}
			} else {
				sf.rotate = true;
				sf.lump[rotation - 1] = firstspritelump + l;
				sf.flip[rotation - 1] = false;
			}

			// Check for second frame/rotation (e.g., TROOA2A8)
			if (lumpInfo.name.length >= 8) {
				const frame2 = lumpInfo.name.charCodeAt(6) - 65;
				const rotation2 = lumpInfo.name.charCodeAt(7) - 48;

				if (!frames.has(frame2)) {
					frames.set(frame2, {
						rotate: false,
						lump: new Array(8).fill(-1),
						flip: new Array(8).fill(false),
					});
				}

				const sf2 = frames.get(frame2)!;
				if (rotation2 === 0) {
					for (let r = 0; r < 8; r++) {
						sf2.lump[r] = firstspritelump + l;
						sf2.flip[r] = true;
					}
				} else {
					sf2.rotate = true;
					sf2.lump[rotation2 - 1] = firstspritelump + l;
					sf2.flip[rotation2 - 1] = true;
				}
			}
		}

		// Convert map to array
		const maxFrame = frames.size > 0 ? Math.max(...frames.keys()) + 1 : 0;
		const spriteFrames: SpriteFrame[] = [];
		for (let f = 0; f < maxFrame; f++) {
			spriteFrames.push(frames.get(f) ?? { rotate: false, lump: new Array(8).fill(-1), flip: new Array(8).fill(false) });
		}

		sprites.push({ numframes: maxFrame, spriteframes: spriteFrames });
	}
}

export function R_ClearSprites(): void {
	vissprites = [];
	vissprite_p = 0;
}

export function R_NewVisSprite(): VisSpriteT {
	const vs: VisSpriteT = {
		x1: 0, x2: 0, gx: 0, gy: 0, gz: 0, gzt: 0,
		startfrac: 0, scale: 0, xiscale: 0, texturemid: 0,
		patch: 0, colormap: null, mobjflags: 0,
	};
	vissprites.push(vs);
	vissprite_p++;
	return vs;
}

export function R_ProjectSprite(thing: MapObject): void {
	const dbg = false;
	// Check if thing is in the visible range
	const tr_x = thing.x - doomstat.viewx;
	const tr_y = thing.y - doomstat.viewy;

	const gxt = fixedMul(tr_x, doomstat.viewcos);
	const gyt = -fixedMul(tr_y, doomstat.viewsin);
	const tz = gxt - gyt;

	if (tz < 4 * FRACUNIT) {
		return;
	}

	const xscale = fixedDiv(SCREENWIDTH / 2 * FRACUNIT, tz);

	const gxt2 = -fixedMul(tr_x, doomstat.viewsin);
	const gyt2 = fixedMul(tr_y, doomstat.viewcos);
	const tx = -(gyt2 + gxt2);

	// Too far off the side?
	if (Math.abs(tx) > (tz << 2)) {
		return;
	}

	// Determine sprite frame
	const sprdef = sprites[thing.sprite];
	if (!sprdef || sprdef.numframes === 0) {
		return;
	}

	const frameNum = thing.frame & 0x7fff; // FF_FRAMEMASK
	if (frameNum >= sprdef.numframes) return;
	const sprframe = sprdef.spriteframes[frameNum]!;

	let lump: number;
	let flip: boolean;

	if (sprframe.rotate) {
		const ang = pointToAngle2(thing.x, thing.y, doomstat.viewx, doomstat.viewy);
		const rot = ((ang - thing.angle + ((ANG45 / 2) * 9)) >>> 29) & 7;
		lump = sprframe.lump[rot]!;
		flip = sprframe.flip[rot]!;
	} else {
		lump = sprframe.lump[0]!;
		flip = sprframe.flip[0]!;
	}

	if (lump < 0) return;

	// Get sprite dimensions from r_data
	const { spritewidth, spriteoffset, spritetopoffset } = require("./r_data");
	const { colormaps } = require("./r_data");

	const width = spritewidth[lump - (require("./r_data").firstspritelump)]!;
	const offset = spriteoffset[lump - (require("./r_data").firstspritelump)]!;
	const topoffset = spritetopoffset[lump - (require("./r_data").firstspritelump)]!;

	let tx1 = tx;
	if (flip) {
		tx1 -= width - offset;
	} else {
		tx1 -= offset;
	}

	const centerxfrac = (SCREENWIDTH / 2) * FRACUNIT;
	const x1 = ((centerxfrac + fixedMul(tx1, xscale)) >> FRACBITS);
	if (x1 >= SCREENWIDTH) return;

	const tx2 = tx1 + width;
	const x2 = ((centerxfrac + fixedMul(tx2, xscale)) >> FRACBITS) - 1;
	if (x2 < 0) return;

	// Create vissprite
	const vis = R_NewVisSprite();
	vis.mobjflags = thing.flags;
	vis.scale = xscale;
	vis.gx = thing.x;
	vis.gy = thing.y;
	vis.gz = thing.z;
	vis.gzt = thing.z + topoffset;
	vis.texturemid = vis.gzt - doomstat.viewz;
	vis.x1 = Math.max(0, x1);
	vis.x2 = Math.min(SCREENWIDTH - 1, x2);

	const iscale = fixedDiv(FRACUNIT, xscale);
	if (flip) {
		vis.startfrac = width - 1;
		vis.xiscale = -iscale;
	} else {
		vis.startfrac = 0;
		vis.xiscale = iscale;
	}

	if (vis.x1 > x1) {
		vis.startfrac += vis.xiscale * (vis.x1 - x1);
	}
	vis.patch = lump;

	// Determine light level
	if (thing.frame & 0x8000) { // FF_FULLBRIGHT
		vis.colormap = colormaps.subarray(0, 256);
	} else {
		const index = Math.min(Math.max(0, (xscale >> 12) >> 4), 47);
		const lightnum = Math.max(0, (thing.subsector?.sector?.lightlevel ?? 0) >> 4);
		const cmapIndex = Math.max(0, Math.min(31, lightnum - index));
		vis.colormap = colormaps.subarray(cmapIndex * 256, cmapIndex * 256 + 256);
	}
}

export function R_AddSprites(sec: Sector): void {
	// Avoid processing the same sector twice (multiple subsectors may share one sector)
	const { validcount } = require("./r_main");
	if ((sec as any).validcount === validcount) return;
	(sec as any).validcount = validcount;

	let thing = sec.thinglist;
	while (thing) {
		R_ProjectSprite(thing);
		thing = thing.snext;
	}
}

export function R_DrawSprite(vis: VisSpriteT): void {
	// Draw a visible sprite using masked column drawing
	const { R_DrawColumn, R_DrawFuzzColumn, setDcColormap, setDcX, setDcYl, setDcYh,
		setDcIscale, setDcTexturemid, setDcSource, setDcTexheight } = require("./r_draw");
	const { W_CacheLumpNumAsBytes } = require("./w_wad");
	const { floorclip, ceilingclip, wallscale } = require("./r_segs");
	const { MF_SHADOW } = require("./doomdata");

	const patch = W_CacheLumpNumAsBytes(vis.patch);
	const patchView = new DataView(patch.buffer, patch.byteOffset, patch.byteLength);
	const patchWidth = patchView.getInt16(0, true);

	// Vertical inverse scale: 1/spryscale (NOT horizontal xiscale)
	const spryscale = vis.scale;
	const sprisscale = fixedDiv(FRACUNIT, spryscale);
	setDcIscale(sprisscale);
	setDcColormap(vis.colormap ?? new Uint8Array(256));

	let frac = vis.startfrac;
	const centery = SCREENHEIGHT / 2;
	const basetexturemid = vis.texturemid;
	const sprtopscreen = centery * FRACUNIT - fixedMul(basetexturemid, spryscale);

	for (let x = vis.x1; x <= vis.x2; x++) {
		const texturecolumn = frac >> FRACBITS;
		if (texturecolumn >= 0 && texturecolumn < patchWidth) {
			// Get column offset from patch header
			const columnofs = patchView.getInt32(8 + texturecolumn * 4, true);

			// Draw column posts (R_DrawMaskedColumn equivalent)
			let ofs = columnofs;
			while (true) {
				const topdelta = patch[ofs]!;
				ofs++;
				if (topdelta === 0xff) break;

				const length = patch[ofs]!;
				ofs++;
				ofs++; // padding

				// Adjust texturemid for this post's topdelta
				setDcTexturemid(basetexturemid - topdelta * FRACUNIT);

				const topscreen = sprtopscreen + spryscale * topdelta;
				const bottomscreen = topscreen + spryscale * length;

				// If this sprite column is in front of the nearest wall, don't clip it by walls
				const inFront = !wallscale[x] || vis.scale > wallscale[x]!;
				const cceil = inFront ? -1 : ceilingclip[x]!;
				const cfloor = inFront ? SCREENHEIGHT : floorclip[x]!;

				let yl = Math.max((topscreen + FRACUNIT - 1) >> FRACBITS, cceil + 1);
				let yh = Math.min((bottomscreen - 1) >> FRACBITS, cfloor - 1);

				if (yl <= yh) {
					const coldata = patch.subarray(ofs, ofs + length);
					setDcX(x);
					setDcYl(yl);
					setDcYh(yh);
					setDcSource(coldata);
					setDcTexheight(length);

					if (vis.mobjflags & MF_SHADOW) {
						R_DrawFuzzColumn();
					} else {
						R_DrawColumn();
					}
				}

				ofs += length;
				ofs++; // padding
			}
		}
		frac += vis.xiscale;
	}
}

export function R_SortVisSprites(): void {
	// Sort vissprites by scale (back to front)
	vissprites.sort((a, b) => a.scale - b.scale);
}

export function R_DrawMasked(): void {
	R_SortVisSprites();

	// Draw all vissprites (back to front)
	for (let i = 0; i < vissprites.length; i++) {
		R_DrawSprite(vissprites[i]!);
	}

	// TODO: Draw masked wall textures (2-sided mid textures)
}

// Player weapon sprite rendering
export function R_DrawPlayerSprites(): void {
	const player = doomstat.players[doomstat.displayplayer]!;
	if (!player) return;

	const { setDcColormap, setDcX, setDcYl, setDcYh, setDcIscale,
		setDcTexturemid, setDcSource, setDcTexheight, R_DrawColumn } = require("./r_draw");
	const { colormaps } = require("./r_data");

	const lightnum = Math.max(0, (player.mo?.subsector?.sector?.lightlevel ?? 0) >> 4);
	const extralight = player.extralight * 4;
	const cmapIndex = Math.max(0, Math.min(31, 16 - lightnum - extralight));
	const spriteColormap = colormaps.subarray(cmapIndex * 256, cmapIndex * 256 + 256);

	for (let i = 0; i < 2; i++) {
		const psp = player.psprites[i]!;
		if (!psp.state) continue;

		// Get sprite for this psprite state
		const sprdef = sprites[psp.state.sprite];
		if (!sprdef) continue;

		const frameNum = psp.state.frame & 0x7fff;
		if (frameNum >= sprdef.numframes) continue;
		const sprframe = sprdef.spriteframes[frameNum]!;
		const lump = sprframe.lump[0]!;
		const flip = sprframe.flip[0]!;

		if (lump < 0) continue;

		// Draw the weapon sprite using original Doom's R_DrawPSprite positioning
		const { W_CacheLumpNumAsBytes } = require("./w_wad");
		const { spritewidth, spriteoffset, spritetopoffset, firstspritelump } = require("./r_data");

		const sprIdx = lump - firstspritelump;

		// X: tx = psp.sx - 160*FRACUNIT - spriteoffset[lump]
		// x1 = (centerxfrac + FixedMul(tx, pspritescale)) >> FRACBITS
		// pspritescale = FRACUNIT for 320-wide, centerxfrac = 160*FRACUNIT
		const tx = psp.sx - (SCREENWIDTH / 2) * FRACUNIT - (spriteoffset[sprIdx] ?? 0);
		const x1 = ((SCREENWIDTH / 2) * FRACUNIT + tx) >> FRACBITS;
		// width from spritewidth array (fixed-point)
		const patchWidth = (spritewidth[sprIdx] ?? 0) >> FRACBITS;
		const x2 = x1 + patchWidth - 1;

		// Y: texturemid = BASEYCENTER*FRACUNIT + FRACUNIT/2 - (psp.sy - spritetopoffset[lump])
		const BASEYCENTER = SCREENHEIGHT / 2;
		const texturemid = BASEYCENTER * FRACUNIT + (FRACUNIT >> 1) - (psp.sy - (spritetopoffset[sprIdx] ?? 0));

		if (psp.state.frame & 0x8000) {
			setDcColormap(colormaps.subarray(0, 256));
		} else {
			setDcColormap(spriteColormap);
		}

		// Draw patch columns
		const patchData = W_CacheLumpNumAsBytes(lump);
		const patchView = new DataView(patchData.buffer, patchData.byteOffset, patchData.byteLength);
		const rawWidth = patchView.getInt16(0, true);

		for (let col = 0; col < rawWidth; col++) {
			const x = flip ? (x1 + patchWidth - 1 - col) : (x1 + col);
			if (x < 0 || x >= SCREENWIDTH) continue;

			const columnofs = patchView.getInt32(8 + col * 4, true);
			let ofs = columnofs;

			while (true) {
				const topdelta = patchData[ofs]!;
				ofs++;
				if (topdelta === 0xff) break;

				const length = patchData[ofs]!;
				ofs++;
				ofs++; // padding

				// screenY = centery - ((texturemid - topdelta*FRACUNIT) >> FRACBITS)
				// At 1:1 scale (pspritescale = FRACUNIT, pspriteiscale = FRACUNIT)
				const screenY = BASEYCENTER - ((texturemid - topdelta * FRACUNIT) >> FRACBITS);
				const yl = Math.max(0, screenY);
				const yh = Math.min(SCREENHEIGHT - 1, screenY + length - 1);

				if (yl <= yh) {
					const coldata = patchData.subarray(ofs, ofs + length);
					setDcX(x);
					setDcYl(yl);
					setDcYh(yh);
					setDcSource(coldata);
					setDcTexheight(length);
					setDcIscale(FRACUNIT);
					// Set texturemid so that frac at yl gives the right source pixel
					// frac = texturemid + (yl - centery) * iscale should index to (yl - screenY)
					setDcTexturemid((BASEYCENTER - screenY) * FRACUNIT);
					R_DrawColumn();
				}

				ofs += length;
				ofs++; // padding
			}
		}
	}
}
