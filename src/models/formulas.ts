// src/models/formulas.ts — 核心计算公式接口（具体实现留给后续阶段）

/** 行动力计算 */
export type ActionPointFormula = (
  availableLabor: number,
  healthFactor: number,
  seasonFactor: number,
) => number;

/** 市场价格计算 */
export type MarketPriceFormula = (
  basePrice: number,
  seasonDemand: number,
  roadCondition: number,
  taxFactor: number,
  bargainingResult: number,
) => number;

/** 声誉变化计算 */
export type ReputationDeltaFormula = (
  actionImpact: number,
  witnessCount: number,
  existingReputation: number,
  rumorSpreadFactor: number,
) => number;
