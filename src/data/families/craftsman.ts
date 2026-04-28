// src/data/families/craftsman.ts — 工匠家庭初始数据

import type { Family, FamilyMember, DebtRecord } from '../../models/family.js';
import type { FamilyResources } from '../../models/resources.js';
import type { GameDate } from '../../models/time.js';
import { Gender, HealthStatus, FamilyRole } from '../../models/family.js';
import { advanceToNextDay } from '../../models/time.js';

function createMembers(): FamilyMember[] {
  return [
    // 父亲 — 亚设（Asher），37岁，石匠/木匠
    {
      id: 'asher',
      name: '亚设',
      age: 37,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 80,
      maxStamina: 100,
      craft: ['石匠', '木匠', '建筑'],
      literacy: 25,
      reputation: ['手艺精湛', '承接过大户工程'],
      marriageStatus: 'married',
      kinshipId: 'craftsman-kin',
      debt: 0,
      skills: new Map([
        ['石匠', 85],
        ['木匠', 75],
        ['建筑', 70],
        ['体力劳动', 80],
        ['讨价还价', 55],
        ['读写', 25],
      ]),
      role: FamilyRole.PATRIARCH,
    },
    // 母亲 — 亚比该（Abigail），33岁，陶工
    {
      id: 'abigail',
      name: '亚比该',
      age: 33,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 70,
      maxStamina: 85,
      craft: ['陶器', '绘画', '家务管理'],
      literacy: 20,
      reputation: ['善于装饰陶器'],
      marriageStatus: 'married',
      kinshipId: 'craftsman-kin',
      debt: 0,
      skills: new Map([
        ['陶器', 80],
        ['绘画', 60],
        ['烹饪', 60],
        ['家务管理', 65],
        ['读写', 20],
      ]),
      role: FamilyRole.MATRIARCH,
    },
    // 长子 — 拿单（Nathan），15岁，学徒
    {
      id: 'nathan',
      name: '拿单',
      age: 15,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 90,
      maxStamina: 100,
      craft: ['石匠学徒', '木匠学徒'],
      literacy: 30,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'craftsman-kin',
      debt: 0,
      skills: new Map([
        ['石匠', 35],
        ['木匠', 30],
        ['体力劳动', 65],
        ['读写', 30],
        ['观察', 50],
      ]),
      role: FamilyRole.ELDER_SON,
    },
    // 长女 — 路得（Ruth），11岁
    {
      id: 'ruth',
      name: '路得',
      age: 11,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 75,
      maxStamina: 85,
      craft: ['陶器学徒'],
      literacy: 15,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'craftsman-kin',
      debt: 0,
      skills: new Map([
        ['陶器', 25],
        ['绘画', 20],
        ['家务管理', 30],
        ['观察', 45],
      ]),
      role: FamilyRole.ELDER_DAUGHTER,
    },
  ];
}

function createInitialResources(): FamilyResources {
  return {
    survival: {
      grain: 25,
      water: 35,
      oil: 4,
      fish: 3,
      salt: 5,
      firewood: 12,
      clothing: 5,
      shelterDurability: 75,
      livestockHealth: 0,
    },
    economic: {
      copperCoins: 3840,  // 30 denarii — 比渔民宽裕
      silverCoins: 2,
      tools: [
        { id: 'tool-chisel-1', name: '石凿套装', durability: 75, maxDurability: 100, type: 'masonry' },
        { id: 'tool-hammer-1', name: '铁锤', durability: 80, maxDurability: 100, type: 'masonry' },
        { id: 'tool-saw-1', name: '木锯', durability: 65, maxDurability: 100, type: 'carpentry' },
        { id: 'tool-pottery-wheel', name: '陶轮', durability: 70, maxDurability: 100, type: 'pottery' },
      ],
      inventory: [],
      pendingOrders: [],
    },
    social: {
      familyHonor: 60,
      neighborTrust: 65,
      elderApproval: 55,
      creditorPatience: new Map(),
    },
    ritual: {
      sabbathReadiness: 50,
      purityStatus: {
        isPure: true,
        impuritySources: [],
      },
      festivalReadiness: new Map(),
      charityReputation: 40,
      synagogueParticipation: 50,
    },
  };
}

export function createCraftsmanFamily(startDate: GameDate): Family {
  let dueDate = startDate;
  for (let i = 0; i < 14; i++) {
    dueDate = advanceToNextDay(dueDate);
  }

  return {
    id: 'family-craftsman',
    name: '迦百农工匠之家',
    members: createMembers(),
    resources: createInitialResources(),
    reputation: ['工匠世家', '承接建筑工程'],
    debts: [
      {
        creditorId: 'stone-merchant',
        amount: 3,
        dueDate,
        collateral: '木锯',
        status: 'active',
      },
    ],
  };
}
