// doomdef.ts — Constants, enums, and type definitions for Doom

// Game version
export const VERSION = 109;

// Screen dimensions (original Doom resolution)
export const SCREENWIDTH = 320;
export const SCREENHEIGHT = 200;

// Maximum players
export const MAXPLAYERS = 4;

// Tic rate
export const TICRATE = 35;

// Fixed point
export const FRACBITS = 16;
export const FRACUNIT = 1 << FRACBITS; // 65536

// Game mode (which IWAD)
export const enum GameMode {
	Shareware,      // DOOM 1 shareware / Freedoom Phase 1
	Registered,     // DOOM 1 registered
	Commercial,     // DOOM 2
	Retail,         // Ultimate DOOM
	Indetermined,   // Unknown
}

// Game mission
export const enum GameMission {
	Doom,
	Doom2,
	PackTnt,
	PackPlut,
	None,
}

// Skill levels
export const enum Skill {
	Baby,
	Easy,
	Medium,
	Hard,
	Nightmare,
}

// Game states
export const enum GameState {
	Level,
	Intermission,
	Finale,
	DemoScreen,
}

// Game actions
export const enum GameAction {
	Nothing,
	LoadLevel,
	NewGame,
	LoadGame,
	SaveGame,
	PlayDemo,
	Completed,
	Victory,
	WorldDone,
	Screenshot,
}

// Button/key actions
export const BT_ATTACK = 1;
export const BT_USE = 2;
export const BT_SPECIAL = 128;
export const BT_SPECIALMASK = 3;
export const BT_CHANGE = 4;
export const BT_WEAPONMASK = (8 + 16 + 32);
export const BT_WEAPONSHIFT = 3;

// Card types (keys)
export const enum Card {
	BlueCard,
	YellowCard,
	RedCard,
	BlueSkull,
	YellowSkull,
	RedSkull,
	NUMCARDS,
}

// Weapon types
export const enum WeaponType {
	Fist,
	Pistol,
	Shotgun,
	Chaingun,
	Missile,
	Plasma,
	BFG,
	Chainsaw,
	SuperShotgun,
	NUMWEAPONS,
	NoChange,
}

// Ammo types
export const enum AmmoType {
	Clip,    // pistol/chaingun
	Shell,   // shotgun
	Cell,    // plasma/BFG
	Missile, // rocket launcher
	NUMAMMO,
	NoAmmo,  // fist/chainsaw
}

// Power types
export const enum PowerType {
	Invulnerability,
	Strength,
	Invisibility,
	IronFeet,
	AllMap,
	Infrared,
	NUMPOWERS,
}

// Power durations (in tics)
export const INVULNTICS = 30 * TICRATE;
export const INVISTICS = 60 * TICRATE;
export const INFRATICS = 120 * TICRATE;
export const IRONTICS = 60 * TICRATE;

// Max ammo per type
export const maxAmmo: number[] = [200, 50, 300, 50];

// Clip ammo per type (amount in a clip pickup)
export const clipAmmo: number[] = [10, 4, 20, 1];

// Player state
export const enum PlayerState {
	Live,
	Dead,
	Reborn,
}

// Ticcmd — what a player does in one tic
export interface TicCmd {
	forwardmove: number;  // -128..127
	sidemove: number;     // -128..127
	angleturn: number;    // <<16 for fine angle
	chatchar: number;
	buttons: number;
	consistancy: number;
}

export function newTicCmd(): TicCmd {
	return {
		forwardmove: 0,
		sidemove: 0,
		angleturn: 0,
		chatchar: 0,
		buttons: 0,
		consistancy: 0,
	};
}

// Doom key constants
export const KEY_RIGHTARROW = 0xae;
export const KEY_LEFTARROW = 0xac;
export const KEY_UPARROW = 0xad;
export const KEY_DOWNARROW = 0xaf;
export const KEY_ESCAPE = 27;
export const KEY_ENTER = 13;
export const KEY_TAB = 9;
export const KEY_F1 = 0x80 + 0x3b;
export const KEY_F2 = 0x80 + 0x3c;
export const KEY_F3 = 0x80 + 0x3d;
export const KEY_F4 = 0x80 + 0x3e;
export const KEY_F5 = 0x80 + 0x3f;
export const KEY_F6 = 0x80 + 0x40;
export const KEY_F7 = 0x80 + 0x41;
export const KEY_F8 = 0x80 + 0x42;
export const KEY_F9 = 0x80 + 0x43;
export const KEY_F10 = 0x80 + 0x44;
export const KEY_F11 = 0x80 + 0x57;
export const KEY_F12 = 0x80 + 0x58;
export const KEY_BACKSPACE = 127;
export const KEY_PAUSE = 0xff;
export const KEY_EQUALS = 0x3d;
export const KEY_MINUS = 0x2d;
export const KEY_RSHIFT = 0x80 + 0x36;
export const KEY_RCTRL = 0x80 + 0x1d;
export const KEY_RALT = 0x80 + 0x38;

// Line flags
export const ML_BLOCKING = 1;
export const ML_BLOCKMONSTERS = 2;
export const ML_TWOSIDED = 4;
export const ML_DONTPEGTOP = 8;
export const ML_DONTPEGBOTTOM = 16;
export const ML_SECRET = 32;
export const ML_SOUNDBLOCK = 64;
export const ML_DONTDRAW = 128;
export const ML_MAPPED = 256;

// Sector special types
export const enum SectorSpecial {
	Normal = 0,
	LightFlicker = 1,
	StrobeFlash = 2,
	StrobeFast = 3,
	StrobeSlow = 4,
	DoorRaiseIn5Mins = 10,
	DamageHellslime = 5,
	DamageNukage = 7,
	DamageSuperHellslime = 16,
	SecretSector = 9,
	DoorClose30OpenNext = 14,
	End = 11,
}

// Maxima
export const MAXVISSPRITES = 128;
export const MAXDRAWSEGS = 256;
export const MAXVISPLANES = 128;
export const MAXOPENINGS = SCREENWIDTH * 64;
export const MAXLINEANIMS = 64;

// Texture constants
export const LOOKDIRMIN = 110;
export const LOOKDIRMAX = 90;
export const LOOKDIRS = (LOOKDIRMIN + LOOKDIRMAX);

// Map limits
export const MAXRADIUS = 32 * FRACUNIT;
export const MAXHEALTH = 100;
export const MAXMOVE = 30 * FRACUNIT;
export const VIEWHEIGHT = 41 * FRACUNIT;

// Defaults
export const MELEERANGE = 64 * FRACUNIT;
export const MISSILERANGE = 32 * 64 * FRACUNIT;

// Following value is the base for all sounds NOT in S_sfx.
export const NUMSFX = 109;
