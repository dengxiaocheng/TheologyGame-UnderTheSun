// src/engine/events/romanPatrol.ts — 任务：罗马巡逻

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createRomanPatrolQuest(): QuestDefinition {
  return {
    id: 'quest-roman-patrol',
    title: '罗马巡逻队',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      return days === 12;
    },
    description:
      '一队罗马士兵出现在村口，领头的是辅助军兵卢基乌斯。' +
      '他们声称在搜捕一个逃亡的叛乱分子，要求每户配合搜查。' +
      '你注意到士兵们看起来并不太认真——也许是借机索要贿赂？',
    choices: [
      {
        id: 'cooperate',
        text: '主动配合搜查 — 让他们进来，免得惹麻烦',
        consequences: [
          { layer: 'social', field: 'familyHonor', delta: -1, description: '家人不太舒服但还是配合了' },
          { layer: 'social', field: 'neighborTrust', delta: -2, description: '有人觉得你太顺从了' },
        ],
      },
      {
        id: 'bribe',
        text: '给些好处让他们快点走',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -256, description: '塞了 256 铜币给队长' },
          { layer: 'social', field: 'neighborTrust', delta: 2, description: '帮全村免了一场骚扰（邻里信任 +2）' },
        ],
      },
      {
        id: 'resist',
        text: '声明你的权利 — 我们是守法居民，没有搜查令不能进屋',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -128, description: '被罚了 128 铜币「妨碍公务」' },
          { layer: 'social', field: 'familyHonor', delta: 3, description: '村里人佩服你的勇气（家族荣誉 +3）' },
          { layer: 'social', field: 'neighborTrust', delta: 3, description: '你替大家出了口气' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'cooperate') {
        logs.push('  → 士兵们翻了几个箱子就走了，没找到什么。你松了一口气，但心里有些窝囊。');
      } else if (choiceId === 'bribe') {
        logs.push('  → 卢基乌斯收了钱，挥挥手带着队伍走了。邻居们悄悄向你竖起大拇指。');
        addReputationTag(state, '应对罗马人', '罗马巡逻', 3);
      } else if (choiceId === 'resist') {
        logs.push('  → 卢基乌斯冷笑了一声：「好吧，罗马公民。」他罚了款，但确实没进屋搜查。');
        addReputationTag(state, '有骨气的', '罗马巡逻', 4);
        logs.push('  → 获得声誉标签：「有骨气的」');
        logs.push('  → 但长老私下提醒你：和罗马人硬碰硬，迟早要吃亏。');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '罗马人的阴影永远笼罩着加利利。活着，就要学会和它们共处。'];
    },
  };
}
