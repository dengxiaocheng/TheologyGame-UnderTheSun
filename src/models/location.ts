// src/models/location.ts — 地点系统模型

import type { ActionType } from '../engine/actions.js';

/** 单个地点 */
export interface Location {
  id: string;
  name: string;
  description: string;
  /** 属于哪个地图区域 */
  mapId: string;
  /** 该地点内的子地点ID数组 */
  subLocations: string[];
  /** 相邻地点ID数组（可直接移动到达） */
  connections: string[];
  /** 此地点可用的行动类型 */
  availableActions: ActionType[];
  /** 是否有市场 */
  marketAvailable: boolean;
  /** 是否为税收检查点 */
  taxCheckpoint: boolean;
  /** 危险等级 0-100 */
  dangerLevel: number;
}

/** 地图区域 */
export interface MapRegion {
  id: string;
  name: string;
  description: string;
  locationIds: string[];
}

/** 玩家位置状态 */
export interface PlayerLocation {
  currentLocationId: string;
  currentMapId: string;
  /** 旅行进度（0 = 未在旅行, 1-100 = 在路上） */
  travelProgress: number;
}
