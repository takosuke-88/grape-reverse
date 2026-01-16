/** 設定番号の型（1〜6固定） */
export type Setting = 1 | 2 | 3 | 4 | 5 | 6

/** 設定別の確率データ（分母） */
export type SettingRates = {
  1: number
  2: number
  3: number
  4: number
  5: number
  6: number
}

/** 機種スペックの型定義 */
export type MachineSpec = {
  key: string
  label: string
  big: number
  reg: number
  cherryRateBySetting: SettingRates
  grapeRateBySetting: SettingRates
  bonusRateBySetting: {
    1: { big: number; reg: number; combined: number }
    2: { big: number; reg: number; combined: number }
    3: { big: number; reg: number; combined: number }
    4: { big: number; reg: number; combined: number }
    5: { big: number; reg: number; combined: number }
    6: { big: number; reg: number; combined: number }
  }
  /** 単独REG確率 (Proモード評価用) */
  soloReg?: SettingRates
}

/** 共通定数 */
export const CONSTS = {
  REPLAY_RATE: 1 / 7.298,
  REPLAY_PAYOUT: 3,
  CHERRY_PAYOUT: 2,
  GRAPE_PAYOUT: 8,
  REG_PAYOUT: 96,
  CHERRY_GET_FREE: 2 / 3,
  CHERRY_GET_AIM: 1.0,
}

/** SアイムEX／ネオアイムジャグラーEX（6号機） */
export const aimEX6: MachineSpec = {
  key: 'aim_ex6',
  label: 'SアイムEX／ネオアイムジャグラーEX（6号機）',
  big: 252,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 35.62,
    2: 1 / 35.62,
    3: 1 / 35.62,
    4: 1 / 35.62,
    5: 1 / 35.62,
    6: 1 / 35.62,
  },
  grapeRateBySetting: {
    1: 6.02,
    2: 6.02,
    3: 6.02,
    4: 6.02,
    5: 6.02,
    6: 5.78,
  },
  bonusRateBySetting: {
    1: { big: 273.1, reg: 439.8, combined: 168.5 },
    2: { big: 269.7, reg: 399.6, combined: 161.0 },
    3: { big: 269.7, reg: 331.0, combined: 148.6 },
    4: { big: 259.0, reg: 315.1, combined: 142.2 },
    5: { big: 259.0, reg: 255.0, combined: 128.5 },
    6: { big: 255.0, reg: 255.0, combined: 127.5 },
  },
  soloReg: {
    1: 630.15,
    2: 574.88,
    3: 474.90,
    4: 448.88,
    5: 364.09,
    6: 327.68,
  },
}

/** マイジャグラーV */
export const myJuggler5: MachineSpec = {
  key: 'myj5',
  label: 'マイジャグラーV',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 38.10,
    2: 1 / 38.10,
    3: 1 / 36.82,
    4: 1 / 35.62,
    5: 1 / 35.62,
    6: 1 / 35.62,
  },
  grapeRateBySetting: {
    1: 5.90,
    2: 5.85,
    3: 5.80,
    4: 5.78,
    5: 5.76,
    6: 5.66,
  },
  bonusRateBySetting: {
    1: { big: 273.1, reg: 409.6, combined: 163.8 },
    2: { big: 270.8, reg: 385.5, combined: 159.1 },
    3: { big: 266.4, reg: 336.1, combined: 148.6 },
    4: { big: 254.0, reg: 290.0, combined: 135.4 },
    5: { big: 240.1, reg: 268.6, combined: 126.8 },
    6: { big: 229.1, reg: 229.1, combined: 114.6 },
  },
  soloReg: {
    1: 655.36,
    2: 601.25,
    3: 492.75,
    4: 407.06,
    5: 390.10,
    6: 327.68,
  },
}

/** ファンキージャグラー2 */
export const funkyJuggler2: MachineSpec = {
  key: 'funky2',
  label: 'ファンキージャグラー2',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 35.62,
    2: 1 / 35.62,
    3: 1 / 35.62,
    4: 1 / 35.62,
    5: 1 / 35.62,
    6: 1 / 35.62,
  },
  grapeRateBySetting: {
    1: 5.94,
    2: 5.92,
    3: 5.88,
    4: 5.83,
    5: 5.76,
    6: 5.67,
  },
  bonusRateBySetting: {
    1: { big: 266.4, reg: 439.8, combined: 165.9 },
    2: { big: 259.0, reg: 407.1, combined: 158.3 },
    3: { big: 256.0, reg: 366.1, combined: 150.7 },
    4: { big: 249.2, reg: 322.8, combined: 140.6 },
    5: { big: 240.1, reg: 299.3, combined: 133.2 },
    6: { big: 219.9, reg: 262.1, combined: 119.6 },
  },
  soloReg: {
    1: 621.1,
    2: 567.5,
    3: 513.4,
    4: 450.9,
    5: 406.8,
    6: 355.9,
  },
}

/** ゴーゴージャグラー3 */
export const gogoJuggler3: MachineSpec = {
  key: 'gogo3',
  label: 'ゴーゴージャグラー3',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 33.56,
    2: 1 / 33.47,
    3: 1 / 33.32,
    4: 1 / 33.15,
    5: 1 / 33.10,
    6: 1 / 32.97,
  },
  grapeRateBySetting: {
    1: 6.25,
    2: 6.20,
    3: 6.15,
    4: 6.07,
    5: 6.00,
    6: 5.92,
  },
  bonusRateBySetting: {
    1: { big: 259.0, reg: 354.2, combined: 149.6 },
    2: { big: 258.0, reg: 332.7, combined: 145.3 },
    3: { big: 257.0, reg: 306.2, combined: 139.7 },
    4: { big: 254.0, reg: 268.6, combined: 130.5 },
    5: { big: 247.3, reg: 247.3, combined: 123.7 },
    6: { big: 234.9, reg: 234.9, combined: 117.4 },
  },
  soloReg: {
    1: 485.45,
    2: 451.97,
    3: 434.01,
    4: 383.25,
    5: 341.33,
    6: 320.03,
  },
}

/** ジャグラーガールズSS */
export const jugglerGirlsSS: MachineSpec = {
  key: 'girls_ss',
  label: 'ジャグラーガールズSS',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 33.56,
    2: 1 / 33.47,
    3: 1 / 33.21,
    4: 1 / 33.15,
    5: 1 / 33.10,
    6: 1 / 32.97,
  },
  grapeRateBySetting: {
    1: 5.98,
    2: 5.98,
    3: 5.98,
    4: 5.98,
    5: 5.88,
    6: 5.83,
  },
  bonusRateBySetting: {
    1: { big: 273.1, reg: 381.0, combined: 159.1 },
    2: { big: 270.8, reg: 350.5, combined: 152.8 },
    3: { big: 260.1, reg: 316.6, combined: 142.8 },
    4: { big: 250.1, reg: 281.3, combined: 132.4 },
    5: { big: 243.6, reg: 270.8, combined: 128.3 },
    6: { big: 226.0, reg: 252.1, combined: 119.2 },
  },
  soloReg: {
    1: 520.1,
    2: 481.9,
    3: 436.9,
    4: 397.2,
    5: 358.1, // 推定値
    6: 269.8, // 実戦値・推定値
  },
}

/** ウルトラミラクルジャグラー */
export const ultraMiracleJuggler: MachineSpec = {
  key: 'ultra_miracle',
  label: 'ウルトラミラクルジャグラー',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 35.1,
    2: 1 / 35.0,
    3: 1 / 34.8,
    4: 1 / 34.7,
    5: 1 / 33.5,
    6: 1 / 33.0,
  },
  grapeRateBySetting: {
    1: 5.93,
    2: 5.93,
    3: 5.93,
    4: 5.93,
    5: 5.87,
    6: 5.81,
  },
  bonusRateBySetting: {
    1: { big: 267.5, reg: 425.6, combined: 164.3 },
    2: { big: 261.1, reg: 402.1, combined: 158.3 },
    3: { big: 256.0, reg: 350.5, combined: 147.9 },
    4: { big: 242.7, reg: 322.8, combined: 138.6 },
    5: { big: 233.2, reg: 297.9, combined: 130.8 },
    6: { big: 216.3, reg: 277.7, combined: 121.6 },
  },
  soloReg: {
    1: 630.0, // 推定
    2: 590.0, // 推定
    3: 490.0, // 推定
    4: 450.0, // 推定
    5: 414.8, // 予測値
    6: 379.9, // 予測値
  },
}

/** ミスタージャグラー */
export const misterJuggler: MachineSpec = {
  key: 'mister',
  label: 'ミスタージャグラー',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 37.24,
    2: 1 / 37.24,
    3: 1 / 37.24,
    4: 1 / 37.24,
    5: 1 / 37.24,
    6: 1 / 37.24,
  },
  grapeRateBySetting: {
    1: 6.29,
    2: 6.22,
    3: 6.15,
    4: 6.09,
    5: 6.02,
    6: 5.96,
  },
  bonusRateBySetting: {
    1: { big: 268.6, reg: 374.5, combined: 156.4 },
    2: { big: 267.5, reg: 354.2, combined: 152.4 },
    3: { big: 260.1, reg: 331.0, combined: 145.6 },
    4: { big: 249.2, reg: 291.3, combined: 134.3 },
    5: { big: 240.9, reg: 257.0, combined: 124.4 },
    6: { big: 237.4, reg: 237.4, combined: 118.7 },
  },
  soloReg: {
    1: 512.00,
    2: 478.37,
    3: 439.84,
    4: 378.82,
    5: 327.68,
    6: 297.89,
  },
}

/** ハッピージャグラーVⅢ（ブイスリー） */
export const happyJugglerV3: MachineSpec = {
  key: 'happy_v3',
  label: 'ハッピージャグラーVⅢ（ブイスリー）',
  big: 240,
  reg: CONSTS.REG_PAYOUT,
  cherryRateBySetting: {
    1: 1 / 62.24,
    2: 1 / 62.47,
    3: 1 / 62.95,
    4: 1 / 64.00,
    5: 1 / 64.57,
    6: 1 / 65.34,
  },
  grapeRateBySetting: {
    1: 6.04,
    2: 6.03,
    3: 6.00,
    4: 5.86,
    5: 5.81,
    6: 5.79,
  },
  bonusRateBySetting: {
    1: { big: 273.1, reg: 397.2, combined: 161.8 },
    2: { big: 270.8, reg: 362.1, combined: 154.9 },
    3: { big: 263.2, reg: 332.7, combined: 146.9 },
    4: { big: 254.0, reg: 300.6, combined: 137.7 },
    5: { big: 239.2, reg: 273.1, combined: 127.5 },
    6: { big: 226.0, reg: 256.0, combined: 120.0 },
  },
  soloReg: {
    1: 682.67,
    2: 612.49,
    3: 574.88,
    4: 496.49,
    5: 455.11,
    6: 439.84,
  },
}

/** すべての機種データをまとめた配列 */
export const ALL_MACHINES: MachineSpec[] = [
  aimEX6,
  myJuggler5,
  funkyJuggler2,
  gogoJuggler3,
  jugglerGirlsSS,
  ultraMiracleJuggler,
  misterJuggler,
  happyJugglerV3,
]

/** 機種キーから機種データを取得 */
export function getMachineByKey(key: string): MachineSpec | undefined {
  return ALL_MACHINES.find(m => m.key === key)
}

