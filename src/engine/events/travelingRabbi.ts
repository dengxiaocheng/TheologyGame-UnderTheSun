// src/engine/events/travelingRabbi.ts — 任务：游行拉比

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createTravelingRabbiQuest(): QuestDefinition {
  return {
    id: 'quest-traveling-rabbi',
    title: '游行拉比',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      return days === 10;
    },
    description:
      '一个年轻的拉比带着几个门徒来到了迦百农。' +
      '他在湖边讲道，说话带着权柄，不像那些文士。' +
      '很多人围过去听，包括一些渔民和税吏。你要不要也去看看？',
    choices: [
      {
        id: 'go_listen',
        text: '去听他讲道 — 好奇心驱使你去看看',
        consequences: [
          { layer: 'ritual', field: 'sabbathReadiness', delta: 3, description: '被他的教导触动（安息日准备 +3）' },
          { layer: 'social', field: 'neighborTrust', delta: 3, description: '和村民一起听道，增进了关系（邻里信任 +3）' },
        ],
      },
      {
        id: 'stay_away',
        text: '不去 — 新来的传道人太多了，谁知道真的假的',
        consequences: [
          { layer: 'social', field: 'elderApproval', delta: 2, description: '谨慎的态度被长老认可（长老认可 +2）' },
        ],
      },
      {
        id: 'invite_home',
        text: '邀请他到家里吃饭 — 款待客旅是律法的要求',
        consequences: [
          { layer: 'survival', field: 'grain', delta: -2, description: '准备了一顿像样的饭菜（粮食 -2）' },
          { layer: 'ritual', field: 'charityReputation', delta: 5, description: '慷慨款待传道人（慈善名声 +5）' },
          { layer: 'social', field: 'familyHonor', delta: 4, description: '家人因好客受到称赞（家族荣誉 +4）' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'go_listen') {
        logs.push('  → 他讲的比喻让你印象深刻——撒种的、芥菜种的、还有失羊的。');
        logs.push('  → 周围的人都很安静，似乎每个人都在心里想着什么。');
      } else if (choiceId === 'stay_away') {
        logs.push('  → 你远远看了一眼就回家了。也许以后会后悔错过这次机会。');
      } else if (choiceId === 'invite_home') {
        logs.push('  → 拉比欣然接受了邀请。饭桌上他讲述了许多天国的事，孩子们听得入迷。');
        addReputationTag(state, '好客之家', '游行拉比', 5);
        logs.push('  → 获得声誉标签：「好客之家」');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '这位拉比在迦百农待了几天就离开了，但他的话在很多人心里种下了种子。'];
    },
  };
}
