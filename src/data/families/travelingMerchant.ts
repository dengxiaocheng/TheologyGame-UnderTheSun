// src/data/families/travelingMerchant.ts — 行商家庭初始数据

import type { Family, FamilyMember, DebtRecord } from '../../models/family.js';
import type { FamilyResources } from '../../models/resources.js';
import type { GameDate } from '../../models/time.js';
import { Gender, HealthStatus, FamilyRole } from '../../models/family.js';
import { advanceToNextDay } from '../../models/time.js';

function createMembers(): FamilyMember[] {
  return [
    // 父亲 — 但以理（Daniel），42岁，行商
    {
      id: 'daniel-merchant',
      name: '但以理',
      age: 42,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 75,
      maxStamina: 90,
      craft: ['贸易', '赶驴', '辨别货物'],
      literacy: 45,
      reputation: ['走南闯北的商人', '认识很多人'],
      marriageStatus: 'married',
      kinshipId: 'merchant-kin',
      debt: 0,
      skills: new Map([
        ['讨价还价', 90],
        ['辨别货物', 80],
        ['赶驴', 65],
        ['读写', 45],
        ['观察', 75],
        ['社交', 70],
      ]),
      role: FamilyRole.PATRIARCH,
    },
    // 母亲 — 喇合（Rahab），35岁，记账/管理库存
    {
      id: 'rahab',
      name: '喇合',
      age: 35,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 65,
      maxStamina: 80,
      craft: ['记账', '纺织', '家务管理'],
      literacy: 40,
      reputation: ['会写字算数的女人'],
      marriageStatus: 'married',
      kinshipId: 'merchant-kin',
      debt: 0,
      skills: new Map([
        ['读写', 40],
        ['讨价还价', 60],
        ['纺织', 50],
        ['家务管理', 60],
        ['烹饪', 55],
      ]),
      role: FamilyRole.MATRIARCH,
    },
    // 长子 — 约珥（Joel），14岁，跟班学徒
    {
      id: 'joel',
      name: '约珥',
      age: 14,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 85,
      maxStamina: 95,
      craft: ['搬运', '赶驴学徒'],
      literacy: 35,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'merchant-kin',
      debt: 0,
      skills: new Map([
        ['赶驴', 35],
        ['搬运', 60],
        ['读写', 35],
        ['辨别货物', 25],
        ['体力劳动', 65],
      ]),
      role: FamilyRole.ELDER_SON,
    },
    // 长女 — 米利暗（Miriam-m），10岁
    {
      id: 'miriam-merchant',
      name: '米利暗',
      age: 10,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 70,
      maxStamina: 80,
      craft: ['家务'],
      literacy: 20,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'merchant-kin',
      debt: 0,
      skills: new Map([
        ['读写', 20],
        ['家务管理', 30],
        ['纺织', 15],
        ['观察', 40],
      ]),
      role: FamilyRole.ELDER_DAUGHTER,
    },
  ];
}

function createInitialResources(): FamilyResources {
  return {
    survival: {
      grain: 15,
      water: 30,
      oil: 6,
      fish: 4,
      salt: 8,
      firewood: 10,
      clothing: 5,
      shelterDurability: 60,
      livestockHealth: 50,  // 有一头驴
    },
    economic: {
      copperCoins: 7680,  // 60 denarii — 最有钱
      silverCoins: 8,
      tools: [
        { id: 'tool-scale-1', name: '贸易秤', durability: 85, maxDurability: 100, type: 'trade' },
        { id: 'tool-cart-1', name: '驴车', durability: 55, maxDurability: 100, type: 'transport' },
        { id: 'tool-seal-1', name: '商印', durability: 100, maxDurability: 100, type: 'trade' },
      ],
      inventory: [
        { id: 'inv-spice', name: '香料', quantity: 5, unit: '包', quality: 70 },
        { id: 'inv-cloth', name: '布匹', quantity: 8, unit: '匹', quality: 60 },
      ],
      pendingOrders: [],
    },
    social: {
      familyHonor: 50,
      neighborTrust: 45,    // 商人不太被信任
      elderApproval: 40,
      creditorPatience: new Map(),
    },
    ritual: {
      sabbathReadiness: 35,
      purityStatus: {
        isPure: true,
        impuritySources: [],
      },
      festivalReadiness: new Map(),
      charityReputation: 30,
      synagogueParticipation: 30,  // 经常出门
    },
  };
}

export function createTravelingMerchantFamily(startDate: GameDate): Family {
  let dueDate = startDate;
  for (let i = 0; i < 20; i++) {
    dueDate = advanceToNextDay(dueDate);
  }

  return {
    id: 'family-merchant',
    name: '提比哩亚行商之家',
    members: createMembers(),
    resources: createInitialResources(),
    reputation: ['行商', '走遍加利利'],
    debts: [
      {
        creditorId: 'wholesale-dealer',
        amount: 10,
        dueDate,
        collateral: '驴车',
        status: 'active',
      },
    ],
  };
}
