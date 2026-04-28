// src/data/npcAttitudes.ts — NPC 初始态度数据

import type { NPCAttitude } from '../models/npc.js';

/** 创建初始 NPC 态度映射 */
export function createInitialAttitudes(): Map<string, NPCAttitude> {
  const attitudes = new Map<string, NPCAttitude>();

  // ── 核心村民 ──

  attitudes.set('npc-yonah-fisherman', {
    trust: 55,
    respect: 50,
    closeness: 50,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-miriam-weaver', {
    trust: 50,
    respect: 55,
    closeness: 45,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-eleazar-scribe', {
    trust: 45,
    respect: 60,
    closeness: 35,
    fear: 10,
    resentment: 5,
  });

  attitudes.set('npc-hannah-midwife', {
    trust: 55,
    respect: 55,
    closeness: 50,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-joachim-steward', {
    trust: 40,
    respect: 50,
    closeness: 30,
    fear: 15,
    resentment: 10,
  });

  attitudes.set('npc-silas-olivepress', {
    trust: 50,
    respect: 50,
    closeness: 45,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-martha-baker', {
    trust: 55,
    respect: 50,
    closeness: 50,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-bartimaeus-beggar', {
    trust: 45,
    respect: 40,
    closeness: 40,
    fear: 10,
    resentment: 10,
  });

  attitudes.set('npc-esther-potter', {
    trust: 50,
    respect: 45,
    closeness: 45,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-asher-shepherd', {
    trust: 55,
    respect: 45,
    closeness: 50,
    fear: 5,
    resentment: 5,
  });

  // ── 湖畔/集市 ──

  // 马太（税吏）— 特殊：低信任，高敬畏
  attitudes.set('npc-matthew-tax', {
    trust: 30,
    respect: 40,
    closeness: 25,
    fear: 40,
    resentment: 15,
  });

  attitudes.set('npc-dorian-merchant', {
    trust: 40,
    respect: 45,
    closeness: 30,
    fear: 10,
    resentment: 5,
  });

  attitudes.set('npc-aquila-netmaker', {
    trust: 50,
    respect: 50,
    closeness: 45,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-berenice-fishsalter', {
    trust: 50,
    respect: 50,
    closeness: 45,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-shimon-kepha', {
    trust: 55,
    respect: 55,
    closeness: 50,
    fear: 5,
    resentment: 5,
  });

  // ── 道路/旅行 ──

  // 卢基乌斯（罗马士兵）— 特殊：低信任，低亲近
  attitudes.set('npc-lucius-soldier', {
    trust: 20,
    respect: 35,
    closeness: 10,
    fear: 50,
    resentment: 20,
  });

  attitudes.set('npc-tamar-traveler', {
    trust: 40,
    respect: 45,
    closeness: 30,
    fear: 10,
    resentment: 5,
  });

  attitudes.set('npc-cleopas-merchant', {
    trust: 45,
    respect: 50,
    closeness: 35,
    fear: 10,
    resentment: 5,
  });

  // ── 特殊态度 NPC ──

  attitudes.set('npc-judah-debtor', {
    trust: 50,
    respect: 45,
    closeness: 45,
    fear: 5,
    resentment: 5,
  });

  attitudes.set('npc-ananias-elder', {
    trust: 45,
    respect: 60,
    closeness: 35,
    fear: 15,
    resentment: 10,
  });

  return attitudes;
}
