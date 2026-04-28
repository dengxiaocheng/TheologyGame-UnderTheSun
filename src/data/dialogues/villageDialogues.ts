// src/data/dialogues/villageDialogues.ts — 村落日常对话

import type { DialogueDefinition } from '../../engine/dialogue.js';
import { totalDaysElapsed } from '../../models/time.js';

export function createVillageDialogues(): DialogueDefinition[] {
  return [
    // ── 哈拿：产妇求助 ──
    {
      id: 'dlg-hannah-birth-help',
      npcId: 'npc-hannah-midwife',
      condition: () => true,
      priority: 6,
      lines: [
        { speaker: 'npc', text: '这几天村里好几个孕妇快要生了，忙得我脚不沾地。' },
        { speaker: 'npc', text: '你家有没有干净的麻布？我这里不够用了。' },
      ],
      responses: [
        {
          id: 'donate_cloth',
          text: '家里有些旧布，你拿去吧',
          attitudeEffect: { trust: 3, respect: 2, closeness: 2 },
          resourceEffect: [{ layer: 'survival', field: 'clothing', delta: -1 }],
          followUp: [
            { speaker: 'npc', text: '太好了！愿主赐福你。等忙过这阵子，我教你一些护理婴儿的知识。' },
          ],
        },
        {
          id: 'no_spare',
          text: '抱歉，我自己家也不太够用',
          attitudeEffect: { closeness: -1 },
          followUp: [
            { speaker: 'npc', text: '没关系，我再问问别家。大家都不容易。' },
          ],
        },
      ],
    },

    // ── 亚拿尼亚：会堂事务 ──
    {
      id: 'dlg-ananias-synagogue',
      npcId: 'npc-ananias-elder',
      condition: (state) => {
        const days = totalDaysElapsed(state.date);
        return days >= 3;
      },
      priority: 10,
      lines: [
        { speaker: 'npc', text: '年轻人，安息日的聚会你最近来得少了。' },
        { speaker: 'npc', text: '会堂不只是祈祷的地方，也是大家联络感情的所在。你可不要疏远了。' },
      ],
      responses: [
        {
          id: 'apologize',
          text: '您说得对，我以后一定多参加',
          attitudeEffect: { respect: 3, trust: 2 },
          resourceEffect: [{ layer: 'ritual', field: 'synagogueParticipation', delta: 5 }],
          followUp: [
            { speaker: 'npc', text: '嗯，这还差不多。下个安息日我会讲到以撒献祭的故事，你来了会受益的。' },
          ],
        },
        {
          id: 'excuse',
          text: '最近实在太忙了，等忙过这一阵……',
          attitudeEffect: { respect: -1 },
          followUp: [
            { speaker: 'npc', text: '忙？谁不忙呢？但安息日是耶和华定的，忙不是借口。' },
          ],
        },
        {
          id: 'challenge',
          text: '会堂的规矩是不是太多了？我看有些人来了也是心不在焉',
          attitudeEffect: { respect: -3, trust: -2, resentment: 2 },
          followUp: [
            { speaker: 'npc', text: '……年轻人，你这是对长者说话的态度吗？规矩不是为了约束，是为了让我们不忘本。' },
            { speaker: 'npc', text: '你好好想想吧。' },
          ],
        },
      ],
    },

    // ── 以利亚撒：文士教导 ──
    {
      id: 'dlg-eleazar-teaching',
      npcId: 'npc-eleazar-scribe',
      condition: () => true,
      priority: 7,
      lines: [
        { speaker: 'npc', text: '「你要尽心、尽性、尽力爱耶和华你的神。」——这是示玛的核心。' },
        { speaker: 'npc', text: '你每天早晨出门前，有没有在心里诵念这段经文？' },
      ],
      responses: [
        {
          id: 'devout',
          text: '每天都念，这是我从小养成的习惯',
          attitudeEffect: { trust: 3, respect: 2 },
          resourceEffect: [{ layer: 'ritual', field: 'sabbathReadiness', delta: 3 }],
          followUp: [
            { speaker: 'npc', text: '很好，很好。持守传统的人，道路是稳固的。' },
          ],
        },
        {
          id: 'honest',
          text: '说实话……有时候会忘',
          attitudeEffect: { trust: 1, closeness: 1 },
          followUp: [
            { speaker: 'npc', text: '诚实比假装虔诚要好。试试在门框上挂一段经文匣，出门时就能看到。' },
          ],
        },
        {
          id: 'question',
          text: '经文里说的「尽心」，具体是什么意思？',
          attitudeEffect: { trust: 2, respect: 3 },
          followUp: [
            { speaker: 'npc', text: '好问题。「心」在希伯来语里不只是感情，也包括思想和意志。' },
            { speaker: 'npc', text: '尽心爱神，就是用你全部的所思所想所行来爱他。不只是感觉，而是行动。' },
          ],
        },
      ],
    },

    // ── 巴底买：乞讨者的尊严 ──
    {
      id: 'dlg-bartimaeus-dignity',
      npcId: 'npc-bartimaeus-beggar',
      condition: () => true,
      priority: 5,
      lines: [
        { speaker: 'npc', text: '……能给我一点吃的吗？我三天没正经吃过饭了。' },
        { speaker: 'npc', text: '我以前也是石匠，手艺不差的。只是眼睛坏了，没人愿意请我了……' },
      ],
      responses: [
        {
          id: 'give_food',
          text: '给你一些粮食，拿着吧',
          attitudeEffect: { trust: 3, closeness: 2 },
          resourceEffect: [
            { layer: 'survival', field: 'grain', delta: -2 },
            { layer: 'ritual', field: 'charityReputation', delta: 3 },
          ],
          followUp: [
            { speaker: 'npc', text: '愿耶和华赐福给你。你知道吗，你是今天第一个停下来听我说话的人。' },
          ],
        },
        {
          id: 'offer_work',
          text: '你能帮忙做些简单的活吗？我给你工钱',
          attitudeEffect: { trust: 4, respect: 3, closeness: 3 },
          resourceEffect: [
            { layer: 'economic', field: 'copperCoins', delta: -64 },
            { layer: 'social', field: 'familyHonor', delta: 3 },
          ],
          followUp: [
            { speaker: 'npc', text: '你……你愿意让我做工？好久没人这样说了。' },
            { speaker: 'npc', text: '我能摸着做些打磨的活，手还是稳的。谢谢你，真的谢谢你。' },
          ],
        },
        {
          id: 'walk_away',
          text: '（默默走开）',
          attitudeEffect: { respect: -2, resentment: 1 },
          followUp: [
            { speaker: 'player', text: '（身后传来一声叹息，你加快了脚步）' },
          ],
        },
      ],
    },

    // ── 塔玛：撒马利亚旅人 ──
    {
      id: 'dlg-tamar-stranger',
      npcId: 'npc-tamar-traveler',
      condition: () => true,
      priority: 6,
      lines: [
        { speaker: 'npc', text: '请问……从这里到示剑怎么走？我已经走了三天了。' },
        { speaker: 'npc', text: '村里的人都不太愿意跟我说话。我知道撒马利亚人在这里不受欢迎……' },
      ],
      responses: [
        {
          id: 'help_directions',
          text: '往南走，沿着大路一直走两天就到了。我给你指路',
          attitudeEffect: { trust: 3, respect: 2, closeness: 2 },
          resourceEffect: [{ layer: 'social', field: 'neighborTrust', delta: -2 }],
          followUp: [
            { speaker: 'npc', text: '谢谢你！很少有人愿意帮助一个撒马利亚人。愿你的神赐福于你。' },
            { speaker: 'player', text: '（旁边几个村民投来不赞成的目光）' },
          ],
        },
        {
          id: 'cautious',
          text: '我可以告诉你路，但别在村里待太久',
          attitudeEffect: { trust: 1 },
          followUp: [
            { speaker: 'npc', text: '我明白。谢谢你的好意，我拿了水就走。' },
          ],
        },
        {
          id: 'refuse',
          text: '撒马利亚人？你还是快点离开这里吧',
          attitudeEffect: { respect: -2, resentment: 2 },
          followUp: [
            { speaker: 'npc', text: '……好吧。我走就是了。' },
            { speaker: 'player', text: '（她低下头，默默地朝村外走去）' },
          ],
        },
      ],
    },
  ];
}
