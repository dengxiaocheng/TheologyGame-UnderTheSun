// src/engine/events/widowWeaving.ts — 任务：寡妇的织布订单

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed, TimeOfDay } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

/** 创建"寡妇的织布订单"任务 — 第7天上午，有会纺织的成员触发 */
export function createWidowWeavingQuest(): QuestDefinition {
  return {
    id: 'quest-widow-weaving',
    title: '寡妇的织布订单',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      if (days !== 7) return false;
      if (state.date.timeOfDay !== TimeOfDay.MORNING) return false;
      const weaver = state.family.members.find(m =>
        m.craft.includes('纺织') || m.craft.includes('纺织学徒'),
      );
      return weaver !== undefined;
    },
    description:
      '邻舍寡妇米利暗（不是你妻子）来敲门。' +
      '她接了一笔织布订单，要为附近村庄的新娘做嫁衣，但她的纺锤坏了。' +
      '她问你妻子米利暗能否帮忙完成一部分织造，工钱对半分。' +
      '订单要求很急，必须在三天内交货。你该怎么做？',
    choices: [
      {
        id: 'full_help',
        text: '全力帮忙 — 让妻子放下手头的事，全力织布',
        consequences: [
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: 96,
            description: '工钱分成到账（+96铜币，约0.75第纳流斯）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: 10,
            description: '邻舍们称赞你们家的慷慨（邻里信任 +10）',
          },
          {
            layer: 'ritual',
            field: 'charityReputation',
            delta: 5,
            description: '帮助寡妇，善名远扬（施舍声誉 +5）',
          },
          {
            layer: 'survival',
            field: 'oil',
            delta: -2,
            description: '夜间加班织布，消耗了灯油（油 -2）',
          },
        ],
      },
      {
        id: 'partial_help',
        text: '帮一部分 — 妻子抽空帮忙，但不耽误家务',
        consequences: [
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: 48,
            description: '部分工钱分成（+48铜币）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: 5,
            description: '帮了忙但没帮完，邻里关系略有提升（邻里信任 +5）',
          },
        ],
      },
      {
        id: 'teach_craft',
        text: '教寡妇的女儿学织布 — 授人以渔',
        consequences: [
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: 8,
            description: '传授手艺，邻舍感激（邻里信任 +8）',
          },
          {
            layer: 'social',
            field: 'elderApproval',
            delta: 5,
            description: '长老们赞赏这种教育精神（长辈认可 +5）',
          },
        ],
      },
      {
        id: 'decline',
        text: '婉拒 — 家里事也忙不过来',
        consequences: [
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: -3,
            description: '寡妇失望离去，邻舍有些闲话（邻里信任 -3）',
          },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];

      if (choiceId === 'full_help') {
        addReputationTag(state, '织布善人', '寡妇订单', 5);
        logs.push('  → 获得声誉标签：「织布善人」');
        // 提升米利暗的织造技能
        const miriam = state.family.members.find(m => m.id === 'miriam');
        if (miriam) {
          const skill = miriam.skills.get('纺织') ?? 0;
          miriam.skills.set('纺织', Math.min(100, skill + 3));
          logs.push('  → 米利暗的纺织手艺更精湛了（纺织 +3）');
        }
      } else if (choiceId === 'teach_craft') {
        addReputationTag(state, '热心师傅', '寡妇订单', 6);
        logs.push('  → 获得声誉标签：「热心师傅」');
        const miriam = state.family.members.find(m => m.id === 'miriam');
        if (miriam) {
          const skill = miriam.skills.get('纺织') ?? 0;
          miriam.skills.set('纺织', Math.min(100, skill + 2));
          logs.push('  → 教学相长，米利暗也有所收获（纺织 +2）');
        }
      } else if (choiceId === 'decline') {
        logs.push('  → 寡妇叹了口气，转身离去。');
      }

      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '这件事就这样定下了。日子还要继续。'];
    },
  };
}
