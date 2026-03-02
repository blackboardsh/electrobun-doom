// g_game.ts — Game management (input, state transitions, new game, demos)

import { SCREENWIDTH, SCREENHEIGHT, FRACBITS, FRACUNIT, TICRATE,
         GameState, GameAction, Skill, MAXPLAYERS, PlayerState,
         BT_ATTACK, BT_USE, BT_CHANGE, BT_WEAPONMASK, BT_WEAPONSHIFT,
         KEY_RIGHTARROW, KEY_LEFTARROW, KEY_UPARROW, KEY_DOWNARROW,
         KEY_ESCAPE, KEY_ENTER, KEY_TAB, KEY_RSHIFT, KEY_RCTRL, KEY_RALT,
         newTicCmd, WeaponType } from "./doomdef";
import type { TicCmd } from "./doomdef";
import type { DoomEvent } from "./d_main";
import * as doomstat from "./doomstat";

// Input state
const gamekeydown: boolean[] = new Array(256).fill(false);
let turnheld = 0;
let forwardmove = [0x19, 0x32]; // walk, run
let sidemove = [0x18, 0x28];
let angleturn = [640, 1280, 320]; // slow, fast, very slow (for high turnheld)

// Key bindings
let key_right = KEY_RIGHTARROW;
let key_left = KEY_LEFTARROW;
let key_up = KEY_UPARROW;
let key_down = KEY_DOWNARROW;
let key_strafeleft = 0x2c; // comma
let key_straferight = 0x2e; // period
let key_fire = KEY_RCTRL;
let key_use = 0x20; // space
let key_strafe = KEY_RALT;
let key_speed = KEY_RSHIFT;

export function G_BuildTiccmd(cmd: TicCmd): void {
  cmd.forwardmove = 0;
  cmd.sidemove = 0;
  cmd.angleturn = 0;
  cmd.buttons = 0;

  const speed = gamekeydown[key_speed] ? 1 : 0;
  const strafe = gamekeydown[key_strafe];

  // Turn
  if (strafe) {
    if (gamekeydown[key_right]) cmd.sidemove += sidemove[speed]!;
    if (gamekeydown[key_left]) cmd.sidemove -= sidemove[speed]!;
  } else {
    if (gamekeydown[key_right]) {
      cmd.angleturn -= angleturn[speed]!;
    }
    if (gamekeydown[key_left]) {
      cmd.angleturn += angleturn[speed]!;
    }
  }

  // Forward/backward
  if (gamekeydown[key_up]) cmd.forwardmove += forwardmove[speed]!;
  if (gamekeydown[key_down]) cmd.forwardmove -= forwardmove[speed]!;

  // Strafe
  if (gamekeydown[key_strafeleft]) cmd.sidemove -= sidemove[speed]!;
  if (gamekeydown[key_straferight]) cmd.sidemove += sidemove[speed]!;

  // Fire
  if (gamekeydown[key_fire]) cmd.buttons |= BT_ATTACK;

  // Use
  if (gamekeydown[key_use]) cmd.buttons |= BT_USE;

  // Weapon switching (number keys)
  for (let i = 0; i < 9; i++) {
    if (gamekeydown[49 + i]) { // '1' to '9'
      cmd.buttons |= BT_CHANGE;
      cmd.buttons |= (i << BT_WEAPONSHIFT) & BT_WEAPONMASK;
      break;
    }
  }

  // Clamp
  cmd.forwardmove = Math.max(-127, Math.min(127, cmd.forwardmove));
  cmd.sidemove = Math.max(-127, Math.min(127, cmd.sidemove));
}

export function G_Responder(ev: DoomEvent): boolean {
  if (ev.type === "keydown") {
    if (ev.key < 256) gamekeydown[ev.key] = true;
    return true;
  } else if (ev.type === "keyup") {
    if (ev.key < 256) gamekeydown[ev.key] = false;
    return true;
  }
  return false;
}

export function G_Ticker(): void {
  // Check for game actions
  if (doomstat.gameaction !== GameAction.Nothing) {
    switch (doomstat.gameaction) {
      case GameAction.LoadLevel:
        G_DoLoadLevel();
        break;
      case GameAction.NewGame:
        G_DoNewGame();
        break;
      case GameAction.Completed:
        G_DoCompleted();
        break;
      case GameAction.WorldDone:
        G_DoWorldDone();
        break;
    }
    doomstat.setGameAction(GameAction.Nothing);
  }

  // Run game tic based on state
  switch (doomstat.gamestate) {
    case GameState.Level:
      // Build ticcmd for local player
      const player = doomstat.players[doomstat.consoleplayer]!;
      G_BuildTiccmd(player.cmd);

      // Run player thinking
      G_PlayerThink(player);

      // Run thinkers (enemies, projectiles, etc.)
      const { P_Ticker } = require("./p_tick");
      P_Ticker();

      // Update status bar
      const { ST_Ticker } = require("./st_stuff");
      ST_Ticker();

      // Update HUD
      const { HU_Ticker } = require("./hu_stuff");
      HU_Ticker();

      doomstat.incLevelTime();
      break;

    case GameState.Intermission:
      const { WI_Ticker } = require("./wi_stuff");
      WI_Ticker();
      break;

    case GameState.Finale:
      const { F_Ticker } = require("./f_finale");
      F_Ticker();
      break;

    case GameState.DemoScreen:
      // D_PageTicker
      break;
  }
}

function G_PlayerThink(player: any): void {
  if (!player.mo) return;

  const cmd = player.cmd;
  const mo = player.mo;

  // Process movement — P_Thrust equivalent
  // Original Doom: P_Thrust(player, angle, cmd->forwardmove * 2048)
  // P_Thrust uses FixedMul(move, finecosine[angle])
  if (cmd.forwardmove) {
    const { finesine, finecosine, fixedMul, FINEMASK } = require("./tables");
    const angle = (mo.angle >>> 19) & FINEMASK;
    const thrust = cmd.forwardmove * 2048;
    mo.momx += fixedMul(thrust, finecosine[angle]);
    mo.momy += fixedMul(thrust, finesine[angle]);
  }

  if (cmd.sidemove) {
    const { finesine, finecosine, fixedMul, FINEMASK, ANG90 } = require("./tables");
    const angle = ((mo.angle - ANG90) >>> 19) & FINEMASK;
    const thrust = cmd.sidemove * 2048;
    mo.momx += fixedMul(thrust, finecosine[angle]);
    mo.momy += fixedMul(thrust, finesine[angle]);
  }

  // Turn
  if (cmd.angleturn) {
    mo.angle = (mo.angle + (cmd.angleturn << 16)) >>> 0;
  }

  // Update viewz (eye height)
  P_CalcHeight(player);

  // Use button
  if (cmd.buttons & BT_USE) {
    if (!player.usedown) {
      try { console.log("[INPUT] use"); } catch {}
      const { P_UseLines } = require("./p_map");
      P_UseLines(player);
      player.usedown = 1;
    }
  } else {
    player.usedown = 0;
  }

  // Weapon switch
  if (cmd.buttons & BT_CHANGE) {
    let newweapon = (cmd.buttons & BT_WEAPONMASK) >> BT_WEAPONSHIFT;
    // Doom behavior: key 1 selects chainsaw if owned, otherwise fist
    if (newweapon === WeaponType.Fist && player.weaponowned[WeaponType.Chainsaw]) {
      newweapon = WeaponType.Chainsaw;
    }
    if (
      player.weaponowned[newweapon] &&
      newweapon !== player.readyweapon &&
      newweapon !== player.pendingweapon
    ) {
      player.pendingweapon = newweapon;
    }
  }

  // Advance weapon sprites (handles fire button via A_WeaponReady)
  const { P_MovePsprites } = require("./p_pspr");
  P_MovePsprites(player);
}

function P_CalcHeight(player: any): void {
  if (!player.mo) return;

  const mo = player.mo;
  const { fixedMul, finesine, FINEANGLES, FINEMASK } = require("./tables");

  // Calculate bob magnitude — FixedMul(momx,momx) + FixedMul(momy,momy)
  const rawBob = fixedMul(mo.momx, mo.momx) + fixedMul(mo.momy, mo.momy);
  player.bob = Math.min(rawBob >> 2, 16 * FRACUNIT);

  // Apply sine wave oscillation (original Doom: FINEANGLES/20 * leveltime)
  const angle = (((FINEANGLES / 20) * doomstat.leveltime) | 0) & FINEMASK;
  const bob = fixedMul(player.bob >> 1, finesine[angle]);

  player.viewz = mo.z + player.viewheight + bob;

  if (player.viewz > mo.ceilingz - 4 * FRACUNIT) {
    player.viewz = mo.ceilingz - 4 * FRACUNIT;
  }
}

export function G_InitNew(skill: Skill, episode: number, map: number): void {
  doomstat.setGameSkill(skill);
  doomstat.setGameEpisode(episode);
  doomstat.setGameMap(map);
  doomstat.setDemoPlayback(false);
  doomstat.setDemoRecording(false);
  doomstat.setPaused(false);
  doomstat.setGameAction(GameAction.Nothing);

  // Initialize players
  for (let i = 0; i < MAXPLAYERS; i++) {
    const player = doomstat.players[i]!;
    player.playerstate = 0;  // PST_LIVE
    player.didsecret = false;
  }

  doomstat.setUserGame(true);
  doomstat.setGameAction(GameAction.LoadLevel);
}

function G_DoNewGame(): void {
  G_InitNew(doomstat.gameskill, doomstat.gameepisode, doomstat.gamemap);
}

function G_DoLoadLevel(): void {
  doomstat.setGameState(GameState.Level);

  // Reset player data
  for (let i = 0; i < MAXPLAYERS; i++) {
    if (!doomstat.playeringame[i]) continue;
    const player = doomstat.players[i]!;
    if (player.playerstate === 2) { // PST_REBORN
      G_PlayerReborn(i);
    }
  }

  // Load the level
  const { P_SetupLevel } = require("./p_setup");
  P_SetupLevel(doomstat.gameepisode, doomstat.gamemap, doomstat.gameskill);

  // Spawn players at start positions
  const p_setup = require("./p_setup");
  const { P_SpawnPlayer } = require("./p_mobj");

  for (let i = 0; i < MAXPLAYERS; i++) {
    if (doomstat.playeringame[i] && p_setup.playerstarts[i]) {
      P_SpawnPlayer(p_setup.playerstarts[i]);
    }
  }

  doomstat.setViewActive(true);

  // Start level music
  const { S_Start } = require("./s_sound");
  S_Start();

}

function G_PlayerReborn(playerNum: number): void {
  const p = doomstat.players[playerNum]!;
  const frags = [...p.frags];
  const killcount = p.killcount;
  const itemcount = p.itemcount;
  const secretcount = p.secretcount;

  // Reset player
  Object.assign(p, require("./doomdata").newPlayer());
  p.frags = frags;
  p.killcount = killcount;
  p.itemcount = itemcount;
  p.secretcount = secretcount;

  // Give starting weapon
  p.readyweapon = p.pendingweapon = WeaponType.Pistol;
  p.weaponowned[WeaponType.Fist] = true;
  p.weaponowned[WeaponType.Pistol] = true;
  p.ammo[0] = 50; // AmmoType.Clip
  p.maxammo = [200, 50, 300, 50];
}

function G_DoCompleted(): void {
  doomstat.setGameAction(GameAction.Nothing);
  doomstat.setGameState(GameState.Intermission);
  // WI_Start would be called here
}

function G_DoWorldDone(): void {
  doomstat.setGameState(GameState.Level);
  doomstat.setGameMap(doomstat.gamemap + 1);
  G_DoLoadLevel();
}

export function G_ExitLevel(): void {
  doomstat.setGameAction(GameAction.Completed);
}

export function G_SecretExitLevel(): void {
  doomstat.setGameAction(GameAction.Completed);
}
