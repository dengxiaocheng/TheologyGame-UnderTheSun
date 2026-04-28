// src/engine/events/brokenMillstone.ts — 任务：磨石损坏

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createBrokenMillstoneQuest(): QuestDefinition {
  return {
    id: 'quest-broken-millstone',
    title: '磨石碎了',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      return days === 9;
    },
    description:
      '灾难！上磨石裂成了两半——这可是全家磨面的命根子。' +
      '没有磨石就没法把麦子磨成面粉，也就做不了饼。' +
      '石匠亚设说可以修，但需要花钱和时间。你也考虑是不是干脆买块新的。',
    choices: [
      {
        id: 'repair',
        text: '请石匠修补 — 省钱但修过的磨石效率会降低',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -128, description: '修理费 128 铜币' },
          { layer: 'social', field: 'neighborTrust', delta: 1, description: '支持本地石匠的生意' },
        ],
      },
      {
        id: 'buy_new',
        text: '买一块新磨石 — 贵但一劳永逸',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -384, description: '新磨石 384 铜币（3 第纳流斯）' },
          { layer: 'social', field: 'familyHonor', delta: 2, description: '大手笔显示了实力' },
        ],
      },
      {
        id: 'borrow_neighbor',
        text: '借邻居的磨石先用 — 省钱但欠人情',
        consequences: [
          { layer: 'social', field: 'neighborTrust', delta: -2, description: '人家也不太乐意借（邻里信任 -2）' },
          { layer: 'survival', field: 'grain', delta: -1, description: '来回搬耽误了时间' },
        ],
      },
      {
        id: 'hand_grind',
        text: '用石臼手工捣 — 费时费力但不花钱',
        consequences: [
          { layer: 'survival', field: 'grain', delta: -1, description: '效率太低，浪费了一些粮食' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'repair') {
        logs.push('  → 石匠亚设花了半天修好了磨石。虽然留了道裂纹，但勉强能用。');
        logs.push('  → 「下次小心点，」亚设擦着手说，「别往里面扔石子。」');
      } else if (choiceId === 'buy_new') {
        logs.push('  → 新磨石又大又沉，两个成年人才搬得动。磨出来的面又细又白。');
        addReputationTag(state, '殷实之家', '磨石', 2);
      } else if (choiceId === 'borrow_neighbor') {
        logs.push('  → 邻居虽然不太情愿，还是借了。你暗暗记着下次要还这个人情。');
        addReputationTag(state, '欠磨石人情', '磨石', 2);
      } else if (choiceId === 'hand_grind') {
        logs.push('  → 妻子和孩子们轮流捣了一个下午，手臂都酸了。日子还得过。');
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '磨石修好了（或换了新的），生活继续。在加利利，一块磨石就是一家人的生计。'];
    },
  };
}
