// doomstat.ts — Global game state

import { GameMode, GameMission, GameState, GameAction, Skill, MAXPLAYERS } from "./doomdef";
import type { Player, MapObject, Line, Sector, Vertex, Side, Seg, SubSector, Node } from "./doomdata";
import { newPlayer } from "./doomdata";

// Game identification
export let gamemode: GameMode = GameMode.Indetermined;
export let gamemission: GameMission = GameMission.None;

// Game state
export let gamestate: GameState = GameState.DemoScreen;
export let gameaction: GameAction = GameAction.Nothing;
export let gametic: number = 0;
export let gamemap: number = 1;
export let gameepisode: number = 1;
export let gameskill: Skill = Skill.Medium;

// Players
export const players: Player[] = Array.from({ length: MAXPLAYERS }, () => newPlayer());
export const playeringame: boolean[] = new Array(MAXPLAYERS).fill(false);
export let consoleplayer: number = 0;
export let displayplayer: number = 0;

// Game flags
export let deathmatch: number = 0;
export let netgame: boolean = false;
export let paused: boolean = false;
export let menuactive: boolean = false;
export let nodrawers: boolean = false;
export let noblit: boolean = false;
export let viewactive: boolean = true;
export let automapactive: boolean = false;
export let singledemo: boolean = false;
export let usergame: boolean = false;
export let demoplayback: boolean = false;
export let demorecording: boolean = false;
export let timingdemo: boolean = false;
export let precache: boolean = true;

// Rendering
export let viewx: number = 0;
export let viewy: number = 0;
export let viewz: number = 0;
export let viewangle: number = 0;
export let viewcos: number = 0;
export let viewsin: number = 0;
export let viewplayer: Player = players[0]!;

// Level data
export let numvertexes: number = 0;
export let vertexes: Vertex[] = [];
export let numsegs: number = 0;
export let segs: Seg[] = [];
export let numsectors: number = 0;
export let sectors: Sector[] = [];
export let numsubsectors: number = 0;
export let subsectors: SubSector[] = [];
export let numnodes: number = 0;
export let nodes: Node[] = [];
export let numlines: number = 0;
export let lines: Line[] = [];
export let numsides: number = 0;
export let sides: Side[] = [];

// Blockmap
export let bmaporgx: number = 0;
export let bmaporgy: number = 0;
export let bmapwidth: number = 0;
export let bmapheight: number = 0;
export let blockmap: Int16Array = new Int16Array(0);
export let blockmaplump: Int16Array = new Int16Array(0);
export let blocklinks: (MapObject | null)[] = [];

// Reject matrix
export let rejectmatrix: Uint8Array = new Uint8Array(0);

// Level time
export let leveltime: number = 0;
export let totalleveltimes: number = 0;

// Automap
export let markpointnum: number = 0;

// Wipegamestate
export let wipegamestate: GameState = GameState.DemoScreen;

// Sound
export let snd_SfxVolume: number = 8;
export let snd_MusicVolume: number = 8;

// Misc
export let bodyqueslot: number = 0;

// Setters for variables that need to be modified from other modules
export function setGameState(s: GameState) { gamestate = s; }
export function setGameAction(a: GameAction) { gameaction = a; }
export function setGameTic(t: number) { gametic = t; }
export function setGameMap(m: number) { gamemap = m; }
export function setGameEpisode(e: number) { gameepisode = e; }
export function setGameSkill(s: Skill) { gameskill = s; }
export function setGameMode(m: GameMode) { gamemode = m; }
export function setGameMission(m: GameMission) { gamemission = m; }
export function setPaused(p: boolean) { paused = p; }
export function setMenuActive(m: boolean) { menuactive = m; }
export function setViewActive(v: boolean) { viewactive = v; }
export function setAutomapActive(a: boolean) { automapactive = a; }
export function setUserGame(u: boolean) { usergame = u; }
export function setDemoPlayback(d: boolean) { demoplayback = d; }
export function setDemoRecording(d: boolean) { demorecording = d; }
export function setSingleDemo(s: boolean) { singledemo = s; }
export function setConsoleplayer(c: number) { consoleplayer = c; }
export function setDisplayplayer(d: number) { displayplayer = d; }
export function setDeathmatch(d: number) { deathmatch = d; }
export function setNetgame(n: boolean) { netgame = n; }
export function setNodrawers(n: boolean) { nodrawers = n; }
export function setNoblit(n: boolean) { noblit = n; }
export function setPrecache(p: boolean) { precache = p; }

// View setters
export function setViewX(x: number) { viewx = x; }
export function setViewY(y: number) { viewy = y; }
export function setViewZ(z: number) { viewz = z; }
export function setViewAngle(a: number) { viewangle = a; }
export function setViewCos(c: number) { viewcos = c; }
export function setViewSin(s: number) { viewsin = s; }
export function setViewPlayer(p: Player) { viewplayer = p; }

// Level data setters
export function setVertexes(v: Vertex[], n: number) { vertexes = v; numvertexes = n; }
export function setSegs(s: Seg[], n: number) { segs = s; numsegs = n; }
export function setSectors(s: Sector[], n: number) { sectors = s; numsectors = n; }
export function setSubSectors(s: SubSector[], n: number) { subsectors = s; numsubsectors = n; }
export function setNodes(n: Node[], c: number) { nodes = n; numnodes = c; }
export function setLines(l: Line[], n: number) { lines = l; numlines = n; }
export function setSides(s: Side[], n: number) { sides = s; numsides = n; }
export function setBlockmap(bm: Int16Array, lump: Int16Array, ox: number, oy: number, w: number, h: number) {
  blockmap = bm; blockmaplump = lump; bmaporgx = ox; bmaporgy = oy; bmapwidth = w; bmapheight = h;
}
export function setBlocklinks(bl: (MapObject | null)[]) { blocklinks = bl; }
export function setRejectMatrix(rm: Uint8Array) { rejectmatrix = rm; }
export function setLevelTime(t: number) { leveltime = t; }
export function setTotalLevelTimes(t: number) { totalleveltimes = t; }
export function setWipeGameState(s: GameState) { wipegamestate = s; }

// Increment helpers
export function incGameTic() { gametic++; }
export function incLevelTime() { leveltime++; }
