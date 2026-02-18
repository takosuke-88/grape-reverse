import type { MachineConfig } from "../../types/machine-schema";

/**
 * SアイムジャグラーEX / ネオアイムジャグラーEX の設定判別データ
 * 6号機アイムとネオアイムは内部数値が同一のため統合
 */
export const imJugglerExConfig: MachineConfig = {
  id: "im-juggler-ex",
  name: "SアイムEX/ネオアイムEX",
  type: "A-type",
  themeColor: "bg-red-600", // アイムらしい赤
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
            1: 273.1,
            2: 269.7,
            3: 269.7,
            4: 259.0,
            5: 259.0,
            6: 255.0,
          },
          isDiscriminationFactor: true,
          // 設定差が小さいのでウェイトを下げる
          discriminationWeight: 0.1,
          isReadOnly: true,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          settingValues: {
            1: 439.8,
            2: 399.6,
            3: 331.0,
            4: 315.1,
            5: 255.0,
            6: 255.0,
          },
          isDiscriminationFactor: true,
          // アイムはREGが全てなのでウェイトを上げる
          discriminationWeight: 1.3,
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
          settingValues: {},
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
            1: 662.0,
            2: 589.7,
            3: 471.5,
            4: 442.8,
            5: 376.6,
            6: 376.6,
          },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          settingValues: {
            1: 1310.7,
            2: 1236.5,
            3: 1110.8,
            4: 1092.3,
            5: 789.6,
            6: 789.6,
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
            1: 6.02,
            2: 6.02,
            3: 6.02,
            4: 6.02,
            5: 6.02,
            6: 5.78,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 40,
    payoutRatio: [97.0, 98.0, 99.5, 101.1, 103.3, 105.5],
    payouts: {
      big: 252,
      reg: 96,
      grape: 8,
    },
    judgmentWeights: {
      grapeWeightMap: {
        0: 0.05,
        3000: 0.2,
        5000: 0.5,
        7000: 0.9,
        8000: 1.0,
      },
      regBaseWeight: 1.3,
      bigBaseWeight: 0.1,
    },
  },
  detailedProbabilities: {
    big_solo: [402.0, 394.8, 394.8, 376.6, 376.6, 368.2],
    big_cherry: [1456.4, 1424.7, 1424.7, 1365.3, 1365.3, 1310.7],
    reg_solo: [662.0, 589.7, 471.5, 442.8, 376.6, 376.6],
    reg_cherry: [1310.7, 1236.5, 1110.8, 1092.3, 789.6, 789.6],
  },
};
