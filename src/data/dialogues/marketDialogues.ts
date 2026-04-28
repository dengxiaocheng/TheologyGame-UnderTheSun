// src/data/dialogues/marketDialogues.ts — 市场交易相关对话

import type { DialogueDefinition } from '../../engine/dialogue.js';

export function createMarketDialogues(): DialogueDefinition[] {
  return [
    // ── 马太：税收催缴 ──
    {
      id: 'dlg-matthew-tax-reminder',
      npcId: 'npc-matthew-tax',
      condition: (state) => state.family.resources.economic.copperCoins > 2000,
      priority: 12,
      lines: [
        { speaker: 'npc', text: '哎，等一下。你这个月的税还没交吧？' },
        { speaker: 'npc', text: '罗马人的规矩你也知道，逾期是要加罚的。我可以帮你通融几天，但你得给我个准话。' },
      ],
      responses: [
        {
          id: 'pay_now',
          text: '现在就交，省得麻烦',
          attitudeEffect: { trust: 2 },
          resourceEffect: [{ layer: 'economic', field: 'copperCoins', delta: -640 }],
          followUp: [
            { speaker: 'npc', text: '好，痛快人。收据给你，拿好了。' },
          ],
        },
        {
          id: 'plead',
          text: '能不能再宽限几天？家里确实紧张',
          attitudeEffect: { trust: -1, resentment: 1 },
          followUp: [
            { speaker: 'npc', text: '……行吧，看在你一直还算老实的份上，五天。就五天，不能再多了。' },
          ],
        },
        {
          id: 'argue',
          text: '税也太重了，我们辛辛苦苦打鱼，大半都交给你们了',
          attitudeEffect: { respect: -2, resentment: 2, trust: -2 },
          followUp: [
            { speaker: 'npc', text: '嘿，你以为我愿意收？我也是给罗马人办事。你再嚷嚷，我可就公事公办了。' },
          ],
        },
      ],
    },

    // ── 多利安：希腊商品 ──
    {
      id: 'dlg-dorian-greek-goods',
      npcId: 'npc-dorian-merchant',
      condition: () => true,
      priority: 5,
      lines: [
        { speaker: 'npc', text: '朋友！看看这些——从推罗运来的紫布，塞浦路斯的铜器，还有雅典的橄榄油！' },
        { speaker: 'npc', text: '品质上乘，价格公道。你不会在别处找到这么好的货。' },
      ],
      responses: [
        {
          id: 'buy_olive_oil',
          text: '来一瓶橄榄油',
          resourceEffect: [
            { layer: 'economic', field: 'copperCoins', delta: -128 },
            { layer: 'survival', field: 'oil', delta: 3 },
          ],
          followUp: [
            { speaker: 'npc', text: '好眼光！这是雅典 finest 的初榨油，做菜点灯都一流。' },
          ],
        },
        {
          id: 'browse_only',
          text: '先看看，不急着买',
          attitudeEffect: { respect: 1 },
          followUp: [
            { speaker: 'npc', text: '不急不急，慢慢看。好东西值得花时间。' },
          ],
        },
        {
          id: 'haggle',
          text: '这价格也太贵了，能不能便宜点？',
          attitudeEffect: { respect: -1 },
          resourceEffect: [{ layer: 'economic', field: 'copperCoins', delta: -96 }],
          followUp: [
            { speaker: 'npc', text: '好吧好吧……算你识货，给你个实在价。下次记得多来光顾！' },
            { speaker: 'player', text: '（用较低的价格买到了不错的货）' },
          ],
        },
      ],
    },

    // ── 革流巴：远方消息 ──
    {
      id: 'dlg-cleopas-travel-news',
      npcId: 'npc-cleopas-merchant',
      condition: () => true,
      priority: 4,
      lines: [
        { speaker: 'npc', text: '刚从耶路撒冷回来，路上消息不少。' },
        { speaker: 'npc', text: '听说总督换了新的赋税令，各地都在议论。还有人在约旦河边听一个叫约翰的讲道，场面很大。' },
      ],
      responses: [
        {
          id: 'ask_tax',
          text: '新的赋税令？具体怎么说？',
          attitudeEffect: { trust: 1 },
          followUp: [
            { speaker: 'npc', text: '好像是说贸易税要加两成。具体的我也说不清，你可以去问税吏马太，他应该知道详情。' },
          ],
        },
        {
          id: 'ask_preacher',
          text: '那个叫约翰的，是什么人？',
          attitudeEffect: { trust: 1, closeness: 1 },
          followUp: [
            { speaker: 'npc', text: '听说是个穿骆驼毛的先知，在河边给人施洗。很多人去看，连法利赛人都去了。' },
            { speaker: 'npc', text: '我路过去看了一眼——人确实多，但谁知道是真是假。' },
          ],
        },
        {
          id: 'indifferent',
          text: '那些事离我们太远了',
          followUp: [
            { speaker: 'npc', text: '也许吧。不过风向变了，总会有风吹到这里的。' },
          ],
        },
      ],
    },

    // ── 马大：饼的价格 ──
    {
      id: 'dlg-martha-bread-price',
      npcId: 'npc-martha-baker',
      condition: (state) => state.family.resources.survival.grain < 15,
      priority: 8,
      lines: [
        { speaker: 'npc', text: '家里粮食不多了吧？看你脸色就知道了。' },
        { speaker: 'npc', text: '我刚烤了一批饼，用的是今年的新麦，又软又香。要不要来几张？' },
      ],
      responses: [
        {
          id: 'buy_bread',
          text: '来五张饼',
          resourceEffect: [
            { layer: 'economic', field: 'copperCoins', delta: -64 },
            { layer: 'survival', field: 'grain', delta: 5 },
          ],
          attitudeEffect: { closeness: 1 },
          followUp: [
            { speaker: 'npc', text: '拿好了，趁热吃。不够再来。' },
          ],
        },
        {
          id: 'ask_charity',
          text: '手头确实紧……能不能先欠着？',
          attitudeEffect: { trust: -1, respect: -1 },
          followUp: [
            { speaker: 'npc', text: '……好吧，先拿两张去。不过你记着还，我也不容易。' },
            { speaker: 'player', text: '（马大叹了口气，还是递过来两张饼）' },
          ],
          resourceEffect: [{ layer: 'survival', field: 'grain', delta: 2 }],
        },
      ],
    },
  ];
}
