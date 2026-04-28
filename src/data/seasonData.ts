// src/data/seasonData.ts — 季节与月份对照表

import { HebrewMonth } from '../models/time.js';

export interface SeasonInfo {
  name: string;
  factor: number;
  description: string;
  weather: string[];
}

export const SEASON_INFO: Record<number, SeasonInfo> = {
  [HebrewMonth.NISAN]: {
    name: '春季',
    factor: 0.9,
    description: '春耕时节，万物复苏',
    weather: ['温和', '偶有晚雨', '野花盛开'],
  },
  [HebrewMonth.IYYAR]: {
    name: '暮春',
    factor: 0.9,
    description: '干燥开始，大麦收获',
    weather: ['干燥', '气温回升', '无雨'],
  },
  [HebrewMonth.SIVAN]: {
    name: '初夏',
    factor: 1.1,
    description: '五旬节收获季',
    weather: ['干热', '小麦收获', '晴朗'],
  },
  [HebrewMonth.TAMMUZ]: {
    name: '盛夏',
    factor: 1.1,
    description: '炎热干燥，葡萄开始成熟',
    weather: ['炎热', '干燥', '无云'],
  },
  [HebrewMonth.AV]: {
    name: '盛夏',
    factor: 1.0,
    description: '一年中最热的月份',
    weather: ['极热', '干燥', '偶尔闷热'],
  },
  [HebrewMonth.ELUL]: {
    name: '夏末',
    factor: 1.0,
    description: '开始转凉，夏果采摘',
    weather: ['开始转凉', '早晨有露水', '无花果成熟'],
  },
  [HebrewMonth.TISHREI]: {
    name: '秋季',
    factor: 1.1,
    description: '秋雨将临，住棚节',
    weather: ['秋雨初降', '气温下降', '橄榄收获'],
  },
  [HebrewMonth.CHESHVAN]: {
    name: '深秋',
    factor: 1.1,
    description: '雨季正式开始',
    weather: ['多雨', '凉爽', '播种冬麦'],
  },
  [HebrewMonth.KISLEV]: {
    name: '冬季',
    factor: 0.7,
    description: '寒冷多雨，修殿节',
    weather: ['寒冷', '多雨', '偶有霜冻'],
  },
  [HebrewMonth.TEVET]: {
    name: '隆冬',
    factor: 0.7,
    description: '一年中最冷的月份',
    weather: ['最冷', '多雨', '偶有雪'],
  },
  [HebrewMonth.SHEVAT]: {
    name: '晚冬',
    factor: 0.7,
    description: '杏花开，春天将至',
    weather: ['仍冷', '杏花盛开', '雨渐少'],
  },
  [HebrewMonth.ADAR]: {
    name: '冬末初春',
    factor: 0.8,
    description: '普珥节，春天临近',
    weather: ['回暖', '仍有雨', '树木发芽'],
  },
  [HebrewMonth.ADAR_II]: {
    name: '闰月',
    factor: 0.8,
    description: '闰年额外月份',
    weather: ['仍冷', '多雨', '等待春天'],
  },
};
