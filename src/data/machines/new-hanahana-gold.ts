import type { MachineConfig } from "../../types/machine-schema";

export const newHanahanaGoldConfig: MachineConfig = {
  id: "new-hanahana-gold",
  name: "ニューハナハナゴールド-30",
  type: "A-type",
  themeColor: "bg-yellow-500", // "Gold" theme
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
          settingValues: { 1: 297, 2: 284, 3: 273, 4: 262, 5: 251, 6: 240 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: { duringBonus: "reg", description: "REGの回数を入力" },
          settingValues: { 1: 496, 2: 458, 3: 425, 4: 397, 5: 370, 6: 344 },
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
    {
      id: "normal-role-section",
      title: "通常時小役",
      elements: [
        {
          id: "bell-count",
          label: "ベル回数",
          type: "counter",
          context: { description: "ベル（10枚役）の成立回数" },
          settingValues: {
            1: 7.3,
            2: 7.3,
            3: 7.2,
            4: 7.1,
            5: 7.0,
            6: 6.9,
          },
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
          settingValues: {
            1: 47.0,
            2: 47.0,
            3: 43.0,
            4: 39.0,
            5: 35.0,
            6: 31.0,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.8,
        },
      ],
    },
    {
      id: "reg-role-section",
      title: "REG中サイドランプ (AI示唆用)",
      layout: "grid",
      elements: [
        {
          id: "reg-lamp-blue",
          label: "青 (奇数示唆)",
          type: "counter",
          visibility: "detail",
          settingValues: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
          },
          // NOT factored into standard numerical settings due to missing exact probabilities
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
        {
          id: "reg-lamp-yellow",
          label: "黄 (偶数示唆)",
          type: "counter",
          visibility: "detail",
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
        {
          id: "reg-lamp-green",
          label: "緑 (奇数示唆)",
          type: "counter",
          visibility: "detail",
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
        {
          id: "reg-lamp-red",
          label: "赤 (偶数示唆)",
          type: "counter",
          visibility: "detail",
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
      id: "bonus-after-section",
      title: "ボーナス後トップパネル (AI示唆用)",
      layout: "grid",
      elements: [
        {
          id: "reg-after-panel",
          label: "REG後 点灯 (設定2以上濃厚)",
          type: "counter",
          visibility: "detail",
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
        {
          id: "bonus-rainbow",
          label: "虹点灯 (高設定期待大)",
          type: "counter",
          visibility: "detail",
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 40.2, // standard roughly 40g per 50 medals
    payoutRatio: [97.0, 99.0, 101.0, 103.0, 105.0, 107.0], // estimate placeholders to not break UI graph logic
    payouts: {
      big: 260,
      reg: 120,
      bell: 10,
      grape: 10,
    },
    judgmentWeights: {
      grapeWeightMap: { 0: 0.1, 2000: 0.2, 4000: 0.5, 6000: 0.8, 8000: 1.0 },
      regBaseWeight: 2.0,
      bigBaseWeight: 1.5,
    },
    // Used by reverse calc component to estimate bell probabilities
    reverseCalcProbDenominators: {
      replay: 7.3,
      cherry: 36.0,
    },
  },
  // Text exceptions / hints displayed on-screen or used by AI
  exceptions: [
    {
      type: "highlight",
      condition: "input['reg-lamp-blue'] > 0 || input['reg-lamp-green'] > 0",
      description: "REG中の青・緑ランプは奇数設定（設定1・3・5）を示唆します",
    },
    {
      type: "highlight",
      condition: "input['reg-lamp-yellow'] > 0 || input['reg-lamp-red'] > 0",
      description: "REG中の黄・赤ランプは偶数設定（設定2・4・6）を示唆します",
    },
    {
      type: "highlight",
      condition: "input['reg-after-panel'] > 0",
      description: "REG後のトップパネル点灯は設定2以上が濃厚となります！",
    },
    {
      type: "highlight",
      condition: "input['bonus-rainbow'] > 0",
      description: "ボーナス後のトップパネル虹点灯は高設定期待大です！",
    },
  ],
  seoContent: [
    {
      title: "ニューハナハナゴールド-30の機種紹介",
      paragraphs: [
        "6号機ハナハナシリーズの先鋒として2021年1月に登場した機種だ。設定6の合算は1/141、機械割107%と、後継機のキングハナハナ（110%）やスターハナハナ（110%）と比べると上限がやや控えめな設計になっている。ただし設定1の97%から設定6の107%まで設定間の格差がはっきりしており、設定を入れる店と入れない店で結果がくっきり割れるタイプだ。",
        "この台を選ぶべき理由は「導入から時間が経過しており、ホールの設定傾向を読みやすい」点にある。逆に選ばない理由は設定6の上限が後継機に劣ること——<strong>同じ設定6を打つなら、スターハナハナやキングハナハナの方が期待値は高い</strong>。ニューハナハナゴールドを狙うのは、そのホールでこの機種に明確に設定が入っていると確信できる場合に限るのが現実的な判断だ。"
      ],
    },
    {
      title: "朝イチの店選びと、夕方からの逆算台選び",
      paragraphs: [
        "朝イチは店がやる気のある日かどうかを見抜くことが最優先だ。設定6の合算1/141という数字は、並び待ちの段階から「今日この店は使う気がある」という確信を持てる日にしか狙いに行くべきではない。イベント日でもなく、島全体のデータも平凡な日に<strong>「なんとなく良さそう」で座るのは時間と金の無駄だ</strong>。",
        "ただし安定してツモりたいなら、あえて夕方から狙う戦略も有効だ。前任者が積み上げたデータを逆算ツールで分析し、「なぜ空いているのか」を数値で判断してから座る。",
        "この機種のベル確率は設定1〜6で1/7.10〜1/7.02とほぼ誤差レベルの差しかなく、体感での判断は不可能に近い。だからこそ上部の逆算ツールに差枚・ゲーム数・ボーナス回数を入力し、BIG中スイカやREG中サイドランプの情報と組み合わせてはじめて判断が成立する。<strong>ボーナス回数を眺めているだけでは、この機種の設定の正体は一生わからない。</strong>"
      ],
    },
  ],
};
