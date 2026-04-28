// src/engine/events/sickChild.ts — 任务：孩子生病

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createSickChildQuest(): QuestDefinition {
  return {
    id: 'quest-sick-child',
    title: '孩子的热病',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      return days === 5;
    },
    description:
      '最小的孩子半夜突然发起了高烧，额头烫得吓人。' +
      '妻子焦急万分，你必须立刻决定怎么处理。村里的接生婆哈拿说可能是疟疾。',
    choices: [
      {
        id: 'herbal_medicine',
        text: '找哈拿用草药治疗 — 便宜但见效慢',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -64, description: '草药费 64 铜币' },
          { layer: 'social', field: 'familyHonor', delta: 2, description: '信任村中传统医术（家族荣誉 +2）' },
        ],
      },
      {
        id: 'city_doctor',
        text: '去提比哩亚找希腊医生 — 贵但专业',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -512, description: '希腊医生收费 512 铜币（4 第纳流斯）' },
          { layer: 'social', field: 'elderApproval', delta: -3, description: '长老不赞成找外邦医生（长老认可 -3）' },
        ],
      },
      {
        id: 'prayer',
        text: '去会堂祈祷 — 求耶和华医治',
        consequences: [
          { layer: 'ritual', field: 'synagogueParticipation', delta: 5, description: '在会堂虔诚祈祷（会堂参与 +5）' },
          { layer: 'social', field: 'familyHonor', delta: 1, description: '虔诚的态度受到认可' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'herbal_medicine') {
        logs.push('  → 哈拿用了苦艾和薄荷的煎剂，第二天烧就退了些。孩子还需休息几天。');
        addReputationTag(state, '信赖草药', '治病', 2);
      } else if (choiceId === 'city_doctor') {
        logs.push('  → 希腊医生给了一瓶药水，当晚烧就退了。不过长老们对此有些看法……');
        addReputationTag(state, '崇洋医', '治病', -2);
      } else if (choiceId === 'prayer') {
        logs.push('  → 你在会堂跪了一整夜。第二天早上，孩子的烧奇迹般地退了。');
        addReputationTag(state, '虔诚信徒', '治病', 4);
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '孩子终于好了。这一夜让你明白了——健康比什么都重要。'];
    },
  };
}
