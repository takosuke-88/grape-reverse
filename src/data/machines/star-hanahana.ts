import type { MachineConfig } from "../../types/machine-schema";

export const starHanahanaConfig: MachineConfig = {
  id: "star-hanahana",
  name: "スターハナハナ-30",
  type: "A-type",
  themeColor: "bg-orange-600",
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
          settingValues: { 1: 270, 2: 260, 3: 250, 4: 240, 5: 229, 6: 218 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: { duringBonus: "reg", description: "REGの回数を入力" },
          settingValues: { 1: 387, 2: 356, 3: 327, 4: 297, 5: 268, 6: 242 },
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
            1: 6.35,
            2: 6.32,
            3: 6.29,
            4: 6.26,
            5: 6.23,
            6: 6.2,
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
            1: 47.1,
            2: 42.8,
            3: 39.6,
            4: 36.9,
            5: 33.1,
            6: 31.2,
          },
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
            5: 1176.85,
            6: 1358.87,
          },
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
            5: 1768.12,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-lamp-green",
          label: "緑 (奇数強示唆)",
          type: "counter",
          visibility: "detail",
          settingValues: {
            1: 2066.67,
            2: 2726.19,
            3: 1609.85,
            4: 2157.61,
            5: 1275.26,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
        {
          id: "reg-lamp-red",
          label: "赤 (偶数強示唆)",
          type: "counter",
          visibility: "detail",
          settingValues: {
            1: 3100,
            2: 1817.46,
            3: 2414.77,
            4: 1443.64,
            5: 1916.23,
            6: 1358.87,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
        {
          id: "reg-lamp-rainbow",
          label: "虹 (設定6濃厚!)",
          type: "counter",
          visibility: "detail",
          settingValues: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false, // 100% force handled dynamically based on input > 0
          discriminationWeight: 0,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 38.0,
    payoutRatio: [97.0, 99.0, 101.0, 103.0, 106.0, 110.0],
    payouts: {
      big: 260,
      reg: 120,
      bell: 10,
      grape: 10,
    },
  },
  seoContent: [
    {
      title: "スターハナハナ-30の機種紹介",
      paragraphs: [
        "スターハナハナ-30は2025年1月にパイオニアが導入した6号機ノーマルタイプで、<strong>現行ハナハナシリーズの中では最も合算が軽い</strong>機種だ。設定6の合算は1/114、機械割は110%と、6号機ハナハナシリーズの中でもトップクラスのスペックを誇る。REG確率は設定1の1/387から設定6の1/242まで大きく乖離しており、終日打ち込めば設定差がREG回数にハッキリ現れやすい設計になっている。",
        "設定6の実戦データでは平均差枚が+4,400枚超えという数字も出ており、「ちゃんと設定6を座れた日の破壊力」という観点では他の現行ハナハナを圧倒する。サイドランプはボーナス終了後の色示唆に加え、BIG中のレトロサウンド発生が高設定示唆として機能する点も判別の幅を広げてくれる。"
      ],
    },
    {
      title: "ベル逆算の使い方が他機種と違う理由",
      paragraphs: [
        "選ぶべき理由は明確だ。設定6の期待値が現行ハナハナシリーズ最高水準であること、そしてREG確率に設定差がしっかり出るため、ゲーム数が積み上がるほど判別精度が上がる点にある。設定6を掴めたときのリターンが大きく、ベルカウントとREG比率という軸で判断できる構造も立ち回りを組みやすい。",
        "逆に選ばない理由はベル確率の設定差が極めて小さい点だ。設定1と設定6のベル差は1/6.36対1/6.20と、数千ゲームでは体感できない水準だ。つまりベルカウントは「絞り込みの根拠」にはなりにくく、上部の逆算ツールを使っても「ベルが明確に軽い」という確信を得るには相当なゲーム数が必要になる。",
        "この機種でツールを使う意味は、ベルで高設定を確定させることではなく、<strong>ベルが明確に重い台を早期に切り捨てる判断材料として使う</strong>点にある。REG比率・BIG中スイカ・サイドランプ色と合わせて総合判断する習慣を持てるかどうかが、長期的な収支に直結する。"
      ],
    },
  ],
};
