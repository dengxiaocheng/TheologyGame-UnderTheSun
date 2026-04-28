// src/engine/events/sabbathViolation.ts — 任务：安息日违规

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { addReputationTag } from '../reputation.js';

export function createSabbathViolationQuest(): QuestDefinition {
  return {
    id: 'quest-sabbath-violation',
    title: '安息日的试探',
    triggerCondition: (state: GameState): boolean => {
      return state.date.isSabbath;
    },
    description:
      '今天是安息日，律法禁止一切劳作。但你发现家里粮食已经不够撑到明天了，' +
      '而且邻居约拿的妻子突然生病，需要人帮忙打水。' +
      '守安息日的规矩很严，但现实的需求也很迫切……',
    choices: [
      {
        id: 'strict_observe',
        text: '严格遵守安息日 — 不做任何工，全家人一起祈祷',
        consequences: [
          { layer: 'ritual', field: 'sabbathReadiness', delta: 10, description: '虔诚守安息日（安息日准备 +10）' },
          { layer: 'social', field: 'elderApproval', delta: 5, description: '长老赞赏你的虔诚（长老认可 +5）' },
          { layer: 'survival', field: 'grain', delta: -1, description: '粮食短缺（粮食 -1）' },
        ],
      },
      {
        id: 'help_neighbor',
        text: '去帮约拿家打水 — 爱邻如己也是律法',
        consequences: [
          { layer: 'social', field: 'neighborTrust', delta: 5, description: '约拿一家万分感激（邻里信任 +5）' },
          { layer: 'ritual', field: 'sabbathReadiness', delta: -3, description: '在安息日做工（安息日准备 -3）' },
          { layer: 'social', field: 'elderApproval', delta: -2, description: '长老有些不满（长老认可 -2）' },
        ],
      },
      {
        id: 'discreet_work',
        text: '偷偷去干点活 — 天黑后没人看见',
        consequences: [
          { layer: 'survival', field: 'grain', delta: 2, description: '偷偷补了些活计（粮食 +2）' },
          { layer: 'ritual', field: 'sabbathReadiness', delta: -5, description: '违反安息日（安息日准备 -5）' },
          { layer: 'social', field: 'elderApproval', delta: -4, description: '若被发现后果严重（长老认可 -4）' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'strict_observe') {
        logs.push('  → 全家人安静地度过了安息日。孩子们背诵了示玛经文，祖母讲了一个出埃及的故事。');
        addReputationTag(state, '守安息日的', '安息日', 3);
      } else if (choiceId === 'help_neighbor') {
        logs.push('  → 约拿握着你的手说：「安息日行善，这才是神的本意。」');
        logs.push('  → 虽然有人嘀咕，但大多数人都理解你的选择。');
        addReputationTag(state, '怜悯之心', '安息日', 4);
      } else if (choiceId === 'discreet_work') {
        logs.push('  → 天黑后你悄悄干了些活。幸好没人看见，但心里总觉得不安。');
        logs.push('  → 祖母什么都没说，只是叹了口气。');
        addReputationTag(state, '安息日做工', '安息日', -3);
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '安息日过去了。律法和生活的张力，在这小村庄里每天都在上演。'];
    },
  };
}
