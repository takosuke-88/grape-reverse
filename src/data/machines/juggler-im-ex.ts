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
            1: 668.7,
            2: 595.8,
            3: 474.9,
            4: 448.9,
            5: 381.0,
            6: 381.0,
          },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          settingValues: {
            1: 1285.0,
            2: 1213.6,
            3: 1092.3,
            4: 1057.0,
            5: 771.0,
            6: 771.0,
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
    big_solo: [407.1, 402.0, 402.0, 381.0, 381.0, 372.4],
    big_cherry: [1424.7, 1394.4, 1394.4, 1336.8, 1336.8, 1285.0],
    reg_solo: [668.7, 595.8, 474.9, 448.9, 381.0, 381.0],
    reg_cherry: [1285.0, 1213.6, 1092.3, 1057.0, 771.0, 771.0],
  },
};
