import type { MachineConfig } from "../../types/machine-schema";

/**
 * ハナハナホウオウ～天翔～の設定判別データ
 */
export const hanaHoohConfig: MachineConfig = {
  id: "hana-hooh",
  name: "ハナハナホウオウ～天翔～",
  type: "A-type",
  themeColor: "bg-rose-600",
  sections: [
    {
      id: "basic-data",
      title: "基本データ",
      elements: [
        {
          id: "total-games",
          label: "総ゲーム数",
          type: "counter",
          context: {
            description: "実際に回した総ゲーム数",
          },
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
    {
      id: "bonus-section",
      title: "ボーナス確率",
      elements: [
        {
          id: "big-count",
          label: "BIG回数",
          type: "counter",
          unit: "回",
          context: {
            duringBonus: "big",
            description: "BIGボーナスの回数を入力",
          },
          settingValues: { 1: 297, 2: 284, 3: 273, 4: 262, 5: 249, 6: 236 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: {
            duringBonus: "reg",
            description: "REGボーナスの回数を入力",
          },
          settingValues: { 1: 496, 2: 458, 3: 425, 4: 397, 5: 366, 6: 337 },
          isDiscriminationFactor: true,
          discriminationWeight: 2.0,
        },
      ],
    },
    {
      id: "other-section",
      title: "その他",
      elements: [
        {
          id: "diff-coins",
          label: "差枚数",
          type: "counter",
          visibility: "grape-calc",
          context: {},
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
    {
      id: "normal-role-section",
      title: "通常時小役",
      elements: [
        {
          id: "bell-count",
          label: "ベル回数",
          type: "counter",
          context: {
            description: "ベル（10枚役）の成立回数",
          },
          settingValues: {
            1: 7.5,
            2: 7.45,
            3: 7.4,
            4: 7.35,
            5: 7.298,
            6: 7.22,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
      ],
    },
    {
      id: "big-role-section",
      title: "BIG中要素",
      elements: [
        {
          id: "big-suika-count",
          label: "スイカ回数",
          type: "counter",
          context: {
            duringBonus: "big",
            description: "BIG中のスイカ成立回数",
          },
          // BIG 1回あたり24Gとした場合の通常ゲーム1Gあたりの出現確率（分母）
          settingValues: {
            1: 583.2,
            2: 507.22,
            3: 451.21,
            4: 403.82,
            5: 360.09,
            6: 307.45,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.8,
        },
      ],
    },
    {
      id: "reg-role-section",
      title: "REG中サイドランプ",
      elements: [
        {
          id: "reg-lamp-blue",
          label: "青 (奇数示唆)",
          type: "counter",
          // REG自体の確率に対する発生割合から算出した通常ゲーム1Gあたりの出現確率（分母）
          settingValues: {
            1: 1377.78,
            2: 1974.14,
            3: 1264.88,
            4: 1837.96,
            5: 1176.85,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-lamp-yellow",
          label: "黄 (偶数示唆)",
          type: "counter",
          settingValues: {
            1: 2066.67,
            2: 1316.09,
            3: 1897.32,
            4: 1229.1,
            5: 1768.12,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-lamp-green",
          label: "緑 (奇数強示唆)",
          type: "counter",
          settingValues: {
            1: 2066.67,
            2: 2726.19,
            3: 1609.85,
            4: 2157.61,
            5: 1275.26,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
        {
          id: "reg-lamp-red",
          label: "赤 (偶数強示唆)",
          type: "counter",
          settingValues: {
            1: 3100,
            2: 1817.46,
            3: 2414.77,
            4: 1443.64,
            5: 1916.23,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
      ],
    },
    {
      id: "bonus-after-section",
      title: "ボーナス後要素",
      elements: [
        {
          id: "feather-lamp-count",
          label: "フェザー合算",
          type: "counter",
          // BIG確率に対する発生割合から算出した通常Gベース（分母）
          settingValues: {
            1: 3041.28,
            2: 2689.48,
            3: 2328.69,
            4: 2030.5,
            5: 1767.9,
            6: 1508.04,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 0.8,
        },
        {
          id: "retro-sound-count",
          label: "レトロサウンド発生",
          type: "counter",
          settingValues: {
            1: 4796.55,
            2: 3831.16,
            3: 3401.58,
            4: 2803.4,
            5: 2365.5,
            6: 1824.28,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 0.6,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 39,
    payoutRatio: [97.8, 99.9, 102.0, 104.2, 107.0, 110.0],
    payouts: {
      big: 240,
      reg: 120, // HANA-HOOH
      bell: 10,
    },
    judgmentWeights: {
      grapeWeightMap: { 0: 0.1, 2000: 0.2, 4000: 0.5, 6000: 0.8, 8000: 1.0 },
      regBaseWeight: 2.0,
      bigBaseWeight: 1.5,
    },
    reverseCalcProbDenominators: {
      replay: 7.3,
      cherry: 36.0,
    },
  },
  detailedProbabilities: {
    big_suika_raw: [47.127, 42.864, 39.667, 36.991, 34.707, 31.266],
    reg_lamp_blue_raw: [0.36, 0.232, 0.336, 0.216, 0.311, 0.248],
    reg_lamp_yellow_raw: [0.24, 0.348, 0.224, 0.323, 0.207, 0.248],
    reg_lamp_green_raw: [0.24, 0.168, 0.264, 0.184, 0.287, 0.248],
    reg_lamp_red_raw: [0.16, 0.252, 0.176, 0.275, 0.191, 0.248],
    feather_lamp_raw: [10.24, 9.47, 8.53, 7.75, 7.1, 6.39],
    retro_sound_raw: [16.15, 13.49, 12.46, 10.7, 9.5, 7.73],
  },
};
