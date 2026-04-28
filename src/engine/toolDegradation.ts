// src/engine/toolDegradation.ts — 工具损耗引擎

import type { GameState } from '../models/gameState.js';
import type { ToolRecord } from '../models/resources.js';
import type { ActionType } from './actions.js';

/** 工具使用与耐久消耗的关系 */
const TOOL_DEGRADATION_MAP: Record<string, number> = {
  fishing: 8,     // 捕鱼每次损耗 8 耐久
  farming: 6,     // 农具
  masonry: 5,     // 石工工具
  carpentry: 5,   // 木工工具
  pottery: 4,     // 陶器工具
  weaving: 3,     // 纺织工具
  trade: 1,       // 贸易工具几乎不损耗
  transport: 7,   // 运输工具
  scholar: 1,     // 书写工具极低损耗
  ritual: 2,      // 礼仪工具
};

/** 行动与工具类型映射 */
const ACTION_TOOL_MAP: Record<string, string[]> = {
  FISH: ['fishing'],
  REPAIR_NET: ['fishing'],
  PLANT_CROP: ['farming'],
  HARVEST: ['farming'],
  PRESS_OLIVES: ['farming'],
  PRUNE_VINE: ['farming'],
  TEND_OLIVE: ['farming'],
  CARPENTRY: ['carpentry'],
  STONECRAFT: ['masonry'],
  POTTERY: ['pottery'],
  WEAVE: ['weaving'],
  SPIN_THREAD: ['weaving'],
  SCRIBE_WORK: ['scholar'],
  WINE_MAKING: ['farming'],
  DELIVER_GOODS: ['transport'],
};

export class ToolDegradationEngine {
  /** 执行行动后检查并损耗工具 */
  processActionToolUse(state: GameState, actionType: ActionType): string[] {
    const logs: string[] = [];
    const toolTypes = ACTION_TOOL_MAP[actionType];
    if (!toolTypes) return logs;

    for (const toolType of toolTypes) {
      const tools = state.family.resources.economic.tools.filter(t => t.type === toolType);
      if (tools.length === 0) continue;

      const degradation = TOOL_DEGRADATION_MAP[toolType] ?? 3;
      // 使用耐久最低的工具（最可能先坏的）
      const tool = tools.reduce((a, b) => a.durability < b.durability ? a : b);

      tool.durability -= degradation;

      if (tool.durability <= 0) {
        tool.durability = 0;
        logs.push(`⚠ ${tool.name}已完全损坏，无法继续使用！`);
      } else if (tool.durability <= 20) {
        logs.push(`⚠ ${tool.name}即将损坏（耐久：${tool.durability}/${tool.maxDurability}）`);
      }
    }

    return logs;
  }

  /** 每日自然损耗（存放损耗） */
  processDailyDegradation(state: GameState): string[] {
    const logs: string[] = [];

    for (const tool of state.family.resources.economic.tools) {
      if (tool.durability <= 0) continue;
      // 每日自然损耗 1 点
      tool.durability = Math.max(0, tool.durability - 1);
    }

    return logs;
  }

  /** 修理工具 */
  repairTool(state: GameState, toolId: string, amount: number): { success: boolean; message: string } {
    const tool = state.family.resources.economic.tools.find(t => t.id === toolId);
    if (!tool) return { success: false, message: '找不到该工具' };
    if (tool.durability >= tool.maxDurability) return { success: false, message: `${tool.name}不需要修理` };

    const repaired = Math.min(amount, tool.maxDurability - tool.durability);
    tool.durability += repaired;
    return { success: true, message: `${tool.name}修好了（+${repaired}耐久，当前${tool.durability}/${tool.maxDurability}）` };
  }

  /** 获取工具状态摘要 */
  getToolSummary(state: GameState): string {
    const tools = state.family.resources.economic.tools;
    if (tools.length === 0) return '无工具';

    const lines: string[] = ['── 工具状态 ──'];
    for (const t of tools) {
      const pct = Math.round((t.durability / t.maxDurability) * 100);
      const bar = renderBar(pct, 10);
      const status = t.durability <= 0 ? ' ✗ 已损坏' : t.durability <= 20 ? ' ⚠ 即将损坏' : '';
      lines.push(`  ${t.name}：${bar} ${t.durability}/${t.maxDurability}${status}`);
    }
    return lines.join('\n');
  }
}

function renderBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
