// src/main.ts — CLI 入口

import * as readline from 'node:readline';
import { HebrewMonth, TimeOfDay, isSabbathDay, getCurrentFestival, formatDate, MONTH_NAMES, TIME_OF_DAY_LABELS, totalDaysElapsed } from './models/time.js';
import { createFishermanFamily } from './data/families/fisherman.js';
import { createTenantFarmerFamily } from './data/families/tenantFarmer.js';
import { createCraftsmanFamily } from './data/families/craftsman.js';
import { createWidowFamily } from './data/families/widow.js';
import { createTravelingMerchantFamily } from './data/families/travelingMerchant.js';
import { createPriestlyFamily } from './data/families/priestlyFamily.js';
import { createMVPNPCs } from './data/npcs.js';
import { createInitialAttitudes } from './data/npcAttitudes.js';
import { createGenericVillagers, createGenericVillagerAttitudes } from './data/genericVillagers.js';
import { GameEngine } from './engine/gameLoop.js';
import { QuestEngine, createBrokenNetQuest, createSabbathWellQuest, createWidowWeavingQuest, createLostSheepQuest, createCreditorVisitQuest, createGrainShortageQuest, createSickChildQuest, createTravelingRabbiQuest, createMarketDisputeQuest, createSabbathViolationQuest, createHarvestOfferingQuest, createRomanPatrolQuest, createBetrothalProposalQuest, createBrokenMillstoneQuest, createPassoverPreparationQuest } from './engine/events/index.js';
import { parseActionType } from './engine/actions.js';
import { MarketEngine } from './engine/market.js';
import { RumorEngine } from './engine/rumor.js';
import { processSabbathDaily, getSabbathSummary } from './engine/sabbath.js';
import { getReputationSummary } from './engine/reputation.js';
import { generateWeather, getWeatherForecast, WEATHER_NAMES } from './engine/weather.js';
import { DialogueEngine } from './engine/dialogue.js';
import { createAllDialogues } from './data/dialogues/index.js';
import { NPCAttitudeEngine } from './engine/npcAttitude.js';
import { ToolDegradationEngine } from './engine/toolDegradation.js';
import { createInitialTaxState, getTaxSummary, checkDirectTaxDue, payDirectTax, maybeGenerateInformalTax } from './engine/tax.js';
import { getNPCSchedules, getNPCCurrentActivity } from './engine/npcSchedule.js';
import { getLocation } from './data/locations.js';
import type { GameState } from './models/gameState.js';
import type { GameDate } from './models/time.js';
import type { FamilyMember, Family } from './models/family.js';

const FAMILY_TYPES: { id: string; name: string; description: string; creator: (d: GameDate) => Family }[] = [
  { id: 'fisherman', name: '渔民家庭', description: '加利利海边的捕鱼人家，以渔网和船只为生', creator: createFishermanFamily },
  { id: 'tenant', name: '佃农家庭', description: '租种地主土地的农夫，辛苦劳作交租糊口', creator: createTenantFarmerFamily },
  { id: 'craftsman', name: '工匠家庭', description: '石匠/木匠手艺人，凭技艺养活一家', creator: createCraftsmanFamily },
  { id: 'widow', name: '寡妇家庭', description: '失去丈夫的妇人，靠纺织和邻舍接济度日', creator: createWidowFamily },
  { id: 'merchant', name: '行商家庭', description: '走南闯北的商人家庭，见多识广但也担风险', creator: createTravelingMerchantFamily },
  { id: 'priestly', name: '祭司家庭', description: '利未后裔，事奉会堂，精通律法', creator: createPriestlyFamily },
];

function createInitialState(familyId?: string): GameState {
  const startDate: GameDate = {
    year: 1,
    month: HebrewMonth.NISAN,
    day: 1,
    timeOfDay: TimeOfDay.DAWN,
    isSabbath: false,
    festivalId: undefined,
  };
  startDate.isSabbath = isSabbathDay(startDate);
  startDate.festivalId = getCurrentFestival(startDate);

  const selectedFamily = FAMILY_TYPES.find(f => f.id === familyId) ?? FAMILY_TYPES[0];
  const family = selectedFamily.creator(startDate);

  // 合并具名NPC和普通村民
  const namedNPCs = createMVPNPCs();
  const genericVillagers = createGenericVillagers();
  const allNPCs = [...namedNPCs, ...genericVillagers];

  // 合并态度
  const attitudes = createInitialAttitudes();
  const genericAttitudes = createGenericVillagerAttitudes(genericVillagers.map(v => v.id));
  for (const [id, att] of genericAttitudes) {
    attitudes.set(id, att);
  }

  const weather = generateWeather(startDate.month, startDate.day);
  const taxState = createInitialTaxState();
  const npcSchedules = getNPCSchedules(totalDaysElapsed(startDate), startDate.isSabbath);

  return {
    date: startDate,
    family,
    npcs: allNPCs,
    attitudes,
    reputationTags: [],
    eventLog: [],
    currentLocationId: 'capernaum-lakeside',
    currentLocation: {
      currentLocationId: 'capernaum-lakeside',
      currentMapId: 'galilee-lakeside',
      travelProgress: 0,
    },
    weather,
    taxState,
    npcSchedules,
  };
}

/** 根据输入解析家庭成员（支持中文名、ID、子串匹配） */
function resolveMemberName(input: string, state: GameState): FamilyMember | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // 1. 精确匹配 ID
  const byId = state.family.members.find(m => m.id.toLowerCase() === trimmed.toLowerCase());
  if (byId) return byId;

  // 2. 精确匹配中文名
  const byName = state.family.members.find(m => m.name === trimmed);
  if (byName) return byName;

  // 3. 子串匹配（大小写不敏感）
  const lower = trimmed.toLowerCase();
  const bySubstring = state.family.members.find(m =>
    m.name.includes(trimmed) || m.id.toLowerCase().includes(lower),
  );
  return bySubstring;
}

/** 格式化提示行：[尼散月 1日 黎明] > */
function formatPrompt(date: GameDate): string {
  const monthName = MONTH_NAMES[date.month];
  const timeLabel = TIME_OF_DAY_LABELS[date.timeOfDay];
  return `[${monthName}月 ${date.day}日 ${timeLabel}] > `;
}

function main(): void {
  const engine = new GameEngine(createInitialState());
  const questEngine = new QuestEngine();
  const marketEngine = new MarketEngine();
  const rumorEngine = new RumorEngine();
  const dialogueEngine = new DialogueEngine();
  const attitudeEngine = new NPCAttitudeEngine();
  const toolEngine = new ToolDegradationEngine();

  // 注册所有任务
  questEngine.register(createBrokenNetQuest());
  questEngine.register(createSabbathWellQuest());
  questEngine.register(createWidowWeavingQuest());
  questEngine.register(createLostSheepQuest());
  questEngine.register(createCreditorVisitQuest());
  questEngine.register(createGrainShortageQuest());
  questEngine.register(createSickChildQuest());
  questEngine.register(createTravelingRabbiQuest());
  questEngine.register(createMarketDisputeQuest());
  questEngine.register(createSabbathViolationQuest());
  questEngine.register(createHarvestOfferingQuest());
  questEngine.register(createRomanPatrolQuest());
  questEngine.register(createBetrothalProposalQuest());
  questEngine.register(createBrokenMillstoneQuest());
  questEngine.register(createPassoverPreparationQuest());

  // 注册所有对话
  dialogueEngine.registerDialogues(createAllDialogues());

  // 当前对话的回复选项（用于reply命令）
  let activeResponses: { id: string }[] = [];

  console.clear();
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   第一世纪加利利 — 渔民家庭模拟          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log();
  console.log(engine.getStatusSummary());
  console.log();
  console.log('输入 help 查看所有命令。');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: formatPrompt(engine.state.date),
  });

  rl.prompt();

  rl.on('line', (line: string) => {
    const raw = line.trim();
    const parts = raw.split(/\s+/);
    const cmd = parts[0]?.toLowerCase() ?? '';

    switch (cmd) {
      // ── 行动规划 ──
      case 'plan': {
        // 自动创建日程（如果还没有）
        const startLogs = engine.startNewDay();
        for (const log of startLogs) {
          console.log(log);
        }
        console.log(engine.getPlanOverview());
        break;
      }

      case 'assign': {
        if (parts.length < 3) {
          console.log('用法: assign <成员名> <行动>');
          console.log('示例: assign 约拿 捕鱼');
          break;
        }
        // 自动创建日程
        const startLogs = engine.startNewDay();
        for (const log of startLogs) {
          console.log(log);
        }
        const memberInput = parts[1];
        const actionInput = parts.slice(2).join(' ');
        const member = resolveMemberName(memberInput, engine.state);
        if (!member) {
          console.log(`找不到家庭成员「${memberInput}」。家庭成员：${engine.state.family.members.map(m => m.name).join('、')}`);
          break;
        }
        const actionType = parseActionType(actionInput);
        if (!actionType) {
          console.log(`无法识别行动「${actionInput}」。`);
          break;
        }
        const result = engine.assignAction(member.id, actionType, engine.state.date.timeOfDay);
        if (result.success) {
          console.log(`✓ 已安排${member.name}执行「${actionType}」`);
        } else {
          console.log(`✗ 安排失败：${result.reason}`);
        }
        break;
      }

      case 'schedule': {
        const startLogs = engine.startNewDay();
        for (const log of startLogs) {
          console.log(log);
        }
        console.log(engine.getScheduleSummary());
        break;
      }

      case 'do':
      case 'advance': {
        const logs = engine.advanceTimeSlotWithSchedule();
        for (const log of logs) {
          console.log(log);
        }
        // 天气更新（新的一天时）
        if (engine.state.weather && engine.state.date.timeOfDay === TimeOfDay.DAWN) {
          engine.state.weather = generateWeather(engine.state.date.month, engine.state.date.day);
          console.log(`天气：${WEATHER_NAMES[engine.state.weather.current]}，气温 ${engine.state.weather.temperature}°C`);
          // 直接税检查
          if (checkDirectTaxDue(engine.state.taxState, engine.state.date)) {
            const taxResult = payDirectTax(engine.state.taxState, engine.state);
            console.log(taxResult.message);
          }
          // 非正式摊派
          const informal = maybeGenerateInformalTax(engine.state.taxState, engine.state.date);
          if (informal.trigger) {
            const infResult = require('./engine/tax.js').triggerInformalTax(
              engine.state.taxState, engine.state, informal.description, informal.amount,
            );
            console.log(infResult.message);
          }
          // NPC日程更新
          engine.state.npcSchedules = getNPCSchedules(
            totalDaysElapsed(engine.state.date), engine.state.date.isSabbath,
          );
        }
        // 安息日每日处理
        const sabbathLogs = processSabbathDaily(engine.state);
        for (const log of sabbathLogs) {
          console.log(log);
        }
        // 传闻传播
        const rumorLogs = rumorEngine.tickDaily(engine.state);
        for (const log of rumorLogs) {
          console.log(log);
        }
        // 检查任务触发
        const triggered = questEngine.checkTriggers(engine.state);
        if (triggered) {
          questEngine.setPendingQuest(triggered);
          console.log();
          console.log(questEngine.presentQuest(triggered));
        }
        break;
      }

      // ── 原有命令 ──
      case 'next': {
        const logs = engine.advanceTimeSlot();
        for (const log of logs) {
          console.log(log);
        }
        break;
      }

      case 'day': {
        const logs = engine.advanceDay();
        for (const log of logs) {
          console.log(log);
        }
        // 安息日每日处理
        const sabbathLogs = processSabbathDaily(engine.state);
        for (const log of sabbathLogs) {
          console.log(log);
        }
        // 传闻传播
        const rumorLogs = rumorEngine.tickDaily(engine.state);
        for (const log of rumorLogs) {
          console.log(log);
        }
        break;
      }

      case 'status': {
        console.log(engine.getStatusSummary());
        break;
      }

      // ── 任务命令 ──
      case 'quest': {
        const pending = questEngine.getPendingQuest();
        if (pending) {
          console.log(questEngine.presentQuest(pending));
        } else {
          console.log('当前没有待处理的事件。');
        }
        break;
      }

      case 'choose': {
        const choiceIdx = parseInt(parts[1], 10) - 1;
        if (isNaN(choiceIdx)) {
          console.log('用法: choose <编号>');
          break;
        }
        const pending = questEngine.getPendingQuest();
        if (!pending) {
          console.log('当前没有待选择的事件。');
          break;
        }
        const logs = questEngine.resolveChoice(pending, choiceIdx, engine.state);
        for (const log of logs) {
          console.log(log);
        }
        break;
      }

      // ── 声誉 ──
      case 'reputation':
      case 'rep': {
        console.log(getReputationSummary(engine.state));
        break;
      }

      // ── 集市 ──
      case 'market': {
        console.log(marketEngine.getPriceList(engine.state));
        break;
      }

      case 'buy': {
        if (parts.length < 3) {
          console.log('用法: buy <商品名> <数量>');
          console.log('示例: buy 谷物 5');
          break;
        }
        const goodName = parts[1];
        const qty = parseInt(parts[2], 10);
        if (isNaN(qty) || qty <= 0) {
          console.log('数量必须是正整数。');
          break;
        }
        const buyResult = marketEngine.buy(engine.state, goodName, qty);
        for (const log of buyResult.logs) {
          console.log(log);
        }
        break;
      }

      case 'sell': {
        if (parts.length < 3) {
          console.log('用法: sell <商品名> <数量>');
          console.log('示例: sell 鱼 3');
          break;
        }
        const goodName = parts[1];
        const qty = parseInt(parts[2], 10);
        if (isNaN(qty) || qty <= 0) {
          console.log('数量必须是正整数。');
          break;
        }
        const sellResult = marketEngine.sell(engine.state, goodName, qty);
        for (const log of sellResult.logs) {
          console.log(log);
        }
        break;
      }

      // ── 传闻 ──
      case 'rumor':
      case 'rumours':
      case 'rumors': {
        console.log(rumorEngine.getSummary());
        break;
      }

      // ── 天气 ──
      case 'weather': {
        if (engine.state.weather) {
          console.log(getWeatherForecast(engine.state.weather));
        } else {
          console.log('天气信息尚未生成。');
        }
        break;
      }

      // ── 税收 ──
      case 'tax': {
        console.log(getTaxSummary(engine.state.taxState));
        break;
      }

      // ── 地点 ──
      case 'location':
      case 'loc': {
        const locId = engine.state.currentLocation.currentLocationId;
        const loc = getLocation(locId);
        if (loc) {
          console.log(`── 当前地点 ──`);
          console.log(`  ${loc.name}（${locId}）`);
          console.log(`  ${loc.description}`);
          console.log(`  区域：${loc.mapId}`);
          console.log(`  相邻：${loc.connections.join('、')}`);
          console.log(`  市场：${loc.marketAvailable ? '有' : '无'}  关卡：${loc.taxCheckpoint ? '是' : '否'}`);
          console.log(`  危险等级：${loc.dangerLevel}/100`);
        } else {
          console.log(`地点 ${locId} 未找到。`);
        }
        break;
      }

      // ── 移动 ──
      case 'move':
      case 'go': {
        if (parts.length < 2) {
          const locId = engine.state.currentLocation.currentLocationId;
          const loc = getLocation(locId);
          if (loc) {
            console.log(`可用去向：${loc.connections.join('、')}`);
          }
          console.log('用法: move <地点ID>');
          break;
        }
        const targetId = parts[1];
        const currentLoc = getLocation(engine.state.currentLocation.currentLocationId);
        if (!currentLoc) {
          console.log('当前位置信息异常。');
          break;
        }
        if (!currentLoc.connections.includes(targetId)) {
          console.log(`无法从 ${currentLoc.name} 前往 ${targetId}，两地不相邻。`);
          break;
        }
        const targetLoc = getLocation(targetId);
        if (!targetLoc) {
          console.log(`地点 ${targetId} 不存在。`);
          break;
        }
        // 移动
        engine.state.currentLocation.currentLocationId = targetId;
        engine.state.currentLocation.currentMapId = targetLoc.mapId;
        engine.state.currentLocation.travelProgress = 0;
        engine.state.currentLocationId = targetId;
        console.log(`已移动到：${targetLoc.name}（${targetId}）`);
        // 关卡税检查
        if (targetLoc.taxCheckpoint) {
          const tollResult = require('./engine/tax.js').payTollTax(engine.state.taxState, engine.state);
          console.log(tollResult.message);
        }
        break;
      }

      // ── 安息日 ──
      case 'sabbath': {
        const sabbathLines = getSabbathSummary(engine.state);
        for (const line of sabbathLines) {
          console.log(line);
        }
        break;
      }

      // ── 对话 ──
      case 'talk': {
        if (dialogueEngine.hasActiveDialogue()) {
          console.log('已有进行中的对话，请先回复或输入 endtalk 结束。');
          break;
        }
        if (parts.length < 2) {
          console.log('用法: talk <NPC名字或ID>');
          console.log('示例: talk 约拿');
          break;
        }
        const npcInput = parts.slice(1).join(' ');
        // 尝试匹配NPC
        const npc = engine.state.npcs.find(n =>
          n.name === npcInput || n.id.toLowerCase() === npcInput.toLowerCase() ||
          n.id.includes(npcInput.toLowerCase()),
        );
        if (!npc) {
          console.log(`找不到NPC「${npcInput}」。`);
          break;
        }
        const dialogue = dialogueEngine.startDialogue(npc.id, engine.state);
        if (!dialogue) {
          console.log(`${npc.name}现在没什么好说的。`);
          break;
        }
        console.log(`── 与${npc.name}对话 ──`);
        console.log(dialogueEngine.renderDialogue(dialogue.lines));
        console.log();
        console.log('回复选项：');
        console.log(dialogueEngine.renderResponses(dialogue.responses));
        activeResponses = dialogue.responses;
        break;
      }

      // ── 对话回复 ──
      case 'reply': {
        if (!dialogueEngine.hasActiveDialogue()) {
          console.log('没有进行中的对话。使用 talk <NPC> 开始对话。');
          break;
        }
        const replyIdx = parseInt(parts[1], 10) - 1;
        if (isNaN(replyIdx)) {
          console.log('用法: reply <编号>');
          break;
        }
        if (activeResponses.length === 0) {
          console.log('没有可用的回复选项。');
          break;
        }
        if (replyIdx < 0 || replyIdx >= activeResponses.length) {
          console.log(`无效选项。请输入 1-${activeResponses.length}。`);
          break;
        }
        const responseId = activeResponses[replyIdx].id;
        const result = dialogueEngine.selectResponse(responseId, engine.state);
        for (const eff of result.appliedEffects) {
          console.log(`  ${eff}`);
        }
        if (result.followUp && result.followUp.length > 0) {
          console.log();
          console.log(dialogueEngine.renderDialogue(result.followUp));
        }
        dialogueEngine.endDialogue();
        activeResponses = [];
        break;
      }

      // ── 结束对话 ──
      case 'endtalk': {
        dialogueEngine.endDialogue();
        activeResponses = [];
        console.log('对话结束。');
        break;
      }

      // ── 工具状态 ──
      case 'tools': {
        console.log(toolEngine.getToolSummary(engine.state));
        break;
      }

      // ── NPC关系 ──
      case 'relation':
      case 'rel': {
        if (parts.length < 2) {
          // 显示所有NPC关系概要
          const lines: string[] = ['── NPC关系概要 ──'];
          for (const npc of engine.state.npcs.slice(0, 20)) {
            lines.push(attitudeEngine.getAttitudeSummary(engine.state, npc.id));
          }
          console.log(lines.join('\n'));
        } else {
          const npcInput = parts.slice(1).join(' ');
          const npc = engine.state.npcs.find(n =>
            n.name === npcInput || n.id.toLowerCase() === npcInput.toLowerCase(),
          );
          if (!npc) {
            console.log(`找不到NPC「${npcInput}」。`);
            break;
          }
          console.log(attitudeEngine.getAttitudeSummary(engine.state, npc.id));
        }
        break;
      }

      // ── 帮助 ──
      case 'help': {
        console.log('── 命令列表 ──');
        console.log('  plan              查看家庭成员和可用行动');
        console.log('  assign <成员> <行动>  给成员分配行动');
        console.log('  schedule          查看今日日程');
        console.log('  do / advance      执行当前时段行动并推进时间');
        console.log('  next              推进一个时段（不执行日程）');
        console.log('  day               推进到次日黎明');
        console.log('  status            查看家庭状态');
        console.log('  weather           查看天气预报');
        console.log('  tax               查看税收记录');
        console.log('  location / loc    查看当前地点信息');
        console.log('  move <地点ID>     移动到相邻地点');
        console.log('  quest             查看当前事件');
        console.log('  choose <编号>     做出事件选择');
        console.log('  market            查看集市价目表');
        console.log('  buy <商品> <数量>  购买商品');
        console.log('  sell <商品> <数量> 出售商品');
        console.log('  reputation        查看声誉标签');
        console.log('  rumor             查看流传中的传闻');
        console.log('  sabbath           查看安息日准备和洁净状态');
        console.log('  talk <NPC>        与NPC对话');
        console.log('  reply <编号>      回复对话');
        console.log('  endtalk           结束对话');
        console.log('  tools             查看工具状态');
        console.log('  relation [NPC]    查看NPC关系');
        console.log('  quit              退出游戏');
        break;
      }

      // ── 退出 ──
      case 'quit':
      case 'exit': {
        console.log('平安！下次再见。');
        rl.close();
        return;
      }

      default:
        console.log('未知命令。输入 help 查看所有命令。');
    }

    rl.setPrompt(formatPrompt(engine.state.date));
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main();
