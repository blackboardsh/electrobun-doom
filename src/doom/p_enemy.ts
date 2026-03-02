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
    const { P_CheckSight } = require("./p_sight");
    if (!P_CheckSight(actor, player.mo)) return;
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

  const { pointToAngle2, finecosine, finesine, FINEMASK, ANGLETOFINESHIFT, fixedMul, ANG90 } = require("./tables");
  const { P_AproxDistance } = require("./p_maputl");
  const { P_CheckSight } = require("./p_sight");
  const { P_TryMove } = require("./p_map");
  const angle = pointToAngle2(actor.x, actor.y, target.x, target.y);
  actor.angle = angle;

  const speed = (actor.info.speed || 0) * FRACUNIT;
  if (speed <= 0) return;

  const fine = (angle >>> ANGLETOFINESHIFT) & FINEMASK;
  let dx = fixedMul(speed, finecosine[fine]);
  let dy = fixedMul(speed, finesine[fine]);

  // Try to move toward target; if blocked, try simple sidestep
  let moved = P_TryMove(actor, actor.x + dx, actor.y + dy);
  if (!moved) {
    const alt1 = ((angle + ANG90) >>> 0);
    const fine1 = (alt1 >>> ANGLETOFINESHIFT) & FINEMASK;
    dx = fixedMul(speed, finecosine[fine1]);
    dy = fixedMul(speed, finesine[fine1]);
    moved = P_TryMove(actor, actor.x + dx, actor.y + dy);
  }
  if (!moved) {
    const alt2 = ((angle - ANG90) >>> 0);
    const fine2 = (alt2 >>> ANGLETOFINESHIFT) & FINEMASK;
    dx = fixedMul(speed, finecosine[fine2]);
    dy = fixedMul(speed, finesine[fine2]);
    moved = P_TryMove(actor, actor.x + dx, actor.y + dy);
  }
  if (!moved) {
    dx = 0; dy = 0;
  }

  actor.momx = dx;
  actor.momy = dy;

  // Simple attack decision
  if (actor.info.missilestate) {
    const dist = P_AproxDistance(actor.x - target.x, actor.y - target.y);
    if (dist < 256 * FRACUNIT && P_CheckSight(actor, target)) {
      if ((P_Random() & 3) === 0) {
        const { P_SetMobjState } = require("./p_mobj");
        P_SetMobjState(actor, actor.info.missilestate);
      }
    }
  }

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
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 512 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 5 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_SPosAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 512 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 5 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_CPosAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 512 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 5 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_CPosRefire(actor: MapObject): void {}
export function A_TroopAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 768 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_SargAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 256 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 64 * FRACUNIT);
  const damage = (P_Random() % 10 + 1) * 4;
  P_LineAttack(actor, actor.angle, 64 * FRACUNIT, slope, damage);
}
export function A_HeadAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 768 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 3;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_CyberAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 1024 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
  const { P_AimLineAttack, P_LineAttack } = require("./p_map");
  const slope = P_AimLineAttack(actor, actor.angle, 16 * 64 * FRACUNIT);
  const damage = (P_Random() % 8 + 1) * 5;
  P_LineAttack(actor, actor.angle, 16 * 64 * FRACUNIT, slope, damage);
}
export function A_BruisAttack(actor: MapObject): void {
  A_FaceTarget(actor);
  if (!actor.target) return;
  const { P_CheckSight } = require("./p_sight");
  if (!P_CheckSight(actor, actor.target)) return;
  const { P_AproxDistance } = require("./p_maputl");
  const dist = P_AproxDistance(actor.x - actor.target.x, actor.y - actor.target.y);
  if (dist > 768 * FRACUNIT) return;
  try { console.log(`[ATK] type=${actor.type} dist=${(dist/FRACUNIT).toFixed(1)} pos=(${(actor.x/FRACUNIT).toFixed(1)},${(actor.y/FRACUNIT).toFixed(1)})`); } catch {}
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
