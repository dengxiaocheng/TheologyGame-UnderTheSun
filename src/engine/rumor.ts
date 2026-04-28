// src/engine/rumor.ts — 传闻传播系统

import type { GameState } from '../models/gameState.js';
import type { NPCIdentity } from '../models/npc.js';

/** 传闻 */
export interface Rumor {
  id: string;
  /** 传闻内容 */
  text: string;
  /** 来源（通常是事件ID或行动类型） */
  source: string;
  /** 目击者（最初知情的人） */
  witnesses: string[];
  /** 传播范围 0-100 */
  spread: number;
  /** 传播速度（每天增加的传播度） */
  spreadRate: number;
  /** 关联的声誉标签（可选） */
  reputationTag?: string;
  /** 创建日期（天数） */
  createdDay: number;
}

/**
 * 添加一条传闻到游戏状态
 * 传闻会根据目击者数量和邻舍信任度自然传播
 */
export function addRumor(
  state: GameState,
  id: string,
  text: string,
  source: string,
  witnesses: string[],
  options?: {
    spreadRate?: number;
    reputationTag?: string;
  },
): Rumor {
  const rumor: Rumor = {
    id,
    text,
    source,
    witnesses,
    spread: Math.min(30, witnesses.length * 10), // 初始传播度 = 目击者数 × 10
    spreadRate: options?.spreadRate ?? 5,
    reputationTag: options?.reputationTag,
    createdDay: state.date.day,
  };

  state.eventLog.push({
    id: `rumor-${id}`,
    date: { ...state.date },
    type: 'rumor',
    description: text,
    affectedEntities: witnesses,
  });

  return rumor;
}

/** 存储活跃传闻的辅助结构 */
export class RumorEngine {
  private rumors: Rumor[] = [];

  /** 添加传闻 */
  addRumor(
    state: GameState,
    id: string,
    text: string,
    source: string,
    witnesses: string[],
    options?: { spreadRate?: number; reputationTag?: string },
  ): Rumor {
    const rumor = addRumor(state, id, text, source, witnesses, options);
    this.rumors.push(rumor);
    return rumor;
  }

  /** 每日传播 — 推进所有传闻的传播度 */
  tickDaily(state: GameState): string[] {
    const logs: string[] = [];

    for (const rumor of this.rumors) {
      const oldSpread = rumor.spread;

      // 基于邻里信任度调整传播速度
      const trust = state.family.resources.social.neighborTrust;
      const trustBonus = trust > 50 ? 1.2 : trust < 30 ? 0.7 : 1.0;
      rumor.spread = Math.min(100, rumor.spread + rumor.spreadRate * trustBonus);

      // 传播到关键阈值时提示
      if (oldSpread < 50 && rumor.spread >= 50) {
        logs.push(`传闻「${rumor.text}」已经在村里传开了。`);
      }
      if (oldSpread < 80 && rumor.spread >= 80) {
        logs.push(`传闻「${rumor.text}」传到了邻村。`);
      }
    }

    // 清除传播到 100 且超过 3 天的传闻（已不再是"新闻"）
    this.rumors = this.rumors.filter(r => !(r.spread >= 100 && state.date.day - r.createdDay > 3));

    return logs;
  }

  /** 获取所有活跃传闻 */
  getActiveRumors(): Rumor[] {
    return [...this.rumors];
  }

  /** 生成传闻摘要 */
  getSummary(): string {
    if (this.rumors.length === 0) {
      return '当前没有流传的传闻。';
    }

    const lines: string[] = ['── 流传中的传闻 ──'];
    for (const r of this.rumors) {
      const bar = renderSpreadBar(r.spread, 10);
      lines.push(`  「${r.text}」 传播度: ${bar} ${r.spread}%`);
    }
    return lines.join('\n');
  }
}

function renderSpreadBar(current: number, width: number): string {
  const filled = Math.round((current / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
