// src/engine/actionPoints.ts — 行动点系统

import type { Family, FamilyMember } from '../models/family.js';
import type { FamilyResources } from '../models/resources.js';
import { HealthStatus } from '../models/family.js';
import { HebrewMonth } from '../models/time.js';

/** 行动点预算 */
export interface ActionPointBudget {
  total: number;
  spent: number;
  remaining: number;
  allocations: Map<string, number>;
}

/** 统计可用劳力：13岁以上按体力/100计算，13岁以下贡献0.3倍 */
export function getAvailableLabor(family: Family): number {
  let labor = 0;
  for (const m of family.members) {
    if (m.health === HealthStatus.CRITICAL) continue;
    const base = m.stamina / 100;
    labor += m.age >= 13 ? base : base * 0.3;
  }
  return labor;
}

/** 健康系数映射 */
const HEALTH_FACTOR: Record<HealthStatus, number> = {
  [HealthStatus.HEALTHY]: 1.0,
  [HealthStatus.TIRED]: 0.8,
  [HealthStatus.SICK]: 0.4,
  [HealthStatus.INJURED]: 0.3,
  [HealthStatus.CRITICAL]: 0.1,
};

/** 所有成员平均健康系数 */
export function getHealthFactor(family: Family): number {
  if (family.members.length === 0) return 0;
  const sum = family.members.reduce(
    (acc, m) => acc + (HEALTH_FACTOR[m.health] ?? 0), 0
  );
  return sum / family.members.length;
}

/** 按月份返回季节效率 */
export function getSeasonFactor(month: HebrewMonth): number {
  switch (month) {
    case HebrewMonth.NISAN:
    case HebrewMonth.IYYAR:
      return 0.9; // 春耕
    case HebrewMonth.SIVAN:
    case HebrewMonth.TAMMUZ:
      return 1.1; // 夏收
    case HebrewMonth.AV:
    case HebrewMonth.ELUL:
      return 1.0; // 夏末
    case HebrewMonth.TISHREI:
    case HebrewMonth.CHESHVAN:
      return 1.1; // 秋收
    case HebrewMonth.KISLEV:
    case HebrewMonth.SHEVAT:
      return 0.7; // 冬雨
    case HebrewMonth.TEVET:
      return 0.7; // 隆冬
    case HebrewMonth.ADAR:
      return 0.8; // 晚冬
    case HebrewMonth.ADAR_II:
      return 0.8; // 闰月
    default:
      return 1.0;
  }
}

/** 计算每日行动点 */
export function calculateDailyActionPoints(family: Family, month: HebrewMonth): number {
  const labor = getAvailableLabor(family);
  const health = getHealthFactor(family);
  const season = getSeasonFactor(month);
  return Math.floor(labor * health * season);
}
