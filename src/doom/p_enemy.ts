// p_enemy.ts — Enemy AI state machines (simplified)
import { FRACUNIT } from "./doomdef";
import type { MapObject } from "./doomdata";

// AI action functions (called from state machine)
export function A_Look(actor: MapObject): void {
  // Look for players (simplified: always target console player if alive)
  actor.threshold = 0;
  const doomstat = require("./doomstat");
  const player = doomstat.players[doomstat.consoleplayer];
  if (player && player.mo && player.mo.health > 0) {
    actor.target = player.mo;
    const { P_SetMobjState } = require("./p_mobj");
    if (actor.info.seestate) {
      P_SetMobjState(actor, actor.info.seestate);
    }
  }
}

export function A_Chase(actor: MapObject): void {
  // Chase target
  if (!actor.target) {
    A_Look(actor);
    return;
  }

  // Move towards target (simplified)
  const target = actor.target;
  if (!target) return;

  const { pointToAngle2, finecosine, finesine, FINEMASK, ANGLETOFINESHIFT, fixedMul } = require("./tables");
  const angle = pointToAngle2(actor.x, actor.y, target.x, target.y);
  actor.angle = angle;

  const speed = (actor.info.speed || 0) * FRACUNIT;
  if (speed <= 0) return;

  const fine = (angle >>> ANGLETOFINESHIFT) & FINEMASK;
  actor.momx = fixedMul(speed, finecosine[fine]);
  actor.momy = fixedMul(speed, finesine[fine]);

  if (actor.movecount <= 0) {
    actor.movecount = P_Random() & 15;
  }
  actor.movecount--;
}

export function A_FaceTarget(actor: MapObject): void {
  if (!actor.target) return;
  const { pointToAngle2 } = require("./tables");
  actor.angle = pointToAngle2(actor.x, actor.y, actor.target.x, actor.target.y);
}

export function A_PosAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 5 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_SPosAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 5 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_CPosAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 5 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_CPosRefire(actor: MapObject): void {}
export function A_TroopAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_SargAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 64 * FRACUNIT);
  const damage = (P_Random() % 10 + 1) * 4;
  P_LineAttack(actor, actor.angle, 64 * FRACUNIT, slope, damage);
}
export function A_HeadAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_CyberAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 5;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_BruisAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 4;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_SkelMissile(actor: MapObject): void { A_FaceTarget(actor); }
export function A_SkelWhoosh(actor: MapObject): void {}
export function A_SkelFist(actor: MapObject): void {}
export function A_FatRaise(actor: MapObject): void {}
export function A_FatAttack1(actor: MapObject): void {}
export function A_FatAttack2(actor: MapObject): void {}
export function A_FatAttack3(actor: MapObject): void {}
export function A_VileChase(actor: MapObject): void { A_Chase(actor); }
export function A_VileStart(actor: MapObject): void {}
export function A_VileTarget(actor: MapObject): void {}
export function A_VileAttack(actor: MapObject): void {}
export function A_StartFire(actor: MapObject): void {}
export function A_Fire(actor: MapObject): void {}
export function A_FireCrackle(actor: MapObject): void {}
export function A_Tracer(actor: MapObject): void {}
export function A_SkullAttack(actor: MapObject): void {}
export function A_BspiAttack(actor: MapObject): void {}
export function A_SpidRefire(actor: MapObject): void {}
export function A_BabyMetal(actor: MapObject): void {}
export function A_Metal(actor: MapObject): void {}
export function A_Hoof(actor: MapObject): void {}
export function A_BrainAwake(actor: MapObject): void {}
export function A_BrainPain(actor: MapObject): void {}
export function A_BrainScream(actor: MapObject): void {}
export function A_BrainExplode(actor: MapObject): void {}
export function A_BrainDie(actor: MapObject): void {}
export function A_BrainSpit(actor: MapObject): void {}
export function A_SpawnSound(actor: MapObject): void {}
export function A_SpawnFly(actor: MapObject): void {}
export function A_PainShootSkull(actor: MapObject, angle: number): void {}
export function A_PainAttack(actor: MapObject): void {}
export function A_PainDie(actor: MapObject): void {}
export function A_Scream(actor: MapObject): void {}
export function A_XScream(actor: MapObject): void {}
export function A_Pain(actor: MapObject): void {}
export function A_Fall(actor: MapObject): void { actor.flags &= ~2; /* ~MF_SOLID */ }
export function A_Explode(actor: MapObject): void {}
export function A_BossDeath(actor: MapObject): void {}
export function A_KeenDie(actor: MapObject): void {}

function P_Random(): number {
  const { P_Random: PR } = require("./m_misc");
  return PR();
}
