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
          visibility: "always",
          context: {
            duringBonus: "big",
          },
          settingValues: {
            1: 266.4,
            2: 259.0,
            3: 256.0,
            4: 249.2,
            5: 240.1,
            6: 219.9,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          visibility: "always",
          context: {
            duringBonus: "reg",
          },
          settingValues: {
            1: 439.8,
            2: 407.1,
            3: 366.1,
            4: 322.8,
            5: 299.3,
            6: 262.1,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 2.5,
        },
        {
          id: "bonus-combined",
          label: "合成",
          type: "counter",
          visibility: "table-only",
          settingValues: {
            1: 165.9,
            2: 158.3,
            3: 150.7,
            4: 140.6,
            5: 133.2,
            6: 119.6,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 0,
        },
      ],
    },
    {
      id: "bonus-detail-section",
      title: "ボーナス詳細",
      elements: [
        {
          id: "big-solo-count",
          label: "単独BIG",
          type: "counter",
          visibility: "detail",
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
        },
        {
          id: "big-cherry-count",
          label: "チェリーBIG",
          type: "counter",
          visibility: "detail",
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
        },
        {
          id: "reg-solo-count",
          label: "単独REG",
          type: "counter",
          visibility: "detail",
          settingValues: {
            1: 650.7,
            2: 568.0,
            3: 500.1,
            4: 444.7,
            5: 410.0,
            6: 345.8,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
          conflictsWith: ["reg-count"],
        },
        {
          id: "reg-cherry-count",
          label: "チェリーREG",
          type: "counter",
          visibility: "detail",
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
      regBaseWeight: 1.0,
      bigBaseWeight: 0.2,
    },
  },
};
