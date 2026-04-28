// src/engine/events/lostSheep.ts — 任务：迷失的羊

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed, TimeOfDay } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

/**
 * 创建"迷失的羊"任务 — 第9天黎明触发
 * 邻居以巴弗提的羊走失，请求帮助。邻里信任 > 40 时触发。
 */
export function createLostSheepQuest(): QuestDefinition {
  return {
    id: 'quest-lost-sheep',
    title: '迷失的羊',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      if (days !== 9) return false;
      if (state.date.timeOfDay !== TimeOfDay.DAWN) return false;
      return state.family.resources.social.neighborTrust > 40;
    },
    description:
      '天刚蒙蒙亮，牧羊人西门急匆匆跑来告诉你：' +
      '有一只羊不见了！昨晚数羊的时候还都在，今早发现少了一只。' +
      '附近有野狗出没的传闻，山路上也有盗贼的踪迹。' +
      '这只羊是家里不多的财产之一，你该怎么处理？',
    choices: [
      {
        id: 'search_alone',
        text: '亲自去寻找 — 放下手头的事，上山找羊',
        consequences: [
          {
            layer: 'survival',
            field: 'livestockHealth',
            delta: 15,
            description: '找到了羊，虽然受了点伤但无大碍（牲畜健康 +15）',
          },
          {
            layer: 'social',
            field: 'familyHonor',
            delta: 5,
            description: '亲自寻找失羊，家人敬佩（家族荣耀 +5）',
          },
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: -64,
            description: '耽误了一天工，少了收入（铜币 -64）',
          },
        ],
      },
      {
        id: 'send_son',
        text: '派西门去找 — 让少年去锻炼一下',
        consequences: [
          {
            layer: 'survival',
            field: 'livestockHealth',
            delta: 10,
            description: '西门花了半天找到了羊（牲畜健康 +10）',
          },
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: -32,
            description: '西门耽误了半天学徒时间（铜币 -32）',
          },
        ],
      },
      {
        id: 'ask_neighbors',
        text: '请邻舍帮忙 — 发动社区力量寻找',
        consequences: [
          {
            layer: 'survival',
            field: 'livestockHealth',
            delta: 12,
            description: '邻舍帮忙在附近的山坡找到了羊（牲畜健康 +12）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: 6,
            description: '邻里互助，关系更紧密（邻里信任 +6）',
          },
          {
            layer: 'survival',
            field: 'grain',
            delta: -1,
            description: '请邻舍吃了一顿饭表示感谢（谷物 -1）',
          },
        ],
      },
      {
        id: 'accept_loss',
        text: '算了，就当是损失 — 把精力放在其他事上',
        consequences: [
          {
            layer: 'survival',
            field: 'livestockHealth',
            delta: -10,
            description: '那只羊再也没有回来（牲畜健康 -10）',
          },
          {
            layer: 'social',
            field: 'familyHonor',
            delta: -5,
            description: '家人对放弃寻找感到不满（家族荣耀 -5）',
          },
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: 128,
            description: '专心工作，额外赚了些钱（铜币 +128）',
          },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];

      if (choiceId === 'search_alone') {
        addReputationTag(state, '好牧人', '迷失的羊', 8);
        logs.push('  → 获得声誉标签：「好牧人」');
        logs.push('  → 那只羊见到你时咩咩叫着，好像在说"你终于来了"。');
      } else if (choiceId === 'send_son') {
        const shimon = state.family.members.find(m => m.id === 'shimon');
        if (shimon) {
          const skill = shimon.skills.get('捕鱼') ?? 0;
          shimon.skills.set('观察', Math.min(100, (shimon.skills.get('观察') ?? 30) + 5));
          shimon.skills.set('体力劳动', Math.min(100, skill + 2));
          logs.push('  → 西门学会了在野外追踪的技巧');
        }
      } else if (choiceId === 'ask_neighbors') {
        addReputationTag(state, '邻里互助', '迷失的羊', 4);
        logs.push('  → 获得声誉标签：「邻里互助」');
      } else if (choiceId === 'accept_loss') {
        logs.push('  → 你告诉自己，只是一只羊而已。但心里总觉得不对。');
      }

      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '太阳升起，新的一天开始了。'];
    },
  };
}
