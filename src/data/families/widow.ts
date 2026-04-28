// src/data/families/widow.ts — 寡妇家庭初始数据

import type { Family, FamilyMember, DebtRecord } from '../../models/family.js';
import type { FamilyResources } from '../../models/resources.js';
import type { GameDate } from '../../models/time.js';
import { Gender, HealthStatus, FamilyRole } from '../../models/family.js';
import { advanceToNextDay } from '../../models/time.js';

function createMembers(): FamilyMember[] {
  return [
    // 寡妇 — 拿俄米（Naomi-widow），50岁，纺织
    {
      id: 'naomi-widow',
      name: '拿俄米',
      age: 50,
      gender: Gender.FEMALE,
      health: HealthStatus.TIRED,
      stamina: 55,
      maxStamina: 70,
      craft: ['纺织', '草药', '烹饪'],
      literacy: 12,
      reputation: ['寡妇', '勤劳但困苦'],
      marriageStatus: 'widowed',
      kinshipId: 'widow-kin',
      debt: 0,
      skills: new Map([
        ['纺织', 80],
        ['草药知识', 55],
        ['烹饪', 65],
        ['家务管理', 75],
        ['乞讨的体面', 40],
      ]),
      role: FamilyRole.MATRIARCH,
    },
    // 长子 — 迦勒（Caleb-w），16岁，打零工
    {
      id: 'caleb-widow',
      name: '迦勒',
      age: 16,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 85,
      maxStamina: 95,
      craft: ['搬运', '农活'],
      literacy: 8,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'widow-kin',
      debt: 0,
      skills: new Map([
        ['体力劳动', 70],
        ['搬运', 60],
        ['耕种', 35],
        ['奔跑', 75],
        ['纺织', 20],
      ]),
      role: FamilyRole.ELDER_SON,
    },
    // 幼女 — 撒拉（Sarah-w），9岁
    {
      id: 'sarah-widow',
      name: '撒拉',
      age: 9,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 65,
      maxStamina: 75,
      craft: ['纺织学徒'],
      literacy: 5,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'widow-kin',
      debt: 0,
      skills: new Map([
        ['纺织', 20],
        ['家务管理', 25],
        ['奔跑', 60],
        ['照看幼童', 20],
      ]),
      role: FamilyRole.ELDER_DAUGHTER,
    },
  ];
}

function createInitialResources(): FamilyResources {
  return {
    survival: {
      grain: 8,        // 极少
      water: 20,
      oil: 1,
      fish: 1,
      salt: 1,
      firewood: 8,
      clothing: 2,     // 很少
      shelterDurability: 35,  // 破旧
      livestockHealth: 0,
    },
    economic: {
      copperCoins: 256,   // 2 denarii — 几乎没有
      silverCoins: 0,
      tools: [
        { id: 'tool-loom-1', name: '旧织布机', durability: 30, maxDurability: 100, type: 'weaving' },
        { id: 'tool-spindle-1', name: '纺锤', durability: 60, maxDurability: 100, type: 'weaving' },
      ],
      inventory: [],
      pendingOrders: [],
    },
    social: {
      familyHonor: 30,
      neighborTrust: 50,
      elderApproval: 35,
      creditorPatience: new Map([
        ['creditor-capernaum', 30],
      ]),
    },
    ritual: {
      sabbathReadiness: 20,
      purityStatus: {
        isPure: true,
        impuritySources: [],
      },
      festivalReadiness: new Map(),
      charityReputation: 15,
      synagogueParticipation: 25,
    },
  };
}

export function createWidowFamily(startDate: GameDate): Family {
  let dueDate = startDate;
  for (let i = 0; i < 5; i++) {
    dueDate = advanceToNextDay(dueDate);
  }

  return {
    id: 'family-widow',
    name: '迦百农寡妇之家',
    members: createMembers(),
    resources: createInitialResources(),
    reputation: ['寡妇家庭', '仰赖邻舍周济'],
    debts: [
      {
        creditorId: 'creditor-capernaum',
        amount: 4,
        dueDate,
        collateral: '旧织布机',
        status: 'active',
      },
    ],
  };
}
