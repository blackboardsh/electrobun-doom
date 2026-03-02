// info.ts — Doom state, sprite, and thing type definitions
// Mechanical port of linuxdoom-1.10 info.c / info.h

import type { State, MobjInfo } from "./doomdata";
import {
  MF_SPECIAL, MF_SOLID, MF_SHOOTABLE, MF_NOSECTOR, MF_NOBLOCKMAP,
  MF_AMBUSH, MF_JUSTHIT, MF_JUSTATTACKED, MF_SPAWNCEILING, MF_NOGRAVITY,
  MF_DROPOFF, MF_PICKUP, MF_NOCLIP, MF_SLIDE, MF_FLOAT, MF_TELEPORT,
  MF_MISSILE, MF_DROPPED, MF_SHADOW, MF_NOBLOOD, MF_CORPSE, MF_INFLOAT,
  MF_COUNTKILL, MF_COUNTITEM, MF_SKULLFLY, MF_NOTDMATCH, MF_TRANSLATION,
  MF_TRANSSHIFT,
} from "./doomdata";
import { FRACUNIT } from "./doomdef";

export const FF_FULLBRIGHT = 0x8000;
export const FF_FRAMEMASK = 0x7fff;

// ============================================================
// SpriteNum enum
// ============================================================
export const enum SpriteNum {
  SPR_TROO, SPR_SHTG, SPR_PUNG, SPR_PISG, SPR_PISF, SPR_SHTF, SPR_SHT2, SPR_CHGG, SPR_CHGF,
  SPR_MISG, SPR_MISF, SPR_SAWG, SPR_PLSG, SPR_PLSF, SPR_BFGG, SPR_BFGF, SPR_BLUD, SPR_PUFF,
  SPR_BAL1, SPR_BAL2, SPR_PLSS, SPR_PLSE, SPR_MISL, SPR_BFS1, SPR_BFE1, SPR_BFE2, SPR_TFOG,
  SPR_IFOG, SPR_PLAY, SPR_POSS, SPR_SPOS, SPR_VILE, SPR_FIRE, SPR_FATB, SPR_FBXP, SPR_SKEL,
  SPR_MANF, SPR_FATT, SPR_CPOS, SPR_SARG, SPR_HEAD, SPR_BAL7, SPR_BOSS, SPR_BOS2, SPR_SKUL,
  SPR_SPID, SPR_BSPI, SPR_APLS, SPR_APBX, SPR_CYBR, SPR_PAIN, SPR_SSWV, SPR_KEEN, SPR_BBRN,
  SPR_BOSF, SPR_ARM1, SPR_ARM2, SPR_BAR1, SPR_BEXP, SPR_FCAN, SPR_BON1, SPR_BON2, SPR_BKEY,
  SPR_RKEY, SPR_YKEY, SPR_BSKU, SPR_RSKU, SPR_YSKU, SPR_STIM, SPR_MEDI, SPR_SOUL, SPR_PINV,
  SPR_PSTR, SPR_PINS, SPR_MEGA, SPR_SUIT, SPR_PMAP, SPR_PVIS, SPR_CLIP, SPR_AMMO, SPR_ROCK,
  SPR_BROK, SPR_CELL, SPR_CELP, SPR_SHEL, SPR_SBOX, SPR_BPAK, SPR_BFUG, SPR_MGUN, SPR_CSAW,
  SPR_LAUN, SPR_PLAS, SPR_SHOT, SPR_SGN2, SPR_COLU, SPR_SMT2, SPR_GOR1, SPR_POL2, SPR_POL5,
  SPR_POL4, SPR_POL3, SPR_POL1, SPR_POL6, SPR_GOR2, SPR_GOR3, SPR_GOR4, SPR_GOR5, SPR_SMIT,
  SPR_COL1, SPR_COL2, SPR_COL3, SPR_COL4, SPR_CAND, SPR_CBRA, SPR_COL6, SPR_TRE1, SPR_TRE2,
  SPR_ELEC, SPR_CEYE, SPR_FSKU, SPR_COL5, SPR_TBLU, SPR_TGRN, SPR_TRED, SPR_SMBT, SPR_SMGT,
  SPR_SMRT, SPR_HDB1, SPR_HDB2, SPR_HDB3, SPR_HDB4, SPR_HDB5, SPR_HDB6, SPR_POB1, SPR_POB2,
  SPR_BRS1, SPR_TLMP, SPR_TLP2, NUMSPRITES
}

// ============================================================
// sprnames — string names matching SpriteNum
// ============================================================
export const sprnames: string[] = [
  "TROO","SHTG","PUNG","PISG","PISF","SHTF","SHT2","CHGG","CHGF",
  "MISG","MISF","SAWG","PLSG","PLSF","BFGG","BFGF","BLUD","PUFF",
  "BAL1","BAL2","PLSS","PLSE","MISL","BFS1","BFE1","BFE2","TFOG",
  "IFOG","PLAY","POSS","SPOS","VILE","FIRE","FATB","FBXP","SKEL",
  "MANF","FATT","CPOS","SARG","HEAD","BAL7","BOSS","BOS2","SKUL",
  "SPID","BSPI","APLS","APBX","CYBR","PAIN","SSWV","KEEN","BBRN",
  "BOSF","ARM1","ARM2","BAR1","BEXP","FCAN","BON1","BON2","BKEY",
  "RKEY","YKEY","BSKU","RSKU","YSKU","STIM","MEDI","SOUL","PINV",
  "PSTR","PINS","MEGA","SUIT","PMAP","PVIS","CLIP","AMMO","ROCK",
  "BROK","CELL","CELP","SHEL","SBOX","BPAK","BFUG","MGUN","CSAW",
  "LAUN","PLAS","SHOT","SGN2","COLU","SMT2","GOR1","POL2","POL5",
  "POL4","POL3","POL1","POL6","GOR2","GOR3","GOR4","GOR5","SMIT",
  "COL1","COL2","COL3","COL4","CAND","CBRA","COL6","TRE1","TRE2",
  "ELEC","CEYE","FSKU","COL5","TBLU","TGRN","TRED","SMBT","SMGT",
  "SMRT","HDB1","HDB2","HDB3","HDB4","HDB5","HDB6","POB1","POB2",
  "BRS1","TLMP","TLP2"
];

// ============================================================
// SoundNum enum
// ============================================================
export const enum SoundNum {
  sfx_None = 0,
  sfx_pistol, sfx_shotgn, sfx_sgcock, sfx_dshtgn, sfx_dbopn, sfx_dbcls, sfx_dbload,
  sfx_plasma, sfx_bfg, sfx_sawup, sfx_sawidl, sfx_sawful, sfx_sawhit,
  sfx_rlaunc, sfx_rxplod, sfx_firsht, sfx_firxpl, sfx_pstart, sfx_pstop, sfx_doropn,
  sfx_dorcls, sfx_stnmov, sfx_swtchn, sfx_swtchx, sfx_plpain, sfx_dmpain, sfx_popain,
  sfx_vipain, sfx_mnpain, sfx_pepain, sfx_slop, sfx_itemup, sfx_wpnup, sfx_oof,
  sfx_telept, sfx_posit1, sfx_posit2, sfx_posit3, sfx_bgsit1, sfx_bgsit2, sfx_sgtsit,
  sfx_cacsit, sfx_brssit, sfx_cybsit, sfx_spisit, sfx_bspsit, sfx_kntsit, sfx_vilsit,
  sfx_mansit, sfx_pesit, sfx_sklatk, sfx_sgtatk, sfx_skepch, sfx_vilatk, sfx_claw,
  sfx_skeswg, sfx_pldeth, sfx_pdiehi, sfx_podth1, sfx_podth2, sfx_podth3, sfx_bgdth1,
  sfx_bgdth2, sfx_sgtdth, sfx_cacdth, sfx_skldth, sfx_brsdth, sfx_cybdth, sfx_spidth,
  sfx_bspdth, sfx_vildth, sfx_kntdth, sfx_pedth, sfx_skedth, sfx_posact, sfx_bgact,
  sfx_dmact, sfx_bspact, sfx_bspwlk, sfx_vilact, sfx_noway, sfx_barexp, sfx_punch,
  sfx_hoof, sfx_metal, sfx_chgun, sfx_tink, sfx_bdopn, sfx_bdcls, sfx_itmbk,
  sfx_flame, sfx_flamst, sfx_getpow, sfx_bospit, sfx_boscub, sfx_bossit, sfx_bospn,
  sfx_bosdth, sfx_manatk, sfx_mandth, sfx_sssit, sfx_ssdth, sfx_ssact, sfx_keenpn,
  sfx_keendt, sfx_skeact, sfx_skesit, sfx_skeatk, NUMSFX
}

// ============================================================
// MobjType enum
// ============================================================
export const enum MobjType {
  MT_PLAYER,
  MT_POSSESSED,
  MT_SHOTGUY,
  MT_VILE,
  MT_FIRE,
  MT_UNDEAD,
  MT_TRACER,
  MT_SMOKE,
  MT_FATSO,
  MT_FATSHOT,
  MT_CHAINGUY,
  MT_TROOP,
  MT_SERGEANT,
  MT_SHADOWS,
  MT_HEAD,
  MT_BRUISER,
  MT_BRUISERSHOT,
  MT_KNIGHT,
  MT_SKULL,
  MT_SPIDER,
  MT_BABY,
  MT_CYBORG,
  MT_PAIN,
  MT_WOLFSS,
  MT_KEEN,
  MT_BOSSBRAIN,
  MT_BOSSSPIT,
  MT_BOSSTARGET,
  MT_SPAWNSHOT,
  MT_SPAWNFIRE,
  MT_BARREL,
  MT_TROOPSHOT,
  MT_HEADSHOT,
  MT_ROCKET,
  MT_PLASMA,
  MT_BFG,
  MT_ARACHPLAZ,
  MT_PUFF,
  MT_BLOOD,
  MT_TFOG,
  MT_IFOG,
  MT_TELEPORTMAN,
  MT_EXTRABFG,
  MT_MISC0,
  MT_MISC1,
  MT_MISC2,
  MT_MISC3,
  MT_MISC4,
  MT_MISC5,
  MT_MISC6,
  MT_MISC7,
  MT_MISC8,
  MT_MISC9,
  MT_MISC10,
  MT_MISC11,
  MT_MISC12,
  MT_INV,
  MT_MISC13,
  MT_INS,
  MT_MISC14,
  MT_MISC15,
  MT_MISC16,
  MT_MEGA,
  MT_CLIP,
  MT_MISC17,
  MT_MISC18,
  MT_MISC19,
  MT_MISC20,
  MT_MISC21,
  MT_MISC22,
  MT_MISC23,
  MT_MISC24,
  MT_MISC25,
  MT_CHAINGUN,
  MT_MISC26,
  MT_MISC27,
  MT_MISC28,
  MT_SHOTGUN,
  MT_SUPERSHOTGUN,
  MT_MISC29,
  MT_MISC30,
  MT_MISC31,
  MT_MISC32,
  MT_MISC33,
  MT_MISC34,
  MT_MISC35,
  MT_MISC36,
  MT_MISC37,
  MT_MISC38,
  MT_MISC39,
  MT_MISC40,
  MT_MISC41,
  MT_MISC42,
  MT_MISC43,
  MT_MISC44,
  MT_MISC45,
  MT_MISC46,
  MT_MISC47,
  MT_MISC48,
  MT_MISC49,
  MT_MISC50,
  MT_MISC51,
  MT_MISC52,
  MT_MISC53,
  MT_MISC54,
  MT_MISC55,
  MT_MISC56,
  MT_MISC57,
  MT_MISC58,
  MT_MISC59,
  MT_MISC60,
  MT_MISC61,
  MT_MISC62,
  MT_MISC63,
  MT_MISC64,
  MT_MISC65,
  MT_MISC66,
  MT_MISC67,
  MT_MISC68,
  MT_MISC69,
  MT_MISC70,
  MT_MISC71,
  MT_MISC72,
  MT_MISC73,
  MT_MISC74,
  MT_MISC75,
  MT_MISC76,
  MT_MISC77,
  MT_MISC78,
  MT_MISC79,
  MT_MISC80,
  MT_MISC81,
  MT_MISC82,
  MT_MISC83,
  MT_MISC84,
  MT_MISC85,
  MT_MISC86,
  NUMMOBJTYPES
}

// ============================================================
// StateNum enum
// ============================================================
export const enum StateNum {
  S_NULL,
  S_LIGHTDONE,
  S_PUNCH,
  S_PUNCHDOWN,
  S_PUNCHUP,
  S_PUNCH1,
  S_PUNCH2,
  S_PUNCH3,
  S_PUNCH4,
  S_PUNCH5,
  S_PISTOL,
  S_PISTOLDOWN,
  S_PISTOLUP,
  S_PISTOL1,
  S_PISTOL2,
  S_PISTOL3,
  S_PISTOL4,
  S_PISTOLFLASH,
  S_SGUN,
  S_SGUNDOWN,
  S_SGUNUP,
  S_SGUN1,
  S_SGUN2,
  S_SGUN3,
  S_SGUN4,
  S_SGUN5,
  S_SGUN6,
  S_SGUN7,
  S_SGUN8,
  S_SGUN9,
  S_SGUNFLASH1,
  S_SGUNFLASH2,
  S_DSGUN,
  S_DSGUNDOWN,
  S_DSGUNUP,
  S_DSGUN1,
  S_DSGUN2,
  S_DSGUN3,
  S_DSGUN4,
  S_DSGUN5,
  S_DSGUN6,
  S_DSGUN7,
  S_DSGUN8,
  S_DSGUN9,
  S_DSGUN10,
  S_DSNR1,
  S_DSNR2,
  S_DSGUNFLASH1,
  S_DSGUNFLASH2,
  S_CHAIN,
  S_CHAINDOWN,
  S_CHAINUP,
  S_CHAIN1,
  S_CHAIN2,
  S_CHAIN3,
  S_CHAINFLASH1,
  S_CHAINFLASH2,
  S_MISSILE,
  S_MISSILEDOWN,
  S_MISSILEUP,
  S_MISSILE1,
  S_MISSILE2,
  S_MISSILE3,
  S_MISSILEFLASH1,
  S_MISSILEFLASH2,
  S_MISSILEFLASH3,
  S_MISSILEFLASH4,
  S_SAW,
  S_SAWB,
  S_SAWDOWN,
  S_SAWUP,
  S_SAW1,
  S_SAW2,
  S_SAW3,
  S_PLASMA,
  S_PLASMADOWN,
  S_PLASMAUP,
  S_PLASMA1,
  S_PLASMA2,
  S_PLASMAFLASH1,
  S_PLASMAFLASH2,
  S_BFG,
  S_BFGDOWN,
  S_BFGUP,
  S_BFG1,
  S_BFG2,
  S_BFG3,
  S_BFG4,
  S_BFGFLASH1,
  S_BFGFLASH2,
  S_BLOOD1,
  S_BLOOD2,
  S_BLOOD3,
  S_PUFF1,
  S_PUFF2,
  S_PUFF3,
  S_PUFF4,
  S_TBALL1,
  S_TBALL2,
  S_TBALLX1,
  S_TBALLX2,
  S_TBALLX3,
  S_RBALL1,
  S_RBALL2,
  S_RBALLX1,
  S_RBALLX2,
  S_RBALLX3,
  S_PLASBALL,
  S_PLASBALL2,
  S_PLASEXP,
  S_PLASEXP2,
  S_PLASEXP3,
  S_PLASEXP4,
  S_PLASEXP5,
  S_ROCKET,
  S_BFGSHOT,
  S_BFGSHOT2,
  S_BFGLAND,
  S_BFGLAND2,
  S_BFGLAND3,
  S_BFGLAND4,
  S_BFGLAND5,
  S_BFGLAND6,
  S_BFGEXP,
  S_BFGEXP2,
  S_BFGEXP3,
  S_BFGEXP4,
  S_EXPLODE1,
  S_EXPLODE2,
  S_EXPLODE3,
  S_TFOG,
  S_TFOG01,
  S_TFOG02,
  S_TFOG2,
  S_TFOG3,
  S_TFOG4,
  S_TFOG5,
  S_TFOG6,
  S_TFOG7,
  S_TFOG8,
  S_TFOG9,
  S_TFOG10,
  S_IFOG,
  S_IFOG01,
  S_IFOG02,
  S_IFOG2,
  S_IFOG3,
  S_IFOG4,
  S_IFOG5,
  S_PLAY,
  S_PLAY_RUN1,
  S_PLAY_RUN2,
  S_PLAY_RUN3,
  S_PLAY_RUN4,
  S_PLAY_ATK1,
  S_PLAY_ATK2,
  S_PLAY_DIE1,
  S_PLAY_DIE2,
  S_PLAY_DIE3,
  S_PLAY_DIE4,
  S_PLAY_DIE5,
  S_PLAY_DIE6,
  S_PLAY_DIE7,
  S_PLAY_XDIE1,
  S_PLAY_XDIE2,
  S_PLAY_XDIE3,
  S_PLAY_XDIE4,
  S_PLAY_XDIE5,
  S_PLAY_XDIE6,
  S_PLAY_XDIE7,
  S_PLAY_XDIE8,
  S_PLAY_XDIE9,
  S_PLAY_PAIN,
  S_PLAY_PAIN2,
  S_POSS_STND,
  S_POSS_STND2,
  S_POSS_RUN1,
  S_POSS_RUN2,
  S_POSS_RUN3,
  S_POSS_RUN4,
  S_POSS_RUN5,
  S_POSS_RUN6,
  S_POSS_RUN7,
  S_POSS_RUN8,
  S_POSS_ATK1,
  S_POSS_ATK2,
  S_POSS_ATK3,
  S_POSS_PAIN,
  S_POSS_PAIN2,
  S_POSS_DIE1,
  S_POSS_DIE2,
  S_POSS_DIE3,
  S_POSS_DIE4,
  S_POSS_DIE5,
  S_POSS_XDIE1,
  S_POSS_XDIE2,
  S_POSS_XDIE3,
  S_POSS_XDIE4,
  S_POSS_XDIE5,
  S_POSS_XDIE6,
  S_POSS_XDIE7,
  S_POSS_XDIE8,
  S_POSS_XDIE9,
  S_POSS_RAISE1,
  S_POSS_RAISE2,
  S_POSS_RAISE3,
  S_POSS_RAISE4,
  S_SPOS_STND,
  S_SPOS_STND2,
  S_SPOS_RUN1,
  S_SPOS_RUN2,
  S_SPOS_RUN3,
  S_SPOS_RUN4,
  S_SPOS_RUN5,
  S_SPOS_RUN6,
  S_SPOS_RUN7,
  S_SPOS_RUN8,
  S_SPOS_ATK1,
  S_SPOS_ATK2,
  S_SPOS_ATK3,
  S_SPOS_PAIN,
  S_SPOS_PAIN2,
  S_SPOS_DIE1,
  S_SPOS_DIE2,
  S_SPOS_DIE3,
  S_SPOS_DIE4,
  S_SPOS_DIE5,
  S_SPOS_XDIE1,
  S_SPOS_XDIE2,
  S_SPOS_XDIE3,
  S_SPOS_XDIE4,
  S_SPOS_XDIE5,
  S_SPOS_XDIE6,
  S_SPOS_XDIE7,
  S_SPOS_XDIE8,
  S_SPOS_XDIE9,
  S_SPOS_RAISE1,
  S_SPOS_RAISE2,
  S_SPOS_RAISE3,
  S_SPOS_RAISE4,
  S_SPOS_RAISE5,
  S_VILE_STND,
  S_VILE_STND2,
  S_VILE_RUN1,
  S_VILE_RUN2,
  S_VILE_RUN3,
  S_VILE_RUN4,
  S_VILE_RUN5,
  S_VILE_RUN6,
  S_VILE_RUN7,
  S_VILE_RUN8,
  S_VILE_RUN9,
  S_VILE_RUN10,
  S_VILE_RUN11,
  S_VILE_RUN12,
  S_VILE_ATK1,
  S_VILE_ATK2,
  S_VILE_ATK3,
  S_VILE_ATK4,
  S_VILE_ATK5,
  S_VILE_ATK6,
  S_VILE_ATK7,
  S_VILE_ATK8,
  S_VILE_ATK9,
  S_VILE_ATK10,
  S_VILE_ATK11,
  S_VILE_HEAL1,
  S_VILE_HEAL2,
  S_VILE_HEAL3,
  S_VILE_PAIN,
  S_VILE_PAIN2,
  S_VILE_DIE1,
  S_VILE_DIE2,
  S_VILE_DIE3,
  S_VILE_DIE4,
  S_VILE_DIE5,
  S_VILE_DIE6,
  S_VILE_DIE7,
  S_VILE_DIE8,
  S_VILE_DIE9,
  S_VILE_DIE10,
  S_FIRE1,
  S_FIRE2,
  S_FIRE3,
  S_FIRE4,
  S_FIRE5,
  S_FIRE6,
  S_FIRE7,
  S_FIRE8,
  S_FIRE9,
  S_FIRE10,
  S_FIRE11,
  S_FIRE12,
  S_FIRE13,
  S_FIRE14,
  S_FIRE15,
  S_FIRE16,
  S_FIRE17,
  S_FIRE18,
  S_FIRE19,
  S_FIRE20,
  S_FIRE21,
  S_FIRE22,
  S_FIRE23,
  S_FIRE24,
  S_FIRE25,
  S_FIRE26,
  S_FIRE27,
  S_FIRE28,
  S_FIRE29,
  S_FIRE30,
  S_SKEL_STND,
  S_SKEL_STND2,
  S_SKEL_RUN1,
  S_SKEL_RUN2,
  S_SKEL_RUN3,
  S_SKEL_RUN4,
  S_SKEL_RUN5,
  S_SKEL_RUN6,
  S_SKEL_RUN7,
  S_SKEL_RUN8,
  S_SKEL_RUN9,
  S_SKEL_RUN10,
  S_SKEL_RUN11,
  S_SKEL_RUN12,
  S_SKEL_FIST1,
  S_SKEL_FIST2,
  S_SKEL_FIST3,
  S_SKEL_FIST4,
  S_SKEL_MISS1,
  S_SKEL_MISS2,
  S_SKEL_MISS3,
  S_SKEL_MISS4,
  S_SKEL_PAIN,
  S_SKEL_PAIN2,
  S_SKEL_DIE1,
  S_SKEL_DIE2,
  S_SKEL_DIE3,
  S_SKEL_DIE4,
  S_SKEL_DIE5,
  S_SKEL_DIE6,
  S_SKEL_RAISE1,
  S_SKEL_RAISE2,
  S_SKEL_RAISE3,
  S_SKEL_RAISE4,
  S_SKEL_RAISE5,
  S_SKEL_RAISE6,
  S_TRACER,
  S_TRACER2,
  S_TRACEEXP1,
  S_TRACEEXP2,
  S_TRACEEXP3,
  S_SMOKE1,
  S_SMOKE2,
  S_SMOKE3,
  S_SMOKE4,
  S_SMOKE5,
  S_FATSHOT1,
  S_FATSHOT2,
  S_FATSHOTX1,
  S_FATSHOTX2,
  S_FATSHOTX3,
  S_FATT_STND,
  S_FATT_STND2,
  S_FATT_RUN1,
  S_FATT_RUN2,
  S_FATT_RUN3,
  S_FATT_RUN4,
  S_FATT_RUN5,
  S_FATT_RUN6,
  S_FATT_RUN7,
  S_FATT_RUN8,
  S_FATT_RUN9,
  S_FATT_RUN10,
  S_FATT_RUN11,
  S_FATT_RUN12,
  S_FATT_ATK1,
  S_FATT_ATK2,
  S_FATT_ATK3,
  S_FATT_ATK4,
  S_FATT_ATK5,
  S_FATT_ATK6,
  S_FATT_ATK7,
  S_FATT_ATK8,
  S_FATT_ATK9,
  S_FATT_ATK10,
  S_FATT_PAIN,
  S_FATT_PAIN2,
  S_FATT_DIE1,
  S_FATT_DIE2,
  S_FATT_DIE3,
  S_FATT_DIE4,
  S_FATT_DIE5,
  S_FATT_DIE6,
  S_FATT_DIE7,
  S_FATT_DIE8,
  S_FATT_DIE9,
  S_FATT_DIE10,
  S_FATT_RAISE1,
  S_FATT_RAISE2,
  S_FATT_RAISE3,
  S_FATT_RAISE4,
  S_FATT_RAISE5,
  S_FATT_RAISE6,
  S_FATT_RAISE7,
  S_FATT_RAISE8,
  S_CPOS_STND,
  S_CPOS_STND2,
  S_CPOS_RUN1,
  S_CPOS_RUN2,
  S_CPOS_RUN3,
  S_CPOS_RUN4,
  S_CPOS_RUN5,
  S_CPOS_RUN6,
  S_CPOS_RUN7,
  S_CPOS_RUN8,
  S_CPOS_ATK1,
  S_CPOS_ATK2,
  S_CPOS_ATK3,
  S_CPOS_ATK4,
  S_CPOS_PAIN,
  S_CPOS_PAIN2,
  S_CPOS_DIE1,
  S_CPOS_DIE2,
  S_CPOS_DIE3,
  S_CPOS_DIE4,
  S_CPOS_DIE5,
  S_CPOS_DIE6,
  S_CPOS_DIE7,
  S_CPOS_XDIE1,
  S_CPOS_XDIE2,
  S_CPOS_XDIE3,
  S_CPOS_XDIE4,
  S_CPOS_XDIE5,
  S_CPOS_XDIE6,
  S_CPOS_RAISE1,
  S_CPOS_RAISE2,
  S_CPOS_RAISE3,
  S_CPOS_RAISE4,
  S_CPOS_RAISE5,
  S_CPOS_RAISE6,
  S_CPOS_RAISE7,
  S_TROO_STND,
  S_TROO_STND2,
  S_TROO_RUN1,
  S_TROO_RUN2,
  S_TROO_RUN3,
  S_TROO_RUN4,
  S_TROO_RUN5,
  S_TROO_RUN6,
  S_TROO_RUN7,
  S_TROO_RUN8,
  S_TROO_ATK1,
  S_TROO_ATK2,
  S_TROO_ATK3,
  S_TROO_PAIN,
  S_TROO_PAIN2,
  S_TROO_DIE1,
  S_TROO_DIE2,
  S_TROO_DIE3,
  S_TROO_DIE4,
  S_TROO_DIE5,
  S_TROO_XDIE1,
  S_TROO_XDIE2,
  S_TROO_XDIE3,
  S_TROO_XDIE4,
  S_TROO_XDIE5,
  S_TROO_XDIE6,
  S_TROO_XDIE7,
  S_TROO_XDIE8,
  S_TROO_RAISE1,
  S_TROO_RAISE2,
  S_TROO_RAISE3,
  S_TROO_RAISE4,
  S_TROO_RAISE5,
  S_SARG_STND,
  S_SARG_STND2,
  S_SARG_RUN1,
  S_SARG_RUN2,
  S_SARG_RUN3,
  S_SARG_RUN4,
  S_SARG_RUN5,
  S_SARG_RUN6,
  S_SARG_RUN7,
  S_SARG_RUN8,
  S_SARG_ATK1,
  S_SARG_ATK2,
  S_SARG_ATK3,
  S_SARG_PAIN,
  S_SARG_PAIN2,
  S_SARG_DIE1,
  S_SARG_DIE2,
  S_SARG_DIE3,
  S_SARG_DIE4,
  S_SARG_DIE5,
  S_SARG_DIE6,
  S_SARG_RAISE1,
  S_SARG_RAISE2,
  S_SARG_RAISE3,
  S_SARG_RAISE4,
  S_SARG_RAISE5,
  S_SARG_RAISE6,
  S_HEAD_STND,
  S_HEAD_RUN1,
  S_HEAD_ATK1,
  S_HEAD_ATK2,
  S_HEAD_ATK3,
  S_HEAD_PAIN,
  S_HEAD_PAIN2,
  S_HEAD_PAIN3,
  S_HEAD_DIE1,
  S_HEAD_DIE2,
  S_HEAD_DIE3,
  S_HEAD_DIE4,
  S_HEAD_DIE5,
  S_HEAD_DIE6,
  S_HEAD_RAISE1,
  S_HEAD_RAISE2,
  S_HEAD_RAISE3,
  S_HEAD_RAISE4,
  S_HEAD_RAISE5,
  S_HEAD_RAISE6,
  S_BRBALL1,
  S_BRBALL2,
  S_BRBALLX1,
  S_BRBALLX2,
  S_BRBALLX3,
  S_BOSS_STND,
  S_BOSS_STND2,
  S_BOSS_RUN1,
  S_BOSS_RUN2,
  S_BOSS_RUN3,
  S_BOSS_RUN4,
  S_BOSS_RUN5,
  S_BOSS_RUN6,
  S_BOSS_RUN7,
  S_BOSS_RUN8,
  S_BOSS_ATK1,
  S_BOSS_ATK2,
  S_BOSS_ATK3,
  S_BOSS_PAIN,
  S_BOSS_PAIN2,
  S_BOSS_DIE1,
  S_BOSS_DIE2,
  S_BOSS_DIE3,
  S_BOSS_DIE4,
  S_BOSS_DIE5,
  S_BOSS_DIE6,
  S_BOSS_DIE7,
  S_BOSS_RAISE1,
  S_BOSS_RAISE2,
  S_BOSS_RAISE3,
  S_BOSS_RAISE4,
  S_BOSS_RAISE5,
  S_BOSS_RAISE6,
  S_BOSS_RAISE7,
  S_BOS2_STND,
  S_BOS2_STND2,
  S_BOS2_RUN1,
  S_BOS2_RUN2,
  S_BOS2_RUN3,
  S_BOS2_RUN4,
  S_BOS2_RUN5,
  S_BOS2_RUN6,
  S_BOS2_RUN7,
  S_BOS2_RUN8,
  S_BOS2_ATK1,
  S_BOS2_ATK2,
  S_BOS2_ATK3,
  S_BOS2_PAIN,
  S_BOS2_PAIN2,
  S_BOS2_DIE1,
  S_BOS2_DIE2,
  S_BOS2_DIE3,
  S_BOS2_DIE4,
  S_BOS2_DIE5,
  S_BOS2_DIE6,
  S_BOS2_DIE7,
  S_BOS2_RAISE1,
  S_BOS2_RAISE2,
  S_BOS2_RAISE3,
  S_BOS2_RAISE4,
  S_BOS2_RAISE5,
  S_BOS2_RAISE6,
  S_BOS2_RAISE7,
  S_SKULL_STND,
  S_SKULL_STND2,
  S_SKULL_RUN1,
  S_SKULL_RUN2,
  S_SKULL_ATK1,
  S_SKULL_ATK2,
  S_SKULL_ATK3,
  S_SKULL_ATK4,
  S_SKULL_PAIN,
  S_SKULL_PAIN2,
  S_SKULL_DIE1,
  S_SKULL_DIE2,
  S_SKULL_DIE3,
  S_SKULL_DIE4,
  S_SKULL_DIE5,
  S_SKULL_DIE6,
  S_SPID_STND,
  S_SPID_STND2,
  S_SPID_RUN1,
  S_SPID_RUN2,
  S_SPID_RUN3,
  S_SPID_RUN4,
  S_SPID_RUN5,
  S_SPID_RUN6,
  S_SPID_RUN7,
  S_SPID_RUN8,
  S_SPID_RUN9,
  S_SPID_RUN10,
  S_SPID_RUN11,
  S_SPID_RUN12,
  S_SPID_ATK1,
  S_SPID_ATK2,
  S_SPID_ATK3,
  S_SPID_ATK4,
  S_SPID_PAIN,
  S_SPID_PAIN2,
  S_SPID_DIE1,
  S_SPID_DIE2,
  S_SPID_DIE3,
  S_SPID_DIE4,
  S_SPID_DIE5,
  S_SPID_DIE6,
  S_SPID_DIE7,
  S_SPID_DIE8,
  S_SPID_DIE9,
  S_SPID_DIE10,
  S_SPID_DIE11,
  S_BSPI_STND,
  S_BSPI_STND2,
  S_BSPI_SIGHT,
  S_BSPI_RUN1,
  S_BSPI_RUN2,
  S_BSPI_RUN3,
  S_BSPI_RUN4,
  S_BSPI_RUN5,
  S_BSPI_RUN6,
  S_BSPI_RUN7,
  S_BSPI_RUN8,
  S_BSPI_RUN9,
  S_BSPI_RUN10,
  S_BSPI_RUN11,
  S_BSPI_RUN12,
  S_BSPI_ATK1,
  S_BSPI_ATK2,
  S_BSPI_ATK3,
  S_BSPI_ATK4,
  S_BSPI_PAIN,
  S_BSPI_PAIN2,
  S_BSPI_DIE1,
  S_BSPI_DIE2,
  S_BSPI_DIE3,
  S_BSPI_DIE4,
  S_BSPI_DIE5,
  S_BSPI_DIE6,
  S_BSPI_DIE7,
  S_BSPI_RAISE1,
  S_BSPI_RAISE2,
  S_BSPI_RAISE3,
  S_BSPI_RAISE4,
  S_BSPI_RAISE5,
  S_BSPI_RAISE6,
  S_BSPI_RAISE7,
  S_ARACH_PLAZ,
  S_ARACH_PLAZ2,
  S_ARACH_PLEX,
  S_ARACH_PLEX2,
  S_ARACH_PLEX3,
  S_ARACH_PLEX4,
  S_ARACH_PLEX5,
  S_CYBER_STND,
  S_CYBER_STND2,
  S_CYBER_RUN1,
  S_CYBER_RUN2,
  S_CYBER_RUN3,
  S_CYBER_RUN4,
  S_CYBER_RUN5,
  S_CYBER_RUN6,
  S_CYBER_RUN7,
  S_CYBER_RUN8,
  S_CYBER_ATK1,
  S_CYBER_ATK2,
  S_CYBER_ATK3,
  S_CYBER_ATK4,
  S_CYBER_ATK5,
  S_CYBER_ATK6,
  S_CYBER_PAIN,
  S_CYBER_DIE1,
  S_CYBER_DIE2,
  S_CYBER_DIE3,
  S_CYBER_DIE4,
  S_CYBER_DIE5,
  S_CYBER_DIE6,
  S_CYBER_DIE7,
  S_CYBER_DIE8,
  S_CYBER_DIE9,
  S_CYBER_DIE10,
  S_PAIN_STND,
  S_PAIN_RUN1,
  S_PAIN_RUN2,
  S_PAIN_RUN3,
  S_PAIN_RUN4,
  S_PAIN_RUN5,
  S_PAIN_RUN6,
  S_PAIN_ATK1,
  S_PAIN_ATK2,
  S_PAIN_ATK3,
  S_PAIN_ATK4,
  S_PAIN_PAIN,
  S_PAIN_PAIN2,
  S_PAIN_DIE1,
  S_PAIN_DIE2,
  S_PAIN_DIE3,
  S_PAIN_DIE4,
  S_PAIN_DIE5,
  S_PAIN_DIE6,
  S_PAIN_RAISE1,
  S_PAIN_RAISE2,
  S_PAIN_RAISE3,
  S_PAIN_RAISE4,
  S_PAIN_RAISE5,
  S_PAIN_RAISE6,
  S_SSWV_STND,
  S_SSWV_STND2,
  S_SSWV_RUN1,
  S_SSWV_RUN2,
  S_SSWV_RUN3,
  S_SSWV_RUN4,
  S_SSWV_RUN5,
  S_SSWV_RUN6,
  S_SSWV_RUN7,
  S_SSWV_RUN8,
  S_SSWV_ATK1,
  S_SSWV_ATK2,
  S_SSWV_ATK3,
  S_SSWV_ATK4,
  S_SSWV_ATK5,
  S_SSWV_ATK6,
  S_SSWV_PAIN,
  S_SSWV_PAIN2,
  S_SSWV_DIE1,
  S_SSWV_DIE2,
  S_SSWV_DIE3,
  S_SSWV_DIE4,
  S_SSWV_DIE5,
  S_SSWV_XDIE1,
  S_SSWV_XDIE2,
  S_SSWV_XDIE3,
  S_SSWV_XDIE4,
  S_SSWV_XDIE5,
  S_SSWV_XDIE6,
  S_SSWV_XDIE7,
  S_SSWV_XDIE8,
  S_SSWV_XDIE9,
  S_SSWV_RAISE1,
  S_SSWV_RAISE2,
  S_SSWV_RAISE3,
  S_SSWV_RAISE4,
  S_SSWV_RAISE5,
  S_KEENSTND,
  S_COMMKEEN,
  S_COMMKEEN2,
  S_COMMKEEN3,
  S_COMMKEEN4,
  S_COMMKEEN5,
  S_COMMKEEN6,
  S_COMMKEEN7,
  S_COMMKEEN8,
  S_COMMKEEN9,
  S_COMMKEEN10,
  S_COMMKEEN11,
  S_COMMKEEN12,
  S_KEENPAIN,
  S_KEENPAIN2,
  S_BRAIN,
  S_BRAIN_PAIN,
  S_BRAIN_DIE1,
  S_BRAIN_DIE2,
  S_BRAIN_DIE3,
  S_BRAIN_DIE4,
  S_BRAINEYE,
  S_BRAINEYESEE,
  S_BRAINEYE1,
  S_SPAWN1,
  S_SPAWN2,
  S_SPAWN3,
  S_SPAWN4,
  S_SPAWNFIRE1,
  S_SPAWNFIRE2,
  S_SPAWNFIRE3,
  S_SPAWNFIRE4,
  S_SPAWNFIRE5,
  S_SPAWNFIRE6,
  S_SPAWNFIRE7,
  S_SPAWNFIRE8,
  S_BRAINEXPLODE1,
  S_BRAINEXPLODE2,
  S_BRAINEXPLODE3,
  S_ARM1,
  S_ARM1A,
  S_ARM2,
  S_ARM2A,
  S_BAR1,
  S_BAR2,
  S_BEXP,
  S_BEXP2,
  S_BEXP3,
  S_BEXP4,
  S_BEXP5,
  S_FCAN,
  S_FCAN2,
  S_BON1,
  S_BON1A,
  S_BON1B,
  S_BON1C,
  S_BON1D,
  S_BON1E,
  S_BON2,
  S_BON2A,
  S_BON2B,
  S_BON2C,
  S_BON2D,
  S_BON2E,
  S_BKEY,
  S_BKEY2,
  S_RKEY,
  S_RKEY2,
  S_YKEY,
  S_YKEY2,
  S_BSKU,
  S_BSKU2,
  S_RSKU,
  S_RSKU2,
  S_YSKU,
  S_YSKU2,
  S_STIM,
  S_MEDI,
  S_SOUL,
  S_SOUL2,
  S_SOUL3,
  S_SOUL4,
  S_SOUL5,
  S_SOUL6,
  S_PINV,
  S_PINV2,
  S_PINV3,
  S_PINV4,
  S_PSTR,
  S_PINS,
  S_PINS2,
  S_PINS3,
  S_PINS4,
  S_MEGA,
  S_MEGA2,
  S_MEGA3,
  S_MEGA4,
  S_SUIT,
  S_PMAP,
  S_PMAP2,
  S_PMAP3,
  S_PMAP4,
  S_PMAP5,
  S_PMAP6,
  S_PVIS,
  S_PVIS2,
  S_CLIP,
  S_AMMO,
  S_ROCK,
  S_BROK,
  S_CELL,
  S_CELP,
  S_SHEL,
  S_SBOX,
  S_BPAK,
  S_BFUG,
  S_MGUN,
  S_CSAW,
  S_LAUN,
  S_PLAS,
  S_SHOT,
  S_SHOT2,
  S_COLU,
  S_STALAG,
  S_BLOODYTWITCH,
  S_BLOODYTWITCH2,
  S_BLOODYTWITCH3,
  S_BLOODYTWITCH4,
  S_DEADTORSO,
  S_DEADBOTTOMHALF,
  S_HEADSONSTICK,
  S_GIBS,
  S_HEADONASTICK,
  S_HEADCANDLES,
  S_HEADCANDLES2,
  S_DEADSTICK,
  S_LIVESTICK,
  S_LIVESTICK2,
  S_MEAT2,
  S_MEAT3,
  S_MEAT4,
  S_MEAT5,
  S_STALAGTITE,
  S_TALLGRNCOL,
  S_SHRTGRNCOL,
  S_TALLREDCOL,
  S_SHRTREDCOL,
  S_CANDLESTIK,
  S_CANDELABRA,
  S_SKULLCOL,
  S_TORCHTREE,
  S_BIGTREE,
  S_TECHPILLAR,
  S_EVILEYE,
  S_EVILEYE2,
  S_EVILEYE3,
  S_EVILEYE4,
  S_FLOATSKULL,
  S_FLOATSKULL2,
  S_FLOATSKULL3,
  S_HEARTCOL,
  S_HEARTCOL2,
  S_BLUETORCH,
  S_BLUETORCH2,
  S_BLUETORCH3,
  S_BLUETORCH4,
  S_GREENTORCH,
  S_GREENTORCH2,
  S_GREENTORCH3,
  S_GREENTORCH4,
  S_REDTORCH,
  S_REDTORCH2,
  S_REDTORCH3,
  S_REDTORCH4,
  S_BTORCHSHRT,
  S_BTORCHSHRT2,
  S_BTORCHSHRT3,
  S_BTORCHSHRT4,
  S_GTORCHSHRT,
  S_GTORCHSHRT2,
  S_GTORCHSHRT3,
  S_GTORCHSHRT4,
  S_RTORCHSHRT,
  S_RTORCHSHRT2,
  S_RTORCHSHRT3,
  S_RTORCHSHRT4,
  S_HANGNOGUTS,
  S_HANGBNOBRAIN,
  S_HANGTLOOKDN,
  S_HANGTSKULL,
  S_HANGTLOOKUP,
  S_HANGTNOBRAIN,
  S_COLONGIBS,
  S_SMALLPOOL,
  S_BRAINSTEM,
  S_TECHLAMP,
  S_TECHLAMP2,
  S_TECHLAMP3,
  S_TECHLAMP4,
  S_TECH2LAMP,
  S_TECH2LAMP2,
  S_TECH2LAMP3,
  S_TECH2LAMP4,
  NUMSTATES
}

// ============================================================
// Helper: short alias for creating state entries
// ============================================================
function S(sprite: number, frame: number, tics: number, nextstate: number, misc1: number = 0, misc2: number = 0): State {
  return { sprite, frame, tics, action: null, nextstate, misc1, misc2 };
}

const F = FF_FULLBRIGHT;

// ============================================================
// states array — ALL 967 states from info.c
// Actions are null here; d_main.ts patches them in after import.
// ============================================================
export const states: State[] = [
  // S_NULL (0)
  S(SpriteNum.SPR_TROO, 0, -1, StateNum.S_NULL),
  // S_LIGHTDONE (1)
  S(SpriteNum.SPR_SHTG, 4, 0, StateNum.S_NULL),
  // S_PUNCH (2)
  S(SpriteNum.SPR_PUNG, 0, 1, StateNum.S_PUNCH),
  // S_PUNCHDOWN (3)
  S(SpriteNum.SPR_PUNG, 0, 1, StateNum.S_PUNCHDOWN),
  // S_PUNCHUP (4)
  S(SpriteNum.SPR_PUNG, 0, 1, StateNum.S_PUNCHUP),
  // S_PUNCH1 (5)
  S(SpriteNum.SPR_PUNG, 1, 4, StateNum.S_PUNCH2),
  // S_PUNCH2 (6)
  S(SpriteNum.SPR_PUNG, 2, 4, StateNum.S_PUNCH3),
  // S_PUNCH3 (7)
  S(SpriteNum.SPR_PUNG, 3, 5, StateNum.S_PUNCH4),
  // S_PUNCH4 (8)
  S(SpriteNum.SPR_PUNG, 2, 4, StateNum.S_PUNCH5),
  // S_PUNCH5 (9)
  S(SpriteNum.SPR_PUNG, 1, 5, StateNum.S_PUNCH),
  // S_PISTOL (10)
  S(SpriteNum.SPR_PISG, 0, 1, StateNum.S_PISTOL),
  // S_PISTOLDOWN (11)
  S(SpriteNum.SPR_PISG, 0, 1, StateNum.S_PISTOLDOWN),
  // S_PISTOLUP (12)
  S(SpriteNum.SPR_PISG, 0, 1, StateNum.S_PISTOLUP),
  // S_PISTOL1 (13)
  S(SpriteNum.SPR_PISG, 0, 4, StateNum.S_PISTOL2),
  // S_PISTOL2 (14)
  S(SpriteNum.SPR_PISG, 1, 6, StateNum.S_PISTOL3),
  // S_PISTOL3 (15)
  S(SpriteNum.SPR_PISG, 2, 4, StateNum.S_PISTOL4),
  // S_PISTOL4 (16)
  S(SpriteNum.SPR_PISG, 1, 5, StateNum.S_PISTOL),
  // S_PISTOLFLASH (17)
  S(SpriteNum.SPR_PISF, 0|F, 7, StateNum.S_LIGHTDONE),
  // S_SGUN (18)
  S(SpriteNum.SPR_SHTG, 0, 1, StateNum.S_SGUN),
  // S_SGUNDOWN (19)
  S(SpriteNum.SPR_SHTG, 0, 1, StateNum.S_SGUNDOWN),
  // S_SGUNUP (20)
  S(SpriteNum.SPR_SHTG, 0, 1, StateNum.S_SGUNUP),
  // S_SGUN1 (21)
  S(SpriteNum.SPR_SHTG, 0, 3, StateNum.S_SGUN2),
  // S_SGUN2 (22)
  S(SpriteNum.SPR_SHTG, 0, 7, StateNum.S_SGUN3),
  // S_SGUN3 (23)
  S(SpriteNum.SPR_SHTG, 1, 5, StateNum.S_SGUN4),
  // S_SGUN4 (24)
  S(SpriteNum.SPR_SHTG, 2, 5, StateNum.S_SGUN5),
  // S_SGUN5 (25)
  S(SpriteNum.SPR_SHTG, 3, 4, StateNum.S_SGUN6),
  // S_SGUN6 (26)
  S(SpriteNum.SPR_SHTG, 2, 5, StateNum.S_SGUN7),
  // S_SGUN7 (27)
  S(SpriteNum.SPR_SHTG, 1, 5, StateNum.S_SGUN8),
  // S_SGUN8 (28)
  S(SpriteNum.SPR_SHTG, 0, 3, StateNum.S_SGUN9),
  // S_SGUN9 (29)
  S(SpriteNum.SPR_SHTG, 0, 7, StateNum.S_SGUN),
  // S_SGUNFLASH1 (30)
  S(SpriteNum.SPR_SHTF, 0|F, 4, StateNum.S_SGUNFLASH2),
  // S_SGUNFLASH2 (31)
  S(SpriteNum.SPR_SHTF, 1|F, 3, StateNum.S_LIGHTDONE),
  // S_DSGUN (32)
  S(SpriteNum.SPR_SHT2, 0, 1, StateNum.S_DSGUN),
  // S_DSGUNDOWN (33)
  S(SpriteNum.SPR_SHT2, 0, 1, StateNum.S_DSGUNDOWN),
  // S_DSGUNUP (34)
  S(SpriteNum.SPR_SHT2, 0, 1, StateNum.S_DSGUNUP),
  // S_DSGUN1 (35)
  S(SpriteNum.SPR_SHT2, 0, 3, StateNum.S_DSGUN2),
  // S_DSGUN2 (36)
  S(SpriteNum.SPR_SHT2, 0, 7, StateNum.S_DSGUN3),
  // S_DSGUN3 (37)
  S(SpriteNum.SPR_SHT2, 1, 7, StateNum.S_DSGUN4),
  // S_DSGUN4 (38)
  S(SpriteNum.SPR_SHT2, 2, 7, StateNum.S_DSGUN5),
  // S_DSGUN5 (39)
  S(SpriteNum.SPR_SHT2, 3, 7, StateNum.S_DSGUN6),
  // S_DSGUN6 (40)
  S(SpriteNum.SPR_SHT2, 4, 7, StateNum.S_DSGUN7),
  // S_DSGUN7 (41)
  S(SpriteNum.SPR_SHT2, 5, 7, StateNum.S_DSGUN8),
  // S_DSGUN8 (42)
  S(SpriteNum.SPR_SHT2, 6, 7, StateNum.S_DSGUN9),
  // S_DSGUN9 (43)
  S(SpriteNum.SPR_SHT2, 7, 5, StateNum.S_DSGUN10),
  // S_DSGUN10 (44)
  S(SpriteNum.SPR_SHT2, 0, 5, StateNum.S_DSGUN),
  // S_DSNR1 (45)
  S(SpriteNum.SPR_SHT2, 1, 7, StateNum.S_DSNR2),
  // S_DSNR2 (46)
  S(SpriteNum.SPR_SHT2, 0, 3, StateNum.S_DSGUNDOWN),
  // S_DSGUNFLASH1 (47)
  S(SpriteNum.SPR_SHT2, 8|F, 4, StateNum.S_DSGUNFLASH2),
  // S_DSGUNFLASH2 (48)
  S(SpriteNum.SPR_SHT2, 9|F, 3, StateNum.S_LIGHTDONE),
  // S_CHAIN (49)
  S(SpriteNum.SPR_CHGG, 0, 1, StateNum.S_CHAIN),
  // S_CHAINDOWN (50)
  S(SpriteNum.SPR_CHGG, 0, 1, StateNum.S_CHAINDOWN),
  // S_CHAINUP (51)
  S(SpriteNum.SPR_CHGG, 0, 1, StateNum.S_CHAINUP),
  // S_CHAIN1 (52)
  S(SpriteNum.SPR_CHGG, 0, 4, StateNum.S_CHAIN2),
  // S_CHAIN2 (53)
  S(SpriteNum.SPR_CHGG, 1, 4, StateNum.S_CHAIN3),
  // S_CHAIN3 (54)
  S(SpriteNum.SPR_CHGG, 1, 0, StateNum.S_CHAIN),
  // S_CHAINFLASH1 (55)
  S(SpriteNum.SPR_CHGF, 0|F, 5, StateNum.S_LIGHTDONE),
  // S_CHAINFLASH2 (56)
  S(SpriteNum.SPR_CHGF, 1|F, 5, StateNum.S_LIGHTDONE),
  // S_MISSILE (57)
  S(SpriteNum.SPR_MISG, 0, 1, StateNum.S_MISSILE),
  // S_MISSILEDOWN (58)
  S(SpriteNum.SPR_MISG, 0, 1, StateNum.S_MISSILEDOWN),
  // S_MISSILEUP (59)
  S(SpriteNum.SPR_MISG, 0, 1, StateNum.S_MISSILEUP),
  // S_MISSILE1 (60)
  S(SpriteNum.SPR_MISG, 1, 8, StateNum.S_MISSILE2),
  // S_MISSILE2 (61)
  S(SpriteNum.SPR_MISG, 1, 12, StateNum.S_MISSILE3),
  // S_MISSILE3 (62)
  S(SpriteNum.SPR_MISG, 1, 0, StateNum.S_MISSILE),
  // S_MISSILEFLASH1 (63)
  S(SpriteNum.SPR_MISF, 0|F, 3, StateNum.S_MISSILEFLASH2),
  // S_MISSILEFLASH2 (64)
  S(SpriteNum.SPR_MISF, 1|F, 4, StateNum.S_MISSILEFLASH3),
  // S_MISSILEFLASH3 (65)
  S(SpriteNum.SPR_MISF, 2|F, 4, StateNum.S_MISSILEFLASH4),
  // S_MISSILEFLASH4 (66)
  S(SpriteNum.SPR_MISF, 3|F, 4, StateNum.S_LIGHTDONE),
  // S_SAW (67)
  S(SpriteNum.SPR_SAWG, 2, 4, StateNum.S_SAWB),
  // S_SAWB (68)
  S(SpriteNum.SPR_SAWG, 3, 4, StateNum.S_SAW),
  // S_SAWDOWN (69)
  S(SpriteNum.SPR_SAWG, 2, 1, StateNum.S_SAWDOWN),
  // S_SAWUP (70)
  S(SpriteNum.SPR_SAWG, 2, 1, StateNum.S_SAWUP),
  // S_SAW1 (71)
  S(SpriteNum.SPR_SAWG, 0, 4, StateNum.S_SAW2),
  // S_SAW2 (72)
  S(SpriteNum.SPR_SAWG, 1, 4, StateNum.S_SAW3),
  // S_SAW3 (73)
  S(SpriteNum.SPR_SAWG, 1, 0, StateNum.S_SAW),
  // S_PLASMA (74)
  S(SpriteNum.SPR_PLSG, 0, 1, StateNum.S_PLASMA),
  // S_PLASMADOWN (75)
  S(SpriteNum.SPR_PLSG, 0, 1, StateNum.S_PLASMADOWN),
  // S_PLASMAUP (76)
  S(SpriteNum.SPR_PLSG, 0, 1, StateNum.S_PLASMAUP),
  // S_PLASMA1 (77)
  S(SpriteNum.SPR_PLSG, 0, 3, StateNum.S_PLASMA2),
  // S_PLASMA2 (78)
  S(SpriteNum.SPR_PLSG, 1, 20, StateNum.S_PLASMA),
  // S_PLASMAFLASH1 (79)
  S(SpriteNum.SPR_PLSF, 0|F, 4, StateNum.S_LIGHTDONE),
  // S_PLASMAFLASH2 (80)
  S(SpriteNum.SPR_PLSF, 1|F, 4, StateNum.S_LIGHTDONE),
  // S_BFG (81)
  S(SpriteNum.SPR_BFGG, 0, 1, StateNum.S_BFG),
  // S_BFGDOWN (82)
  S(SpriteNum.SPR_BFGG, 0, 1, StateNum.S_BFGDOWN),
  // S_BFGUP (83)
  S(SpriteNum.SPR_BFGG, 0, 1, StateNum.S_BFGUP),
  // S_BFG1 (84)
  S(SpriteNum.SPR_BFGG, 0, 20, StateNum.S_BFG2),
  // S_BFG2 (85)
  S(SpriteNum.SPR_BFGG, 1, 10, StateNum.S_BFG3),
  // S_BFG3 (86)
  S(SpriteNum.SPR_BFGG, 1, 10, StateNum.S_BFG4),
  // S_BFG4 (87)
  S(SpriteNum.SPR_BFGG, 1, 20, StateNum.S_BFG),
  // S_BFGFLASH1 (88)
  S(SpriteNum.SPR_BFGF, 0|F, 11, StateNum.S_BFGFLASH2),
  // S_BFGFLASH2 (89)
  S(SpriteNum.SPR_BFGF, 1|F, 6, StateNum.S_LIGHTDONE),
  // S_BLOOD1 (90)
  S(SpriteNum.SPR_BLUD, 2, 8, StateNum.S_BLOOD2),
  // S_BLOOD2 (91)
  S(SpriteNum.SPR_BLUD, 1, 8, StateNum.S_BLOOD3),
  // S_BLOOD3 (92)
  S(SpriteNum.SPR_BLUD, 0, 8, StateNum.S_NULL),
  // S_PUFF1 (93)
  S(SpriteNum.SPR_PUFF, 0|F, 4, StateNum.S_PUFF2),
  // S_PUFF2 (94)
  S(SpriteNum.SPR_PUFF, 1, 4, StateNum.S_PUFF3),
  // S_PUFF3 (95)
  S(SpriteNum.SPR_PUFF, 2, 4, StateNum.S_PUFF4),
  // S_PUFF4 (96)
  S(SpriteNum.SPR_PUFF, 3, 4, StateNum.S_NULL),
  // S_TBALL1 (97)
  S(SpriteNum.SPR_BAL1, 0|F, 4, StateNum.S_TBALL2),
  // S_TBALL2 (98)
  S(SpriteNum.SPR_BAL1, 1|F, 4, StateNum.S_TBALL1),
  // S_TBALLX1 (99)
  S(SpriteNum.SPR_BAL1, 2|F, 6, StateNum.S_TBALLX2),
  // S_TBALLX2 (100)
  S(SpriteNum.SPR_BAL1, 3|F, 6, StateNum.S_TBALLX3),
  // S_TBALLX3 (101)
  S(SpriteNum.SPR_BAL1, 4|F, 6, StateNum.S_NULL),
  // S_RBALL1 (102)
  S(SpriteNum.SPR_BAL2, 0|F, 4, StateNum.S_RBALL2),
  // S_RBALL2 (103)
  S(SpriteNum.SPR_BAL2, 1|F, 4, StateNum.S_RBALL1),
  // S_RBALLX1 (104)
  S(SpriteNum.SPR_BAL2, 2|F, 6, StateNum.S_RBALLX2),
  // S_RBALLX2 (105)
  S(SpriteNum.SPR_BAL2, 3|F, 6, StateNum.S_RBALLX3),
  // S_RBALLX3 (106)
  S(SpriteNum.SPR_BAL2, 4|F, 6, StateNum.S_NULL),
  // S_PLASBALL (107)
  S(SpriteNum.SPR_PLSS, 0|F, 6, StateNum.S_PLASBALL2),
  // S_PLASBALL2 (108)
  S(SpriteNum.SPR_PLSS, 1|F, 6, StateNum.S_PLASBALL),
  // S_PLASEXP (109)
  S(SpriteNum.SPR_PLSE, 0|F, 4, StateNum.S_PLASEXP2),
  // S_PLASEXP2 (110)
  S(SpriteNum.SPR_PLSE, 1|F, 4, StateNum.S_PLASEXP3),
  // S_PLASEXP3 (111)
  S(SpriteNum.SPR_PLSE, 2|F, 4, StateNum.S_PLASEXP4),
  // S_PLASEXP4 (112)
  S(SpriteNum.SPR_PLSE, 3|F, 4, StateNum.S_PLASEXP5),
  // S_PLASEXP5 (113)
  S(SpriteNum.SPR_PLSE, 4|F, 4, StateNum.S_NULL),
  // S_ROCKET (114)
  S(SpriteNum.SPR_MISL, 0|F, 1, StateNum.S_ROCKET),
  // S_BFGSHOT (115)
  S(SpriteNum.SPR_BFS1, 0|F, 4, StateNum.S_BFGSHOT2),
  // S_BFGSHOT2 (116)
  S(SpriteNum.SPR_BFS1, 1|F, 4, StateNum.S_BFGSHOT),
  // S_BFGLAND (117)
  S(SpriteNum.SPR_BFE1, 0|F, 8, StateNum.S_BFGLAND2),
  // S_BFGLAND2 (118)
  S(SpriteNum.SPR_BFE1, 1|F, 8, StateNum.S_BFGLAND3),
  // S_BFGLAND3 (119)
  S(SpriteNum.SPR_BFE1, 2|F, 8, StateNum.S_BFGLAND4),
  // S_BFGLAND4 (120)
  S(SpriteNum.SPR_BFE1, 3|F, 8, StateNum.S_BFGLAND5),
  // S_BFGLAND5 (121)
  S(SpriteNum.SPR_BFE1, 4|F, 8, StateNum.S_BFGLAND6),
  // S_BFGLAND6 (122)
  S(SpriteNum.SPR_BFE1, 5|F, 8, StateNum.S_NULL),
  // S_BFGEXP (123)
  S(SpriteNum.SPR_BFE2, 0|F, 8, StateNum.S_BFGEXP2),
  // S_BFGEXP2 (124)
  S(SpriteNum.SPR_BFE2, 1|F, 8, StateNum.S_BFGEXP3),
  // S_BFGEXP3 (125)
  S(SpriteNum.SPR_BFE2, 2|F, 8, StateNum.S_BFGEXP4),
  // S_BFGEXP4 (126)
  S(SpriteNum.SPR_BFE2, 3|F, 8, StateNum.S_NULL),
  // S_EXPLODE1 (127)
  S(SpriteNum.SPR_MISL, 1|F, 8, StateNum.S_EXPLODE2),
  // S_EXPLODE2 (128)
  S(SpriteNum.SPR_MISL, 2|F, 6, StateNum.S_EXPLODE3),
  // S_EXPLODE3 (129)
  S(SpriteNum.SPR_MISL, 3|F, 4, StateNum.S_NULL),
  // S_TFOG (130)
  S(SpriteNum.SPR_TFOG, 0|F, 6, StateNum.S_TFOG01),
  // S_TFOG01 (131)
  S(SpriteNum.SPR_TFOG, 1|F, 6, StateNum.S_TFOG02),
  // S_TFOG02 (132)
  S(SpriteNum.SPR_TFOG, 0|F, 6, StateNum.S_TFOG2),
  // S_TFOG2 (133)
  S(SpriteNum.SPR_TFOG, 1|F, 6, StateNum.S_TFOG3),
  // S_TFOG3 (134)
  S(SpriteNum.SPR_TFOG, 2|F, 6, StateNum.S_TFOG4),
  // S_TFOG4 (135)
  S(SpriteNum.SPR_TFOG, 3|F, 6, StateNum.S_TFOG5),
  // S_TFOG5 (136)
  S(SpriteNum.SPR_TFOG, 4|F, 6, StateNum.S_TFOG6),
  // S_TFOG6 (137)
  S(SpriteNum.SPR_TFOG, 5|F, 6, StateNum.S_TFOG7),
  // S_TFOG7 (138)
  S(SpriteNum.SPR_TFOG, 6|F, 6, StateNum.S_TFOG8),
  // S_TFOG8 (139)
  S(SpriteNum.SPR_TFOG, 7|F, 6, StateNum.S_TFOG9),
  // S_TFOG9 (140)
  S(SpriteNum.SPR_TFOG, 8|F, 6, StateNum.S_TFOG10),
  // S_TFOG10 (141)
  S(SpriteNum.SPR_TFOG, 9|F, 6, StateNum.S_NULL),
  // S_IFOG (142)
  S(SpriteNum.SPR_IFOG, 0|F, 6, StateNum.S_IFOG01),
  // S_IFOG01 (143)
  S(SpriteNum.SPR_IFOG, 1|F, 6, StateNum.S_IFOG02),
  // S_IFOG02 (144)
  S(SpriteNum.SPR_IFOG, 0|F, 6, StateNum.S_IFOG2),
  // S_IFOG2 (145)
  S(SpriteNum.SPR_IFOG, 1|F, 6, StateNum.S_IFOG3),
  // S_IFOG3 (146)
  S(SpriteNum.SPR_IFOG, 2|F, 6, StateNum.S_IFOG4),
  // S_IFOG4 (147)
  S(SpriteNum.SPR_IFOG, 3|F, 6, StateNum.S_IFOG5),
  // S_IFOG5 (148)
  S(SpriteNum.SPR_IFOG, 4|F, 6, StateNum.S_NULL),
  // S_PLAY (149)
  S(SpriteNum.SPR_PLAY, 0, -1, StateNum.S_NULL),
  // S_PLAY_RUN1 (150)
  S(SpriteNum.SPR_PLAY, 0, 4, StateNum.S_PLAY_RUN2),
  // S_PLAY_RUN2 (151)
  S(SpriteNum.SPR_PLAY, 1, 4, StateNum.S_PLAY_RUN3),
  // S_PLAY_RUN3 (152)
  S(SpriteNum.SPR_PLAY, 2, 4, StateNum.S_PLAY_RUN4),
  // S_PLAY_RUN4 (153)
  S(SpriteNum.SPR_PLAY, 3, 4, StateNum.S_PLAY_RUN1),
  // S_PLAY_ATK1 (154)
  S(SpriteNum.SPR_PLAY, 4, 12, StateNum.S_PLAY),
  // S_PLAY_ATK2 (155)
  S(SpriteNum.SPR_PLAY, 5|F, 6, StateNum.S_PLAY_ATK1),
  // S_PLAY_DIE1 (156)
  S(SpriteNum.SPR_PLAY, 6, 10, StateNum.S_PLAY_DIE2),
  // S_PLAY_DIE2 (157)
  S(SpriteNum.SPR_PLAY, 7, 10, StateNum.S_PLAY_DIE3),
  // S_PLAY_DIE3 (158)
  S(SpriteNum.SPR_PLAY, 8, 10, StateNum.S_PLAY_DIE4),
  // S_PLAY_DIE4 (159)
  S(SpriteNum.SPR_PLAY, 9, 10, StateNum.S_PLAY_DIE5),
  // S_PLAY_DIE5 (160)
  S(SpriteNum.SPR_PLAY, 10, 10, StateNum.S_PLAY_DIE6),
  // S_PLAY_DIE6 (161)
  S(SpriteNum.SPR_PLAY, 11, 10, StateNum.S_PLAY_DIE7),
  // S_PLAY_DIE7 (162)
  S(SpriteNum.SPR_PLAY, 12, -1, StateNum.S_NULL),
  // S_PLAY_XDIE1 (163)
  S(SpriteNum.SPR_PLAY, 13, 5, StateNum.S_PLAY_XDIE2),
  // S_PLAY_XDIE2 (164)
  S(SpriteNum.SPR_PLAY, 14, 5, StateNum.S_PLAY_XDIE3),
  // S_PLAY_XDIE3 (165)
  S(SpriteNum.SPR_PLAY, 15, 5, StateNum.S_PLAY_XDIE4),
  // S_PLAY_XDIE4 (166)
  S(SpriteNum.SPR_PLAY, 16, 5, StateNum.S_PLAY_XDIE5),
  // S_PLAY_XDIE5 (167)
  S(SpriteNum.SPR_PLAY, 17, 5, StateNum.S_PLAY_XDIE6),
  // S_PLAY_XDIE6 (168)
  S(SpriteNum.SPR_PLAY, 18, 5, StateNum.S_PLAY_XDIE7),
  // S_PLAY_XDIE7 (169)
  S(SpriteNum.SPR_PLAY, 19, 5, StateNum.S_PLAY_XDIE8),
  // S_PLAY_XDIE8 (170)
  S(SpriteNum.SPR_PLAY, 20, 5, StateNum.S_PLAY_XDIE9),
  // S_PLAY_XDIE9 (171)
  S(SpriteNum.SPR_PLAY, 21, -1, StateNum.S_NULL),
  // S_PLAY_PAIN (172)
  S(SpriteNum.SPR_PLAY, 22, 4, StateNum.S_PLAY_PAIN2),
  // S_PLAY_PAIN2 (173)
  S(SpriteNum.SPR_PLAY, 22, 4, StateNum.S_PLAY),
  // S_POSS_STND (174)
  S(SpriteNum.SPR_POSS, 0, 10, StateNum.S_POSS_STND2),
  // S_POSS_STND2 (175)
  S(SpriteNum.SPR_POSS, 1, 10, StateNum.S_POSS_STND),
  // S_POSS_RUN1 (176)
  S(SpriteNum.SPR_POSS, 0, 4, StateNum.S_POSS_RUN2),
  // S_POSS_RUN2 (177)
  S(SpriteNum.SPR_POSS, 0, 4, StateNum.S_POSS_RUN3),
  // S_POSS_RUN3 (178)
  S(SpriteNum.SPR_POSS, 1, 4, StateNum.S_POSS_RUN4),
  // S_POSS_RUN4 (179)
  S(SpriteNum.SPR_POSS, 1, 4, StateNum.S_POSS_RUN5),
  // S_POSS_RUN5 (180)
  S(SpriteNum.SPR_POSS, 2, 4, StateNum.S_POSS_RUN6),
  // S_POSS_RUN6 (181)
  S(SpriteNum.SPR_POSS, 2, 4, StateNum.S_POSS_RUN7),
  // S_POSS_RUN7 (182)
  S(SpriteNum.SPR_POSS, 3, 4, StateNum.S_POSS_RUN8),
  // S_POSS_RUN8 (183)
  S(SpriteNum.SPR_POSS, 3, 4, StateNum.S_POSS_RUN1),
  // S_POSS_ATK1 (184)
  S(SpriteNum.SPR_POSS, 4, 10, StateNum.S_POSS_ATK2),
  // S_POSS_ATK2 (185)
  S(SpriteNum.SPR_POSS, 5, 8, StateNum.S_POSS_ATK3),
  // S_POSS_ATK3 (186)
  S(SpriteNum.SPR_POSS, 4, 8, StateNum.S_POSS_RUN1),
  // S_POSS_PAIN (187)
  S(SpriteNum.SPR_POSS, 6, 3, StateNum.S_POSS_PAIN2),
  // S_POSS_PAIN2 (188)
  S(SpriteNum.SPR_POSS, 6, 3, StateNum.S_POSS_RUN1),
  // S_POSS_DIE1 (189)
  S(SpriteNum.SPR_POSS, 7, 5, StateNum.S_POSS_DIE2),
  // S_POSS_DIE2 (190)
  S(SpriteNum.SPR_POSS, 8, 5, StateNum.S_POSS_DIE3),
  // S_POSS_DIE3 (191)
  S(SpriteNum.SPR_POSS, 9, 5, StateNum.S_POSS_DIE4),
  // S_POSS_DIE4 (192)
  S(SpriteNum.SPR_POSS, 10, 5, StateNum.S_POSS_DIE5),
  // S_POSS_DIE5 (193)
  S(SpriteNum.SPR_POSS, 11, -1, StateNum.S_NULL),
  // S_POSS_XDIE1 (194)
  S(SpriteNum.SPR_POSS, 12, 5, StateNum.S_POSS_XDIE2),
  // S_POSS_XDIE2 (195)
  S(SpriteNum.SPR_POSS, 13, 5, StateNum.S_POSS_XDIE3),
  // S_POSS_XDIE3 (196)
  S(SpriteNum.SPR_POSS, 14, 5, StateNum.S_POSS_XDIE4),
  // S_POSS_XDIE4 (197)
  S(SpriteNum.SPR_POSS, 15, 5, StateNum.S_POSS_XDIE5),
  // S_POSS_XDIE5 (198)
  S(SpriteNum.SPR_POSS, 16, 5, StateNum.S_POSS_XDIE6),
  // S_POSS_XDIE6 (199)
  S(SpriteNum.SPR_POSS, 17, 5, StateNum.S_POSS_XDIE7),
  // S_POSS_XDIE7 (200)
  S(SpriteNum.SPR_POSS, 18, 5, StateNum.S_POSS_XDIE8),
  // S_POSS_XDIE8 (201)
  S(SpriteNum.SPR_POSS, 19, 5, StateNum.S_POSS_XDIE9),
  // S_POSS_XDIE9 (202)
  S(SpriteNum.SPR_POSS, 20, -1, StateNum.S_NULL),
  // S_POSS_RAISE1 (203)
  S(SpriteNum.SPR_POSS, 10, 5, StateNum.S_POSS_RAISE2),
  // S_POSS_RAISE2 (204)
  S(SpriteNum.SPR_POSS, 9, 5, StateNum.S_POSS_RAISE3),
  // S_POSS_RAISE3 (205)
  S(SpriteNum.SPR_POSS, 8, 5, StateNum.S_POSS_RAISE4),
  // S_POSS_RAISE4 (206)
  S(SpriteNum.SPR_POSS, 7, 5, StateNum.S_POSS_RUN1),
  // S_SPOS_STND (207)
  S(SpriteNum.SPR_SPOS, 0, 10, StateNum.S_SPOS_STND2),
  // S_SPOS_STND2 (208)
  S(SpriteNum.SPR_SPOS, 1, 10, StateNum.S_SPOS_STND),
  // S_SPOS_RUN1 (209)
  S(SpriteNum.SPR_SPOS, 0, 3, StateNum.S_SPOS_RUN2),
  // S_SPOS_RUN2 (210)
  S(SpriteNum.SPR_SPOS, 0, 3, StateNum.S_SPOS_RUN3),
  // S_SPOS_RUN3 (211)
  S(SpriteNum.SPR_SPOS, 1, 3, StateNum.S_SPOS_RUN4),
  // S_SPOS_RUN4 (212)
  S(SpriteNum.SPR_SPOS, 1, 3, StateNum.S_SPOS_RUN5),
  // S_SPOS_RUN5 (213)
  S(SpriteNum.SPR_SPOS, 2, 3, StateNum.S_SPOS_RUN6),
  // S_SPOS_RUN6 (214)
  S(SpriteNum.SPR_SPOS, 2, 3, StateNum.S_SPOS_RUN7),
  // S_SPOS_RUN7 (215)
  S(SpriteNum.SPR_SPOS, 3, 3, StateNum.S_SPOS_RUN8),
  // S_SPOS_RUN8 (216)
  S(SpriteNum.SPR_SPOS, 3, 3, StateNum.S_SPOS_RUN1),
  // S_SPOS_ATK1 (217)
  S(SpriteNum.SPR_SPOS, 4, 10, StateNum.S_SPOS_ATK2),
  // S_SPOS_ATK2 (218)
  S(SpriteNum.SPR_SPOS, 5|F, 10, StateNum.S_SPOS_ATK3),
  // S_SPOS_ATK3 (219)
  S(SpriteNum.SPR_SPOS, 4, 10, StateNum.S_SPOS_RUN1),
  // S_SPOS_PAIN (220)
  S(SpriteNum.SPR_SPOS, 6, 3, StateNum.S_SPOS_PAIN2),
  // S_SPOS_PAIN2 (221)
  S(SpriteNum.SPR_SPOS, 6, 3, StateNum.S_SPOS_RUN1),
  // S_SPOS_DIE1 (222)
  S(SpriteNum.SPR_SPOS, 7, 5, StateNum.S_SPOS_DIE2),
  // S_SPOS_DIE2 (223)
  S(SpriteNum.SPR_SPOS, 8, 5, StateNum.S_SPOS_DIE3),
  // S_SPOS_DIE3 (224)
  S(SpriteNum.SPR_SPOS, 9, 5, StateNum.S_SPOS_DIE4),
  // S_SPOS_DIE4 (225)
  S(SpriteNum.SPR_SPOS, 10, 5, StateNum.S_SPOS_DIE5),
  // S_SPOS_DIE5 (226)
  S(SpriteNum.SPR_SPOS, 11, -1, StateNum.S_NULL),
  // S_SPOS_XDIE1 (227)
  S(SpriteNum.SPR_SPOS, 12, 5, StateNum.S_SPOS_XDIE2),
  // S_SPOS_XDIE2 (228)
  S(SpriteNum.SPR_SPOS, 13, 5, StateNum.S_SPOS_XDIE3),
  // S_SPOS_XDIE3 (229)
  S(SpriteNum.SPR_SPOS, 14, 5, StateNum.S_SPOS_XDIE4),
  // S_SPOS_XDIE4 (230)
  S(SpriteNum.SPR_SPOS, 15, 5, StateNum.S_SPOS_XDIE5),
  // S_SPOS_XDIE5 (231)
  S(SpriteNum.SPR_SPOS, 16, 5, StateNum.S_SPOS_XDIE6),
  // S_SPOS_XDIE6 (232)
  S(SpriteNum.SPR_SPOS, 17, 5, StateNum.S_SPOS_XDIE7),
  // S_SPOS_XDIE7 (233)
  S(SpriteNum.SPR_SPOS, 18, 5, StateNum.S_SPOS_XDIE8),
  // S_SPOS_XDIE8 (234)
  S(SpriteNum.SPR_SPOS, 19, 5, StateNum.S_SPOS_XDIE9),
  // S_SPOS_XDIE9 (235)
  S(SpriteNum.SPR_SPOS, 20, -1, StateNum.S_NULL),
  // S_SPOS_RAISE1 (236)
  S(SpriteNum.SPR_SPOS, 11, 5, StateNum.S_SPOS_RAISE2),
  // S_SPOS_RAISE2 (237)
  S(SpriteNum.SPR_SPOS, 10, 5, StateNum.S_SPOS_RAISE3),
  // S_SPOS_RAISE3 (238)
  S(SpriteNum.SPR_SPOS, 9, 5, StateNum.S_SPOS_RAISE4),
  // S_SPOS_RAISE4 (239)
  S(SpriteNum.SPR_SPOS, 8, 5, StateNum.S_SPOS_RAISE5),
  // S_SPOS_RAISE5 (240)
  S(SpriteNum.SPR_SPOS, 7, 5, StateNum.S_SPOS_RUN1),
  // S_VILE_STND (241)
  S(SpriteNum.SPR_VILE, 0, 10, StateNum.S_VILE_STND2),
  // S_VILE_STND2 (242)
  S(SpriteNum.SPR_VILE, 1, 10, StateNum.S_VILE_STND),
  // S_VILE_RUN1 (243)
  S(SpriteNum.SPR_VILE, 0, 2, StateNum.S_VILE_RUN2),
  // S_VILE_RUN2 (244)
  S(SpriteNum.SPR_VILE, 0, 2, StateNum.S_VILE_RUN3),
  // S_VILE_RUN3 (245)
  S(SpriteNum.SPR_VILE, 1, 2, StateNum.S_VILE_RUN4),
  // S_VILE_RUN4 (246)
  S(SpriteNum.SPR_VILE, 1, 2, StateNum.S_VILE_RUN5),
  // S_VILE_RUN5 (247)
  S(SpriteNum.SPR_VILE, 2, 2, StateNum.S_VILE_RUN6),
  // S_VILE_RUN6 (248)
  S(SpriteNum.SPR_VILE, 2, 2, StateNum.S_VILE_RUN7),
  // S_VILE_RUN7 (249)
  S(SpriteNum.SPR_VILE, 3, 2, StateNum.S_VILE_RUN8),
  // S_VILE_RUN8 (250)
  S(SpriteNum.SPR_VILE, 3, 2, StateNum.S_VILE_RUN9),
  // S_VILE_RUN9 (251)
  S(SpriteNum.SPR_VILE, 4, 2, StateNum.S_VILE_RUN10),
  // S_VILE_RUN10 (252)
  S(SpriteNum.SPR_VILE, 4, 2, StateNum.S_VILE_RUN11),
  // S_VILE_RUN11 (253)
  S(SpriteNum.SPR_VILE, 5, 2, StateNum.S_VILE_RUN12),
  // S_VILE_RUN12 (254)
  S(SpriteNum.SPR_VILE, 5, 2, StateNum.S_VILE_RUN1),
  // S_VILE_ATK1 (255)
  S(SpriteNum.SPR_VILE, 6|F, 0, StateNum.S_VILE_ATK2),
  // S_VILE_ATK2 (256)
  S(SpriteNum.SPR_VILE, 6|F, 10, StateNum.S_VILE_ATK3),
  // S_VILE_ATK3 (257)
  S(SpriteNum.SPR_VILE, 7|F, 8, StateNum.S_VILE_ATK4),
  // S_VILE_ATK4 (258)
  S(SpriteNum.SPR_VILE, 8|F, 8, StateNum.S_VILE_ATK5),
  // S_VILE_ATK5 (259)
  S(SpriteNum.SPR_VILE, 9|F, 8, StateNum.S_VILE_ATK6),
  // S_VILE_ATK6 (260)
  S(SpriteNum.SPR_VILE, 10|F, 8, StateNum.S_VILE_ATK7),
  // S_VILE_ATK7 (261)
  S(SpriteNum.SPR_VILE, 11|F, 8, StateNum.S_VILE_ATK8),
  // S_VILE_ATK8 (262)
  S(SpriteNum.SPR_VILE, 12|F, 8, StateNum.S_VILE_ATK9),
  // S_VILE_ATK9 (263)
  S(SpriteNum.SPR_VILE, 13|F, 8, StateNum.S_VILE_ATK10),
  // S_VILE_ATK10 (264)
  S(SpriteNum.SPR_VILE, 14|F, 8, StateNum.S_VILE_ATK11),
  // S_VILE_ATK11 (265)
  S(SpriteNum.SPR_VILE, 15|F, 20, StateNum.S_VILE_RUN1),
  // S_VILE_HEAL1 (266)
  S(SpriteNum.SPR_VILE, 16|F, 10, StateNum.S_VILE_HEAL2),
  // S_VILE_HEAL2 (267)
  S(SpriteNum.SPR_VILE, 17|F, 10, StateNum.S_VILE_HEAL3),
  // S_VILE_HEAL3 (268)
  S(SpriteNum.SPR_VILE, 18|F, 10, StateNum.S_VILE_RUN1),
  // S_VILE_PAIN (269)
  S(SpriteNum.SPR_VILE, 19, 5, StateNum.S_VILE_PAIN2),
  // S_VILE_PAIN2 (270)
  S(SpriteNum.SPR_VILE, 19, 5, StateNum.S_VILE_RUN1),
  // S_VILE_DIE1 (271)
  S(SpriteNum.SPR_VILE, 20, 7, StateNum.S_VILE_DIE2),
  // S_VILE_DIE2 (272)
  S(SpriteNum.SPR_VILE, 21, 7, StateNum.S_VILE_DIE3),
  // S_VILE_DIE3 (273)
  S(SpriteNum.SPR_VILE, 22, 7, StateNum.S_VILE_DIE4),
  // S_VILE_DIE4 (274)
  S(SpriteNum.SPR_VILE, 23, 7, StateNum.S_VILE_DIE5),
  // S_VILE_DIE5 (275)
  S(SpriteNum.SPR_VILE, 24, 7, StateNum.S_VILE_DIE6),
  // S_VILE_DIE6 (276)
  S(SpriteNum.SPR_VILE, 25, 7, StateNum.S_VILE_DIE7),
  // S_VILE_DIE7 (277)
  S(SpriteNum.SPR_VILE, 26, 7, StateNum.S_VILE_DIE8),
  // S_VILE_DIE8 (278)
  S(SpriteNum.SPR_VILE, 27, 5, StateNum.S_VILE_DIE9),
  // S_VILE_DIE9 (279)
  S(SpriteNum.SPR_VILE, 28, 5, StateNum.S_VILE_DIE10),
  // S_VILE_DIE10 (280)
  S(SpriteNum.SPR_VILE, 29, -1, StateNum.S_NULL),
  // S_FIRE1 (281)
  S(SpriteNum.SPR_FIRE, 0|F, 2, StateNum.S_FIRE2),
  // S_FIRE2 (282)
  S(SpriteNum.SPR_FIRE, 1|F, 2, StateNum.S_FIRE3),
  // S_FIRE3 (283)
  S(SpriteNum.SPR_FIRE, 0|F, 2, StateNum.S_FIRE4),
  // S_FIRE4 (284)
  S(SpriteNum.SPR_FIRE, 1|F, 2, StateNum.S_FIRE5),
  // S_FIRE5 (285)
  S(SpriteNum.SPR_FIRE, 2|F, 2, StateNum.S_FIRE6),
  // S_FIRE6 (286)
  S(SpriteNum.SPR_FIRE, 1|F, 2, StateNum.S_FIRE7),
  // S_FIRE7 (287)
  S(SpriteNum.SPR_FIRE, 2|F, 2, StateNum.S_FIRE8),
  // S_FIRE8 (288)
  S(SpriteNum.SPR_FIRE, 1|F, 2, StateNum.S_FIRE9),
  // S_FIRE9 (289)
  S(SpriteNum.SPR_FIRE, 2|F, 2, StateNum.S_FIRE10),
  // S_FIRE10 (290)
  S(SpriteNum.SPR_FIRE, 3|F, 2, StateNum.S_FIRE11),
  // S_FIRE11 (291)
  S(SpriteNum.SPR_FIRE, 2|F, 2, StateNum.S_FIRE12),
  // S_FIRE12 (292)
  S(SpriteNum.SPR_FIRE, 3|F, 2, StateNum.S_FIRE13),
  // S_FIRE13 (293)
  S(SpriteNum.SPR_FIRE, 2|F, 2, StateNum.S_FIRE14),
  // S_FIRE14 (294)
  S(SpriteNum.SPR_FIRE, 3|F, 2, StateNum.S_FIRE15),
  // S_FIRE15 (295)
  S(SpriteNum.SPR_FIRE, 4|F, 2, StateNum.S_FIRE16),
  // S_FIRE16 (296)
  S(SpriteNum.SPR_FIRE, 3|F, 2, StateNum.S_FIRE17),
  // S_FIRE17 (297)
  S(SpriteNum.SPR_FIRE, 4|F, 2, StateNum.S_FIRE18),
  // S_FIRE18 (298)
  S(SpriteNum.SPR_FIRE, 3|F, 2, StateNum.S_FIRE19),
  // S_FIRE19 (299)
  S(SpriteNum.SPR_FIRE, 4|F, 2, StateNum.S_FIRE20),
  // S_FIRE20 (300)
  S(SpriteNum.SPR_FIRE, 5|F, 2, StateNum.S_FIRE21),
  // S_FIRE21 (301)
  S(SpriteNum.SPR_FIRE, 4|F, 2, StateNum.S_FIRE22),
  // S_FIRE22 (302)
  S(SpriteNum.SPR_FIRE, 5|F, 2, StateNum.S_FIRE23),
  // S_FIRE23 (303)
  S(SpriteNum.SPR_FIRE, 4|F, 2, StateNum.S_FIRE24),
  // S_FIRE24 (304)
  S(SpriteNum.SPR_FIRE, 5|F, 2, StateNum.S_FIRE25),
  // S_FIRE25 (305)
  S(SpriteNum.SPR_FIRE, 6|F, 2, StateNum.S_FIRE26),
  // S_FIRE26 (306)
  S(SpriteNum.SPR_FIRE, 7|F, 2, StateNum.S_FIRE27),
  // S_FIRE27 (307)
  S(SpriteNum.SPR_FIRE, 6|F, 2, StateNum.S_FIRE28),
  // S_FIRE28 (308)
  S(SpriteNum.SPR_FIRE, 7|F, 2, StateNum.S_FIRE29),
  // S_FIRE29 (309)
  S(SpriteNum.SPR_FIRE, 6|F, 2, StateNum.S_FIRE30),
  // S_FIRE30 (310)
  S(SpriteNum.SPR_FIRE, 7|F, 2, StateNum.S_NULL),
  // S_SKEL_STND (311)
  S(SpriteNum.SPR_SKEL, 0, 10, StateNum.S_SKEL_STND2),
  // S_SKEL_STND2 (312)
  S(SpriteNum.SPR_SKEL, 1, 10, StateNum.S_SKEL_STND),
  // S_SKEL_RUN1 (313)
  S(SpriteNum.SPR_SKEL, 0, 2, StateNum.S_SKEL_RUN2),
  // S_SKEL_RUN2 (314)
  S(SpriteNum.SPR_SKEL, 0, 2, StateNum.S_SKEL_RUN3),
  // S_SKEL_RUN3 (315)
  S(SpriteNum.SPR_SKEL, 1, 2, StateNum.S_SKEL_RUN4),
  // S_SKEL_RUN4 (316)
  S(SpriteNum.SPR_SKEL, 1, 2, StateNum.S_SKEL_RUN5),
  // S_SKEL_RUN5 (317)
  S(SpriteNum.SPR_SKEL, 2, 2, StateNum.S_SKEL_RUN6),
  // S_SKEL_RUN6 (318)
  S(SpriteNum.SPR_SKEL, 2, 2, StateNum.S_SKEL_RUN7),
  // S_SKEL_RUN7 (319)
  S(SpriteNum.SPR_SKEL, 3, 2, StateNum.S_SKEL_RUN8),
  // S_SKEL_RUN8 (320)
  S(SpriteNum.SPR_SKEL, 3, 2, StateNum.S_SKEL_RUN9),
  // S_SKEL_RUN9 (321)
  S(SpriteNum.SPR_SKEL, 4, 2, StateNum.S_SKEL_RUN10),
  // S_SKEL_RUN10 (322)
  S(SpriteNum.SPR_SKEL, 4, 2, StateNum.S_SKEL_RUN11),
  // S_SKEL_RUN11 (323)
  S(SpriteNum.SPR_SKEL, 5, 2, StateNum.S_SKEL_RUN12),
  // S_SKEL_RUN12 (324)
  S(SpriteNum.SPR_SKEL, 5, 2, StateNum.S_SKEL_RUN1),
  // S_SKEL_FIST1 (325)
  S(SpriteNum.SPR_SKEL, 6, 0, StateNum.S_SKEL_FIST2),
  // S_SKEL_FIST2 (326)
  S(SpriteNum.SPR_SKEL, 6, 6, StateNum.S_SKEL_FIST3),
  // S_SKEL_FIST3 (327)
  S(SpriteNum.SPR_SKEL, 7, 6, StateNum.S_SKEL_FIST4),
  // S_SKEL_FIST4 (328)
  S(SpriteNum.SPR_SKEL, 8, 6, StateNum.S_SKEL_RUN1),
  // S_SKEL_MISS1 (329)
  S(SpriteNum.SPR_SKEL, 9|F, 0, StateNum.S_SKEL_MISS2),
  // S_SKEL_MISS2 (330)
  S(SpriteNum.SPR_SKEL, 9|F, 10, StateNum.S_SKEL_MISS3),
  // S_SKEL_MISS3 (331)
  S(SpriteNum.SPR_SKEL, 10, 10, StateNum.S_SKEL_MISS4),
  // S_SKEL_MISS4 (332)
  S(SpriteNum.SPR_SKEL, 10, 10, StateNum.S_SKEL_RUN1),
  // S_SKEL_PAIN (333)
  S(SpriteNum.SPR_SKEL, 11, 5, StateNum.S_SKEL_PAIN2),
  // S_SKEL_PAIN2 (334)
  S(SpriteNum.SPR_SKEL, 11, 5, StateNum.S_SKEL_RUN1),
  // S_SKEL_DIE1 (335)
  S(SpriteNum.SPR_SKEL, 11, 7, StateNum.S_SKEL_DIE2),
  // S_SKEL_DIE2 (336)
  S(SpriteNum.SPR_SKEL, 12, 7, StateNum.S_SKEL_DIE3),
  // S_SKEL_DIE3 (337)
  S(SpriteNum.SPR_SKEL, 13, 7, StateNum.S_SKEL_DIE4),
  // S_SKEL_DIE4 (338)
  S(SpriteNum.SPR_SKEL, 14, 7, StateNum.S_SKEL_DIE5),
  // S_SKEL_DIE5 (339)
  S(SpriteNum.SPR_SKEL, 15, 7, StateNum.S_SKEL_DIE6),
  // S_SKEL_DIE6 (340)
  S(SpriteNum.SPR_SKEL, 16, -1, StateNum.S_NULL),
  // S_SKEL_RAISE1 (341)
  S(SpriteNum.SPR_SKEL, 16, 5, StateNum.S_SKEL_RAISE2),
  // S_SKEL_RAISE2 (342)
  S(SpriteNum.SPR_SKEL, 15, 5, StateNum.S_SKEL_RAISE3),
  // S_SKEL_RAISE3 (343)
  S(SpriteNum.SPR_SKEL, 14, 5, StateNum.S_SKEL_RAISE4),
  // S_SKEL_RAISE4 (344)
  S(SpriteNum.SPR_SKEL, 13, 5, StateNum.S_SKEL_RAISE5),
  // S_SKEL_RAISE5 (345)
  S(SpriteNum.SPR_SKEL, 12, 5, StateNum.S_SKEL_RAISE6),
  // S_SKEL_RAISE6 (346)
  S(SpriteNum.SPR_SKEL, 11, 5, StateNum.S_SKEL_RUN1),
  // S_TRACER
  S(SpriteNum.SPR_FATB, 0|F, 2, StateNum.S_TRACER2),
  // S_TRACER2
  S(SpriteNum.SPR_FATB, 1|F, 2, StateNum.S_TRACER),
  // S_TRACEEXP1
  S(SpriteNum.SPR_FBXP, 0|F, 8, StateNum.S_TRACEEXP2),
  // S_TRACEEXP2
  S(SpriteNum.SPR_FBXP, 1|F, 6, StateNum.S_TRACEEXP3),
  // S_TRACEEXP3
  S(SpriteNum.SPR_FBXP, 2|F, 4, StateNum.S_NULL),
  // S_SMOKE1
  S(SpriteNum.SPR_PUFF, 1, 4, StateNum.S_SMOKE2),
  // S_SMOKE2
  S(SpriteNum.SPR_PUFF, 2, 4, StateNum.S_SMOKE3),
  // S_SMOKE3
  S(SpriteNum.SPR_PUFF, 1, 4, StateNum.S_SMOKE4),
  // S_SMOKE4
  S(SpriteNum.SPR_PUFF, 2, 4, StateNum.S_SMOKE5),
  // S_SMOKE5
  S(SpriteNum.SPR_PUFF, 3, 4, StateNum.S_NULL),
  // S_FATSHOT1
  S(SpriteNum.SPR_MANF, 0|F, 4, StateNum.S_FATSHOT2),
  // S_FATSHOT2 (348)
  S(SpriteNum.SPR_MANF, 1|F, 4, StateNum.S_FATSHOT1),
  // S_FATSHOTX1 (349)
  S(SpriteNum.SPR_MISL, 1|F, 8, StateNum.S_FATSHOTX2),
  // S_FATSHOTX2 (350)
  S(SpriteNum.SPR_MISL, 2|F, 6, StateNum.S_FATSHOTX3),
  // S_FATSHOTX3 (351)
  S(SpriteNum.SPR_MISL, 3|F, 4, StateNum.S_NULL),
  // S_FATT_STND (352)
  S(SpriteNum.SPR_FATT, 0, 15, StateNum.S_FATT_STND2),
  // S_FATT_STND2 (353)
  S(SpriteNum.SPR_FATT, 1, 15, StateNum.S_FATT_STND),
  // S_FATT_RUN1 (354)
  S(SpriteNum.SPR_FATT, 0, 4, StateNum.S_FATT_RUN2),
  // S_FATT_RUN2 (355)
  S(SpriteNum.SPR_FATT, 0, 4, StateNum.S_FATT_RUN3),
  // S_FATT_RUN3 (356)
  S(SpriteNum.SPR_FATT, 1, 4, StateNum.S_FATT_RUN4),
  // S_FATT_RUN4 (357)
  S(SpriteNum.SPR_FATT, 1, 4, StateNum.S_FATT_RUN5),
  // S_FATT_RUN5 (358)
  S(SpriteNum.SPR_FATT, 2, 4, StateNum.S_FATT_RUN6),
  // S_FATT_RUN6 (359)
  S(SpriteNum.SPR_FATT, 2, 4, StateNum.S_FATT_RUN7),
  // S_FATT_RUN7 (360)
  S(SpriteNum.SPR_FATT, 3, 4, StateNum.S_FATT_RUN8),
  // S_FATT_RUN8 (361)
  S(SpriteNum.SPR_FATT, 3, 4, StateNum.S_FATT_RUN9),
  // S_FATT_RUN9 (362)
  S(SpriteNum.SPR_FATT, 4, 4, StateNum.S_FATT_RUN10),
  // S_FATT_RUN10 (363)
  S(SpriteNum.SPR_FATT, 4, 4, StateNum.S_FATT_RUN11),
  // S_FATT_RUN11 (364)
  S(SpriteNum.SPR_FATT, 5, 4, StateNum.S_FATT_RUN12),
  // S_FATT_RUN12 (365)
  S(SpriteNum.SPR_FATT, 5, 4, StateNum.S_FATT_RUN1),
  // S_FATT_ATK1 (366)
  S(SpriteNum.SPR_FATT, 6, 20, StateNum.S_FATT_ATK2),
  // S_FATT_ATK2 (367)
  S(SpriteNum.SPR_FATT, 7|F, 10, StateNum.S_FATT_ATK3),
  // S_FATT_ATK3 (368)
  S(SpriteNum.SPR_FATT, 8, 5, StateNum.S_FATT_ATK4),
  // S_FATT_ATK4 (369)
  S(SpriteNum.SPR_FATT, 6, 5, StateNum.S_FATT_ATK5),
  // S_FATT_ATK5 (370)
  S(SpriteNum.SPR_FATT, 7|F, 10, StateNum.S_FATT_ATK6),
  // S_FATT_ATK6 (371)
  S(SpriteNum.SPR_FATT, 8, 5, StateNum.S_FATT_ATK7),
  // S_FATT_ATK7 (372)
  S(SpriteNum.SPR_FATT, 6, 5, StateNum.S_FATT_ATK8),
  // S_FATT_ATK8 (373)
  S(SpriteNum.SPR_FATT, 7|F, 10, StateNum.S_FATT_ATK9),
  // S_FATT_ATK9 (374)
  S(SpriteNum.SPR_FATT, 8, 5, StateNum.S_FATT_ATK10),
  // S_FATT_ATK10 (375)
  S(SpriteNum.SPR_FATT, 6, 5, StateNum.S_FATT_RUN1),
  // S_FATT_PAIN (376)
  S(SpriteNum.SPR_FATT, 9, 3, StateNum.S_FATT_PAIN2),
  // S_FATT_PAIN2 (377)
  S(SpriteNum.SPR_FATT, 9, 3, StateNum.S_FATT_RUN1),
  // S_FATT_DIE1 (378)
  S(SpriteNum.SPR_FATT, 10, 6, StateNum.S_FATT_DIE2),
  // S_FATT_DIE2 (379)
  S(SpriteNum.SPR_FATT, 11, 6, StateNum.S_FATT_DIE3),
  // S_FATT_DIE3 (380)
  S(SpriteNum.SPR_FATT, 12, 6, StateNum.S_FATT_DIE4),
  // S_FATT_DIE4 (381)
  S(SpriteNum.SPR_FATT, 13, 6, StateNum.S_FATT_DIE5),
  // S_FATT_DIE5 (382)
  S(SpriteNum.SPR_FATT, 14, 6, StateNum.S_FATT_DIE6),
  // S_FATT_DIE6 (383)
  S(SpriteNum.SPR_FATT, 15, 6, StateNum.S_FATT_DIE7),
  // S_FATT_DIE7 (384)
  S(SpriteNum.SPR_FATT, 16, 6, StateNum.S_FATT_DIE8),
  // S_FATT_DIE8 (385)
  S(SpriteNum.SPR_FATT, 17, 6, StateNum.S_FATT_DIE9),
  // S_FATT_DIE9 (386)
  S(SpriteNum.SPR_FATT, 18, 6, StateNum.S_FATT_DIE10),
  // S_FATT_DIE10 (387)
  S(SpriteNum.SPR_FATT, 19, -1, StateNum.S_NULL),
  // S_FATT_RAISE1 (388)
  S(SpriteNum.SPR_FATT, 17, 5, StateNum.S_FATT_RAISE2),
  // S_FATT_RAISE2 (389)
  S(SpriteNum.SPR_FATT, 16, 5, StateNum.S_FATT_RAISE3),
  // S_FATT_RAISE3 (390)
  S(SpriteNum.SPR_FATT, 15, 5, StateNum.S_FATT_RAISE4),
  // S_FATT_RAISE4 (391)
  S(SpriteNum.SPR_FATT, 14, 5, StateNum.S_FATT_RAISE5),
  // S_FATT_RAISE5 (392)
  S(SpriteNum.SPR_FATT, 13, 5, StateNum.S_FATT_RAISE6),
  // S_FATT_RAISE6 (393)
  S(SpriteNum.SPR_FATT, 12, 5, StateNum.S_FATT_RAISE7),
  // S_FATT_RAISE7 (394)
  S(SpriteNum.SPR_FATT, 11, 5, StateNum.S_FATT_RAISE8),
  // S_FATT_RAISE8 (395)
  S(SpriteNum.SPR_FATT, 10, 5, StateNum.S_FATT_RUN1),
  // S_CPOS_STND (396)
  S(SpriteNum.SPR_CPOS, 0, 10, StateNum.S_CPOS_STND2),
  // S_CPOS_STND2 (397)
  S(SpriteNum.SPR_CPOS, 1, 10, StateNum.S_CPOS_STND),
  // S_CPOS_RUN1 (398)
  S(SpriteNum.SPR_CPOS, 0, 3, StateNum.S_CPOS_RUN2),
  // S_CPOS_RUN2 (399)
  S(SpriteNum.SPR_CPOS, 0, 3, StateNum.S_CPOS_RUN3),
  // S_CPOS_RUN3 (400)
  S(SpriteNum.SPR_CPOS, 1, 3, StateNum.S_CPOS_RUN4),
  // S_CPOS_RUN4 (401)
  S(SpriteNum.SPR_CPOS, 1, 3, StateNum.S_CPOS_RUN5),
  // S_CPOS_RUN5 (402)
  S(SpriteNum.SPR_CPOS, 2, 3, StateNum.S_CPOS_RUN6),
  // S_CPOS_RUN6 (403)
  S(SpriteNum.SPR_CPOS, 2, 3, StateNum.S_CPOS_RUN7),
  // S_CPOS_RUN7 (404)
  S(SpriteNum.SPR_CPOS, 3, 3, StateNum.S_CPOS_RUN8),
  // S_CPOS_RUN8 (405)
  S(SpriteNum.SPR_CPOS, 3, 3, StateNum.S_CPOS_RUN1),
  // S_CPOS_ATK1 (406)
  S(SpriteNum.SPR_CPOS, 4, 10, StateNum.S_CPOS_ATK2),
  // S_CPOS_ATK2 (407)
  S(SpriteNum.SPR_CPOS, 5|F, 4, StateNum.S_CPOS_ATK3),
  // S_CPOS_ATK3 (408)
  S(SpriteNum.SPR_CPOS, 4|F, 4, StateNum.S_CPOS_ATK4),
  // S_CPOS_ATK4 (409)
  S(SpriteNum.SPR_CPOS, 5, 1, StateNum.S_CPOS_RUN1),
  // S_CPOS_PAIN (410)
  S(SpriteNum.SPR_CPOS, 6, 3, StateNum.S_CPOS_PAIN2),
  // S_CPOS_PAIN2 (411)
  S(SpriteNum.SPR_CPOS, 6, 3, StateNum.S_CPOS_RUN1),
  // S_CPOS_DIE1 (412)
  S(SpriteNum.SPR_CPOS, 7, 5, StateNum.S_CPOS_DIE2),
  // S_CPOS_DIE2 (413)
  S(SpriteNum.SPR_CPOS, 8, 5, StateNum.S_CPOS_DIE3),
  // S_CPOS_DIE3 (414)
  S(SpriteNum.SPR_CPOS, 9, 5, StateNum.S_CPOS_DIE4),
  // S_CPOS_DIE4 (415)
  S(SpriteNum.SPR_CPOS, 10, 5, StateNum.S_CPOS_DIE5),
  // S_CPOS_DIE5 (416)
  S(SpriteNum.SPR_CPOS, 11, 5, StateNum.S_CPOS_DIE6),
  // S_CPOS_DIE6 (417)
  S(SpriteNum.SPR_CPOS, 12, 5, StateNum.S_CPOS_DIE7),
  // S_CPOS_DIE7 (418)
  S(SpriteNum.SPR_CPOS, 13, -1, StateNum.S_NULL),
  // S_CPOS_XDIE1 (419)
  S(SpriteNum.SPR_CPOS, 14, 5, StateNum.S_CPOS_XDIE2),
  // S_CPOS_XDIE2 (420)
  S(SpriteNum.SPR_CPOS, 15, 5, StateNum.S_CPOS_XDIE3),
  // S_CPOS_XDIE3 (421)
  S(SpriteNum.SPR_CPOS, 16, 5, StateNum.S_CPOS_XDIE4),
  // S_CPOS_XDIE4 (422)
  S(SpriteNum.SPR_CPOS, 17, 5, StateNum.S_CPOS_XDIE5),
  // S_CPOS_XDIE5 (423)
  S(SpriteNum.SPR_CPOS, 18, 5, StateNum.S_CPOS_XDIE6),
  // S_CPOS_XDIE6 (424)
  S(SpriteNum.SPR_CPOS, 19, -1, StateNum.S_NULL),
  // S_CPOS_RAISE1 (425)
  S(SpriteNum.SPR_CPOS, 13, 5, StateNum.S_CPOS_RAISE2),
  // S_CPOS_RAISE2 (426)
  S(SpriteNum.SPR_CPOS, 12, 5, StateNum.S_CPOS_RAISE3),
  // S_CPOS_RAISE3 (427)
  S(SpriteNum.SPR_CPOS, 11, 5, StateNum.S_CPOS_RAISE4),
  // S_CPOS_RAISE4 (428)
  S(SpriteNum.SPR_CPOS, 10, 5, StateNum.S_CPOS_RAISE5),
  // S_CPOS_RAISE5 (429)
  S(SpriteNum.SPR_CPOS, 9, 5, StateNum.S_CPOS_RAISE6),
  // S_CPOS_RAISE6 (430)
  S(SpriteNum.SPR_CPOS, 8, 5, StateNum.S_CPOS_RAISE7),
  // S_CPOS_RAISE7 (431)
  S(SpriteNum.SPR_CPOS, 7, 5, StateNum.S_CPOS_RUN1),
  // S_TROO_STND (432)
  S(SpriteNum.SPR_TROO, 0, 10, StateNum.S_TROO_STND2),
  // S_TROO_STND2 (433)
  S(SpriteNum.SPR_TROO, 1, 10, StateNum.S_TROO_STND),
  // S_TROO_RUN1 (434)
  S(SpriteNum.SPR_TROO, 0, 3, StateNum.S_TROO_RUN2),
  // S_TROO_RUN2 (435)
  S(SpriteNum.SPR_TROO, 0, 3, StateNum.S_TROO_RUN3),
  // S_TROO_RUN3 (436)
  S(SpriteNum.SPR_TROO, 1, 3, StateNum.S_TROO_RUN4),
  // S_TROO_RUN4 (437)
  S(SpriteNum.SPR_TROO, 1, 3, StateNum.S_TROO_RUN5),
  // S_TROO_RUN5 (438)
  S(SpriteNum.SPR_TROO, 2, 3, StateNum.S_TROO_RUN6),
  // S_TROO_RUN6 (439)
  S(SpriteNum.SPR_TROO, 2, 3, StateNum.S_TROO_RUN7),
  // S_TROO_RUN7 (440)
  S(SpriteNum.SPR_TROO, 3, 3, StateNum.S_TROO_RUN8),
  // S_TROO_RUN8 (441)
  S(SpriteNum.SPR_TROO, 3, 3, StateNum.S_TROO_RUN1),
  // S_TROO_ATK1 (442)
  S(SpriteNum.SPR_TROO, 4, 8, StateNum.S_TROO_ATK2),
  // S_TROO_ATK2 (443)
  S(SpriteNum.SPR_TROO, 5, 8, StateNum.S_TROO_ATK3),
  // S_TROO_ATK3 (444)
  S(SpriteNum.SPR_TROO, 6, 6, StateNum.S_TROO_RUN1),
  // S_TROO_PAIN (445)
  S(SpriteNum.SPR_TROO, 7, 2, StateNum.S_TROO_PAIN2),
  // S_TROO_PAIN2 (446)
  S(SpriteNum.SPR_TROO, 7, 2, StateNum.S_TROO_RUN1),
  // S_TROO_DIE1 (447)
  S(SpriteNum.SPR_TROO, 8, 8, StateNum.S_TROO_DIE2),
  // S_TROO_DIE2 (448)
  S(SpriteNum.SPR_TROO, 9, 8, StateNum.S_TROO_DIE3),
  // S_TROO_DIE3 (449)
  S(SpriteNum.SPR_TROO, 10, 6, StateNum.S_TROO_DIE4),
  // S_TROO_DIE4 (450)
  S(SpriteNum.SPR_TROO, 11, 6, StateNum.S_TROO_DIE5),
  // S_TROO_DIE5 (451)
  S(SpriteNum.SPR_TROO, 12, -1, StateNum.S_NULL),
  // S_TROO_XDIE1 (452)
  S(SpriteNum.SPR_TROO, 13, 5, StateNum.S_TROO_XDIE2),
  // S_TROO_XDIE2 (453)
  S(SpriteNum.SPR_TROO, 14, 5, StateNum.S_TROO_XDIE3),
  // S_TROO_XDIE3 (454)
  S(SpriteNum.SPR_TROO, 15, 5, StateNum.S_TROO_XDIE4),
  // S_TROO_XDIE4 (455)
  S(SpriteNum.SPR_TROO, 16, 5, StateNum.S_TROO_XDIE5),
  // S_TROO_XDIE5 (456)
  S(SpriteNum.SPR_TROO, 17, 5, StateNum.S_TROO_XDIE6),
  // S_TROO_XDIE6 (457)
  S(SpriteNum.SPR_TROO, 18, 5, StateNum.S_TROO_XDIE7),
  // S_TROO_XDIE7 (458)
  S(SpriteNum.SPR_TROO, 19, 5, StateNum.S_TROO_XDIE8),
  // S_TROO_XDIE8 (459)
  S(SpriteNum.SPR_TROO, 20, -1, StateNum.S_NULL),
  // S_TROO_RAISE1 (460)
  S(SpriteNum.SPR_TROO, 12, 8, StateNum.S_TROO_RAISE2),
  // S_TROO_RAISE2 (461)
  S(SpriteNum.SPR_TROO, 11, 8, StateNum.S_TROO_RAISE3),
  // S_TROO_RAISE3 (462)
  S(SpriteNum.SPR_TROO, 10, 6, StateNum.S_TROO_RAISE4),
  // S_TROO_RAISE4 (463)
  S(SpriteNum.SPR_TROO, 9, 6, StateNum.S_TROO_RAISE5),
  // S_TROO_RAISE5 (464)
  S(SpriteNum.SPR_TROO, 8, 6, StateNum.S_TROO_RUN1),
  // S_SARG_STND (465)
  S(SpriteNum.SPR_SARG, 0, 10, StateNum.S_SARG_STND2),
  // S_SARG_STND2 (466)
  S(SpriteNum.SPR_SARG, 1, 10, StateNum.S_SARG_STND),
  // S_SARG_RUN1 (467)
  S(SpriteNum.SPR_SARG, 0, 2, StateNum.S_SARG_RUN2),
  // S_SARG_RUN2 (468)
  S(SpriteNum.SPR_SARG, 0, 2, StateNum.S_SARG_RUN3),
  // S_SARG_RUN3 (469)
  S(SpriteNum.SPR_SARG, 1, 2, StateNum.S_SARG_RUN4),
  // S_SARG_RUN4 (470)
  S(SpriteNum.SPR_SARG, 1, 2, StateNum.S_SARG_RUN5),
  // S_SARG_RUN5 (471)
  S(SpriteNum.SPR_SARG, 2, 2, StateNum.S_SARG_RUN6),
  // S_SARG_RUN6 (472)
  S(SpriteNum.SPR_SARG, 2, 2, StateNum.S_SARG_RUN7),
  // S_SARG_RUN7 (473)
  S(SpriteNum.SPR_SARG, 3, 2, StateNum.S_SARG_RUN8),
  // S_SARG_RUN8 (474)
  S(SpriteNum.SPR_SARG, 3, 2, StateNum.S_SARG_RUN1),
  // S_SARG_ATK1 (475)
  S(SpriteNum.SPR_SARG, 4, 8, StateNum.S_SARG_ATK2),
  // S_SARG_ATK2 (476)
  S(SpriteNum.SPR_SARG, 5, 8, StateNum.S_SARG_ATK3),
  // S_SARG_ATK3 (477)
  S(SpriteNum.SPR_SARG, 6, 8, StateNum.S_SARG_RUN1),
  // S_SARG_PAIN (478)
  S(SpriteNum.SPR_SARG, 7, 2, StateNum.S_SARG_PAIN2),
  // S_SARG_PAIN2 (479)
  S(SpriteNum.SPR_SARG, 7, 2, StateNum.S_SARG_RUN1),
  // S_SARG_DIE1 (480)
  S(SpriteNum.SPR_SARG, 8, 8, StateNum.S_SARG_DIE2),
  // S_SARG_DIE2 (481)
  S(SpriteNum.SPR_SARG, 9, 8, StateNum.S_SARG_DIE3),
  // S_SARG_DIE3 (482)
  S(SpriteNum.SPR_SARG, 10, 4, StateNum.S_SARG_DIE4),
  // S_SARG_DIE4 (483)
  S(SpriteNum.SPR_SARG, 11, 4, StateNum.S_SARG_DIE5),
  // S_SARG_DIE5 (484)
  S(SpriteNum.SPR_SARG, 12, 4, StateNum.S_SARG_DIE6),
  // S_SARG_DIE6 (485)
  S(SpriteNum.SPR_SARG, 13, -1, StateNum.S_NULL),
  // S_SARG_RAISE1 (486)
  S(SpriteNum.SPR_SARG, 13, 5, StateNum.S_SARG_RAISE2),
  // S_SARG_RAISE2 (487)
  S(SpriteNum.SPR_SARG, 12, 5, StateNum.S_SARG_RAISE3),
  // S_SARG_RAISE3 (488)
  S(SpriteNum.SPR_SARG, 11, 5, StateNum.S_SARG_RAISE4),
  // S_SARG_RAISE4 (489)
  S(SpriteNum.SPR_SARG, 10, 5, StateNum.S_SARG_RAISE5),
  // S_SARG_RAISE5 (490)
  S(SpriteNum.SPR_SARG, 9, 5, StateNum.S_SARG_RAISE6),
  // S_SARG_RAISE6 (491)
  S(SpriteNum.SPR_SARG, 8, 5, StateNum.S_SARG_RUN1),
  // S_HEAD_STND (492)
  S(SpriteNum.SPR_HEAD, 0, 10, StateNum.S_HEAD_RUN1),
  // S_HEAD_RUN1 (493)
  S(SpriteNum.SPR_HEAD, 0, 3, StateNum.S_HEAD_RUN1),
  // S_HEAD_ATK1 (494)
  S(SpriteNum.SPR_HEAD, 1, 5, StateNum.S_HEAD_ATK2),
  // S_HEAD_ATK2 (495)
  S(SpriteNum.SPR_HEAD, 2, 5, StateNum.S_HEAD_ATK3),
  // S_HEAD_ATK3 (496)
  S(SpriteNum.SPR_HEAD, 3|F, 5, StateNum.S_HEAD_RUN1),
  // S_HEAD_PAIN (497)
  S(SpriteNum.SPR_HEAD, 4, 3, StateNum.S_HEAD_PAIN2),
  // S_HEAD_PAIN2 (498)
  S(SpriteNum.SPR_HEAD, 4, 3, StateNum.S_HEAD_PAIN3),
  // S_HEAD_PAIN3 (499)
  S(SpriteNum.SPR_HEAD, 4, 6, StateNum.S_HEAD_RUN1),
  // S_HEAD_DIE1 (500)
  S(SpriteNum.SPR_HEAD, 5, 8, StateNum.S_HEAD_DIE2),
  // S_HEAD_DIE2 (501)
  S(SpriteNum.SPR_HEAD, 6, 8, StateNum.S_HEAD_DIE3),
  // S_HEAD_DIE3 (502)
  S(SpriteNum.SPR_HEAD, 7, 8, StateNum.S_HEAD_DIE4),
  // S_HEAD_DIE4 (503)
  S(SpriteNum.SPR_HEAD, 8, 8, StateNum.S_HEAD_DIE5),
  // S_HEAD_DIE5 (504)
  S(SpriteNum.SPR_HEAD, 9, 8, StateNum.S_HEAD_DIE6),
  // S_HEAD_DIE6 (505)
  S(SpriteNum.SPR_HEAD, 10, -1, StateNum.S_NULL),
  // S_HEAD_RAISE1 (506)
  S(SpriteNum.SPR_HEAD, 10, 8, StateNum.S_HEAD_RAISE2),
  // S_HEAD_RAISE2 (507)
  S(SpriteNum.SPR_HEAD, 9, 8, StateNum.S_HEAD_RAISE3),
  // S_HEAD_RAISE3 (508)
  S(SpriteNum.SPR_HEAD, 8, 8, StateNum.S_HEAD_RAISE4),
  // S_HEAD_RAISE4 (509)
  S(SpriteNum.SPR_HEAD, 7, 8, StateNum.S_HEAD_RAISE5),
  // S_HEAD_RAISE5 (510)
  S(SpriteNum.SPR_HEAD, 6, 8, StateNum.S_HEAD_RAISE6),
  // S_HEAD_RAISE6 (511)
  S(SpriteNum.SPR_HEAD, 5, 8, StateNum.S_HEAD_RUN1),
  // S_BRBALL1 (512)
  S(SpriteNum.SPR_BAL7, 0|F, 4, StateNum.S_BRBALL2),
  // S_BRBALL2 (513)
  S(SpriteNum.SPR_BAL7, 1|F, 4, StateNum.S_BRBALL1),
  // S_BRBALLX1 (514)
  S(SpriteNum.SPR_BAL7, 2|F, 6, StateNum.S_BRBALLX2),
  // S_BRBALLX2 (515)
  S(SpriteNum.SPR_BAL7, 3|F, 6, StateNum.S_BRBALLX3),
  // S_BRBALLX3 (516)
  S(SpriteNum.SPR_BAL7, 4|F, 6, StateNum.S_NULL),
  // S_BOSS_STND (517)
  S(SpriteNum.SPR_BOSS, 0, 10, StateNum.S_BOSS_STND2),
  // S_BOSS_STND2 (518)
  S(SpriteNum.SPR_BOSS, 1, 10, StateNum.S_BOSS_STND),
  // S_BOSS_RUN1 (519)
  S(SpriteNum.SPR_BOSS, 0, 3, StateNum.S_BOSS_RUN2),
  // S_BOSS_RUN2 (520)
  S(SpriteNum.SPR_BOSS, 0, 3, StateNum.S_BOSS_RUN3),
  // S_BOSS_RUN3 (521)
  S(SpriteNum.SPR_BOSS, 1, 3, StateNum.S_BOSS_RUN4),
  // S_BOSS_RUN4 (522)
  S(SpriteNum.SPR_BOSS, 1, 3, StateNum.S_BOSS_RUN5),
  // S_BOSS_RUN5 (523)
  S(SpriteNum.SPR_BOSS, 2, 3, StateNum.S_BOSS_RUN6),
  // S_BOSS_RUN6 (524)
  S(SpriteNum.SPR_BOSS, 2, 3, StateNum.S_BOSS_RUN7),
  // S_BOSS_RUN7 (525)
  S(SpriteNum.SPR_BOSS, 3, 3, StateNum.S_BOSS_RUN8),
  // S_BOSS_RUN8 (526)
  S(SpriteNum.SPR_BOSS, 3, 3, StateNum.S_BOSS_RUN1),
  // S_BOSS_ATK1 (527)
  S(SpriteNum.SPR_BOSS, 4, 8, StateNum.S_BOSS_ATK2),
  // S_BOSS_ATK2 (528)
  S(SpriteNum.SPR_BOSS, 5, 8, StateNum.S_BOSS_ATK3),
  // S_BOSS_ATK3 (529)
  S(SpriteNum.SPR_BOSS, 6|F, 8, StateNum.S_BOSS_RUN1),
  // S_BOSS_PAIN (530)
  S(SpriteNum.SPR_BOSS, 7, 2, StateNum.S_BOSS_PAIN2),
  // S_BOSS_PAIN2 (531)
  S(SpriteNum.SPR_BOSS, 7, 2, StateNum.S_BOSS_RUN1),
  // S_BOSS_DIE1 (532)
  S(SpriteNum.SPR_BOSS, 8, 8, StateNum.S_BOSS_DIE2),
  // S_BOSS_DIE2 (533)
  S(SpriteNum.SPR_BOSS, 9, 8, StateNum.S_BOSS_DIE3),
  // S_BOSS_DIE3 (534)
  S(SpriteNum.SPR_BOSS, 10, 8, StateNum.S_BOSS_DIE4),
  // S_BOSS_DIE4 (535)
  S(SpriteNum.SPR_BOSS, 11, 8, StateNum.S_BOSS_DIE5),
  // S_BOSS_DIE5 (536)
  S(SpriteNum.SPR_BOSS, 12, 8, StateNum.S_BOSS_DIE6),
  // S_BOSS_DIE6 (537)
  S(SpriteNum.SPR_BOSS, 13, 8, StateNum.S_BOSS_DIE7),
  // S_BOSS_DIE7 (538)
  S(SpriteNum.SPR_BOSS, 14, -1, StateNum.S_NULL),
  // S_BOSS_RAISE1 (539)
  S(SpriteNum.SPR_BOSS, 14, 8, StateNum.S_BOSS_RAISE2),
  // S_BOSS_RAISE2 (540)
  S(SpriteNum.SPR_BOSS, 13, 8, StateNum.S_BOSS_RAISE3),
  // S_BOSS_RAISE3 (541)
  S(SpriteNum.SPR_BOSS, 12, 8, StateNum.S_BOSS_RAISE4),
  // S_BOSS_RAISE4 (542)
  S(SpriteNum.SPR_BOSS, 11, 8, StateNum.S_BOSS_RAISE5),
  // S_BOSS_RAISE5 (543)
  S(SpriteNum.SPR_BOSS, 10, 8, StateNum.S_BOSS_RAISE6),
  // S_BOSS_RAISE6 (544)
  S(SpriteNum.SPR_BOSS, 9, 8, StateNum.S_BOSS_RAISE7),
  // S_BOSS_RAISE7 (545)
  S(SpriteNum.SPR_BOSS, 8, 8, StateNum.S_BOSS_RUN1),
  // S_BOS2_STND (546)
  S(SpriteNum.SPR_BOS2, 0, 10, StateNum.S_BOS2_STND2),
  // S_BOS2_STND2 (547)
  S(SpriteNum.SPR_BOS2, 1, 10, StateNum.S_BOS2_STND),
  // S_BOS2_RUN1 (548)
  S(SpriteNum.SPR_BOS2, 0, 3, StateNum.S_BOS2_RUN2),
  // S_BOS2_RUN2 (549)
  S(SpriteNum.SPR_BOS2, 0, 3, StateNum.S_BOS2_RUN3),
  // S_BOS2_RUN3 (550)
  S(SpriteNum.SPR_BOS2, 1, 3, StateNum.S_BOS2_RUN4),
  // S_BOS2_RUN4 (551)
  S(SpriteNum.SPR_BOS2, 1, 3, StateNum.S_BOS2_RUN5),
  // S_BOS2_RUN5 (552)
  S(SpriteNum.SPR_BOS2, 2, 3, StateNum.S_BOS2_RUN6),
  // S_BOS2_RUN6 (553)
  S(SpriteNum.SPR_BOS2, 2, 3, StateNum.S_BOS2_RUN7),
  // S_BOS2_RUN7 (554)
  S(SpriteNum.SPR_BOS2, 3, 3, StateNum.S_BOS2_RUN8),
  // S_BOS2_RUN8 (555)
  S(SpriteNum.SPR_BOS2, 3, 3, StateNum.S_BOS2_RUN1),
  // S_BOS2_ATK1 (556)
  S(SpriteNum.SPR_BOS2, 4, 8, StateNum.S_BOS2_ATK2),
  // S_BOS2_ATK2 (557)
  S(SpriteNum.SPR_BOS2, 5, 8, StateNum.S_BOS2_ATK3),
  // S_BOS2_ATK3 (558)
  S(SpriteNum.SPR_BOS2, 6|F, 8, StateNum.S_BOS2_RUN1),
  // S_BOS2_PAIN (559)
  S(SpriteNum.SPR_BOS2, 7, 2, StateNum.S_BOS2_PAIN2),
  // S_BOS2_PAIN2 (560)
  S(SpriteNum.SPR_BOS2, 7, 2, StateNum.S_BOS2_RUN1),
  // S_BOS2_DIE1 (561)
  S(SpriteNum.SPR_BOS2, 8, 8, StateNum.S_BOS2_DIE2),
  // S_BOS2_DIE2 (562)
  S(SpriteNum.SPR_BOS2, 9, 8, StateNum.S_BOS2_DIE3),
  // S_BOS2_DIE3 (563)
  S(SpriteNum.SPR_BOS2, 10, 8, StateNum.S_BOS2_DIE4),
  // S_BOS2_DIE4 (564)
  S(SpriteNum.SPR_BOS2, 11, 8, StateNum.S_BOS2_DIE5),
  // S_BOS2_DIE5 (565)
  S(SpriteNum.SPR_BOS2, 12, 8, StateNum.S_BOS2_DIE6),
  // S_BOS2_DIE6 (566)
  S(SpriteNum.SPR_BOS2, 13, 8, StateNum.S_BOS2_DIE7),
  // S_BOS2_DIE7 (567)
  S(SpriteNum.SPR_BOS2, 14, -1, StateNum.S_NULL),
  // S_BOS2_RAISE1 (568)
  S(SpriteNum.SPR_BOS2, 14, 8, StateNum.S_BOS2_RAISE2),
  // S_BOS2_RAISE2 (569)
  S(SpriteNum.SPR_BOS2, 13, 8, StateNum.S_BOS2_RAISE3),
  // S_BOS2_RAISE3 (570)
  S(SpriteNum.SPR_BOS2, 12, 8, StateNum.S_BOS2_RAISE4),
  // S_BOS2_RAISE4 (571)
  S(SpriteNum.SPR_BOS2, 11, 8, StateNum.S_BOS2_RAISE5),
  // S_BOS2_RAISE5 (572)
  S(SpriteNum.SPR_BOS2, 10, 8, StateNum.S_BOS2_RAISE6),
  // S_BOS2_RAISE6 (573)
  S(SpriteNum.SPR_BOS2, 9, 8, StateNum.S_BOS2_RAISE7),
  // S_BOS2_RAISE7 (574)
  S(SpriteNum.SPR_BOS2, 8, 8, StateNum.S_BOS2_RUN1),
  // S_SKULL_STND (575)
  S(SpriteNum.SPR_SKUL, 0|F, 10, StateNum.S_SKULL_STND2),
  // S_SKULL_STND2 (576)
  S(SpriteNum.SPR_SKUL, 1|F, 10, StateNum.S_SKULL_STND),
  // S_SKULL_RUN1 (577)
  S(SpriteNum.SPR_SKUL, 0|F, 6, StateNum.S_SKULL_RUN2),
  // S_SKULL_RUN2 (578)
  S(SpriteNum.SPR_SKUL, 1|F, 6, StateNum.S_SKULL_RUN1),
  // S_SKULL_ATK1 (579)
  S(SpriteNum.SPR_SKUL, 2|F, 10, StateNum.S_SKULL_ATK2),
  // S_SKULL_ATK2 (580)
  S(SpriteNum.SPR_SKUL, 3|F, 4, StateNum.S_SKULL_ATK3),
  // S_SKULL_ATK3 (581)
  S(SpriteNum.SPR_SKUL, 2|F, 4, StateNum.S_SKULL_ATK4),
  // S_SKULL_ATK4 (582)
  S(SpriteNum.SPR_SKUL, 3|F, 4, StateNum.S_SKULL_ATK3),
  // S_SKULL_PAIN (583)
  S(SpriteNum.SPR_SKUL, 4|F, 3, StateNum.S_SKULL_PAIN2),
  // S_SKULL_PAIN2 (584)
  S(SpriteNum.SPR_SKUL, 4|F, 3, StateNum.S_SKULL_RUN1),
  // S_SKULL_DIE1 (585)
  S(SpriteNum.SPR_SKUL, 5|F, 6, StateNum.S_SKULL_DIE2),
  // S_SKULL_DIE2 (586)
  S(SpriteNum.SPR_SKUL, 6|F, 6, StateNum.S_SKULL_DIE3),
  // S_SKULL_DIE3 (587)
  S(SpriteNum.SPR_SKUL, 7|F, 6, StateNum.S_SKULL_DIE4),
  // S_SKULL_DIE4 (588)
  S(SpriteNum.SPR_SKUL, 8|F, 6, StateNum.S_SKULL_DIE5),
  // S_SKULL_DIE5 (589)
  S(SpriteNum.SPR_SKUL, 9, 6, StateNum.S_SKULL_DIE6),
  // S_SKULL_DIE6 (590)
  S(SpriteNum.SPR_SKUL, 10, 6, StateNum.S_NULL),
  // S_SPID_STND (591)
  S(SpriteNum.SPR_SPID, 0, 10, StateNum.S_SPID_STND2),
  // S_SPID_STND2 (592)
  S(SpriteNum.SPR_SPID, 1, 10, StateNum.S_SPID_STND),
  // S_SPID_RUN1 (593)
  S(SpriteNum.SPR_SPID, 0, 3, StateNum.S_SPID_RUN2),
  // S_SPID_RUN2 (594)
  S(SpriteNum.SPR_SPID, 0, 3, StateNum.S_SPID_RUN3),
  // S_SPID_RUN3 (595)
  S(SpriteNum.SPR_SPID, 1, 3, StateNum.S_SPID_RUN4),
  // S_SPID_RUN4 (596)
  S(SpriteNum.SPR_SPID, 1, 3, StateNum.S_SPID_RUN5),
  // S_SPID_RUN5 (597)
  S(SpriteNum.SPR_SPID, 2, 3, StateNum.S_SPID_RUN6),
  // S_SPID_RUN6 (598)
  S(SpriteNum.SPR_SPID, 2, 3, StateNum.S_SPID_RUN7),
  // S_SPID_RUN7 (599)
  S(SpriteNum.SPR_SPID, 3, 3, StateNum.S_SPID_RUN8),
  // S_SPID_RUN8 (600)
  S(SpriteNum.SPR_SPID, 3, 3, StateNum.S_SPID_RUN9),
  // S_SPID_RUN9 (601)
  S(SpriteNum.SPR_SPID, 4, 3, StateNum.S_SPID_RUN10),
  // S_SPID_RUN10 (602)
  S(SpriteNum.SPR_SPID, 4, 3, StateNum.S_SPID_RUN11),
  // S_SPID_RUN11 (603)
  S(SpriteNum.SPR_SPID, 5, 3, StateNum.S_SPID_RUN12),
  // S_SPID_RUN12 (604)
  S(SpriteNum.SPR_SPID, 5, 3, StateNum.S_SPID_RUN1),
  // S_SPID_ATK1 (605)
  S(SpriteNum.SPR_SPID, 0|F, 20, StateNum.S_SPID_ATK2),
  // S_SPID_ATK2 (606)
  S(SpriteNum.SPR_SPID, 6|F, 4, StateNum.S_SPID_ATK3),
  // S_SPID_ATK3 (607)
  S(SpriteNum.SPR_SPID, 7|F, 4, StateNum.S_SPID_ATK4),
  // S_SPID_ATK4 (608)
  S(SpriteNum.SPR_SPID, 7|F, 1, StateNum.S_SPID_ATK2),
  // S_SPID_PAIN (609)
  S(SpriteNum.SPR_SPID, 8, 3, StateNum.S_SPID_PAIN2),
  // S_SPID_PAIN2 (610)
  S(SpriteNum.SPR_SPID, 8, 3, StateNum.S_SPID_RUN1),
  // S_SPID_DIE1 (611)
  S(SpriteNum.SPR_SPID, 9, 20, StateNum.S_SPID_DIE2),
  // S_SPID_DIE2 (612)
  S(SpriteNum.SPR_SPID, 10, 10, StateNum.S_SPID_DIE3),
  // S_SPID_DIE3 (613)
  S(SpriteNum.SPR_SPID, 11, 10, StateNum.S_SPID_DIE4),
  // S_SPID_DIE4 (614)
  S(SpriteNum.SPR_SPID, 12, 10, StateNum.S_SPID_DIE5),
  // S_SPID_DIE5 (615)
  S(SpriteNum.SPR_SPID, 13, 10, StateNum.S_SPID_DIE6),
  // S_SPID_DIE6 (616)
  S(SpriteNum.SPR_SPID, 14, 10, StateNum.S_SPID_DIE7),
  // S_SPID_DIE7 (617)
  S(SpriteNum.SPR_SPID, 15, 10, StateNum.S_SPID_DIE8),
  // S_SPID_DIE8 (618)
  S(SpriteNum.SPR_SPID, 16, 10, StateNum.S_SPID_DIE9),
  // S_SPID_DIE9 (619)
  S(SpriteNum.SPR_SPID, 17, 10, StateNum.S_SPID_DIE10),
  // S_SPID_DIE10 (620)
  S(SpriteNum.SPR_SPID, 18, 30, StateNum.S_SPID_DIE11),
  // S_SPID_DIE11 (621)
  S(SpriteNum.SPR_SPID, 18, -1, StateNum.S_NULL),
  // S_BSPI_STND (622)
  S(SpriteNum.SPR_BSPI, 0, 10, StateNum.S_BSPI_STND2),
  // S_BSPI_STND2 (623)
  S(SpriteNum.SPR_BSPI, 1, 10, StateNum.S_BSPI_STND),
  // S_BSPI_SIGHT (624)
  S(SpriteNum.SPR_BSPI, 0, 20, StateNum.S_BSPI_RUN1),
  // S_BSPI_RUN1 (625)
  S(SpriteNum.SPR_BSPI, 0, 3, StateNum.S_BSPI_RUN2),
  // S_BSPI_RUN2 (626)
  S(SpriteNum.SPR_BSPI, 0, 3, StateNum.S_BSPI_RUN3),
  // S_BSPI_RUN3 (627)
  S(SpriteNum.SPR_BSPI, 1, 3, StateNum.S_BSPI_RUN4),
  // S_BSPI_RUN4 (628)
  S(SpriteNum.SPR_BSPI, 1, 3, StateNum.S_BSPI_RUN5),
  // S_BSPI_RUN5 (629)
  S(SpriteNum.SPR_BSPI, 2, 3, StateNum.S_BSPI_RUN6),
  // S_BSPI_RUN6 (630)
  S(SpriteNum.SPR_BSPI, 2, 3, StateNum.S_BSPI_RUN7),
  // S_BSPI_RUN7 (631)
  S(SpriteNum.SPR_BSPI, 3, 3, StateNum.S_BSPI_RUN8),
  // S_BSPI_RUN8 (632)
  S(SpriteNum.SPR_BSPI, 3, 3, StateNum.S_BSPI_RUN9),
  // S_BSPI_RUN9 (633)
  S(SpriteNum.SPR_BSPI, 4, 3, StateNum.S_BSPI_RUN10),
  // S_BSPI_RUN10 (634)
  S(SpriteNum.SPR_BSPI, 4, 3, StateNum.S_BSPI_RUN11),
  // S_BSPI_RUN11 (635)
  S(SpriteNum.SPR_BSPI, 5, 3, StateNum.S_BSPI_RUN12),
  // S_BSPI_RUN12 (636)
  S(SpriteNum.SPR_BSPI, 5, 3, StateNum.S_BSPI_RUN1),
  // S_BSPI_ATK1 (637)
  S(SpriteNum.SPR_BSPI, 0|F, 20, StateNum.S_BSPI_ATK2),
  // S_BSPI_ATK2 (638)
  S(SpriteNum.SPR_BSPI, 6|F, 4, StateNum.S_BSPI_ATK3),
  // S_BSPI_ATK3 (639)
  S(SpriteNum.SPR_BSPI, 7|F, 4, StateNum.S_BSPI_ATK4),
  // S_BSPI_ATK4 (640)
  S(SpriteNum.SPR_BSPI, 7|F, 1, StateNum.S_BSPI_ATK2),
  // S_BSPI_PAIN (641)
  S(SpriteNum.SPR_BSPI, 8, 3, StateNum.S_BSPI_PAIN2),
  // S_BSPI_PAIN2 (642)
  S(SpriteNum.SPR_BSPI, 8, 3, StateNum.S_BSPI_RUN1),
  // S_BSPI_DIE1 (643)
  S(SpriteNum.SPR_BSPI, 9, 20, StateNum.S_BSPI_DIE2),
  // S_BSPI_DIE2 (644)
  S(SpriteNum.SPR_BSPI, 10, 7, StateNum.S_BSPI_DIE3),
  // S_BSPI_DIE3 (645)
  S(SpriteNum.SPR_BSPI, 11, 7, StateNum.S_BSPI_DIE4),
  // S_BSPI_DIE4 (646)
  S(SpriteNum.SPR_BSPI, 12, 7, StateNum.S_BSPI_DIE5),
  // S_BSPI_DIE5 (647)
  S(SpriteNum.SPR_BSPI, 13, 7, StateNum.S_BSPI_DIE6),
  // S_BSPI_DIE6 (648)
  S(SpriteNum.SPR_BSPI, 14, 7, StateNum.S_BSPI_DIE7),
  // S_BSPI_DIE7 (649)
  S(SpriteNum.SPR_BSPI, 15, -1, StateNum.S_NULL),
  // S_BSPI_RAISE1 (650)
  S(SpriteNum.SPR_BSPI, 15, 5, StateNum.S_BSPI_RAISE2),
  // S_BSPI_RAISE2 (651)
  S(SpriteNum.SPR_BSPI, 14, 5, StateNum.S_BSPI_RAISE3),
  // S_BSPI_RAISE3 (652)
  S(SpriteNum.SPR_BSPI, 13, 5, StateNum.S_BSPI_RAISE4),
  // S_BSPI_RAISE4 (653)
  S(SpriteNum.SPR_BSPI, 12, 5, StateNum.S_BSPI_RAISE5),
  // S_BSPI_RAISE5 (654)
  S(SpriteNum.SPR_BSPI, 11, 5, StateNum.S_BSPI_RAISE6),
  // S_BSPI_RAISE6 (655)
  S(SpriteNum.SPR_BSPI, 10, 5, StateNum.S_BSPI_RAISE7),
  // S_BSPI_RAISE7 (656)
  S(SpriteNum.SPR_BSPI, 9, 5, StateNum.S_BSPI_RUN1),
  // S_ARACH_PLAZ (657)
  S(SpriteNum.SPR_APLS, 0|F, 5, StateNum.S_ARACH_PLAZ2),
  // S_ARACH_PLAZ2 (658)
  S(SpriteNum.SPR_APLS, 1|F, 5, StateNum.S_ARACH_PLAZ),
  // S_ARACH_PLEX (659)
  S(SpriteNum.SPR_APBX, 0|F, 5, StateNum.S_ARACH_PLEX2),
  // S_ARACH_PLEX2 (660)
  S(SpriteNum.SPR_APBX, 1|F, 5, StateNum.S_ARACH_PLEX3),
  // S_ARACH_PLEX3 (661)
  S(SpriteNum.SPR_APBX, 2|F, 5, StateNum.S_ARACH_PLEX4),
  // S_ARACH_PLEX4 (662)
  S(SpriteNum.SPR_APBX, 3|F, 5, StateNum.S_ARACH_PLEX5),
  // S_ARACH_PLEX5 (663)
  S(SpriteNum.SPR_APBX, 4|F, 5, StateNum.S_NULL),
  // S_CYBER_STND (664)
  S(SpriteNum.SPR_CYBR, 0, 10, StateNum.S_CYBER_STND2),
  // S_CYBER_STND2 (665)
  S(SpriteNum.SPR_CYBR, 1, 10, StateNum.S_CYBER_STND),
  // S_CYBER_RUN1 (666)
  S(SpriteNum.SPR_CYBR, 0, 3, StateNum.S_CYBER_RUN2),
  // S_CYBER_RUN2 (667)
  S(SpriteNum.SPR_CYBR, 0, 3, StateNum.S_CYBER_RUN3),
  // S_CYBER_RUN3 (668)
  S(SpriteNum.SPR_CYBR, 1, 3, StateNum.S_CYBER_RUN4),
  // S_CYBER_RUN4 (669)
  S(SpriteNum.SPR_CYBR, 1, 3, StateNum.S_CYBER_RUN5),
  // S_CYBER_RUN5 (670)
  S(SpriteNum.SPR_CYBR, 2, 3, StateNum.S_CYBER_RUN6),
  // S_CYBER_RUN6 (671)
  S(SpriteNum.SPR_CYBR, 2, 3, StateNum.S_CYBER_RUN7),
  // S_CYBER_RUN7 (672)
  S(SpriteNum.SPR_CYBR, 3, 3, StateNum.S_CYBER_RUN8),
  // S_CYBER_RUN8 (673)
  S(SpriteNum.SPR_CYBR, 3, 3, StateNum.S_CYBER_RUN1),
  // S_CYBER_ATK1 (674)
  S(SpriteNum.SPR_CYBR, 4, 6, StateNum.S_CYBER_ATK2),
  // S_CYBER_ATK2 (675)
  S(SpriteNum.SPR_CYBR, 5|F, 12, StateNum.S_CYBER_ATK3),
  // S_CYBER_ATK3 (676)
  S(SpriteNum.SPR_CYBR, 4|F, 12, StateNum.S_CYBER_ATK4),
  // S_CYBER_ATK4 (677)
  S(SpriteNum.SPR_CYBR, 5, 12, StateNum.S_CYBER_ATK5),
  // S_CYBER_ATK5 (678)
  S(SpriteNum.SPR_CYBR, 4, 12, StateNum.S_CYBER_ATK6),
  // S_CYBER_ATK6 (679)
  S(SpriteNum.SPR_CYBR, 5|F, 12, StateNum.S_CYBER_RUN1),
  // S_CYBER_PAIN (680)
  S(SpriteNum.SPR_CYBR, 6, 10, StateNum.S_CYBER_RUN1),
  // S_CYBER_DIE1 (681)
  S(SpriteNum.SPR_CYBR, 7, 10, StateNum.S_CYBER_DIE2),
  // S_CYBER_DIE2 (682)
  S(SpriteNum.SPR_CYBR, 8, 10, StateNum.S_CYBER_DIE3),
  // S_CYBER_DIE3 (683)
  S(SpriteNum.SPR_CYBR, 9, 10, StateNum.S_CYBER_DIE4),
  // S_CYBER_DIE4 (684)
  S(SpriteNum.SPR_CYBR, 10, 10, StateNum.S_CYBER_DIE5),
  // S_CYBER_DIE5 (685)
  S(SpriteNum.SPR_CYBR, 11, 10, StateNum.S_CYBER_DIE6),
  // S_CYBER_DIE6 (686)
  S(SpriteNum.SPR_CYBR, 12, 10, StateNum.S_CYBER_DIE7),
  // S_CYBER_DIE7 (687)
  S(SpriteNum.SPR_CYBR, 13, 10, StateNum.S_CYBER_DIE8),
  // S_CYBER_DIE8 (688)
  S(SpriteNum.SPR_CYBR, 14, 10, StateNum.S_CYBER_DIE9),
  // S_CYBER_DIE9 (689)
  S(SpriteNum.SPR_CYBR, 15, 30, StateNum.S_CYBER_DIE10),
  // S_CYBER_DIE10 (690)
  S(SpriteNum.SPR_CYBR, 15, -1, StateNum.S_NULL),
  // S_PAIN_STND (691)
  S(SpriteNum.SPR_PAIN, 0, 10, StateNum.S_PAIN_RUN1),
  // S_PAIN_RUN1 (692)
  S(SpriteNum.SPR_PAIN, 0, 3, StateNum.S_PAIN_RUN2),
  // S_PAIN_RUN2 (693)
  S(SpriteNum.SPR_PAIN, 0, 3, StateNum.S_PAIN_RUN3),
  // S_PAIN_RUN3 (694)
  S(SpriteNum.SPR_PAIN, 1, 3, StateNum.S_PAIN_RUN4),
  // S_PAIN_RUN4 (695)
  S(SpriteNum.SPR_PAIN, 1, 3, StateNum.S_PAIN_RUN5),
  // S_PAIN_RUN5 (696)
  S(SpriteNum.SPR_PAIN, 2, 3, StateNum.S_PAIN_RUN6),
  // S_PAIN_RUN6 (697)
  S(SpriteNum.SPR_PAIN, 2, 3, StateNum.S_PAIN_RUN1),
  // S_PAIN_ATK1 (698)
  S(SpriteNum.SPR_PAIN, 3, 5, StateNum.S_PAIN_ATK2),
  // S_PAIN_ATK2 (699)
  S(SpriteNum.SPR_PAIN, 4, 5, StateNum.S_PAIN_ATK3),
  // S_PAIN_ATK3 (700)
  S(SpriteNum.SPR_PAIN, 5|F, 5, StateNum.S_PAIN_ATK4),
  // S_PAIN_ATK4 (701)
  S(SpriteNum.SPR_PAIN, 5|F, 0, StateNum.S_PAIN_RUN1),
  // S_PAIN_PAIN (702)
  S(SpriteNum.SPR_PAIN, 6, 6, StateNum.S_PAIN_PAIN2),
  // S_PAIN_PAIN2 (703)
  S(SpriteNum.SPR_PAIN, 6, 6, StateNum.S_PAIN_RUN1),
  // S_PAIN_DIE1 (704)
  S(SpriteNum.SPR_PAIN, 7|F, 8, StateNum.S_PAIN_DIE2),
  // S_PAIN_DIE2 (705)
  S(SpriteNum.SPR_PAIN, 8|F, 8, StateNum.S_PAIN_DIE3),
  // S_PAIN_DIE3 (706)
  S(SpriteNum.SPR_PAIN, 9|F, 8, StateNum.S_PAIN_DIE4),
  // S_PAIN_DIE4 (707)
  S(SpriteNum.SPR_PAIN, 10|F, 8, StateNum.S_PAIN_DIE5),
  // S_PAIN_DIE5 (708)
  S(SpriteNum.SPR_PAIN, 11|F, 8, StateNum.S_PAIN_DIE6),
  // S_PAIN_DIE6 (709)
  S(SpriteNum.SPR_PAIN, 12|F, 8, StateNum.S_NULL),
  // S_PAIN_RAISE1 (710)
  S(SpriteNum.SPR_PAIN, 12, 8, StateNum.S_PAIN_RAISE2),
  // S_PAIN_RAISE2 (711)
  S(SpriteNum.SPR_PAIN, 11, 8, StateNum.S_PAIN_RAISE3),
  // S_PAIN_RAISE3 (712)
  S(SpriteNum.SPR_PAIN, 10, 8, StateNum.S_PAIN_RAISE4),
  // S_PAIN_RAISE4 (713)
  S(SpriteNum.SPR_PAIN, 9, 8, StateNum.S_PAIN_RAISE5),
  // S_PAIN_RAISE5 (714)
  S(SpriteNum.SPR_PAIN, 8, 8, StateNum.S_PAIN_RAISE6),
  // S_PAIN_RAISE6 (715)
  S(SpriteNum.SPR_PAIN, 7, 8, StateNum.S_PAIN_RUN1),
  // S_SSWV_STND (716)
  S(SpriteNum.SPR_SSWV, 0, 10, StateNum.S_SSWV_STND2),
  // S_SSWV_STND2 (717)
  S(SpriteNum.SPR_SSWV, 1, 10, StateNum.S_SSWV_STND),
  // S_SSWV_RUN1 (718)
  S(SpriteNum.SPR_SSWV, 0, 3, StateNum.S_SSWV_RUN2),
  // S_SSWV_RUN2 (719)
  S(SpriteNum.SPR_SSWV, 0, 3, StateNum.S_SSWV_RUN3),
  // S_SSWV_RUN3 (720)
  S(SpriteNum.SPR_SSWV, 1, 3, StateNum.S_SSWV_RUN4),
  // S_SSWV_RUN4 (721)
  S(SpriteNum.SPR_SSWV, 1, 3, StateNum.S_SSWV_RUN5),
  // S_SSWV_RUN5 (722)
  S(SpriteNum.SPR_SSWV, 2, 3, StateNum.S_SSWV_RUN6),
  // S_SSWV_RUN6 (723)
  S(SpriteNum.SPR_SSWV, 2, 3, StateNum.S_SSWV_RUN7),
  // S_SSWV_RUN7 (724)
  S(SpriteNum.SPR_SSWV, 3, 3, StateNum.S_SSWV_RUN8),
  // S_SSWV_RUN8 (725)
  S(SpriteNum.SPR_SSWV, 3, 3, StateNum.S_SSWV_RUN1),
  // S_SSWV_ATK1 (726)
  S(SpriteNum.SPR_SSWV, 4, 10, StateNum.S_SSWV_ATK2),
  // S_SSWV_ATK2 (727)
  S(SpriteNum.SPR_SSWV, 4, 10, StateNum.S_SSWV_ATK3),
  // S_SSWV_ATK3 (728)
  S(SpriteNum.SPR_SSWV, 5|F, 4, StateNum.S_SSWV_ATK4),
  // S_SSWV_ATK4 (729)
  S(SpriteNum.SPR_SSWV, 4, 6, StateNum.S_SSWV_ATK5),
  // S_SSWV_ATK5 (730)
  S(SpriteNum.SPR_SSWV, 5|F, 4, StateNum.S_SSWV_ATK6),
  // S_SSWV_ATK6 (731)
  S(SpriteNum.SPR_SSWV, 4, 1, StateNum.S_SSWV_RUN1),
  // S_SSWV_PAIN (732)
  S(SpriteNum.SPR_SSWV, 6, 3, StateNum.S_SSWV_PAIN2),
  // S_SSWV_PAIN2 (733)
  S(SpriteNum.SPR_SSWV, 6, 3, StateNum.S_SSWV_RUN1),
  // S_SSWV_DIE1 (734)
  S(SpriteNum.SPR_SSWV, 7, 5, StateNum.S_SSWV_DIE2),
  // S_SSWV_DIE2 (735)
  S(SpriteNum.SPR_SSWV, 8, 5, StateNum.S_SSWV_DIE3),
  // S_SSWV_DIE3 (736)
  S(SpriteNum.SPR_SSWV, 9, 5, StateNum.S_SSWV_DIE4),
  // S_SSWV_DIE4 (737)
  S(SpriteNum.SPR_SSWV, 10, 5, StateNum.S_SSWV_DIE5),
  // S_SSWV_DIE5 (738)
  S(SpriteNum.SPR_SSWV, 11, -1, StateNum.S_NULL),
  // S_SSWV_XDIE1 (739)
  S(SpriteNum.SPR_SSWV, 12, 5, StateNum.S_SSWV_XDIE2),
  // S_SSWV_XDIE2 (740)
  S(SpriteNum.SPR_SSWV, 13, 5, StateNum.S_SSWV_XDIE3),
  // S_SSWV_XDIE3 (741)
  S(SpriteNum.SPR_SSWV, 14, 5, StateNum.S_SSWV_XDIE4),
  // S_SSWV_XDIE4 (742)
  S(SpriteNum.SPR_SSWV, 15, 5, StateNum.S_SSWV_XDIE5),
  // S_SSWV_XDIE5 (743)
  S(SpriteNum.SPR_SSWV, 16, 5, StateNum.S_SSWV_XDIE6),
  // S_SSWV_XDIE6 (744)
  S(SpriteNum.SPR_SSWV, 17, 5, StateNum.S_SSWV_XDIE7),
  // S_SSWV_XDIE7 (745)
  S(SpriteNum.SPR_SSWV, 18, 5, StateNum.S_SSWV_XDIE8),
  // S_SSWV_XDIE8 (746)
  S(SpriteNum.SPR_SSWV, 19, 5, StateNum.S_SSWV_XDIE9),
  // S_SSWV_XDIE9 (747)
  S(SpriteNum.SPR_SSWV, 20, -1, StateNum.S_NULL),
  // S_SSWV_RAISE1 (748)
  S(SpriteNum.SPR_SSWV, 11, 5, StateNum.S_SSWV_RAISE2),
  // S_SSWV_RAISE2 (749)
  S(SpriteNum.SPR_SSWV, 10, 5, StateNum.S_SSWV_RAISE3),
  // S_SSWV_RAISE3 (750)
  S(SpriteNum.SPR_SSWV, 9, 5, StateNum.S_SSWV_RAISE4),
  // S_SSWV_RAISE4 (751)
  S(SpriteNum.SPR_SSWV, 8, 5, StateNum.S_SSWV_RAISE5),
  // S_SSWV_RAISE5 (752)
  S(SpriteNum.SPR_SSWV, 7, 5, StateNum.S_SSWV_RUN1),
  // S_KEENSTND (753)
  S(SpriteNum.SPR_KEEN, 0, -1, StateNum.S_KEENSTND),
  // S_COMMKEEN (754)
  S(SpriteNum.SPR_KEEN, 0, 6, StateNum.S_COMMKEEN2),
  // S_COMMKEEN2 (755)
  S(SpriteNum.SPR_KEEN, 1, 6, StateNum.S_COMMKEEN3),
  // S_COMMKEEN3 (756)
  S(SpriteNum.SPR_KEEN, 2, 6, StateNum.S_COMMKEEN4),
  // S_COMMKEEN4 (757)
  S(SpriteNum.SPR_KEEN, 3, 6, StateNum.S_COMMKEEN5),
  // S_COMMKEEN5 (758)
  S(SpriteNum.SPR_KEEN, 4, 6, StateNum.S_COMMKEEN6),
  // S_COMMKEEN6 (759)
  S(SpriteNum.SPR_KEEN, 5, 6, StateNum.S_COMMKEEN7),
  // S_COMMKEEN7 (760)
  S(SpriteNum.SPR_KEEN, 6, 6, StateNum.S_COMMKEEN8),
  // S_COMMKEEN8 (761)
  S(SpriteNum.SPR_KEEN, 7, 6, StateNum.S_COMMKEEN9),
  // S_COMMKEEN9 (762)
  S(SpriteNum.SPR_KEEN, 8, 6, StateNum.S_COMMKEEN10),
  // S_COMMKEEN10 (763)
  S(SpriteNum.SPR_KEEN, 9, 6, StateNum.S_COMMKEEN11),
  // S_COMMKEEN11 (764)
  S(SpriteNum.SPR_KEEN, 10, 6, StateNum.S_COMMKEEN12),
  // S_COMMKEEN12 (765)
  S(SpriteNum.SPR_KEEN, 11, -1, StateNum.S_NULL),
  // S_KEENPAIN (766)
  S(SpriteNum.SPR_KEEN, 12, 4, StateNum.S_KEENPAIN2),
  // S_KEENPAIN2 (767)
  S(SpriteNum.SPR_KEEN, 12, 8, StateNum.S_KEENSTND),
  // S_BRAIN (768)
  S(SpriteNum.SPR_BBRN, 0, -1, StateNum.S_NULL),
  // S_BRAIN_PAIN (769)
  S(SpriteNum.SPR_BBRN, 1, 36, StateNum.S_BRAIN),
  // S_BRAIN_DIE1 (770)
  S(SpriteNum.SPR_BBRN, 0, 100, StateNum.S_BRAIN_DIE2),
  // S_BRAIN_DIE2 (771)
  S(SpriteNum.SPR_BBRN, 0, 10, StateNum.S_BRAIN_DIE3),
  // S_BRAIN_DIE3 (772)
  S(SpriteNum.SPR_BBRN, 0, 10, StateNum.S_BRAIN_DIE4),
  // S_BRAIN_DIE4 (773)
  S(SpriteNum.SPR_BBRN, 0, -1, StateNum.S_NULL),
  // S_BRAINEYE (774)
  S(SpriteNum.SPR_BOSF, 0, 10, StateNum.S_BRAINEYESEE),
  // S_BRAINEYESEE (775)
  S(SpriteNum.SPR_BOSF, 0, 181, StateNum.S_BRAINEYE1),
  // S_BRAINEYE1 (776)
  S(SpriteNum.SPR_BOSF, 0, 150, StateNum.S_BRAINEYESEE),
  // S_SPAWN1 (777)
  S(SpriteNum.SPR_BOSF, 0|F, 3, StateNum.S_SPAWN2),
  // S_SPAWN2 (778)
  S(SpriteNum.SPR_BOSF, 1|F, 3, StateNum.S_SPAWN3),
  // S_SPAWN3 (779)
  S(SpriteNum.SPR_BOSF, 2|F, 3, StateNum.S_SPAWN4),
  // S_SPAWN4 (780)
  S(SpriteNum.SPR_BOSF, 3|F, 3, StateNum.S_NULL),
  // S_SPAWNFIRE1 (781)
  S(SpriteNum.SPR_FIRE, 0|F, 4, StateNum.S_SPAWNFIRE2),
  // S_SPAWNFIRE2 (782)
  S(SpriteNum.SPR_FIRE, 1|F, 4, StateNum.S_SPAWNFIRE3),
  // S_SPAWNFIRE3 (783)
  S(SpriteNum.SPR_FIRE, 2|F, 4, StateNum.S_SPAWNFIRE4),
  // S_SPAWNFIRE4 (784)
  S(SpriteNum.SPR_FIRE, 3|F, 4, StateNum.S_SPAWNFIRE5),
  // S_SPAWNFIRE5 (785)
  S(SpriteNum.SPR_FIRE, 4|F, 4, StateNum.S_SPAWNFIRE6),
  // S_SPAWNFIRE6 (786)
  S(SpriteNum.SPR_FIRE, 5|F, 4, StateNum.S_SPAWNFIRE7),
  // S_SPAWNFIRE7 (787)
  S(SpriteNum.SPR_FIRE, 6|F, 4, StateNum.S_SPAWNFIRE8),
  // S_SPAWNFIRE8 (788)
  S(SpriteNum.SPR_FIRE, 7|F, 4, StateNum.S_NULL),
  // S_BRAINEXPLODE1 (789)
  S(SpriteNum.SPR_MISL, 1|F, 10, StateNum.S_BRAINEXPLODE2),
  // S_BRAINEXPLODE2 (790)
  S(SpriteNum.SPR_MISL, 2|F, 10, StateNum.S_BRAINEXPLODE3),
  // S_BRAINEXPLODE3 (791)
  S(SpriteNum.SPR_MISL, 3|F, 10, StateNum.S_NULL),
  // S_ARM1 (792)
  S(SpriteNum.SPR_ARM1, 0, 6, StateNum.S_ARM1A),
  // S_ARM1A (793)
  S(SpriteNum.SPR_ARM1, 1|F, 7, StateNum.S_ARM1),
  // S_ARM2 (794)
  S(SpriteNum.SPR_ARM2, 0, 6, StateNum.S_ARM2A),
  // S_ARM2A (795)
  S(SpriteNum.SPR_ARM2, 1|F, 6, StateNum.S_ARM2),
  // S_BAR1 (796)
  S(SpriteNum.SPR_BAR1, 0, 6, StateNum.S_BAR2),
  // S_BAR2 (797)
  S(SpriteNum.SPR_BAR1, 1, 6, StateNum.S_BAR1),
  // S_BEXP (798)
  S(SpriteNum.SPR_BEXP, 0, 5, StateNum.S_BEXP2),
  // S_BEXP2 (799)
  S(SpriteNum.SPR_BEXP, 1, 5, StateNum.S_BEXP3),
  // S_BEXP3 (800)
  S(SpriteNum.SPR_BEXP, 2, 5, StateNum.S_BEXP4),
  // S_BEXP4 (801)
  S(SpriteNum.SPR_BEXP, 3, 10, StateNum.S_BEXP5),
  // S_BEXP5
  S(SpriteNum.SPR_BEXP, 4, 10, StateNum.S_NULL),
  // S_FCAN
  S(SpriteNum.SPR_FCAN, 0|F, 4, StateNum.S_FCAN2),
  // S_FCAN2
  S(SpriteNum.SPR_FCAN, 1|F, 4, StateNum.S_FCAN),
  // S_BON1
  S(SpriteNum.SPR_BON1, 0, 6, StateNum.S_BON1A),
  // S_BON1A
  S(SpriteNum.SPR_BON1, 1, 6, StateNum.S_BON1B),
  // S_BON1B
  S(SpriteNum.SPR_BON1, 2, 6, StateNum.S_BON1C),
  // S_BON1C
  S(SpriteNum.SPR_BON1, 3, 6, StateNum.S_BON1D),
  // S_BON1D
  S(SpriteNum.SPR_BON1, 2, 6, StateNum.S_BON1E),
  // S_BON1E
  S(SpriteNum.SPR_BON1, 1, 6, StateNum.S_BON1),
  // S_BON2
  S(SpriteNum.SPR_BON2, 0, 6, StateNum.S_BON2A),
  // S_BON2A
  S(SpriteNum.SPR_BON2, 1, 6, StateNum.S_BON2B),
  // S_BON2B
  S(SpriteNum.SPR_BON2, 2, 6, StateNum.S_BON2C),
  // S_BON2C
  S(SpriteNum.SPR_BON2, 3, 6, StateNum.S_BON2D),
  // S_BON2D
  S(SpriteNum.SPR_BON2, 2, 6, StateNum.S_BON2E),
  // S_BON2E
  S(SpriteNum.SPR_BON2, 1, 6, StateNum.S_BON2),
  // S_BKEY
  S(SpriteNum.SPR_BKEY, 0, 10, StateNum.S_BKEY2),
  // S_BKEY2
  S(SpriteNum.SPR_BKEY, 1|F, 10, StateNum.S_BKEY),
  // S_RKEY
  S(SpriteNum.SPR_RKEY, 0, 10, StateNum.S_RKEY2),
  // S_RKEY2
  S(SpriteNum.SPR_RKEY, 1|F, 10, StateNum.S_RKEY),
  // S_YKEY
  S(SpriteNum.SPR_YKEY, 0, 10, StateNum.S_YKEY2),
  // S_YKEY2
  S(SpriteNum.SPR_YKEY, 1|F, 10, StateNum.S_YKEY),
  // S_BSKU
  S(SpriteNum.SPR_BSKU, 0, 10, StateNum.S_BSKU2),
  // S_BSKU2
  S(SpriteNum.SPR_BSKU, 1|F, 10, StateNum.S_BSKU),
  // S_RSKU
  S(SpriteNum.SPR_RSKU, 0, 10, StateNum.S_RSKU2),
  // S_RSKU2
  S(SpriteNum.SPR_RSKU, 1|F, 10, StateNum.S_RSKU),
  // S_YSKU
  S(SpriteNum.SPR_YSKU, 0, 10, StateNum.S_YSKU2),
  // S_YSKU2
  S(SpriteNum.SPR_YSKU, 1|F, 10, StateNum.S_YSKU),
  // S_STIM
  S(SpriteNum.SPR_STIM, 0, -1, StateNum.S_NULL),
  // S_MEDI
  S(SpriteNum.SPR_MEDI, 0, -1, StateNum.S_NULL),
  // S_SOUL
  S(SpriteNum.SPR_SOUL, 0|F, 6, StateNum.S_SOUL2),
  // S_SOUL2
  S(SpriteNum.SPR_SOUL, 1|F, 6, StateNum.S_SOUL3),
  // S_SOUL3
  S(SpriteNum.SPR_SOUL, 2|F, 6, StateNum.S_SOUL4),
  // S_SOUL4
  S(SpriteNum.SPR_SOUL, 3|F, 6, StateNum.S_SOUL5),
  // S_SOUL5
  S(SpriteNum.SPR_SOUL, 2|F, 6, StateNum.S_SOUL6),
  // S_SOUL6
  S(SpriteNum.SPR_SOUL, 1|F, 6, StateNum.S_SOUL),
  // S_PINV
  S(SpriteNum.SPR_PINV, 0|F, 6, StateNum.S_PINV2),
  // S_PINV2
  S(SpriteNum.SPR_PINV, 1|F, 6, StateNum.S_PINV3),
  // S_PINV3
  S(SpriteNum.SPR_PINV, 2|F, 6, StateNum.S_PINV4),
  // S_PINV4
  S(SpriteNum.SPR_PINV, 3|F, 6, StateNum.S_PINV),
  // S_PSTR
  S(SpriteNum.SPR_PSTR, 0|F, -1, StateNum.S_NULL),
  // S_PINS
  S(SpriteNum.SPR_PINS, 0|F, 6, StateNum.S_PINS2),
  // S_PINS2
  S(SpriteNum.SPR_PINS, 1|F, 6, StateNum.S_PINS3),
  // S_PINS3
  S(SpriteNum.SPR_PINS, 2|F, 6, StateNum.S_PINS4),
  // S_PINS4
  S(SpriteNum.SPR_PINS, 3|F, 6, StateNum.S_PINS),
  // S_MEGA
  S(SpriteNum.SPR_MEGA, 0|F, 6, StateNum.S_MEGA2),
  // S_MEGA2
  S(SpriteNum.SPR_MEGA, 1|F, 6, StateNum.S_MEGA3),
  // S_MEGA3
  S(SpriteNum.SPR_MEGA, 2|F, 6, StateNum.S_MEGA4),
  // S_MEGA4
  S(SpriteNum.SPR_MEGA, 3|F, 6, StateNum.S_MEGA),
  // S_SUIT
  S(SpriteNum.SPR_SUIT, 0|F, -1, StateNum.S_NULL),
  // S_PMAP
  S(SpriteNum.SPR_PMAP, 0|F, 6, StateNum.S_PMAP2),
  // S_PMAP2
  S(SpriteNum.SPR_PMAP, 1|F, 6, StateNum.S_PMAP3),
  // S_PMAP3
  S(SpriteNum.SPR_PMAP, 2|F, 6, StateNum.S_PMAP4),
  // S_PMAP4
  S(SpriteNum.SPR_PMAP, 3|F, 6, StateNum.S_PMAP5),
  // S_PMAP5
  S(SpriteNum.SPR_PMAP, 2|F, 6, StateNum.S_PMAP6),
  // S_PMAP6
  S(SpriteNum.SPR_PMAP, 1|F, 6, StateNum.S_PMAP),
  // S_PVIS
  S(SpriteNum.SPR_PVIS, 0|F, 6, StateNum.S_PVIS2),
  // S_PVIS2
  S(SpriteNum.SPR_PVIS, 1, 6, StateNum.S_PVIS),
  // S_CLIP
  S(SpriteNum.SPR_CLIP, 0, -1, StateNum.S_NULL),
  // S_AMMO
  S(SpriteNum.SPR_AMMO, 0, -1, StateNum.S_NULL),
  // S_ROCK
  S(SpriteNum.SPR_ROCK, 0, -1, StateNum.S_NULL),
  // S_BROK
  S(SpriteNum.SPR_BROK, 0, -1, StateNum.S_NULL),
  // S_CELL
  S(SpriteNum.SPR_CELL, 0, -1, StateNum.S_NULL),
  // S_CELP
  S(SpriteNum.SPR_CELP, 0, -1, StateNum.S_NULL),
  // S_SHEL
  S(SpriteNum.SPR_SHEL, 0, -1, StateNum.S_NULL),
  // S_SBOX
  S(SpriteNum.SPR_SBOX, 0, -1, StateNum.S_NULL),
  // S_BPAK
  S(SpriteNum.SPR_BPAK, 0, -1, StateNum.S_NULL),
  // S_BFUG (804)
  S(SpriteNum.SPR_BFUG, 0, -1, StateNum.S_NULL),
  // S_MGUN (805)
  S(SpriteNum.SPR_MGUN, 0, -1, StateNum.S_NULL),
  // S_CSAW (806)
  S(SpriteNum.SPR_CSAW, 0, -1, StateNum.S_NULL),
  // S_LAUN (807)
  S(SpriteNum.SPR_LAUN, 0, -1, StateNum.S_NULL),
  // S_PLAS (808)
  S(SpriteNum.SPR_PLAS, 0, -1, StateNum.S_NULL),
  // S_SHOT (809)
  S(SpriteNum.SPR_SHOT, 0, -1, StateNum.S_NULL),
  // S_SHOT2 (810)
  S(SpriteNum.SPR_SGN2, 0, -1, StateNum.S_NULL),
  // S_COLU (811)
  S(SpriteNum.SPR_COLU, 0|F, -1, StateNum.S_NULL),
  // S_STALAG (812)
  S(SpriteNum.SPR_SMT2, 0, -1, StateNum.S_NULL),
  // S_BLOODYTWITCH (813)
  S(SpriteNum.SPR_GOR1, 0, 10, StateNum.S_BLOODYTWITCH2),
  // S_BLOODYTWITCH2 (814)
  S(SpriteNum.SPR_GOR1, 1, 15, StateNum.S_BLOODYTWITCH3),
  // S_BLOODYTWITCH3 (815)
  S(SpriteNum.SPR_GOR1, 2, 8, StateNum.S_BLOODYTWITCH4),
  // S_BLOODYTWITCH4 (816)
  S(SpriteNum.SPR_GOR1, 1, 6, StateNum.S_BLOODYTWITCH),
  // S_DEADTORSO (817)
  S(SpriteNum.SPR_POL2, 0, -1, StateNum.S_NULL),
  // S_DEADBOTTOMHALF (818)
  S(SpriteNum.SPR_POL5, 0, -1, StateNum.S_NULL),
  // S_HEADSONSTICK (819)
  S(SpriteNum.SPR_POL4, 0, -1, StateNum.S_NULL),
  // S_GIBS (820)
  S(SpriteNum.SPR_POL3, 0, -1, StateNum.S_NULL),
  // S_HEADONASTICK (821)
  S(SpriteNum.SPR_POL1, 0, -1, StateNum.S_NULL),
  // S_HEADCANDLES (822)
  S(SpriteNum.SPR_POL6, 0, 6, StateNum.S_HEADCANDLES2),
  // S_HEADCANDLES2 (823)
  S(SpriteNum.SPR_POL6, 1, 6, StateNum.S_HEADCANDLES),
  // S_DEADSTICK (824)
  S(SpriteNum.SPR_GOR2, 0, -1, StateNum.S_NULL),
  // S_LIVESTICK (825)
  S(SpriteNum.SPR_GOR3, 0, 6, StateNum.S_LIVESTICK2),
  // S_LIVESTICK2 (826)
  S(SpriteNum.SPR_GOR3, 1, 8, StateNum.S_LIVESTICK),
  // S_MEAT2 (827)
  S(SpriteNum.SPR_GOR4, 0, -1, StateNum.S_NULL),
  // S_MEAT3 (828)
  S(SpriteNum.SPR_GOR5, 0, -1, StateNum.S_NULL),
  // S_MEAT4 (829)
  S(SpriteNum.SPR_HDB1, 0, -1, StateNum.S_NULL),
  // S_MEAT5 (830)
  S(SpriteNum.SPR_HDB2, 0, -1, StateNum.S_NULL),
  // S_STALAGTITE (831)
  S(SpriteNum.SPR_HDB3, 0, -1, StateNum.S_NULL),
  // S_TALLGRNCOL (832)
  S(SpriteNum.SPR_COL1, 0, -1, StateNum.S_NULL),
  // S_SHRTGRNCOL (833)
  S(SpriteNum.SPR_COL2, 0, -1, StateNum.S_NULL),
  // S_TALLREDCOL (834)
  S(SpriteNum.SPR_COL3, 0, -1, StateNum.S_NULL),
  // S_SHRTREDCOL (835)
  S(SpriteNum.SPR_COL4, 0, -1, StateNum.S_NULL),
  // S_CANDLESTIK (836)
  S(SpriteNum.SPR_CAND, 0|F, -1, StateNum.S_NULL),
  // S_CANDELABRA (837)
  S(SpriteNum.SPR_CBRA, 0|F, -1, StateNum.S_NULL),
  // S_SKULLCOL (838)
  S(SpriteNum.SPR_COL6, 0, -1, StateNum.S_NULL),
  // S_TORCHTREE (839)
  S(SpriteNum.SPR_TRE1, 0, -1, StateNum.S_NULL),
  // S_BIGTREE (840)
  S(SpriteNum.SPR_TRE2, 0, -1, StateNum.S_NULL),
  // S_TECHPILLAR (841)
  S(SpriteNum.SPR_ELEC, 0, -1, StateNum.S_NULL),
  // S_EVILEYE (842)
  S(SpriteNum.SPR_CEYE, 0|F, 6, StateNum.S_EVILEYE2),
  // S_EVILEYE2 (843)
  S(SpriteNum.SPR_CEYE, 1|F, 6, StateNum.S_EVILEYE3),
  // S_EVILEYE3 (844)
  S(SpriteNum.SPR_CEYE, 2|F, 6, StateNum.S_EVILEYE4),
  // S_EVILEYE4 (845)
  S(SpriteNum.SPR_CEYE, 1|F, 6, StateNum.S_EVILEYE),
  // S_FLOATSKULL (846)
  S(SpriteNum.SPR_FSKU, 0|F, 6, StateNum.S_FLOATSKULL2),
  // S_FLOATSKULL2 (847)
  S(SpriteNum.SPR_FSKU, 1|F, 6, StateNum.S_FLOATSKULL3),
  // S_FLOATSKULL3 (848)
  S(SpriteNum.SPR_FSKU, 2|F, 6, StateNum.S_FLOATSKULL),
  // S_HEARTCOL (849)
  S(SpriteNum.SPR_COL5, 0, 14, StateNum.S_HEARTCOL2),
  // S_HEARTCOL2 (850)
  S(SpriteNum.SPR_COL5, 1, 14, StateNum.S_HEARTCOL),
  // S_BLUETORCH (851)
  S(SpriteNum.SPR_TBLU, 0|F, 4, StateNum.S_BLUETORCH2),
  // S_BLUETORCH2 (852)
  S(SpriteNum.SPR_TBLU, 1|F, 4, StateNum.S_BLUETORCH3),
  // S_BLUETORCH3 (853)
  S(SpriteNum.SPR_TBLU, 2|F, 4, StateNum.S_BLUETORCH4),
  // S_BLUETORCH4 (854)
  S(SpriteNum.SPR_TBLU, 3|F, 4, StateNum.S_BLUETORCH),
  // S_GREENTORCH (855)
  S(SpriteNum.SPR_TGRN, 0|F, 4, StateNum.S_GREENTORCH2),
  // S_GREENTORCH2 (856)
  S(SpriteNum.SPR_TGRN, 1|F, 4, StateNum.S_GREENTORCH3),
  // S_GREENTORCH3 (857)
  S(SpriteNum.SPR_TGRN, 2|F, 4, StateNum.S_GREENTORCH4),
  // S_GREENTORCH4 (858)
  S(SpriteNum.SPR_TGRN, 3|F, 4, StateNum.S_GREENTORCH),
  // S_REDTORCH (859)
  S(SpriteNum.SPR_TRED, 0|F, 4, StateNum.S_REDTORCH2),
  // S_REDTORCH2 (860)
  S(SpriteNum.SPR_TRED, 1|F, 4, StateNum.S_REDTORCH3),
  // S_REDTORCH3 (861)
  S(SpriteNum.SPR_TRED, 2|F, 4, StateNum.S_REDTORCH4),
  // S_REDTORCH4 (862)
  S(SpriteNum.SPR_TRED, 3|F, 4, StateNum.S_REDTORCH),
  // S_BTORCHSHRT (863)
  S(SpriteNum.SPR_SMBT, 0|F, 4, StateNum.S_BTORCHSHRT2),
  // S_BTORCHSHRT2 (864)
  S(SpriteNum.SPR_SMBT, 1|F, 4, StateNum.S_BTORCHSHRT3),
  // S_BTORCHSHRT3 (865)
  S(SpriteNum.SPR_SMBT, 2|F, 4, StateNum.S_BTORCHSHRT4),
  // S_BTORCHSHRT4 (866)
  S(SpriteNum.SPR_SMBT, 3|F, 4, StateNum.S_BTORCHSHRT),
  // S_GTORCHSHRT (867)
  S(SpriteNum.SPR_SMGT, 0|F, 4, StateNum.S_GTORCHSHRT2),
  // S_GTORCHSHRT2 (868)
  S(SpriteNum.SPR_SMGT, 1|F, 4, StateNum.S_GTORCHSHRT3),
  // S_GTORCHSHRT3 (869)
  S(SpriteNum.SPR_SMGT, 2|F, 4, StateNum.S_GTORCHSHRT4),
  // S_GTORCHSHRT4 (870)
  S(SpriteNum.SPR_SMGT, 3|F, 4, StateNum.S_GTORCHSHRT),
  // S_RTORCHSHRT (871)
  S(SpriteNum.SPR_SMRT, 0|F, 4, StateNum.S_RTORCHSHRT2),
  // S_RTORCHSHRT2 (872)
  S(SpriteNum.SPR_SMRT, 1|F, 4, StateNum.S_RTORCHSHRT3),
  // S_RTORCHSHRT3 (873)
  S(SpriteNum.SPR_SMRT, 2|F, 4, StateNum.S_RTORCHSHRT4),
  // S_RTORCHSHRT4 (874)
  S(SpriteNum.SPR_SMRT, 3|F, 4, StateNum.S_RTORCHSHRT),
  // S_HANGNOGUTS (875)
  S(SpriteNum.SPR_HDB4, 0, -1, StateNum.S_NULL),
  // S_HANGBNOBRAIN (876)
  S(SpriteNum.SPR_HDB5, 0, -1, StateNum.S_NULL),
  // S_HANGTLOOKDN (877)
  S(SpriteNum.SPR_HDB6, 0, -1, StateNum.S_NULL),
  // S_HANGTSKULL (878)
  S(SpriteNum.SPR_POB1, 0, -1, StateNum.S_NULL),
  // S_HANGTLOOKUP (879)
  S(SpriteNum.SPR_POB2, 0, -1, StateNum.S_NULL),
  // S_HANGTNOBRAIN (880)
  S(SpriteNum.SPR_BRS1, 0, -1, StateNum.S_NULL),
  // S_COLONGIBS (881)
  S(SpriteNum.SPR_SMIT, 0, -1, StateNum.S_NULL),
  // S_SMALLPOOL (882)
  S(SpriteNum.SPR_POL3, 0, -1, StateNum.S_NULL),
  // S_BRAINSTEM (883)
  S(SpriteNum.SPR_POL1, 0, -1, StateNum.S_NULL),
  // S_TECHLAMP (884)
  S(SpriteNum.SPR_TLMP, 0|F, 4, StateNum.S_TECHLAMP2),
  // S_TECHLAMP2 (885)
  S(SpriteNum.SPR_TLMP, 1|F, 4, StateNum.S_TECHLAMP3),
  // S_TECHLAMP3 (886)
  S(SpriteNum.SPR_TLMP, 2|F, 4, StateNum.S_TECHLAMP4),
  // S_TECHLAMP4 (887)
  S(SpriteNum.SPR_TLMP, 3|F, 4, StateNum.S_TECHLAMP),
  // S_TECH2LAMP (888)
  S(SpriteNum.SPR_TLP2, 0|F, 4, StateNum.S_TECH2LAMP2),
  // S_TECH2LAMP2 (889)
  S(SpriteNum.SPR_TLP2, 1|F, 4, StateNum.S_TECH2LAMP3),
  // S_TECH2LAMP3 (890)
  S(SpriteNum.SPR_TLP2, 2|F, 4, StateNum.S_TECH2LAMP4),
  // S_TECH2LAMP4 (891)
  S(SpriteNum.SPR_TLP2, 3|F, 4, StateNum.S_TECH2LAMP),
];

// ============================================================
// FRACUNIT shorthand for mobjinfo radius/height
// ============================================================
const FU = FRACUNIT;

// ============================================================
// mobjinfo array — ALL 137 entries from info.c
// ============================================================
export const mobjinfo: MobjInfo[] = [
  // MT_PLAYER
  { doomednum: -1, spawnstate: StateNum.S_PLAY, spawnhealth: 100, seestate: StateNum.S_PLAY_RUN1, seesound: SoundNum.sfx_None, reactiontime: 0, attacksound: SoundNum.sfx_None, painstate: StateNum.S_PLAY_PAIN, painchance: 255, painsound: SoundNum.sfx_plpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_PLAY_ATK1, deathstate: StateNum.S_PLAY_DIE1, xdeathstate: StateNum.S_PLAY_XDIE1, deathsound: SoundNum.sfx_pldeth, speed: 0, radius: 16*FU, height: 56*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SHOOTABLE|MF_DROPOFF|MF_PICKUP|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_POSSESSED
  { doomednum: 3004, spawnstate: StateNum.S_POSS_STND, spawnhealth: 20, seestate: StateNum.S_POSS_RUN1, seesound: SoundNum.sfx_posit1, reactiontime: 8, attacksound: SoundNum.sfx_pistol, painstate: StateNum.S_POSS_PAIN, painchance: 200, painsound: SoundNum.sfx_popain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_POSS_ATK1, deathstate: StateNum.S_POSS_DIE1, xdeathstate: StateNum.S_POSS_XDIE1, deathsound: SoundNum.sfx_podth1, speed: 8, radius: 20*FU, height: 56*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_posact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_POSS_RAISE1 },
  // MT_SHOTGUY
  { doomednum: 9, spawnstate: StateNum.S_SPOS_STND, spawnhealth: 30, seestate: StateNum.S_SPOS_RUN1, seesound: SoundNum.sfx_posit2, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_SPOS_PAIN, painchance: 170, painsound: SoundNum.sfx_popain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_SPOS_ATK1, deathstate: StateNum.S_SPOS_DIE1, xdeathstate: StateNum.S_SPOS_XDIE1, deathsound: SoundNum.sfx_podth2, speed: 8, radius: 20*FU, height: 56*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_posact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_SPOS_RAISE1 },
  // MT_VILE
  { doomednum: 64, spawnstate: StateNum.S_VILE_STND, spawnhealth: 700, seestate: StateNum.S_VILE_RUN1, seesound: SoundNum.sfx_vilsit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_VILE_PAIN, painchance: 10, painsound: SoundNum.sfx_vipain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_VILE_ATK1, deathstate: StateNum.S_VILE_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_vildth, speed: 15, radius: 20*FU, height: 56*FU, mass: 500, damage: 0, activesound: SoundNum.sfx_vilact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_NULL },
  // MT_FIRE
  { doomednum: -1, spawnstate: StateNum.S_FIRE1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_UNDEAD
  { doomednum: 66, spawnstate: StateNum.S_SKEL_STND, spawnhealth: 300, seestate: StateNum.S_SKEL_RUN1, seesound: SoundNum.sfx_skesit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_SKEL_PAIN, painchance: 100, painsound: SoundNum.sfx_popain, meleestate: StateNum.S_SKEL_FIST1, missilestate: StateNum.S_SKEL_MISS1, deathstate: StateNum.S_SKEL_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_skedth, speed: 10, radius: 20*FU, height: 56*FU, mass: 500, damage: 0, activesound: SoundNum.sfx_skeact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_SKEL_RAISE1 },
  // MT_TRACER
  { doomednum: -1, spawnstate: StateNum.S_TRACER, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_skeatk, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_TRACEEXP1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_barexp, speed: 10*FU, radius: 11*FU, height: 8*FU, mass: 100, damage: 10, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_SMOKE
  { doomednum: -1, spawnstate: StateNum.S_SMOKE1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_FATSO
  { doomednum: 67, spawnstate: StateNum.S_FATT_STND, spawnhealth: 600, seestate: StateNum.S_FATT_RUN1, seesound: SoundNum.sfx_mansit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_FATT_PAIN, painchance: 80, painsound: SoundNum.sfx_mnpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_FATT_ATK1, deathstate: StateNum.S_FATT_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_mandth, speed: 8, radius: 48*FU, height: 64*FU, mass: 1000, damage: 0, activesound: SoundNum.sfx_posact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_FATT_RAISE1 },
  // MT_FATSHOT
  { doomednum: -1, spawnstate: StateNum.S_FATSHOT1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_firsht, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_FATSHOTX1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 20*FU, radius: 6*FU, height: 8*FU, mass: 100, damage: 8, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_CHAINGUY
  { doomednum: 65, spawnstate: StateNum.S_CPOS_STND, spawnhealth: 70, seestate: StateNum.S_CPOS_RUN1, seesound: SoundNum.sfx_posit2, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_CPOS_PAIN, painchance: 170, painsound: SoundNum.sfx_popain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_CPOS_ATK1, deathstate: StateNum.S_CPOS_DIE1, xdeathstate: StateNum.S_CPOS_XDIE1, deathsound: SoundNum.sfx_podth2, speed: 8, radius: 20*FU, height: 56*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_posact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_CPOS_RAISE1 },
  // MT_TROOP
  { doomednum: 3001, spawnstate: StateNum.S_TROO_STND, spawnhealth: 60, seestate: StateNum.S_TROO_RUN1, seesound: SoundNum.sfx_bgsit1, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_TROO_PAIN, painchance: 200, painsound: SoundNum.sfx_popain, meleestate: StateNum.S_TROO_ATK1, missilestate: StateNum.S_TROO_ATK1, deathstate: StateNum.S_TROO_DIE1, xdeathstate: StateNum.S_TROO_XDIE1, deathsound: SoundNum.sfx_bgdth1, speed: 8, radius: 20*FU, height: 56*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_bgact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_TROO_RAISE1 },
  // MT_SERGEANT
  { doomednum: 3002, spawnstate: StateNum.S_SARG_STND, spawnhealth: 150, seestate: StateNum.S_SARG_RUN1, seesound: SoundNum.sfx_sgtsit, reactiontime: 8, attacksound: SoundNum.sfx_sgtatk, painstate: StateNum.S_SARG_PAIN, painchance: 180, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_SARG_ATK1, missilestate: StateNum.S_NULL, deathstate: StateNum.S_SARG_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_sgtdth, speed: 10, radius: 30*FU, height: 56*FU, mass: 400, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_SARG_RAISE1 },
  // MT_SHADOWS
  { doomednum: 58, spawnstate: StateNum.S_SARG_STND, spawnhealth: 150, seestate: StateNum.S_SARG_RUN1, seesound: SoundNum.sfx_sgtsit, reactiontime: 8, attacksound: SoundNum.sfx_sgtatk, painstate: StateNum.S_SARG_PAIN, painchance: 180, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_SARG_ATK1, missilestate: StateNum.S_NULL, deathstate: StateNum.S_SARG_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_sgtdth, speed: 10, radius: 30*FU, height: 56*FU, mass: 400, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_SHADOW|MF_COUNTKILL, raisestate: StateNum.S_SARG_RAISE1 },
  // MT_HEAD
  { doomednum: 3005, spawnstate: StateNum.S_HEAD_STND, spawnhealth: 400, seestate: StateNum.S_HEAD_RUN1, seesound: SoundNum.sfx_cacsit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_HEAD_PAIN, painchance: 128, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_HEAD_ATK1, deathstate: StateNum.S_HEAD_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_cacdth, speed: 8, radius: 31*FU, height: 56*FU, mass: 400, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_FLOAT|MF_NOGRAVITY|MF_COUNTKILL, raisestate: StateNum.S_HEAD_RAISE1 },
  // MT_BRUISER
  { doomednum: 3003, spawnstate: StateNum.S_BOSS_STND, spawnhealth: 1000, seestate: StateNum.S_BOSS_RUN1, seesound: SoundNum.sfx_brssit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_BOSS_PAIN, painchance: 50, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_BOSS_ATK1, missilestate: StateNum.S_BOSS_ATK1, deathstate: StateNum.S_BOSS_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_brsdth, speed: 8, radius: 24*FU, height: 64*FU, mass: 1000, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_BOSS_RAISE1 },
  // MT_BRUISERSHOT
  { doomednum: -1, spawnstate: StateNum.S_BRBALL1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_firsht, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_BRBALLX1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 15*FU, radius: 6*FU, height: 8*FU, mass: 100, damage: 8, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_KNIGHT
  { doomednum: 69, spawnstate: StateNum.S_BOS2_STND, spawnhealth: 500, seestate: StateNum.S_BOS2_RUN1, seesound: SoundNum.sfx_kntsit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_BOS2_PAIN, painchance: 50, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_BOS2_ATK1, missilestate: StateNum.S_BOS2_ATK1, deathstate: StateNum.S_BOS2_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_kntdth, speed: 8, radius: 24*FU, height: 64*FU, mass: 1000, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_BOS2_RAISE1 },
  // MT_SKULL
  { doomednum: 3006, spawnstate: StateNum.S_SKULL_STND, spawnhealth: 100, seestate: StateNum.S_SKULL_RUN1, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_sklatk, painstate: StateNum.S_SKULL_PAIN, painchance: 256, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_SKULL_ATK1, deathstate: StateNum.S_SKULL_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 8, radius: 16*FU, height: 56*FU, mass: 50, damage: 3, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_FLOAT|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_SPIDER
  { doomednum: 7, spawnstate: StateNum.S_SPID_STND, spawnhealth: 3000, seestate: StateNum.S_SPID_RUN1, seesound: SoundNum.sfx_spisit, reactiontime: 8, attacksound: SoundNum.sfx_shotgn, painstate: StateNum.S_SPID_PAIN, painchance: 40, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_SPID_ATK1, deathstate: StateNum.S_SPID_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_spidth, speed: 12, radius: 128*FU, height: 100*FU, mass: 1000, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_NULL },
  // MT_BABY
  { doomednum: 68, spawnstate: StateNum.S_BSPI_STND, spawnhealth: 500, seestate: StateNum.S_BSPI_SIGHT, seesound: SoundNum.sfx_bspsit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_BSPI_PAIN, painchance: 128, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_BSPI_ATK1, deathstate: StateNum.S_BSPI_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_bspdth, speed: 12, radius: 64*FU, height: 64*FU, mass: 600, damage: 0, activesound: SoundNum.sfx_bspact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_BSPI_RAISE1 },
  // MT_CYBORG
  { doomednum: 16, spawnstate: StateNum.S_CYBER_STND, spawnhealth: 4000, seestate: StateNum.S_CYBER_RUN1, seesound: SoundNum.sfx_cybsit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_CYBER_PAIN, painchance: 20, painsound: SoundNum.sfx_dmpain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_CYBER_ATK1, deathstate: StateNum.S_CYBER_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_cybdth, speed: 16, radius: 40*FU, height: 110*FU, mass: 1000, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_NULL },
  // MT_PAIN
  { doomednum: 71, spawnstate: StateNum.S_PAIN_STND, spawnhealth: 400, seestate: StateNum.S_PAIN_RUN1, seesound: SoundNum.sfx_pesit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_PAIN_PAIN, painchance: 128, painsound: SoundNum.sfx_pepain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_PAIN_ATK1, deathstate: StateNum.S_PAIN_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_pedth, speed: 8, radius: 31*FU, height: 56*FU, mass: 400, damage: 0, activesound: SoundNum.sfx_dmact, flags: MF_SOLID|MF_SHOOTABLE|MF_FLOAT|MF_NOGRAVITY|MF_COUNTKILL, raisestate: StateNum.S_PAIN_RAISE1 },
  // MT_WOLFSS
  { doomednum: 84, spawnstate: StateNum.S_SSWV_STND, spawnhealth: 50, seestate: StateNum.S_SSWV_RUN1, seesound: SoundNum.sfx_sssit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_SSWV_PAIN, painchance: 170, painsound: SoundNum.sfx_popain, meleestate: StateNum.S_NULL, missilestate: StateNum.S_SSWV_ATK1, deathstate: StateNum.S_SSWV_DIE1, xdeathstate: StateNum.S_SSWV_XDIE1, deathsound: SoundNum.sfx_ssdth, speed: 8, radius: 20*FU, height: 56*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_posact, flags: MF_SOLID|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_SSWV_RAISE1 },
  // MT_KEEN
  { doomednum: 72, spawnstate: StateNum.S_KEENSTND, spawnhealth: 100, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_KEENPAIN, painchance: 256, painsound: SoundNum.sfx_keenpn, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_COMMKEEN, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_keendt, speed: 0, radius: 16*FU, height: 72*FU, mass: 10000000, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY|MF_SHOOTABLE|MF_COUNTKILL, raisestate: StateNum.S_NULL },
  // MT_BOSSBRAIN
  { doomednum: 88, spawnstate: StateNum.S_BRAIN, spawnhealth: 250, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_BRAIN_PAIN, painchance: 255, painsound: SoundNum.sfx_bospn, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_BRAIN_DIE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_bosdth, speed: 0, radius: 16*FU, height: 16*FU, mass: 10000000, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SHOOTABLE, raisestate: StateNum.S_NULL },
  // MT_BOSSSPIT
  { doomednum: 89, spawnstate: StateNum.S_BRAINEYE, spawnhealth: 1000, seestate: StateNum.S_BRAINEYESEE, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 32*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOSECTOR, raisestate: StateNum.S_NULL },
  // MT_BOSSTARGET
  { doomednum: 87, spawnstate: StateNum.S_NULL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 32*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOSECTOR, raisestate: StateNum.S_NULL },
  // MT_SPAWNSHOT
  { doomednum: -1, spawnstate: StateNum.S_SPAWN1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_bospit, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 10*FU, radius: 6*FU, height: 32*FU, mass: 100, damage: 3, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY|MF_NOCLIP, raisestate: StateNum.S_NULL },
  // MT_SPAWNFIRE
  { doomednum: -1, spawnstate: StateNum.S_SPAWNFIRE1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_BARREL
  { doomednum: 2035, spawnstate: StateNum.S_BAR1, spawnhealth: 20, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_BEXP, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_barexp, speed: 0, radius: 10*FU, height: 42*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SHOOTABLE|MF_NOBLOOD, raisestate: StateNum.S_NULL },
  // MT_TROOPSHOT
  { doomednum: -1, spawnstate: StateNum.S_TBALL1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_firsht, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_TBALLX1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 10*FU, radius: 6*FU, height: 8*FU, mass: 100, damage: 3, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_HEADSHOT
  { doomednum: -1, spawnstate: StateNum.S_RBALL1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_firsht, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_RBALLX1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 10*FU, radius: 6*FU, height: 8*FU, mass: 100, damage: 5, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_ROCKET
  { doomednum: -1, spawnstate: StateNum.S_ROCKET, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_rlaunc, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_EXPLODE1, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_barexp, speed: 20*FU, radius: 11*FU, height: 8*FU, mass: 100, damage: 20, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_PLASMA
  { doomednum: -1, spawnstate: StateNum.S_PLASBALL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_plasma, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_PLASEXP, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 25*FU, radius: 13*FU, height: 8*FU, mass: 100, damage: 5, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_BFG
  { doomednum: -1, spawnstate: StateNum.S_BFGSHOT, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_BFGLAND, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_rxplod, speed: 25*FU, radius: 13*FU, height: 8*FU, mass: 100, damage: 100, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_ARACHPLAZ
  { doomednum: -1, spawnstate: StateNum.S_ARACH_PLAZ, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_plasma, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_ARACH_PLEX, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_firxpl, speed: 25*FU, radius: 13*FU, height: 8*FU, mass: 100, damage: 5, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_MISSILE|MF_DROPOFF|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_PUFF
  { doomednum: -1, spawnstate: StateNum.S_PUFF1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_BLOOD
  { doomednum: -1, spawnstate: StateNum.S_BLOOD1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP, raisestate: StateNum.S_NULL },
  // MT_TFOG
  { doomednum: -1, spawnstate: StateNum.S_TFOG, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_IFOG
  { doomednum: -1, spawnstate: StateNum.S_IFOG, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_TELEPORTMAN
  { doomednum: 14, spawnstate: StateNum.S_NULL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOSECTOR, raisestate: StateNum.S_NULL },
  // MT_EXTRABFG
  { doomednum: -1, spawnstate: StateNum.S_BFGEXP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_NOBLOCKMAP|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC0 (green armor)
  { doomednum: 2018, spawnstate: StateNum.S_ARM1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC1 (blue armor)
  { doomednum: 2019, spawnstate: StateNum.S_ARM2, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC2 (health bonus)
  { doomednum: 2014, spawnstate: StateNum.S_BON1, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_MISC3 (armor bonus)
  { doomednum: 2015, spawnstate: StateNum.S_BON2, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_MISC4 (blue keycard)
  { doomednum: 5, spawnstate: StateNum.S_BKEY, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_MISC5 (red keycard)
  { doomednum: 13, spawnstate: StateNum.S_RKEY, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_MISC6 (yellow keycard)
  { doomednum: 6, spawnstate: StateNum.S_YKEY, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_MISC7 (blue skull key)
  { doomednum: 40, spawnstate: StateNum.S_BSKU, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_MISC8 (red skull key)
  { doomednum: 38, spawnstate: StateNum.S_RSKU, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_MISC9 (yellow skull key)
  { doomednum: 39, spawnstate: StateNum.S_YSKU, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_NOTDMATCH, raisestate: StateNum.S_NULL },
  // MT_MISC10 (stimpack)
  { doomednum: 2011, spawnstate: StateNum.S_STIM, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC11 (medikit)
  { doomednum: 2012, spawnstate: StateNum.S_MEDI, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC12 (soulsphere)
  { doomednum: 2013, spawnstate: StateNum.S_SOUL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_INV (invulnerability)
  { doomednum: 2022, spawnstate: StateNum.S_PINV, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_MISC13 (berserk)
  { doomednum: 2023, spawnstate: StateNum.S_PSTR, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_INS (partial invisibility)
  { doomednum: 2024, spawnstate: StateNum.S_PINS, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_MISC14 (radiation suit)
  { doomednum: 2025, spawnstate: StateNum.S_SUIT, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC15 (computer map)
  { doomednum: 2026, spawnstate: StateNum.S_PMAP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_MISC16 (light amplification visor)
  { doomednum: 2045, spawnstate: StateNum.S_PVIS, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_MEGA (megasphere)
  { doomednum: 83, spawnstate: StateNum.S_MEGA, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL|MF_COUNTITEM, raisestate: StateNum.S_NULL },
  // MT_CLIP (ammo clip)
  { doomednum: 2007, spawnstate: StateNum.S_CLIP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC17 (box of bullets)
  { doomednum: 2048, spawnstate: StateNum.S_AMMO, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC18 (rocket)
  { doomednum: 2010, spawnstate: StateNum.S_ROCK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC19 (box of rockets)
  { doomednum: 2046, spawnstate: StateNum.S_BROK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC20 (cell charge)
  { doomednum: 2047, spawnstate: StateNum.S_CELL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC21 (cell charge pack)
  { doomednum: 17, spawnstate: StateNum.S_CELP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC22 (shells)
  { doomednum: 2008, spawnstate: StateNum.S_SHEL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC23 (box of shells)
  { doomednum: 2049, spawnstate: StateNum.S_SBOX, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC24 (backpack)
  { doomednum: 8, spawnstate: StateNum.S_BPAK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC25 (BFG9000)
  { doomednum: 2006, spawnstate: StateNum.S_BFUG, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_CHAINGUN
  { doomednum: 2002, spawnstate: StateNum.S_MGUN, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC26 (chainsaw)
  { doomednum: 2005, spawnstate: StateNum.S_CSAW, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC27 (rocket launcher)
  { doomednum: 2003, spawnstate: StateNum.S_LAUN, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC28 (plasma rifle)
  { doomednum: 2004, spawnstate: StateNum.S_PLAS, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_SHOTGUN
  { doomednum: 2001, spawnstate: StateNum.S_SHOT, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_SUPERSHOTGUN
  { doomednum: 82, spawnstate: StateNum.S_SHOT2, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPECIAL, raisestate: StateNum.S_NULL },
  // MT_MISC29 (tall techno floor lamp)
  { doomednum: 85, spawnstate: StateNum.S_TECHLAMP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC30 (short techno floor lamp)
  { doomednum: 86, spawnstate: StateNum.S_TECH2LAMP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC31 (floor lamp)
  { doomednum: 2028, spawnstate: StateNum.S_COLU, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC32 (tall green pillar)
  { doomednum: 30, spawnstate: StateNum.S_TALLGRNCOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC33 (short green pillar)
  { doomednum: 31, spawnstate: StateNum.S_SHRTGRNCOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC34 (tall red pillar)
  { doomednum: 32, spawnstate: StateNum.S_TALLREDCOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC35 (short red pillar)
  { doomednum: 33, spawnstate: StateNum.S_SHRTREDCOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC36 (short red pillar w/skull)
  { doomednum: 37, spawnstate: StateNum.S_SKULLCOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC37 (short green pillar w/heart)
  { doomednum: 36, spawnstate: StateNum.S_HEARTCOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC38 (evil eye)
  { doomednum: 41, spawnstate: StateNum.S_EVILEYE, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC39 (floating skull)
  { doomednum: 42, spawnstate: StateNum.S_FLOATSKULL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC40 (burnt tree)
  { doomednum: 43, spawnstate: StateNum.S_TORCHTREE, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC41 (candelabra)
  { doomednum: 35, spawnstate: StateNum.S_CANDELABRA, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC42 (tall blue torch)
  { doomednum: 44, spawnstate: StateNum.S_BLUETORCH, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC43 (tall green torch)
  { doomednum: 45, spawnstate: StateNum.S_GREENTORCH, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC44 (tall red torch)
  { doomednum: 46, spawnstate: StateNum.S_REDTORCH, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC45 (short blue torch)
  { doomednum: 55, spawnstate: StateNum.S_BTORCHSHRT, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC46 (short green torch)
  { doomednum: 56, spawnstate: StateNum.S_GTORCHSHRT, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC47 (short red torch)
  { doomednum: 57, spawnstate: StateNum.S_RTORCHSHRT, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC48 (stalagmite)
  { doomednum: 47, spawnstate: StateNum.S_STALAGTITE, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC49 (tall techno pillar)
  { doomednum: 48, spawnstate: StateNum.S_TECHPILLAR, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC50 (candlestick)
  { doomednum: 34, spawnstate: StateNum.S_CANDLESTIK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC51 (big tree)
  { doomednum: 54, spawnstate: StateNum.S_BIGTREE, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 32*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC52 (burning barrel)
  { doomednum: 70, spawnstate: StateNum.S_FCAN, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC53 (hanging victim, twitching)
  { doomednum: 49, spawnstate: StateNum.S_HANGNOGUTS, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 88*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC54 (hanging victim, arms out)
  { doomednum: 63, spawnstate: StateNum.S_HANGBNOBRAIN, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 88*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC55 (hanging victim, one-legged)
  { doomednum: 50, spawnstate: StateNum.S_HANGTLOOKDN, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 64*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC56 (hanging pair of legs)
  { doomednum: 51, spawnstate: StateNum.S_HANGTSKULL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 64*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC57 (hanging leg)
  { doomednum: 52, spawnstate: StateNum.S_HANGTLOOKUP, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 64*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC58 (hanging victim, no brain)
  { doomednum: 53, spawnstate: StateNum.S_HANGTNOBRAIN, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 64*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID|MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC59 (hanging victim, no guts, non-blocking)
  { doomednum: 59, spawnstate: StateNum.S_MEAT2, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 84*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC60 (hanging victim, no brain, non-blocking)
  { doomednum: 60, spawnstate: StateNum.S_MEAT3, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 68*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC61 (hanging torso, looking down, non-blocking)
  { doomednum: 61, spawnstate: StateNum.S_MEAT4, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 52*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC62 (hanging torso, open skull, non-blocking)
  { doomednum: 62, spawnstate: StateNum.S_MEAT5, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 52*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC63 (hanging torso, looking up, non-blocking)
  { doomednum: 73, spawnstate: StateNum.S_BLOODYTWITCH, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 64*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SPAWNCEILING|MF_NOGRAVITY, raisestate: StateNum.S_NULL },
  // MT_MISC64 (pool of blood and flesh)
  { doomednum: 24, spawnstate: StateNum.S_COLONGIBS, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC65 (small pool of blood)
  { doomednum: 79, spawnstate: StateNum.S_SMALLPOOL, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC66 (pool of brains)
  { doomednum: 80, spawnstate: StateNum.S_BRAINSTEM, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC67 (impaled human)
  { doomednum: 25, spawnstate: StateNum.S_DEADSTICK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC68 (twitching impaled human)
  { doomednum: 26, spawnstate: StateNum.S_LIVESTICK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC69 (skull on a pole)
  { doomednum: 28, spawnstate: StateNum.S_HEADSONSTICK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC70 (5 skulls shish kebab)
  { doomednum: 27, spawnstate: StateNum.S_HEADONASTICK, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC71 (skull on a pole w/candles)
  { doomednum: 29, spawnstate: StateNum.S_HEADCANDLES, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 16*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC72 (impaled twitch)
  { doomednum: 10, spawnstate: StateNum.S_GIBS, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC73 (dead player)
  { doomednum: 12, spawnstate: StateNum.S_PLAY_DIE7, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC74 (dead zombieman)
  { doomednum: 15, spawnstate: StateNum.S_POSS_DIE5, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC75 (dead shotgun guy)
  { doomednum: 18, spawnstate: StateNum.S_SPOS_DIE5, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC76 (dead demon)
  { doomednum: 19, spawnstate: StateNum.S_SARG_DIE6, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC77 (dead cacodemon)
  { doomednum: 20, spawnstate: StateNum.S_HEAD_DIE6, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC78 (dead imp)
  { doomednum: 21, spawnstate: StateNum.S_TROO_DIE5, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC79 (dead baron)
  { doomednum: 22, spawnstate: StateNum.S_BOSS_DIE7, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC80 (dead marine)
  { doomednum: 23, spawnstate: StateNum.S_PLAY_XDIE9, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC81 (dead lost soul - invisible)
  { doomednum: -1, spawnstate: StateNum.S_SKULL_DIE6, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC82 (dead imp 2)
  { doomednum: -1, spawnstate: StateNum.S_SARG_DIE6, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC83 (dead cacodemon 2)
  { doomednum: -1, spawnstate: StateNum.S_HEAD_DIE6, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC84 (stalagmite decoration)
  { doomednum: -1, spawnstate: StateNum.S_STALAG, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: MF_SOLID, raisestate: StateNum.S_NULL },
  // MT_MISC85 (dead torso)
  { doomednum: -1, spawnstate: StateNum.S_DEADTORSO, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
  // MT_MISC86 (dead bottom half)
  { doomednum: -1, spawnstate: StateNum.S_DEADBOTTOMHALF, spawnhealth: 1000, seestate: StateNum.S_NULL, seesound: SoundNum.sfx_None, reactiontime: 8, attacksound: SoundNum.sfx_None, painstate: StateNum.S_NULL, painchance: 0, painsound: SoundNum.sfx_None, meleestate: StateNum.S_NULL, missilestate: StateNum.S_NULL, deathstate: StateNum.S_NULL, xdeathstate: StateNum.S_NULL, deathsound: SoundNum.sfx_None, speed: 0, radius: 20*FU, height: 16*FU, mass: 100, damage: 0, activesound: SoundNum.sfx_None, flags: 0, raisestate: StateNum.S_NULL },
];

// ============================================================
// P_PatchActions — Wire action functions into states
// Must be called after modules are loaded (from D_DoomMain)
// ============================================================
export function P_PatchActions(): void {
  const {
    A_WeaponReady, A_Lower, A_Raise, A_Punch, A_ReFire,
    A_FirePistol, A_FireShotgun, A_FireCGun, A_FireMissile,
    A_FirePlasma, A_FireBFG, A_Saw, A_GunFlash,
    A_Light0, A_Light1, A_Light2,
  } = require("./p_pspr");
  const {
    A_Look, A_Chase, A_FaceTarget, A_Pain, A_Fall,
    A_PosAttack, A_SPosAttack, A_CPosAttack,
    A_TroopAttack, A_SargAttack, A_HeadAttack,
    A_BruisAttack, A_CyberAttack,
  } = require("./p_enemy");

  // Helper to set action on a state — wraps to handle both mobj and psprite calling conventions
  function setAction(stateNum: number, fn: any) {
    if (states[stateNum]) states[stateNum]!.action = fn;
  }

  // === Fist (punch) ===
  setAction(StateNum.S_PUNCH, A_WeaponReady);
  setAction(StateNum.S_PUNCHDOWN, A_Lower);
  setAction(StateNum.S_PUNCHUP, A_Raise);
  setAction(StateNum.S_PUNCH2, A_Punch);
  setAction(StateNum.S_PUNCH5, A_ReFire);

  // === Pistol ===
  setAction(StateNum.S_PISTOL, A_WeaponReady);
  setAction(StateNum.S_PISTOLDOWN, A_Lower);
  setAction(StateNum.S_PISTOLUP, A_Raise);
  setAction(StateNum.S_PISTOL1, A_FirePistol);
  setAction(StateNum.S_PISTOL4, A_ReFire);
  setAction(StateNum.S_PISTOLFLASH, A_Light1);

  // === Shotgun ===
  setAction(StateNum.S_SGUN, A_WeaponReady);
  setAction(StateNum.S_SGUNDOWN, A_Lower);
  setAction(StateNum.S_SGUNUP, A_Raise);
  setAction(StateNum.S_SGUN1, A_FireShotgun);
  setAction(StateNum.S_SGUN9, A_ReFire);
  setAction(StateNum.S_SGUNFLASH1, A_Light1);
  setAction(StateNum.S_SGUNFLASH2, A_Light2);

  // === Chaingun ===
  setAction(StateNum.S_CHAIN, A_WeaponReady);
  setAction(StateNum.S_CHAINDOWN, A_Lower);
  setAction(StateNum.S_CHAINUP, A_Raise);
  setAction(StateNum.S_CHAIN1, A_FireCGun);
  setAction(StateNum.S_CHAIN2, A_FireCGun);
  setAction(StateNum.S_CHAIN3, A_ReFire);
  setAction(StateNum.S_CHAINFLASH1, A_Light1);
  setAction(StateNum.S_CHAINFLASH2, A_Light2);

  // === Rocket launcher ===
  setAction(StateNum.S_MISSILE, A_WeaponReady);
  setAction(StateNum.S_MISSILEDOWN, A_Lower);
  setAction(StateNum.S_MISSILEUP, A_Raise);
  setAction(StateNum.S_MISSILE1, A_GunFlash);
  setAction(StateNum.S_MISSILE2, A_FireMissile);
  setAction(StateNum.S_MISSILE3, A_ReFire);
  setAction(StateNum.S_MISSILEFLASH1, A_Light1);

  // === Chainsaw ===
  setAction(StateNum.S_SAW, A_WeaponReady);
  setAction(StateNum.S_SAWDOWN, A_Lower);
  setAction(StateNum.S_SAWUP, A_Raise);
  setAction(StateNum.S_SAW2, A_Saw);
  setAction(StateNum.S_SAW3, A_ReFire);

  // === Plasma ===
  setAction(StateNum.S_PLASMA, A_WeaponReady);
  setAction(StateNum.S_PLASMADOWN, A_Lower);
  setAction(StateNum.S_PLASMAUP, A_Raise);
  setAction(StateNum.S_PLASMA1, A_FirePlasma);
  setAction(StateNum.S_PLASMA2, A_ReFire);
  setAction(StateNum.S_PLASMAFLASH1, A_Light1);
  setAction(StateNum.S_PLASMAFLASH2, A_Light1);

  // === BFG ===
  setAction(StateNum.S_BFG, A_WeaponReady);
  setAction(StateNum.S_BFGDOWN, A_Lower);
  setAction(StateNum.S_BFGUP, A_Raise);
  setAction(StateNum.S_BFG1, A_FireBFG);
  setAction(StateNum.S_BFG4, A_ReFire);
  setAction(StateNum.S_BFGFLASH1, A_Light1);
  setAction(StateNum.S_BFGFLASH2, A_Light2);

  // === Super Shotgun ===
  setAction(StateNum.S_DSGUN, A_WeaponReady);
  setAction(StateNum.S_DSGUNDOWN, A_Lower);
  setAction(StateNum.S_DSGUNUP, A_Raise);
  setAction(StateNum.S_DSGUN1, A_FireShotgun);
  setAction(StateNum.S_DSGUN10, A_ReFire);
  setAction(StateNum.S_DSGUNFLASH1, A_Light1);
  setAction(StateNum.S_DSGUNFLASH2, A_Light2);

  // === Light done ===
  setAction(StateNum.S_LIGHTDONE, A_Light0);

  // === Enemy AI wiring (simplified) ===
  // Only apply to monsters (MF_COUNTKILL), not the player.
  const { MF_COUNTKILL } = require("./doomdata");
  for (let i = 0; i < mobjinfo.length; i++) {
    const info = mobjinfo[i]!;
    if (!info) continue;
    if (!(info.flags & MF_COUNTKILL)) continue;

    if (info.spawnstate && info.seestate) setAction(info.spawnstate, A_Look);
    if (info.seestate) setAction(info.seestate, A_Chase);
    if (info.painstate) setAction(info.painstate, A_Pain);
    if (info.deathstate) setAction(info.deathstate, A_Fall);
    if (info.xdeathstate) setAction(info.xdeathstate, A_Fall);
  }

  // Per-type attack actions (subset for common monsters)
  const attackByType: Record<number, any> = {
    [MobjType.MT_POSSESSED]: A_PosAttack,
    [MobjType.MT_SHOTGUY]: A_SPosAttack,
    [MobjType.MT_CHAINGUY]: A_CPosAttack,
    [MobjType.MT_TROOP]: A_TroopAttack,
    [MobjType.MT_SERGEANT]: A_SargAttack,
    [MobjType.MT_HEAD]: A_HeadAttack,
    [MobjType.MT_BRUISER]: A_BruisAttack,
    [MobjType.MT_KNIGHT]: A_BruisAttack,
    [MobjType.MT_CYBORG]: A_CyberAttack,
  };

  for (let i = 0; i < mobjinfo.length; i++) {
    const info = mobjinfo[i]!;
    const attack = attackByType[i];
    if (!attack) continue;
    if (!(info.flags & MF_COUNTKILL)) continue;

    if (info.meleestate) setAction(info.meleestate, attack);
    if (info.missilestate) setAction(info.missilestate, attack);
  }

}
