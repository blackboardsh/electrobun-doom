// p_setup.ts -- Level loading from WAD

import { FRACBITS, FRACUNIT, Skill } from "./doomdef";
import * as doomstat from "./doomstat";
import { W_GetNumForName, W_CacheLumpNum, W_LumpLength, W_CacheLumpNumAsBytes, readString } from "./w_wad";
import type { Vertex, Sector, Side, Line, Seg, SubSector, Node, MapObject } from "./doomdata";
import { SlopeType, NF_SUBSECTOR } from "./doomdata";
import { BOXTOP, BOXBOTTOM, BOXLEFT, BOXRIGHT, M_ClearBox, M_AddToBox } from "./m_misc";

export let totalkills = 0;
export let totalitems = 0;
export let totalsecret = 0;
export function incTotalKills() { totalkills++; }
export function incTotalItems() { totalitems++; }
export function incTotalSecret() { totalsecret++; }
export let deathmatchstarts: { x: number; y: number; angle: number; type: number; options: number }[] = [];
export let playerstarts: ({ x: number; y: number; angle: number; type: number; options: number } | null)[] = [null, null, null, null];

export function P_SetupLevel(episode: number, map: number, skill: Skill): void {
	totalkills = totalitems = totalsecret = 0;

	// Remove all thinkers
	// (handled by p_tick.ts)
	const { P_InitThinkers } = require("./p_tick");
	P_InitThinkers();

	// Determine map lump name
	let lumpName: string;
	if (doomstat.gamemode === 2) { // Commercial (Doom 2) only
		lumpName = `MAP${map.toString().padStart(2, "0")}`;
	} else {
		lumpName = `E${episode}M${map}`;
	}

	const lumpnum = W_GetNumForName(lumpName);

	doomstat.setLevelTime(0);

	// Load map data (lumps are in order after the map header lump)
	P_LoadVertexes(lumpnum + 4);   // ML_VERTEXES
	P_LoadSectors(lumpnum + 8);    // ML_SECTORS
	P_LoadSideDefs(lumpnum + 3);   // ML_SIDEDEFS
	P_LoadLineDefs(lumpnum + 2);   // ML_LINEDEFS
	P_LoadSubsectors(lumpnum + 6); // ML_SSECTORS
	P_LoadNodes(lumpnum + 7);      // ML_NODES
	P_LoadSegs(lumpnum + 5);       // ML_SEGS
	P_LoadBlockMap(lumpnum + 10);  // ML_BLOCKMAP
	P_LoadReject(lumpnum + 9);     // ML_REJECT

	// Build sector line lists
	P_GroupLines();

	// Set sky flat number
	const { R_FlatNumForName, R_TextureNumForName } = require("./r_data");
	const { setSkyflatnum, setSkyTexture } = require("./r_sky");
	setSkyflatnum(R_FlatNumForName("F_SKY1"));
	setSkyTexture(R_TextureNumForName("SKY1"));

	// Spawn things
	P_LoadThings(lumpnum + 1);     // ML_THINGS

	// Init body queue
	// P_InitBodyQueue(); // Not critical for basic functionality
}

function P_LoadVertexes(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 4;
	const verts: Vertex[] = [];

	for (let i = 0; i < count; i++) {
		verts.push({
			x: data.getInt16(i * 4, true) << FRACBITS,
			y: data.getInt16(i * 4 + 2, true) << FRACBITS,
		});
	}

	doomstat.setVertexes(verts, count);
}

function P_LoadSectors(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 26;
	const secs: Sector[] = [];

	const { R_FlatNumForName } = require("./r_data");

	for (let i = 0; i < count; i++) {
		const offset = i * 26;
		const sec: Sector = {
			floorheight: data.getInt16(offset, true) << FRACBITS,
			ceilingheight: data.getInt16(offset + 2, true) << FRACBITS,
			floorpic: R_FlatNumForName(readString(data, offset + 4, 8)),
			ceilingpic: R_FlatNumForName(readString(data, offset + 12, 8)),
			lightlevel: data.getInt16(offset + 20, true),
			special: data.getInt16(offset + 22, true),
			tag: data.getInt16(offset + 24, true),
			soundtraversed: 0,
			soundtarget: null,
			blockbox: [0, 0, 0, 0],
			soundorg: { x: 0, y: 0, z: 0 },
			validcount: 0,
			thinglist: null,
			specialdata: null,
			linecount: 0,
			lines: [],
			floordata: null,
			ceilingdata: null,
			interpfloorheight: 0,
			interpceilingheight: 0,
			_floorplane: null,
			_ceilingplane: null,
		};
		sec.interpfloorheight = sec.floorheight;
		sec.interpceilingheight = sec.ceilingheight;
		secs.push(sec);
	}

	doomstat.setSectors(secs, count);
}

function P_LoadSideDefs(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 30;
	const sides: Side[] = [];

	const { R_TextureNumForName } = require("./r_data");

	for (let i = 0; i < count; i++) {
		const offset = i * 30;
		const sectorNum = data.getInt16(offset + 28, true);
		sides.push({
			textureoffset: data.getInt16(offset, true) << FRACBITS,
			rowoffset: data.getInt16(offset + 2, true) << FRACBITS,
			toptexture: R_TextureNumForName(readString(data, offset + 4, 8)),
			bottomtexture: R_TextureNumForName(readString(data, offset + 12, 8)),
			midtexture: R_TextureNumForName(readString(data, offset + 20, 8)),
			sector: doomstat.sectors[sectorNum]!,
		});
	}

	doomstat.setSides(sides, count);
}

function P_LoadLineDefs(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 14;
	const lines: Line[] = [];

	for (let i = 0; i < count; i++) {
		const offset = i * 14;
		const v1idx = data.getUint16(offset, true);
		const v2idx = data.getUint16(offset + 2, true);
		const v1 = doomstat.vertexes[v1idx]!;
		const v2 = doomstat.vertexes[v2idx]!;
		const sidenum0 = data.getUint16(offset + 10, true);
		const sidenum1 = data.getUint16(offset + 12, true);

		const dx = v2.x - v1.x;
		const dy = v2.y - v1.y;

		let slopetype: SlopeType;
		if (dx === 0) slopetype = SlopeType.Vertical;
		else if (dy === 0) slopetype = SlopeType.Horizontal;
		else if ((dy > 0) === (dx > 0)) slopetype = SlopeType.Positive;
		else slopetype = SlopeType.Negative;

		const bbox = [0, 0, 0, 0];
		if (v1.x < v2.x) { bbox[BOXLEFT] = v1.x; bbox[BOXRIGHT] = v2.x; }
		else { bbox[BOXLEFT] = v2.x; bbox[BOXRIGHT] = v1.x; }
		if (v1.y < v2.y) { bbox[BOXBOTTOM] = v1.y; bbox[BOXTOP] = v2.y; }
		else { bbox[BOXBOTTOM] = v2.y; bbox[BOXTOP] = v1.y; }

		const line: Line = {
			v1, v2, dx, dy,
			flags: data.getUint16(offset + 4, true),
			special: data.getUint16(offset + 6, true),
			tag: data.getUint16(offset + 8, true),
			sidenum: [sidenum0, sidenum1 === 0xffff ? -1 : sidenum1],
			bbox,
			slopetype,
			frontsector: sidenum0 < doomstat.numsides ? doomstat.sides[sidenum0]!.sector : null,
			backsector: (sidenum1 !== 0xffff && sidenum1 < doomstat.numsides) ? doomstat.sides[sidenum1]!.sector : null,
			validcount: 0,
			specialdata: null,
		};
		lines.push(line);
	}

	doomstat.setLines(lines, count);
}

function P_LoadSegs(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 12;
	const segs: Seg[] = [];

	for (let i = 0; i < count; i++) {
		const offset = i * 12;
		const v1idx = data.getUint16(offset, true);
		const v2idx = data.getUint16(offset + 2, true);
		const angle = data.getInt16(offset + 4, true) << 16;
		const linedefIdx = data.getUint16(offset + 6, true);
		const side = data.getInt16(offset + 8, true);
		const segOffset = data.getInt16(offset + 10, true) << FRACBITS;

		const linedef = doomstat.lines[linedefIdx]!;
		const sidedef = doomstat.sides[linedef.sidenum[side]!]!;

		segs.push({
			v1: doomstat.vertexes[v1idx]!,
			v2: doomstat.vertexes[v2idx]!,
			offset: segOffset,
			angle: angle >>> 0,
			sidedef,
			linedef,
			frontsector: sidedef.sector,
			backsector: side ? linedef.frontsector : linedef.backsector,
		});
	}

	doomstat.setSegs(segs, count);
}

function P_LoadSubsectors(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 4;
	const subsectors: SubSector[] = [];

	for (let i = 0; i < count; i++) {
		const offset = i * 4;
		const numsegs = data.getUint16(offset, true);
		const firstseg = data.getUint16(offset + 2, true);

		// sector is determined from the first seg's sidedef
		subsectors.push({
			sector: null as any, // will be filled after segs are loaded
			numlines: numsegs,
			firstline: firstseg,
		});
	}

	// Set sector after segs are loaded (called from P_SetupLevel after P_LoadSegs)
	doomstat.setSubSectors(subsectors, count);
}

// Called to fix up subsector sector references (after segs loaded)
function fixupSubsectors(): void {
	for (let i = 0; i < doomstat.numsubsectors; i++) {
		const ss = doomstat.subsectors[i]!;
		const seg = doomstat.segs[ss.firstline];
		if (seg) {
			ss.sector = seg.sidedef.sector;
		}
	}
}

function P_LoadNodes(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 28;
	const nodes: Node[] = [];

	for (let i = 0; i < count; i++) {
		const offset = i * 28;
		nodes.push({
			x: data.getInt16(offset, true) << FRACBITS,
			y: data.getInt16(offset + 2, true) << FRACBITS,
			dx: data.getInt16(offset + 4, true) << FRACBITS,
			dy: data.getInt16(offset + 6, true) << FRACBITS,
			bbox: [
				[ // right child
					data.getInt16(offset + 8, true) << FRACBITS,
					data.getInt16(offset + 10, true) << FRACBITS,
					data.getInt16(offset + 12, true) << FRACBITS,
					data.getInt16(offset + 14, true) << FRACBITS,
				],
				[ // left child
					data.getInt16(offset + 16, true) << FRACBITS,
					data.getInt16(offset + 18, true) << FRACBITS,
					data.getInt16(offset + 20, true) << FRACBITS,
					data.getInt16(offset + 22, true) << FRACBITS,
				],
			],
			children: [
				data.getUint16(offset + 24, true),
				data.getUint16(offset + 26, true),
			],
		});
	}

	doomstat.setNodes(nodes, count);
}

function P_LoadThings(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 10;

	const { P_SpawnMapThing } = require("./p_mobj");
	let spawned = 0;
	let spawnKills = 0;
	let spawnItems = 0;
	let nonPlayer = 0;
	let unknown = 0;
	let skillFiltered = 0;

	for (let i = 0; i < count; i++) {
		const offset = i * 10;
		const mt = {
			x: data.getInt16(offset, true),
			y: data.getInt16(offset + 2, true),
			angle: data.getInt16(offset + 4, true),
			type: data.getUint16(offset + 6, true),
			options: data.getUint16(offset + 8, true),
		};
		if (mt.type < 1 || mt.type > 4) nonPlayer++;
		P_SpawnMapThing(mt);
		const { lastSpawnResult } = require("./p_mobj");
		if (lastSpawnResult === "unknown") unknown++;
		else if (lastSpawnResult === "filtered") skillFiltered++;
		else if (lastSpawnResult === "spawned") {
			spawned++;
			const { lastSpawnFlags } = require("./p_mobj");
			if (lastSpawnFlags?.countKill) spawnKills++;
			if (lastSpawnFlags?.countItem) spawnItems++;
		}
	}
}

function P_LoadBlockMap(lump: number): void {
	const data = W_CacheLumpNum(lump);
	const count = W_LumpLength(lump) / 2;

	const blockmaplump = new Int16Array(count);
	for (let i = 0; i < count; i++) {
		blockmaplump[i] = data.getInt16(i * 2, true);
	}

	const bmaporgx = blockmaplump[0]! << FRACBITS;
	const bmaporgy = blockmaplump[1]! << FRACBITS;
	const bmapwidth = blockmaplump[2]!;
	const bmapheight = blockmaplump[3]!;

	// blockmap starts at offset 4
	const blockmap = new Int16Array(blockmaplump.buffer, 8);

	doomstat.setBlockmap(blockmap, blockmaplump, bmaporgx, bmaporgy, bmapwidth, bmapheight);

	// Create empty blocklinks
	const blocklinksCount = bmapwidth * bmapheight;
	const blocklinks: (MapObject | null)[] = new Array(blocklinksCount).fill(null);
	doomstat.setBlocklinks(blocklinks);
}

function P_LoadReject(lump: number): void {
	const data = W_CacheLumpNumAsBytes(lump);
	doomstat.setRejectMatrix(new Uint8Array(data));
}

function P_GroupLines(): void {
	// Fix up subsector sectors
	fixupSubsectors();

	// Count lines per sector
	for (let i = 0; i < doomstat.numlines; i++) {
		const line = doomstat.lines[i]!;
		if (line.frontsector) line.frontsector.linecount++;
		if (line.backsector && line.backsector !== line.frontsector) {
			line.backsector.linecount++;
		}
	}

	// Assign lines to sectors and compute bounding boxes
	for (let i = 0; i < doomstat.numsectors; i++) {
		const sector = doomstat.sectors[i]!;
		sector.lines = [];
		M_ClearBox(sector.blockbox);
	}

	for (let i = 0; i < doomstat.numlines; i++) {
		const line = doomstat.lines[i]!;
		if (line.frontsector) {
			line.frontsector.lines.push(line);
			M_AddToBox(line.frontsector.blockbox, line.v1.x, line.v1.y);
			M_AddToBox(line.frontsector.blockbox, line.v2.x, line.v2.y);
		}
		if (line.backsector && line.backsector !== line.frontsector) {
			line.backsector.lines.push(line);
			M_AddToBox(line.backsector.blockbox, line.v1.x, line.v1.y);
			M_AddToBox(line.backsector.blockbox, line.v2.x, line.v2.y);
		}
	}

	// Set sector sound origins to center of bounding box
	for (let i = 0; i < doomstat.numsectors; i++) {
		const sector = doomstat.sectors[i]!;
		sector.soundorg.x = (sector.blockbox[BOXRIGHT]! + sector.blockbox[BOXLEFT]!) / 2;
		sector.soundorg.y = (sector.blockbox[BOXTOP]! + sector.blockbox[BOXBOTTOM]!) / 2;
	}
}
