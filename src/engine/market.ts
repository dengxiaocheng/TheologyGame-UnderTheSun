// src/engine/market.ts — 集市交易系统

import type { GameState } from '../models/gameState.js';
import type { HebrewMonth } from '../models/time.js';

// ---- 商品定义 ----

export interface MarketGood {
  id: string;
  name: string;
  /** 基础价格（铜币） */
  basePrice: number;
  /** 单位 */
  unit: string;
  /** 季节因子：月份 -> 乘数 */
  seasonFactors: Partial<Record<HebrewMonth, number>>;
}

// ---- 可交易商品 ----

const MARKET_GOODS: MarketGood[] = [
  {
    id: 'grain',
    name: '谷物',
    basePrice: 16,
    unit: '份',
    seasonFactors: { 1: 1.2, 3: 0.8, 7: 1.3 }, // 收获季便宜，冬春贵
  },
  {
    id: 'fish',
    name: '鱼',
    basePrice: 12,
    unit: '条',
    seasonFactors: { 5: 0.7, 6: 0.7 }, // 夏天鱼多
  },
  {
    id: 'salt',
    name: '盐',
    basePrice: 24,
    unit: '份',
    seasonFactors: {},
  },
  {
    id: 'oil',
    name: '灯油',
    basePrice: 32,
    unit: '瓶',
    seasonFactors: { 7: 1.3, 9: 1.4 }, // 节期期间贵
  },
  {
    id: 'firewood',
    name: '柴火',
    basePrice: 8,
    unit: '捆',
    seasonFactors: { 10: 1.5, 11: 1.5 }, // 冬天贵
  },
  {
    id: 'clothing',
    name: '衣物',
    basePrice: 128,
    unit: '套',
    seasonFactors: {},
  },
  {
    id: 'water',
    name: '清水',
    basePrice: 4,
    unit: '壶',
    seasonFactors: { 4: 1.3, 5: 1.5 }, // 旱季贵
  },
];

/** 获取所有可交易商品 */
export function getMarketGoods(): MarketGood[] {
  return MARKET_GOODS;
}

/** 查找商品 */
export function findGood(query: string): MarketGood | undefined {
  return MARKET_GOODS.find(g => g.id === query || g.name === query);
}

// ---- 定价 ----

/** 计算当前价格（含季节和供需因子） */
export function calculatePrice(good: MarketGood, month: HebrewMonth, supplyLevel: number): number {
  const seasonFactor = good.seasonFactors[month] ?? 1.0;
  // supplyLevel: 0=极度短缺, 50=正常, 100=过剩
  const supplyFactor = supplyLevel > 50
    ? 1.0 - (supplyLevel - 50) / 200  // 供给充足 → 降价
    : 1.0 + (50 - supplyLevel) / 100; // 供给不足 → 涨价
  return Math.round(good.basePrice * seasonFactor * supplyFactor);
}

/** 估算供给水平（基于库存量） */
export function estimateSupply(goodId: string, state: GameState): number {
  const surv = state.family.resources.survival;
  const econ = state.family.resources.economic;

  switch (goodId) {
    case 'grain': return Math.min(100, surv.grain * 3);
    case 'fish': return Math.min(100, surv.fish * 10);
    case 'salt': return Math.min(100, surv.salt * 15);
    case 'oil': return Math.min(100, surv.oil * 15);
    case 'firewood': return Math.min(100, surv.firewood * 5);
    case 'clothing': return Math.min(100, surv.clothing * 20);
    case 'water': return Math.min(100, surv.water * 2);
    default: return 50;
  }
}

// ---- MarketEngine ----

export class MarketEngine {
  /** 显示集市价目表 */
  getPriceList(state: GameState): string {
    const lines: string[] = [];
    lines.push('╔══════════════════════════════════════╗');
    lines.push('║         集 市 价 目 表               ║');
    lines.push('╚══════════════════════════════════════╝');
    lines.push('');

    const month = state.date.month;
    const funds = state.family.resources.economic;

    for (const good of MARKET_GOODS) {
      const supply = estimateSupply(good.id, state);
      const buyPrice = calculatePrice(good, month, supply);
      const sellPrice = Math.round(buyPrice * 0.7); // 卖出价 = 70%
      lines.push(`  ${good.name}(${good.unit})  买: ${buyPrice}铜  卖: ${sellPrice}铜`);
    }

    const denarii = funds.silverCoins + funds.copperCoins / 128;
    lines.push('');
    lines.push(`  你的资金: ${funds.copperCoins}铜币 (${denarii.toFixed(1)}第纳流斯)`);
    lines.push('');
    lines.push('使用「buy <商品名> <数量>」购买');
    lines.push('使用「sell <商品名> <数量>」出售');
    return lines.join('\n');
  }

  /** 购买商品 */
  buy(state: GameState, goodQuery: string, quantity: number): { success: boolean; logs: string[] } {
    const logs: string[] = [];
    const good = findGood(goodQuery);

    if (!good) {
      return { success: false, logs: [`找不到商品「${goodQuery}」。可交易商品：${MARKET_GOODS.map(g => g.name).join('、')}`] };
    }

    if (quantity <= 0) {
      return { success: false, logs: ['数量必须大于 0。'] };
    }

    const month = state.date.month;
    const supply = estimateSupply(good.id, state);
    const unitPrice = calculatePrice(good, month, supply);
    const totalCost = unitPrice * quantity;

    if (state.family.resources.economic.copperCoins < totalCost) {
      return { success: false, logs: [`资金不足。需要 ${totalCost} 铜币，你只有 ${state.family.resources.economic.copperCoins} 铜币。`] };
    }

    // 扣款
    state.family.resources.economic.copperCoins -= totalCost;

    // 入库
    this.addGoodToInventory(state, good.id, quantity);

    logs.push(`购买了 ${quantity} ${good.unit}${good.name}，花费 ${totalCost} 铜币（单价 ${unitPrice}）`);
    return { success: true, logs };
  }

  /** 出售商品 */
  sell(state: GameState, goodQuery: string, quantity: number): { success: boolean; logs: string[] } {
    const logs: string[] = [];
    const good = findGood(goodQuery);

    if (!good) {
      return { success: false, logs: [`找不到商品「${goodQuery}」。可交易商品：${MARKET_GOODS.map(g => g.name).join('、')}`] };
    }

    if (quantity <= 0) {
      return { success: false, logs: ['数量必须大于 0。'] };
    }

    // 检查库存
    const available = this.getGoodQuantity(state, good.id);
    if (available < quantity) {
      return { success: false, logs: [`库存不足。你有 ${available} ${good.unit}${good.name}，想卖 ${quantity}。`] };
    }

    const month = state.date.month;
    const supply = estimateSupply(good.id, state);
    const unitPrice = Math.round(calculatePrice(good, month, supply) * 0.7); // 卖出价
    const totalRevenue = unitPrice * quantity;

    // 出库
    this.removeGoodFromInventory(state, good.id, quantity);

    // 收款
    state.family.resources.economic.copperCoins += totalRevenue;

    logs.push(`出售了 ${quantity} ${good.unit}${good.name}，获得 ${totalRevenue} 铜币（单价 ${unitPrice}）`);
    return { success: true, logs };
  }

  /** 获取商品在家庭库存中的数量 */
  private getGoodQuantity(state: GameState, goodId: string): number {
    const surv = state.family.resources.survival;
    switch (goodId) {
      case 'grain': return Math.floor(surv.grain);
      case 'fish': return surv.fish;
      case 'salt': return surv.salt;
      case 'oil': return surv.oil;
      case 'firewood': return surv.firewood;
      case 'clothing': return surv.clothing;
      case 'water': return surv.water;
      default: return 0;
    }
  }

  /** 将商品加入家庭库存 */
  private addGoodToInventory(state: GameState, goodId: string, quantity: number): void {
    const surv = state.family.resources.survival;
    switch (goodId) {
      case 'grain': surv.grain += quantity; break;
      case 'fish': surv.fish += quantity; break;
      case 'salt': surv.salt += quantity; break;
      case 'oil': surv.oil += quantity; break;
      case 'firewood': surv.firewood += quantity; break;
      case 'clothing': surv.clothing += quantity; break;
      case 'water': surv.water += quantity; break;
    }
  }

  /** 从家庭库存中移除商品 */
  private removeGoodFromInventory(state: GameState, goodId: string, quantity: number): void {
    const surv = state.family.resources.survival;
    switch (goodId) {
      case 'grain': surv.grain -= quantity; break;
      case 'fish': surv.fish -= quantity; break;
      case 'salt': surv.salt -= quantity; break;
      case 'oil': surv.oil -= quantity; break;
      case 'firewood': surv.firewood -= quantity; break;
      case 'clothing': surv.clothing -= quantity; break;
      case 'water': surv.water -= quantity; break;
    }
  }
}
