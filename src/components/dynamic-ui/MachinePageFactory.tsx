import React, { useState, useMemo } from "react";
import type {
  MachineConfig,
  EstimationResult,
} from "../../types/machine-schema";
import DynamicInput from "./DynamicInput";
import { calculateEstimation } from "../../logic/bayes-estimator";

interface MachinePageFactoryProps {
  config: MachineConfig;
}

const MachinePageFactory: React.FC<MachinePageFactoryProps> = ({ config }) => {
  const [inputValues, setInputValues] = useState<
    Record<string, number | boolean | string>
  >(() => {
    const initialValues: Record<string, number | boolean | string> = {};
    config.sections.forEach((section) => {
      section.elements.forEach((element) => {
        if (element.type === "flag") {
          initialValues[element.id] = false;
        } else if (element.type === "select") {
          initialValues[element.id] = "";
        } else {
          initialValues[element.id] = "";
        }
      });
    });
    return initialValues;
  });

  const [estimationResults, setEstimationResults] = useState<
    EstimationResult[] | null
  >(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleValueChange = (
    elementId: string,
    value: number | boolean | string,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [elementId]: value,
    }));
  };

  const handleCalculate = () => {
    setIsCalculating(true);

    // デバッグ用
    console.log("=== 設定判別実行 ===");
    console.log("入力値:", inputValues);
    console.log("総ゲーム数:", totalGames);

    setTimeout(() => {
      const results = calculateEstimation(config, inputValues);
      console.log("計算結果:", results);
      setEstimationResults(results);
      setIsCalculating(false);
    }, 300);
  };

  const handleReset = () => {
    const resetValues: Record<string, number | boolean | string> = {};
    config.sections.forEach((section) => {
      section.elements.forEach((element) => {
        if (element.type === "flag") {
          resetValues[element.id] = false;
        } else if (element.type === "select") {
          resetValues[element.id] = "";
        } else {
          resetValues[element.id] = "";
        }
      });
    });
    setInputValues(resetValues);
    setEstimationResults(null);
  };

  const themeColor = config.themeColor || "bg-blue-600";
  const totalGames = Number(inputValues["total-games"]) || 0;

  // 判別要素のみ抽出
  const discriminationElements = useMemo(() => {
    const elements: Array<{
      id: string;
      label: string;
      settingValues: { [key: number]: number };
    }> = [];
    config.sections.forEach((section) => {
      section.elements.forEach((element) => {
        if (element.isDiscriminationFactor) {
          elements.push({
            id: element.id,
            label: element.label,
            settingValues: element.settingValues,
          });
        }
      });
    });
    return elements;
  }, [config]);

  // 最有力設定を計算
  const mostLikelySetting = useMemo(() => {
    if (!estimationResults) return null;
    return estimationResults.reduce((max, current) =>
      current.probability > max.probability ? current : max,
    );
  }, [estimationResults]);

  // 高設定確率
  const highSettingProb = useMemo(() => {
    if (!estimationResults) return 0;
    return estimationResults
      .filter((r) => r.setting >= 5)
      .reduce((sum, r) => sum + r.probability, 0);
  }, [estimationResults]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* ヘッダー（テーマカラー適用） */}
      <div className={`${themeColor} py-6 px-4 text-white shadow-lg`}>
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium">
              {config.type}
            </span>
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{config.name}</h1>
          <p className="mt-1 text-sm opacity-90">設定判別ツール</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-4 p-4">
        {/* 入力フォーム */}
        {config.sections.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
          >
            <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.elements.map((element) => (
                <DynamicInput
                  key={element.id}
                  element={element}
                  value={inputValues[element.id]}
                  onChange={(value) => handleValueChange(element.id, value)}
                  totalGames={totalGames}
                />
              ))}
            </div>
          </div>
        ))}

        {/* 計算ボタン（テーマカラー適用） */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating}
            className={`flex-1 rounded-xl ${themeColor} px-6 py-4 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isCalculating ? "計算中..." : "設定判別する"}
          </button>

          {estimationResults && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl bg-slate-200 px-5 py-4 font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              リセット
            </button>
          )}
        </div>

        {/* 結果表示（常時表示） */}
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
          <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
            詳細判別
          </h2>

          {estimationResults ? (
            <>
              {/* データグリッド (2列レイアウト) */}
              {mostLikelySetting && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      最有力設定
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      設定{mostLikelySetting.setting}
                    </div>
                    <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      ({mostLikelySetting.probability.toFixed(1)}%)
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      高設定の可能性
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      {highSettingProb.toFixed(1)}%
                    </div>
                    <div className="text-[11px] font-bold text-red-500 dark:text-red-400">
                      (設定5・6合算)
                    </div>
                  </div>
                </div>
              )}

              {/* グラフ描画エリア（縦棒グラフ） */}
              <div className="flex items-end justify-around gap-1 h-40 border-b border-slate-200 dark:border-slate-700">
                {estimationResults.map((result, index) => {
                  const colors = [
                    "#94a3b8",
                    "#94a3b8",
                    "#94a3b8",
                    "#60a5fa",
                    "#f59e0b",
                    "#ef4444",
                  ];

                  return (
                    <div
                      key={result.setting}
                      className="flex flex-col items-center flex-1"
                    >
                      <div className="relative w-full flex-1 flex items-end justify-center">
                        <div
                          className="w-full rounded-t transition-all duration-700"
                          style={{
                            height: `${Math.max(result.probability, 2)}%`,
                            backgroundColor: colors[index],
                          }}
                        />
                        {result.probability > 10 && (
                          <span className="absolute bottom-1 text-[10px] font-bold text-white">
                            {result.probability.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                        設定{result.setting}
                      </div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">
                        {result.probability.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-slate-400">
                データを入力して「設定判別する」を押してください
              </p>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            ※ベイズの定理による推定値です。試行回数が多いほど精度が向上します。
          </div>
        </div>

        {/* 確率・設定差一覧表（一番下に配置） */}
        {discriminationElements.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                確率・設定差一覧
              </h2>
              {config.specs?.baseGamesPerMedal && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  ベース: {config.specs.baseGamesPerMedal}G / 50枚
                  {config.specs.payoutRatio && (
                    <>
                      {" "}
                      ｜ 機械割: {config.specs.payoutRatio[0].toFixed(1)}～
                      {config.specs.payoutRatio[5].toFixed(1)}%
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      設定
                    </th>
                    {discriminationElements.map((element) => (
                      <th
                        key={element.id}
                        className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
                      >
                        {element.label.replace("回数", "確率")}
                      </th>
                    ))}
                    {config.specs?.payoutRatio && (
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                        機械割
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((setting, idx) => {
                    return (
                      <tr
                        key={setting}
                        className={
                          idx % 2 === 0
                            ? "bg-slate-50 dark:bg-slate-800/50"
                            : "bg-white dark:bg-slate-900"
                        }
                      >
                        <td className="px-2 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                          設定{setting}
                        </td>
                        {discriminationElements.map((element) => {
                          const currentValue =
                            Number(inputValues[element.id]) || 0;
                          const currentProb =
                            totalGames > 0 && currentValue > 0
                              ? totalGames / currentValue
                              : null;
                          const expectedValue = element.settingValues[setting];
                          const isClose =
                            currentProb &&
                            Math.abs(currentProb - expectedValue) <
                              expectedValue * 0.15;

                          // フォーマット処理
                          let formattedValue: string;
                          if (element.label.includes("ベル")) {
                            formattedValue = expectedValue.toFixed(2);
                          } else if (element.label.includes("スイカ")) {
                            formattedValue = expectedValue.toFixed(1);
                          } else {
                            formattedValue =
                              expectedValue % 1 === 0
                                ? expectedValue.toString()
                                : expectedValue.toFixed(1);
                          }

                          return (
                            <td
                              key={element.id}
                              className={`px-2 py-2 text-center text-xs tabular-nums ${
                                isClose
                                  ? "bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              1/{formattedValue}
                            </td>
                          );
                        })}
                        {config.specs?.payoutRatio && (
                          <td className="px-2 py-2 text-center text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            {config.specs.payoutRatio[setting - 1].toFixed(1)}%
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <p className="mb-1">
            Copyright &copy; 2026 GrapeReverse All Rights Reserved.
          </p>
          <p>当サイトのコード・タグ等の無断転載・使用は固く禁じます。</p>
        </div>
      </div>
    </div>
  );
};

export default MachinePageFactory;
