// src/engine/events/questEngine.ts — 任务引擎

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition, QuestConsequence } from './types.js';

/** 应用任务后果到游戏状态 */
export function applyQuestConsequence(state: GameState, cons: QuestConsequence): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layer = (state.family.resources as any)[cons.layer];
  const value = layer[cons.field];

  if (typeof value === 'number') {
    layer[cons.field] = value + cons.delta;
  }
}

/** 任务引擎 */
export class QuestEngine {
  private quests: QuestDefinition[] = [];
  private pending: QuestDefinition | undefined;
  private triggeredIds: Set<string> = new Set();

  /** 注册任务 */
  register(quest: QuestDefinition): void {
    this.quests.push(quest);
  }

  /** 检查是否有任务应触发 */
  checkTriggers(state: GameState): QuestDefinition | undefined {
    for (const quest of this.quests) {
      if (this.triggeredIds.has(quest.id)) continue;
      if (quest.triggerCondition(state)) {
        return quest;
      }
    }
    return undefined;
  }

  /** 设置待处理的任务 */
  setPendingQuest(quest: QuestDefinition): void {
    this.pending = quest;
    this.triggeredIds.add(quest.id);
  }

  /** 获取待处理的任务 */
  getPendingQuest(): QuestDefinition | undefined {
    return this.pending;
  }

  /** 清除待处理任务 */
  clearPendingQuest(): void {
    this.pending = undefined;
  }

  /** 格式化任务文本 */
  presentQuest(quest: QuestDefinition): string {
    const lines: string[] = [];
    lines.push('╔══════════════════════════════════════╗');
    lines.push(`║ 事件：${quest.title}`);
    lines.push('╚══════════════════════════════════════╝');
    lines.push('');
    lines.push(quest.description);
    lines.push('');
    lines.push('── 你的选择 ──');
    for (let i = 0; i < quest.choices.length; i++) {
      const c = quest.choices[i];
      lines.push(`  ${i + 1}. ${c.text}`);
    }
    lines.push('');
    lines.push('使用「choose <编号>」做出选择。');
    return lines.join('\n');
  }

  /** 解析选择并应用后果 */
  resolveChoice(quest: QuestDefinition, choiceIndex: number, state: GameState): string[] {
    const logs: string[] = [];

    if (choiceIndex < 0 || choiceIndex >= quest.choices.length) {
      logs.push('无效的选择编号。');
      return logs;
    }

    const choice = quest.choices[choiceIndex];
    logs.push(`你选择了：${choice.text}`);
    logs.push('');

    // 应用后果
    for (const cons of choice.consequences) {
      applyQuestConsequence(state, cons);
      logs.push(`  → ${cons.description}`);
    }

    // 调用 per-quest onResolve（替代猴子补丁）
    if (quest.onResolve) {
      const resolveLogs = quest.onResolve(choice.id, state);
      for (const log of resolveLogs) {
        logs.push(log);
      }
    }

    // 调用完成回调
    if (quest.onComplete) {
      const callbackLogs = quest.onComplete(state);
      logs.push(...callbackLogs);
    }

    // 从注册列表中移除已完成的任务
    this.quests = this.quests.filter(q => q.id !== quest.id);
    this.pending = undefined;

    return logs;
  }
}
