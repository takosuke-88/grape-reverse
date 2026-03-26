import type { MachineConfig } from "../../types/machine-schema";

export const newKingVConfig: MachineConfig = {
  id: "new-king-v",
  name: "ニューキングハナハナV-30",
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
  seoContent: [
    {
      title: "ニューキングハナハナV-30の特徴と設定Vのリアルな挙動",
      paragraphs: [
        "ニューキングハナハナV-30は設定が1〜Vの5段階制という、<strong>6号機ハナハナシリーズ唯一の変則仕様だ</strong>。最高設定「設定V」の機械割は108%で、キングハナハナ-30（設定6/110%）より2ポイント低い。合算も設定Vで1/150と、キングハナハナの1/136より重い。「同じ6号機ハナハナ」と思って感覚を引き継ぐと痛い目を見る。",
        "設定Vの挙動はBIGとREGのバランスが安定しやすく、サイドランプに高頻度で強色が出るのが目安だ。ただし設定差幅が小さいぶん、設定V台でも終日を通じて「なんとなく平凡」なグラフを描きやすい。体感だけでは判断しにくいってやつだ。",
      ],
    },
    {
      title: "ニューキングハナハナV-30で勝つための設定判別ポイント（なぜ逆算が必要か）",
      paragraphs: [
        "この機種の判別で最も注意すべきは、ベル確率の設定差がキングハナハナより更に小さい点だ。逆算実戦値では設定2〜4が1/7.27〜1/7.53と非常に近接しており、数千ゲーム程度ではほとんど差が出ない。「ベルが軽い気がするから設定V」という判断は危険だ。",
        "だからこそ上部の逆算ツールに差枚・ゲーム数・ボーナス回数を入れてベル確率を数値化する作業が欠かせない。REG比率・フェザーランプ・ベルの三点を積み上げて初めて推測が成立する。",
        "<strong>キングハナハナとスペック感を混同したまま打ち続けるのが、この機種で負ける最大の原因だ。</strong>逆算なしで判別できると思ってるなら、それは勘に頼ってるだけだ。",
      ],
    },
  ],
};
