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
            1: 624.2,
            2: 574.9,
            3: 508.0,
            4: 442.8,
            5: 418.0,
            6: 366.1,
          },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          settingValues: {
            1: 1489.5,
            2: 1394.4,
            3: 1310.7,
            4: 1191.6,
            5: 1054.0,
            6: 923.0,
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
            1: 5.94,
            2: 5.92,
            3: 5.88,
            4: 5.83,
            5: 5.76,
            6: 5.67,
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
    big_solo: [362.1, 350.5, 344.9, 334.4, 321.3, 292.6],
    big_cherry: [1008.2, 993.0, 993.0, 978.1, 949.8, 885.6],
    reg_solo: [624.2, 574.9, 508.0, 442.8, 418.0, 366.1],
    reg_cherry: [1489.5, 1394.4, 1310.7, 1191.6, 1054.0, 923.0],
  },
};
