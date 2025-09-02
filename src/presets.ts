// ジャグラーAタイプ 8機種・プリセット完全版（jug123 準拠）

export type SettingId = 1 | 2 | 3 | 4 | 5 | 6;

export type PayoutRates = {
  /** 機械割1：メーカー発表値 */
  type1: Record<SettingId, number>;
  /** 機械割2：チェリー狙い */
  type2: Record<SettingId, number>;
  /** 機械割3：フル攻略（チェリー・ピエロ・ベル狙い・ぶどう抜き） */
  type3: Record<SettingId, number>;
};

export type MachinePreset = {
  id: string;
  name: string;
  bigPayout: number;
  regPayout: number;
  grapePayout: number;
  betPerSpin: number;

  /** ぶどう分母（設定別） */
  grapePerHitBySetting: Record<SettingId, number>;

  /** 非重複チェリー分母（設定別） */
  cherryNonOverlapPerHitBySetting: Record<SettingId, number>;

  /** 角チェリー配当（全機種2枚） */
  cherryPayout: number;

  /** 機械割 */
  payoutRates: PayoutRates;
};

export const PRESETS: MachinePreset[] = [
  {
    id: "myj5",
    name: "マイジャグラー5",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 5.90, 2: 5.85, 3: 5.80, 4: 5.78, 5: 5.76, 6: 5.66 },
    cherryNonOverlapPerHitBySetting: { 1: 38.10, 2: 38.10, 3: 36.82, 4: 35.62, 5: 35.62, 6: 35.62 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 98.00, 3: 99.90, 4: 102.80, 5: 105.30, 6: 109.40 },
      type2: { 1: 97.84, 2: 98.80, 3: 100.80, 4: 103.84, 5: 106.55, 6: 110.45 },
      type3: { 1: 98.61, 2: 99.73, 3: 101.97, 4: 105.09, 5: 107.97, 6: 112.44 },
    },
  },
  {
    id: "funky2",
    name: "ファンキージャグラー2",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 5.94, 2: 5.92, 3: 5.88, 4: 5.83, 5: 5.76, 6: 5.67 },
    cherryNonOverlapPerHitBySetting: { 1: 35.62, 2: 35.62, 3: 35.62, 4: 35.62, 5: 35.62, 6: 35.62 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 98.50, 3: 99.80, 4: 102.00, 5: 104.30, 6: 109.00 },
      type2: { 1: 97.83, 2: 99.36, 3: 100.99, 4: 103.40, 5: 106.04, 6: 111.35 },
      type3: { 1: 98.57, 2: 100.08, 3: 101.72, 4: 104.14, 5: 106.78, 6: 112.08 },
    },
  },
  {
    id: "im",
    name: "アイムジャグラー（6号機）",
    bigPayout: 252,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 6.02, 2: 6.02, 3: 6.02, 4: 6.02, 5: 6.02, 6: 5.78 },
    cherryNonOverlapPerHitBySetting: { 1: 35.62, 2: 35.62, 3: 35.62, 4: 35.62, 5: 35.62, 6: 35.62 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 98.00, 3: 99.50, 4: 101.10, 5: 103.30, 6: 105.50 },
      type2: { 1: 97.97, 2: 99.09, 3: 100.75, 4: 102.53, 5: 104.93, 6: 107.29 },
      type3: { 1: 98.70, 2: 99.82, 3: 101.48, 4: 103.27, 5: 105.66, 6: 108.01 },
    },
  },
  {
    id: "gogo3",
    name: "ゴーゴージャグラー3",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 6.25, 2: 6.20, 3: 6.15, 4: 6.07, 5: 6.00, 6: 5.92 },
    cherryNonOverlapPerHitBySetting: { 1: 33.56, 2: 33.47, 3: 33.32, 4: 33.15, 5: 33.10, 6: 32.97 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.20, 2: 98.20, 3: 99.40, 4: 101.60, 5: 103.80, 6: 106.50 },
      type2: { 1: 98.39, 2: 99.36, 3: 100.60, 4: 102.83, 5: 105.08, 6: 107.83 },
      type3: { 1: 99.08, 2: 100.05, 3: 101.29, 4: 103.51, 5: 105.76, 6: 108.51 },
    },
  },
  {
    id: "girls-ss",
    name: "ジャグラーガールズSS",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 5.98, 2: 5.98, 3: 5.98, 4: 5.98, 5: 5.88, 6: 5.83 },
    cherryNonOverlapPerHitBySetting: { 1: 33.56, 2: 33.47, 3: 33.21, 4: 33.15, 5: 33.10, 6: 32.97 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 97.90, 3: 99.90, 4: 102.10, 5: 104.00, 6: 107.50 },
      type2: { 1: 98.09, 2: 99.02, 3: 101.09, 4: 103.42, 5: 105.32, 6: 108.84 },
      type3: { 1: 98.78, 2: 99.71, 3: 101.77, 4: 104.10, 5: 106.00, 6: 109.52 },
    },
  },
  {
    id: "umj",
    name: "ウルトラミラクルジャグラー",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 5.93, 2: 5.93, 3: 5.93, 4: 5.93, 5: 5.87, 6: 5.81 },
    cherryNonOverlapPerHitBySetting: { 1: 35.10, 2: 35.00, 3: 34.80, 4: 34.70, 5: 33.50, 6: 33.00 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 98.10, 3: 99.80, 4: 102.10, 5: 104.50, 6: 108.10 },
      type2: { 1: 98.10, 2: 99.20, 3: 100.90, 4: 103.30, 5: 105.70, 6: 109.40 },
      type3: { 1: 98.80, 2: 99.90, 3: 101.70, 4: 104.00, 5: 106.50, 6: 110.10 },
    },
  },
  {
    id: "mrj",
    name: "ミスタージャグラー",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 6.29, 2: 6.22, 3: 6.15, 4: 6.09, 5: 6.02, 6: 5.96 },
    cherryNonOverlapPerHitBySetting: { 1: 37.24, 2: 37.24, 3: 37.24, 4: 37.24, 5: 37.24, 6: 37.24 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 98.00, 3: 99.80, 4: 102.70, 5: 105.50, 6: 107.30 },
      type2: { 1: 98.09, 2: 99.11, 3: 100.96, 4: 103.84, 5: 106.69, 6: 108.49 },
      type3: { 1: 99.50, 2: 100.52, 3: 102.37, 4: 105.24, 5: 108.09, 6: 109.89 },
    },
  },
  {
    id: "happyv3",
    name: "ハッピージャグラーVⅢ",
    bigPayout: 240,
    regPayout: 96,
    grapePayout: 7,
    betPerSpin: 3,
    grapePerHitBySetting: { 1: 6.05, 2: 6.01, 3: 5.98, 4: 5.83, 5: 5.81, 6: 5.79 },
    cherryNonOverlapPerHitBySetting: { 1: 62.24, 2: 62.47, 3: 62.95, 4: 64.00, 5: 64.57, 6: 65.34 },
    cherryPayout: 2,
    payoutRates: {
      type1: { 1: 97.00, 2: 98.10, 3: 99.90, 4: 102.90, 5: 105.80, 6: 108.40 },
      type2: { 1: 97.80, 2: 99.07, 3: 100.74, 4: 104.19, 5: 107.36, 6: 110.27 },
      type3: { 1: 98.68, 2: 99.96, 3: 101.83, 4: 105.08, 5: 108.25, 6: 111.15 },
    },
  },
];
