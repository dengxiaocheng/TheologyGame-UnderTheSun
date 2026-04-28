// src/engine/events/marketDispute.ts — 任务：集市纠纷

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createMarketDisputeQuest(): QuestDefinition {
  return {
    id: 'quest-market-dispute',
    title: '集市纠纷',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      return days === 8;
    },
    description:
      '集市上爆发了争吵。一个外乡商人指控本地陶匠以斯帖的父亲缺斤少两。' +
      '围观的人越来越多，有人开始推搡。你刚好路过，必须决定是否介入。',
    choices: [
      {
        id: 'mediate',
        text: '出面调停 — 把双方叫到一起，用秤重新量一遍',
        consequences: [
          { layer: 'social', field: 'familyHonor', delta: 3, description: '公正调停赢得尊重（家族荣誉 +3）' },
          { layer: 'social', field: 'neighborTrust', delta: 4, description: '大家感激你化解矛盾（邻里信任 +4）' },
        ],
      },
      {
        id: 'side_local',
        text: '帮本地陶匠说话 — 外乡人别来我们这里撒野',
        consequences: [
          { layer: 'social', field: 'neighborTrust', delta: 2, description: '本地人感激你（邻里信任 +2）' },
          { layer: 'social', field: 'familyHonor', delta: -2, description: '外人觉得你偏袒（家族荣誉 -2）' },
        ],
      },
      {
        id: 'stay_out',
        text: '不关我的事，绕道走开',
        consequences: [
          { layer: 'social', field: 'neighborTrust', delta: -1, description: '有人觉得你冷漠（邻里信任 -1）' },
        ],
      },
      {
        id: 'call_elder',
        text: '去找长老亚拿尼亚来裁决',
        consequences: [
          { layer: 'social', field: 'elderApproval', delta: 3, description: '尊重长老权威（长老认可 +3）' },
          { layer: 'social', field: 'neighborTrust', delta: 1, description: '通过正当途径解决问题' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'mediate') {
        logs.push('  → 重新称量后发现是秤不准，双方都有道理。各退一步，和平收场。');
        addReputationTag(state, '公正调解人', '集市纠纷', 4);
        logs.push('  → 获得声誉标签：「公正调解人」');
      } else if (choiceId === 'side_local') {
        logs.push('  → 外乡商人愤愤离去，说再也不来这个村了。');
        logs.push('  → 陶匠一家很感激你，但气氛有点尴尬。');
      } else if (choiceId === 'stay_out') {
        logs.push('  → 后来听说纠纷升级了，有人受了伤。你心里有些不安。');
      } else if (choiceId === 'call_elder') {
        logs.push('  → 亚拿尼亚判定双方各让一步。虽然费了些时间，但公平解决了。');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '集市风波总算平息了。在这小地方，名声比什么都重要。'];
    },
  };
}
