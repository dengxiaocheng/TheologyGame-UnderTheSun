// src/models/npc.ts — NPC 基础类型

import type { GameDate } from './time.js';
import type { Gender } from './family.js';

/** NPC 态度（五维度） */
export interface NPCAttitude {
  /** 信任 */
  trust: number;       // 0-100
  /** 尊敬 */
  respect: number;     // 0-100
  /** 亲近 */
  closeness: number;   // 0-100
  /** 敬畏 */
  fear: number;        // 0-100
  /** 怨恨 */
  resentment: number;  // 0-100
}

/** NPC 身份 */
export interface NPCIdentity {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  occupation: string;
  socialGroup: string;
  language: ('aramaic' | 'greek' | 'latin')[];
  location: string;
}

/** 声誉标签 */
export interface ReputationTag {
  tag: string;
  source: string;
  weight: number;
  timestamp: GameDate;
}
