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
  seoContent: [
    {
      title: "朝イチの罠。ハイハイシオサイの序盤（1000〜2000G）挙動は信用できるか？",
      paragraphs: [
        "開店直後にBIGが3〜4連チャンして「もらった」と確信する。ところが1500G時点で合算1/88という数字は、設定1でも全く不思議ではない。BIGが連チャンしやすい確率設計上、<strong>序盤の爆発は「高設定の証明」ではなく「ただの短期ブレ」に過ぎない</strong>。",
        "逆に朝から500Gハマって序盤だけ合算が重い展開になることもある。「こんな台に座り続けても…」と捨てた後、その台が設定6として1日稼働し続けるのを眺めることになる——あのパターンだ。",
        "前作との比較で言うと、2では設定が1〜6の6段階に増えたが、初代は1・2・3・5・6の5段階制という変則仕様だ。<strong>設定4が存在しない以上、「中間設定だろう」という感覚的な逃げ場がなく</strong>、高設定か低設定かの二択に近い判断が求められる。それだけに序盤の誤読が後の判断全体を狂わせやすい。"
      ],
    },
    {
      title: "「高設定の捨て・低設定の粘り」を防ぐ、早期見切りのための逆算",
      paragraphs: [
        "序盤1000〜2000Gのボーナス確率はただのブレだ。この機種でそれを体感値で判断しようとすること自体に無理がある。",
        "だからこそ、打ち始めた直後から上部の逆算ツールでベル確率を数値化する習慣が命綱になる。ハイハイシオサイのベル確率には設定差があり、高設定ほど軽い。差枚・ゲーム数・ボーナス回数を入れて逆算した数値が設定6水準から明確に外れているなら、合算が軽く見えていても早期撤退の根拠になる。",
        "逆に合算が重く見えても、ベル逆算値が優秀なら「高設定を早期に見切る最悪の判断ミス」を防げる。ボーナス確率のブレに感情を動かされない唯一の方法は、数値を積み上げることだけだ。<strong>序盤の光に目を眩まされるな。</strong>"
      ],
    },
  ],
};
