// src/data/dialogues/fishermenDialogues.ts — 渔民相关对话

import type { DialogueDefinition } from '../../engine/dialogue.js';
import { totalDaysElapsed } from '../../models/time.js';

export function createFishermenDialogues(): DialogueDefinition[] {
  return [
    // ── 约拿：渔获分享 ──
    {
      id: 'dlg-yonah-catch-share',
      npcId: 'npc-yonah-fisherman',
      condition: (state) => {
        const days = totalDaysElapsed(state.date);
        return days >= 2 && state.family.resources.survival.fish < 10;
      },
      priority: 10,
      lines: [
        { speaker: 'npc', text: '嘿！今天的收获不错，看你这边好像不太顺利？' },
        { speaker: 'npc', text: '我这里多几条鱼，要不要拿一些回去？这湖是大家的。' },
      ],
      responses: [
        {
          id: 'accept',
          text: '感谢你的好意，收下了',
          attitudeEffect: { trust: 3, closeness: 2 },
          resourceEffect: [{ layer: 'survival', field: 'fish', delta: 3 }],
          followUp: [
            { speaker: 'npc', text: '不客气，咱们渔民要互相帮衬。下次你丰收了再还我就好。' },
          ],
        },
        {
          id: 'decline',
          text: '谢谢，但我还能应付',
          attitudeEffect: { respect: 1 },
          followUp: [
            { speaker: 'npc', text: '好，硬气。不过真撑不住了就来找我，别逞强。' },
          ],
        },
        {
          id: 'trade',
          text: '不如用这些麦子跟你换？',
          attitudeEffect: { trust: 2 },
          resourceEffect: [
            { layer: 'survival', field: 'fish', delta: 3 },
            { layer: 'survival', field: 'grain', delta: -2 },
          ],
          followUp: [
            { speaker: 'npc', text: '成交！麦子正好给家里补补。公平交易最好。' },
          ],
        },
      ],
    },

    // ── 西门彼得：风暴警告 ──
    {
      id: 'dlg-shimon-storm-warning',
      npcId: 'npc-shimon-kepha',
      condition: (state) => {
        const days = totalDaysElapsed(state.date);
        return days >= 5;
      },
      priority: 15,
      lines: [
        { speaker: 'npc', text: '你看看西边的云，今天下午怕是有风浪。' },
        { speaker: 'npc', text: '我在这湖上打了二十年鱼，这种天色见多了——别傍晚出船。' },
      ],
      responses: [
        {
          id: 'heed',
          text: '听你的，今天就不出船了',
          attitudeEffect: { trust: 2, respect: 2 },
          followUp: [
            { speaker: 'npc', text: '聪明人。湖不会跑，但命只有一条。' },
          ],
        },
        {
          id: 'ignore',
          text: '我看天还行，再跑一趟',
          attitudeEffect: { respect: -1, trust: -1 },
          followUp: [
            { speaker: 'npc', text: '随你吧。要是翻船了，可别说我没提醒过。' },
          ],
        },
      ],
    },

    // ── 百尼基：腌鱼秘诀 ──
    {
      id: 'dlg-berenice-salting',
      npcId: 'npc-berenice-fishsalter',
      condition: (state) => state.family.resources.survival.fish >= 5,
      priority: 5,
      lines: [
        { speaker: 'npc', text: '看你鱼获不少。告诉你，腌鱼的关键是盐要多、风要干。' },
        { speaker: 'npc', text: '不然到了天热的时候，鱼还没卖出去就臭了，那一整季都白忙。' },
      ],
      responses: [
        {
          id: 'ask_tips',
          text: '能教教我具体的做法吗？',
          attitudeEffect: { trust: 2, closeness: 2 },
          resourceEffect: [{ layer: 'survival', field: 'salt', delta: -1 }],
          followUp: [
            { speaker: 'npc', text: '行，你拿点盐来，我手把手教你。一层盐一层鱼，压紧了放三天……' },
            { speaker: 'npc', text: '学好了这个手艺，鱼就不怕积压了。' },
          ],
        },
        {
          id: 'already_know',
          text: '谢谢，我家一直就是这么做的',
          attitudeEffect: { respect: 1 },
          followUp: [
            { speaker: 'npc', text: '是吗？那不错。不过我可是迦百农最好的腌鱼匠，有疑问随时来。' },
          ],
        },
      ],
    },

    // ── 亚居拉：织网技术 ──
    {
      id: 'dlg-aquila-net-repair',
      npcId: 'npc-aquila-netmaker',
      condition: () => true,
      priority: 3,
      lines: [
        { speaker: 'npc', text: '你的网最近怎么样？我看到你在码头补网的手法有点问题。' },
        { speaker: 'npc', text: '打结的方式不对，容易在拉网时松开，那样鱼就全跑了。' },
      ],
      responses: [
        {
          id: 'learn',
          text: '能教我正确的织法吗？',
          attitudeEffect: { trust: 3, closeness: 2 },
          followUp: [
            { speaker: 'npc', text: '当然！来，看好了——先绕两圈，从底下穿过来，再锁紧……' },
            { speaker: 'npc', text: '这种结叫双锁结，就算网线磨损了也不会松。' },
          ],
        },
        {
          id: 'buy',
          text: '能不能帮我织一张新网？多少钱？',
          attitudeEffect: { trust: 1 },
          resourceEffect: [{ layer: 'economic', field: 'copperCoins', delta: -320 }],
          followUp: [
            { speaker: 'npc', text: '一张好网三百二十铜币。三天后来拿，保证比你现在用的结实三倍。' },
          ],
        },
      ],
    },

    // ── 约拿：深度交谈 ──
    {
      id: 'dlg-yonah-deep-talk',
      npcId: 'npc-yonah-fisherman',
      condition: (state) => {
        const att = state.attitudes.get('npc-yonah-fisherman');
        return att !== undefined && att.trust >= 50;
      },
      priority: 8,
      lines: [
        { speaker: 'npc', text: '……你知不知道，我以前不在这里打鱼。' },
        { speaker: 'npc', text: '我年轻时在伯赛大，后来税太重了，一家人搬到迦百农来。' },
        { speaker: 'npc', text: '有时候半夜醒来，还会想起伯赛大的日出。那里……毕竟是家。' },
      ],
      responses: [
        {
          id: 'empathize',
          text: '我理解你的感受，离开家乡从来都不容易',
          attitudeEffect: { trust: 4, closeness: 3 },
          followUp: [
            { speaker: 'npc', text: '……谢谢。很少有人愿意听这些。' },
            { speaker: 'npc', text: '你是个好人。以后有什么事，尽管来找我。' },
          ],
        },
        {
          id: 'practical',
          text: '迦百农也不错，至少湖里的鱼够养家',
          attitudeEffect: { respect: 1 },
          followUp: [
            { speaker: 'npc', text: '嗯……你说得对。日子总要过下去的。' },
          ],
        },
      ],
    },
  ];
}
