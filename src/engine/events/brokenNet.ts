// src/engine/events/brokenNet.ts — 任务：破网与税关

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed, TimeOfDay } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

/** 创建"破网与税关"任务 */
export function createBrokenNetQuest(): QuestDefinition {
  return {
    id: 'quest-broken-net-tax',
    title: '破网与税关',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      if (days !== 3) return false;
      if (state.date.timeOfDay !== TimeOfDay.DAWN) return false;
      const net = state.family.resources.economic.tools.find(
        t => t.type === 'fishing' && t.durability < 70,
      );
      return net !== undefined;
    },
    description:
      '清晨你来到湖边准备撒网，却发现主渔网有几个大洞，' +
      '几乎无法使用。同时，税吏马太的助手在码头边等著收取这个月的税款。' +
      '你必须做出选择——今天怎么过？',
    choices: [
      {
        id: 'self_repair',
        text: '自己修网 — 花一整天修补渔网，无法正常捕鱼',
        consequences: [
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: 32,
            description: '修网间隙捡了些零碎，收入微薄（+32铜币）',
          },
          {
            layer: 'survival',
            field: 'grain',
            delta: -1,
            description: '全家消耗了 1 份粮食',
          },
        ],
      },
      {
        id: 'borrow_net',
        text: '借邻居约拿的网 — 可以捕鱼，但欠了人情',
        consequences: [
          {
            layer: 'survival',
            field: 'fish',
            delta: 5,
            description: '用借来的网捕了 5 条鱼（中等收入）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: 5,
            description: '约拿慷慨借网，邻里关系加深（邻里信任 +5）',
          },
          {
            layer: 'survival',
            field: 'grain',
            delta: -1,
            description: '全家消耗了 1 份粮食',
          },
        ],
      },
      {
        id: 'tax_help',
        text: '找税吏马太帮忙 — 他也许能通融，但代价是什么？',
        consequences: [
          {
            layer: 'survival',
            field: 'fish',
            delta: 8,
            description: '马太安排了一个好渔场，收获丰厚（+8鱼）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: -10,
            description: '邻舍看到你和税吏走得近，议论纷纷（邻里信任 -10）',
          },
          {
            layer: 'survival',
            field: 'grain',
            delta: -1,
            description: '全家消耗了 1 份粮食',
          },
        ],
      },
      {
        id: 'short_labor',
        text: '不打鱼，去打短工 — 稳定收入但错过湖边行情',
        consequences: [
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: 192,
            description: '做了一天短工，赚了 192 铜币（约1.5第纳流斯）',
          },
          {
            layer: 'survival',
            field: 'grain',
            delta: -1,
            description: '全家消耗了 1 份粮食',
          },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];

      if (choiceId === 'self_repair') {
        const net = state.family.resources.economic.tools.find(
          t => t.type === 'fishing' && t.durability < t.maxDurability,
        );
        if (net) {
          net.durability = Math.min(net.maxDurability, net.durability + 20);
          logs.push('  → 主渔网修好了些（耐久 +20）');
        }
      } else if (choiceId === 'borrow_net') {
        addReputationTag(state, '欠约拿人情', '破网事件', 5);
        logs.push('  → 获得声誉标签：「欠约拿人情」');
      } else if (choiceId === 'tax_help') {
        addReputationTag(state, '税关熟人', '破网事件', 8);
        logs.push('  → 获得声誉标签：「税关熟人」');
        logs.push('  → 马太暗示了湖东有个好渔场...');
      }

      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '这一天就这样过去了。明天又是新的一天。'];
    },
  };
}
