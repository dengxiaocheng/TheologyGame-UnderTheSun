// src/engine/npcAttitude.ts — NPC态度动态引擎

import type { GameState } from '../models/gameState.js';
import type { NPCAttitude } from '../models/npc.js';
import type { ResourceEffect } from './actions.js';

/** 态度变化事件 */
export interface AttitudeChangeEvent {
  npcId: string;
  trust?: number;
  respect?: number;
  closeness?: number;
  fear?: number;
  resentment?: number;
  reason: string;
}

/** 关系等级 */
export type RelationshipLevel = 'hostile' | 'cold' | 'neutral' | 'friendly' | 'close' | 'devoted';

/** 关系等级判断阈值 */
function getRelationshipLevel(attitude: NPCAttitude): RelationshipLevel {
  const score = attitude.trust * 0.3 + attitude.respect * 0.2 + attitude.closeness * 0.3 - attitude.resentment * 0.2;
  if (score >= 70) return 'devoted';
  if (score >= 55) return 'close';
  if (score >= 40) return 'friendly';
  if (score >= 25) return 'neutral';
  if (score >= 10) return 'cold';
  return 'hostile';
}

const RELATIONSHIP_LABELS: Record<RelationshipLevel, string> = {
  hostile: '敌对',
  cold: '冷淡',
  neutral: '一般',
  friendly: '友善',
  close: '亲密',
  devoted: '忠诚',
};

export class NPCAttitudeEngine {
  /** 根据行动效果调整相关NPC态度 */
  processActionEffects(
    state: GameState,
    effects: ResourceEffect[],
    targetNpcId?: string,
  ): AttitudeChangeEvent[] {
    const changes: AttitudeChangeEvent[] = [];

    for (const eff of effects) {
      // 影响所有有态度的NPC（公共行为）
      if (eff.layer === 'social' && eff.field === 'neighborTrust') {
        const delta = Math.sign(eff.delta);
        // 给随机几个NPC调整态度
        const npcIds = [...state.attitudes.keys()].slice(0, 5);
        for (const npcId of npcIds) {
          changes.push({
            npcId,
            trust: delta * 2,
            closeness: delta * 1,
            reason: `社交行为影响（${eff.delta > 0 ? '+' : ''}${eff.delta} 邻里信任）`,
          });
        }
      }

      if (eff.layer === 'ritual' && eff.field === 'charityReputation') {
        // 施舍行为影响祭司和长者
        const priestIds = state.npcs
          .filter(n => n.occupation === '祭司' || n.occupation === '长老' || n.socialGroup === 'elder')
          .map(n => n.id)
          .filter(id => state.attitudes.has(id));
        for (const npcId of priestIds) {
          changes.push({
            npcId,
            respect: Math.sign(eff.delta) * 2,
            reason: `施舍/慈善行为（${eff.delta > 0 ? '+' : ''}${eff.delta}）`,
          });
        }
      }
    }

    // 直接交互的NPC获得更大的态度变化
    if (targetNpcId && state.attitudes.has(targetNpcId)) {
      changes.push({
        npcId: targetNpcId,
        closeness: 3,
        trust: 2,
        reason: '直接交互',
      });
    }

    // 应用变化
    this.applyChanges(state, changes);
    return changes;
  }

  /** 传闻对态度的影响 */
  processRumorEffects(state: GameState, rumorText: string, affectedNpcIds: string[]): AttitudeChangeEvent[] {
    const changes: AttitudeChangeEvent[] = [];
    const isNegative = rumorText.includes('坏') || rumorText.includes('恶') || rumorText.includes('罪') || rumorText.includes('偷');

    for (const npcId of affectedNpcIds) {
      if (!state.attitudes.has(npcId)) continue;
      changes.push({
        npcId,
        trust: isNegative ? -3 : 1,
        respect: isNegative ? -2 : 1,
        reason: `传闻影响：「${rumorText.slice(0, 10)}…」`,
      });
    }

    this.applyChanges(state, changes);
    return changes;
  }

  /** 每日态度自然漂移 */
  processDailyDrift(state: GameState): AttitudeChangeEvent[] {
    const changes: AttitudeChangeEvent[] = [];

    for (const [npcId, attitude] of state.attitudes) {
      // 信任缓慢回归中值（50）
      const trustDrift = attitude.trust > 55 ? -1 : attitude.trust < 45 ? 1 : 0;
      // 亲近度自然衰减（久不联系）
      const closenessDrift = attitude.closeness > 30 ? -1 : 0;
      // 怨恨缓慢衰减
      const resentmentDrift = attitude.resentment > 5 ? -1 : 0;

      if (trustDrift !== 0 || closenessDrift !== 0 || resentmentDrift !== 0) {
        changes.push({
          npcId,
          trust: trustDrift,
          closeness: closenessDrift,
          resentment: resentmentDrift,
          reason: '日常漂移',
        });
      }
    }

    this.applyChanges(state, changes);
    return changes;
  }

  /** 获取某NPC的关系等级 */
  getRelationshipLevel(state: GameState, npcId: string): { level: RelationshipLevel; label: string } {
    const attitude = state.attitudes.get(npcId);
    if (!attitude) return { level: 'neutral', label: '一般' };
    const level = getRelationshipLevel(attitude);
    return { level, label: RELATIONSHIP_LABELS[level] };
  }

  /** 获取NPC态度摘要 */
  getAttitudeSummary(state: GameState, npcId: string): string {
    const attitude = state.attitudes.get(npcId);
    if (!attitude) return '无态度数据';
    const npc = state.npcs.find(n => n.id === npcId);
    const { label } = this.getRelationshipLevel(state, npcId);
    const name = npc?.name ?? npcId;
    return `${name}：信任${attitude.trust} 尊敬${attitude.respect} 亲近${attitude.closeness} 恐惧${attitude.fear} 怨恨${attitude.resentment} [${label}]`;
  }

  /** 应用态度变化到状态 */
  private applyChanges(state: GameState, changes: AttitudeChangeEvent[]): void {
    for (const change of changes) {
      let attitude = state.attitudes.get(change.npcId);
      if (!attitude) continue;

      attitude = {
        trust: clamp(attitude.trust + (change.trust ?? 0), 0, 100),
        respect: clamp(attitude.respect + (change.respect ?? 0), 0, 100),
        closeness: clamp(attitude.closeness + (change.closeness ?? 0), 0, 100),
        fear: clamp(attitude.fear + (change.fear ?? 0), 0, 100),
        resentment: clamp(attitude.resentment + (change.resentment ?? 0), 0, 100),
      };
      state.attitudes.set(change.npcId, attitude);
    }
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
