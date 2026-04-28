// src/engine/weather.ts — 天气系统

import { HebrewMonth } from '../models/time.js';

/** 天气类型 */
export enum Weather {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  HEAVY_RAIN = 'HEAVY_RAIN',
  STORM = 'STORM',
  HOT_DRY = 'HOT_DRY',
  FOG = 'FOG',
  WINDY = 'WINDY',
}

/** 天气中文名 */
export const WEATHER_NAMES: Record<Weather, string> = {
  [Weather.CLEAR]: '晴天',
  [Weather.CLOUDY]: '多云',
  [Weather.RAIN]: '小雨',
  [Weather.HEAVY_RAIN]: '大雨',
  [Weather.STORM]: '暴风雨',
  [Weather.HOT_DRY]: '炎热干燥',
  [Weather.FOG]: '雾天',
  [Weather.WINDY]: '大风',
};

/** 天气状态 */
export interface WeatherState {
  current: Weather;
  temperature: number;
  windStrength: number;
  forecast: Weather[];
}

/** 行动效率修饰符 */
export interface WeatherModifiers {
  fishing: number;
  agriculture: number;
  travel: number;
  outdoorLabor: number;
}

/** 各季节的天气概率分布 */
const SEASON_WEATHER: Record<string, Weather[]> = {
  // 夏季（搭模斯、埃波）— 晴热为主
  summer: [
    Weather.CLEAR, Weather.CLEAR, Weather.CLEAR, Weather.CLEAR,
    Weather.HOT_DRY, Weather.HOT_DRY, Weather.HOT_DRY,
    Weather.CLOUDY, Weather.WINDY,
  ],
  // 冬季（提别、细罢特）— 多雨
  winter: [
    Weather.RAIN, Weather.RAIN, Weather.RAIN, Weather.RAIN,
    Weather.HEAVY_RAIN, Weather.HEAVY_RAIN,
    Weather.CLOUDY, Weather.CLOUDY,
    Weather.STORM, Weather.FOG,
    Weather.CLEAR,
  ],
  // 过渡季节（尼散、以珥、西弯、以禄、赫舍汪、基斯流）
  transitional: [
    Weather.CLEAR, Weather.CLEAR, Weather.CLEAR,
    Weather.CLOUDY, Weather.CLOUDY,
    Weather.RAIN, Weather.RAIN,
    Weather.FOG, Weather.WINDY, Weather.HOT_DRY,
  ],
  // 提斯利（秋收）— 温和
  autumn: [
    Weather.CLEAR, Weather.CLEAR, Weather.CLEAR,
    Weather.CLOUDY, Weather.CLOUDY,
    Weather.RAIN,
    Weather.WINDY, Weather.FOG,
  ],
};

/** 判断月份所属季节 */
function getSeason(month: HebrewMonth): string {
  if (month === HebrewMonth.TAMMUZ || month === HebrewMonth.AV) return 'summer';
  if (month === HebrewMonth.TEVET || month === HebrewMonth.SHEVAT) return 'winter';
  if (month === HebrewMonth.TISHREI || month === HebrewMonth.CHESHVAN) return 'autumn';
  return 'transitional';
}

/** 根据月份和日期生成天气（确定性伪随机） */
export function generateWeather(month: HebrewMonth, day: number): WeatherState {
  const season = getSeason(month);
  const weatherOptions = SEASON_WEATHER[season];

  // 确定性伪随机
  const idx = (month * 31 + day * 17) % weatherOptions.length;
  const current = weatherOptions[idx];

  // 温度范围：夏季 25-38°C，冬季 10-18°C，过渡 15-28°C
  const tempBase = current === Weather.HOT_DRY ? 35
    : season === 'summer' ? 28
    : season === 'winter' ? 12
    : 20;
  const tempVariation = ((month * 7 + day * 3) % 10) - 5;
  const temperature = Math.max(10, Math.min(40, tempBase + tempVariation));

  // 风力 0-100
  const windBase = current === Weather.STORM ? 80
    : current === Weather.WINDY ? 60
    : current === Weather.HEAVY_RAIN ? 50
    : 15;
  const windVariation = ((month * 13 + day * 7) % 20) - 10;
  const windStrength = Math.max(0, Math.min(100, windBase + windVariation));

  // 3天预测
  const forecast: Weather[] = [];
  for (let d = 1; d <= 3; d++) {
    const fIdx = (month * 31 + (day + d) * 17) % weatherOptions.length;
    forecast.push(weatherOptions[fIdx]);
  }

  return { current, temperature, windStrength, forecast };
}

/** 获取天气对各类行动的效率修饰符 */
export function getWeatherModifiers(weather: Weather): WeatherModifiers {
  const mods: Record<Weather, WeatherModifiers> = {
    [Weather.CLEAR]:     { fishing: 0.1,  agriculture: 0.0,  travel: 0.0,   outdoorLabor: 0.0 },
    [Weather.CLOUDY]:    { fishing: 0.0,  agriculture: 0.0,  travel: 0.0,   outdoorLabor: 0.0 },
    [Weather.RAIN]:      { fishing: 0.0,  agriculture: 0.2,  travel: -0.1,  outdoorLabor: -0.3 },
    [Weather.HEAVY_RAIN]:{ fishing: -0.3, agriculture: -0.1, travel: -0.3,  outdoorLabor: -0.5 },
    [Weather.STORM]:     { fishing: -0.8, agriculture: -0.5, travel: -0.5,  outdoorLabor: -0.7 },
    [Weather.HOT_DRY]:   { fishing: 0.0,  agriculture: -0.3, travel: -0.1,  outdoorLabor: -0.2 },
    [Weather.FOG]:       { fishing: 0.1,  agriculture: 0.0,  travel: -0.2,  outdoorLabor: 0.0 },
    [Weather.WINDY]:     { fishing: -0.1, agriculture: 0.0,  travel: -0.1,  outdoorLabor: -0.1 },
  };
  return mods[weather];
}

/** 生成3天天气预报文本 */
export function getWeatherForecast(state: WeatherState): string {
  const lines: string[] = [];
  lines.push('── 天气预报 ──');
  lines.push(`今日：${WEATHER_NAMES[state.current]}，气温 ${state.temperature}°C，风力 ${state.windStrength}/100`);
  for (let i = 0; i < state.forecast.length; i++) {
    lines.push(`第${i + 1}天后：${WEATHER_NAMES[state.forecast[i]]}`);
  }
  return lines.join('\n');
}
