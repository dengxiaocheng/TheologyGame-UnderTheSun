// src/engine/actionRegistry.ts — 行动注册表

import type { FamilyMember } from '../models/family.js';
import type { FamilyResources } from '../models/resources.js';
import { TimeOfDay } from '../models/time.js';
import { ActionType, ActionDefinition, createAllActions } from './actions.js';

/** 行动可用性判断上下文 */
export interface ActionContext {
  timeOfDay: TimeOfDay;
  isSabbath: boolean;
  member: FamilyMember;
  familyResources: FamilyResources;
}

export class ActionRegistry {
  private actions: Map<ActionType, ActionDefinition>;

  constructor() {
    this.actions = createAllActions();
  }

  getAction(type: ActionType): ActionDefinition | undefined {
    return this.actions.get(type);
  }

  getAllActions(): ActionDefinition[] {
    return [...this.actions.values()];
  }

  /** 根据当前时段、安息日、成员技能和年龄过滤可用行动 */
  getAvailableActions(context: ActionContext): ActionType[] {
    const result: ActionType[] = [];

    for (const [type, def] of this.actions) {
      // 时段检查
      if (!def.allowedTimeSlots.includes(context.timeOfDay)) continue;

      // 安息日检查
      if (context.isSabbath && def.forbiddenOnSabbath) continue;

      // 年龄检查
      if (def.minAge !== undefined && context.member.age < def.minAge) continue;

      // 体力检查（staminaCost 为负时，需要足够体力）
      if (def.staminaCost < 0 && context.member.stamina + def.staminaCost < 0) continue;

      // 技能检查
      if (def.requiredSkills) {
        let hasSkills = true;
        for (const [skill, minLevel] of def.requiredSkills) {
          const level = context.member.skills.get(skill) ?? 0;
          if (level < minLevel) {
            hasSkills = false;
            break;
          }
        }
        if (!hasSkills) continue;
      }

      result.push(type);
    }

    return result;
  }
}
