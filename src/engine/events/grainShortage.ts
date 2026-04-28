// src/engine/events/grainShortage.ts — 任务：粮荒

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createGrainShortageQuest(): QuestDefinition {
  return {
    id: 'quest-grain-shortage',
    title: '粮荒来袭',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      return days === 7 && state.family.resources.survival.grain < 15;
    },
    description:
      '村里的粮仓告急。今年春季雨水不足，麦子收成只有往年的六成。' +
      '你家的存粮也快见底了，必须想办法度过这个难关。',
    choices: [
      {
        id: 'buy_market',
        text: '去市场买粮 — 价格已经涨了，但还是最稳妥的办法',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -384, description: '高价购粮，花了 384 铜币（+6份粮食）' },
          { layer: 'survival', field: 'grain', delta: 6, description: '买了 6 份粮食' },
        ],
      },
      {
        id: 'forage',
        text: '上山采集野粮 — 免费但辛苦，可能遇到野兽',
        consequences: [
          { layer: 'survival', field: 'grain', delta: 3, description: '采了些野麦和橡子（+3份粮食）' },
          { layer: 'social', field: 'familyHonor', delta: -3, description: '家人觉得去捡野粮有失体面（家族荣誉 -3）' },
        ],
      },
      {
        id: 'borrow_grain',
        text: '向邻舍借粮 — 欠人情但能渡过难关',
        consequences: [
          { layer: 'survival', field: 'grain', delta: 5, description: '约拿借了 5 份粮食给你' },
          { layer: 'social', field: 'neighborTrust', delta: -2, description: '大家都有困难，借粮引起微词（邻里信任 -2）' },
        ],
      },
      {
        id: 'ration',
        text: '严格配给 — 全家减半口粮，省着吃',
        consequences: [
          { layer: 'survival', field: 'grain', delta: 2, description: '省出了 2 份余粮' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'buy_market') {
        logs.push('  → 虽然肉疼，但家里的粮缸终于满了些。');
      } else if (choiceId === 'forage') {
        logs.push('  → 孩子们嘟囔着说橡子不好吃，但至少饿不死了。');
        addReputationTag(state, '节俭持家', '粮荒', 3);
      } else if (choiceId === 'borrow_grain') {
        addReputationTag(state, '欠粮债', '粮荒', 4);
        logs.push('  → 获得声誉标签：「欠粮债」——记得还。');
      } else if (choiceId === 'ration') {
        logs.push('  → 全家人都瘦了一圈，但没有挨饿。');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '粮荒暂时过去了，但谁知道下一个季节会怎样。'];
    },
  };
}
