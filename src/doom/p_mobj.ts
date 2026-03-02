// p_mobj.ts — Map object (thing) management
// Handles spawning, movement, and state management of map objects
// (monsters, items, projectiles, player).

import { FRACBITS, FRACUNIT, MAXPLAYERS, VIEWHEIGHT, WeaponType } from "./doomdef";
import * as doomstat from "./doomstat";
import type { MapObject, MapThing, Thinker, Sector, SubSector, MobjInfo } from "./doomdata";
import { MF_SPECIAL, MF_SOLID, MF_SHOOTABLE, MF_NOSECTOR, MF_NOBLOCKMAP,
	MF_COUNTKILL, MF_COUNTITEM, MF_SPAWNCEILING, MF_NOGRAVITY,
	MF_DROPOFF, MF_FLOAT, MF_MISSILE, MF_CORPSE, MF_SKULLFLY,
	MF_DROPPED, newPlayer } from "./doomdata";
import { P_AddThinker, P_RemoveThinker } from "./p_tick";

// Thing movement -- gravity
const GRAVITY = FRACUNIT;
const FLOATSPEED = FRACUNIT * 4;
const MAXMOVE = 30 * FRACUNIT;
const STOPSPEED = 0x1000;
const FRICTION = 0xe800;

export const ONFLOORZ = 0x7fffffff;
export const ONCEILINGZ = 0x7ffffffe;

export function P_SpawnMobj(x: number, y: number, z: number, type: number): MapObject {
	const { mobjinfo, states, StateNum } = require("./info");
	const info: MobjInfo = mobjinfo[type];

	const st = states[info.spawnstate];

	const mobj: MapObject = {
		thinker: { prev: null, next: null, func: P_MobjThinker },
		x, y, z,
		snext: null, sprev: null,
		angle: 0,
		sprite: st.sprite,
		frame: st.frame,
		bnext: null, bprev: null,
		subsector: null,
		floorz: 0,
		ceilingz: 0,
		radius: info.radius,
		height: info.height,
		momx: 0, momy: 0, momz: 0,
		validcount: 0,
		type,
		info,
		tics: st.tics,
		state: st,
		flags: info.flags,
		health: info.spawnhealth,
		movedir: 0,
		movecount: 0,
		target: null,
		reactiontime: info.reactiontime,
		threshold: 0,
		player: null,
		lastlook: 0,
		spawnpoint: { x: 0, y: 0, angle: 0, type: 0, options: 0 },
		tracer: null,
	};

	// Set position and link into sector/blockmap
	P_SetMobjPosition(mobj);

	mobj.floorz = mobj.subsector?.sector?.floorheight ?? 0;
	mobj.ceilingz = mobj.subsector?.sector?.ceilingheight ?? 0;

	if (z === ONFLOORZ) {
		mobj.z = mobj.floorz;
	} else if (z === ONCEILINGZ) {
		mobj.z = mobj.ceilingz - info.height;
	}

	mobj.thinker.owner = mobj;
	P_AddThinker(mobj.thinker);
	return mobj;
}

export function P_RemoveMobj(mobj: MapObject): void {
	P_UnsetMobjPosition(mobj);
	P_RemoveThinker(mobj.thinker);
}

export function P_SetMobjPosition(mobj: MapObject): void {
	// Link into subsector
	const { R_PointInSubsector } = require("./r_main");
	const subsec = R_PointInSubsector(mobj.x, mobj.y);
	mobj.subsector = subsec;

	// Update floor/ceiling from new sector
	const sec = subsec.sector;
	if (sec) {
		mobj.floorz = sec.floorheight;
		mobj.ceilingz = sec.ceilingheight;
	}

	// Link into sector thing list
	if (!(mobj.flags & MF_NOSECTOR)) {
		const sec = subsec.sector;
		mobj.sprev = null;
		mobj.snext = sec.thinglist;
		if (sec.thinglist) {
			sec.thinglist.sprev = mobj;
		}
		sec.thinglist = mobj;
	}

	// Link into blockmap
	if (!(mobj.flags & MF_NOBLOCKMAP)) {
		const blockx = ((mobj.x - doomstat.bmaporgx) >> FRACBITS) >> 7;
		const blocky = ((mobj.y - doomstat.bmaporgy) >> FRACBITS) >> 7;

		if (blockx >= 0 && blockx < doomstat.bmapwidth &&
			blocky >= 0 && blocky < doomstat.bmapheight) {
			const idx = blocky * doomstat.bmapwidth + blockx;
			mobj.bprev = null;
			mobj.bnext = doomstat.blocklinks[idx]!;
			if (doomstat.blocklinks[idx]) {
				doomstat.blocklinks[idx]!.bprev = mobj;
			}
			doomstat.blocklinks[idx] = mobj;
		}
	}
}

export function P_UnsetMobjPosition(mobj: MapObject): void {
	// Unlink from sector
	if (!(mobj.flags & MF_NOSECTOR)) {
		if (mobj.snext) mobj.snext.sprev = mobj.sprev;
		if (mobj.sprev) {
			mobj.sprev.snext = mobj.snext;
		} else {
			const sec = mobj.subsector?.sector;
			if (sec && sec.thinglist === mobj) {
				sec.thinglist = mobj.snext;
			}
		}
	}

	// Unlink from blockmap
	if (!(mobj.flags & MF_NOBLOCKMAP)) {
		if (mobj.bnext) mobj.bnext.bprev = mobj.bprev;
		if (mobj.bprev) {
			mobj.bprev.bnext = mobj.bnext;
		} else {
			const blockx = ((mobj.x - doomstat.bmaporgx) >> FRACBITS) >> 7;
			const blocky = ((mobj.y - doomstat.bmaporgy) >> FRACBITS) >> 7;
			if (blockx >= 0 && blockx < doomstat.bmapwidth &&
				blocky >= 0 && blocky < doomstat.bmapheight) {
				const idx = blocky * doomstat.bmapwidth + blockx;
				if (doomstat.blocklinks[idx] === mobj) {
					doomstat.blocklinks[idx] = mobj.bnext;
				}
			}
		}
	}
}

export function P_MobjThinker(thinkerOrMobj: any): void {
	// P_RunThinkers passes the thinker object; get the owning mobj
	const mobj: MapObject = thinkerOrMobj.owner ?? thinkerOrMobj;

	// Corpses should not block movement
	const { MF_CORPSE, MF_SOLID, MF_COUNTKILL } = require("./doomdata");
	if (mobj.flags & MF_CORPSE) {
		mobj.flags &= ~MF_SOLID;
	}

	// Ensure monsters acquire a target and enter seestate
	if ((mobj.flags & MF_COUNTKILL) && mobj.health > 0 && !mobj.target) {
		const doomstat = require("./doomstat");
		const player = doomstat.players[doomstat.consoleplayer];
		if (player && player.mo) {
			mobj.target = player.mo;
			if (mobj.info.seestate && mobj.state !== mobj.info.seestate) {
				P_SetMobjState(mobj, mobj.info.seestate);
			}
		}
	}

	// Momentum movement
	if (mobj.momx || mobj.momy) {
		P_XYMovement(mobj);
	}
	if ((mobj.z !== mobj.floorz) || mobj.momz) {
		P_ZMovement(mobj);
	}

	// Cycle through states
	if (mobj.tics !== -1) {
		mobj.tics--;
		if (mobj.tics <= 0) {
			if (!P_SetMobjState(mobj, mobj.state.nextstate)) return;
		}
	} else {
		// Check for nightmare respawn
	}
}

export function P_SetMobjState(mobj: MapObject, statenum: number): boolean {
	const { states, StateNum } = require("./info");

	if (statenum === 0) { // S_NULL
		mobj.state = states[0];
		P_RemoveMobj(mobj);
		return false;
	}

	const st = states[statenum];
	mobj.state = st;
	mobj.tics = st.tics;
	mobj.sprite = st.sprite;
	mobj.frame = st.frame;

	if (st.action) {
		st.action(mobj);
	}

	return true;
}

function P_XYMovement(mobj: MapObject): void {
	if (!mobj.momx && !mobj.momy) {
		if (mobj.flags & MF_SKULLFLY) {
			mobj.flags &= ~MF_SKULLFLY;
			mobj.momx = mobj.momy = mobj.momz = 0;
			P_SetMobjState(mobj, mobj.info.spawnstate);
		}
		return;
	}

	const xmove = mobj.momx;
	const ymove = mobj.momy;

	// Use P_TryMove for collision detection and pickups
	const { P_TryMove } = require("./p_map");
	if (!P_TryMove(mobj, mobj.x + xmove, mobj.y + ymove)) {
		// Movement blocked
		if (mobj.flags & MF_MISSILE) {
			// Explode missile on wall
			P_SetMobjState(mobj, mobj.info.deathstate);
			return;
		}
		mobj.momx = 0;
		mobj.momy = 0;
	}

	// Apply friction for non-missile, non-flying, on-floor objects
	if (!(mobj.flags & (MF_MISSILE | MF_SKULLFLY))) {
		if (mobj.z <= mobj.floorz) {
			if (mobj.flags & MF_CORPSE) {
				if (Math.abs(mobj.momx) < STOPSPEED && Math.abs(mobj.momy) < STOPSPEED) {
					mobj.momx = 0;
					mobj.momy = 0;
					return;
				}
			}
			const { fixedMul } = require("./tables");
			mobj.momx = fixedMul(mobj.momx, FRICTION);
			mobj.momy = fixedMul(mobj.momy, FRICTION);
		}
	}
}

function P_ZMovement(mobj: MapObject): void {
	// Apply gravity
	if (mobj.z > mobj.floorz) {
		if (!(mobj.flags & (MF_NOGRAVITY | MF_FLOAT | MF_MISSILE))) {
			mobj.momz -= GRAVITY;
		}
	}

	mobj.z += mobj.momz;

	// Hit the floor?
	if (mobj.z <= mobj.floorz) {
		mobj.z = mobj.floorz;
		if (mobj.momz < 0) {
			if (mobj.flags & MF_MISSILE) {
				mobj.momz = 0;
				// Explode missile
				const { StateNum } = require("./info");
				P_SetMobjState(mobj, mobj.info.deathstate);
				return;
			}
			mobj.momz = 0;
		}
	}

	// Hit the ceiling?
	if (mobj.z + mobj.height > mobj.ceilingz) {
		mobj.z = mobj.ceilingz - mobj.height;
		if (mobj.momz > 0) {
			mobj.momz = 0;
		}
		if (mobj.flags & MF_MISSILE) {
			const { StateNum } = require("./info");
			P_SetMobjState(mobj, mobj.info.deathstate);
		}
	}
}

export let lastSpawnResult: "spawned" | "filtered" | "unknown" | "ignored" = "ignored";
export let lastSpawnFlags: { countKill: boolean; countItem: boolean } | null = null;

export function P_SpawnMapThing(mt: { x: number; y: number; angle: number; type: number; options: number }): void {
	lastSpawnResult = "ignored";
	lastSpawnFlags = null;
	const { mobjinfo, MobjType } = require("./info");

	// Player starts — handle BEFORE skill filtering
	if (mt.type >= 1 && mt.type <= 4) {
		const { playerstarts } = require("./p_setup");
		playerstarts[mt.type - 1] = mt;
		return;
	}

	// Deathmatch starts
	if (mt.type === 11) {
		const { deathmatchstarts } = require("./p_setup");
		deathmatchstarts.push(mt);
		return;
	}

	// Check spawn flags for skill level
	if (!(mt.options & 1) && !(mt.options & 2) && !(mt.options & 4)) {
		// Treat missing flags as "all skills"
		mt.options |= 1 | 2 | 4;
	}

	// Check skill flags
	if (doomstat.gameskill === 0 || doomstat.gameskill === 1) {
		if (!(mt.options & 1)) { lastSpawnResult = "filtered"; return; }
	} else if (doomstat.gameskill === 2) {
		if (!(mt.options & 2)) { lastSpawnResult = "filtered"; return; }
	} else {
		if (!(mt.options & 4)) { lastSpawnResult = "filtered"; return; }
	}

	// Find mobj type
	let typeIdx = -1;
	for (let i = 0; i < mobjinfo.length; i++) {
		if (mobjinfo[i].doomednum === mt.type) {
			typeIdx = i;
			break;
		}
	}

	if (typeIdx === -1) { lastSpawnResult = "unknown"; return; } // Unknown thing type

	// Spawn the thing
	let z: number;
	if (mobjinfo[typeIdx].flags & MF_SPAWNCEILING) {
		z = ONCEILINGZ;
	} else {
		z = ONFLOORZ;
	}

	const mobj = P_SpawnMobj(
		mt.x << FRACBITS,
		mt.y << FRACBITS,
		z,
		typeIdx
	);

	mobj.spawnpoint = mt;
	mobj.angle = ((mt.angle / 45) | 0) * 0x20000000;

	// Count kills and items
	if (mobj.flags & MF_COUNTKILL) {
		const { incTotalKills } = require("./p_setup");
		incTotalKills();
	}
	if (mobj.flags & MF_COUNTITEM) {
		const { incTotalItems } = require("./p_setup");
		incTotalItems();
	}
	lastSpawnResult = "spawned";
	lastSpawnFlags = {
		countKill: !!(mobj.flags & MF_COUNTKILL),
		countItem: !!(mobj.flags & MF_COUNTITEM),
	};

	// Set random tics for animation
	if (mobj.tics > 0) {
		const { P_Random } = require("./m_misc");
		mobj.tics = 1 + (P_Random() % mobj.tics);
	}

	// Ambush flag
	if (mt.options & 8) {
		mobj.flags |= 32; // MF_AMBUSH
	}
}

export function P_SpawnPlayer(mt: { x: number; y: number; angle: number; type: number; options: number }): void {
	const playernum = mt.type - 1;
	if (playernum < 0 || playernum >= MAXPLAYERS) return;
	if (!doomstat.playeringame[playernum]) return;

	const { MobjType } = require("./info");
	const p = doomstat.players[playernum]!;

	const mobj = P_SpawnMobj(
		mt.x << FRACBITS,
		mt.y << FRACBITS,
		ONFLOORZ,
		0 // MT_PLAYER = 0
	);

	mobj.angle = (((mt.angle / 45) | 0) * 0x20000000) >>> 0;
	mobj.player = p;
	mobj.health = p.health;

	p.mo = mobj;
	p.playerstate = 0; // PST_LIVE
	p.refire = 0;
	p.message = null;
	p.damagecount = 0;
	p.bonuscount = 0;
	p.extralight = 0;
	p.fixedcolormap = 0;
	p.viewheight = VIEWHEIGHT;
	p.viewz = mobj.z + VIEWHEIGHT;

	// Give starting equipment (if not already set by G_PlayerReborn)
	if (!p.weaponowned[WeaponType.Pistol]) {
		p.readyweapon = p.pendingweapon = WeaponType.Pistol;
		p.weaponowned[WeaponType.Fist] = true;
		p.weaponowned[WeaponType.Pistol] = true;
		p.ammo[0] = 50; // AmmoType.Clip
		p.maxammo = [200, 50, 300, 50];
	}

	const { P_SetupPsprites } = require("./p_pspr");
	P_SetupPsprites(p);
}
