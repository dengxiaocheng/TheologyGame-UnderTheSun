// src/data/dialogues/craftsmanDialogues.ts — 工匠/专业相关对话

import type { DialogueDefinition } from '../../engine/dialogue.js';

export function createCraftsmanDialogues(): DialogueDefinition[] {
  return [
    // ── 西拉：榨油坊 ──
    {
      id: 'dlg-silas-olive-press',
      npcId: 'npc-silas-olivepress',
      condition: (state) => state.family.resources.survival.oil < 5,
      priority: 8,
      lines: [
        { speaker: 'npc', text: '你的橄榄油快见底了吧？脸色干巴巴的，一看就是缺油。' },
        { speaker: 'npc', text: '我最近刚压了一批新油，品质上等。你若有橄榄果来加工，收你成本价。' },
      ],
      responses: [
        {
          id: 'buy_oil',
          text: '直接买一些吧，多少钱？',
          resourceEffect: [
            { layer: 'economic', field: 'copperCoins', delta: -96 },
            { layer: 'survival', field: 'oil', delta: 4 },
          ],
          attitudeEffect: { trust: 1 },
          followUp: [
            { speaker: 'npc', text: '九十六铜币四瓶。我的油绝对比推罗货实惠，尝尝就知道了。' },
          ],
        },
        {
          id: 'press_own',
          text: '下次收了橄榄来你这里加工',
          attitudeEffect: { closeness: 2, trust: 1 },
          followUp: [
            { speaker: 'npc', text: '好，记得选成熟的果子来。青果压出来的油太涩，不值当。' },
          ],
        },
      ],
    },

    // ── 以斯帖：陶器定制 ──
    {
      id: 'dlg-esther-pottery-order',
      npcId: 'npc-esther-potter',
      condition: () => true,
      priority: 4,
      lines: [
        { speaker: 'npc', text: '您好！我爹最近教我做了一种新的双耳瓶，特别适合存鱼酱。' },
        { speaker: 'npc', text: '瓶口小，不容易进空气。您要不要订几个？' },
      ],
      responses: [
        {
          id: 'order',
          text: '好，给我订三个',
          resourceEffect: [{ layer: 'economic', field: 'copperCoins', delta: -48 }],
          attitudeEffect: { trust: 2, closeness: 1 },
          followUp: [
            { speaker: 'npc', text: '太好了！三天后来拿。我会刻上您家的标记，不会搞混的。' },
          ],
        },
        {
          id: 'compliment',
          text: '你年纪不大，手艺倒不错',
          attitudeEffect: { trust: 1, respect: 2 },
          followUp: [
            { speaker: 'npc', text: '谢谢夸奖！我爹说我还差得远，但我觉得……已经不比镇上大人做的差了。' },
          ],
        },
      ],
    },

    // ── 犹大：负债农民 ──
    {
      id: 'dlg-judah-debt',
      npcId: 'npc-judah-debtor',
      condition: () => true,
      priority: 6,
      lines: [
        { speaker: 'npc', text: '唉……今年的收成又不好。地主说再交不上租就要收地了。' },
        { speaker: 'npc', text: '你知道吗，我家那块地已经种了三代了。要是被收走……我们全家去哪里？' },
      ],
      responses: [
        {
          id: 'sympathize',
          text: '太不公平了，三代人的心血怎么能说收就收',
          attitudeEffect: { trust: 3, closeness: 3, respect: 2 },
          followUp: [
            { speaker: 'npc', text: '你真的这么想？大部分人只会说「那是你跟地主的事」……' },
            { speaker: 'npc', text: '谢谢你。至少还有人理解。' },
          ],
        },
        {
          id: 'practical',
          text: '有没有想过换个生计？比如来镇上学门手艺',
          attitudeEffect: { respect: 1 },
          followUp: [
            { speaker: 'npc', text: '手艺？我都三十三了，谁还肯收我这个年纪的学徒？' },
            { speaker: 'npc', text: '而且地没了，也就没了根。没了根的人……什么都不是。' },
          ],
        },
        {
          id: 'lend',
          text: '我可以借你一些钱应急',
          attitudeEffect: { trust: 4, closeness: 3, respect: 2 },
          resourceEffect: [{ layer: 'economic', field: 'copperCoins', delta: -320 }],
          followUp: [
            { speaker: 'npc', text: '你……你真的愿意帮我？我不知道该怎么报答。' },
            { speaker: 'npc', text: '我会还的，一定还。你是我的恩人。' },
          ],
        },
      ],
    },

    // ── 亚设：牧童的忠告 ──
    {
      id: 'dlg-asher-flock-tip',
      npcId: 'npc-asher-shepherd',
      condition: (state) => state.family.resources.survival.livestockHealth > 0,
      priority: 5,
      lines: [
        { speaker: 'npc', text: '你家那只羊最近看着有点蔫儿，是不是没驱虫？' },
        { speaker: 'npc', text: '我爷爷教我一个法子——用苦艾煮水给羊喝，管用。' },
      ],
      responses: [
        {
          id: 'thanks',
          text: '谢谢你，回头就试试',
          attitudeEffect: { trust: 2, closeness: 1 },
          resourceEffect: [{ layer: 'survival', field: 'livestockHealth', delta: 5 }],
          followUp: [
            { speaker: 'npc', text: '不客气。羊好了记得告诉我，我也放心。' },
          ],
        },
        {
          id: 'pay',
          text: '能帮我一起弄吗？给你点报酬',
          attitudeEffect: { trust: 2, respect: 1 },
          resourceEffect: [
            { layer: 'economic', field: 'copperCoins', delta: -32 },
            { layer: 'survival', field: 'livestockHealth', delta: 8 },
          ],
          followUp: [
            { speaker: 'npc', text: '行！走，现在就去。这种事不能拖。' },
          ],
        },
      ],
    },

    // ── 约阿希姆：大户管家 ──
    {
      id: 'dlg-joachim-steward-offer',
      npcId: 'npc-joachim-steward',
      condition: (state) => state.family.resources.economic.copperCoins > 1000,
      priority: 9,
      lines: [
        { speaker: 'npc', text: '最近我家主人有一批货要从提比哩亚运过来，缺靠谱的人手。' },
        { speaker: 'npc', text: '看你做事还算勤快，要不要接这个活？报酬从优。' },
      ],
      responses: [
        {
          id: 'accept_job',
          text: '好，我接了',
          attitudeEffect: { trust: 2, respect: 2 },
          resourceEffect: [{ layer: 'economic', field: 'copperCoins', delta: 256 }],
          followUp: [
            { speaker: 'npc', text: '好。后天一早在码头集合，带上你家的车。活干好了，以后还有更多。' },
          ],
        },
        {
          id: 'decline',
          text: '谢谢，但我最近自己的事都忙不过来',
          attitudeEffect: { respect: -1 },
          followUp: [
            { speaker: 'npc', text: '可惜了。这机会不是常有的。你改主意了随时来找我。' },
          ],
        },
      ],
    },
  ];
}
