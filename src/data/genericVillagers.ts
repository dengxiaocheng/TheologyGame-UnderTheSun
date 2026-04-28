// src/data/genericVillagers.ts — 40个普通村民

import type { NPCIdentity, NPCAttitude } from '../models/npc.js';
import { Gender } from '../models/family.js';

/** 村民职业池 */
const OCCUPATIONS = [
  '农夫', '牧人', '陶工', '织工', '石匠', '木匠',
  '铁匠', '染工', '鞣革匠', '磨坊工', '搬运工', '牧羊人',
  '葡萄园工', '橄榄园工', '渔民', '面包师', '制鞋匠', '理发师',
];

/** 村民名字池（男性） */
const MALE_NAMES = [
  '西门', '雅各', '犹大', '约瑟', '便雅悯', '以法莲',
  '迦勒', '但以理', '拿单', '撒母耳', '以利亚', '约沙法',
  '亚设', '流便', '西布伦', '以萨迦', '玛拿西', '非尼哈',
  '以斯拉', '尼希米', '哈该', '撒迦利', '玛拉基', '约珥',
];

/** 村民名字池（女性） */
const FEMALE_NAMES = [
  '撒拉', '利百加', '拉结', '利亚', '米利暗', '底波拉',
  '路得', '哈拿', '亚比该', '以斯帖', '约基别', '西坡拉',
  '拿俄米', '他玛', '喇合', '拔示巴',
];

/** 默认地点池 */
const LOCATIONS = [
  'bs-market', 'bs-courtyard', 'bs-well', 'bs-olive-grove',
  'bs-vineyard', 'bs-threshing-floor', 'gl-dock', 'gl-drying-racks',
];

/** 生成40个普通村民 */
export function createGenericVillagers(): NPCIdentity[] {
  const villagers: NPCIdentity[] = [];

  for (let i = 1; i <= 40; i++) {
    const isFemale = i % 3 === 0; // 约1/3女性
    const names = isFemale ? FEMALE_NAMES : MALE_NAMES;
    const nameIdx = (i * 7) % names.length;
    const age = 18 + ((i * 13) % 47); // 18-64
    const occupation = isFemale
      ? '家务'
      : OCCUPATIONS[(i * 11) % OCCUPATIONS.length];
    const location = LOCATIONS[(i * 3) % LOCATIONS.length];

    villagers.push({
      id: `villager-${String(i).padStart(2, '0')}`,
      name: names[nameIdx],
      gender: isFemale ? Gender.FEMALE : Gender.MALE,
      age,
      occupation,
      socialGroup: 'villager',
      language: ['aramaic'],
      location,
    });
  }

  return villagers;
}

/** 创建普通村民的默认态度（中等偏中性） */
export function createGenericVillagerAttitudes(villagerIds: string[]): Map<string, NPCAttitude> {
  const attitudes = new Map<string, NPCAttitude>();
  for (const id of villagerIds) {
    attitudes.set(id, {
      trust: 40 + Math.floor(Math.random() * 20),    // 40-59
      respect: 35 + Math.floor(Math.random() * 25),   // 35-59
      closeness: 20 + Math.floor(Math.random() * 30), // 20-49
      fear: 10 + Math.floor(Math.random() * 20),      // 10-29
      resentment: 5 + Math.floor(Math.random() * 15),  // 5-19
    });
  }
  return attitudes;
}
