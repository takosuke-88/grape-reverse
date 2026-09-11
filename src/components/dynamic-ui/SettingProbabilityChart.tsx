// ベイズ推定の確率分布グラフ（設定別・縦棒）。
//
// 小役カウンターページ（MachinePageFactory）にベタ書きされていたものを、
// 前任者ページからも使えるようそのまま切り出したもの。DOM構造・クラス・
// 配色・アニメーションは元の実装と同一（見た目を変えないための切り出し）。

import type { EstimationResult } from "../../types/machine-schema";

interface SettingProbabilityChartProps {
  /** null の場合は settings をもとに全て0%のバーを描く */
  results: EstimationResult[] | null;
  settings: number[];
  /** グラフ下の注記。既定は「※ベイズ推定による確率分布」 */
  note?: string;
}

const COLORS = [
  { bg: "bg-slate-400", text: "text-slate-600" }, // 1
  { bg: "bg-slate-400", text: "text-slate-600" }, // 2
  { bg: "bg-slate-400", text: "text-slate-600" }, // 3
  { bg: "bg-blue-500", text: "text-blue-600" }, // 4
  { bg: "bg-amber-500", text: "text-amber-600" }, // 5
  { bg: "bg-rose-600", text: "text-rose-600" }, // 6
];

export default function SettingProbabilityChart({
  results,
  settings,
  note = "※ベイズ推定による確率分布",
}: SettingProbabilityChartProps) {
  const data =
    results || settings.map((s) => ({ setting: s, probability: 0 }));

  return (
    <>
      {/* グラフ描画エリア（縦棒グラフ） - h-48に拡大して視認性向上 */}
      <div className="flex items-end justify-around gap-2 h-48 border-b border-slate-200 pb-1 dark:border-slate-700 mt-6">
        {data.map((result, index, arr) => {
          const colorObj = COLORS[index] || COLORS[0];
          const maxResult = arr.reduce((max, current) =>
            current.probability > max.probability ? current : max,
          );
          const isMax =
            result.setting === maxResult.setting && result.probability > 0;
          const percentage = Math.max(result.probability, 1); // 最小1%確保

          return (
            <div
              key={result.setting}
              className="flex flex-col items-center flex-1 h-full justify-end group mt-4"
            >
              <div className="relative w-full flex-1 flex items-end justify-center px-1">
                {isMax && (
                  <div
                    className="absolute w-full flex justify-center z-10 pointer-events-none"
                    style={{ bottom: `calc(${percentage}% + 18px)` }}
                  >
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm ${
                        result.probability === 100 && result.setting === 6
                          ? "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white animate-pulse"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {result.probability === 100 && result.setting === 6
                        ? "設定6濃厚！"
                        : "最有力"}
                    </span>
                  </div>
                )}
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 hover:opacity-80 ${
                    result.probability === 100 && result.setting === 6
                      ? "bg-gradient-to-t from-purple-500 via-pink-500 to-red-500 animate-pulse"
                      : colorObj.bg
                  }`}
                  style={{
                    height: `${percentage}%`,
                  }}
                ></div>
                {/* 確率表示（バーの上） */}
                <span
                  className={`absolute mb-0.5 tabular-nums font-bold ${
                    isMax
                      ? result.probability === 100 && result.setting === 6
                        ? "text-red-500 text-sm"
                        : colorObj.text + " text-xs"
                      : "text-slate-600 text-xs dark:text-slate-400"
                  }`}
                  style={{ bottom: `${percentage}%` }}
                >
                  {result.probability.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 text-xs flex flex-col items-center">
                <span
                  className={`font-bold ${isMax ? colorObj.text : "text-slate-500"}`}
                >
                  設定{result.setting}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
        {note}
      </div>
    </>
  );
}
