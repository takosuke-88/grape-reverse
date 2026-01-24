export type HanaHanaMachine = {
  id: string;
  name: string;
  bellLabel: string; // "ベル" or "ベル+スイカ"
  settings: number[]; // 設定1~6
  bellProbabilities: number[]; // 設定1~6の分母
  bigProbabilities: number[];
  regProbabilities: number[];
  hasBigSuika?: boolean; // BIG中スイカの概念があるか
  bigSuikaProbabilities?: number[]; // 設定1~6の分母 (ある場合)
  payoutRatios?: number[]; // 設定1~6の機械割(%)
  coinPayout?: { big: number; reg: number }; // BIG/REGの払い出し枚数
};

export const hanahanaData: Record<string, HanaHanaMachine> = {
  'star-hanahana': {
    id: 'star-hanahana',
    name: 'スターハナハナ-30',
    bellLabel: 'ベル',
    settings: [1, 2, 3, 4, 5, 6],
    bellProbabilities: [6.358, 6.303, 6.300, 6.260, 6.204, 6.200],
    bigProbabilities: [240, 237, 234, 231, 228, 225], // ※概算値補完
    regProbabilities: [487, 460, 430, 400, 370, 340], // ※概算値補完
    hasBigSuika: true,
    bigSuikaProbabilities: [47.127, 42.864, 39.667, 36.991, 34.707, 31.266]
  },
  'dragon-hanahana': {
    id: 'dragon-hanahana',
    name: 'ドラゴンハナハナ～閃光～-30',
    bellLabel: 'ベル',
    settings: [1, 2, 3, 4, 5, 6],
    bellProbabilities: [7.50, 7.45, 7.39, 7.35, 7.30, 6.96],
    bigProbabilities: [256, 250, 240, 230, 215, 199],
    regProbabilities: [642, 600, 560, 520, 460, 399],
    hasBigSuika: false // 解析なし/差が少ないため省略
  },
  'king-hanahana': {
    id: 'king-hanahana',
    name: 'キングハナハナ-30',
    bellLabel: 'ベル',
    settings: [1, 2, 3, 4, 5, 6],
    bellProbabilities: [7.97, 7.70, 7.50, 7.36, 7.19, 7.07], // 実戦値ベース補正
    bigProbabilities: [292, 280, 268, 256, 244, 232],
    regProbabilities: [489, 460, 430, 399, 369, 339],
    hasBigSuika: true,
    bigSuikaProbabilities: [40.06, 38.0, 36.0, 34.0, 32.0, 31.4], // 補完値含む
    payoutRatios: [97.8, 99.9, 102.0, 104.2, 107.0, 110.0], // 設定1〜6の機械割
    coinPayout: { big: 252, reg: 96 } // BIG252枚、REG96枚
  },
  'houoh-tensho': {
    id: 'houoh-tensho',
    name: 'ハナハナホウオウ～天翔～',
    bellLabel: 'ベル',
    settings: [1, 2, 3, 4, 5, 6],
    bellProbabilities: [7.50, 7.45, 7.39, 7.36, 7.25, 7.07], // 7.07は推測値
    bigProbabilities: [297, 284, 273, 262, 250, 236],
    regProbabilities: [496, 464, 436, 407, 372, 337],
    hasBigSuika: true,
    bigSuikaProbabilities: [48.5, 47.0, 45.0, 42.0, 38.0, 32.0] // 補完値含む
  },
  'high-high-shiosai': {
    id: 'high-high-shiosai',
    name: 'ハイハイシオサイ(6号機)',
    bellLabel: 'ベル＋スイカ合算',
    settings: [1, 2, 3, 5, 6], // ※設定4なし
    bellProbabilities: [7.30, 7.10, 6.90, 6.73, 6.60], // 合算値
    bigProbabilities: [194, 185, 175, 160, 148],
    regProbabilities: [202, 192, 182, 172, 165],
    hasBigSuika: false
  }
};
