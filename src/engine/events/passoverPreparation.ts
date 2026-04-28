// src/engine/events/passoverPreparation.ts — 任务：逾越节准备

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { HebrewMonth } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

export function createPassoverPreparationQuest(): QuestDefinition {
  return {
    id: 'quest-passover-preparation',
    title: '逾越节准备',
    triggerCondition: (state: GameState): boolean => {
      // 尼散月10-13日（逾越节前夕）
      return state.date.month === HebrewMonth.NISAN && state.date.day >= 10 && state.date.day <= 13;
    },
    description:
      '逾越节快到了！这是犹太人最重要的节日，纪念出埃及的奇迹。' +
      '家里需要准备无酵饼、苦菜、羊羔（或至少有鱼），还要彻底打扫房屋除去酵。' +
      '一切都要在日落前准备妥当。',
    choices: [
      {
        id: 'full_preparation',
        text: '全力准备 — 买最好的食材，打扫每一个角落',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -320, description: '采购食材花费 320 铜币' },
          { layer: 'survival', field: 'grain', delta: 3, description: '储备了无酵饼用的面粉' },
          { layer: 'ritual', field: 'festivalReadiness', delta: 15, description: '准备充分（节期准备 +15）' },
          { layer: 'ritual', field: 'sabbathReadiness', delta: 5, description: '虔诚的逾越节准备（安息日准备 +5）' },
        ],
      },
      {
        id: 'simple_preparation',
        text: '简单准备 — 力所能及就好，心意到了就行',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -128, description: '基本食材 128 铜币' },
          { layer: 'ritual', field: 'festivalReadiness', delta: 8, description: '基本准备完成' },
        ],
      },
      {
        id: 'community_seder',
        text: '和邻舍一起过 — 大家凑份子办一场共同的逾越节宴',
        consequences: [
          { layer: 'economic', field: 'copperCoins', delta: -192, description: '出了 192 铜币的份子' },
          { layer: 'social', field: 'neighborTrust', delta: 5, description: '共同过节增进了感情' },
          { layer: 'ritual', field: 'synagogueParticipation', delta: 5, description: '集体守节更加虔诚' },
          { layer: 'social', field: 'familyHonor', delta: 2, description: '好客受到称赞' },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      if (choiceId === 'full_preparation') {
        logs.push('  → 家里焕然一新，每一个角落都打扫干净了。');
        logs.push('  → 孩子们围着桌子问：「今夜与别的夜晚有什么不同？」');
        logs.push('  → 你开始讲述出埃及的故事——这是每个逾越节的传承。');
        addReputationTag(state, '虔诚守节', '逾越节', 4);
      } else if (choiceId === 'simple_preparation') {
        logs.push('  → 虽然简朴，但家里的气氛依然庄重。苦菜蘸盐水，提醒着为奴的苦涩。');
        logs.push('  → 祖母说：「在旷野的时候，连这些都没有。」');
      } else if (choiceId === 'community_seder') {
        logs.push('  → 十几家人聚在院子里，长桌排了一排又一排。');
        logs.push('  → 祭司以利亚撒领头祝谢，老人和孩子们轮流朗读出埃及记。');
        logs.push('  → 这一夜，整个村庄像一个大家庭。');
        addReputationTag(state, '团结之心', '逾越节', 5);
      }
      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '「在这夜，耶和华用大能的手将我们从埃及领出来。」——出埃及记 13:14'];
    },
  };
}
