// 確率指標の小カード（BIG確率・REG確率・合算確率など）。
//
// 小役カウンターページ（MachinePageFactory）の「4大指標」グリッドに
// ベタ書きされていたものを、前任者ページからも使えるよう切り出したもの。
// DOM構造・クラス・近似設定ラベルの判定ロジックは元の実装と同一。

import type { MachineConfig } from "../../types/machine-schema";
import { formatBonusText } from "../../utils/formatters";

interface ProbabilityMetricCardProps {
  label: string;
  /** 実測の確率分母（1/x の x）。0 のときは「---」表示 */
  val: number;
  format: (v: number) => string;
  /** 設定別の理論値。与えると最も近い設定を「(設定N近似)」として出す */
  settingValues?: Record<number, number>;
  config?: MachineConfig;
}

export default function ProbabilityMetricCard({
  label,
  val,
  format,
  settingValues,
  config,
}: ProbabilityMetricCardProps) {
  let approxSetting: number | null = null;
  if (val > 0 && settingValues) {
    let minDiff = Infinity;
    const settings = config?.specs?.settings || [1, 2, 3, 4, 5, 6];
    settings.forEach((setting) => {
      const settingVal = settingValues[setting];
      if (settingVal) {
        const diff = Math.abs(val - settingVal);
        if (diff < minDiff) {
          minDiff = diff;
          approxSetting = setting;
        }
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {formatBonusText(label)}
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-white">
        {val > 0 ? `1/${format(val)}` : "---"}
      </div>
      {approxSetting && (
        <div
          className={`text-xs font-bold ${
            approxSetting >= 5
              ? "text-red-500 dark:text-red-400"
              : "text-blue-500 dark:text-blue-400"
          }`}
        >
          {config?.specs?.approximationLabelOverride &&
          settingValues![approxSetting] ===
            config.specs.approximationLabelOverride.matchValue
            ? config.specs.approximationLabelOverride.label
            : `(設定${config?.specs?.settingLabels?.[approxSetting] || approxSetting}近似)`}
        </div>
      )}
    </div>
  );
}
