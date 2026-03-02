// p_pspr.ts — Player weapon sprites
import type { Player, MapObject, PSpDef } from "./doomdata";
import { FRACUNIT, FRACBITS, WeaponType, AmmoType, BT_ATTACK } from "./doomdef";
import { StateNum } from "./info";

export const WEAPONTOP = 32 * FRACUNIT;
export const WEAPONBOTTOM = 128 * FRACUNIT;
const LOWERSPEED = 6 * FRACUNIT;
const RAISESPEED = 6 * FRACUNIT;

// weaponinfo[weapon] = { ammo, upstate, downstate, readystate, atkstate, flashstate }
export const weaponinfo = [
  /* Fist */         { ammo: AmmoType.NoAmmo,  upstate: StateNum.S_PUNCHUP,   downstate: StateNum.S_PUNCHDOWN,   readystate: StateNum.S_PUNCH,   atkstate: StateNum.S_PUNCH1,   flashstate: StateNum.S_NULL },
  /* Pistol */       { ammo: AmmoType.Clip,    upstate: StateNum.S_PISTOLUP,  downstate: StateNum.S_PISTOLDOWN,  readystate: StateNum.S_PISTOL,  atkstate: StateNum.S_PISTOL1,  flashstate: StateNum.S_PISTOLFLASH },
  /* Shotgun */      { ammo: AmmoType.Shell,   upstate: StateNum.S_SGUNUP,    downstate: StateNum.S_SGUNDOWN,    readystate: StateNum.S_SGUN,    atkstate: StateNum.S_SGUN1,    flashstate: StateNum.S_SGUNFLASH1 },
  /* Chaingun */     { ammo: AmmoType.Clip,    upstate: StateNum.S_CHAINUP,   downstate: StateNum.S_CHAINDOWN,   readystate: StateNum.S_CHAIN,   atkstate: StateNum.S_CHAIN1,   flashstate: StateNum.S_CHAINFLASH1 },
  /* Missile */      { ammo: AmmoType.Missile, upstate: StateNum.S_MISSILEUP, downstate: StateNum.S_MISSILEDOWN, readystate: StateNum.S_MISSILE, atkstate: StateNum.S_MISSILE1, flashstate: StateNum.S_MISSILEFLASH1 },
  /* Plasma */       { ammo: AmmoType.Cell,    upstate: StateNum.S_PLASMAUP,  downstate: StateNum.S_PLASMADOWN,  readystate: StateNum.S_PLASMA,  atkstate: StateNum.S_PLASMA1,  flashstate: StateNum.S_PLASMAFLASH1 },
  /* BFG */          { ammo: AmmoType.Cell,    upstate: StateNum.S_BFGUP,     downstate: StateNum.S_BFGDOWN,     readystate: StateNum.S_BFG,     atkstate: StateNum.S_BFG1,     flashstate: StateNum.S_NULL },
  /* Chainsaw */     { ammo: AmmoType.NoAmmo,  upstate: StateNum.S_SAWUP,     downstate: StateNum.S_SAWDOWN,     readystate: StateNum.S_SAW,     atkstate: StateNum.S_SAW1,     flashstate: StateNum.S_NULL },
  /* SuperShotgun */ { ammo: AmmoType.Shell,   upstate: StateNum.S_DSGUNUP,   downstate: StateNum.S_DSGUNDOWN,   readystate: StateNum.S_DSGUN,   atkstate: StateNum.S_DSGUN1,   flashstate: StateNum.S_DSGUNFLASH1 },
];

export function P_SetPsprite(player: Player, position: number, stnum: number): void {
  const { states } = require("./info");
  let st = stnum;

  while (true) {
    const psp = player.psprites[position]!;
    if (st === 0) { // S_NULL
      psp.state = null;
      return;
    }

    const state = states[st];
    psp.state = state;
    psp.tics = state.tics;

    if (state.misc1) {
      psp.sx = state.misc1 << FRACBITS;
    }
    if (state.misc2) {
      psp.sy = state.misc2 << FRACBITS;
    } else if (position === 1) {
      // Align muzzle flash to the current weapon sprite if no explicit Y is set
      const weaponPsp = player.psprites[0];
      psp.sy = weaponPsp?.sy ?? WEAPONTOP;
    }

    // Call action function
    if (state.action) {
      state.action(player, psp);
      if (!psp.state) return; // action cleared the state
    }

    // If tics is 0, immediately transition to next state
    if (psp.tics === 0) {
      st = state.nextstate;
      continue;
    }
    break;
  }
}

export function P_SetupPsprites(player: Player): void {
  player.psprites[0]!.state = null;
  player.psprites[0]!.tics = 0;
  player.psprites[0]!.sx = FRACUNIT;
  player.psprites[0]!.sy = WEAPONTOP;
  player.psprites[1]!.state = null;
  player.psprites[1]!.tics = 0;
  player.psprites[1]!.sy = WEAPONTOP;

  P_BringUpWeapon(player);
}

export function P_BringUpWeapon(player: Player): void {
  if (player.pendingweapon === WeaponType.NoChange) {
    player.pendingweapon = player.readyweapon;
  }

  const wp = weaponinfo[player.pendingweapon];
  if (!wp) return;

  player.readyweapon = player.pendingweapon;
  player.pendingweapon = WeaponType.NoChange;
  player.psprites[0]!.sy = WEAPONTOP;

  P_SetPsprite(player, 0, wp.readystate);
}

export function P_MovePsprites(player: Player): void {
  for (let i = 0; i < 2; i++) {
    const psp = player.psprites[i]!;
    if (!psp.state) continue;

    // Call action if tics is 0 (immediate)
    if (psp.tics !== -1) {
      psp.tics--;
      if (psp.tics <= 0) {
        P_SetPsprite(player, i, psp.state.nextstate);
      }
    }
  }
}

// Check if player has enough ammo to fire current weapon
function P_CheckAmmo(player: Player): boolean {
  const wp = weaponinfo[player.readyweapon];
  if (!wp) return false;

  if (wp.ammo === AmmoType.NoAmmo) return true;

  const count = wp.ammo === AmmoType.Shell && player.readyweapon === WeaponType.SuperShotgun ? 2 : 1;
  if (player.ammo[wp.ammo]! >= count) return true;

  // Out of ammo — switch to another weapon
  // Try weapons in order of preference
  const prefs = [WeaponType.Plasma, WeaponType.SuperShotgun, WeaponType.Chaingun, WeaponType.Shotgun, WeaponType.Pistol, WeaponType.Fist, WeaponType.Chainsaw];
  for (const w of prefs) {
    if (!player.weaponowned[w]) continue;
    const wi = weaponinfo[w];
    if (!wi) continue;
    if (wi.ammo === AmmoType.NoAmmo || player.ammo[wi.ammo]! > 0) {
      player.pendingweapon = w;
      break;
    }
  }

  P_SetPsprite(player, 0, weaponinfo[player.readyweapon]!.downstate);
  return false;
}

// === Weapon action functions ===

export function A_WeaponReady(player: Player, psp: PSpDef): void {
  // Check for weapon change
  if (player.pendingweapon !== WeaponType.NoChange || !player.health) {
    P_SetPsprite(player, 0, weaponinfo[player.readyweapon]!.downstate);
    return;
  }

  // Check for fire
  if (player.cmd.buttons & BT_ATTACK) {
    if (!P_CheckAmmo(player)) return;
    player.attackdown++;
    P_SetPsprite(player, 0, weaponinfo[player.readyweapon]!.atkstate);
    return;
  }

  if (player.attackdown) {
    player.attackdown = 0;
  }

  // Bob the weapon
  const { finesine, FINEANGLES, FINEMASK, fixedMul } = require("./tables");
  const angle = (((FINEANGLES / 70) * (require("./doomstat").leveltime)) | 0) & FINEMASK;
  psp.sx = FRACUNIT + fixedMul(player.bob, finesine[angle]);
  const angle2 = (angle & (FINEANGLES / 2 - 1));
  psp.sy = WEAPONTOP + fixedMul(player.bob, finesine[angle2]);
}

export function A_Lower(player: Player, psp: PSpDef): void {
  psp.sy += LOWERSPEED;

  // Is already down?
  if (player.playerstate === 1) { // PST_DEAD
    psp.sy = WEAPONBOTTOM;
    return;
  }

  if (psp.sy < WEAPONBOTTOM) return;

  if (player.playerstate === 1) { // PST_DEAD
    psp.sy = WEAPONBOTTOM;
    return;
  }

  // Player is alive — raise new weapon
  player.readyweapon = player.pendingweapon;
  player.pendingweapon = WeaponType.NoChange;
  P_BringUpWeapon(player);
}

export function A_Raise(player: Player, psp: PSpDef): void {
  psp.sy -= RAISESPEED;
  if (psp.sy > WEAPONTOP) return;

  psp.sy = WEAPONTOP;
  P_SetPsprite(player, 0, weaponinfo[player.readyweapon]!.readystate);
}

export function A_GunFlash(player: Player, psp: PSpDef): void {
  // Set player mobj to attack frame
  if (player.mo) {
    const { P_SetMobjState } = require("./p_mobj");
    const { StateNum: SN } = require("./info");
    P_SetMobjState(player.mo, SN.S_PLAY_ATK2);
  }

  P_SetPsprite(player, 1, weaponinfo[player.readyweapon]!.flashstate);
}

export function A_FirePistol(player: Player, psp: PSpDef): void {
  const wp = weaponinfo[player.readyweapon]!;
  if (wp.ammo !== AmmoType.NoAmmo) {
    player.ammo[wp.ammo]!--;
  }

  // Set player mobj to attack frame
  if (player.mo) {
    const { P_SetMobjState } = require("./p_mobj");
    const { StateNum: SN } = require("./info");
    P_SetMobjState(player.mo, SN.S_PLAY_ATK2);
  }

  P_SetPsprite(player, 1, wp.flashstate);

  // Hitscan attack
  P_GunShot(player.mo!, !player.refire);
}

export function A_FireShotgun(player: Player, psp: PSpDef): void {
  const wp = weaponinfo[player.readyweapon]!;
  if (wp.ammo !== AmmoType.NoAmmo) {
    player.ammo[wp.ammo]!--;
  }

  if (player.mo) {
    const { P_SetMobjState } = require("./p_mobj");
    const { StateNum: SN } = require("./info");
    P_SetMobjState(player.mo, SN.S_PLAY_ATK2);
  }

  P_SetPsprite(player, 1, wp.flashstate);

  // 7 pellets
  const { P_BulletSlope, P_LineAttack } = require("./p_map");
  const { ANG90, ANG45 } = require("./tables");
  const { P_Random } = require("./m_misc");
  const slope = P_BulletSlope(player.mo!);
  for (let i = 0; i < 7; i++) {
    const damage = 5 * ((P_Random() % 3) + 1);
    let angle = (player.mo!.angle + (((P_Random() - P_Random()) * 0x400000) | 0)) >>> 0;
    P_LineAttack(player.mo!, angle, 16 * 64 * FRACUNIT, slope, damage);
  }
}

export function A_FireCGun(player: Player, psp: PSpDef): void {
  const wp = weaponinfo[player.readyweapon]!;
  if (wp.ammo !== AmmoType.NoAmmo) {
    if (player.ammo[wp.ammo]! <= 0) return;
    player.ammo[wp.ammo]!--;
  }

  if (player.mo) {
    const { P_SetMobjState } = require("./p_mobj");
    const { StateNum: SN } = require("./info");
    P_SetMobjState(player.mo, SN.S_PLAY_ATK2);
  }

  P_SetPsprite(player, 1, wp.flashstate);
  P_GunShot(player.mo!, !player.refire);
}

export function A_FireMissile(player: Player, psp: PSpDef): void {
  const wp = weaponinfo[player.readyweapon]!;
  if (wp.ammo !== AmmoType.NoAmmo) {
    player.ammo[wp.ammo]!--;
  }
  // Simplified — just spawn a puff at some distance
  // Full implementation would spawn a missile mobj
}

export function A_FirePlasma(player: Player, psp: PSpDef): void {
  const wp = weaponinfo[player.readyweapon]!;
  if (wp.ammo !== AmmoType.NoAmmo) {
    player.ammo[wp.ammo]!--;
  }

  // Set flash to random flash state
  const { P_Random } = require("./m_misc");
  const { StateNum: SN } = require("./info");
  P_SetPsprite(player, 1, wp.flashstate + (P_Random() & 1));
}

export function A_FireBFG(player: Player, psp: PSpDef): void {
  const wp = weaponinfo[player.readyweapon]!;
  if (wp.ammo !== AmmoType.NoAmmo) {
    player.ammo[wp.ammo] = Math.max(0, player.ammo[wp.ammo]! - 40);
  }
}

export function A_Punch(player: Player, psp: PSpDef): void {
  const { P_Random } = require("./m_misc");
  let damage = ((P_Random() % 10) + 1) * 2;

  // Berserk doubles punch damage
  if (player.powers && player.powers[0]) { // pw_strength
    damage *= 10;
  }

  const { ANG90 } = require("./tables");
  const angle = (player.mo!.angle + (((P_Random() - P_Random()) << 18) | 0)) >>> 0;
  const { P_AimLineAttack, P_LineAttack, linetarget } = require("./p_map");
  const slope = P_AimLineAttack(player.mo!, angle, 64 * FRACUNIT);
  P_LineAttack(player.mo!, angle, 64 * FRACUNIT, slope, damage);

  // Turn to face target
  const lt = require("./p_map").linetarget;
  if (lt) {
    const { pointToAngle2 } = require("./tables");
    player.mo!.angle = pointToAngle2(player.mo!.x, player.mo!.y, lt.x, lt.y);
  }
}

export function A_Saw(player: Player, psp: PSpDef): void {
  const { P_Random } = require("./m_misc");
  const damage = 2 * ((P_Random() % 10) + 1);
  const angle = (player.mo!.angle + (((P_Random() - P_Random()) << 18) | 0)) >>> 0;

  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(player.mo!, angle, 64 * FRACUNIT + 1);
  P_LineAttack(player.mo!, angle, 64 * FRACUNIT + 1, slope, damage);
}

export function A_ReFire(player: Player, psp: PSpDef): void {
  // Check if the fire button is still held and ammo is available
  if ((player.cmd.buttons & BT_ATTACK) && player.playerstate !== 1 && P_CheckAmmo(player)) {
    player.refire++;
    P_SetPsprite(player, 0, weaponinfo[player.readyweapon]!.atkstate);
  } else {
    player.refire = 0;
    P_SetPsprite(player, 0, weaponinfo[player.readyweapon]!.readystate);
  }
}

export function A_Light0(player: Player, psp: PSpDef): void { player.extralight = 0; }
export function A_Light1(player: Player, psp: PSpDef): void { player.extralight = 1; }
export function A_Light2(player: Player, psp: PSpDef): void { player.extralight = 2; }

// Internal helper: fire a single bullet with optional accuracy
function P_GunShot(mo: MapObject, accurate: boolean): void {
  const { P_Random } = require("./m_misc");
  const damage = 5 * ((P_Random() % 3) + 1);

  let angle = mo.angle;
  if (!accurate) {
    angle = (angle + (((P_Random() - P_Random()) << 18) | 0)) >>> 0;
  }

  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(mo, angle, 16 * 64 * FRACUNIT);
  P_LineAttack(mo, angle, 16 * 64 * FRACUNIT, slope, damage);
}
