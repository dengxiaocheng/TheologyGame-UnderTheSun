// src/engine/actions.ts — 可执行行动系统

import { TimeOfDay } from '../models/time.js';

/** 行动类型 */
export enum ActionType {
  FISH = 'FISH',
  REPAIR_NET = 'REPAIR_NET',
  TRADE = 'TRADE',
  HAUL_WATER = 'HAUL_WATER',
  BAKE_BREAD = 'BAKE_BREAD',
  WEAVE = 'WEAVE',
  GATHER_FIREWOOD = 'GATHER_FIREWOOD',
  MILL_GRAIN = 'MILL_GRAIN',
  VISITOR = 'VISITOR',
  SYNAGOGUE = 'SYNAGOGUE',
  REST = 'REST',
  STUDY = 'STUDY',
  SOCIAL_VISIT = 'SOCIAL_VISIT',
  CARE_SICK = 'CARE_SICK',
  HERD_SHEEP = 'HERD_SHEEP',
  SHORT_LABOR = 'SHORT_LABOR',
  DELIVER_GOODS = 'DELIVER_GOODS',
  FAMILY_MEAL = 'FAMILY_MEAL',
  PRAYER = 'PRAYER',
  // Phase 3 新增行动
  PLANT_CROP = 'PLANT_CROP',
  HARVEST = 'HARVEST',
  PRESS_OLIVES = 'PRESS_OLIVES',
  PRUNE_VINE = 'PRUNE_VINE',
  CARPENTRY = 'CARPENTRY',
  STONECRAFT = 'STONECRAFT',
  POTTERY = 'POTTERY',
  HEAL_HERB = 'HEAL_HERB',
  SCRIBE_WORK = 'SCRIBE_WORK',
  TEACH_CHILD = 'TEACH_CHILD',
  TEND_OLIVE = 'TEND_OLIVE',
  SPIN_THREAD = 'SPIN_THREAD',
  WASH_CLOTHES = 'WASH_CLOTHES',
  MEND_CLOTHES = 'MEND_CLOTHES',
  REPAIR_HOUSE = 'REPAIR_HOUSE',
  WINE_MAKING = 'WINE_MAKING',
  GUARD_FLOCK = 'GUARD_FLOCK',
}

/** 资源效果 */
export interface ResourceEffect {
  layer: 'survival' | 'economic' | 'social' | 'ritual';
  field: string;
  delta: number;
}

/** 行动定义 */
export interface ActionDefinition {
  type: ActionType;
  name: string;
  description: string;
  /** 体力消耗（负值表示消耗，正值表示恢复） */
  staminaCost: number;
  /** 行动点消耗 */
  apCost: number;
  /** 允许执行的时段 */
  allowedTimeSlots: TimeOfDay[];
  /** 安息日是否禁止 */
  forbiddenOnSabbath: boolean;
  /** 所需技能（技能名 -> 最低熟练度） */
  requiredSkills?: Map<string, number>;
  /** 最低年龄 */
  minAge?: number;
  /** 产出效果 */
  produces?: ResourceEffect[];
  /** 消耗效果 */
  consumes?: ResourceEffect[];
}

// ---- 行动名中英文映射 ----

export const ACTION_NAME_MAP: Record<string, ActionType> = {
  // 中文名
  '捕鱼': ActionType.FISH,
  '补网': ActionType.REPAIR_NET,
  '修网': ActionType.REPAIR_NET,
  '交易': ActionType.TRADE,
  '赶集': ActionType.TRADE,
  '挑水': ActionType.HAUL_WATER,
  '打水': ActionType.HAUL_WATER,
  '烤饼': ActionType.BAKE_BREAD,
  '烤面包': ActionType.BAKE_BREAD,
  '织造': ActionType.WEAVE,
  '纺织': ActionType.WEAVE,
  '织布': ActionType.WEAVE,
  '收集柴火': ActionType.GATHER_FIREWOOD,
  '拾柴': ActionType.GATHER_FIREWOOD,
  '砍柴': ActionType.GATHER_FIREWOOD,
  '碾谷': ActionType.MILL_GRAIN,
  '磨面': ActionType.MILL_GRAIN,
  '接待': ActionType.VISITOR,
  '会堂': ActionType.SYNAGOGUE,
  '聚会': ActionType.SYNAGOGUE,
  '休息': ActionType.REST,
  '学习': ActionType.STUDY,
  '读经': ActionType.STUDY,
  '社交': ActionType.SOCIAL_VISIT,
  '拜访': ActionType.SOCIAL_VISIT,
  '探望': ActionType.SOCIAL_VISIT,
  '照顾': ActionType.CARE_SICK,
  '看护': ActionType.CARE_SICK,
  '放羊': ActionType.HERD_SHEEP,
  '牧羊': ActionType.HERD_SHEEP,
  '短工': ActionType.SHORT_LABOR,
  '打工': ActionType.SHORT_LABOR,
  '送货': ActionType.DELIVER_GOODS,
  '运货': ActionType.DELIVER_GOODS,
  '家庭饭食': ActionType.FAMILY_MEAL,
  '聚餐': ActionType.FAMILY_MEAL,
  '做饭': ActionType.FAMILY_MEAL,
  '祷告': ActionType.PRAYER,
  '祈祷': ActionType.PRAYER,
  // Phase 3 新增中文名
  '种地': ActionType.PLANT_CROP,
  '播种': ActionType.PLANT_CROP,
  '耕种': ActionType.PLANT_CROP,
  '收割': ActionType.HARVEST,
  '收成': ActionType.HARVEST,
  '榨油': ActionType.PRESS_OLIVES,
  '压橄榄': ActionType.PRESS_OLIVES,
  '修剪葡萄': ActionType.PRUNE_VINE,
  '剪枝': ActionType.PRUNE_VINE,
  '木工': ActionType.CARPENTRY,
  '做木工': ActionType.CARPENTRY,
  '石工': ActionType.STONECRAFT,
  '做石工': ActionType.STONECRAFT,
  '制陶': ActionType.POTTERY,
  '做陶器': ActionType.POTTERY,
  '草药': ActionType.HEAL_HERB,
  '采药': ActionType.HEAL_HERB,
  '治病': ActionType.HEAL_HERB,
  '抄写': ActionType.SCRIBE_WORK,
  '抄经': ActionType.SCRIBE_WORK,
  '教书': ActionType.TEACH_CHILD,
  '教孩子': ActionType.TEACH_CHILD,
  '照看橄榄': ActionType.TEND_OLIVE,
  '打理橄榄园': ActionType.TEND_OLIVE,
  '纺线': ActionType.SPIN_THREAD,
  '纺纱': ActionType.SPIN_THREAD,
  '洗衣': ActionType.WASH_CLOTHES,
  '洗衣服': ActionType.WASH_CLOTHES,
  '缝补': ActionType.MEND_CLOTHES,
  '补衣': ActionType.MEND_CLOTHES,
  '修房': ActionType.REPAIR_HOUSE,
  '修缮': ActionType.REPAIR_HOUSE,
  '酿酒': ActionType.WINE_MAKING,
  '做酒': ActionType.WINE_MAKING,
  '守夜': ActionType.GUARD_FLOCK,
  '看羊': ActionType.GUARD_FLOCK,
  // 英文名（大小写不敏感）
  'fish': ActionType.FISH,
  'repair_net': ActionType.REPAIR_NET,
  'repair': ActionType.REPAIR_NET,
  'trade': ActionType.TRADE,
  'haul_water': ActionType.HAUL_WATER,
  'water': ActionType.HAUL_WATER,
  'bake_bread': ActionType.BAKE_BREAD,
  'bake': ActionType.BAKE_BREAD,
  'bread': ActionType.BAKE_BREAD,
  'weave': ActionType.WEAVE,
  'gather_firewood': ActionType.GATHER_FIREWOOD,
  'firewood': ActionType.GATHER_FIREWOOD,
  'mill_grain': ActionType.MILL_GRAIN,
  'mill': ActionType.MILL_GRAIN,
  'visitor': ActionType.VISITOR,
  'synagogue': ActionType.SYNAGOGUE,
  'rest': ActionType.REST,
  'study': ActionType.STUDY,
  'social_visit': ActionType.SOCIAL_VISIT,
  'social': ActionType.SOCIAL_VISIT,
  'visit': ActionType.SOCIAL_VISIT,
  'care_sick': ActionType.CARE_SICK,
  'care': ActionType.CARE_SICK,
  'herd_sheep': ActionType.HERD_SHEEP,
  'herd': ActionType.HERD_SHEEP,
  'short_labor': ActionType.SHORT_LABOR,
  'labor': ActionType.SHORT_LABOR,
  'deliver_goods': ActionType.DELIVER_GOODS,
  'deliver': ActionType.DELIVER_GOODS,
  'family_meal': ActionType.FAMILY_MEAL,
  'meal': ActionType.FAMILY_MEAL,
  'prayer': ActionType.PRAYER,
  'pray': ActionType.PRAYER,
  // Phase 3 new English names
  'plant_crop': ActionType.PLANT_CROP,
  'plant': ActionType.PLANT_CROP,
  'harvest': ActionType.HARVEST,
  'press_olives': ActionType.PRESS_OLIVES,
  'olive_press': ActionType.PRESS_OLIVES,
  'prune_vine': ActionType.PRUNE_VINE,
  'prune': ActionType.PRUNE_VINE,
  'carpentry': ActionType.CARPENTRY,
  'stonecraft': ActionType.STONECRAFT,
  'masonry': ActionType.STONECRAFT,
  'pottery': ActionType.POTTERY,
  'heal_herb': ActionType.HEAL_HERB,
  'herb': ActionType.HEAL_HERB,
  'scribe_work': ActionType.SCRIBE_WORK,
  'scribe': ActionType.SCRIBE_WORK,
  'teach_child': ActionType.TEACH_CHILD,
  'teach': ActionType.TEACH_CHILD,
  'tend_olive': ActionType.TEND_OLIVE,
  'spin_thread': ActionType.SPIN_THREAD,
  'spin': ActionType.SPIN_THREAD,
  'wash_clothes': ActionType.WASH_CLOTHES,
  'wash': ActionType.WASH_CLOTHES,
  'mend_clothes': ActionType.MEND_CLOTHES,
  'mend': ActionType.MEND_CLOTHES,
  'repair_house': ActionType.REPAIR_HOUSE,
  'wine_making': ActionType.WINE_MAKING,
  'wine': ActionType.WINE_MAKING,
  'guard_flock': ActionType.GUARD_FLOCK,
  'guard': ActionType.GUARD_FLOCK,
};

/** 解析用户输入为 ActionType */
export function parseActionType(input: string): ActionType | undefined {
  return ACTION_NAME_MAP[input.toLowerCase().trim()];
}

/** 所有 MVP 行动定义 */
export function createAllActions(): Map<ActionType, ActionDefinition> {
  const actions = new Map<ActionType, ActionDefinition>();

  actions.set(ActionType.FISH, {
    type: ActionType.FISH,
    name: '捕鱼',
    description: '出海或湖边撒网捕鱼',
    staminaCost: -25,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['捕鱼', 10]]),
    minAge: 10,
    produces: [
      { layer: 'survival', field: 'fish', delta: 0 }, // 动态计算
    ],
    consumes: [
      { layer: 'survival', field: 'salt', delta: -1 },
    ],
  });

  actions.set(ActionType.REPAIR_NET, {
    type: ActionType.REPAIR_NET,
    name: '补网',
    description: '修补破损的渔网',
    staminaCost: -15,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['织网', 5]]),
    minAge: 10,
  });

  actions.set(ActionType.TRADE, {
    type: ActionType.TRADE,
    name: '赶集',
    description: '去集市买卖货物',
    staminaCost: -5,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    minAge: 14,
  });

  actions.set(ActionType.HAUL_WATER, {
    type: ActionType.HAUL_WATER,
    name: '挑水',
    description: '去水井或湖边取水',
    staminaCost: -10,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    minAge: 8,
    produces: [
      { layer: 'survival', field: 'water', delta: 10 },
    ],
  });

  actions.set(ActionType.BAKE_BREAD, {
    type: ActionType.BAKE_BREAD,
    name: '烤饼',
    description: '用谷物烤制面饼',
    staminaCost: -8,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.DAWN],
    forbiddenOnSabbath: true,
    minAge: 10,
    produces: [
      { layer: 'survival', field: 'grain', delta: 3 }, // 烤好的饼
    ],
    consumes: [
      { layer: 'survival', field: 'grain', delta: -2 },
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.WEAVE, {
    type: ActionType.WEAVE,
    name: '织造',
    description: '纺织布料或衣物',
    staminaCost: -12,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['纺织', 10]]),
    minAge: 10,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 64 }, // 约 0.5 denarius
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.GATHER_FIREWOOD, {
    type: ActionType.GATHER_FIREWOOD,
    name: '拾柴',
    description: '收集柴火',
    staminaCost: -15,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    minAge: 8,
    produces: [
      { layer: 'survival', field: 'firewood', delta: 5 },
    ],
  });

  actions.set(ActionType.MILL_GRAIN, {
    type: ActionType.MILL_GRAIN,
    name: '碾谷',
    description: '用磨石碾磨谷物',
    staminaCost: -12,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    minAge: 10,
    produces: [
      { layer: 'survival', field: 'grain', delta: 2 }, // 碾好的面粉
    ],
    consumes: [
      { layer: 'survival', field: 'grain', delta: -2 }, // 原粮
    ],
  });

  actions.set(ActionType.VISITOR, {
    type: ActionType.VISITOR,
    name: '接待',
    description: '接待来访的客人或旅人',
    staminaCost: -5,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
    minAge: 14,
    produces: [
      { layer: 'social', field: 'neighborTrust', delta: 3 },
      { layer: 'ritual', field: 'charityReputation', delta: 2 },
    ],
    consumes: [
      { layer: 'survival', field: 'grain', delta: -1 },
    ],
  });

  actions.set(ActionType.SYNAGOGUE, {
    type: ActionType.SYNAGOGUE,
    name: '会堂',
    description: '去会堂聚会敬拜',
    staminaCost: -2,
    apCost: 0,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: false,
    minAge: 13,
    produces: [
      { layer: 'ritual', field: 'synagogueParticipation', delta: 5 },
    ],
  });

  actions.set(ActionType.REST, {
    type: ActionType.REST,
    name: '休息',
    description: '休息恢复体力',
    staminaCost: 20, // 正值 = 恢复
    apCost: 0,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
  });

  actions.set(ActionType.STUDY, {
    type: ActionType.STUDY,
    name: '读经',
    description: '学习经文或律法',
    staminaCost: -5,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: false,
    produces: [
      { layer: 'ritual', field: 'synagogueParticipation', delta: 3 },
    ],
  });

  actions.set(ActionType.SOCIAL_VISIT, {
    type: ActionType.SOCIAL_VISIT,
    name: '拜访',
    description: '拜访邻舍或亲友',
    staminaCost: -5,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
    minAge: 10,
    produces: [
      { layer: 'social', field: 'neighborTrust', delta: 2 },
    ],
  });

  actions.set(ActionType.CARE_SICK, {
    type: ActionType.CARE_SICK,
    name: '看护',
    description: '照顾生病的家人或邻舍',
    staminaCost: -8,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
    minAge: 10,
  });

  actions.set(ActionType.HERD_SHEEP, {
    type: ActionType.HERD_SHEEP,
    name: '牧羊',
    description: '放牧羊群',
    staminaCost: -18,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING],
    forbiddenOnSabbath: true,
    minAge: 8,
    produces: [
      { layer: 'survival', field: 'livestockHealth', delta: 5 },
    ],
  });

  actions.set(ActionType.SHORT_LABOR, {
    type: ActionType.SHORT_LABOR,
    name: '短工',
    description: '做临时工赚取铜币',
    staminaCost: -20,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    minAge: 14,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 192 }, // ~1.5 denarius
    ],
  });

  actions.set(ActionType.DELIVER_GOODS, {
    type: ActionType.DELIVER_GOODS,
    name: '送货',
    description: '为商人运送货物',
    staminaCost: -15,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    minAge: 14,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 128 }, // ~1 denarius
    ],
  });

  actions.set(ActionType.FAMILY_MEAL, {
    type: ActionType.FAMILY_MEAL,
    name: '家庭饭食',
    description: '全家人一起用餐',
    staminaCost: 10, // 正值 = 恢复
    apCost: 0,
    allowedTimeSlots: [TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
    consumes: [
      { layer: 'survival', field: 'grain', delta: -1 },
    ],
    produces: [
      { layer: 'social', field: 'familyHonor', delta: 1 },
    ],
  });

  actions.set(ActionType.PRAYER, {
    type: ActionType.PRAYER,
    name: '祷告',
    description: '个人祈祷与默想',
    staminaCost: -2,
    apCost: 0,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
    produces: [
      { layer: 'ritual', field: 'sabbathReadiness', delta: 3 },
    ],
  });

  // ── Phase 3 新增行动 ──

  actions.set(ActionType.PLANT_CROP, {
    type: ActionType.PLANT_CROP,
    name: '种地',
    description: '播种或耕种田地',
    staminaCost: -22,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['耕种', 10]]),
    minAge: 12,
    produces: [
      { layer: 'survival', field: 'grain', delta: 4 },
    ],
    consumes: [
      { layer: 'survival', field: 'grain', delta: -1 },
    ],
  });

  actions.set(ActionType.HARVEST, {
    type: ActionType.HARVEST,
    name: '收割',
    description: '收割庄稼',
    staminaCost: -25,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['耕种', 20]]),
    minAge: 12,
    produces: [
      { layer: 'survival', field: 'grain', delta: 8 },
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.PRESS_OLIVES, {
    type: ActionType.PRESS_OLIVES,
    name: '榨油',
    description: '用石磨压榨橄榄取油',
    staminaCost: -20,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['体力劳动', 15]]),
    minAge: 14,
    produces: [
      { layer: 'survival', field: 'oil', delta: 3 },
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.PRUNE_VINE, {
    type: ActionType.PRUNE_VINE,
    name: '剪枝',
    description: '修剪葡萄藤',
    staminaCost: -15,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['耕种', 15]]),
    minAge: 12,
    produces: [
      { layer: 'survival', field: 'grain', delta: 2 },
    ],
  });

  actions.set(ActionType.CARPENTRY, {
    type: ActionType.CARPENTRY,
    name: '木工',
    description: '制作或修理木制品',
    staminaCost: -18,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['木匠', 15]]),
    minAge: 14,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 160 },
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.STONECRAFT, {
    type: ActionType.STONECRAFT,
    name: '石工',
    description: '切割或雕刻石材',
    staminaCost: -22,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['石匠', 15]]),
    minAge: 14,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 192 },
    ],
  });

  actions.set(ActionType.POTTERY, {
    type: ActionType.POTTERY,
    name: '制陶',
    description: '制作陶器',
    staminaCost: -12,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    requiredSkills: new Map([['陶器', 10]]),
    minAge: 10,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 128 },
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.HEAL_HERB, {
    type: ActionType.HEAL_HERB,
    name: '草药',
    description: '采集草药治疗伤病',
    staminaCost: -10,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING],
    forbiddenOnSabbath: false,
    requiredSkills: new Map([['草药知识', 20]]),
    minAge: 14,
    produces: [
      { layer: 'social', field: 'neighborTrust', delta: 3 },
    ],
  });

  actions.set(ActionType.SCRIBE_WORK, {
    type: ActionType.SCRIBE_WORK,
    name: '抄写',
    description: '抄写文书或经卷',
    staminaCost: -8,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: false,
    requiredSkills: new Map([['读写', 40]]),
    minAge: 16,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 256 },
    ],
  });

  actions.set(ActionType.TEACH_CHILD, {
    type: ActionType.TEACH_CHILD,
    name: '教书',
    description: '教导孩子读写或技能',
    staminaCost: -8,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: false,
    requiredSkills: new Map([['读写', 20]]),
    minAge: 16,
    produces: [
      { layer: 'social', field: 'familyHonor', delta: 2 },
    ],
  });

  actions.set(ActionType.TEND_OLIVE, {
    type: ActionType.TEND_OLIVE,
    name: '照看橄榄',
    description: '打理橄榄园：除草、施肥、修整',
    staminaCost: -15,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.AFTERNOON],
    forbiddenOnSabbath: true,
    minAge: 10,
    produces: [
      { layer: 'survival', field: 'oil', delta: 1 },
    ],
  });

  actions.set(ActionType.SPIN_THREAD, {
    type: ActionType.SPIN_THREAD,
    name: '纺线',
    description: '用纺锤将纤维纺成线',
    staminaCost: -8,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    forbiddenOnSabbath: true,
    minAge: 8,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 48 },
    ],
  });

  actions.set(ActionType.WASH_CLOTHES, {
    type: ActionType.WASH_CLOTHES,
    name: '洗衣',
    description: '去河边或水井旁洗衣',
    staminaCost: -10,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.DAWN, TimeOfDay.MORNING],
    forbiddenOnSabbath: true,
    minAge: 8,
  });

  actions.set(ActionType.MEND_CLOTHES, {
    type: ActionType.MEND_CLOTHES,
    name: '缝补',
    description: '修补破旧的衣物',
    staminaCost: -6,
    apCost: 1,
    allowedTimeSlots: [TimeOfDay.MIDDAY, TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    forbiddenOnSabbath: false,
    minAge: 10,
    produces: [
      { layer: 'survival', field: 'clothing', delta: 1 },
    ],
  });

  actions.set(ActionType.REPAIR_HOUSE, {
    type: ActionType.REPAIR_HOUSE,
    name: '修房',
    description: '修缮住所',
    staminaCost: -20,
    apCost: 3,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    minAge: 14,
    requiredSkills: new Map([['体力劳动', 20]]),
    produces: [
      { layer: 'survival', field: 'shelterDurability', delta: 5 },
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -2 },
    ],
  });

  actions.set(ActionType.WINE_MAKING, {
    type: ActionType.WINE_MAKING,
    name: '酿酒',
    description: '踩葡萄、酿制葡萄酒',
    staminaCost: -15,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.MORNING, TimeOfDay.MIDDAY],
    forbiddenOnSabbath: true,
    minAge: 14,
    produces: [
      { layer: 'economic', field: 'copperCoins', delta: 192 },
    ],
    consumes: [
      { layer: 'survival', field: 'firewood', delta: -1 },
    ],
  });

  actions.set(ActionType.GUARD_FLOCK, {
    type: ActionType.GUARD_FLOCK,
    name: '守夜',
    description: '夜间看守羊群防备野兽',
    staminaCost: -15,
    apCost: 2,
    allowedTimeSlots: [TimeOfDay.EVENING],
    forbiddenOnSabbath: true,
    minAge: 12,
    produces: [
      { layer: 'survival', field: 'livestockHealth', delta: 3 },
    ],
  });

  return actions;
}
