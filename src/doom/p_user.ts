// p_user.ts — Player movement (simplified)
import { FRACBITS, FRACUNIT, VIEWHEIGHT } from "./doomdef";
import type { Player, MapObject } from "./doomdata";

const MAXBOB = 0x100000; // 16 pixels

export function P_PlayerThink(player: Player): void {
  // Most movement is handled in g_game.ts G_PlayerThink
  // This handles additional player state

  if (!player.mo) return;

  // Counters
  if (player.bonuscount) player.bonuscount--;
  if (player.damagecount) player.damagecount--;

  // Powers countdown
  for (let i = 0; i < player.powers.length; i++) {
    if (player.powers[i]! > 0) player.powers[i]!--;
  }

  // Fixed colormap (invulnerability, light amp)
  if (player.powers[0]! > 0) { // Invulnerability
    player.fixedcolormap = 32;
  } else if (player.powers[5]! > 0) { // Infrared
    player.fixedcolormap = 1;
  } else {
    player.fixedcolormap = 0;
  }
}

export function P_CalcHeight(player: Player): void {
  if (!player.mo) return;

  const mo = player.mo;

  // Regular movement bobbing
  player.bob = Math.min(
    ((mo.momx >> 8) * (mo.momx >> 8) + (mo.momy >> 8) * (mo.momy >> 8)) >> 2,
    MAXBOB
  );

  player.viewz = mo.z + player.viewheight + ((player.bob / 2) | 0);

  if (player.viewz > mo.ceilingz - 4 * FRACUNIT) {
    player.viewz = mo.ceilingz - 4 * FRACUNIT;
  }
}

export function P_MovePlayer(player: Player): void {
  // Movement is applied in g_game.ts via ticcmd momentum
}

export function P_DeathThink(player: Player): void {
  // Death animation handling
}
