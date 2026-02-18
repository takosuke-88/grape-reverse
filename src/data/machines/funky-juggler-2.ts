import type { MachineConfig } from "../../types/machine-schema";

/**
 * ファンキージャグラー2の設定判別データ
 */
export const funkyJuggler2Config: MachineConfig = {
  id: "funky-juggler-2",
  name: "ファンキージャグラー2",
  type: "A-type",
  themeColor: "bg-fuchsia-600",
  sections: [
    {
      id: "basic-data",
      title: "基本データ",
      elements: [
        {
          id: "total-games",
          label: "総ゲーム数",
          type: "counter",
          context: {},
          settingValues: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
          },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
    {
      id: "bonus-section",
      title: "ボーナス回数",
      elements: [
        {
          id: "big-count",
          label: "BIG回数",
          type: "counter",
          unit: "回",
          settingValues: {
            1: 266.4,
            2: 259.0,
            3: 256.0,
            4: 249.2,
            5: 240.1,
            6: 232.4,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 0.35,
          isReadOnly: true,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          settingValues: {
            1: 424.4,
            2: 387.8,
            3: 354.2,
            4: 324.4,
            5: 288.7,
            6: 268.6,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
          isReadOnly: true,
        },
      ],
    },
    {
      id: "bonus-breakdown-section",
      title: "ボーナス詳細内訳",
      elements: [
        // BIG Breakdown
        {
          id: "big-solo-count",
          label: "単独BIG",
          type: "counter",
          unit: "回",
          settingValues: {}, // 設定差なし/不明な場合は空またはデフォルト
          isDiscriminationFactor: false,
          visibility: "detail",
        },
        {
          id: "big-cherry-count",
          label: "チェリーBIG",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
        },
        {
          id: "big-unknown-count",
          label: "契機不明BIG",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
        },
        // REG Breakdown
        {
          id: "reg-solo-count",
          label: "単独REG",
          type: "counter",
          unit: "回",
          settingValues: {
            1: 618.3,
            2: 569.9,
            3: 524.2,
            4: 485.5,
            5: 425.6,
            6: 390.1,
          },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          settingValues: {
            1: 1423.0,
            2: 1369.5,
            3: 1317.1,
            4: 1174.7,
            5: 1100.8,
            6: 1005.0,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 0.8,
          conflictsWith: ["reg-count"],
          visibility: "detail",
        },
        {
          id: "reg-unknown-count",
          label: "契機不明REG",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
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
          settingValues: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
          },
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
          id: "grape-count",
          label: "ブドウ",
          type: "counter",
          context: {},
          settingValues: {
            1: 5.95,
            2: 5.92,
            3: 5.88,
            4: 5.83,
            5: 5.76,
            6: 5.66,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 42, // 推定コイン持ち
    payoutRatio: [97.0, 98.5, 99.8, 102.0, 104.3, 109.0], // 設定1〜6の機械割
    payouts: {
      big: 240,
      reg: 96,
      grape: 8,
    },
    judgmentWeights: {
      grapeWeightMap: {
        0: 0.1,
        2000: 0.2,
        4000: 0.5,
        6000: 0.8,
        8000: 1.0,
      },
      regBaseWeight: 1.2,
      bigBaseWeight: 0.35,
    },
  },
  detailedProbabilities: {
    big_solo: [404.3, 401.9, 394.1, 381.1, 377.5, 336.1],
    big_cherry: [1422.3, 1389.0, 1321.9, 1352.3, 1289.4, 1197.9],
    reg_solo: [636.1, 571.9, 510.6, 449.2, 408.3, 360.2],
    reg_cherry: [1423.1, 1369.5, 1317.1, 1174.7, 1100.8, 1005.0],
  },
};
