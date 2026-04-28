// src/engine/gameLoop.ts — 游戏循环引擎

import type { GameState } from '../models/gameState.js';
import { TimeOfDay, type GameDate, advanceTimeSlot, advanceToNextDay, formatDate, totalDaysElapsed } from '../models/time.js';
import { ActionType, type ResourceEffect } from './actions.js';
import { ActionRegistry, type ActionContext } from './actionRegistry.js';
import { ScheduleEngine, type DaySchedule, type ScheduleResult } from './schedule.js';
import { calculateDailyActionPoints } from './actionPoints.js';
import { WEATHER_NAMES } from './weather.js';
import { getLocation } from '../data/locations.js';
import { ToolDegradationEngine } from './toolDegradation.js';
import { NPCAttitudeEngine } from './npcAttitude.js';

/** 安息日允许的行动 */
const SABBATH_ALLOWED_ACTIONS: ActionType[] = [
  ActionType.SYNAGOGUE,
  ActionType.REST,
  ActionType.STUDY,
  ActionType.SOCIAL_VISIT,
  ActionType.CARE_SICK,
  ActionType.PRAYER,
  ActionType.FAMILY_MEAL,
];

export class GameEngine {
  readonly state: GameState;
  private schedule: DaySchedule | null = null;
  private readonly actionRegistry = new ActionRegistry();
  private readonly scheduleEngine = new ScheduleEngine();
  private readonly toolEngine = new ToolDegradationEngine();
  private readonly attitudeEngine = new NPCAttitudeEngine();

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  /** 推进一个时段 */
  advanceTimeSlot(): string[] {
    const logs: string[] = [];
    const oldDay = this.state.date.day;
    const oldMonth = this.state.date.month;
    const oldYear = this.state.date.year;
    const oldTime = this.state.date.timeOfDay;

    this.state.date = advanceTimeSlot(this.state.date);

    const crossedMidnight = (
      this.state.date.day !== oldDay ||
      this.state.date.month !== oldMonth ||
      this.state.date.year !== oldYear
    );

    if (crossedMidnight) {
      // 傍晚结束 → 次日黎明，触发每日结算
      this.schedule = null; // 清除旧日程
      logs.push(...this.processDailySettlement());
      logs.push(`新的一天：${formatDate(this.state.date)}`);
    } else {
      logs.push(`时段变化：${formatDate(this.state.date)}`);
    }

    // 傍晚（EVENING）处理疲劳
    if (oldTime === TimeOfDay.AFTERNOON) {
      for (const member of this.state.family.members) {
        if (member.age >= 13) {
          member.stamina = Math.max(0, member.stamina - 10);
        }
      }
    }

    return logs;
  }

  /** 推进到次日黎明 */
  advanceDay(): string[] {
    const logs: string[] = [];

    this.schedule = null; // 清除旧日程
    this.state.date = advanceToNextDay(this.state.date);
    logs.push(`新的一天：${formatDate(this.state.date)}`);
    logs.push(...this.processDailySettlement());

    return logs;
  }

  /** 每日结算（食物消耗 + 体力恢复 + 安息日/洁净检查） */
  private processDailySettlement(): string[] {
    const logs: string[] = [];

    // 每日食物消耗：成人数 × 1 + 儿童数(≤12) × 0.5
    const adults = this.state.family.members.filter(m => m.age > 12).length;
    const children = this.state.family.members.filter(m => m.age <= 12).length;
    const consumption = adults * 1 + children * 0.5;

    this.state.family.resources.survival.grain -= consumption;
    logs.push(`食物消耗：${consumption} 份（${adults} 成人 + ${children} 儿童）`);

    if (this.state.family.resources.survival.grain < 0) {
      logs.push('⚠ 警告：粮食已耗尽！');
    }

    // 疲劳恢复（睡眠恢复 40 点 stamina）
    for (const member of this.state.family.members) {
      const restored = Math.min(40, member.maxStamina - member.stamina);
      member.stamina += restored;
    }
    logs.push('全家经过一夜休息，体力已恢复。');

    // 安息日准备度衰减
    this.state.family.resources.ritual.sabbathReadiness = Math.max(
      0,
      this.state.family.resources.ritual.sabbathReadiness - 5,
    );

    // 安息日提醒
    if (this.state.date.isSabbath) {
      logs.push('今天是安息日，应当休息。');
      // 安息日未达到准备度的警告
      if (this.state.family.resources.ritual.sabbathReadiness < 30) {
        logs.push('⚠ 安息日准备不足，家人感到不安。');
      }
    }

    // 安息日前一天（第6天 = 安息日前夕）提醒
    const days = totalDaysElapsed(this.state.date);
    if (days % 7 === 6) {
      logs.push('明天是安息日！请做好准备。');
      // 安息日前夜准备度检查
      if (this.state.family.resources.ritual.sabbathReadiness < 50) {
        logs.push('⚠ 安息日准备度偏低，考虑安排祷告、家庭饭食等提升。');
      }
    }

    // 洁净状态检查
    this.updatePurityStatus(logs);

    // 工具每日自然损耗
    this.toolEngine.processDailyDegradation(this.state);

    // NPC态度自然漂移
    this.attitudeEngine.processDailyDrift(this.state);

    return logs;
  }

  /** 更新洁净状态 */
  private updatePurityStatus(logs: string[]): void {
    const purity = this.state.family.resources.ritual.purityStatus;

    // 如果有不洁来源，检查是否过了洁净期限
    if (!purity.isPure && purity.purificationDeadline) {
      const currentDays = totalDaysElapsed(this.state.date);
      const deadlineDays = totalDaysElapsed(purity.purificationDeadline);
      if (currentDays >= deadlineDays) {
        purity.isPure = true;
        purity.impuritySources = [];
        purity.purificationDeadline = undefined;
        logs.push('洁净了！不洁期已过，可以参与会堂活动。');
      }
    }
  }

  /** 检查某个行动是否在安息日被允许 */
  isActionAllowedOnSabbath(actionType: ActionType): boolean {
    return SABBATH_ALLOWED_ACTIONS.includes(actionType);
  }

  /** 开始新一天：创建日程，返回行动点预算和可用行动信息 */
  startNewDay(): string[] {
    const logs: string[] = [];

    // 已有日程则不重复创建
    if (this.schedule) {
      return logs;
    }

    this.schedule = this.scheduleEngine.createSchedule(this.state);

    const ap = calculateDailyActionPoints(this.state.family, this.state.date.month);
    logs.push(`今日行动点预算：${ap} 点`);

    return logs;
  }

  /** 给成员分配行动 */
  assignAction(
    memberId: string,
    actionType: ActionType,
    timeSlot: TimeOfDay,
  ): { success: boolean; reason?: string } {
    if (!this.schedule) {
      return { success: false, reason: '还没有创建今日日程，请先使用「plan」开始新一天' };
    }
    return this.scheduleEngine.assignAction(
      this.schedule, memberId, actionType, timeSlot,
      this.actionRegistry, this.state,
    );
  }

  /** 推进一个时段（先执行已安排的行动） */
  advanceTimeSlotWithSchedule(): string[] {
    const logs: string[] = [];

    // 先执行当前时段的已安排行动
    if (this.schedule) {
      const result: ScheduleResult = this.scheduleEngine.executeTimeSlot(
        this.state.date.timeOfDay, this.schedule, this.state, this.actionRegistry,
      );
      if (result.logs.length > 0) {
        logs.push('── 本时段行动 ──');
        for (const log of result.logs) {
          logs.push(log);
        }
      }
      if (result.completedActions > 0) {
        logs.push(`完成了 ${result.completedActions} 项行动。`);
      }
      if (result.failedActions > 0) {
        logs.push(`有 ${result.failedActions} 项行动失败。`);
      }
    }

    // 再推进时间
    logs.push(...this.advanceTimeSlot());

    return logs;
  }

  /** 获取某成员在当前时段的可用行动 */
  getAvailableActionsFor(memberId: string): ActionType[] {
    const member = this.state.family.members.find(m => m.id === memberId);
    if (!member) return [];

    const context: ActionContext = {
      timeOfDay: this.state.date.timeOfDay,
      isSabbath: this.state.date.isSabbath,
      member,
      familyResources: this.state.family.resources,
    };
    return this.actionRegistry.getAvailableActions(context);
  }

  /** 获取行动点预算摘要文本 */
  getActionPointSummary(): string {
    const ap = calculateDailyActionPoints(this.state.family, this.state.date.month);
    const lines: string[] = [];
    lines.push(`今日行动点预算：${ap} 点`);
    lines.push(`当前时段：${this.formatTimeOfDay(this.state.date.timeOfDay)}`);
    return lines.join('\n');
  }

  /** 获取当前日程摘要 */
  getScheduleSummary(): string {
    if (!this.schedule) {
      return '今日尚未安排日程。使用「plan」开始。';
    }

    const lines: string[] = [];
    lines.push('── 今日日程 ──');

    const timeSlots = [TimeOfDay.DAWN, TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON, TimeOfDay.EVENING];
    const slotNames: Record<TimeOfDay, string> = {
      [TimeOfDay.DAWN]: '黎明',
      [TimeOfDay.MORNING]: '上午',
      [TimeOfDay.MIDDAY]: '正午',
      [TimeOfDay.AFTERNOON]: '下午',
      [TimeOfDay.EVENING]: '傍晚',
    };

    for (const slot of timeSlots) {
      const slotActions: string[] = [];
      for (const [memberId, ms] of this.schedule.assignments) {
        const action = ms.actions.find(a => a.timeSlot === slot);
        if (action) {
          const member = this.state.family.members.find(m => m.id === memberId);
          const def = this.actionRegistry.getAction(action.actionType);
          slotActions.push(`  ${member?.name ?? memberId}: ${def?.name ?? action.actionType}`);
        }
      }
      const marker = this.state.date.timeOfDay === slot ? ' ◄ 当前' : '';
      if (slotActions.length > 0) {
        lines.push(`${slotNames[slot]}${marker}：`);
        for (const a of slotActions) lines.push(a);
      } else {
        lines.push(`${slotNames[slot]}${marker}：（无安排）`);
      }
    }

    return lines.join('\n');
  }

  /** 获取所有成员及其可用行动 */
  getPlanOverview(): string {
    const lines: string[] = [];
    const ap = calculateDailyActionPoints(this.state.family, this.state.date.month);
    lines.push(`═══════════════════════════════════`);
    lines.push(`行动点预算：${ap} 点`);
    lines.push(`───────────────────────────────────`);

    for (const member of this.state.family.members) {
      const context: ActionContext = {
        timeOfDay: this.state.date.timeOfDay,
        isSabbath: this.state.date.isSabbath,
        member,
        familyResources: this.state.family.resources,
      };
      const available = this.actionRegistry.getAvailableActions(context);
      const staminaBar = this.renderBar(member.stamina, member.maxStamina, 8);
      lines.push(`${member.name}（${member.age}岁）体力: ${staminaBar} ${member.stamina}/${member.maxStamina}`);

      if (available.length === 0) {
        lines.push('  暂无可用行动');
      } else {
        const names = available.map(at => {
          const def = this.actionRegistry.getAction(at);
          return `${def?.name}(${at})`;
        });
        lines.push(`  可用：${names.join('、')}`);
      }
    }

    lines.push(`═══════════════════════════════════`);
    return lines.join('\n');
  }

  private formatTimeOfDay(tod: TimeOfDay): string {
    const names: Record<TimeOfDay, string> = {
      [TimeOfDay.DAWN]: '黎明',
      [TimeOfDay.MORNING]: '上午',
      [TimeOfDay.MIDDAY]: '正午',
      [TimeOfDay.AFTERNOON]: '下午',
      [TimeOfDay.EVENING]: '傍晚',
    };
    return names[tod];
  }

  /** 生成家庭状态摘要 */
  getStatusSummary(): string {
    const lines: string[] = [];
    const { date, family } = this.state;

    lines.push('═══════════════════════════════════');
    lines.push(`日期：${formatDate(date)}`);
    lines.push(`家庭：${family.name}`);

    // 天气
    if (this.state.weather) {
      const w = this.state.weather;
      lines.push(`天气：${WEATHER_NAMES[w.current]}，${w.temperature}°C，风力 ${w.windStrength}/100`);
    }

    // 位置
    const loc = getLocation(this.state.currentLocation.currentLocationId);
    if (loc) {
      lines.push(`位置：${loc.name}`);
    }

    lines.push('───────────────────────────────────');
    lines.push('家庭成员：');

    for (const m of family.members) {
      const staminaBar = this.renderBar(m.stamina, m.maxStamina, 10);
      lines.push(
        `  ${m.name}（${m.age}岁）` +
        `体力: ${staminaBar} ${m.stamina}/${m.maxStamina} ` +
        `健康: ${m.health}`
      );
    }

    lines.push('───────────────────────────────────');
    lines.push('资源：');
    const s = family.resources.survival;
    lines.push(`  谷物: ${s.grain.toFixed(1)} 份`);
    lines.push(`  清水: ${s.water}  油: ${s.oil}  鱼: ${s.fish}`);
    lines.push(`  柴火: ${s.firewood}  盐: ${s.salt}`);
    lines.push(`  衣物: ${s.clothing} 套  住所耐久: ${s.shelterDurability}%`);

    const e = family.resources.economic;
    const denarii = e.silverCoins + e.copperCoins / 128;
    lines.push(`  资金: ${e.silverCoins} 银币 + ${e.copperCoins} 铜币（≈ ${denarii.toFixed(1)} 第纳流斯）`);

    // 社交/礼仪指标
    const soc = family.resources.social;
    const rit = family.resources.ritual;
    lines.push(`  邻里信任: ${soc.neighborTrust}  家族荣耀: ${soc.familyHonor}  长辈认可: ${soc.elderApproval}`);
    const sabbathBar = this.renderBar(rit.sabbathReadiness, 100, 10);
    lines.push(`  安息日准备: ${sabbathBar} ${rit.sabbathReadiness}/100`);
    lines.push(`  洁净状态: ${rit.purityStatus.isPure ? '洁净' : '不洁' + (rit.purityStatus.impuritySources.length > 0 ? ` (${rit.purityStatus.impuritySources.join(', ')})` : '')}`);
    lines.push(`  施舍声誉: ${rit.charityReputation}  会堂参与: ${rit.synagogueParticipation}`);

    if (family.debts.length > 0) {
      lines.push('───────────────────────────────────');
      lines.push('债务：');
      for (const d of family.debts) {
        if (d.status === 'active') {
          lines.push(`  欠 ${d.creditorId}: ${d.amount} 第纳流斯（抵押: ${d.collateral ?? '无'}）`);
        }
      }
    }

    lines.push('═══════════════════════════════════');
    return lines.join('\n');
  }

  private renderBar(current: number, max: number, width: number): string {
    const filled = Math.round((current / max) * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
  }

  /** 移动到相邻地点 */
  moveToLocation(targetId: string): { success: boolean; message: string } {
    const currentLoc = getLocation(this.state.currentLocation.currentLocationId);
    if (!currentLoc) {
      return { success: false, message: '当前位置信息异常。' };
    }
    if (!currentLoc.connections.includes(targetId)) {
      return { success: false, message: `无法从 ${currentLoc.name} 前往 ${targetId}，两地不相邻。` };
    }
    const targetLoc = getLocation(targetId);
    if (!targetLoc) {
      return { success: false, message: `地点 ${targetId} 不存在。` };
    }
    this.state.currentLocation.currentLocationId = targetId;
    this.state.currentLocation.currentMapId = targetLoc.mapId;
    this.state.currentLocation.travelProgress = 0;
    this.state.currentLocationId = targetId;
    return { success: true, message: `已移动到：${targetLoc.name}` };
  }

  /** 获取当前位置信息 */
  getLocationInfo(): string {
    const loc = getLocation(this.state.currentLocation.currentLocationId);
    if (!loc) return '当前位置信息异常。';
    const lines: string[] = [];
    lines.push(`── 当前地点 ──`);
    lines.push(`  ${loc.name}（${loc.id}）`);
    lines.push(`  ${loc.description}`);
    lines.push(`  区域：${loc.mapId}`);
    lines.push(`  相邻：${loc.connections.join('、')}`);
    lines.push(`  市场：${loc.marketAvailable ? '有' : '无'}  关卡：${loc.taxCheckpoint ? '是' : '否'}`);
    lines.push(`  危险等级：${loc.dangerLevel}/100`);
    return lines.join('\n');
  }
}
