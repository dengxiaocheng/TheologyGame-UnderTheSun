// src/engine/sabbath.ts — 安息日准备与洁净系统

import type { GameState } from '../models/gameState.js';
import type { GameDate } from '../models/time.js';
import { totalDaysElapsed, advanceToNextDay, isSabbathDay, TimeOfDay, formatDate } from '../models/time.js';

// ---- 安息日准备度 ----

/** 安息日准备度每日自然衰减（模拟日常消耗） */
const SABBATH_READINESS_DAILY_DECAY = 5;

/** 安息日准备度阈值 */
export const SABBATH_READINESS_LOW = 30;
export const SABBATH_READINESS_ADEQUATE = 60;
export const SABBATH_READINESS_EXCELLENT = 85;

/** 获取安息日准备度等级描述 */
export function getSabbathReadinessLabel(value: number): string {
  if (value >= SABBATH_READINESS_EXCELLENT) return '预备充分';
  if (value >= SABBATH_READINESS_ADEQUATE) return '基本就绪';
  if (value >= SABBATH_READINESS_LOW) return '稍显不足';
  return '严重不足';
}

/** 距下一个安息日还有几天 */
export function daysUntilSabbath(date: GameDate): number {
  const elapsed = totalDaysElapsed(date);
  const daysSinceLastSabbath = elapsed % 7;
  return daysSinceLastSabbath === 0 ? 0 : 7 - daysSinceLastSabbath;
}

// ---- 每日安息日准备度结算 ----

/** 每日结算：安息日准备度自然衰减 + 安息日效果 */
export function processSabbathDaily(state: GameState): string[] {
  const logs: string[] = [];
  const days = daysUntilSabbath(state.date);

  // 每日自然衰减
  if (state.family.resources.ritual.sabbathReadiness > 0) {
    state.family.resources.ritual.sabbathReadiness = Math.max(
      0,
      state.family.resources.ritual.sabbathReadiness - SABBATH_READINESS_DAILY_DECAY,
    );
  }

  // 如果今天是安息日
  if (state.date.isSabbath) {
    const readiness = state.family.resources.ritual.sabbathReadiness;

    if (readiness >= SABBATH_READINESS_ADEQUATE) {
      logs.push('  ✡ 安息日平安 — 家庭预备充分，心灵安宁。');
      // 全家恢复体力
      for (const member of state.family.members) {
        member.stamina = Math.min(member.maxStamina, member.stamina + 15);
      }
      state.family.resources.ritual.synagogueParticipation = Math.min(
        100,
        state.family.resources.ritual.synagogueParticipation + 5,
      );
    } else if (readiness >= SABBATH_READINESS_LOW) {
      logs.push('  ✡ 安息日 — 准备不够充分，略感不安。');
      for (const member of state.family.members) {
        member.stamina = Math.min(member.maxStamina, member.stamina + 8);
      }
    } else {
      logs.push('  ✡ 安息日 — 准备严重不足，心中充满忧虑。');
      state.family.resources.social.familyHonor = Math.max(
        0,
        state.family.resources.social.familyHonor - 3,
      );
      logs.push('    → 家人因为安息日准备不足而颜面无光（家族荣耀 -3）');
    }

    // 安息日重置准备度
    state.family.resources.ritual.sabbathReadiness = 0;
  } else if (days === 1) {
    // 明天是安息日，提醒
    logs.push('  ⚠ 明天是安息日！请做好预备。');
  }

  return logs;
}

// ---- 洁净状态 ----

/** 导致不洁的原因及影响 */
export interface ImpuritySource {
  id: string;
  description: string;
  /** 净化所需天数 */
  purificationDays: number;
}

/** 常见的不洁来源 */
const IMPURITY_SOURCES: Record<string, ImpuritySource> = {
  contact_dead: { id: 'contact_dead', description: '接触了尸体', purificationDays: 7 },
  skin_disease: { id: 'skin_disease', description: '皮肤病症', purificationDays: 14 },
  discharge: { id: 'discharge', description: '漏症', purificationDays: 7 },
  childbirth: { id: 'childbirth', description: '产后不洁', purificationDays: 40 },
  meal_impure: { id: 'meal_impure', description: '吃了不洁净的食物', purificationDays: 1 },
};

/** 施加不洁状态 */
export function applyImpurity(state: GameState, sourceId: string): string[] {
  const logs: string[] = [];
  const source = IMPURITY_SOURCES[sourceId];
  if (!source) return logs;

  const purity = state.family.resources.ritual.purityStatus;
  if (purity.impuritySources.includes(sourceId)) {
    logs.push(`  → 已经处于「${source.description}」的不洁状态中。`);
    return logs;
  }

  purity.isPure = false;
  purity.impuritySources.push(sourceId);

  // 计算净化截止日期
  let deadline = state.date;
  for (let i = 0; i < source.purificationDays; i++) {
    deadline = advanceToNextDay(deadline);
  }
  purity.purificationDeadline = deadline;

  logs.push(`  → 不洁：${source.description}（需 ${source.purificationDays} 天净化，截止 ${formatDate(deadline)}）`);

  // 不洁状态影响社会资源
  state.family.resources.social.familyHonor = Math.max(
    0,
    state.family.resources.social.familyHonor - 2,
  );

  return logs;
}

/** 检查并清除已过期的净化状态 */
export function checkPurification(state: GameState): string[] {
  const logs: string[] = [];
  const purity = state.family.resources.ritual.purityStatus;

  if (purity.isPure) return logs;
  if (!purity.purificationDeadline) return logs;

  const currentDays = totalDaysElapsed(state.date);
  const deadlineDays = totalDaysElapsed(purity.purificationDeadline);

  if (currentDays >= deadlineDays) {
    const sources = purity.impuritySources.join('、');
    purity.isPure = true;
    purity.impuritySources = [];
    purity.purificationDeadline = undefined;
    logs.push(`  → 净化完成：${sources}的不洁已消除。`);
  }

  return logs;
}

/** 获取洁净状态摘要 */
export function getPuritySummary(state: GameState): string {
  const purity = state.family.resources.ritual.purityStatus;
  if (purity.isPure) return '洁净';

  const sources = purity.impuritySources
    .map(id => IMPURITY_SOURCES[id]?.description ?? id)
    .join('、');

  let summary = `不洁（${sources}）`;
  if (purity.purificationDeadline) {
    summary += ` — 净化截止：${formatDate(purity.purificationDeadline)}`;
  }
  return summary;
}

/** 获取安息日状态摘要（供 status 命令使用） */
export function getSabbathSummary(state: GameState): string[] {
  const lines: string[] = [];
  const readiness = state.family.resources.ritual.sabbathReadiness;
  const days = daysUntilSabbath(state.date);

  lines.push(`  安息日准备度：${readiness}/100 [${getSabbathReadinessLabel(readiness)}]`);
  if (state.date.isSabbath) {
    lines.push('  今天是安息日！');
  } else {
    lines.push(`  距下一个安息日：${days} 天`);
  }
  lines.push(`  洁净状态：${getPuritySummary(state)}`);

  return lines;
}
