import type { MachineConfig } from "../../types/machine-schema";

export const lastUtopiaConfig: MachineConfig = {
  id: "last-utopia",
  name: "ラストユートピア",
  title: "ラストユートピアの設定判別・ベル逆算 -GrapeReverse",
  type: "A-type",
  themeColor: "bg-blue-600",
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
          context: { duringBonus: "big", description: "BIGの回数を入力" },
          settingValues: { 1: 228, 2: 224, 3: 219, 4: 215, 5: 211, 6: 208 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: { duringBonus: "reg", description: "REGの回数を入力" },
          settingValues: { 1: 712, 2: 606, 3: 546, 4: 496, 5: 455, 6: 414 },
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
  ],
  specs: {
    baseGamesPerMedal: 38.0,
    payoutRatio: [97.0, 99.0, 101.0, 103.0, 106.0, 110.0],
    payouts: {
      big: 252,
      reg: 96,
      bell: 10,
      grape: 10,
    },
  },
};
