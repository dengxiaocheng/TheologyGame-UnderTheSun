// src/models/time.ts — 时间系统类型与日历服务

/** 一天中的五个时段 */
export enum TimeOfDay {
  DAWN = 'dawn',       // 黎明
  MORNING = 'morning', // 上午
  MIDDAY = 'midday',   // 正午
  AFTERNOON = 'afternoon', // 下午
  EVENING = 'evening', // 傍晚/夜晚
}

/** 时段流转顺序 */
const TIME_ORDER: TimeOfDay[] = [
  TimeOfDay.DAWN,
  TimeOfDay.MORNING,
  TimeOfDay.MIDDAY,
  TimeOfDay.AFTERNOON,
  TimeOfDay.EVENING,
];

/** 时段中文名 */
export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  [TimeOfDay.DAWN]: '黎明',
  [TimeOfDay.MORNING]: '上午',
  [TimeOfDay.MIDDAY]: '正午',
  [TimeOfDay.AFTERNOON]: '下午',
  [TimeOfDay.EVENING]: '傍晚',
};

/** 希伯来历月份 */
export enum HebrewMonth {
  NISAN = 1,
  IYYAR = 2,
  SIVAN = 3,
  TAMMUZ = 4,
  AV = 5,
  ELUL = 6,
  TISHREI = 7,
  CHESHVAN = 8,
  KISLEV = 9,
  TEVET = 10,
  SHEVAT = 11,
  ADAR = 12,
  ADAR_II = 13,
}

/** 各月份天数（非闰年，Cheshvan/Kislev 取常见值） */
export const MONTH_DAYS: Record<HebrewMonth, number> = {
  [HebrewMonth.NISAN]: 30,
  [HebrewMonth.IYYAR]: 29,
  [HebrewMonth.SIVAN]: 30,
  [HebrewMonth.TAMMUZ]: 29,
  [HebrewMonth.AV]: 30,
  [HebrewMonth.ELUL]: 29,
  [HebrewMonth.TISHREI]: 30,
  [HebrewMonth.CHESHVAN]: 29,
  [HebrewMonth.KISLEV]: 30,
  [HebrewMonth.TEVET]: 29,
  [HebrewMonth.SHEVAT]: 30,
  [HebrewMonth.ADAR]: 29,
  [HebrewMonth.ADAR_II]: 29,
};

/** 月份希伯来名 */
export const MONTH_NAMES: Record<HebrewMonth, string> = {
  [HebrewMonth.NISAN]: '尼散',
  [HebrewMonth.IYYAR]: '以珥',
  [HebrewMonth.SIVAN]: '西弯',
  [HebrewMonth.TAMMUZ]: '搭模斯',
  [HebrewMonth.AV]: '埃波',
  [HebrewMonth.ELUL]: '以禄',
  [HebrewMonth.TISHREI]: '提斯利',
  [HebrewMonth.CHESHVAN]: '赫舍汪',
  [HebrewMonth.KISLEV]: '基斯流',
  [HebrewMonth.TEVET]: '提别',
  [HebrewMonth.SHEVAT]: '细罢特',
  [HebrewMonth.ADAR]: '亚达',
  [HebrewMonth.ADAR_II]: '亚达二世',
};

/** 游戏日期 */
export interface GameDate {
  year: number;
  month: HebrewMonth;
  day: number;
  timeOfDay: TimeOfDay;
  isSabbath: boolean;
  festivalId?: string;
}

// ---------------------------------------------------------------------------
// CalendarService — 纯函数集
// ---------------------------------------------------------------------------

/** 自游戏起始日算起的总天数（day 1 = 起始日） */
export function totalDaysElapsed(date: GameDate): number {
  let total = 0;
  for (let y = 1; y < date.year; y++) {
    total += isLeapYear(y) ? 385 : 354;
  }
  for (let m = 1; m < date.month; m++) {
    total += MONTH_DAYS[m as HebrewMonth] ?? 29;
  }
  total += date.day;
  return total;
}

/** 简化闰年判断：每 19 年循环中第 3、6、8、11、14、17、19 年为闰年 */
export function isLeapYear(year: number): boolean {
  const pos = ((year - 1) % 19) + 1;
  return [3, 6, 8, 11, 14, 17, 19].includes(pos);
}

/** 判断是否为安息日（每 7 天一次，从第 7 天开始） */
export function isSabbathDay(date: GameDate): boolean {
  return totalDaysElapsed(date) % 7 === 0;
}

/** 获取当前节期（简化版，后续阶段完善） */
export function getCurrentFestival(date: GameDate): string | undefined {
  const { month, day } = date;
  // 逾越节：尼散 15-21
  if (month === HebrewMonth.NISAN && day >= 15 && day <= 21) return 'pesach';
  // 五旬节：西弯 6
  if (month === HebrewMonth.SIVAN && day === 6) return 'shavuot';
  // 住棚节：提斯利 15-21
  if (month === HebrewMonth.TISHREI && day >= 15 && day <= 21) return 'sukkot';
  // 普珥节：亚达 14（闰年为亚达二世 14）
  if (month === HebrewMonth.ADAR && day === 14) return 'purim';
  if (month === HebrewMonth.ADAR_II && day === 14) return 'purim';
  return undefined;
}

/** 推进到下一时段 */
export function advanceTimeSlot(date: GameDate): GameDate {
  const idx = TIME_ORDER.indexOf(date.timeOfDay);
  if (idx < TIME_ORDER.length - 1) {
    // 同日下一时段
    const next = { ...date, timeOfDay: TIME_ORDER[idx + 1] };
    return next;
  }
  // 到了 EVENING，推进到次日黎明
  return advanceToNextDay(date);
}

/** 推进到次日黎明 */
export function advanceToNextDay(date: GameDate): GameDate {
  let { year, month, day } = date;
  const maxDays = MONTH_DAYS[month] ?? 29;
  day++;
  if (day > maxDays) {
    day = 1;
    month = (month + 1) as HebrewMonth;
    // 普通年跳过 ADAR_II
    if (month === HebrewMonth.ADAR_II && !isLeapYear(year)) {
      month = HebrewMonth.NISAN;
    }
    if (month > (isLeapYear(year) ? HebrewMonth.ADAR_II : HebrewMonth.ADAR)) {
      month = HebrewMonth.NISAN;
      year++;
    }
  }
  const newDate: GameDate = {
    year,
    month,
    day,
    timeOfDay: TimeOfDay.DAWN,
    isSabbath: false,
  };
  newDate.isSabbath = isSabbathDay(newDate);
  newDate.festivalId = getCurrentFestival(newDate);
  return newDate;
}

/** 格式化日期为中文 */
export function formatDate(date: GameDate): string {
  const monthName = MONTH_NAMES[date.month];
  const timeLabel = TIME_OF_DAY_LABELS[date.timeOfDay];
  let result = `第${date.year}年 ${monthName}月 ${date.day}日 ${timeLabel}`;
  if (date.isSabbath) result += ' 【安息日】';
  if (date.festivalId) result += ` 【节期: ${date.festivalId}】`;
  return result;
}
