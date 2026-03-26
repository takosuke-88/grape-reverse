import type { MachineConfig } from "../../types/machine-schema";

export const haihaiSiosai2Config: MachineConfig = {
  id: "haihai-siosai2",
  name: "ハイハイシオサイ2",
  type: "A-type",
  themeColor: "bg-teal-600",
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
          settingValues: { 1: 198, 2: 190, 3: 184, 4: 178, 5: 172, 6: 165 },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          context: { duringBonus: "reg", description: "REGの回数を入力" },
          settingValues: { 1: 198, 2: 190, 3: 184, 4: 178, 5: 172, 6: 165 },
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
    baseGamesPerMedal: 32.0,
    payoutRatio: [97.5, 99.0, 101.0, 103.0, 105.0, 108.0],
    payouts: {
      big: 194,
      reg: 102,
      bell: 10,
      grape: 10,
    },
  },
  seoContent: [
    {
      title: "夕方からハイハイシオサイ2を打つ際の絶対条件と「空き台のリアル」",
      paragraphs: [
        "ハイハイシオサイ2は設定1でも合算1/99、設定6で1/83という全設定通じてボーナスが軽い特殊設計のノーマル機だ。この「軽さ」が夕方の台選びにおいて最大の罠になる。",
        "合算が良く見える台が空いていても、それは「ボーナスがよくチカる低設定」を前任者が打ち続けた結果の可能性が高い。低ベース（50枚あたり約32G）という設計上、ボーナスが頻繁にチカっても差枚がなかなか伸びず、「合算は悪くないのに出ていない」という感触になりやすい。",
        "前任者は体感した小役の引きの悪さ、つまりベルやチェリーの落ちが悪かったから見切ったのだ。<strong>夕方の空き台に映る「合算1/90前後」の台は、その見切りの跡である可能性を常に疑うべきだ。</strong>"
      ],
    },
    {
      title: "履歴打ちの限界と、小役逆算ツールという「解答」",
      paragraphs: [
        "前作ハイハイシオサイでは設定6の機械割が108%だったが、2では110%に上昇している。その分、設定1〜4と設定6の間に実質的な壁があり、「なんとなく良さげ」な台が設定3止まりである可能性も高い。",
        "この機種の厄介な点は、ボーナス確率だけでは設定1〜4の差がほとんど見えないことだ。設定1と設定4の合算差はわずか1/99対1/91。数千ゲーム程度では誤差の範囲だ。頼るべきは設定示唆演出（右虹点滅で設定6確定）とベル確率の逆算になる。",
        "座る前、あるいは打ち出した直後に上部の逆算ツールで差枚・ゲーム数・ボーナス回数を入力し、ベル確率を数値化する。設定6水準のベルが出ているかどうかを確認してから続行判断を下す——この一手間を省いた履歴打ちは、<strong>設定1台を「合算が良いから」と追いかける行為と大差ない</strong>。小役をカウントしたり、逆算でもう1つ理由を増やすのは大切だ。"
      ],
    },
  ],
};
