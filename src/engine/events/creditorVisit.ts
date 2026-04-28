// src/engine/events/creditorVisit.ts — 任务：债主登门

import type { GameState } from '../../models/gameState.js';
import type { QuestDefinition } from './types.js';
import { totalDaysElapsed, TimeOfDay, formatDate, advanceToNextDay } from '../../models/time.js';
import { addReputationTag } from '../reputation.js';

/** 创建"债主登门"任务 — 第11天上午，有未偿还的债务时触发 */
export function createCreditorVisitQuest(): QuestDefinition {
  return {
    id: 'quest-creditor-visit',
    title: '债主登门',
    triggerCondition: (state: GameState): boolean => {
      const days = totalDaysElapsed(state.date);
      if (days !== 11) return false;
      if (state.date.timeOfDay !== TimeOfDay.MORNING) return false;
      // 有活跃的债务
      return state.family.debts.some(d => d.status === 'active');
    },
    description:
      '天还没亮，一阵急促的敲门声把你惊醒。' +
      '税吏马太的代理人站在门口，身后跟着两个壮汉。' +
      '"这个月的税到期了，"他翻着账本说，"五第纳流斯，加上利息。"' +
      '他看了看你的备用渔网——那是抵押品。' +
      '你该怎么办？',
    choices: [
      {
        id: 'pay_full',
        text: '全额还清 — 倾尽所有还债',
        consequences: [
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: -640,
            description: '还清了5第纳流斯的债务（铜币 -640）',
          },
          {
            layer: 'social',
            field: 'familyHonor',
            delta: 8,
            description: '还清债务，堂堂正正（家族荣耀 +8）',
          },
        ],
      },
      {
        id: 'pay_partial',
        text: '先还一部分 — 恳求宽限余下的',
        consequences: [
          {
            layer: 'economic',
            field: 'copperCoins',
            delta: -384,
            description: '还了3第纳流斯，还欠2第纳流斯（铜币 -384）',
          },
          {
            layer: 'social',
            field: 'familyHonor',
            delta: 3,
            description: '至少还了一部分（家族荣耀 +3）',
          },
        ],
      },
      {
        id: 'request_extension',
        text: '请求延期 — 答应加倍偿还',
        consequences: [
          {
            layer: 'social',
            field: 'familyHonor',
            delta: -5,
            description: '拖欠债务，颜面无光（家族荣耀 -5）',
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
        id: 'default',
        text: '违约 — 抵押品被收走',
        consequences: [
          {
            layer: 'social',
            field: 'familyHonor',
            delta: -15,
            description: '违约失信，在街坊中抬不起头（家族荣耀 -15）',
          },
          {
            layer: 'social',
            field: 'neighborTrust',
            delta: -5,
            description: '邻舍们也对你有了戒心（邻里信任 -5）',
          },
        ],
      },
    ],
    onResolve: (choiceId: string, state: GameState): string[] => {
      const logs: string[] = [];
      const debt = state.family.debts.find(d => d.status === 'active');

      if (choiceId === 'pay_full') {
        if (debt) {
          debt.status = 'paid';
          logs.push('  → 债务已还清，抵押品保住了。');
          addReputationTag(state, '守信之人', '债主登门', 7);
          logs.push('  → 获得声誉标签：「守信之人」');
        }
      } else if (choiceId === 'pay_partial') {
        if (debt) {
          debt.amount = 2; // 还欠 2 第纳流斯
          // 延长还款期限 5 天
          let newDue = state.date;
          for (let i = 0; i < 5; i++) {
            newDue = advanceToNextDay(newDue);
          }
          debt.dueDate = newDue;
          logs.push(`  → 还了一部分，新的到期日：${formatDate(newDue)}`);
        }
      } else if (choiceId === 'request_extension') {
        if (debt) {
          // 延长 7 天，但增加利息
          debt.amount = Math.ceil(debt.amount * 1.3); // 加 30% 利息
          let newDue = state.date;
          for (let i = 0; i < 7; i++) {
            newDue = advanceToNextDay(newDue);
          }
          debt.dueDate = newDue;
          logs.push(`  → 延期到 ${formatDate(newDue)}，但利息增加（欠 ${debt.amount} 第纳流斯）`);
          // 降低债主耐心
          const patience = state.family.resources.social.creditorPatience;
          const currentPatience = patience.get('tax-collector-capernaum') ?? 70;
          patience.set('tax-collector-capernaum', Math.max(0, currentPatience - 15));
          logs.push('  → 债主的耐心降低了（债主耐心 -15）');
        }
        addReputationTag(state, '拖欠者', '债主登门', -5);
        logs.push('  → 获得声誉标签：「拖欠者」');
      } else if (choiceId === 'default') {
        if (debt) {
          debt.status = 'defaulted';
          // 收走抵押品（备用渔网）
          const collateralIdx = state.family.resources.economic.tools.findIndex(
            t => t.name === '备用渔网',
          );
          if (collateralIdx >= 0) {
            const removed = state.family.resources.economic.tools.splice(collateralIdx, 1);
            logs.push(`  → ${removed[0].name}被收走了。`);
          }
          // 大幅降低债主耐心
          const patience = state.family.resources.social.creditorPatience;
          patience.set('tax-collector-capernaum', 0);
          logs.push('  → 债主暴怒，以后恐怕不会再通融了。');
        }
        addReputationTag(state, '失信之人', '债主登门', -10);
        logs.push('  → 获得声誉标签：「失信之人」');
      }

      return logs;
    },
    onComplete: (_state: GameState): string[] => {
      return ['', '债主走了，留下你站在门口沉思。'];
    },
  };
}
