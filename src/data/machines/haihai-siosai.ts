import type { MachineConfig } from "../../types/machine-schema";

export const haihaiSiosaiConfig: MachineConfig = {
  id: "haihai-siosai",
  name: "ハイハイシオサイ",
  type: "A-type",
  themeColor: "bg-teal-700",
  sections: [
    {
      id: "basic-data",
      title: "基本データ",
      elements: [
        {
          id: "total-games",
          label: "総ゲーム数",
          type: "counter",
          context: { description: "実際に回した総ゲーム数" },
          settingValues: { 1: 0, 2: 0, 3: 0, 5: 0, 6: 0 },
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
          context: { duringBonus: "big", description: "BIGの回数を入力" },
          settingValues: { 1: 198, 2: 190, 3: 184, 5: 172, 6: 165 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: { duringBonus: "reg", description: "REGの回数を入力" },
          settingValues: { 1: 198, 2: 190, 3: 184, 5: 172, 6: 165 },
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
          settingValues: { 1: 0, 2: 0, 3: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
  ],
  specs: {
    settings: [1, 2, 3, 5, 6],
    baseGamesPerMedal: 32.0,
    payoutRatio: [97.5, 99.0, 101.0, 105.0, 108.0],
    payouts: {
      big: 194,
      reg: 102,
      bell: 10,
      grape: 10,
    },
  },
};
