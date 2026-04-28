// src/engine/events/types.ts — 任务/事件共享类型

import type { GameState } from '../../models/gameState.js';

/** 任务触发条件 */
export type QuestCondition = (state: GameState) => boolean;

/** 任务后果 */
export interface QuestConsequence {
  /** 资源层 */
  layer: 'survival' | 'economic' | 'social' | 'ritual';
  /** 资源字段 */
  field: string;
  /** 变化量 */
  delta: number;
  /** 描述（用于日志） */
  description: string;
}

/** 任务选项 */
export interface QuestChoice {
  id: string;
  text: string;
  consequences: QuestConsequence[];
}

/** 任务定义 */
export interface QuestDefinition {
  id: string;
  title: string;
  triggerCondition: QuestCondition;
  description: string;
  choices: QuestChoice[];
  /** 选择后的额外逻辑（声誉标签、特殊效果等），返回追加日志 */
  onResolve?: (choiceId: string, state: GameState) => string[];
  /** 完成后的通用收尾（叙事文本），返回追加日志 */
  onComplete?: (state: GameState) => string[];
}
