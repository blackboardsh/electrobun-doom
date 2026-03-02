// d_main.ts — Game initialization and main loop entry

import { SCREENWIDTH, SCREENHEIGHT, GameMode, GameState, GameAction, Skill, TICRATE, VERSION } from "./doomdef";
import * as doomstat from "./doomstat";
import { I_GetTime } from "./i_system";
import { W_InitFromFile } from "./w_wad";

// Event queue for keyboard input
export interface DoomEvent {
  type: "keydown" | "keyup";
  key: number; // Doom keycode
}

const eventQueue: DoomEvent[] = [];

export function D_PostEvent(event: DoomEvent): void {
  eventQueue.push(event);
}

// Process all pending events
function D_ProcessEvents(): void {
  while (eventQueue.length > 0) {
    const ev = eventQueue.shift()!;

    // Menu gets first crack
    const { M_Responder } = require("./m_menu");
    if (M_Responder(ev)) continue;

    // Then game
    const { G_Responder } = require("./g_game");
    G_Responder(ev);
  }
}

// Main loop tick
export function D_DoomLoop_Tick(): void {
  // Process events
  D_ProcessEvents();

  // Run game tic
  const { G_Ticker } = require("./g_game");
  G_Ticker();
  doomstat.incGameTic();

  // Render
  D_Display();
}

function D_Display(): void {
  if (doomstat.nodrawers) return;

  switch (doomstat.gamestate) {
    case GameState.Level:
      if (doomstat.viewactive) {
        const { R_RenderPlayerView } = require("./r_main");
        R_RenderPlayerView(doomstat.players[doomstat.displayplayer]!);
      }

      // Draw status bar
      const { ST_Drawer } = require("./st_stuff");
      ST_Drawer();

      // Draw HUD
      const { HU_Drawer } = require("./hu_stuff");
      HU_Drawer();
      break;

    case GameState.Intermission:
      const { WI_Drawer } = require("./wi_stuff");
      WI_Drawer();
      break;

    case GameState.Finale:
      const { F_Drawer } = require("./f_finale");
      F_Drawer();
      break;

    case GameState.DemoScreen:
      D_PageDrawer();
      break;
  }

  // Draw menu on top
  const { M_Drawer } = require("./m_menu");
  M_Drawer();
}

let pageName: string = "";
let pageTic: number = -1;

function D_PageDrawer(): void {
  if (pageName) {
    try {
      const { V_DrawPatch, W_CachePatchName } = require("./v_video");
      const patch = W_CachePatchName(pageName);
      V_DrawPatch(0, 0, 0, patch);
    } catch {
      // Patch not found — fill with black
      const { screens } = require("./v_video");
      screens[0].fill(0);
    }
  }
}

export function D_StartTitle(): void {
  doomstat.setGameAction(GameAction.Nothing);
  doomstat.setGameState(GameState.DemoScreen);
  pageName = "TITLEPIC";
  pageTic = 170; // about 5 seconds
}

// Identify game mode from WAD
function D_IdentifyVersion(): void {
  const { W_CheckNumForName } = require("./w_wad");

  if (W_CheckNumForName("MAP01") !== -1) {
    doomstat.setGameMode(GameMode.Commercial);
    doomstat.setGameMission(1); // GameMission.Doom2
  } else if (W_CheckNumForName("E1M1") !== -1) {
    if (W_CheckNumForName("E4M1") !== -1) {
      doomstat.setGameMode(GameMode.Retail);
    } else if (W_CheckNumForName("E2M1") !== -1) {
      doomstat.setGameMode(GameMode.Registered);
    } else {
      doomstat.setGameMode(GameMode.Shareware);
    }
    doomstat.setGameMission(0); // GameMission.Doom
  } else {
    // Assume shareware / freedoom
    doomstat.setGameMode(GameMode.Shareware);
    doomstat.setGameMission(0);
  }
}

// Full initialization
export async function D_DoomMain(wadPath: string): Promise<void> {
  console.log("D_DoomMain: Starting DOOM engine...");

  // Load WAD
  await W_InitFromFile(wadPath);

  // Identify game version
  D_IdentifyVersion();
  console.log(`Game mode: ${doomstat.gamemode}`);

  // Initialize renderer
  console.log("R_Init: Init rendering...");
  const { R_Init, R_SetupLightTables } = require("./r_main");
  R_Init();
  R_SetupLightTables();

  // Set palette
  const { V_SetPalette } = require("./v_video");
  V_SetPalette(0);

  // Initialize game
  console.log("P_Init: Init game logic...");
  const { P_PatchActions } = require("./info");
  P_PatchActions();

  // Initialize menu
  const { M_Init } = require("./m_menu");
  M_Init();

  // Initialize status bar
  const { ST_Init } = require("./st_stuff");
  ST_Init();

  // Initialize HUD
  const { HU_Init } = require("./hu_stuff");
  HU_Init();

  // Initialize sound (stub)
  const { S_Init } = require("./s_sound");
  S_Init(8, 8);

  // Set console player
  doomstat.setConsoleplayer(0);
  doomstat.setDisplayplayer(0);
  doomstat.playeringame[0] = true;

  console.log("D_DoomMain: Initialization complete.");
}

// Start a new game directly (called from launcher)
export function D_StartGame(episode: number, map: number, skill: Skill): void {
  const { G_InitNew } = require("./g_game");
  G_InitNew(skill, episode, map);
}
