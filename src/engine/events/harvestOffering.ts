// src/engine/events/harvestOffering.ts — 任务：初熟之物

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { HebrewMonth, totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createHarvestOfferingQuest(): QuestDefinition {
  return {
    id: 'quest-harvest-offering',
    title: '初熟之物',
    triggerCondition: (state: GameState): boolean => {
      // 西弯月（收获季节）前后触发
      return state.date.month === HebrewMonth.SIVAN && state.date.day >= 5 && state.date.day <= 10;
    },
    description:
      '收割的季节到了。按照律法，初熟的庄稼要献给耶和华，' +
      '带到会堂由祭司在坛前摇一摇。这是对神的感恩，也是对社区的见证。' +
      '今年的收成不算丰厚，但献祭的份额怎么定？',
    choices: [
      {
        id: 'generous_offering',
        text: '献上最好的十分之一 — 即使不富裕，也要把初熟的献给神',
        consequences: [
          { layer: 'survival', field: 'grain', delta: -4, description: '献上 4 份上好的粮食' },
          { layer: 'ritual', field: 'charityReputation', delta: 5, description: '慷慨的奉献受到赞赏（慈善名声 +5）' },
          { layer: 'social', field: 'familyHonor', delta: 3, description: '家族虔诚的名声传开了' },
        ],
      },
      {
        id: 'modest_offering',
        text: '献上基本的份额 — 尽到义务就好',
        consequences: [
          { layer: 'survival', field: 'grain', delta: -2, description: '献上 2 份粮食' },
          { layer: 'ritual', field: 'charityReputation', delta: 2, description: '完成了义务' },
        ],
      },
      {
        id: 'skip_offering',
        text: '今年就算了 — 家里实在不够，神会理解的',
        consequences: [
          { layer: 'ritual', field: 'sabbathReadiness', delta: -5, description: '未献初熟之物（安息日准备 -5）' },
          { layer: 'social', field: 'elderApproval', delta: -4, description: '长老对此很不满（长老认可 -4）' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'generous_offering') {
        logs.push('  → 祭司以利亚撒接过你的奉献，面露欣慰：「你的信心比这些麦子更宝贵。」');
        addReputationTag(state, '信心丰盛', '初熟之物', 5);
        logs.push('  → 获得声誉标签：「信心丰盛」');
      } else if (choiceId === 'modest_offering') {
        logs.push('  → 奉献虽不多，但祭司点了点头：「尽了本分就好。」');
      } else if (choiceId === 'skip_offering') {
        logs.push('  → 你没有去会堂。有些邻居投来了异样的目光……');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '收割季节过去了。律法说「你要记念耶和华你的神」，因为得货财的力量是他给的。'];
    },
  };
}
