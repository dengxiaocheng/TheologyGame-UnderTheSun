// src/engine/reputation.ts — 声誉标签管理

import type { GameState } from '../models/gameState.js';
import type { ReputationTag } from '../models/npc.js';

/** 添加声誉标签 */
export function addReputationTag(
  state: GameState,
  tag: string,
  source: string,
  weight: number,
): void {
  state.reputationTags.push({
    tag,
    source,
    weight,
    timestamp: { ...state.date },
  });
}

/** 获取所有活跃的声誉标签 */
export function getActiveReputationTags(state: GameState): ReputationTag[] {
  return state.reputationTags;
}

/** 检查是否有包含指定子串的声誉标签 */
export function hasReputationTag(state: GameState, tagSubstring: string): boolean {
  return state.reputationTags.some(t => t.tag.includes(tagSubstring));
}

/** 生成声誉摘要文本 */
export function getReputationSummary(state: GameState): string {
  const tags = getActiveReputationTags(state);
  if (tags.length === 0) {
    return '当前没有任何声誉标签。';
  }

  const lines: string[] = ['── 声誉标签 ──'];
  for (const t of tags) {
    lines.push(`  「${t.tag}」(来源: ${t.source}, 权重: ${t.weight})`);
  }
  return lines.join('\n');
}
