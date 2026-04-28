// src/data/families/fisherman.ts — 渔民家庭初始数据（贝特沙哈尔渔民之家）

import type { Family, FamilyMember, DebtRecord } from '../../models/family.js';
import type { FamilyResources } from '../../models/resources.js';
import type { GameDate } from '../../models/time.js';
import { Gender, HealthStatus, FamilyRole } from '../../models/family.js';
import { advanceToNextDay } from '../../models/time.js';

/** 渔民家庭的初始成员 */
function createMembers(): FamilyMember[] {
  return [
    // 父亲 — 约拿（Yonah），40岁，渔夫
    {
      id: 'yonah',
      name: '约拿',
      age: 40,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 85,
      maxStamina: 100,
      craft: ['捕鱼', '织网', '航海'],
      literacy: 15,
      reputation: ['勤劳的渔夫', '准时交税'],
      marriageStatus: 'married',
      kinshipId: 'bet-shahar-kin',
      debt: 0,
      skills: new Map([
        ['捕鱼', 80],
        ['织网', 75],
        ['航海', 70],
        ['体力劳动', 85],
        ['讨价还价', 45],
      ]),
      role: FamilyRole.PATRIARCH,
    },
    // 母亲 — 米利暗（Miriam），35岁，纺织/家务管理
    {
      id: 'miriam',
      name: '米利暗',
      age: 35,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 75,
      maxStamina: 90,
      craft: ['纺织', '家务管理', '烹饪', '草药'],
      literacy: 10,
      reputation: ['善于持家'],
      marriageStatus: 'married',
      kinshipId: 'bet-shahar-kin',
      debt: 0,
      skills: new Map([
        ['纺织', 70],
        ['烹饪', 75],
        ['草药知识', 40],
        ['家务管理', 80],
        ['育儿', 75],
      ]),
      role: FamilyRole.MATRIARCH,
    },
    // 祖母 — 拿俄米（Naomi），60岁，记忆/调解
    {
      id: 'naomi',
      name: '拿俄米',
      age: 60,
      gender: Gender.FEMALE,
      health: HealthStatus.TIRED,
      stamina: 50,
      maxStamina: 65,
      craft: ['讲故事', '调解纠纷', '传统草药'],
      literacy: 5,
      reputation: ['有智慧的祖母', '记得古老的事'],
      marriageStatus: 'widowed',
      kinshipId: 'bet-shahar-kin',
      debt: 0,
      skills: new Map([
        ['口述传统', 90],
        ['调解', 75],
        ['传统草药', 65],
        ['烹饪', 60],
        ['安抚', 80],
      ]),
      role: FamilyRole.GRANDPARENT,
    },
    // 少年儿子 — 西门（Shimon），14岁，学徒
    {
      id: 'shimon',
      name: '西门',
      age: 14,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 90,
      maxStamina: 100,
      craft: ['捕鱼学徒'],
      literacy: 20,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'bet-shahar-kin',
      debt: 0,
      skills: new Map([
        ['捕鱼', 30],
        ['织网', 25],
        ['游泳', 70],
        ['奔跑', 85],
        ['体力劳动', 60],
      ]),
      role: FamilyRole.ELDER_SON,
    },
    // 少女女儿 — 撒拉（Sarah），12岁，纺织/家务
    {
      id: 'sarah',
      name: '撒拉',
      age: 12,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 80,
      maxStamina: 90,
      craft: ['纺织学徒', '家务'],
      literacy: 15,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'bet-shahar-kin',
      debt: 0,
      skills: new Map([
        ['纺织', 30],
        ['烹饪', 35],
        ['家务管理', 40],
        ['奔跑', 70],
        ['照看幼童', 50],
      ]),
      role: FamilyRole.ELDER_DAUGHTER,
    },
    // 幼子 — 以利（Eli），6岁
    {
      id: 'eli',
      name: '以利',
      age: 6,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 70,
      maxStamina: 80,
      craft: [],
      literacy: 0,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'bet-shahar-kin',
      debt: 0,
      skills: new Map([
        ['奔跑', 60],
        ['玩耍', 95],
        ['观察', 40],
      ]),
      role: FamilyRole.CHILD,
    },
  ];
}

/** 初始资源 */
function createInitialResources(): FamilyResources {
  return {
    survival: {
      grain: 30,      // 约 10 天粮食储备
      water: 50,
      oil: 5,         // 灯油不多
      fish: 8,        // 一些鱼干
      salt: 3,
      firewood: 15,
      clothing: 4,    // 每人一套基本衣物
      shelterDurability: 70,
      livestockHealth: 0, // 无牲畜
    },
    economic: {
      copperCoins: 2560,  // 20 denarii = 20 × 128 leptons
      silverCoins: 0,
      tools: [
        {
          id: 'tool-net-1',
          name: '主渔网',
          durability: 60,
          maxDurability: 100,
          type: 'fishing',
        },
        {
          id: 'tool-net-2',
          name: '备用渔网',
          durability: 35,
          maxDurability: 100,
          type: 'fishing',
        },
        {
          id: 'tool-hook-1',
          name: '鱼钩套装',
          durability: 80,
          maxDurability: 100,
          type: 'fishing',
        },
      ],
      inventory: [],
      pendingOrders: [],
    },
    social: {
      familyHonor: 55,
      neighborTrust: 60,
      elderApproval: 50,
      creditorPatience: new Map([
        ['tax-collector-capernaum', 70],
      ]),
    },
    ritual: {
      sabbathReadiness: 40,
      purityStatus: {
        isPure: true,
        impuritySources: [],
      },
      festivalReadiness: new Map(),
      charityReputation: 30,
      synagogueParticipation: 45,
    },
  };
}

/** 创建渔民家庭 */
export function createFishermanFamily(startDate: GameDate): Family {
  // 计算债务到期日（第 10 天）
  let dueDate = startDate;
  for (let i = 0; i < 10; i++) {
    dueDate = advanceToNextDay(dueDate);
  }

  return {
    id: 'family-bet-shahar',
    name: '贝特沙哈尔渔民之家',
    members: createMembers(),
    resources: createInitialResources(),
    reputation: ['渔民世家', '住在湖边的家族'],
    debts: [
      {
        creditorId: 'tax-collector-capernaum',
        amount: 5, // 5 denarii
        dueDate,
        collateral: '备用渔网',
        status: 'active',
      },
    ],
  };
}
