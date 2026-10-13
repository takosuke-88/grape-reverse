import type { MachineConfig } from "../../types/machine-schema";

// スマスロ ハナビ（ユニバーサルエンターテインメント／アクロスブランド）
// 出典: ユーザー提供のスペック表（2026-10-05）。重複内訳・同時成立期待度は解析値。
// 設定は1・2・5・6の4段階。
//
// 判別に使う項目（2026-10-05 ユーザー決定）:
//   総ゲーム数・BIG・REG・風鈴（合成）・単独REG（REG合計を単独/重複に分解）
//   ＋設定示唆（ピース花火・BIG中バラケ目・REG中バラケ目）
// 特殊リプレイはスペック表のみ（判別には使わない）。設定5・6の値は資料に無いため、
// ボーナス重複内訳（ドンBB 1/4369.1 ＋ 赤7BB 1/6553.6）からの算出値 1/2621.4 を使う。
// 設定1・2は同じ計算で資料の値と一致する（特殊リプレイは必ずボーナスを伴う）。
export const hanabiConfig: MachineConfig = {
  id: "hanabi",
  name: "スマスロ ハナビ",
  title: "【即計算】スマスロ ハナビ 設定判別｜GrapeReverse",
  type: "A-type",
  themeColor: "bg-indigo-800",
  // ボーナス名はユーザー決定で BB / RB に統一（2026-10-13）
  bonusLabels: { big: "BB", reg: "RB" },
  sections: [
    {
      id: "basic-data",
      title: "基本データ",
      elements: [
        {
          id: "total-games",
          label: "総ゲーム数",
          type: "counter",
          context: {},
          settingValues: { 1: 0, 2: 0, 5: 0, 6: 0 },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
    {
      id: "bonus-section",
      title: "ボーナス回数",
      layout: "grid",
      elements: [
        {
          id: "big-count",
          label: "BB回数",
          type: "counter",
          unit: "回",
          settingValues: { 1: 297.9, 2: 292.6, 5: 284.9, 6: 273.1 },
          isDiscriminationFactor: true,
          isReadOnly: true,
        },
        {
          id: "reg-count",
          label: "RB回数",
          type: "counter",
          unit: "回",
          settingValues: { 1: 394.8, 2: 358.1, 5: 313.6, 6: 282.5 },
          isDiscriminationFactor: true,
          isReadOnly: true,
        },
      ],
    },
    {
      id: "normal-role-section",
      title: "通常時小役",
      elements: [
        {
          // 風鈴A＋風鈴Bの合成。判別の主軸（ジャグラーのぶどうに相当）
          id: "furin-count",
          label: "風鈴",
          type: "counter",
          context: {},
          settingValues: { 1: 9.68, 2: 9.45, 5: 9.06, 6: 8.64 },
          isDiscriminationFactor: true,
        },
      ],
    },
    {
      id: "bonus-breakdown-section",
      title: "RB詳細内訳",
      layout: "grid",
      elements: [
        // REG合計を単独／重複へ分解して判別に使う（ジャグラーの単独REG/チェリーREGと同じ仕組み）。
        // reg-cherry-count は「チェリー」ではなく「重複REG」（リプレイ・チェリーB・リーチ目役B/D との同時成立）
        // として使う。値は重複合算（1/601.2 等）。1/単独 + 1/重複 は公表REG合計と一致する。
        // ※ジャグラーと違い、REGに占める単独の割合が設定でほぼ変わらない（設定1 34.3%／設定6 33.2%）。
        //   シミュレーション（2026-10-05）でも、内訳を分けて数えた場合の正答率はREG合計のみと誤差の範囲。
        {
          id: "reg-solo-count",
          label: "単独RB",
          type: "counter",
          unit: "回",
          settingValues: { 1: 1149.8, 2: 1040.3, 5: 936.2, 6: 851.1 },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-cherry-count",
          label: "重複RB",
          type: "counter",
          unit: "回",
          settingValues: { 1: 601.2, 2: 546.1, 5: 471.5, 6: 422.8 },
          isDiscriminationFactor: true,
          visibility: "detail",
        },
        {
          id: "reg-unknown-count",
          label: "契機不明RB",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
          colSpan: 2,
        },
      ],
    },
    {
      id: "hint-section",
      title: "設定示唆",
      elements: [
        {
          id: "hint-peace-hanabi",
          label: "RB終了画面ピース花火",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
          impliedSettings: [2, 5, 6],
          hintLabel: "設定2以上濃厚",
        },
        {
          id: "hint-big-barake",
          label: "BB中バラケ目",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
          impliedSettings: [5, 6],
          hintLabel: "設定5・6濃厚",
        },
        {
          id: "hint-reg-barake",
          label: "RB中バラケ目",
          type: "counter",
          unit: "回",
          settingValues: {},
          isDiscriminationFactor: false,
          visibility: "detail",
          impliedSettings: [6],
          hintLabel: "設定6濃厚",
        },
      ],
    },
  ],
  specs: {
    settings: [1, 2, 5, 6],
    estimationModel: "multinomial",
    injectCherryCounter: false,
    baseGamesPerMedal: 42.3,
    // 市場想定の出玉率（完全攻略時はスペックページに併記）
    payoutRatio: [98.6, 100.4, 103.0, 106.4],
    payouts: {
      big: 239,
      reg: 96,
    },
    judgmentWeights: {
      grapeWeightMap: { 0: 0.1, 2000: 0.2, 4000: 0.5, 6000: 0.8, 8000: 1.0 },
    },
  },
  // 設定が4段階のため、何も情報が無い状態で「設定5・6の可能性」は50%から始まる
  // （6段階のジャグラーは33%）。そのため文言の切り替え閾値はジャグラーより高めに置く。
  specialAdvice: {
    tiers: [
      {
        maxGames: 3000,
        introHtml:
          '序盤戦です。ボーナス確率はまだブレが大きいため、<span class="font-bold underline decoration-indigo-400 decoration-2">RB確率と風鈴確率</span>を軸に様子を見ましょう。',
        brackets: [
          // 序盤は低設定寄りの文言を出さない（未入力の0G時点でも期待度0%として
          // 判定され、「低設定寄り」と誤って出てしまうため）
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
            html: '<span class="font-bold">RB・風鈴ともに高設定寄りの数値です。</span>BB中・RB中のバラケ目やRB終了画面のピース花火にも注目して続行しましょう。',
          },
          {
            minProb: 50,
            maxProb: 75,
            html: "判断の分かれる数値です。RB確率と風鈴確率がついてくるかを確認しましょう。",
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
      title: "スマスロ ハナビの設定判別は「RB」と「風鈴」が軸",
      paragraphs: [
        "スマスロ ハナビは設定1・2・5・6の4段階。BB確率の設定差は1/297.9〜1/273.1と小さく、判別の主軸はRB確率（1/394.8〜1/282.5）になる。RBは単独・重複のどちらも高設定ほど軽くなるため、RBの合計を数えるだけで設定差を十分に拾える。",
        "もう一つの軸が通常時の風鈴。風鈴A・Bの合成で1/9.68〜1/8.64と、出現回数が多いぶん数千ゲームで差が表れやすい。<strong>当ページのカウンターで総ゲーム数・ボーナス・風鈴を記録すれば、設定5・6の可能性を自動で数値化できる。</strong>",
      ],
    },
    {
      title: "見逃せない設定示唆",
      paragraphs: [
        "RB終了画面のピース花火は設定2以上濃厚。BB中のバラケ目は設定5・6で1/819.2（設定1・2は1/16384）、RB中のバラケ目は設定6で1/1092.3（設定1〜5は1/16384）と、出現すれば強力な根拠になる。カウンターの「設定示唆」に記録すると、該当しない設定を除外して判別結果に反映される。",
      ],
    },
  ],
  specPage: {
    strategy:
      "判別の軸はRB確率と風鈴確率。BBの設定差は小さいため、ボーナス合成だけで押し引きを決めず、RBと風鈴の両方が高設定域についてくるかを確認する。\nRB終了画面のピース花火（設定2以上濃厚）、BB中・RB中のバラケ目（設定5・6濃厚／設定6濃厚）は出現すれば強い根拠になるので見逃さないこと。",
    bonusProbAdvice:
      "BBの設定差は1/297.9〜1/273.1と小さく、判別の主軸はRB。設定6のRBは1/282.5で、設定1（1/394.8）とは約1.4倍の差がある。",
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
                  { label: "メーカー", value: "ユニバーサルエンターテインメント（アクロスブランド）" },
                  { label: "タイプ", value: "6.5号機 ノーマル＋RT（スマスロ）" },
                  { label: "導入開始", value: "2026年2月2日" },
                  { label: "設定", value: "1・2・5・6の4段階" },
                  { label: "天井", value: "非搭載" },
                  { label: "ベース", value: "50枚あたり約42.3G（設定1）" },
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
              { label: "市場想定", values: { 1: "98.6%", 2: "100.4%", 5: "103.0%", 6: "106.4%" } },
              { label: "完全攻略", values: { 1: "100.2%", 2: "102.0%", 5: "104.6%", 6: "108.0%" } },
            ],
          },
        ],
        advice:
          "完全攻略は技術介入と小役の完全奪取を行った場合の数値。設定1でも100%を超えるため、手順を守るほど期待値が上がる。",
      },
      {
        id: "smallRole",
        title: "通常時小役確率",
        icon: "🎐",
        blocks: [
          {
            kind: "bySetting",
            caption: "風鈴",
            columns: [
              { label: "風鈴A", values: { 1: "1/12.90", 2: "1/12.50", 5: "1/12.10", 6: "1/11.50" } },
              { label: "風鈴B", values: { 1: "1/38.39", 2: "1/38.71", 5: "1/36.21", 6: "1/34.49" } },
              { label: "合成", values: { 1: "1/9.68", 2: "1/9.45", 5: "1/9.06", 6: "1/8.64" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "チェリー",
            columns: [
              { label: "A1", values: { 1: "1/99.45", 2: "1/99.45", 5: "1/99.45", 6: "1/99.30" } },
              { label: "A2", values: { 1: "1/20.99", 2: "1/19.40", 5: "1/20.50", 6: "1/19.60" } },
              { label: "B", values: { 1: "1/307.68", 2: "1/306.24", 5: "1/300.62", 6: "1/297.89" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "リプレイ・氷",
            columns: [
              { label: "リプレイ", values: { 1: "1/7.3", 2: "1/7.3", 5: "1/7.3", 6: "1/7.3" } },
              { label: "特殊リプ", values: { 1: "1/2849.4", 2: "1/2730.7", 5: "1/2621.4", 6: "1/2621.4" } },
              { label: "氷A", values: { 1: "1/46.32", 2: "1/47.28", 5: "1/46.18", 6: "1/47.39" } },
              { label: "氷B", values: { 1: "1/1560.4", 2: "1/1560.4", 5: "1/1560.4", 6: "1/1560.4" } },
            ],
          },
        ],
        advice:
          "判別に使うのは風鈴A・Bの合成。設定1の1/9.68から設定6の1/8.64まで段階的に良くなる。チェリー・氷・リプレイの設定差は小さい。",
        note:
          "※特殊リプレイの設定5・6は、ボーナス重複確率（ドンBB 1/4369.1・赤7BB 1/6553.6）からの算出値です。",
      },
      {
        id: "reachMe",
        title: "リーチ目役確率",
        icon: "🎆",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "A", values: { 1: "1/4369.1", 2: "1/4369.1", 5: "1/4369.1", 6: "1/3855.1" } },
              { label: "B", values: { 1: "1/1598.4", 2: "1/1424.7", 5: "1/1236.5", 6: "1/1129.9" } },
              { label: "C", values: { 1: "1/1872.5", 2: "1/1820.4", 5: "1/1771.2", 6: "1/1771.2" } },
            ],
          },
          {
            kind: "bySetting",
            columns: [
              { label: "D", values: { 1: "1/923.0", 2: "1/885.6", 5: "1/819.2", 6: "1/753.3" } },
              { label: "E", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/10922.7", 6: "1/9362.3" } },
              { label: "5種合算", values: { 1: "1/390.1", 2: "1/370.3", 5: "1/343.1", 6: "1/318.1" } },
            ],
          },
        ],
        advice:
          "リーチ目役はいずれもボーナスと同時に成立する。個々の設定差は小さいが、5種類の合算で見ると1/390.1〜1/318.1と大きな設定差がある。",
      },
      {
        id: "bonusDetail",
        title: "単独・重複ボーナス確率",
        icon: "🎲",
        blocks: [
          {
            kind: "bySetting",
            caption: "単独",
            columns: [
              { label: "ドンBB", values: { 1: "1/1724.6", 2: "1/1680.4", 5: "1/1680.4", 6: "1/1598.4" } },
              { label: "赤7BB", values: { 1: "1/2184.5", 2: "1/2114.1", 5: "1/2114.1", 6: "1/2048.0" } },
              { label: "RB", values: { 1: "1/1149.8", 2: "1/1040.3", 5: "1/936.2", 6: "1/851.1" } },
            ],
          },
          {
            kind: "bySetting",
            caption: "重複（合算）",
            columns: [
              { label: "ドンBB", values: { 1: "1/910.2", 2: "1/897.8", 5: "1/862.3", 6: "1/829.6" } },
              { label: "赤7BB", values: { 1: "1/819.2", 2: "1/809.1", 5: "1/780.2", 6: "1/744.7" } },
              { label: "RB", values: { 1: "1/601.2", 2: "1/546.1", 5: "1/471.5", 6: "1/422.8" } },
            ],
          },
        ],
        advice:
          "単独RB（1/1149.8〜1/851.1）・重複RB（1/601.2〜1/422.8）とも高設定ほど軽くなり、両者の比率は設定でほとんど変わらない。そのため判別にはRBの合計で十分で、単独・重複を分けて数えても精度はほぼ変わらない。",
      },
      {
        id: "bonusBreakdown",
        title: "ボーナス重複内訳",
        icon: "🧩",
        blocks: [
          {
            kind: "byItem",
            caption: "ドンBB",
            rows: [
              { label: "単独", values: { 1: "1/1724.6", 2: "1/1680.4", 5: "1/1680.4", 6: "1/1598.4" } },
              { label: "リプレイ", values: { 1: "1/5461.3", 2: "1/5461.3", 5: "1/5041.2", 6: "1/5041.2" } },
              { label: "特殊リプ", values: { 1: "1/4681.1", 2: "1/4369.1", 5: "1/4369.1", 6: "1/4369.1" } },
              { label: "風鈴A", values: { 1: "1/16384.0", 2: "1/16384.0", 5: "1/13107.2", 6: "1/13107.2" } },
              { label: "チェリーB", values: { 1: "1/13107.2", 2: "1/13107.2", 5: "1/10922.7", 6: "1/10922.7" } },
              { label: "リーチ目役A", values: { 1: "1/8192.0", 2: "1/8192.0", 5: "1/8192.0", 6: "1/7281.8" } },
              { label: "リーチ目役D", values: { 1: "1/2849.4", 2: "1/2849.4", 5: "1/2849.4", 6: "1/2730.7" } },
              { label: "リーチ目役E", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/10922.7", 6: "1/9362.3" } },
            ],
          },
          {
            kind: "byItem",
            caption: "赤7BB",
            rows: [
              { label: "単独", values: { 1: "1/2184.5", 2: "1/2114.1", 5: "1/2114.1", 6: "1/2048.0" } },
              { label: "リプレイ", values: { 1: "1/5461.3", 2: "1/5461.3", 5: "1/5461.3", 6: "1/5041.2" } },
              { label: "特殊リプ", values: { 1: "1/7281.8", 2: "1/7281.8", 5: "1/6553.6", 6: "1/6553.6" } },
              { label: "チェリーA1", values: { 1: "1/16384.0", 2: "1/16384.0", 5: "1/16384.0", 6: "1/13107.2" } },
              { label: "チェリーB", values: { 1: "1/10922.7", 2: "1/10922.7", 5: "1/9362.3", 6: "1/9362.3" } },
              { label: "リーチ目役A", values: { 1: "1/9362.3", 2: "1/9362.3", 5: "1/9362.3", 6: "1/8192.0" } },
              { label: "リーチ目役C", values: { 1: "1/1872.5", 2: "1/1820.4", 5: "1/1771.2", 6: "1/1771.2" } },
              { label: "リーチ目役D", values: { 1: "1/9362.3", 2: "1/9362.3", 5: "1/9362.3", 6: "1/8192.0" } },
            ],
          },
          {
            kind: "byItem",
            caption: "RB",
            rows: [
              { label: "単独", values: { 1: "1/1149.8", 2: "1/1040.3", 5: "1/936.2", 6: "1/851.1" } },
              { label: "リプレイ", values: { 1: "1/3276.8", 2: "1/2978.9", 5: "1/2520.6", 6: "1/2184.5" } },
              { label: "チェリーB", values: { 1: "1/9362.3", 2: "1/8192.0", 5: "1/6553.6", 6: "1/5461.3" } },
              { label: "リーチ目役B", values: { 1: "1/1598.4", 2: "1/1424.7", 5: "1/1236.5", 6: "1/1129.9" } },
              { label: "リーチ目役D", values: { 1: "1/1598.4", 2: "1/1489.5", 5: "1/1310.7", 6: "1/1191.6" } },
            ],
          },
        ],
      },
      {
        id: "overlapRate",
        title: "ボーナス同時成立期待度",
        icon: "🍒",
        blocks: [
          {
            kind: "bySetting",
            columns: [
              { label: "チェリーA1", values: { 1: "0.11%", 2: "0.10%", 5: "0.10%", 6: "0.12%" } },
              { label: "チェリーB", values: { 1: "7.8%", 2: "8.2%", 5: "9.5%", 6: "10.2%" } },
              { label: "リプレイ", values: { 1: "0.5%", 2: "0.5%", 5: "0.6%", 6: "0.6%" } },
              { label: "風鈴A", values: { 1: "0.06%", 2: "0.06%", 5: "0.07%", 6: "0.07%" } },
            ],
          },
          {
            kind: "info",
            caption: "ボーナス当選時の特徴",
            items: [
              { title: "チェリーA1", lines: [{ label: "特徴", value: "リーチ目が出現しやすい（重複するのは赤7BBのみ）" }] },
              { title: "チェリーB", lines: [{ label: "特徴", value: "たまやチャレンジが発生（選択時）" }] },
              { title: "風鈴A", lines: [{ label: "特徴", value: "フリーズが発生（重複するのはドンBBのみ）" }] },
            ],
          },
        ],
        advice:
          "特殊役を除くと、ボーナスと同時成立する可能性があるのはこの4種類。いずれも判別に使えるほどの差ではないが、チェリーBは高設定ほどやや期待度が高い。",
      },
      {
        id: "bonusRole",
        title: "ボーナス中・RT中の小役確率",
        icon: "🎇",
        blocks: [
          {
            kind: "byItem",
            caption: "BB中",
            rows: [
              { label: "風鈴A", note: "平行揃い・奇数設定優遇", values: { 1: "1/1.1", 2: "1/1.2", 5: "1/1.1", 6: "1/1.2" } },
              { label: "風鈴B", note: "斜め揃い/逆L字・偶数設定優遇", values: { 1: "1/10.0", 2: "1/7.0", 5: "1/10.0", 6: "1/7.0" } },
              { label: "バラケ目", note: "設定5・6濃厚", values: { 1: "1/16384", 2: "1/16384", 5: "1/819.2", 6: "1/819.2" } },
            ],
          },
          {
            kind: "byItem",
            caption: "RB中",
            rows: [
              { label: "風鈴A", note: "全設定共通", values: { 1: "1/1.2", 2: "1/1.2", 5: "1/1.2", 6: "1/1.2" } },
              { label: "1枚役", note: "高設定ほど優遇", values: { 1: "1/8.0", 2: "1/8.0", 5: "1/7.0", 6: "1/7.0" } },
              { label: "共通15枚役", note: "全設定共通", values: { 1: "1/32.8", 2: "1/32.8", 5: "1/32.8", 6: "1/32.8" } },
              { label: "バラケ目", note: "設定6濃厚", values: { 1: "1/16384", 2: "1/16384", 5: "1/16384", 6: "1/1092.3" } },
            ],
          },
          {
            kind: "byItem",
            caption: "花火チャレンジ",
            rows: [
              { label: "ハズレ", note: "高設定ほど出やすい", values: { 1: "1/4.7", 2: "1/4.5", 5: "1/4.3", 6: "1/4.2" } },
              { label: "通常リプレイ", note: "低設定ほど出やすい", values: { 1: "1/3.2", 2: "1/3.4", 5: "1/3.6", 6: "1/3.7" } },
              { label: "移行リプレイ", note: "全設定共通", values: { 1: "1/3.5", 2: "1/3.5", 5: "1/3.5", 6: "1/3.5" } },
            ],
          },
          {
            kind: "byItem",
            caption: "花火GAME",
            rows: [
              { label: "ハズレ", note: "高設定ほど出やすい", values: { 1: "1/6.4", 2: "1/6.0", 5: "1/5.4", 6: "1/5.4" } },
              { label: "RTリプレイ", note: "設定1が出やすい", values: { 1: "1/1.9", 2: "1/2.0", 5: "1/2.1", 6: "1/2.1" } },
              { label: "通常リプレイ", note: "全設定共通", values: { 1: "1/7.3", 2: "1/7.3", 5: "1/7.3", 6: "1/7.3" } },
            ],
          },
        ],
      },
      {
        id: "settingHint",
        title: "設定示唆",
        icon: "💡",
        blocks: [
          {
            kind: "info",
            items: [
              { title: "RB終了画面", lines: [{ label: "ピース花火", value: "設定2以上濃厚（左上に出現）" }] },
              { title: "BB中", lines: [{ label: "バラケ目", value: "設定5・6濃厚（設定5・6は1/819.2、設定1・2は1/16384）" }] },
              { title: "RB中", lines: [{ label: "バラケ目", value: "設定6濃厚（設定6は1/1092.3、設定1〜5は1/16384）" }] },
            ],
          },
          {
            kind: "byItem",
            caption: "ピース花火の出現率（RB中の1枚役入賞回数別）",
            rows: [
              { label: "2回以下", values: { 1: "なし", 2: "3.1%", 5: "3.1%", 6: "3.1%" } },
              { label: "3〜4回", values: { 1: "なし", 2: "10.0%", 5: "10.0%", 6: "10.0%" } },
              { label: "5回以上", values: { 1: "なし", 2: "25.0%", 5: "25.0%", 6: "25.0%" } },
            ],
          },
        ],
        advice:
          "RB中の1枚役が多いほどピース花火が出やすい。設定判別ページの「設定示唆」に記録すると、該当しない設定を除外して判別結果に反映される。",
      },
      {
        id: "bonusSpec",
        title: "ボーナス・RT仕様",
        icon: "📖",
        blocks: [
          {
            kind: "info",
            items: [
              {
                title: "BB",
                lines: [
                  { label: "獲得", value: "最大239枚" },
                  { label: "手順", value: "1度だけ左リール中段に赤7をビタ押し（14枚役。氷・赤7・風鈴が停止）。以降は逆押しフリー打ちで最大枚数を獲得" },
                  { label: "終了後", value: "RT「花火チャレンジ」へ" },
                ],
              },
              {
                title: "RB",
                lines: [
                  { label: "獲得", value: "最大96枚（8回入賞または12G消化で終了）" },
                  { label: "手順", value: "予告音発生時は左リールに3連ドンを狙って1枚役を回避。予告音なしはフリー打ち（左3連ドンのビタ押しで入賞音が変化）" },
                  { label: "終了後", value: "通常時へ" },
                ],
              },
              {
                title: "花火チャレンジ",
                lines: [
                  { label: "継続", value: "最大20G・純増約0.2枚/G" },
                  { label: "手順", value: "残り8GまではJAC INをハズす（逆押し適当打ち後、左リール枠上〜中段にBAR狙い等）。残り7G以降は順押し適当打ちでJAC INを優先" },
                  { label: "移行", value: "移行リプレイ（JAC IN）入賞で花火GAMEへ" },
                ],
              },
              {
                title: "花火GAME",
                lines: [
                  { label: "継続", value: "最大20G・純増約0.4枚/G" },
                  { label: "手順", value: "通常時と同様に小役を狙う。演出発生時はチェリー・氷をフォロー" },
                  { label: "終了", value: "完走またはボーナス成立で終了" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
