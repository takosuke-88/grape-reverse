// 実測確率から「(設定N近似)」ラベルを組み立てる共通処理。
//
// 設定判別ページの指標カード（ProbabilityMetricCard）と、ぶどう/ベル逆算ページの
// 指標カード（GrapeReverseEstimationPanel）の両方がこれを使う。以前は同じ判定が
// 2箇所に別実装で存在し、片方は `config.id === "aimex"` のベタ書き、もう片方は
// `specs.approximationLabelOverride` という特例フィールドで同じ問題に対処していた。
//
// 【同値の設定をまとめて出す理由】(2026-09-22)
// 設定値が完全に一致している設定が複数ある項目は珍しくない。例えばマイジャグラーVの
// 角チェリーは設定4・5・6がどれも1/35.62で、アイムジャグラーEXのブドウは設定1〜5が
// どれも1/6.02。従来は最も小さい設定だけを出していたため「(設定4近似)」「(設定1近似)」
// となり、実際は4〜6／1〜5のどれでもあり得ることが画面から読み取れなかった。
//
// 【表記】ハイフンで範囲を示す（`(設定4-6近似)`）。何個並んでも幅83pxで一定になる。
// 中黒で全部並べる案（`(設定1・2・3・4・5・6近似)`）は158pxあり、カード内側126pxに
// 入らないため不採用。
//
// 【色分けの基準】同値グループの最小の設定を使う（＝従来の approxSetting と同じ値）。
// 最大を使うと、設定差が無くて全設定が並ぶ項目まで赤（高設定色）になってしまう。

import type { MachineConfig } from "../types/machine-schema";

export interface ApproximationResult {
  /** 設定値が一致している設定の一覧（昇順）。色分けには settings[0] を使う */
  settings: number[];
  /** 例: `(設定4近似)` / `(設定4-6近似)` / `(設定1-6近似)` */
  label: string;
}

/**
 * 実測値に最も近い設定値を探し、その設定値と完全に一致する設定をすべて拾って
 * ラベル文字列にする。該当なし（未計測・設定値未定義）のときは null。
 */
export function resolveApproximation(
  val: number,
  settingValues: Record<number, number> | undefined,
  config?: MachineConfig,
): ApproximationResult | null {
  if (!(val > 0) || !settingValues) return null;

  const candidates = (config?.specs?.settings || [1, 2, 3, 4, 5, 6]).filter(
    (s) => settingValues[s],
  );
  if (candidates.length === 0) return null;

  // まず最も近い「設定値」を決める。同点（実測値がちょうど2つの設定値の中間に
  // 来た場合）は従来どおり小さい設定側を採用する。
  let minDiff = Infinity;
  let nearestValue = 0;
  candidates.forEach((setting) => {
    const diff = Math.abs(val - settingValues[setting]);
    if (diff < minDiff) {
      minDiff = diff;
      nearestValue = settingValues[setting];
    }
  });

  // 同じ設定値を持つ設定をすべて拾う。差が同点なだけの設定は含めない
  // （「値が同じ」ことだけを根拠にする）。
  const settings = candidates.filter((s) => settingValues[s] === nearestValue);

  return { settings, label: `(設定${formatSettings(settings, config)}近似)` };
}

/**
 * 連続する設定をハイフンでまとめる。1→"1" / 5,6→"5-6" / 4,5,6→"4-6"。
 * 飛び番（1,2,4）は中黒で連結して "1-2・4"。
 */
function formatSettings(settings: number[], config?: MachineConfig): string {
  const labels = config?.specs?.settingLabels;

  // 「設定V」のような独自ラベルを持つ設定が混ざる場合、範囲表記にすると
  // "4-V" のような読めない文字列になるため、中黒で個別に並べる。
  if (labels && settings.some((s) => labels[s])) {
    return settings.map((s) => labels[s] ?? String(s)).join("・");
  }

  // 設定4が存在しない機種（ハイハイシオサイ）で 3,5 を "3-5" と書くと、
  // 実在しない設定4を含むように読めてしまう。連番判定は設定番号そのもので行う。
  const runs: number[][] = [];
  settings.forEach((s) => {
    const last = runs[runs.length - 1];
    if (last && s === last[last.length - 1] + 1) last.push(s);
    else runs.push([s]);
  });

  return runs
    .map((run) => (run.length === 1 ? `${run[0]}` : `${run[0]}-${run[run.length - 1]}`))
    .join("・");
}
