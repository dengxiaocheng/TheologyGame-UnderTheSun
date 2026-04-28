// src/models/gameState.ts — 全局游戏状态

import type { GameDate } from './time.js';
import type { Family } from './family.js';
import type { NPCIdentity, NPCAttitude, ReputationTag } from './npc.js';
import type { WeatherState } from '../engine/weather.js';
import type { TaxState } from '../engine/tax.js';
import type { NPCDailySchedule } from '../engine/npcSchedule.js';
import type { PlayerLocation } from './location.js';

/** 行动后果 */
export interface Consequence {
  target: string;
  field: string;
  delta: number;
}

/** 玩家选择 */
export interface Choice {
  id: string;
  text: string;
  consequences: Consequence[];
}

/** 游戏事件 */
export interface GameEvent {
  id: string;
  date: GameDate;
  type: string;
  description: string;
  affectedEntities: string[];
  choices?: Choice[];
}

/** 全局游戏状态 */
export interface GameState {
  date: GameDate;
  family: Family;
  npcs: NPCIdentity[];
  /** NPC态度：npcId -> attitude */
  attitudes: Map<string, NPCAttitude>;
  reputationTags: ReputationTag[];
  eventLog: GameEvent[];
  currentLocationId: string;
  /** 玩家位置（含地图和旅行进度） */
  currentLocation: PlayerLocation;
  /** 天气状态 */
  weather: WeatherState | null;
  /** 税收状态 */
  taxState: TaxState;
  /** NPC日程：npcId -> schedule */
  npcSchedules: Map<string, NPCDailySchedule>;
}
