// src/engine/schedule.ts — 日程分配与执行系统

import type { GameState } from '../models/gameState.js';
import type { FamilyResources } from '../models/resources.js';
import { TimeOfDay, type GameDate } from '../models/time.js';
import { ActionType, type ActionDefinition, type ResourceEffect } from './actions.js';
import { ActionRegistry, type ActionContext } from './actionRegistry.js';
import { getWeatherModifiers, Weather } from './weather.js';

/** 单条已安排的行动 */
export interface ScheduledAction {
  actionType: ActionType;
  timeSlot: TimeOfDay;
  assignedMember: string;
}

/** 某成员的日程 */
export interface MemberSchedule {
  memberId: string;
  actions: ScheduledAction[];
}

/** 一天的日程 */
export interface DaySchedule {
  date: GameDate;
  assignments: Map<string, MemberSchedule>;
}

/** 日程执行结果 */
export interface ScheduleResult {
  logs: string[];
  resourceChanges: ResourceEffect[];
  fatigueChanges: Map<string, number>;
  completedActions: number;
  failedActions: number;
}

export class ScheduleEngine {
  /** 创建空白日程 */
  createSchedule(state: GameState): DaySchedule {
    const assignments = new Map<string, MemberSchedule>();
    for (const m of state.family.members) {
      assignments.set(m.id, { memberId: m.id, actions: [] });
    }
    return { date: state.date, assignments };
  }

  /** 分配行动（验证 + 添加） */
  assignAction(
    schedule: DaySchedule,
    memberId: string,
    actionType: ActionType,
    timeSlot: TimeOfDay,
    registry: ActionRegistry,
    state: GameState,
  ): { success: boolean; reason?: string } {
    const member = state.family.members.find(m => m.id === memberId);
    if (!member) return { success: false, reason: '找不到该成员' };

    const def = registry.getAction(actionType);
    if (!def) return { success: false, reason: '未知行动类型' };

    // 时段检查
    if (!def.allowedTimeSlots.includes(timeSlot)) {
      return { success: false, reason: `${def.name}不能在此时段执行` };
    }

    // 安息日检查
    if (state.date.isSabbath && def.forbiddenOnSabbath) {
      return { success: false, reason: `安息日不能执行${def.name}` };
    }

    // 体力检查
    if (def.staminaCost < 0 && member.stamina + def.staminaCost < 0) {
      return { success: false, reason: `${member.name}体力不足（需要 ${-def.staminaCost}，当前 ${member.stamina}）` };
    }

    // 年龄检查
    if (def.minAge !== undefined && member.age < def.minAge) {
      return { success: false, reason: `${member.name}年龄不足（需要 ${def.minAge} 岁）` };
    }

    // 技能检查
    if (def.requiredSkills) {
      for (const [skill, minLevel] of def.requiredSkills) {
        const level = member.skills.get(skill) ?? 0;
        if (level < minLevel) {
          return { success: false, reason: `${member.name}缺少技能「${skill}」（需要 ${minLevel}，当前 ${level}）` };
        }
      }
    }

    // 检查该成员在该时段是否已有行动
    const ms = schedule.assignments.get(memberId);
    if (ms) {
      const conflict = ms.actions.find(a => a.timeSlot === timeSlot);
      if (conflict) {
        const conflictDef = registry.getAction(conflict.actionType);
        return { success: false, reason: `${member.name}在此时段已有安排「${conflictDef?.name ?? conflict.actionType}」` };
      }
    }

    // 添加行动
    if (!schedule.assignments.has(memberId)) {
      schedule.assignments.set(memberId, { memberId, actions: [] });
    }
    schedule.assignments.get(memberId)!.actions.push({
      actionType,
      timeSlot,
      assignedMember: memberId,
    });

    return { success: true };
  }

  /** 执行某一时段的所有已分配行动 */
  executeTimeSlot(
    timeSlot: TimeOfDay,
    schedule: DaySchedule,
    state: GameState,
    registry: ActionRegistry,
  ): ScheduleResult {
    const result: ScheduleResult = {
      logs: [],
      resourceChanges: [],
      fatigueChanges: new Map(),
      completedActions: 0,
      failedActions: 0,
    };

    for (const [memberId, ms] of schedule.assignments) {
      const actions = ms.actions.filter(a => a.timeSlot === timeSlot);
      for (const sa of actions) {
        const member = state.family.members.find(m => m.id === memberId);
        if (!member) continue;

        const def = registry.getAction(sa.actionType);
        if (!def) continue;

        // 再次验证（状态可能已变）
        if (def.staminaCost < 0 && member.stamina + def.staminaCost < 0) {
          result.logs.push(`  ✗ ${member.name}的「${def.name}」因体力不足而取消`);
          result.failedActions++;
          continue;
        }

        // 应用体力变化
        member.stamina = Math.max(0, Math.min(member.maxStamina, member.stamina + def.staminaCost));
        result.fatigueChanges.set(memberId, def.staminaCost);

        // 应用资源效果（含天气修正）
        const effects = this.resolveEffects(def, member, state.family.resources, state.weather?.current);
        for (const eff of effects) {
          this.applyEffect(eff, state.family.resources);
          result.resourceChanges.push(eff);
        }

        // 天气影响提示
        let weatherNote = '';
        if (state.weather) {
          const mods = getWeatherModifiers(state.weather.current);
          if (def.type === ActionType.FISH && mods.fishing !== 0) {
            weatherNote = ` [天气影响: ${mods.fishing > 0 ? '+' : ''}${Math.round(mods.fishing * 100)}%]`;
          } else if (def.type === ActionType.HERD_SHEEP && mods.outdoorLabor !== 0) {
            weatherNote = ` [天气影响: ${mods.outdoorLabor > 0 ? '+' : ''}${Math.round(mods.outdoorLabor * 100)}%]`;
          } else if (def.type === ActionType.SHORT_LABOR && mods.outdoorLabor !== 0) {
            weatherNote = ` [天气影响: ${mods.outdoorLabor > 0 ? '+' : ''}${Math.round(mods.outdoorLabor * 100)}%]`;
          }
        }

        result.completedActions++;
        result.logs.push(`  ✓ ${member.name}执行了「${def.name}」（体力 ${def.staminaCost >= 0 ? '+' : ''}${def.staminaCost}）${weatherNote}`);
      }
    }

    return result;
  }

  /** 解析行动效果（处理随机因素和天气修正） */
  private resolveEffects(
    def: ActionDefinition,
    member: { skills: Map<string, number> },
    resources: FamilyResources,
    weather?: Weather,
  ): ResourceEffect[] {
    const effects: ResourceEffect[] = [];
    const weatherMod = weather ? getWeatherModifiers(weather) : null;

    // 消耗效果直接使用
    if (def.consumes) {
      effects.push(...def.consumes);
    }

    // 产出效果（处理随机因素 + 天气修正）
    if (def.produces) {
      for (const prod of def.produces) {
        let amount = prod.delta;
        if (def.type === ActionType.FISH && prod.field === 'fish') {
          // 捕鱼量：2 + random(0, skill/20)
          const skill = member.skills.get('捕鱼') ?? 0;
          amount = 2 + Math.floor(Math.random() * (skill / 20 + 1));
          // 天气修正
          if (weatherMod) {
            amount = Math.max(0, Math.round(amount * (1 + weatherMod.fishing)));
          }
        } else if ((def.type === ActionType.HERD_SHEEP || def.type === ActionType.SHORT_LABOR) && weatherMod) {
          // 户外劳动天气修正
          amount = Math.max(0, Math.round(amount * (1 + weatherMod.outdoorLabor)));
        }
        effects.push({ ...prod, delta: amount });
      }
    }

    // 补网修复工具耐久
    if (def.type === ActionType.REPAIR_NET) {
      const net = resources.economic.tools.find(t => t.type === 'fishing' && t.durability < t.maxDurability);
      if (net) {
        // 用一个 resource effect 代表，但实际在 applyEffect 里处理工具特殊逻辑
        effects.push({ layer: 'economic', field: 'tool_repair', delta: 20 });
      }
    }

    // 学习需要读写检查
    if (def.type === ActionType.STUDY) {
      // 读写 > 10 才产生效果（已在 registry 过滤，这里直接产出）
    }

    return effects;
  }

  /** 应用单个资源效果到家庭资源 */
  private applyEffect(effect: ResourceEffect, resources: FamilyResources): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layer = resources[effect.layer] as any;
    const value = layer[effect.field];

    // 工具修复特殊处理
    if (effect.layer === 'economic' && effect.field === 'tool_repair') {
      const net = resources.economic.tools.find(
        t => t.type === 'fishing' && t.durability < t.maxDurability
      );
      if (net) {
        net.durability = Math.min(net.maxDurability, net.durability + effect.delta);
      }
      return;
    }

    if (typeof value === 'number') {
      (layer as Record<string, number>)[effect.field] = value + effect.delta;
    }
    // Map 类型（如 creditorPatience）暂不处理通用 delta
  }
}
