// p_inter.ts — Interactions: damage, pickups, kills
import { FRACUNIT, AmmoType, WeaponType } from "./doomdef";
import type { MapObject, Player } from "./doomdata";
import { MF_SHOOTABLE, MF_CORPSE, MF_COUNTKILL, MF_COUNTITEM, MF_DROPPED, MF_SPECIAL, MF_DROPOFF, MF_SOLID } from "./doomdata";
import { P_Random } from "./m_misc";

// Max ammo values
const maxammo = [200, 50, 300, 50]; // clip, shell, cell, misl

function P_GiveAmmo(player: Player, ammo: number, count: number): boolean {
  if (ammo === AmmoType.NoAmmo) return false;
  if (player.ammo[ammo]! >= (player.maxammo?.[ammo] ?? maxammo[ammo]!)) return false;
  player.ammo[ammo] = Math.min(player.ammo[ammo]! + count, player.maxammo?.[ammo] ?? maxammo[ammo]!);
  return true;
}

function P_GiveWeapon(player: Player, weapon: number, dropped: boolean): boolean {
  const { weaponinfo } = require("./p_pspr");
  const wp = weaponinfo[weapon];
  if (!wp) return false;

  let gaveweapon = false;
  let gaveammo = false;

  if (wp.ammo !== AmmoType.NoAmmo) {
    const count = dropped ? 5 : 10;
    gaveammo = P_GiveAmmo(player, wp.ammo, count);
  }

  if (!player.weaponowned[weapon]) {
    gaveweapon = true;
    player.weaponowned[weapon] = true;
    player.pendingweapon = weapon;
  }

  return gaveweapon || gaveammo;
}

function P_GiveBody(player: Player, amount: number): boolean {
  if (player.health >= 200) return false;
  player.health = Math.min(player.health + amount, 200);
  player.mo!.health = player.health;
  return true;
}

function P_GiveArmor(player: Player, armortype: number): boolean {
  const hits = armortype * 100;
  if (player.armorpoints >= hits) return false;
  player.armortype = armortype;
  player.armorpoints = hits;
  return true;
}

export function P_TouchSpecialThing(special: MapObject, toucher: MapObject): void {
  if (!toucher.player) return;
  if (toucher.health <= 0) return;

  const player = toucher.player!;
  const { MobjType } = require("./info");
  let sound = "itemup";
  let picked = false;

  // Identify item by mobj type
  const type = special.type;

  switch (type) {
    // === Health ===
    case MobjType.MT_MISC2: // Stimpack
      picked = P_GiveBody(player, 10);
      break;
    case MobjType.MT_MISC3: // Medikit
      picked = P_GiveBody(player, 25);
      break;
    case MobjType.MT_MISC11: // Soulsphere
      player.health = Math.min(player.health + 100, 200);
      player.mo!.health = player.health;
      picked = true;
      break;

    // === Armor ===
    case MobjType.MT_MISC0: // Green armor
      picked = P_GiveArmor(player, 1);
      break;
    case MobjType.MT_MISC1: // Blue armor
      picked = P_GiveArmor(player, 2);
      break;

    // === Health bonuses ===
    case MobjType.MT_MISC4: // Health bonus
      player.health = Math.min(player.health + 1, 200);
      player.mo!.health = player.health;
      picked = true;
      break;
    case MobjType.MT_MISC5: // Armor bonus
      player.armorpoints = Math.min(player.armorpoints + 1, 200);
      if (!player.armortype) player.armortype = 1;
      picked = true;
      break;

    // === Keys ===
    case MobjType.MT_MISC6: // Blue keycard
    case MobjType.MT_MISC7: // Red keycard
    case MobjType.MT_MISC8: // Yellow keycard
    case MobjType.MT_MISC9: // Blue skull
    case MobjType.MT_MISC10: // Red skull
      // Cards 0-5
      { const cardIdx = type - MobjType.MT_MISC6;
        if (!player.cards) player.cards = [];
        player.cards[cardIdx] = true;
        picked = true;
      }
      break;

    // === Ammo ===
    case MobjType.MT_CLIP: // Clip
      picked = P_GiveAmmo(player, AmmoType.Clip, special.flags & MF_DROPPED ? 5 : 10);
      break;
    case MobjType.MT_MISC17: // Box of bullets
      picked = P_GiveAmmo(player, AmmoType.Clip, 50);
      break;
    case MobjType.MT_MISC22: // 4 shells
      picked = P_GiveAmmo(player, AmmoType.Shell, 4);
      break;
    case MobjType.MT_MISC23: // Box of shells
      picked = P_GiveAmmo(player, AmmoType.Shell, 20);
      break;
    case MobjType.MT_MISC18: // Rocket
      picked = P_GiveAmmo(player, AmmoType.Missile, 1);
      break;
    case MobjType.MT_MISC19: // Box of rockets
      picked = P_GiveAmmo(player, AmmoType.Missile, 5);
      break;
    case MobjType.MT_MISC20: // Cell
      picked = P_GiveAmmo(player, AmmoType.Cell, 20);
      break;
    case MobjType.MT_MISC21: // Cell pack
      picked = P_GiveAmmo(player, AmmoType.Cell, 100);
      break;

    // === Weapons ===
    case MobjType.MT_SHOTGUN:
      picked = P_GiveWeapon(player, WeaponType.Shotgun, !!(special.flags & MF_DROPPED));
      break;
    case MobjType.MT_CHAINGUN:
      picked = P_GiveWeapon(player, WeaponType.Chaingun, false);
      break;
    case MobjType.MT_MISC25: // Rocket launcher
      picked = P_GiveWeapon(player, WeaponType.Missile, false);
      break;
    case MobjType.MT_MISC26: // Plasma
      picked = P_GiveWeapon(player, WeaponType.Plasma, false);
      break;
    case MobjType.MT_MISC27: // BFG
      picked = P_GiveWeapon(player, WeaponType.BFG, false);
      break;
    case MobjType.MT_MISC28: // Chainsaw
      picked = P_GiveWeapon(player, WeaponType.Chainsaw, false);
      break;
    case MobjType.MT_SUPERSHOTGUN:
      picked = P_GiveWeapon(player, WeaponType.SuperShotgun, false);
      break;

    // === Backpack ===
    case MobjType.MT_MISC24:
      if (!player.backpack) {
        player.backpack = true;
        if (player.maxammo) {
          for (let i = 0; i < 4; i++) player.maxammo[i]! *= 2;
        }
      }
      P_GiveAmmo(player, AmmoType.Clip, 10);
      P_GiveAmmo(player, AmmoType.Shell, 4);
      P_GiveAmmo(player, AmmoType.Cell, 20);
      P_GiveAmmo(player, AmmoType.Missile, 1);
      picked = true;
      break;

    // === Powerups ===
    case MobjType.MT_INV: // Invulnerability
    case MobjType.MT_MISC12: // Invulnerability (alt)
    case MobjType.MT_INS: // Partial invisibility
    case MobjType.MT_MISC13: // Berserk
    case MobjType.MT_MISC14: // Light amp goggles
    case MobjType.MT_MISC15: // Computer map
    case MobjType.MT_MISC16: // Rad suit
    case MobjType.MT_MEGA: // Megasphere
      picked = true;
      if (type === MobjType.MT_MEGA) {
        player.health = 200;
        player.mo!.health = 200;
        P_GiveArmor(player, 2);
      }
      if (type === MobjType.MT_MISC13) { // Berserk
        player.health = Math.max(player.health, 100);
        player.mo!.health = player.health;
      }
      break;

    default:
      // Unknown item — pick it up anyway
      picked = true;
      break;
  }

  if (!picked) return;

  // Remove the item
  const { P_RemoveMobj } = require("./p_mobj");
  P_RemoveMobj(special);
  player.bonuscount += 6;

  // Count items
  if (special.flags & MF_COUNTITEM) {
    player.itemcount++;
  }
}

export function P_DamageMobj(target: MapObject, inflictor: MapObject | null, source: MapObject | null, damage: number): void {
  if (!(target.flags & MF_SHOOTABLE)) return;
  if (target.health <= 0) return;

  // Debug: log attacks on the player to identify "invisible" damage sources
  if (target.player) {
    try {
      const srcType = source?.type ?? inflictor?.type ?? -1;
      const srcName = source?.info?.name ?? inflictor?.info?.name ?? "unknown";
      const dx = (source?.x ?? inflictor?.x ?? 0) - target.x;
      const dy = (source?.y ?? inflictor?.y ?? 0) - target.y;
      const dist = Math.hypot(dx / 65536, dy / 65536);
      console.log(`[DMG] player hit by type=${srcType} ${srcName} dmg=${damage} dist=${dist.toFixed(1)}`);
    } catch {}
  }

  // Armor absorption
  if (target.player && target.player.armortype) {
    let saved = 0;
    if (target.player.armortype === 1) {
      saved = (damage / 3) | 0;
    } else {
      saved = (damage / 2) | 0;
    }
    if (saved > 0) {
      if (target.player.armorpoints <= saved) {
        saved = target.player.armorpoints;
        target.player.armortype = 0;
      }
      target.player.armorpoints -= saved;
      damage -= saved;
    }
  }

  // Apply damage
  target.health -= damage;

  if (target.player) {
    if (target.health < 0) target.health = 0;
    target.player.health = target.health;
    target.player.damagecount += damage;
    if (target.player.damagecount > 100) target.player.damagecount = 100;
    target.player.attacker = source ?? null;
  }

  if (target.health <= 0) {
    P_KillMobj(source, target);
    return;
  }

  // Pain state
  const painchance = target.info.painchance;
  if (painchance && P_Random() < painchance) {
    target.flags |= 64; // MF_JUSTHIT
    const { P_SetMobjState } = require("./p_mobj");
    P_SetMobjState(target, target.info.painstate);
  }

  // Set target for retaliation
  target.reactiontime = 0;
  if (source && source !== target && !(source.flags & 0x10000)) {
    target.target = source;
    target.threshold = 100;
  }
}

function P_KillMobj(source: MapObject | null, target: MapObject): void {
  target.flags &= ~(MF_SHOOTABLE | 0x4000 | 0x200000); // ~MF_FLOAT, ~MF_INFLOAT
  target.flags |= MF_CORPSE | MF_DROPOFF;
  target.flags &= ~MF_SOLID;
  target.height = target.height >> 2;

  if (target.player) {
    target.player.playerstate = 1; // PST_DEAD
  }

  if (source && source.player) {
    if (target.flags & MF_COUNTKILL) {
      source.player!.killcount++;
    }
  }

  // Go to death state
  const { P_SetMobjState } = require("./p_mobj");
  if (target.health < -target.info.spawnhealth && target.info.xdeathstate) {
    P_SetMobjState(target, target.info.xdeathstate);
  } else {
    P_SetMobjState(target, target.info.deathstate);
  }

  target.tics = Math.max(1, target.tics - (P_Random() & 3));
}
