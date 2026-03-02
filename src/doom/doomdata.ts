// doomdata.ts — Map data structures (as read from WAD and as used in-game)

import type { TicCmd } from "./doomdef";
import { FRACUNIT } from "./doomdef";

// ===== WAD-level structures (as stored in WAD lumps) =====

export interface MapVertex {
	x: number; // fixed_t (but stored as short in WAD)
	y: number;
}

export interface MapSideDef {
	textureoffset: number;
	rowoffset: number;
	toptexture: string;
	bottomtexture: string;
	midtexture: string;
	sector: number; // index
}

export interface MapLineDef {
	v1: number; // vertex indices
	v2: number;
	flags: number;
	special: number;
	tag: number;
	sidenum: [number, number]; // sidedef indices, -1 for none
}

export interface MapSector {
	floorheight: number;
	ceilingheight: number;
	floorpic: string;
	ceilingpic: string;
	lightlevel: number;
	special: number;
	tag: number;
}

export interface MapSubSector {
	numsegs: number;
	firstseg: number;
}

export interface MapSeg {
	v1: number;
	v2: number;
	angle: number;
	linedef: number;
	side: number;
	offset: number;
}

export interface MapNode {
	x: number;
	y: number;
	dx: number;
	dy: number;
	bbox: [[number, number, number, number], [number, number, number, number]];
	children: [number, number];
}

export interface MapThing {
	x: number;
	y: number;
	angle: number;
	type: number;
	options: number;
}

// ===== Runtime structures =====

export interface Vertex {
	x: number; // fixed_t
	y: number;
}

export interface Sector {
	floorheight: number;  // fixed_t
	ceilingheight: number;
	floorpic: number;     // flat number
	ceilingpic: number;
	lightlevel: number;
	special: number;
	tag: number;
	soundtraversed: number;
	soundtarget: MapObject | null;
	blockbox: number[];   // bounding box for height changes
	soundorg: DegenmObj;  // origin for sounds
	validcount: number;
	thinglist: MapObject | null;
	specialdata: any;     // thinker for special actions
	linecount: number;
	lines: Line[];
	// Rendering
	floordata: any;
	ceilingdata: any;
	// Interpolation
	interpfloorheight: number;
	interpceilingheight: number;
	// Per-frame visplanes (set during rendering)
	_floorplane: any;
	_ceilingplane: any;
}

export interface Side {
	textureoffset: number; // fixed_t
	rowoffset: number;
	toptexture: number;
	bottomtexture: number;
	midtexture: number;
	sector: Sector;
}

export interface Line {
	v1: Vertex;
	v2: Vertex;
	dx: number; // fixed_t
	dy: number;
	flags: number;
	special: number;
	tag: number;
	sidenum: [number, number];
	bbox: number[];
	slopetype: SlopeType;
	frontsector: Sector | null;
	backsector: Sector | null;
	validcount: number;
	specialdata: any;
}

export const enum SlopeType {
	Horizontal,
	Vertical,
	Positive,
	Negative,
}

export interface Seg {
	v1: Vertex;
	v2: Vertex;
	offset: number;    // fixed_t
	angle: number;     // angle_t (BAM)
	sidedef: Side;
	linedef: Line;
	frontsector: Sector;
	backsector: Sector | null;
}

export interface SubSector {
	sector: Sector;
	numlines: number;
	firstline: number; // index into segs array
}

export interface Node {
	x: number;  // fixed_t — partition line
	y: number;
	dx: number;
	dy: number;
	bbox: [number[], number[]]; // [right child bbox, left child bbox]
	children: [number, number]; // high bit = subsector flag
}

export const NF_SUBSECTOR = 0x8000; // for 16-bit node format
export const NF_SUBSECTOR_32 = 0x80000000; // for 32-bit

// ===== Map Object (Mobj) =====

// Interaction flags
export const MF_SPECIAL = 1;
export const MF_SOLID = 2;
export const MF_SHOOTABLE = 4;
export const MF_NOSECTOR = 8;
export const MF_NOBLOCKMAP = 16;
export const MF_AMBUSH = 32;
export const MF_JUSTHIT = 64;
export const MF_JUSTATTACKED = 128;
export const MF_SPAWNCEILING = 256;
export const MF_NOGRAVITY = 512;
export const MF_DROPOFF = 0x400;
export const MF_PICKUP = 0x800;
export const MF_NOCLIP = 0x1000;
export const MF_SLIDE = 0x2000;
export const MF_FLOAT = 0x4000;
export const MF_TELEPORT = 0x8000;
export const MF_MISSILE = 0x10000;
export const MF_DROPPED = 0x20000;
export const MF_SHADOW = 0x40000;
export const MF_NOBLOOD = 0x80000;
export const MF_CORPSE = 0x100000;
export const MF_INFLOAT = 0x200000;
export const MF_COUNTKILL = 0x400000;
export const MF_COUNTITEM = 0x800000;
export const MF_SKULLFLY = 0x1000000;
export const MF_NOTDMATCH = 0x2000000;
export const MF_TRANSLATION = 0xc000000;
export const MF_TRANSSHIFT = 26;

// Degenerate mobj for sound origins etc.
export interface DegenmObj {
	x: number;
	y: number;
	z: number;
}

export interface MapObject {
	// List links
	thinker: Thinker;
	// Info for drawing
	x: number;
	y: number;
	z: number;
	// Links in sector (for rendering)
	snext: MapObject | null;
	sprev: MapObject | null;
	// Rendering
	angle: number;
	sprite: number;
	frame: number;
	// Interaction
	bnext: MapObject | null;
	bprev: MapObject | null;
	subsector: SubSector | null;
	floorz: number;
	ceilingz: number;
	radius: number;
	height: number;
	momx: number;
	momy: number;
	momz: number;
	validcount: number;
	type: number;
	info: MobjInfo;
	tics: number;
	state: State;
	flags: number;
	health: number;
	movedir: number;
	movecount: number;
	target: MapObject | null;
	reactiontime: number;
	threshold: number;
	player: Player | null;
	lastlook: number;
	spawnpoint: MapThing;
	tracer: MapObject | null;
}

// ===== Thinker (base for all active game objects) =====

export interface Thinker {
	prev: Thinker | null;
	next: Thinker | null;
	func: ((thinker: any) => void) | null;
	owner?: any;  // back-reference to the object that owns this thinker
}

// ===== State (animation frame) =====

export interface State {
	sprite: number;
	frame: number;
	tics: number;
	action: ((mobj: MapObject, ...args: any[]) => void) | null;
	nextstate: number;  // StateNum index
	misc1: number;
	misc2: number;
}

// ===== Mobj type info =====

export interface MobjInfo {
	doomednum: number;
	spawnstate: number;
	spawnhealth: number;
	seestate: number;
	seesound: number;
	reactiontime: number;
	attacksound: number;
	painstate: number;
	painchance: number;
	painsound: number;
	meleestate: number;
	missilestate: number;
	deathstate: number;
	xdeathstate: number;
	deathsound: number;
	speed: number;
	radius: number;
	height: number;
	mass: number;
	damage: number;
	activesound: number;
	flags: number;
	raisestate: number;
}

// ===== Player =====

export interface Player {
	mo: MapObject | null;
	playerstate: number;
	cmd: TicCmd;
	viewz: number;        // fixed_t
	viewheight: number;
	deltaviewheight: number;
	bob: number;
	// Weapon
	health: number;
	armorpoints: number;
	armortype: number;
	powers: number[];
	cards: boolean[];
	backpack: boolean;
	frags: number[];
	readyweapon: number;
	pendingweapon: number;
	weaponowned: boolean[];
	ammo: number[];
	maxammo: number[];
	attackdown: number;
	usedown: number;
	cheats: number;
	refire: number;
	// For intermission stats
	killcount: number;
	itemcount: number;
	secretcount: number;
	message: string | null;
	damagecount: number;
	bonuscount: number;
	attacker: MapObject | null;
	extralight: number;
	fixedcolormap: number;
	colormap: number;
	psprites: PSpDef[];
	didsecret: boolean;
	// Weapon sprites
	momx: number;
	momy: number;
	// Lookup
	lookdir: number;
}

export interface PSpDef {
	state: State | null;
	tics: number;
	sx: number; // fixed_t
	sy: number;
}

export function newPlayer(): Player {
	return {
		mo: null,
		playerstate: 0,
		cmd: { forwardmove: 0, sidemove: 0, angleturn: 0, chatchar: 0, buttons: 0, consistancy: 0 },
		viewz: 0,
		viewheight: 41 * FRACUNIT,
		deltaviewheight: 0,
		bob: 0,
		health: 100,
		armorpoints: 0,
		armortype: 0,
		powers: new Array(6).fill(0),
		cards: new Array(6).fill(false),
		backpack: false,
		frags: new Array(4).fill(0),
		readyweapon: 0,
		pendingweapon: 0,
		weaponowned: new Array(9).fill(false),
		ammo: new Array(4).fill(0),
		maxammo: [200, 50, 300, 50],
		attackdown: 0,
		usedown: 0,
		cheats: 0,
		refire: 0,
		killcount: 0,
		itemcount: 0,
		secretcount: 0,
		message: null,
		damagecount: 0,
		bonuscount: 0,
		attacker: null,
		extralight: 0,
		fixedcolormap: 0,
		colormap: 0,
		psprites: [
			{ state: null, tics: 0, sx: 0, sy: 0 },
			{ state: null, tics: 0, sx: 0, sy: 0 },
		],
		didsecret: false,
		momx: 0,
		momy: 0,
		lookdir: 0,
	};
}
