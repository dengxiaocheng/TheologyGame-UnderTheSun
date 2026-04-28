// src/engine/dialogue.ts — 对话框架

import type { GameState } from '../models/gameState.js';
import type { NPCAttitude } from '../models/npc.js';
import { NPCAttitudeEngine } from './npcAttitude.js';

/** 对话行 */
export interface DialogueLine {
  speaker: 'player' | 'npc';
  text: string;
}

/** 对话回复选项 */
export interface DialogueResponse {
  id: string;
  text: string;
  /** 选择后的态度变化 */
  attitudeEffect?: {
    trust?: number;
    respect?: number;
    closeness?: number;
    fear?: number;
    resentment?: number;
  };
  /** 选择后的资源效果 */
  resourceEffect?: {
    layer: 'survival' | 'economic' | 'social' | 'ritual';
    field: string;
    delta: number;
  }[];
  /** 后续对话（如果选择此回复） */
  followUp?: DialogueLine[];
}

/** 对话定义 */
export interface DialogueDefinition {
  id: string;
  npcId: string;
  /** 触发条件 */
  condition?: (state: GameState) => boolean;
  /** 开场对话行 */
  lines: DialogueLine[];
  /** 可选回复 */
  responses: DialogueResponse[];
  /** 优先级（越高越优先触发） */
  priority?: number;
}

export class DialogueEngine {
  private dialogues: Map<string, DialogueDefinition[]> = new Map();
  private activeDialogue: { def: DialogueDefinition; chosenResponse?: string } | null = null;
  private readonly attitudeEngine = new NPCAttitudeEngine();

  /** 注册对话 */
  registerDialogue(dialogue: DialogueDefinition): void {
    const list = this.dialogues.get(dialogue.npcId) ?? [];
    list.push(dialogue);
    this.dialogues.set(dialogue.npcId, list);
  }

  /** 批量注册 */
  registerDialogues(dialogues: DialogueDefinition[]): void {
    for (const d of dialogues) {
      this.registerDialogue(d);
    }
  }

  /** 获取与某NPC可用的对话 */
  getAvailableDialogue(npcId: string, state: GameState): DialogueDefinition | null {
    const list = this.dialogues.get(npcId);
    if (!list || list.length === 0) return null;

    // 过滤满足条件的对话
    const available = list.filter(d => !d.condition || d.condition(state));
    if (available.length === 0) return null;

    // 按优先级排序，取最高的
    available.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return available[0];
  }

  /** 开始对话 */
  startDialogue(npcId: string, state: GameState): { lines: DialogueLine[]; responses: DialogueResponse[] } | null {
    const def = this.getAvailableDialogue(npcId, state);
    if (!def) return null;

    this.activeDialogue = { def };
    return {
      lines: def.lines,
      responses: def.responses,
    };
  }

  /** 选择回复 */
  selectResponse(responseId: string, state: GameState): {
    followUp?: DialogueLine[];
    appliedEffects: string[];
  } {
    const applied: string[] = [];

    if (!this.activeDialogue) {
      return { appliedEffects: ['没有进行中的对话'] };
    }

    const response = this.activeDialogue.def.responses.find(r => r.id === responseId);
    if (!response) {
      return { appliedEffects: ['无效的回复选项'] };
    }

    this.activeDialogue.chosenResponse = responseId;
    const npcId = this.activeDialogue.def.npcId;

    // 应用态度效果
    if (response.attitudeEffect) {
      const attitude = state.attitudes.get(npcId);
      if (attitude) {
        const updated: NPCAttitude = {
          trust: clamp(attitude.trust + (response.attitudeEffect.trust ?? 0), 0, 100),
          respect: clamp(attitude.respect + (response.attitudeEffect.respect ?? 0), 0, 100),
          closeness: clamp(attitude.closeness + (response.attitudeEffect.closeness ?? 0), 0, 100),
          fear: clamp(attitude.fear + (response.attitudeEffect.fear ?? 0), 0, 100),
          resentment: clamp(attitude.resentment + (response.attitudeEffect.resentment ?? 0), 0, 100),
        };
        state.attitudes.set(npcId, updated);
        applied.push(`态度变化：信任${response.attitudeEffect.trust ?? 0} 尊敬${response.attitudeEffect.respect ?? 0} 亲近${response.attitudeEffect.closeness ?? 0}`);
      }
    }

    // 应用资源效果
    if (response.resourceEffect) {
      for (const eff of response.resourceEffect) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer = state.family.resources[eff.layer] as any;
        if (typeof layer[eff.field] === 'number') {
          layer[eff.field] += eff.delta;
          applied.push(`${eff.layer}.${eff.field}: ${eff.delta > 0 ? '+' : ''}${eff.delta}`);
        }
      }
    }

    return {
      followUp: response.followUp,
      appliedEffects: applied,
    };
  }

  /** 结束当前对话 */
  endDialogue(): void {
    this.activeDialogue = null;
  }

  /** 是否有进行中的对话 */
  hasActiveDialogue(): boolean {
    return this.activeDialogue !== null;
  }

  /** 渲染对话为可显示文本 */
  renderDialogue(lines: DialogueLine[]): string {
    return lines.map(l => l.speaker === 'player' ? `你：${l.text}` : `  ${l.text}`).join('\n');
  }

  /** 渲染回复选项 */
  renderResponses(responses: DialogueResponse[]): string {
    return responses.map((r, i) => `  ${i + 1}. ${r.text}`).join('\n');
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
