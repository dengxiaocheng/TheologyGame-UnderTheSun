// src/data/families/priestlyFamily.ts — 祭司家庭初始数据

import type { Family, FamilyMember, DebtRecord } from '../../models/family.js';
import type { FamilyResources } from '../../models/resources.js';
import type { GameDate } from '../../models/time.js';
import { Gender, HealthStatus, FamilyRole } from '../../models/family.js';

function createMembers(): FamilyMember[] {
  return [
    // 父亲 — 以利亚撒（Eleazar），50岁，祭司
    {
      id: 'eleazar',
      name: '以利亚撒',
      age: 50,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 65,
      maxStamina: 80,
      craft: ['献祭', '教导律法', '裁决纠纷'],
      literacy: 75,
      reputation: ['亚伦后裔', '敬虔的祭司', '精通律法'],
      marriageStatus: 'married',
      kinshipId: 'priestly-kin',
      debt: 0,
      skills: new Map([
        ['读写', 75],
        ['律法知识', 90],
        ['教导', 80],
        ['献祭礼仪', 95],
        ['希伯来语', 85],
        ['裁决', 70],
      ]),
      role: FamilyRole.PATRIARCH,
    },
    // 母亲 — 西坡拉（Zipporah），44岁
    {
      id: 'zipporah',
      name: '西坡拉',
      age: 44,
      gender: Gender.FEMALE,
      health: HealthStatus.HEALTHY,
      stamina: 60,
      maxStamina: 75,
      craft: ['教导女子', '洁净条例', '家务管理'],
      literacy: 50,
      reputation: ['祭司之妻', '熟悉洁净条例'],
      marriageStatus: 'married',
      kinshipId: 'priestly-kin',
      debt: 0,
      skills: new Map([
        ['读写', 50],
        ['律法知识', 60],
        ['洁净条例', 85],
        ['家务管理', 70],
        ['教导', 65],
        ['烹饪', 60],
      ]),
      role: FamilyRole.MATRIARCH,
    },
    // 祖父 — 非尼哈（Phinehas），75岁，退任祭司
    {
      id: 'phinehas',
      name: '非尼哈',
      age: 75,
      gender: Gender.MALE,
      health: HealthStatus.TIRED,
      stamina: 35,
      maxStamina: 50,
      craft: ['记忆传统', '解经', '祝福'],
      literacy: 80,
      reputation: ['年老的祭司', '活的传统'],
      marriageStatus: 'widowed',
      kinshipId: 'priestly-kin',
      debt: 0,
      skills: new Map([
        ['读写', 80],
        ['律法知识', 95],
        ['口述传统', 90],
        ['解经', 85],
        ['祝福', 90],
        ['调解', 70],
      ]),
      role: FamilyRole.GRANDPARENT,
    },
    // 长子 — 亚比户（Abihu），20岁，祭司学徒
    {
      id: 'abihu',
      name: '亚比户',
      age: 20,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 80,
      maxStamina: 95,
      craft: ['祭司学徒', '抄写'],
      literacy: 65,
      reputation: ['年轻有学问'],
      marriageStatus: 'betrothed',
      kinshipId: 'priestly-kin',
      debt: 0,
      skills: new Map([
        ['读写', 65],
        ['律法知识', 50],
        ['献祭礼仪', 40],
        ['希伯来语', 60],
        ['抄写', 55],
        ['教导', 30],
      ]),
      role: FamilyRole.ELDER_SON,
    },
    // 次子 — 以斯拉（Ezra），12岁
    {
      id: 'ezra',
      name: '以斯拉',
      age: 12,
      gender: Gender.MALE,
      health: HealthStatus.HEALTHY,
      stamina: 75,
      maxStamina: 85,
      craft: ['学习'],
      literacy: 40,
      reputation: [],
      marriageStatus: 'single',
      kinshipId: 'priestly-kin',
      debt: 0,
      skills: new Map([
        ['读写', 40],
        ['希伯来语', 35],
        ['律法知识', 20],
        ['背诵', 50],
        ['观察', 45],
      ]),
      role: FamilyRole.ELDER_SON,
    },
  ];
}

function createInitialResources(): FamilyResources {
  return {
    survival: {
      grain: 35,
      water: 45,
      oil: 8,
      fish: 5,
      salt: 6,
      firewood: 18,
      clothing: 6,
      shelterDurability: 85,
      livestockHealth: 30,
    },
    economic: {
      copperCoins: 5120,  // 40 denarii — 较宽裕
      silverCoins: 5,
      tools: [
        { id: 'tool-scroll-1', name: '经卷', durability: 90, maxDurability: 100, type: 'scholar' },
        { id: 'tool-ink-1', name: '墨水与笔', durability: 70, maxDurability: 100, type: 'scholar' },
        { id: 'tool-altar-kit', name: '便携祭坛器具', durability: 85, maxDurability: 100, type: 'ritual' },
      ],
      inventory: [],
      pendingOrders: [],
    },
    social: {
      familyHonor: 75,
      neighborTrust: 70,
      elderApproval: 80,
      creditorPatience: new Map(),
    },
    ritual: {
      sabbathReadiness: 80,
      purityStatus: {
        isPure: true,
        impuritySources: [],
      },
      festivalReadiness: new Map([
        ['passover', 60],
        ['pentecost', 40],
      ]),
      charityReputation: 60,
      synagogueParticipation: 85,
    },
  };
}

export function createPriestlyFamily(startDate: GameDate): Family {
  return {
    id: 'family-priestly',
    name: '迦百农祭司之家',
    members: createMembers(),
    resources: createInitialResources(),
    reputation: ['祭司家族', '亚伦后裔', '精通律法'],
    debts: [],
  };
}
