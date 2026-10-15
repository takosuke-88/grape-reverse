import type {
  ConfigSection,
  DiscriminationElement,
  MachineConfig,
} from "../../types/machine-schema";

// スマスロ タコスロ（ユニバーサルエンターテインメント）
// 出典: ユーザー提供のスペック表（タコスロ.csv、2026-10-15）。内訳の和が解析値に戻ることを検算済み
// （白7BB・タコBB・RBの契機別内訳、リーチ目役A〜D、同時成立期待度。decisions-log 2026-10-15）。
// 設定は1・2・5・6の4段階。
//
// 呼び方は解析サイトの一般的な呼称に合わせる（資料のCSVは逆になっていた。ユーザー確認済み）:
//   ボーナスゲーム（BT）… ループの本体。ここで「リプレイ＋TACO GAME」が抽選される
//   TACO GAME          … 1G完結の上乗せゲーム（目押し成功14枚・失敗9枚）
//
// 判別に使う項目（入力データは設定判別ページと詳細判別ページで共有）:
//   設定判別ページ: 総ゲーム数・BIG・REG・プラム・スイカ・チェリー・リプレイ＋TACO GAME・設定示唆
//   詳細判別ページ: 上記に加えて BIG（白7／タコ）・REG の契機（単独・プラム・チェリーB・リーチ目役）
// チェリーはチェリーA・Bの成立回数＋チェリーCの入賞回数の合算で、狙って打つ前提（取りこぼすと低設定寄りに出る）。

/** 設定1・2・5・6の分母 */
const S = (s1: number, s2: number, s5: number, s6: number) => ({
  1: s1,
  2: s2,
  5: s5,
  6: s6,
});

/** カウンター（判別は detailModel が行うので isDiscriminationFactor は false） */
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

// 通常時の小役（設定判別ページ・詳細判別ページ共通）
// isDiscriminationFactor: true は設定判別ページ下部の「確率・設定差一覧」表に載せるため
// （判別の計算は detailModel が行う）
const PLUM = counter("plum-count", "プラム", S(9.8, 9.7, 9.4, 9.0), { isDiscriminationFactor: true });
const SUIKA = counter("suika-count", "スイカ", S(60.0, 56.2, 53.0, 50.0), { isDiscriminationFactor: true });
// チェリーA（設定差なし 1/184.6）・B の成立回数＋チェリーCの入賞回数
const CHERRY = counter("cherry-sum-count", "チェリー", S(22.9, 21.9, 21.0, 20.1), { isDiscriminationFactor: true });

// ボーナスゲーム（BT）中の「リプレイ＋TACO GAME」。ゲーム数＝下の2ボタンの合計。
// ラベルは375pxの2列セル（148px）に収まる長さ（「手順を実行したボーナスゲーム数」210px は2行になる）
const BT_GAMES = counter("bt-games", "手順実行ゲーム数", {}, {
  unit: "G",
  isReadOnly: true,
  hideProb: true,
  colSpan: 2,
});
const BT_REPLAY_TACO = counter("bt-replaytaco-count", "リプ＋TACO GAME", S(728.2, 728.2, 366.1, 242.7), {
  probBase: "bt-games",
});
const BT_OTHER = counter("bt-other-count", "それ以外のゲーム", {}, {
  probBase: "bt-games",
  hideProb: true,
});

// 設定示唆: BB終了画面のレアパターン（夜）は、そのBIGでTACO GAMEが1度も入賞しなかった場合のみ設定2以上濃厚
const HINT_NIGHT = counter("hint-taco-night", "終了画面「夜」TACO未入賞", {}, {
  impliedSettings: [2, 5, 6],
  hintLabel: "設定2以上濃厚",
});

// ─── BIG・REGの契機（詳細判別ページ）──────────────────────────────
const W7_LEAVES = [
  counter("big-w7-solo-count", "単独", S(10922.7, 10922.7, 10922.7, 10922.7)),
  counter("big-w7-plum-count", "プラム", S(5461.3, 5461.3, 5461.3, 5461.3)),
  counter("big-w7-cherryb-count", "チェリー", S(10922.7, 10922.7, 10922.7, 10922.7)),
  counter("big-w7-reacha-count", "リーチ目役A", S(2621.4, 2427.3, 2427.3, 2340.6)),
  counter("big-w7-reachb-count", "リーチ目役B", S(3276.8, 3276.8, 3120.8, 2978.9)),
  counter("big-w7-reachc-count", "リーチ目役C", S(4096.0, 4096.0, 3855.1, 3640.9)),
  counter("big-w7-reachd-count", "リーチ目役D", S(4096.0, 4096.0, 3855.1, 3640.9)),
];
const TACO_LEAVES = [
  counter("big-taco-solo-count", "単独", S(16384.0, 16384.0, 16384.0, 16384.0)),
  counter("big-taco-plum-count", "プラム", S(5461.3, 5461.3, 5461.3, 5461.3)),
  counter("big-taco-cherryb-count", "チェリー", S(10922.7, 10922.7, 10922.7, 10922.7)),
  counter("big-taco-reacha-count", "リーチ目役A", S(16384.0, 16384.0, 16384.0, 16384.0)),
  counter("big-taco-reachb-count", "リーチ目役B", S(2621.4, 2520.6, 2427.3, 2259.9)),
  counter("big-taco-reachc-count", "リーチ目役C", S(2621.4, 2621.4, 2520.6, 2520.6)),
  counter("big-taco-reachd-count", "リーチ目役D", S(2621.4, 2520.6, 2427.3, 2259.9)),
];
// REGはリーチ目役B・Dへの発展がない
const REG_LEAVES = [
  counter("reg-solo-count", "単独", S(4681.1, 4369.1, 4096.0, 4096.0)),
  counter("reg-plum-count", "プラム", S(2730.7, 2340.6, 2048.0, 1820.4)),
  counter("reg-cherryb-count", "チェリー", S(5461.3, 4681.1, 4096.0, 3640.9)),
  counter("reg-reacha-count", "リーチ目役A", S(963.8, 949.8, 897.8, 885.6)),
  counter("reg-reachc-count", "リーチ目役C", S(963.8, 949.8, 897.8, 885.6)),
];
const W7_IDS = W7_LEAVES.map((e) => e.id);
const TACO_IDS = TACO_LEAVES.map((e) => e.id);
const REG_IDS = REG_LEAVES.map((e) => e.id);

const DETAIL_SECTIONS: ConfigSection[] = [
  { id: "basic-data", title: "基本データ", elements: [TOTAL_GAMES] },
  {
    id: "detail-normal",
    title: "通常時小役",
    layout: "grid",
    elements: [PLUM, SUIKA, CHERRY],
  },
  {
    id: "detail-big-w7",
    title: "BIGの契機（白7BB）",
    barTheme: "whiteRed",
    layout: "grid",
    collapsible: true,
    elements: [...W7_LEAVES, counter("big-w7-unknown-count", "白7BB・契機不明")],
  },
  {
    id: "detail-big-taco",
    title: "BIGの契機（タコBB）",
    layout: "grid",
    collapsible: true,
    elements: [
      ...TACO_LEAVES,
      counter("big-taco-unknown-count", "タコBB・契機不明"),
      counter("big-unknown-count", "BIG・種類も不明", {}, { colSpan: 2 }),
    ],
  },
  {
    id: "detail-reg",
    title: "REGの契機",
    // スマスロ ハナビのRBの契機と同じ灰色（ユーザー指定）
    barTheme: "gray",
    layout: "grid",
    collapsible: true,
    elements: [...REG_LEAVES, counter("reg-unknown-count", "契機不明")],
  },
  {
    id: "detail-bt",
    title: "ボーナスゲーム（BT）中",
    layout: "grid",
    collapsible: true,
    elements: [BT_GAMES, BT_REPLAY_TACO, BT_OTHER],
  },
  { id: "detail-hint", title: "設定示唆", elements: [HINT_NIGHT] },
];

export const takosloConfig: MachineConfig = {
  id: "takoslo",
  name: "スマスロ タコスロ",
  title: "【即計算】スマスロ タコスロ 設定判別｜GrapeReverse",
  type: "BT",
  themeColor: "bg-rose-800",
  detailSections: DETAIL_SECTIONS,
  // 3列の指標グリッドの2行目以降（1行目は BIG / REG / 合成）
  metricRows: [
    { label: "プラム", id: "plum-count" },
    { label: "スイカ", id: "suika-count" },
    { label: "チェ", id: "cherry-sum-count" },
    { label: "リプTG", id: "bt-replaytaco-count" },
    null,
    null,
  ],
  // 合計＝内訳の和。設定判別ページで合計を＋した分は「契機不明」へ入る
  sumGroups: [
    {
      totalId: "big-count",
      partIds: [...W7_IDS, "big-w7-unknown-count", ...TACO_IDS, "big-taco-unknown-count", "big-unknown-count"],
      unknownId: "big-unknown-count",
    },
    {
      totalId: "reg-count",
      partIds: [...REG_IDS, "reg-unknown-count"],
      unknownId: "reg-unknown-count",
    },
    { totalId: "bt-games", partIds: ["bt-replaytaco-count", "bt-other-count"] },
  ],
  detailModel: {
    bonusSplits: [
      {
        totalId: "big-count",
        unknownId: "big-unknown-count",
        parts: [
          ...W7_IDS.map((id) => ({ id })),
          { id: "big-w7-unknown-count", members: W7_IDS },
          ...TACO_IDS.map((id) => ({ id })),
          { id: "big-taco-unknown-count", members: TACO_IDS },
        ],
      },
      {
        totalId: "reg-count",
        unknownId: "reg-unknown-count",
        parts: REG_IDS.map((id) => ({ id })),
      },
    ],
    normalGroups: [
      { parts: [{ id: "plum-count" }] },
      { parts: [{ id: "suika-count" }] },
      { parts: [{ id: "cherry-sum-count" }] },
    ],
    // 分母は「手順を実行したボーナスゲーム数」（リプレイが出なかったゲームも含む。公表値と同じ定義）
    stateGroups: [{ gamesId: "bt-games", judgedIds: ["bt-replaytaco-count"] }],
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
          settingValues: { 1: 324.44, 2: 318.14, 5: 309.13, 6: 297.89 },
          isDiscriminationFactor: true,
          isReadOnly: true,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          unit: "回",
          settingValues: { 1: 352.34, 2: 336.08, 5: 312.08, 6: 300.62 },
          isDiscriminationFactor: true,
          isReadOnly: true,
        },
      ],
    },
    {
      id: "normal-role-section",
      title: "通常時小役",
      layout: "grid",
      elements: [PLUM, SUIKA, CHERRY],
    },
    {
      id: "bt-section",
      title: "ボーナスゲーム（BT）中",
      layout: "grid",
      elements: [BT_GAMES, BT_REPLAY_TACO, BT_OTHER],
    },
    { id: "hint-section", title: "設定示唆", elements: [HINT_NIGHT] },
  ],
  specs: {
    settings: [1, 2, 5, 6],
    // 詳細判別ページの全項目を使う計算（bayes-estimator.ts の calculateDetailedEstimation）
    estimationModel: "detailed",
    injectCherryCounter: false,
    baseGamesPerMedal: 36.6,
    payoutRatio: [98.7, 100.5, 103.3, 106.2],
    payouts: {
      big: 360,
      reg: 98,
    },
    judgmentWeights: {
      grapeWeightMap: { 0: 0.1, 2000: 0.2, 4000: 0.5, 6000: 0.8, 8000: 1.0 },
    },
  },
  // 設定が4段階のため、何も情報が無い状態で「設定5・6の可能性」は50%から始まる。
  // 文言の切り替え閾値はハナビと同じく高めに置く。
  specialAdvice: {
    tiers: [
      {
        maxGames: 3000,
        introHtml:
          '序盤戦です。ボーナス確率はまだブレが大きいため、<span class="font-bold underline decoration-rose-400 decoration-2">プラム・スイカ・チェリー</span>の出方も合わせて様子を見ましょう。',
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
            html: '<span class="font-bold">ボーナス・小役ともに高設定寄りの数値です。</span>BIG終了画面の「夜」やボーナスゲーム中の「リプレイ＋TACO GAME」にも注目して続行しましょう。',
          },
          {
            minProb: 50,
            maxProb: 75,
            html: "判断の分かれる数値です。ボーナス合算と小役確率がついてくるかを確認しましょう。",
          },
          {
            maxProb: 50,
            html: "低設定の可能性が高まっています。設定示唆が出ていない限り、深追いは禁物です。",
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
            html: '<span class="font-bold text-slate-500">厳しい数値です。設定示唆が出ていない限り、撤退も視野に入れましょう。</span>',
          },
        ],
      },
    ],
  },
  seoContent: [
    {
      title: "スマスロ タコスロの設定判別は「ボーナス合算」と「小役」が軸",
      paragraphs: [
        "スマスロ タコスロは設定1・2・5・6の4段階で、天井は非搭載。BIG（1/324.4〜1/297.9）・REG（1/352.3〜1/300.6）ともに設定差があり、ボーナス合算は1/168.9〜1/149.6。高設定を見極める目安は合算1/160前後になる。",
        "通常時のプラム（1/9.8〜1/9.0）・スイカ（1/60.0〜1/50.0）・チェリー（1/22.9〜1/20.1）も高設定ほど軽い。出現回数が多いぶんボーナスより早く差が表れやすい。<strong>当ページのカウンターで総ゲーム数・ボーナス・小役を記録すれば、設定5・6の可能性を自動で数値化できる。</strong>",
      ],
    },
    {
      title: "ボーナスゲーム中の「リプレイ＋TACO GAME」と終了画面",
      paragraphs: [
        "BIG後のボーナスゲーム（BT）中に「リプレイ＋TACO GAME」が同時に当選する確率は、設定1・2の1/728.2に対して設定6は1/242.7と約3倍。擬似リプレイハズシ（リプレイテンパイ時に左リール枠上へ白7をビタ押し）で見抜ける。毎ゲーム手順を実行したボーナスゲームの数と、確認できた回数を記録すると判別に反映される。低確率の要素なので、これだけで判断しないこと。",
        "BIG終了画面の「夜」は高設定示唆で、そのBIGでTACO GAMEが1度も入賞していなければ設定2以上濃厚。カウンターの「設定示唆」に記録すると、設定1を除外して判別結果に反映される。",
      ],
    },
  ],
  specPage: {
    strategy:
      "判別の軸はボーナス合算と通常時の小役（プラム・スイカ・チェリー）。ボーナス合算1/160前後が高設定の目安で、小役が揃って高設定域についてくるかを確認する。\nBIG後のボーナスゲーム中は擬似リプレイハズシで「リプレイ＋TACO GAME」（設定6は設定1・2の約3倍）を確認でき、BIG終了画面の「夜」（TACO GAME未入賞なら設定2以上濃厚）も見逃さないこと。",
    bonusProbAdvice:
      "BIG・REGともに設定差があり、ボーナス合算は設定1の1/168.9から設定6の1/149.6まで段階的に良くなる。高設定を見極める目安は合算1/160前後。",
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
                  { label: "導入開始", value: "2026年9月7日" },
                  { label: "設定", value: "1・2・5・6の4段階" },
                  { label: "天井", value: "非搭載" },
                  { label: "コイン持ち", value: "50枚あたり約36.6G（設定1）" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "payoutRatio",
        title: "機械割",
        icon: "💹",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "機械割", values: { 1: "98.7%", 2: "100.5%", 5: "103.3%", 6: "106.2%" } },
              { label: "完全技術介入", values: { 1: "100.7%", 2: "102.6%", 5: "105.5%", 6: "108.5%" } },
            ],
          },
        ],
        advice:
          "小役を取りこぼさず、ボーナスの察知をすばやく行うことで、設定1でも出玉率100%超えを狙える。",
      },
      {
        id: "smallRole",
        title: "通常時小役確率",
        icon: "🍑",
        blocks: [
          {
            kind: "bySetting",
            caption: "プラム・スイカ",
            columns: [
              { label: "プラム", values: { 1: "1/9.8", 2: "1/9.7", 5: "1/9.4", 6: "1/9.0" } },
              { label: "スイカA", values: { 1: "1/66.6", 2: "1/62.4", 5: "1/58.8", 6: "1/55.5" } },
              { label: "スイカB", values: { 1: "1/601.2", 2: "1/565.0", 5: "1/541.6", 6: "1/504.1" } },
              { label: "スイカ合算", values: { 1: "1/60.0", 2: "1/56.2", 5: "1/53.0", 6: "1/50.0" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "チェリー",
            columns: [
              { label: "チェリーB", values: { 1: "1/136.5", 2: "1/126.0", 5: "1/117.0", 6: "1/109.2" } },
              { label: "チェリーC", values: { 1: "1/32.3", 2: "1/30.9", 5: "1/29.7", 6: "1/28.5" } },
              { label: "チェリー合算", values: { 1: "1/22.9", 2: "1/21.9", 5: "1/21.0", 6: "1/20.1" } },
            ],
          },
          {
            kind: "byItem",
            caption: "設定差のない小役",
            rows: [
              { label: "リプレイ", values: { 1: "1/7.3", 2: "1/7.3", 5: "1/7.3", 6: "1/7.3" } },
              { label: "チェリーA", values: { 1: "1/184.6", 2: "1/184.6", 5: "1/184.6", 6: "1/184.6" } },
            ],
          },
        ],
        advice:
          "プラム・スイカ・チェリーはいずれも高設定ほど軽い。スイカA/B・チェリーA/Bは見た目で区別できないため、判別ツールでは合算（スイカ合算・チェリー合算）を数える。",
        note:
          "※チェリー合算はチェリーA・Bの成立回数とチェリーCの入賞回数の合算です。チェリーを取りこぼすと回数が減り、判別結果は低設定寄りに出ます。",
      },
      {
        id: "reachMe",
        title: "リーチ目役確率",
        icon: "🎯",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "A", values: { 1: "1/675.6", 2: "1/655.4", 5: "1/630.2", 6: "1/618.3" } },
              { label: "B", values: { 1: "1/1456.4", 2: "1/1424.7", 5: "1/1365.3", 6: "1/1285.0" } },
              { label: "C", values: { 1: "1/601.2", 2: "1/595.8", 5: "1/565.0", 6: "1/555.4" } },
            ],
          },
          {
            kind: "bySetting",
            columns: [
              { label: "D", values: { 1: "1/1598.4", 2: "1/1560.4", 5: "1/1489.5", 6: "1/1394.4" } },
              { label: "合成", values: { 1: "1/224.4", 2: "1/219.9", 5: "1/210.1", 6: "1/203.5" } },
            ],
          },
        ],
        advice:
          "リーチ目役は全4種類で、出現した時点でボーナス成立が確定する。A・Cは白7BB・タコBB・REGのいずれにも発展し、B・DはREGへは発展しない。",
      },
      {
        id: "bigType",
        title: "白7BB・タコBBの内訳",
        icon: "🐙",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "白7BB", values: { 1: "1/648.9", 2: "1/636.3", 5: "1/618.3", 6: "1/595.8" } },
              { label: "タコBB", values: { 1: "1/648.9", 2: "1/636.3", 5: "1/618.3", 6: "1/595.8" } },
            ],
          },
        ],
        advice:
          "BIGは白7揃い（白7BB）とタコ図柄揃い（タコBB）の2種類で、どの設定も同じ確率。両者を合わせるとBIG確率に一致する。",
      },
      {
        id: "bonusBreakdown",
        title: "契機別のボーナス確率",
        icon: "🧩",
        blocks: [
          {
            kind: "byItem",
            caption: "白7BB",
            rows: [
              { label: "単独", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/10922.7", 6: "1/10922.7" } },
              { label: "プラム", values: { 1: "1/5461.3", 2: "1/5461.3", 5: "1/5461.3", 6: "1/5461.3" } },
              { label: "チェリーB", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/10922.7", 6: "1/10922.7" } },
              { label: "リーチ目役A", values: { 1: "1/2621.4", 2: "1/2427.3", 5: "1/2427.3", 6: "1/2340.6" } },
              { label: "リーチ目役B", values: { 1: "1/3276.8", 2: "1/3276.8", 5: "1/3120.8", 6: "1/2978.9" } },
              { label: "リーチ目役C", values: { 1: "1/4096.0", 2: "1/4096.0", 5: "1/3855.1", 6: "1/3640.9" } },
              { label: "リーチ目役D", values: { 1: "1/4096.0", 2: "1/4096.0", 5: "1/3855.1", 6: "1/3640.9" } },
            ],
          },
          {
            kind: "byItem",
            caption: "タコBB",
            rows: [
              { label: "単独", values: { 1: "1/16384.0", 2: "1/16384.0", 5: "1/16384.0", 6: "1/16384.0" } },
              { label: "プラム", values: { 1: "1/5461.3", 2: "1/5461.3", 5: "1/5461.3", 6: "1/5461.3" } },
              { label: "チェリーB", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/10922.7", 6: "1/10922.7" } },
              { label: "リーチ目役A", values: { 1: "1/16384.0", 2: "1/16384.0", 5: "1/16384.0", 6: "1/16384.0" } },
              { label: "リーチ目役B", values: { 1: "1/2621.4", 2: "1/2520.6", 5: "1/2427.3", 6: "1/2259.9" } },
              { label: "リーチ目役C", values: { 1: "1/2621.4", 2: "1/2621.4", 5: "1/2520.6", 6: "1/2520.6" } },
              { label: "リーチ目役D", values: { 1: "1/2621.4", 2: "1/2520.6", 5: "1/2427.3", 6: "1/2259.9" } },
            ],
          },
          {
            kind: "byItem",
            caption: "REG",
            rows: [
              { label: "単独", values: { 1: "1/4681.1", 2: "1/4369.1", 5: "1/4096.0", 6: "1/4096.0" } },
              { label: "プラム", values: { 1: "1/2730.7", 2: "1/2340.6", 5: "1/2048.0", 6: "1/1820.4" } },
              { label: "チェリーB", values: { 1: "1/5461.3", 2: "1/4681.1", 5: "1/4096.0", 6: "1/3640.9" } },
              { label: "リーチ目役A", values: { 1: "1/963.8", 2: "1/949.8", 5: "1/897.8", 6: "1/885.6" } },
              { label: "リーチ目役C", values: { 1: "1/963.8", 2: "1/949.8", 5: "1/897.8", 6: "1/885.6" } },
            ],
          },
        ],
        advice:
          "どの役をきっかけに、白7BB・タコBB・REGのどれに発展したかの確率。内訳をすべて足すと、それぞれの解析値と一致する。REGはリーチ目役B・Dへの発展がない。詳細判別ページで契機ごとに数えると判別に反映される。",
      },
      {
        id: "overlapRate",
        title: "ボーナス同時成立期待度",
        icon: "🍒",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "プラム", values: { 1: "0.72%", 2: "0.77%", 5: "0.80%", 6: "0.83%" } },
              { label: "チェリーA・B", values: { 1: "2.87%", 2: "2.97%", 5: "3.06%", 6: "3.14%" } },
            ],
          },
        ],
        advice:
          "ボーナスと同時成立する可能性がある小役はプラム・チェリーB・リーチ目役の3種類で、高設定ほど期待度が高い。設定1では、ボーナスの81.4%が単独またはリーチ目役から成立する。",
      },
      {
        id: "btReplay",
        title: "リプレイ＋TACO GAME確率",
        icon: "🐙",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "ボーナスゲーム中", values: { 1: "1/728.2", 2: "1/728.2", 5: "1/366.1", 6: "1/242.7" } },
            ],
          },
        ],
        advice:
          "ボーナスゲーム（BT）中は全役でTACO GAMEの抽選が行われ、そのうちリプレイと同時に当選する確率に大きな設定差がある（設定6は設定1・2の約3倍）。逆押しで中・右リールを適当打ちし、リプレイがテンパイしたら左リール枠上に鉢巻付きの白7をビタ押しする「擬似リプレイハズシ」で見抜ける。",
        note:
          "※判別ツールには、毎ゲーム手順を実行したボーナスゲームだけを数えてください（リプレイが出なかったゲームも含みます）。ビタ押しに失敗したゲームは同時当選を見逃します。低確率の要素なので、これだけで判断しないでください。",
      },
      {
        id: "settingHint",
        title: "設定示唆",
        icon: "💡",
        blocks: [
          {
            kind: "info",
            items: [
              {
                title: "BIG終了画面",
                lines: [
                  { label: "夕方（通常）", value: "基本パターン" },
                  { label: "夜（レア）", value: "高設定示唆。そのBIGでTACO GAMEが1度も入賞していなければ設定2以上濃厚" },
                ],
              },
            ],
          },
        ],
        advice:
          "判別ツールの「設定示唆」には、TACO GAME未入賞のBIGで夜が出た場合だけを記録する（設定1を除外して判別結果に反映される）。",
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
                  { label: "獲得", value: "前半は最大153枚。その後のTACO LOOPを含め平均約360枚" },
                  { label: "流れ", value: "前半パート → ボーナスゲーム（BT）とTACO GAMEのループ → JAC BONUSで終了" },
                ],
              },
              {
                title: "ボーナスゲーム（BT）",
                lines: [
                  { label: "手順", value: "予告音が出たら白7・白7・BARを狙う" },
                  { label: "分岐", value: "白7・白7・BAR揃いでTACO GAMEへ、白7・白7・リプレイ揃いでJAC BONUSへ（ループ率約80%）" },
                ],
              },
              {
                title: "TACO GAME",
                lines: [
                  { label: "獲得", value: "1G完結。目押し成功で14枚、失敗（プラム揃い）で9枚" },
                  { label: "手順", value: "左リール中下段に鉢巻付きの白7を狙う。消化後はボーナスゲームへ戻る" },
                ],
              },
              {
                title: "REG",
                lines: [{ label: "獲得", value: "最大98枚（TACO LOOPへは派生しない）" }],
              },
            ],
          },
        ],
        advice:
          "BIGの平均獲得枚数（約360枚）は低設定域を中心とした情報の可能性があり、高設定では異なる場合がある。",
      },
    ],
  },
};
