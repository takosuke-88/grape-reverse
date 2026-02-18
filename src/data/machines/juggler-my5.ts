import type { MachineConfig } from "../../types/machine-schema";

/**
 * マイジャグラーVの設定判別データ
 */
export const myJuggler5Config: MachineConfig = {
  id: "my-juggler-5",
  name: "マイジャグラーV",
  type: "A-type",
  themeColor: "bg-pink-500", // マイジャグらしいピンク/パープル系
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
            2: 270.8,
            3: 266.4,
            4: 254.0,
            5: 240.1,
            6: 229.1,
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
            1: 409.6,
            2: 385.5,
            3: 336.1,
            4: 290.0,
            5: 268.6,
            6: 229.1,
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
            1: 655.4,
            2: 601.3,
            3: 492.8,
            4: 407.1,
            5: 390.1,
            6: 327.7,
          },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          settingValues: {
            1: 1092.3,
            2: 1074.4,
            3: 1057.0,
            4: 1008.3,
            5: 862.3,
            6: 762.1,
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
            1: 5.9,
            2: 5.85,
            3: 5.8,
            4: 5.78,
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
    baseGamesPerMedal: 42,
    payoutRatio: [97.0, 98.0, 99.9, 102.8, 105.3, 109.4],
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
    big_solo: [410.3, 410.0, 398.2, 377.1, 352.9, 342.2],
    big_cherry: [882.4, 871.3, 857.0, 823.6, 806.5, 762.4],
    reg_solo: [655.4, 601.3, 492.8, 407.1, 390.1, 327.7],
    reg_cherry: [1092.3, 1074.4, 1057.0, 1008.3, 862.3, 762.1],
  },
};
