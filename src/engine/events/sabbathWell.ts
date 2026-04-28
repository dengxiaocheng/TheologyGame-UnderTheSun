// src/engine/events/sabbathWell.ts — 任务：安息日的井边

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed, TimeOfDay } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

/** 创建"安息日的井边"任务 — 第5天上午触发 */
export function createSabbathWellQuest(): QuestDefinition {
  return {
    id: 'quest-sabbath-well',
    title: '安息日的井边',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      if (days !== 5) return false;
      if (state.date.timeOfDay !== TimeOfDay.MORNING) return false;
      if (state.family.resources.ritual.sabbathReadiness >= 60) return false;
      return true;
    },
    description:
      '明天是安息日，你来到村口的井边打水做准备。' +
      '老寡妇底波拉正吃力地提着水罐，她的仆人病了，无法帮忙。' +
      '井边还有几个人在等候，安息日的钟声即将敲响。' +
      '你只有有限的时间——怎么做？',
    choices: [
      {
        id: 'help_widow',
        text: '帮底波拉打水 — 牺牲自己的时间，但成全了诫命',
        consequences: [
          {
            layer: 'survival',
            field: 'water',
            delta: -3,
            description: '把自己的水分了一些给底波拉（水 -3）',
          },
          {
            layer: 'ritual',
            field: 'sabbathReadiness',
            delta: 15,
            description: '帮助寡妇，心中预备安息（安息日准备度 +15）',
          },
          {
            layer: 'ritual',
            field: 'charityReputation',
            delta: 10,
            description: '众人看到你的善行（施舍声誉 +10）',
          },
        ],
      },
      {
        id: 'rush_home',
        text: '赶快打水回家 — 安息日准备工作要紧',
        consequences: [
          {
            layer: 'survival',
            field: 'water',
            delta: 5,
            description: '打了足够的水带回家（水 +5）',
          },
          {
            layer: 'ritual',
            field: 'sabbathReadiness',
            delta: 8,
            description: '家中水缸满了，安息日无忧（安息日准备度 +8）',
          },
        ],
      },
      {
        id: 'share_with_all',
        text: '组织井边的人一起帮忙 — 让大家一起帮助需要的人',
        consequences: [
          {
            layer: 'survival',
            field: 'water',
            delta: 2,
            description: '大家一起打水，每人都有份（水 +2）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: 8,
            description: '邻舍们互相帮助，气氛融洽（邻里信任 +8）',
          },
          {
            layer: 'ritual',
            field: 'sabbathReadiness',
            delta: 12,
            description: '众人齐心，预备迎接安息（安息日准备度 +12）',
          },
          {
            layer: 'social',
            field: 'elderApproval',
            delta: 5,
            description: '长老们赞赏你的组织能力（长辈认可 +5）',
          },
        ],
      },
      {
        id: 'skip_water',
        text: '不打水了 — 省点力气，明天安息日少用水就好',
        consequences: [
          {
            layer: 'survival',
            field: 'water',
            delta: -2,
            description: '没有补充水，存量下降（水 -2）',
          },
          {
            layer: 'ritual',
            field: 'sabbathReadiness',
            delta: -5,
            description: '家里没水准备，心里不安（安息日准备度 -5）',
          },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];

      if (choiceId === 'help_widow') {
        addReputationTag(state, '善待寡妇', '安息日井边', 7);
        logs.push('  → 获得声誉标签：「善待寡妇」');
        logs.push('  → 底波拉祝福你说："愿耶和华赐福给你和你的家。"');
      } else if (choiceId === 'share_with_all') {
        addReputationTag(state, '井边召集人', '安息日井边', 6);
        logs.push('  → 获得声誉标签：「井边召集人」');
      } else if (choiceId === 'rush_home') {
        logs.push('  → 你匆匆赶回家，心里隐隐觉得忽略了什么。');
      } else if (choiceId === 'skip_water') {
        logs.push('  → 回到家，米利暗看着空空的水缸叹了口气。');
      }

      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '安息日即将到来，夜幕低垂。'];
    },
  };
}
