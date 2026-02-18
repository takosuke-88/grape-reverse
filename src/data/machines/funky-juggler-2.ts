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
            6: 219.9,
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
            1: 439.8,
            2: 407.1,
            3: 366.1,
            4: 322.8,
            5: 299.3,
            6: 262.1,
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
            1: 630.2,
            2: 574.9,
            3: 504.1,
            4: 436.9,
            5: 397.2,
            6: 344.9,
          },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          settingValues: {
            1: 1456.4,
            2: 1394.4,
            3: 1337.5,
            4: 1236.5,
            5: 1213.6,
            6: 1092.3,
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
            1: 5.84,
            2: 5.82,
            3: 5.79,
            4: 5.74,
            5: 5.67,
            6: 5.6,
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
    big_solo: [360.1, 348.6, 343.3, 332.7, 319.7, 291.3],
    big_cherry: [1024.0, 1008.2, 1008.2, 993.0, 963.8, 897.8],
    reg_solo: [630.2, 574.9, 504.1, 436.9, 397.2, 344.9],
    reg_cherry: [1456.4, 1394.4, 1337.5, 1236.5, 1213.6, 1092.3],
  },
};
