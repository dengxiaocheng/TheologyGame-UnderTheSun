// src/data/families/tenantFarmer.ts — 佃农家庭初始数据

import type { Family, FamilyMember, DebtRecord } from '../../models/family.js';
import type { FamilyResources } from '../../models/resources.js';
import type { GameDate } from '../../models/time.js';
import { Gender, HealthStatus, FamilyRole } from '../../models/family.js';
import { advanceToNextDay } from '../../models/time.js';

function createMembers(): FamilyMember[] {
  return [
    // 父亲 — 迦勒（Caleb），45岁，佃农
    {
      id: 'caleb',
      name: '迦勒',
      age: 45,
      gender: Gender.MALE,
      health: HealthStatus.TIRED,
      stamina: 70,
      maxStamina: 95,
      craft: ['耕种', '灌溉', '筑篱'],
      literacy: 8,
      reputation: ['老实农夫', '按时交租'],
      marriageStatus: 'married',
      kinshipId: 'farmer-kin',
      debt: 0,
      skills: new Map([
        ['耕种', 85],
        ['灌溉', 70],
        ['体力劳动', 90],
        ['观天象', 50],
        ['讨价还价', 20],
      ]),
      role: FamilyRole.PATRIARCH,
    },
    // 母亲 — 利亚（Leah），38岁，家务/纺织
    {
      id: 'leah',
      name: '利亚',
      age: 38,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 65,
      maxStamina: 80,
      craft: ['纺织', '烹饪', '家务管理'],
      literacy: 5,
      reputation: ['勤劳的主妇'],
      marriageStatus: 'married',
      kinshipId: 'farmer-kin',
      debt: 0,
      skills: new Map([
        ['纺织', 60],
        ['烹饪', 70],
        ['家务管理', 75],
        ['育儿', 70],
        ['碾谷', 65],
      ]),
      role: FamilyRole.MATRIARCH,
    },
    // 长子 — 约瑟（Joseph），17岁，帮工
    {
      id: 'joseph-farmer',
      name: '约瑟',
      age: 17,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 90,
      maxStamina: 100,
      craft: ['耕种', '牧羊'],
      literacy: 12,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'farmer-kin',
      debt: 0,
      skills: new Map([
        ['耕种', 55],
        ['体力劳动', 80],
        ['牧羊', 40],
        ['奔跑', 75],
        ['灌溉', 45],
      ]),
      role: FamilyRole.ELDER_SON,
    },
    // 次子 — 便雅悯（Benjamin），13岁
    {
      id: 'benjamin',
      name: '便雅悯',
      age: 13,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 85,
      maxStamina: 95,
      craft: ['放羊'],
      literacy: 10,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'farmer-kin',
      debt: 0,
      skills: new Map([
        ['牧羊', 45],
        ['奔跑', 80],
        ['耕种', 25],
        ['体力劳动', 55],
      ]),
      role: FamilyRole.YOUTH,
    },
    // 幼女 — 底波拉（Deborah），8岁
    {
      id: 'deborah',
      name: '底波拉',
      age: 8,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 70,
      maxStamina: 80,
      craft: [],
      literacy: 3,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'farmer-kin',
      debt: 0,
      skills: new Map([
        ['奔跑', 65],
        ['照看幼童', 30],
        ['纺织', 10],
      ]),
      role: FamilyRole.CHILD,
    },
  ];
}

function createInitialResources(): FamilyResources {
  return {
    survival: {
      grain: 20,
      water: 40,
      oil: 3,
      fish: 2,
      salt: 4,
      firewood: 20,
      clothing: 4,
      shelterDurability: 55,
      livestockHealth: 40,
    },
    economic: {
      copperCoins: 640,   // 5 denarii — 很少
      silverCoins: 0,
      tools: [
        { id: 'tool-plow-1', name: '木犁', durability: 50, maxDurability: 100, type: 'farming' },
        { id: 'tool-sickle-1', name: '镰刀', durability: 70, maxDurability: 100, type: 'farming' },
        { id: 'tool-sickle-2', name: '备用镰刀', durability: 40, maxDurability: 100, type: 'farming' },
      ],
      inventory: [],
      pendingOrders: [],
    },
    social: {
      familyHonor: 40,
      neighborTrust: 55,
      elderApproval: 45,
      creditorPatience: new Map([
        ['landlord-bethsaida', 60],
      ]),
    },
    ritual: {
      sabbathReadiness: 30,
      purityStatus: {
        isPure: true,
        impuritySources: [],
      },
      festivalReadiness: new Map(),
      charityReputation: 20,
      synagogueParticipation: 35,
    },
  };
}

export function createTenantFarmerFamily(startDate: GameDate): Family {
  let dueDate = startDate;
  for (let i = 0; i < 7; i++) {
    dueDate = advanceToNextDay(dueDate);
  }

  return {
    id: 'family-tenant-farmer',
    name: '伯赛大佃农之家',
    members: createMembers(),
    resources: createInitialResources(),
    reputation: ['佃农', '租种地主田地'],
    debts: [
      {
        creditorId: 'landlord-bethsaida',
        amount: 12,
        dueDate,
        collateral: '收成的一半',
        status: 'active',
      },
    ],
  };
}
