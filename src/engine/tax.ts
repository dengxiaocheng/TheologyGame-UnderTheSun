// src/engine/tax.ts — 税收系统

import type { GameDate } from '../models/time.js';
import type { GameState } from '../models/gameState.js';

/** 税种 */
export enum TaxType {
  DIRECT = 'DIRECT',           // 直接税（按月缴纳）
  TOLL = 'TOLL',               // 通行税（关卡）
  MARKET = 'MARKET',           // 市场税（买卖10%）
  INFORMAL = 'INFORMAL',       // 非正式摊派
}

/** 税种中文名 */
export const TAX_TYPE_NAMES: Record<TaxType, string> = {
  [TaxType.DIRECT]: '直接税',
  [TaxType.TOLL]: '通行税',
  [TaxType.MARKET]: '市场税',
  [TaxType.INFORMAL]: '非正式摊派',
};

/** 单条纳税记录 */
export interface TaxRecord {
  type: TaxType;
  amount: number;         // 铜币
  date: GameDate;
  description: string;
  paid: boolean;
}

/** 税收状态 */
export interface TaxState {
  records: TaxRecord[];
  /** 直接税上次缴纳的月份 */
  lastDirectTaxMonth: number;
  /** 直接税上次缴纳的年份 */
  lastDirectTaxYear: number;
  /** 直接税金额（渔民家庭：2第纳尔/月 = 256铜币） */
  directTaxAmount: number;
  /** 通行税金额（通过关卡时） */
  tollTaxAmount: number;
  /** 市场税税率 */
  marketTaxRate: number;
}

/** 创建初始税收状态 */
export function createInitialTaxState(): TaxState {
  return {
    records: [],
    lastDirectTaxMonth: 0,
    lastDirectTaxYear: 0,
    directTaxAmount: 256,  // 2第纳尔 = 256铜币
    tollTaxAmount: 32,     // 1/4第纳尔 = 32铜币
    marketTaxRate: 0.1,    // 10%
  };
}

/** 检查是否应缴纳直接税（每月一次，当月尚未缴纳） */
export function checkDirectTaxDue(state: TaxState, date: GameDate): boolean {
  return date.month !== state.lastDirectTaxMonth || date.year !== state.lastDirectTaxYear;
}

/** 缴纳直接税 */
export function payDirectTax(taxState: TaxState, gameState: GameState): { success: boolean; amount: number; message: string } {
  if (!checkDirectTaxDue(taxState, gameState.date)) {
    return { success: false, amount: 0, message: '本月已缴纳直接税。' };
  }
  const amount = taxState.directTaxAmount;
  const resources = gameState.family.resources;

  if (resources.economic.copperCoins < amount) {
    // 不足额，记录欠税
    const record: TaxRecord = {
      type: TaxType.DIRECT,
      amount,
      date: { ...gameState.date },
      description: '直接税（欠缴）',
      paid: false,
    };
    taxState.records.push(record);
    return { success: false, amount, message: `直接税 ${amount} 铜币不足，已记为欠税！` };
  }

  resources.economic.copperCoins -= amount;
  taxState.lastDirectTaxMonth = gameState.date.month;
  taxState.lastDirectTaxYear = gameState.date.year;
  const record: TaxRecord = {
    type: TaxType.DIRECT,
    amount,
    date: { ...gameState.date },
    description: '直接税',
    paid: true,
  };
  taxState.records.push(record);
  return { success: true, amount, message: `已缴纳直接税 ${amount} 铜币。` };
}

/** 缴纳通行税（移动到关卡时调用） */
export function payTollTax(taxState: TaxState, gameState: GameState): { success: boolean; amount: number; message: string } {
  const amount = taxState.tollTaxAmount;
  const resources = gameState.family.resources;

  if (resources.economic.copperCoins < amount) {
    const record: TaxRecord = {
      type: TaxType.TOLL,
      amount,
      date: { ...gameState.date },
      description: '通行税（欠缴）',
      paid: false,
    };
    taxState.records.push(record);
    return { success: false, amount, message: `通行税 ${amount} 铜币不足，已记为欠税！` };
  }

  resources.economic.copperCoins -= amount;
  const record: TaxRecord = {
    type: TaxType.TOLL,
    amount,
    date: { ...gameState.date },
    description: '通行税',
    paid: true,
  };
  taxState.records.push(record);
  return { success: true, amount, message: `已缴纳通行税 ${amount} 铜币。` };
}

/** 计算市场税（买卖时调用） */
export function applyMarketTax(taxState: TaxState, gameState: GameState, tradeAmount: number): { taxAmount: number; netAmount: number } {
  const taxAmount = Math.ceil(tradeAmount * taxState.marketTaxRate);
  const record: TaxRecord = {
    type: TaxType.MARKET,
    amount: taxAmount,
    date: { ...gameState.date },
    description: `市场税（交易额 ${tradeAmount} 铜币）`,
    paid: true,
  };
  taxState.records.push(record);
  return { taxAmount, netAmount: tradeAmount - taxAmount };
}

/** 触发非正式摊派（随机事件） */
export function triggerInformalTax(taxState: TaxState, gameState: GameState, description: string, amount: number): { success: boolean; amount: number; message: string } {
  const resources = gameState.family.resources;

  if (resources.economic.copperCoins < amount) {
    const record: TaxRecord = {
      type: TaxType.INFORMAL,
      amount,
      date: { ...gameState.date },
      description: `${description}（欠缴）`,
      paid: false,
    };
    taxState.records.push(record);
    return { success: false, amount, message: `${description}：需要 ${amount} 铜币，不足！已记为欠税。` };
  }

  resources.economic.copperCoins -= amount;
  const record: TaxRecord = {
    type: TaxType.INFORMAL,
    amount,
    date: { ...gameState.date },
    description,
    paid: true,
  };
  taxState.records.push(record);
  return { success: true, amount, message: `${description}：已缴纳 ${amount} 铜币。` };
}

/** 获取税收摘要 */
export function getTaxSummary(taxState: TaxState): string {
  const lines: string[] = [];
  lines.push('── 税收记录 ──');

  const totalPaid = taxState.records.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0);
  const totalUnpaid = taxState.records.filter(r => !r.paid).reduce((sum, r) => sum + r.amount, 0);

  lines.push(`已缴总额：${totalPaid} 铜币`);
  if (totalUnpaid > 0) {
    lines.push(`欠税总额：${totalUnpaid} 铜币 ⚠`);
  }

  // 最近5条记录
  const recent = taxState.records.slice(-5);
  if (recent.length > 0) {
    lines.push('');
    lines.push('最近记录：');
    for (const r of recent) {
      const status = r.paid ? '✓' : '✗';
      lines.push(`  ${status} ${TAX_TYPE_NAMES[r.type]} — ${r.amount} 铜币 — ${r.description}`);
    }
  } else {
    lines.push('暂无纳税记录。');
  }

  return lines.join('\n');
}

/** 生成随机非正式摊派（确定性伪随机） */
export function maybeGenerateInformalTax(taxState: TaxState, date: GameDate): { trigger: boolean; description: string; amount: number } {
  const dayTotal = date.year * 400 + date.month * 31 + date.day;
  // 约每10天触发一次
  if (dayTotal % 10 !== 0) return { trigger: false, description: '', amount: 0 };

  const descriptions = [
    { description: '村庄修缮费', amount: 48 },
    { description: '会堂维护捐', amount: 32 },
    { description: '道路整修费', amount: 64 },
    { description: '守卫加派费', amount: 40 },
    { description: '水井清理捐', amount: 24 },
  ];

  const idx = dayTotal % descriptions.length;
  return { trigger: true, ...descriptions[idx] };
}
