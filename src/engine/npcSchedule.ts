// src/engine/npcSchedule.ts — NPC日程系统

import { TimeOfDay } from '../models/time.js';

/** 单条日程 */
export interface NPCScheduleEntry {
  npcId: string;
  timeSlot: TimeOfDay;
  locationId: string;
  activity: string;
}

/** 某NPC某天的日程 */
export interface NPCDailySchedule {
  npcId: string;
  date: number; // 天数
  entries: NPCScheduleEntry[];
}

/** 时段简称映射 */
const SLOT_NAMES: Record<TimeOfDay, string> = {
  [TimeOfDay.DAWN]: '黎明',
  [TimeOfDay.MORNING]: '上午',
  [TimeOfDay.MIDDAY]: '正午',
  [TimeOfDay.AFTERNOON]: '下午',
  [TimeOfDay.EVENING]: '傍晚',
};

/** 安息日允许的地点 */
const SABBATH_LOCATIONS: Record<string, { locationId: string; activity: string }> = {
  'npc-yonah-fisherman':   { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-matthew-tax':       { locationId: 'bs-market',    activity: '安息日在家' },
  'npc-eleazar-scribe':    { locationId: 'bs-synagogue', activity: '安息日教导' },
  'npc-dorian-merchant':   { locationId: 'gl-foreign-camp', activity: '安息日歇业' },
  'npc-lucius-soldier':    { locationId: 'tb-garrison',  activity: '安息日驻守' },
  'npc-miriam-weaver':     { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-hannah-midwife':    { locationId: 'bs-courtyard', activity: '安息日在家' },
  'npc-joachim-steward':   { locationId: 'sp-mansion',   activity: '安息日在宅邸' },
  'npc-silas-olivepress':  { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-martha-baker':      { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-bartimaeus-beggar': { locationId: 'bs-synagogue', activity: '安息日在会堂门口' },
  'npc-esther-potter':     { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-asher-shepherd':    { locationId: 'bs-courtyard', activity: '安息日在家' },
  'npc-aquila-netmaker':   { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-berenice-fishsalter': { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-shimon-kepha':      { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-tamar-traveler':    { locationId: 'jr-inn',       activity: '安息日歇息' },
  'npc-cleopas-merchant':  { locationId: 'jr-inn',       activity: '安息日歇业' },
  'npc-judah-debtor':      { locationId: 'bs-synagogue', activity: '安息日会堂聚会' },
  'npc-ananias-elder':     { locationId: 'bs-synagogue', activity: '安息日主持' },
};

/** 工作日日程模板：npcId -> 每个时段的安排 */
const WEEKDAY_SCHEDULES: Record<string, { timeSlot: TimeOfDay; locationId: string; activity: string }[]> = {
  'npc-yonah-fisherman': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'gl-dock',          activity: '出海捕鱼' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'gl-dock',          activity: '整理渔获' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'gl-drying-racks',  activity: '晒鱼' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-courtyard',     activity: '在家补网休息' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',     activity: '在家与家人共处' },
  ],
  'npc-matthew-tax': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'gl-toll-booth',  activity: '在关税亭收税' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'gl-toll-booth',  activity: '在关税亭收税' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'gl-toll-booth',  activity: '在关税亭清点税款' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',      activity: '在市场巡视' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-market',      activity: '回到住处' },
  ],
  'npc-eleazar-scribe': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-synagogue', activity: '清晨读经' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-synagogue', activity: '教导孩童' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-synagogue', activity: '抄写经卷' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-courtyard', activity: '在家休息' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-synagogue', activity: '晚间聚会' },
  ],
  'npc-dorian-merchant': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'gl-foreign-camp', activity: '清点货物' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'sp-city-market',  activity: '在城市市场交易' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'sp-city-market',  activity: '在市场交易' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'gl-dock',         activity: '在湖边巡视货物' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'gl-foreign-camp', activity: '回到营地' },
  ],
  'npc-lucius-soldier': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'tb-garrison',     activity: '军营晨操' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'jr-mountain-path',activity: '巡逻道路' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'jr-checkpoint',   activity: '关卡检查' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',       activity: '在村里巡逻' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'tb-garrison',     activity: '回到军营' },
  ],
  'npc-miriam-weaver': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-courtyard',    activity: '在家准备' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-weaving-house',activity: '在织布屋织造' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-weaving-house',activity: '在织布屋织造' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',       activity: '在市场卖布' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',    activity: '在家' },
  ],
  'npc-hannah-midwife': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-courtyard', activity: '在家' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-well',      activity: '在村中走访' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-courtyard', activity: '在家休息' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-well',      activity: '在村中走访' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard', activity: '在家' },
  ],
  'npc-joachim-steward': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'sp-mansion',      activity: '在宅邸管理事务' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'sp-city-market',  activity: '在城市市场采购' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'sp-mansion',      activity: '在宅邸处理账目' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',       activity: '在村里收租' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'sp-mansion',      activity: '在宅邸' },
  ],
  'npc-silas-olivepress': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-olive-press', activity: '准备榨油坊' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-olive-press', activity: '榨油' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-olive-press', activity: '榨油' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',      activity: '在市场卖油' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',   activity: '在家' },
  ],
  'npc-martha-baker': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-market',     activity: '清晨烤饼' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-market',     activity: '在市场卖饼' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-market',     activity: '在市场卖饼' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-courtyard',  activity: '在家准备面团' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',  activity: '在家' },
  ],
  'npc-bartimaeus-beggar': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-synagogue',  activity: '在会堂门口求乞' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-market',     activity: '在市场求乞' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-market',     activity: '在市场求乞' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-well',       activity: '在水井旁休息' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-cemetery',   activity: '在墓地旁过夜' },
  ],
  'npc-esther-potter': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-kiln',    activity: '准备陶窑' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-kiln',    activity: '制作陶器' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-kiln',    activity: '烧制陶器' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',  activity: '在市场卖陶器' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-market',  activity: '回家' },
  ],
  'npc-asher-shepherd': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-olive-grove', activity: '赶羊出圈' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-vineyard',    activity: '在山坡放牧' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-vineyard',    activity: '在阴凉处看羊' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-olive-grove', activity: '赶羊回圈' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',   activity: '在家' },
  ],
  'npc-aquila-netmaker': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'gl-netmaker-house', activity: '准备材料' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'gl-netmaker-house', activity: '织造渔网' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'gl-dock',           activity: '在码头送货' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'gl-netmaker-house', activity: '修补渔网' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'gl-netmaker-house', activity: '收工回家' },
  ],
  'npc-berenice-fishsalter': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'gl-drying-racks',  activity: '整理鱼干' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'gl-salt-merchant', activity: '购买腌鱼用盐' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'gl-drying-racks',  activity: '腌制鱼' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',        activity: '在市场卖腌鱼' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',     activity: '在家' },
  ],
  'npc-shimon-kepha': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'gl-dock',       activity: '带领渔船出海' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'gl-dock',       activity: '指挥捕鱼' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-market',     activity: '在市场卖鱼' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-synagogue',  activity: '在会堂' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',  activity: '在家' },
  ],
  'npc-tamar-traveler': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'jr-inn',           activity: '在客栈准备出发' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'jr-mountain-path', activity: '赶路' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'jr-spring',        activity: '在泉水边休息' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'jr-pilgrim-camp',  activity: '在朝圣者营地' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'jr-inn',           activity: '回到客栈' },
  ],
  'npc-cleopas-merchant': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'jr-inn',           activity: '装货准备出发' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'jr-mountain-path', activity: '在路途运输货物' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-market',        activity: '在村里市场交易' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',        activity: '在村里市场交易' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'jr-inn',           activity: '回到客栈' },
  ],
  'npc-judah-debtor': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-threshing-floor', activity: '在谷场劳作' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-olive-grove',     activity: '在田里干活' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-threshing-floor', activity: '碾谷' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-market',          activity: '在市场买粮' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',       activity: '在家' },
  ],
  'npc-ananias-elder': [
    { timeSlot: TimeOfDay.DAWN,      locationId: 'bs-synagogue',  activity: '清晨祷告' },
    { timeSlot: TimeOfDay.MORNING,   locationId: 'bs-elder-seat', activity: '在长老坐席判断事务' },
    { timeSlot: TimeOfDay.MIDDAY,    locationId: 'bs-synagogue',  activity: '在会堂处理事务' },
    { timeSlot: TimeOfDay.AFTERNOON, locationId: 'bs-elder-seat', activity: '在长老坐席议事' },
    { timeSlot: TimeOfDay.EVENING,   locationId: 'bs-courtyard',  activity: '在家' },
  ],
};

/** 生成所有具名NPC的日程 */
export function getNPCSchedules(dayOffset: number, isSabbath: boolean): Map<string, NPCDailySchedule> {
  const schedules = new Map<string, NPCDailySchedule>();

  for (const [npcId, template] of Object.entries(WEEKDAY_SCHEDULES)) {
    const entries: NPCScheduleEntry[] = [];

    if (isSabbath) {
      const sabbathInfo = SABBATH_LOCATIONS[npcId];
      if (sabbathInfo) {
        // 安息日：所有时段在安息日地点
        for (const slot of [TimeOfDay.DAWN, TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON, TimeOfDay.EVENING]) {
          entries.push({
            npcId,
            timeSlot: slot,
            locationId: sabbathInfo.locationId,
            activity: sabbathInfo.activity,
          });
        }
      }
    } else {
      for (const entry of template) {
        entries.push({
          npcId,
          timeSlot: entry.timeSlot,
          locationId: entry.locationId,
          activity: entry.activity,
        });
      }
    }

    schedules.set(npcId, { npcId, date: dayOffset, entries });
  }

  return schedules;
}

/** 获取某NPC在当前时段的位置和活动 */
export function getNPCCurrentActivity(
  npcId: string,
  schedules: Map<string, NPCDailySchedule>,
  timeSlot: TimeOfDay,
): { locationId: string; activity: string } | undefined {
  const schedule = schedules.get(npcId);
  if (!schedule) return undefined;
  const entry = schedule.entries.find(e => e.timeSlot === timeSlot);
  if (!entry) return undefined;
  return { locationId: entry.locationId, activity: entry.activity };
}
