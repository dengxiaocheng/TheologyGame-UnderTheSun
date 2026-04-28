// src/engine/events/betrothalProposal.ts — 任务：婚约提亲

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createBetrothalProposalQuest(): QuestDefinition {
  return {
    id: 'quest-betrothal-proposal',
    title: '婚约提亲',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      if (days !== 14) return false;
      // 需要有未婚的女儿
      return state.family.members.some(m => m.age >= 12 && m.age <= 18 && m.gender === 'female' && m.marriageStatus === 'single');
    },
    description:
      '邻村的一个体面人家托媒人来提亲了。对方是迦百农南边的一个葡萄园主的儿子，' +
      '年纪相当，家境殷实。但彩礼的数额和婚期的安排还需要商量。' +
      '这关系到女儿一生的幸福和两家的体面。',
    choices: [
      {
        id: 'accept_generous',
        text: '大方答应 — 不计较多要彩礼，女儿的幸福最重要',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: 640, description: '收到聘礼 640 铜币（5 第纳流斯）' },
          { layer: 'social', field: 'familyHonor', delta: 5, description: '两家人都很满意（家族荣誉 +5）' },
          { layer: 'social', field: 'neighborTrust', delta: 3, description: '喜事让全村高兴' },
        ],
      },
      {
        id: 'negotiate',
        text: '讨价还价 — 多要点彩礼，毕竟是嫁女儿',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: 960, description: '谈到了 960 铜币（7.5 第纳流斯）' },
          { layer: 'social', field: 'familyHonor', delta: 2, description: '彩礼丰厚，但对方有点不高兴' },
          { layer: 'social', field: 'neighborTrust', delta: -1, description: '有人说你太精明了' },
        ],
      },
      {
        id: 'refuse',
        text: '婉拒 — 孩子还小，再等等',
        consequences: [
          { layer: 'social', field: 'familyHonor', delta: -2, description: '拒绝了体面人家，有些不合礼数' },
          { layer: 'social', field: 'elderApproval', delta: -2, description: '长老觉得你太挑剔' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'accept_generous') {
        logs.push('  → 女儿害羞地低下了头，但嘴角是藏不住的笑意。');
        addReputationTag(state, '开明之家', '婚约', 3);
        logs.push('  → 获得声誉标签：「开明之家」');
      } else if (choiceId === 'negotiate') {
        logs.push('  → 媒人笑着摇头：「你可真是精明人。」但最终答应了这个数。');
        logs.push('  → 妻子悄悄说：「太多了会不会让人觉得我们在卖女儿？」');
      } else if (choiceId === 'refuse') {
        logs.push('  → 媒人有些意外，但还是礼貌地告辞了。女儿什么都没说，回了自己的房间。');
        logs.push('  → 也许将来会有更好的婚事……也许不会。');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '婚姻大事，在这小村庄里，关系到两个家族的未来。'];
    },
  };
}
