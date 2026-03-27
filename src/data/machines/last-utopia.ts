import type { MachineConfig } from "../../types/machine-schema";

export const lastUtopiaConfig: MachineConfig = {
  id: "last-utopia",
  name: "ラストユートピア",
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
  seoContent: [
    {
      title: "ラストユートピアの機種紹介",
      paragraphs: [
        "ラストユートピアはオリンピアが手がけた6号機のノーマルタイプで、ハナハナ・ジャグラー系とは異なる独自の世界観を持つ機種だ。最大の特徴はベルが設定判別の主役という設計で、通常時の小役構成がぶどう主体の他機種とは根本的に異なる。",
        "設定6の機械割は高設定域で恩恵が大きく、ノーマル機として十分な期待値を持つ。この台を選ぶべき理由はシンプルで、設定を入れているホールでは「ベルの落ち」というわかりやすい指標で高低設定の判断ができる点だ。設定判別の軸が明確な機種は、立ち回りの精度を上げやすい。",
        "逆に選ばない理由は設置台数の少なさだ。主要機種として島を組んでいる店でなければ、そもそも設定が入る可能性自体が低い。「台数が少ない＝期待値が読みにくい」と割り切って、<strong>設置状況の弱い店ではスルーが正解だ。</strong>"
      ]
    },
    {
      title: "合算の罠と、ベル逆算による「中間設定の見切り」",
      paragraphs: [
        "合算だけ見ていると判断を誤るのがこの機種の特性だ。<strong>中間設定と高設定の壁は、ボーナス確率の表面だけでは見えてこない。</strong>設定3〜4水準でも合算がそれなりに軽く見えることがあり、「高設定かもしれない」という錯覚が追加投資を呼ぶ。",
        "そこで機能するのが上部のベル逆算ツールだ。差枚・ゲーム数・ボーナス回数を入力してベル確率を数値化し、設定6水準に届いているかを確認する。この作業を序盤から積み上げることで「中間設定の上ブレ」と「本物の高設定」を見分ける根拠が生まれる。",
        "ベルをカウントせず、合算とボーナス回数だけで追いかけている限り、中間設定に時間と金を溶かし続けるリスクは消えない。逆算ツールを使うかどうかが、この機種における収支の分かれ目になる。<strong>数値で見抜け。感覚で追うな。</strong>"
      ]
    }
  ],
};
