import React from "react";
import type { EstimationResult, UserInputs } from "../../types/machine-schema";

interface EstimationResultDisplayProps {
  results: EstimationResult[];
  inputs?: UserInputs;
  grapeReliability?: number; // 0.0 ~ 1.0
}

// 設定ごとのカラー定義
const SETTING_COLORS = [
  { bg: "bg-slate-400", text: "text-slate-600" }, // 1
  { bg: "bg-slate-400", text: "text-slate-600" }, // 2
  { bg: "bg-slate-400", text: "text-slate-600" }, // 3
  { bg: "bg-blue-500", text: "text-blue-600" }, // 4
  { bg: "bg-amber-500", text: "text-amber-600" }, // 5
  { bg: "bg-rose-600", text: "text-rose-600" }, // 6
];

const EstimationResultDisplay: React.FC<EstimationResultDisplayProps> = ({
  results,
  inputs,
  grapeReliability,
}) => {
  // 最も可能性の高い設定を特定
  const maxResult = results.reduce((max, current) =>
    current.probability > max.probability ? current : max,
  );

  // 高設定（5-6）の合算確率
  const highSettingProb = results
    .filter((r) => r.setting >= 5)
    .reduce((sum, r) => sum + r.probability, 0);

  return (
    <div className="space-y-4">
      {/* サマリーカード（コンパクト化） */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col h-full">
            <div className="text-xs text-slate-500 mb-1">判別結果</div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-3xl font-bold text-slate-800">
                設定{maxResult.setting}
              </div>
            </div>
            <div
              className={`text-xs font-bold mt-1 ${
                maxResult.probability >= 80
                  ? "text-red-600 dark:text-red-400"
                  : maxResult.probability >= 60
                    ? "text-orange-500 dark:text-orange-400"
                    : maxResult.probability >= 40
                      ? "text-yellow-600 dark:text-yellow-400"
                      : maxResult.probability >= 20
                        ? "text-cyan-500 dark:text-cyan-400"
                        : "text-slate-400 dark:text-slate-400"
              }`}
            >
              ({maxResult.probability.toFixed(1)}%)
            </div>
          </div>

          <div className="border-l border-slate-200 flex flex-col h-full">
            <div className="text-[10px] text-slate-500 mb-1 w-full text-center flex items-center justify-center flex-1">
              設定5・6の可能性
            </div>
            <div
              className={`text-2xl font-bold ${
                highSettingProb >= 80
                  ? "text-red-600 dark:text-red-400"
                  : highSettingProb >= 60
                    ? "text-orange-500 dark:text-orange-400"
                    : highSettingProb >= 40
                      ? "text-yellow-600 dark:text-yellow-400"
                      : highSettingProb >= 20
                        ? "text-cyan-500 dark:text-cyan-400"
                        : "text-slate-400 dark:text-slate-400"
              }`}
            >
              {highSettingProb.toFixed(1)}%
            </div>
            <div className="text-xs mt-1 invisible">%</div>{" "}
            {/* 高さを揃えるためのスペーサー */}
          </div>

          <div className="border-l border-slate-200 flex flex-col h-full relative">
            <div className="text-xs text-slate-500 mb-1">信頼度</div>
            <div className="flex-1 flex flex-col justify-center items-center">
              {grapeReliability !== undefined ? (
                <>
                  <div
                    className={`text-2xl font-bold ${
                      grapeReliability >= 0.8
                        ? "text-red-600 dark:text-red-400"
                        : grapeReliability >= 0.6
                          ? "text-orange-500 dark:text-orange-400"
                          : grapeReliability >= 0.4
                            ? "text-yellow-600 dark:text-yellow-400"
                            : grapeReliability >= 0.2
                              ? "text-cyan-500 dark:text-cyan-400"
                              : "text-slate-400 dark:text-slate-400"
                    }`}
                  >
                    {(grapeReliability * 100).toFixed(0)}%
                  </div>
                  {grapeReliability < 0.5 && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-1">
                      (サンプル不足)
                    </div>
                  )}
                </>
              ) : (
                <div className="text-3xl font-bold text-slate-400">-</div>
              )}
            </div>

            {/* サンプル不足がない場合の高さ確保用透明要素 */}
            {grapeReliability !== undefined && grapeReliability >= 0.5 && (
              <div className="text-[10px] invisible leading-none mt-1">
                (サンプル不足)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* トップパネル色 履歴（入力がある場合のみ表示） */}
      {inputs && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-600 mb-3">
            トップパネル色 履歴
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* BIG後 */}
            <div>
              <div className="text-xs text-slate-500 mb-2 border-b border-slate-100 pb-1">
                BIG後トップパネル
              </div>
              <ul className="text-xs space-y-1">
                <li className="flex justify-between">
                  <span>白</span>{" "}
                  <span>{Number(inputs["big-feather-white"]) || 0}回</span>
                </li>
                <li className="flex justify-between">
                  <span>青</span>{" "}
                  <span>{Number(inputs["big-feather-blue"]) || 0}回</span>
                </li>
                <li className="flex justify-between">
                  <span>黄</span>{" "}
                  <span>{Number(inputs["big-feather-yellow"]) || 0}回</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-green-600 font-bold">緑</span>{" "}
                  <span>{Number(inputs["big-feather-green"]) || 0}回</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-red-500 font-bold">赤</span>{" "}
                  <span>{Number(inputs["big-feather-red"]) || 0}回</span>
                </li>
                <li className="flex justify-between">
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text font-bold">
                    虹
                  </span>{" "}
                  <span>{Number(inputs["big-feather-rainbow"]) || 0}回</span>
                </li>
              </ul>
            </div>

            {/* REG後 */}
            <div>
              <div className="text-xs text-slate-500 mb-2 border-b border-slate-100 pb-1">
                REG後トップパネル (設定否定)
              </div>
              <ul className="text-xs space-y-1">
                <li className="flex justify-between items-center text-slate-600 mb-1">
                  <span>青</span>
                  <div className="flex items-center gap-2">
                    <span>{Number(inputs["reg-after-blue"]) || 0}回</span>
                    {(Number(inputs["reg-after-blue"]) || 0) > 0 && (
                      <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px]">
                        設定1否定
                      </span>
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center text-yellow-600 mb-1">
                  <span>黄</span>
                  <div className="flex items-center gap-2">
                    <span>{Number(inputs["reg-after-yellow"]) || 0}回</span>
                    {(Number(inputs["reg-after-yellow"]) || 0) > 0 && (
                      <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px]">
                        1・2否定
                      </span>
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center text-green-600 font-bold mb-1">
                  <span>緑</span>
                  <div className="flex items-center gap-2">
                    <span>{Number(inputs["reg-after-green"]) || 0}回</span>
                    {(Number(inputs["reg-after-green"]) || 0) > 0 && (
                      <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px]">
                        1〜3否定
                      </span>
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center text-red-500 font-bold mb-1">
                  <span>赤</span>
                  <div className="flex items-center gap-2">
                    <span>{Number(inputs["reg-after-red"]) || 0}回</span>
                    {(Number(inputs["reg-after-red"]) || 0) > 0 && (
                      <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px]">
                        1〜4否定
                      </span>
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center font-bold mb-1">
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text">
                    虹
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800">
                      {Number(inputs["reg-after-rainbow"]) || 0}回
                    </span>
                    {(Number(inputs["reg-after-rainbow"]) || 0) > 0 && (
                      <span className="bg-red-100 text-red-600 px-1 py-0.5 rounded text-[10px]">
                        設定6確定
                      </span>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 詳細グラフ */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-600 mb-3">設定別期待度</h3>

        <div className="space-y-2">
          {results.map((result, index) => {
            const isMax = result.setting === maxResult.setting;
            const colors = SETTING_COLORS[index];

            return (
              <div key={result.setting} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${isMax ? colors.text : "text-slate-500"}`}
                    >
                      設定{result.setting}
                    </span>
                    {isMax && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.probability === 100 && result.setting === 6 ? "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white animate-pulse" : "bg-blue-100 text-blue-600"}`}
                      >
                        {result.probability === 100 && result.setting === 6
                          ? "設定6確定演出発生中！"
                          : "最有力"}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold tabular-nums ${isMax ? (result.probability === 100 && result.setting === 6 ? "text-red-500 text-sm" : colors.text) : "text-slate-600"}`}
                  >
                    {result.probability.toFixed(1)}%
                  </span>
                </div>

                <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${result.probability === 100 && result.setting === 6 ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse" : colors.bg}`}
                    style={{
                      width: `${Math.max(result.probability, 2)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 注釈 */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          ※ベイズの定理による推定値です。
        </div>
      </div>
    </div>
  );
};

export default EstimationResultDisplay;
