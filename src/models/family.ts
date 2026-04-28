// src/models/family.ts — 家庭与成员类型

import type { GameDate } from './time.js';
import type { FamilyResources } from './resources.js';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  TIRED = 'tired',
  SICK = 'sick',
  INJURED = 'injured',
  CRITICAL = 'critical',
}

/** 家庭成员在家庭中的角色 */
export enum FamilyRole {
  PATRIARCH = 'patriarch',
  MATRIARCH = 'matriarch',
  GRANDPARENT = 'grandparent',
  ELDER_SON = 'elder_son',
  ELDER_DAUGHTER = 'elder_daughter',
  YOUTH = 'youth',
  CHILD = 'child',
}

/** 家庭成员 */
export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  health: HealthStatus;
  /** 体力 0-100 */
  stamina: number;
  maxStamina: number;
  /** 掌握的手艺 */
  craft: string[];
  /** 读写能力 0-100 */
  literacy: number;
  /** 声誉标签 */
  reputation: string[];
  /** 婚姻状态 */
  marriageStatus: 'single' | 'betrothed' | 'married' | 'widowed';
  /** 所属亲族 ID */
  kinshipId: string;
  /** 个人债务 */
  debt: number;
  /** 技能表：技能名 -> 熟练度 0-100 */
  skills: Map<string, number>;
  /** 家庭角色 */
  role: FamilyRole;
}

/** 债务记录 */
export interface DebtRecord {
  creditorId: string;
  amount: number;
  dueDate: GameDate;
  collateral?: string;
  status: 'active' | 'paid' | 'defaulted';
}

/** 家庭 */
export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  resources: FamilyResources;
  reputation: string[];
  debts: DebtRecord[];
}
