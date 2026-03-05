import type { MachineConfig } from "../../types/machine-schema";

export const newKingVConfig: MachineConfig = {
  id: "new-king-v",
  name: "ニューキングハナハナV-30",
  title: "ニューキングハナハナVの設定判別・ベル逆算 -GrapeReverse",
  type: "A-type",
  themeColor: "bg-purple-600",
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
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 6: 0 },
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
          settingValues: { 1: 299, 2: 287, 3: 277, 4: 266, 6: 253 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: { duringBonus: "reg", description: "REGの回数を入力" },
          settingValues: { 1: 496, 2: 464, 3: 434, 4: 404, 6: 372 },
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
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 6: 0 },
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
          context: { description: "ベル（10枚役）の成立回数" },
          settingValues: { 1: 7.62, 2: 7.55, 3: 7.48, 4: 7.41, 6: 7.26 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
      ],
    },
    {
      id: "big-role-section",
      title: "BIG中要素",
      layout: "grid",
      elements: [
        {
          id: "big-suika-count",
          label: "BIG中 スイカ",
          type: "counter",
          visibility: "detail",
          context: { duringBonus: "big", description: "BIG中のスイカ成立回数" },
          settingValues: { 1: 47.1, 2: 42.8, 3: 39.6, 4: 36.9, 6: 31.2 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.8,
        },
      ],
    },
    {
      id: "reg-role-section",
      title: "REG中ビタ押し時サイドランプ",
      layout: "grid",
      elements: [
        {
          id: "reg-lamp-blue",
          label: "青 (奇数示唆)",
          type: "counter",
          visibility: "detail",
          settingValues: {
            1: 1377.78,
            2: 1974.14,
            3: 1264.88,
            4: 1837.96,
            6: 1358.87,
          }, // using standard ratio approx
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-lamp-yellow",
          label: "黄 (偶数示唆)",
          type: "counter",
          visibility: "detail",
          settingValues: {
            1: 2066.67,
            2: 1316.09,
            3: 1897.32,
            4: 1229.1,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-lamp-purple",
          label: "紫 (設定V確定!)",
          type: "counter",
          visibility: "detail",
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 6: 0 },
          isDiscriminationFactor: false,
          conflictsWith: ["reg-count"], // will use hardcoded 100% logic via bonus-rainbow flag pattern below
          discriminationWeight: 0,
        },
        {
          id: "bonus-rainbow", // Used in bayes-estimator as standard 100% flag
          label: "紫サイドランプ (ベイズ処理用裏フラグ)",
          type: "counter",
          visibility: "table-only", // hidden from normal view
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
  ],
  specs: {
    settings: [1, 2, 3, 4, 6],
    settingLabels: {
      6: "V",
    },
    baseGamesPerMedal: 38.0,
    payoutRatio: [97.0, 99.0, 101.0, 103.0, 110.0],
    payouts: {
      big: 260,
      reg: 120,
      bell: 10,
      grape: 10,
    },
  },
};
