import type {
  ConfigSection,
  DiscriminationElement,
  MachineConfig,
} from "../../types/machine-schema";

// スマスロ サンダーV（ユニバーサルエンターテインメント）
// 出典: ユーザー提供の資料（Googleドキュメント、2026-10-26）。内訳の和が解析値に戻ることを検算済み
// （VBB・赤7BB・REGの役別内訳、ベル・スイカ・チェリーの合算、ボーナス重複期待度。decisions-log 2026-10-26）。
// 資料のチェリーAは設定1の行にしか値が無いが、合算からの逆算で全設定1/99.75の共通値。
// 設定は1・2・5・6の4段階。表記は BIG／REG、BIGの種類は VBB／赤7BB。
//
// ページ構成: 設定判別・詳細判別・ベル逆算・機種スペック・前任者（入力データは設定判別と詳細判別で共有）
//   設定判別ページ: 総ゲーム数・BIG・REG・ベル・スイカ・チェリー
//   詳細判別ページ: 上記に加えてベルA/B・チェリーA/B、役別のボーナス、BIG中の小役
// ベル逆算ページはチェリーとスイカの取得率を利用者が入力する方式（specs.reverseCalcCustomRates）。

/** 設定1・2・5・6の分母 */
const S = (s1: number, s2: number, s5: number, s6: number) => ({
  1: s1,
  2: s2,
  5: s5,
  6: s6,
});
const ALL = (v: number) => S(v, v, v, v);

/** カウンター（判別は detailModel が行うので isDiscriminationFactor は既定で false） */
const counter = (
  id: string,
  label: string,
  settingValues: Record<number, number> = {},
  extra: Partial<DiscriminationElement> = {},
): DiscriminationElement => ({
  id,
  label,
  type: "counter",
  unit: "回",
  settingValues,
  isDiscriminationFactor: false,
  ...extra,
});

const TOTAL_GAMES: DiscriminationElement = {
  id: "total-games",
  label: "総ゲーム数",
  type: "counter",
  context: {},
  settingValues: { 1: 0, 2: 0, 5: 0, 6: 0 },
  isDiscriminationFactor: false,
  discriminationWeight: 0,
};

// 通常時の小役（合計）。isDiscriminationFactor: true は設定判別ページ下部の「確率・設定差一覧」表に載せるため。
// ベル（bell-count）はベル逆算ページの逆算対象・設定推定にも使う。
const BELL = counter("bell-count", "ベル", S(12.459, 12.596, 11.918, 11.262), { isDiscriminationFactor: true });
const SUIKA = counter("suika-count", "スイカ", S(81.109, 82.228, 74.557, 76.293), { isDiscriminationFactor: true });
const CHERRY = counter("cherry-sum-count", "チェリー", S(11.657, 10.791, 11.108, 10.87), { isDiscriminationFactor: true });

// ─── 役別のボーナス（詳細判別ページ）──────────────────────────────
const VBB_LEAVES = [
  counter("big-vbb-solo-count", "単独", S(5041.2, 5041.2, 5041.2, 4681.1)),
  counter("big-vbb-replay-count", "リプレイ", ALL(9362.3)),
  counter("big-vbb-bella-count", "ベル", ALL(32768.0)),
  counter("big-vbb-cherryb-count", "チェリー", ALL(9362.3)),
  counter("big-vbb-suika-count", "スイカ", ALL(21845.3)),
  counter("big-vbb-reacha-count", "リーチ目役A", S(2730.7, 2730.7, 2730.7, 2621.4)),
  counter("big-vbb-reachb-count", "リーチ目役B", S(8192.0, 8192.0, 7281.8, 7281.8)),
  counter("big-vbb-reachc-count", "リーチ目役C", S(2427.3, 2427.3, 2340.6, 2340.6)),
  counter("big-vbb-reachd-count", "リーチ目役D", S(3640.9, 3640.9, 3640.9, 3449.3)),
  counter("big-vbb-reache-count", "リーチ目役E", S(7281.8, 6553.6, 6553.6, 6553.6)),
];
const AKA_LEAVES = [
  counter("big-aka-solo-count", "単独", S(1927.5, 1872.5, 1872.5, 1872.5)),
  counter("big-aka-replay-count", "リプレイ", ALL(9362.3)),
  counter("big-aka-cherrya-count", "チェリーA", ALL(32768.0)),
  counter("big-aka-cherryb-count", "チェリーB", ALL(9362.3)),
  counter("big-aka-suika-count", "スイカ", ALL(21845.3)),
  counter("big-aka-reacha-count", "リーチ目役A", S(10922.7, 10922.7, 9362.3, 9362.3)),
  counter("big-aka-reachb-count", "リーチ目役B", S(8192.0, 8192.0, 7281.8, 7281.8)),
  counter("big-aka-reachc-count", "リーチ目役C", S(2730.7, 2730.7, 2730.7, 2621.4)),
  counter("big-aka-reachd-count", "リーチ目役D", S(10922.7, 10922.7, 10922.7, 9362.3)),
  counter("big-aka-reache-count", "リーチ目役E", S(3120.8, 3120.8, 3120.8, 2978.9)),
];
// REGはリーチ目役B・E、ベル・チェリーA・スイカからは発展しない
const REG_LEAVES = [
  counter("reg-solo-count", "単独", S(1680.4, 1524.1, 1394.4, 1310.7)),
  counter("reg-replay-count", "リプレイ", S(5461.3, 5041.2, 4369.1, 3855.1)),
  counter("reg-cherryb-count", "チェリー", S(5461.3, 5041.2, 4369.1, 3855.1)),
  counter("reg-reacha-count", "リーチ目役A", S(2184.5, 1927.5, 1638.4, 1456.4)),
  counter("reg-reachc-count", "リーチ目役C", S(1310.7, 1191.6, 1040.3, 949.8)),
  counter("reg-reachd-count", "リーチ目役D", S(8192.0, 8192.0, 6553.6, 5957.8)),
];
const VBB_IDS = VBB_LEAVES.map((e) => e.id);
const AKA_IDS = AKA_LEAVES.map((e) => e.id);
const REG_IDS = REG_LEAVES.map((e) => e.id);

// BIG中の小役。ゲーム数は下のボタンの合計（押すと役とゲーム数が同時に+1）。
// ベルのIDを bell- で始めているのは、通常時のベルと同じアンバーにするため（2026-10-29 ユーザー指定）。
// ベルA（1/1.2・1/1.3）は判別に使わない（設定1・5ではベルA〜Cの確率の和が1を超えるため。ハナビのBB中風鈴Aと同じ扱い）
const bigIn = (id: string, label: string, settingValues: Record<number, number> = {}, extra: Partial<DiscriminationElement> = {}) =>
  counter(id, label, settingValues, { probBase: "bbin-games", ...extra });

const DETAIL_SECTIONS: ConfigSection[] = [
  { id: "basic-data", title: "基本データ", elements: [TOTAL_GAMES] },
  {
    id: "detail-bell",
    title: "通常時 ベル",
    layout: "grid",
    elements: [
      counter("bell-a-count", "ベルA", S(16.298, 15.799, 15.301, 14.8)),
      counter("bell-b-count", "ベルB", S(52.894, 62.119, 53.895, 47.114)),
      counter("bell-unknown-count", "ベル（A・B区別なし）", {}, { colSpan: 2 }),
    ],
  },
  {
    id: "detail-cherry",
    title: "通常時 チェリー・スイカ",
    layout: "grid",
    elements: [
      counter("cherry-a-count", "チェリーA", ALL(99.75)),
      counter("cherry-b-count", "チェリーB", S(13.2, 12.1, 12.5, 12.2)),
      counter("cherry-unknown-count", "チェリー（区別なし）"),
      SUIKA,
    ],
  },
  {
    id: "detail-big-vbb",
    title: "BIGの契機（VBB）",
    // 真っ青（ユーザー指定）
    barTheme: "blue",
    layout: "grid",
    collapsible: true,
    elements: [...VBB_LEAVES, counter("big-vbb-unknown-count", "VBB・契機不明")],
  },
  {
    id: "detail-big-aka",
    title: "BIGの契機（赤7BB）",
    layout: "grid",
    collapsible: true,
    elements: [
      ...AKA_LEAVES,
      counter("big-aka-unknown-count", "赤7BB・契機不明"),
      counter("big-unknown-count", "BIG・種類も不明"),
    ],
  },
  {
    id: "detail-reg",
    title: "REGの契機",
    // スマスロ ハナビのRBの契機・タコスロのREGの契機と同じ灰色
    barTheme: "gray",
    layout: "grid",
    collapsible: true,
    elements: [...REG_LEAVES, counter("reg-unknown-count", "契機不明", {}, { colSpan: 2 })],
  },
  {
    id: "detail-bigin",
    title: "BIG中の小役",
    layout: "grid",
    collapsible: true,
    elements: [
      counter("bbin-games", "BIG中ゲーム数", {}, { unit: "G", isReadOnly: true, hideProb: true, colSpan: 2 }),
      bigIn("bell-inbig-a-count", "ベルA", S(1.2, 1.3, 1.2, 1.3)),
      bigIn("bell-inbig-b-count", "ベルB", S(7.0, 5.8, 7.0, 5.8)),
      bigIn("bell-inbig-c-count", "ベルC", S(36.0, 36.0, 24.3, 24.3)),
      bigIn("bbin-reach-count", "リーチ目", S(10922.7, 10922.7, 436.9, 436.9)),
      bigIn("bbin-other-count", "その他", {}, { hideProb: true, colSpan: 2 }),
    ],
  },
];

export const thunderVConfig: MachineConfig = {
  id: "thunder-v",
  name: "スマスロ サンダーV",
  title: "【即計算】スマスロ サンダーV 設定判別｜GrapeReverse",
  type: "BT",
  themeColor: "bg-amber-800",
  detailSections: DETAIL_SECTIONS,
  // 3列の指標グリッドの2行目（1行目は BIG / REG / 合成）
  metricRows: [
    { label: "ベル", id: "bell-count" },
    { label: "スイカ", id: "suika-count" },
    { label: "チェ", id: "cherry-sum-count" },
  ],
  // 合計＝内訳の和。設定判別ページで合計を＋した分は「区別なし」「契機不明」へ入る
  sumGroups: [
    {
      totalId: "big-count",
      partIds: [...VBB_IDS, "big-vbb-unknown-count", ...AKA_IDS, "big-aka-unknown-count", "big-unknown-count"],
      unknownId: "big-unknown-count",
    },
    {
      totalId: "reg-count",
      partIds: [...REG_IDS, "reg-unknown-count"],
      unknownId: "reg-unknown-count",
    },
    {
      totalId: "bell-count",
      partIds: ["bell-a-count", "bell-b-count", "bell-unknown-count"],
      unknownId: "bell-unknown-count",
    },
    {
      totalId: "cherry-sum-count",
      partIds: ["cherry-a-count", "cherry-b-count", "cherry-unknown-count"],
      unknownId: "cherry-unknown-count",
    },
    {
      totalId: "bbin-games",
      partIds: ["bell-inbig-a-count", "bell-inbig-b-count", "bell-inbig-c-count", "bbin-reach-count", "bbin-other-count"],
    },
  ],
  detailModel: {
    bonusSplits: [
      {
        totalId: "big-count",
        unknownId: "big-unknown-count",
        parts: [
          ...VBB_IDS.map((id) => ({ id })),
          { id: "big-vbb-unknown-count", members: VBB_IDS },
          ...AKA_IDS.map((id) => ({ id })),
          { id: "big-aka-unknown-count", members: AKA_IDS },
        ],
      },
      {
        totalId: "reg-count",
        unknownId: "reg-unknown-count",
        parts: REG_IDS.map((id) => ({ id })),
      },
    ],
    normalGroups: [
      {
        parts: [
          { id: "bell-a-count" },
          { id: "bell-b-count" },
          { id: "bell-unknown-count", members: ["bell-a-count", "bell-b-count"] },
        ],
      },
      {
        parts: [
          { id: "cherry-a-count" },
          { id: "cherry-b-count" },
          { id: "cherry-unknown-count", members: ["cherry-a-count", "cherry-b-count"] },
        ],
      },
      { parts: [{ id: "suika-count" }] },
    ],
    stateGroups: [
      { gamesId: "bbin-games", judgedIds: ["bell-inbig-b-count", "bell-inbig-c-count", "bbin-reach-count"] },
    ],
  },
  sections: [
    { id: "basic-data", title: "基本データ", elements: [TOTAL_GAMES] },
    {
      id: "bonus-section",
      title: "ボーナス回数",
      layout: "grid",
      elements: [
        {
          id: "big-count",
          label: "BIG回数",
          type: "counter",
          unit: "回",
          settingValues: { 1: 277.695, 2: 275.361, 5: 270.81, 6: 264.258 },
          isDiscriminationFactor: true,
          isReadOnly: true,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          settingValues: { 1: 434.013, 2: 394.795, 5: 344.926, 6: 313.569 },
          isDiscriminationFactor: true,
          isReadOnly: true,
        },
      ],
    },
    {
      id: "normal-role-section",
      title: "通常時小役",
      layout: "grid",
      elements: [BELL, SUIKA, CHERRY],
    },
  ],
  specs: {
    settings: [1, 2, 5, 6],
    // 詳細判別ページの全項目を使う計算（bayes-estimator.ts の calculateDetailedEstimation）
    estimationModel: "detailed",
    injectCherryCounter: false,
    baseGamesPerMedal: 35.24,
    payoutRatio: [98.5, 100.0, 102.9, 106.0],
    // ベル逆算用。BIGは雷神ループ（発生率15%）を見込んだ期待値334枚
    payouts: {
      big: 334,
      reg: 107,
      bell: 8,
      cherry: 4,
      suika: 15,
    },
    // 逆算で差し引く小役の分母（設定1の値）
    reverseCalcProbDenominators: {
      replay: 7.3,
      cherry: 11.657,
      suika: 81.109,
    },
    // 取得率の入力欄の初期値（チェリー100%・スイカは狙わない場合の60.3%）
    reverseCalcCustomRates: {
      cherry: 1,
      suika: 0.603,
    },
    judgmentWeights: {
      grapeWeightMap: { 0: 0.1, 2000: 0.2, 4000: 0.5, 6000: 0.8, 8000: 1.0 },
    },
  },
  // 設定が4段階のため、何も情報が無い状態で「設定5・6の可能性」は50%から始まる。
  // 文言の切り替え閾値はハナビ・タコスロと同じく高めに置く。
  specialAdvice: {
    tiers: [
      {
        maxGames: 3000,
        introHtml:
          '序盤戦です。ボーナス確率はまだブレが大きいため、<span class="font-bold underline decoration-amber-400 decoration-2">REG確率とベル確率</span>を軸に様子を見ましょう。',
        brackets: [
          // 序盤は低設定寄りの文言を出さない（未入力の0G時点でも期待度0%として判定されるため）
          {
            minProb: 75,
            html: "滑り出しは良好です。このペースを維持できるか注目しましょう。",
          },
        ],
      },
      {
        maxGames: 6000,
        introHtml: "中盤戦に差し掛かりました。",
        brackets: [
          {
            minProb: 75,
            html: '<span class="font-bold">REG・ベルともに高設定寄りの数値です。</span>BIG中のリーチ目にも注目して続行しましょう。',
          },
          {
            minProb: 50,
            maxProb: 75,
            html: "判断の分かれる数値です。REG確率とベル確率がついてくるかを確認しましょう。",
          },
          {
            maxProb: 50,
            html: "低設定の可能性が高まっています。BIG中のリーチ目などの根拠が無い限り、深追いは禁物です。",
          },
        ],
      },
      {
        maxGames: null,
        introHtml: "終盤戦です。サンプルは十分に集まりました。",
        brackets: [
          {
            minProb: 85,
            html: '<span class="font-bold text-purple-600 dark:text-purple-400">数値は文句なしです。閉店まで回す価値がある台です。</span>',
          },
          {
            minProb: 60,
            maxProb: 85,
            html: '<span class="font-bold text-red-600 dark:text-red-400">挙動は良好です。設定5・6を意識して続行しましょう。</span>',
          },
          {
            maxProb: 60,
            html: '<span class="font-bold text-slate-500">厳しい数値です。BIG中のリーチ目などの根拠が無い限り、撤退も視野に入れましょう。</span>',
          },
        ],
      },
    ],
  },
  seoContent: [
    {
      title: "スマスロ サンダーVの設定判別は「REG」と「ベル」が軸",
      paragraphs: [
        "スマスロ サンダーVは設定1・2・5・6の4段階で、天井は非搭載。BIGの設定差は1/277.7〜1/264.3と小さく、判別の主軸はREG確率（1/434.0〜1/313.6）になる。ボーナス合算は1/169.3〜1/143.4。",
        "もう一つの軸が通常時のベル。ベルA・Bの合算で1/12.46〜1/11.26と、出現回数が多いぶん数千ゲームで差が表れやすい。<strong>当ページのカウンターで総ゲーム数・ボーナス・小役を記録すれば、設定5・6の可能性を自動で数値化できる。</strong>ベルを数えていない場合は、差枚数とボーナス回数からベル確率を逆算するページも使える。",
      ],
    },
    {
      title: "BIG中のリーチ目は強力な高設定の根拠",
      paragraphs: [
        "BIG中のリーチ目は設定1・2で1/10922.7、設定5・6で1/436.9と約25倍の差がある。BIG中のベルC（1/36.0→1/24.3）も高設定ほど出やすい。詳細判別ページでBIG中の小役を数えると判別に反映される。",
      ],
    },
  ],
  specPage: {
    strategy:
      "判別の軸はREG確率とベル確率。BIGの設定差は小さいため、ボーナス合算だけで押し引きを決めず、REGとベルが高設定域についてくるかを確認する。\nBIG中のリーチ目は設定5・6で約25倍出やすく、出現すれば強い根拠になる。ベルを数えていない台は、差枚数とボーナス回数からベル確率を逆算して判断材料にする。",
    bonusProbAdvice:
      "BIGの設定差は1/277.7〜1/264.3と小さく、判別の主軸はREG。設定6のREGは1/313.6で、設定1（1/434.0）とは約1.4倍の差がある。",
    cards: [
      {
        id: "overview",
        title: "機種概要",
        icon: "📋",
        blocks: [
          {
            kind: "info",
            items: [
              {
                title: "基本情報",
                lines: [
                  { label: "メーカー", value: "ユニバーサルエンターテインメント" },
                  { label: "タイプ", value: "6.5号機 BT（スマスロ）" },
                  { label: "導入開始", value: "2026年3月2日" },
                  { label: "設定", value: "1・2・5・6の4段階" },
                  { label: "天井", value: "非搭載" },
                  { label: "配当", value: "ベル8枚・角チェリー4枚・スイカ15枚" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "payoutRatio",
        title: "機械割・コイン持ち",
        icon: "💹",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "機械割", values: { 1: "98.5%", 2: "100.0%", 5: "102.9%", 6: "106.0%" } },
              { label: "技術介入時", values: { 1: "100.5%", 2: "102.0%", 5: "105.0%", 6: "108.1%" } },
              { label: "50枚あたり", values: { 1: "35.2G", 2: "35.7G", 5: "36.9G", 6: "38.0G" } },
            ],
          },
        ],
      },
      {
        id: "smallRole",
        title: "通常時小役確率",
        icon: "🔔",
        blocks: [
          {
            kind: "bySetting",
            caption: "ベル",
            columns: [
              { label: "ベルA", values: { 1: "1/16.30", 2: "1/15.80", 5: "1/15.30", 6: "1/14.80" } },
              { label: "ベルB", values: { 1: "1/52.89", 2: "1/62.12", 5: "1/53.90", 6: "1/47.11" } },
              { label: "合算", values: { 1: "1/12.46", 2: "1/12.60", 5: "1/11.92", 6: "1/11.26" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "スイカ",
            columns: [
              { label: "スイカA", values: { 1: "1/108.3", 2: "1/109.6", 5: "1/99.6", 6: "1/101.9" } },
              { label: "スイカB", values: { 1: "1/322.8", 2: "1/329.3", 5: "1/296.5", 6: "1/303.4" } },
              { label: "合算", values: { 1: "1/81.11", 2: "1/82.23", 5: "1/74.56", 6: "1/76.29" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "チェリー",
            columns: [
              { label: "チェリーA", values: ALL_TEXT("1/99.75") },
              { label: "チェリーB", values: { 1: "1/13.20", 2: "1/12.10", 5: "1/12.50", 6: "1/12.20" } },
              { label: "合算", values: { 1: "1/11.66", 2: "1/10.79", 5: "1/11.11", 6: "1/10.87" } },
            ],
          },
        ],
        advice:
          "判別に使いやすいのはベル。ベルAが設定1の1/16.30から設定6の1/14.80まで段階的に良くなる。ベルBは設定2が最も重く、スイカは設定5が最も軽いなど段階的ではないため、単独での判断には向かない。",
      },
      {
        id: "overlapRate",
        title: "ボーナス重複期待度",
        icon: "🍒",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "ベルA", values: { 1: "0.050%", 2: "0.048%", 5: "0.047%", 6: "0.045%" } },
              { label: "スイカA", values: { 1: "0.50%", 2: "0.50%", 5: "0.46%", 6: "0.47%" } },
              { label: "スイカB", values: { 1: "1.48%", 2: "1.51%", 5: "1.36%", 6: "1.39%" } },
              { label: "リプレイ", values: { 1: "0.29%", 2: "0.30%", 5: "0.32%", 6: "0.35%" } },
            ],
          },
          {
            kind: "bySetting",
            columns: [
              { label: "チェリーA", values: ALL_TEXT("0.30%") },
              { label: "チェリーB", values: { 1: "0.52%", 2: "0.50%", 5: "0.55%", 6: "0.58%" } },
              { label: "スイカ合算", values: { 1: "0.743%", 2: "0.753%", 5: "0.683%", 6: "0.698%" } },
              { label: "チェリー合算", values: { 1: "0.498%", 2: "0.478%", 5: "0.525%", 6: "0.547%" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "単独・重複の割合",
            columns: [
              { label: "単独", values: { 1: "1/201.6", 2: "1/192.8", 5: "1/180.0", 6: "1/170.2" } },
              { label: "重複", values: { 1: "1/1057.0", 2: "1/1024.0", 5: "1/963.8", 6: "1/910.2" } },
              { label: "単独割合", values: { 1: "84.0%", 2: "84.2%", 5: "84.3%", 6: "84.2%" } },
            ],
          },
        ],
        advice:
          "小役とボーナスの重複はリプレイ・チェリーBで高設定ほどやや期待度が上がるが、差は小さい。ボーナスの約84%は単独（リーチ目役を含む）で成立する。",
        note: "※「単独」はリーチ目役からのボーナスを含みます。",
      },
      {
        id: "bonusBreakdown",
        title: "役別のボーナス確率",
        icon: "🧩",
        blocks: [
          {
            kind: "byItem",
            caption: "VBB",
            rows: [
              { label: "単独", values: { 1: "1/5041.2", 2: "1/5041.2", 5: "1/5041.2", 6: "1/4681.1" } },
              { label: "リプレイ", values: ALL_TEXT("1/9362.3") },
              { label: "ベルA", values: ALL_TEXT("1/32768.0") },
              { label: "チェリーB", values: ALL_TEXT("1/9362.3") },
              { label: "スイカB", values: ALL_TEXT("1/21845.3") },
              { label: "リーチ目役A", values: { 1: "1/2730.7", 2: "1/2730.7", 5: "1/2730.7", 6: "1/2621.4" } },
              { label: "リーチ目役B", values: { 1: "1/8192.0", 2: "1/8192.0", 5: "1/7281.8", 6: "1/7281.8" } },
              { label: "リーチ目役C", values: { 1: "1/2427.3", 2: "1/2427.3", 5: "1/2340.6", 6: "1/2340.6" } },
              { label: "リーチ目役D", values: { 1: "1/3640.9", 2: "1/3640.9", 5: "1/3640.9", 6: "1/3449.3" } },
              { label: "リーチ目役E", values: { 1: "1/7281.8", 2: "1/6553.6", 5: "1/6553.6", 6: "1/6553.6" } },
            ],
          },
          {
            kind: "byItem",
            caption: "赤7BB",
            rows: [
              { label: "単独", values: { 1: "1/1927.5", 2: "1/1872.5", 5: "1/1872.5", 6: "1/1872.5" } },
              { label: "リプレイ", values: ALL_TEXT("1/9362.3") },
              { label: "チェリーA", values: ALL_TEXT("1/32768.0") },
              { label: "チェリーB", values: ALL_TEXT("1/9362.3") },
              { label: "スイカA", values: ALL_TEXT("1/21845.3") },
              { label: "リーチ目役A", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/9362.3", 6: "1/9362.3" } },
              { label: "リーチ目役B", values: { 1: "1/8192.0", 2: "1/8192.0", 5: "1/7281.8", 6: "1/7281.8" } },
              { label: "リーチ目役C", values: { 1: "1/2730.7", 2: "1/2730.7", 5: "1/2730.7", 6: "1/2621.4" } },
              { label: "リーチ目役D", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/10922.7", 6: "1/9362.3" } },
              { label: "リーチ目役E", values: { 1: "1/3120.8", 2: "1/3120.8", 5: "1/3120.8", 6: "1/2978.9" } },
            ],
          },
          {
            kind: "byItem",
            caption: "REG",
            rows: [
              { label: "単独", values: { 1: "1/1680.4", 2: "1/1524.1", 5: "1/1394.4", 6: "1/1310.7" } },
              { label: "リプレイ", values: { 1: "1/5461.3", 2: "1/5041.2", 5: "1/4369.1", 6: "1/3855.1" } },
              { label: "チェリーB", values: { 1: "1/5461.3", 2: "1/5041.2", 5: "1/4369.1", 6: "1/3855.1" } },
              { label: "リーチ目役A", values: { 1: "1/2184.5", 2: "1/1927.5", 5: "1/1638.4", 6: "1/1456.4" } },
              { label: "リーチ目役C", values: { 1: "1/1310.7", 2: "1/1191.6", 5: "1/1040.3", 6: "1/949.8" } },
              { label: "リーチ目役D", values: { 1: "1/8192.0", 2: "1/8192.0", 5: "1/6553.6", 6: "1/5957.8" } },
            ],
          },
        ],
        advice:
          "どの役をきっかけに、VBB・赤7BB・REGのどれに発展したかの確率。内訳をすべて足すと、それぞれの解析値と一致する。REGは単独・リプレイ・チェリーB・リーチ目役A/C/Dのいずれも高設定ほど軽く、設定差の大半はREG側にある。詳細判別ページで役ごとに数えると判別に反映される。",
      },
      {
        id: "bigRole",
        title: "BIG中の小役確率",
        icon: "⚡",
        blocks: [
          {
            kind: "byItem",
            rows: [
              { label: "ベルA", values: { 1: "1/1.2", 2: "1/1.3", 5: "1/1.2", 6: "1/1.3" } },
              { label: "ベルB", note: "偶数設定優遇", values: { 1: "1/7.0", 2: "1/5.8", 5: "1/7.0", 6: "1/5.8" } },
              { label: "ベルC", note: "高設定優遇", values: { 1: "1/36.0", 2: "1/36.0", 5: "1/24.3", 6: "1/24.3" } },
              { label: "リーチ目", note: "設定5・6で約25倍", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/436.9", 6: "1/436.9" } },
            ],
          },
        ],
        advice:
          "BIG中のリーチ目は設定5・6で1/436.9、設定1・2では1/10922.7と大きな差があり、出現すれば高設定の強い根拠になる。ベルCも高設定ほど出やすい。",
      },
      {
        id: "bonusSpec",
        title: "ボーナス仕様",
        icon: "📖",
        blocks: [
          {
            kind: "info",
            items: [
              {
                title: "BIG",
                lines: [
                  { label: "獲得", value: "最大303枚（雷神ループ非発生時）" },
                  { label: "構成", value: "BONUS GAMEとJAC GAMEの2部構成" },
                  { label: "雷神ループ", value: "BONUS GAME終了後の雷神フリーズで再びBONUS GAMEへ。発生率15%（全設定共通）、1回発生時の期待枚数は約481枚" },
                ],
              },
              {
                title: "REG",
                lines: [{ label: "獲得", value: "最大107枚" }],
              },
            ],
          },
        ],
      },
    ],
  },
};

/** 全設定同じ表示値 */
function ALL_TEXT(v: string) {
  return { 1: v, 2: v, 5: v, 6: v };
}
