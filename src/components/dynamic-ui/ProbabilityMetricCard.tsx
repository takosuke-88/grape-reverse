// 確率指標の小カード（BIG確率・REG確率・合成確率など）。
//
// 小役カウンターページ（MachinePageFactory）の「4大指標」グリッドに
// ベタ書きされていたものを、前任者ページからも使えるよう切り出したもの。
// DOM構造・クラスは元の実装と同一。近似設定ラベルの判定だけは 2026-09-22 に
// approximation-label.ts へ移し、逆算ページの指標カードと共通化した。

import type { MachineConfig } from "../../types/machine-schema";
import { formatBonusText } from "../../utils/formatters";
import { resolveApproximation } from "../../utils/approximation-label";

interface ProbabilityMetricCardProps {
  label: string;
  /** 実測の確率分母（1/x の x）。0 のときは「---」表示 */
  val: number;
  /**
   * この確率の母数になっている実測回数。ラベル横に「◯◯回」と出す。
   * 前任者分を差し引いている場合はその差し引き後の回数が渡る（カード内の確率と
   * 同じ基準）。カウンターバーのラベルと違い「差分」の語は付けない。
   * 0（未計測）のときは何も出さない。
   */
  count?: number;
  format: (v: number) => string;
  /** 設定別の理論値。与えると最も近い設定を「(設定N近似)」として出す */
  settingValues?: Record<number, number>;
  config?: MachineConfig;
}

export default function ProbabilityMetricCard({
  label,
  val,
  count,
  format,
  settingValues,
  config,
}: ProbabilityMetricCardProps) {
  // 設定値が一致している設定は「(設定4-6近似)」のようにまとめて出す。
  // 色分けは同値グループの最小設定を基準にする（approximation-label.ts 参照）。
  const approximation = resolveApproximation(val, settingValues, config);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {formatBonusText(label)}
        {count != null && count > 0 && (
          <span className="ml-1 font-bold text-slate-600 dark:text-slate-300">
            {count}回
          </span>
        )}
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-white">
        {val > 0 ? `1/${format(val)}` : "---"}
      </div>
      {approximation && (
        <div
          className={`text-xs font-bold ${
            approximation.settings[0] >= 5
              ? "text-red-500 dark:text-red-400"
              : "text-blue-500 dark:text-blue-400"
          }`}
        >
          {approximation.label}
        </div>
      )}
    </div>
  );
}
