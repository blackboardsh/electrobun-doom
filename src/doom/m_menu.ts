// m_menu.ts — Menu system (simplified)
import { KEY_ESCAPE, KEY_ENTER, KEY_UPARROW, KEY_DOWNARROW, GameState, Skill } from "./doomdef";
import * as doomstat from "./doomstat";
import type { DoomEvent } from "./d_main";
import { screens } from "./v_video";
import { SCREENWIDTH, SCREENHEIGHT } from "./doomdef";

let menuActive = false;
let menuItem = 0;
const menuItems = ["New Game", "Options", "Quit"];
let inNewGameMenu = false;
let episodeChoice = 1;
let skillChoice = 2;
let fontLoaded = false;
const fontPatches: Map<number, any> = new Map();

function ensureFont(): void {
  if (fontLoaded) return;
  try {
    const { W_CachePatchName } = require("./v_video");
    // Doom menu font patches: STCFNxxx for ASCII codes 33..90+
    for (let code = 33; code <= 90; code++) {
      const name = `STCFN${code.toString().padStart(3, "0")}`;
      try {
        fontPatches.set(code, W_CachePatchName(name));
      } catch {
        // skip missing glyphs
      }
    }
    fontLoaded = true;
  } catch {
    // Ignore if WAD not ready yet
  }
}

export function M_Init(): void {
  menuActive = false;
}

export function M_Responder(ev: DoomEvent): boolean {
  if (ev.type !== "keydown") return false;

  if (ev.key === KEY_ESCAPE) {
    if (menuActive) {
      if (inNewGameMenu) {
        inNewGameMenu = false;
        return true;
      }
      menuActive = false;
      doomstat.setMenuActive(false);
    } else {
      menuActive = true;
      doomstat.setMenuActive(true);
      menuItem = 0;
    }
    return true;
  }

  if (!menuActive) return false;

  switch (ev.key) {
    case KEY_UPARROW:
      menuItem = (menuItem - 1 + menuItems.length) % menuItems.length;
      return true;
    case KEY_DOWNARROW:
      menuItem = (menuItem + 1) % menuItems.length;
      return true;
    case KEY_ENTER:
      if (inNewGameMenu) {
        // Start game
        const { D_StartGame } = require("./d_main");
        D_StartGame(episodeChoice, 1, skillChoice as Skill);
        menuActive = false;
        doomstat.setMenuActive(false);
        inNewGameMenu = false;
        return true;
      }
      if (menuItem === 0) {
        // New Game
        inNewGameMenu = true;
        return true;
      }
      if (menuItem === 2) {
        // Quit
        process.exit(0);
      }
      return true;
  }

  return false;
}

export function M_Drawer(): void {
  if (!menuActive) return;

  const dest = screens[0]!;
  ensureFont();

  if (inNewGameMenu) {
    // Draw "Press ENTER to start E1M1"
    drawMenuText(80, 80, "PRESS ENTER TO START", dest);
    return;
  }

  // Draw menu items
  for (let i = 0; i < menuItems.length; i++) {
    const y = 60 + i * 20;
    const prefix = i === menuItem ? "> " : "  ";
    drawMenuText(80, y, prefix + menuItems[i]!, dest);
  }
}

function drawMenuText(x: number, y: number, text: string, dest: Uint8Array): void {
  const { V_DrawPatch } = require("./v_video");
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    let ch = text.charCodeAt(i);
    if (ch >= 97 && ch <= 122) ch -= 32; // lowercase -> uppercase
    if (ch === 32) { // space
      cx += 6;
      continue;
    }
    const patch = fontPatches.get(ch);
    if (patch) {
      V_DrawPatch(cx, y, 0, patch);
      cx += (patch.width ?? 8) + 1;
    } else {
      cx += 6;
    }
  }
}

export function M_Ticker(): void {}
export function M_StartControlPanel(): void { menuActive = true; doomstat.setMenuActive(true); }
