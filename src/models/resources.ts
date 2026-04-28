// src/models/resources.ts — 四层资源系统

import type { GameDate } from './time.js';

// ---- 第一层：生存资源 ----

export interface SurvivalResources {
  /** 谷物（单位：份） */
  grain: number;
  /** 清水 */
  water: number;
  /** 灯油 */
  oil: number;
  /** 鱼干 / 鲜鱼 */
  fish: number;
  /** 盐 */
  salt: number;
  /** 柴火 */
  firewood: number;
  /** 衣物（套） */
  clothing: number;
  /** 住所耐久 0-100 */
  shelterDurability: number;
  /** 牲畜健康 0-100 */
  livestockHealth: number;
}

// ---- 第二层：经济资源 ----

export interface ToolRecord {
  id: string;
  name: string;
  durability: number;
  maxDurability: number;
  type: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  quality: number; // 0-100
}

export interface OrderRecord {
  id: string;
  type: 'buy' | 'sell';
  item: string;
  quantity: number;
  pricePerUnit: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface EconomicResources {
  /** 铜币（lepton）, 1 denarius = 128 leptons */
  copperCoins: number;
  /** 银币（denarius） */
  silverCoins: number;
  tools: ToolRecord[];
  inventory: InventoryItem[];
  pendingOrders: OrderRecord[];
}

// ---- 第三层：社会资源 ----

export interface SocialResources {
  /** 家族荣耀 0-100 */
  familyHonor: number;
  /** 邻里信任 0-100 */
  neighborTrust: number;
  /** 长辈认可 0-100 */
  elderApproval: number;
  /** 债主耐心：债主ID -> 耐心值 0-100 */
  creditorPatience: Map<string, number>;
}

// ---- 第四层：礼仪/属灵资源 ----

export interface PurityState {
  isPure: boolean;
  impuritySources: string[];
  purificationDeadline?: GameDate;
}

export interface RitualResources {
  /** 安息日准备度 0-100 */
  sabbathReadiness: number;
  /** 洁净状态 */
  purityStatus: PurityState;
  /** 各节期准备度 */
  festivalReadiness: Map<string, number>;
  /** 施舍声誉 0-100 */
  charityReputation: number;
  /** 会堂参与度 0-100 */
  synagogueParticipation: number;
}

// ---- 聚合 ----

export interface FamilyResources {
  survival: SurvivalResources;
  economic: EconomicResources;
  social: SocialResources;
  ritual: RitualResources;
}
