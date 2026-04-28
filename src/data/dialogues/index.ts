// src/data/dialogues/index.ts — 对话数据统一出口

export { createFishermenDialogues } from './fishermenDialogues.js';
export { createMarketDialogues } from './marketDialogues.js';
export { createVillageDialogues } from './villageDialogues.js';
export { createCraftsmanDialogues } from './craftsmanDialogues.js';

import { createFishermenDialogues } from './fishermenDialogues.js';
import { createMarketDialogues } from './marketDialogues.js';
import { createVillageDialogues } from './villageDialogues.js';
import { createCraftsmanDialogues } from './craftsmanDialogues.js';
import type { DialogueDefinition } from '../../engine/dialogue.js';

/** 批量创建所有对话定义 */
export function createAllDialogues(): DialogueDefinition[] {
  return [
    ...createFishermenDialogues(),
    ...createMarketDialogues(),
    ...createVillageDialogues(),
    ...createCraftsmanDialogues(),
  ];
}
