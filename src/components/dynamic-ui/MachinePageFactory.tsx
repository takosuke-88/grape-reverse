import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  MachineConfig,
  EstimationResult,
} from "../../types/machine-schema";
import DynamicInput from "./DynamicInput";
import { calculateEstimation } from "../../logic/bayes-estimator";
import { AVAILABLE_MACHINES } from "../../data/machine-list";

interface MachinePageFactoryProps {
  config: MachineConfig;
}

const MachinePageFactory: React.FC<MachinePageFactoryProps> = ({ config }) => {
  const navigate = useNavigate();

  // 現在の機種のカテゴリを取得
  const currentCategory = useMemo(() => {
    const current = AVAILABLE_MACHINES.find((m) => m.id === config.id);
    return current ? current.category : "juggler";
  }, [config.id]);

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

  const handleValueChange = (
    elementId: string,
    value: number | boolean | string,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [elementId]: value,
    }));
  };

  /* エラー状態の管理を追加 */
  const [error, setError] = useState<string | null>(null);

  const themeColor = config.themeColor || "bg-blue-600";
  const totalGames = Number(inputValues["total-games"]) || 0;

  /* 自動計算: 入力値が変更されたら自動的に計算を実行 */
  useEffect(() => {
    // デバウンス用のタイマー
    const timer = setTimeout(() => {
      // 総ゲーム数が入力されている場合のみ自動計算
      if (totalGames > 0) {
        setError(null);
        console.log("🔄 自動計算開始:", {
          機種: config.name,
          総ゲーム数: totalGames,
          入力値: inputValues,
        });
        try {
          const results = calculateEstimation(config, inputValues);
          console.log(
            "✅ 計算完了:",
            results.map((r) => ({
              設定: r.setting,
              確率: `${r.probability.toFixed(1)}%`,
            })),
          );
          const mostLikely = results.reduce((max, current) =>
            current.probability > max.probability ? current : max,
          );
          console.log(
            `📊 最有力設定: 設定${mostLikely.setting} (${mostLikely.probability.toFixed(1)}%)`,
          );
          setEstimationResults(results);
        } catch (err) {
          console.error("❌ 自動計算エラー:", err);
          setError("計算中にエラーが発生しました。入力値を確認してください。");
          setEstimationResults(null);
        }
      } else {
        console.log("⏸️ 総ゲーム数が0のため計算をスキップ");
        // 総ゲーム数が0の場合は結果をクリア
        setEstimationResults(null);
      }
    }, 500); // 500ms のデバウンス

    return () => clearTimeout(timer);
  }, [inputValues, totalGames, config]);

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
    setError(null);
  };

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

  // currentMode State
  const [currentMode, setCurrentMode] = useState<"simple" | "detail" | "grape">(
    "simple",
  );

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

      {/* 機種選択ナビゲーション（カテゴリ一致のみ表示） */}
      <div className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-sm py-3 px-4 shadow-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="mx-auto max-w-md text-center">
          <label className="block text-xs font-bold text-slate-500 mb-1 dark:text-slate-400">
            ▼ 機種選択
          </label>
          <select
            value={config.id}
            onChange={(e) => {
              const machineId = e.target.value;
              if (machineId) {
                navigate(`/v2/preview/${machineId}`);
              }
            }}
            className="w-full text-center font-bold text-lg py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          >
            {AVAILABLE_MACHINES.filter(
              (m) => m.category === currentCategory,
            ).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-4 p-4">
        {/* 入力モード切り替えタブ */}
        <div className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
          {(["simple", "detail", "grape"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCurrentMode(mode)}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                currentMode === mode
                  ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {mode === "simple" && "通常入力"}
              {mode === "detail" && "詳細入力"}
              {mode === "grape" && "ぶどう逆算"}
            </button>
          ))}
        </div>

        {/* 入力フォーム */}
        {config.sections.map((section) => {
          // 現在のモードに基づいて表示すべき要素をフィルタリング
          const visibleElements = section.elements.filter((element) => {
            const visibility = element.visibility || "always";

            if (currentMode === "simple") {
              return visibility === "always" || visibility === "simple";
            }
            if (currentMode === "detail") {
              return (
                visibility === "always" ||
                visibility === "simple" ||
                visibility === "detail"
              );
            }
            if (currentMode === "grape") {
              return visibility === "always" || visibility === "grape-calc";
            }
            return true;
          });

          if (visibleElements.length === 0) return null;

          return (
            <div
              key={section.id}
              className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
            >
              <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
                {section.title}
              </h2>

              <div className="space-y-4">
                {visibleElements.map((element) => (
                  <DynamicInput
                    key={element.id}
                    element={element}
                    value={inputValues[element.id]}
                    onChange={(value) => handleValueChange(element.id, value)}
                    totalGames={totalGames}
                  />
                ))}
              </div>

              {/* ボーナス合算確率（BIG/REGが含まれるセクションのみ） */}
              {section.elements.some((e) => e.id === "big-count") &&
                section.elements.some((e) => e.id === "reg-count") &&
                (() => {
                  const bigCount = Number(inputValues["big-count"]) || 0;
                  const regCount = Number(inputValues["reg-count"]) || 0;
                  const bonusTotal = bigCount + regCount;
                  const prob =
                    totalGames > 0 && bonusTotal > 0
                      ? (totalGames / bonusTotal).toFixed(1)
                      : "---";

                  return (
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                        ボーナス合成確率
                      </span>
                      <span className="text-xl font-bold text-slate-800 dark:text-white">
                        1/{prob}
                      </span>
                    </div>
                  );
                })()}
            </div>
          );
        })}

        {/* 自動計算の説明とリセットボタン */}
        <div className="flex flex-col gap-2">
          {error && (
            <div className="mb-2 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* 自動計算の説明 */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 数値を入力すると自動で判別結果が更新されます
            </p>
          </div>

          {/* リセットボタン（常時表示） */}
          <button
            type="button"
            onClick={handleReset}
            className={`w-full rounded-xl ${themeColor} px-6 py-4 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80`}
          >
            入力を全てリセット
          </button>
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

              {/* グラフ描画エリア（縦棒グラフ） - h-48に拡大して視認性向上 */}
              <div className="flex items-end justify-around gap-2 h-48 border-b border-slate-200 pb-1 dark:border-slate-700">
                {estimationResults.map((result, index) => {
                  const colors = [
                    "#94a3b8", // 設定1: グレー
                    "#94a3b8", // 設定2
                    "#94a3b8", // 設定3
                    "#60a5fa", // 設定4: 青
                    "#f59e0b", // 設定5: 黄
                    "#ef4444", // 設定6: 赤
                  ];
                  const barColor = colors[index] || "#94a3b8";
                  const percentage = Math.max(result.probability, 1); // 最小1%確保

                  return (
                    <div
                      key={result.setting}
                      className="flex flex-col items-center flex-1 h-full justify-end group"
                    >
                      <div className="relative w-full flex-1 flex items-end justify-center px-1">
                        <div
                          className="w-full rounded-t-sm transition-all duration-700 hover:opacity-80"
                          style={{
                            height: `${percentage}%`,
                            backgroundColor: barColor,
                          }}
                        >
                          {/* ツールチップ的な数値表示（バーの上） */}
                          {result.probability > 5 && (
                            <span className="block text-center text-[10px] font-bold text-white pt-1">
                              {result.probability.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {result.setting}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {result.probability < 1
                          ? "<1"
                          : result.probability.toFixed(0)}
                        %
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-400 text-center">
                データを入力して
                <br />
                「設定判別する」を押してください
              </p>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
            ※ベイズ推定による確率分布
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
                        className={`px-2 py-2 text-center text-xs font-medium ${
                          element.label.includes("合成") ||
                          element.label.includes("合算")
                            ? "text-slate-800 dark:text-slate-200 font-bold"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
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
                          let currentValue =
                            Number(inputValues[element.id]) || 0;

                          // 合成確率計算のための特例処理
                          if (
                            element.id === "bonus-combined" ||
                            element.label.includes("合成") ||
                            element.label.includes("合算")
                          ) {
                            const big = Number(inputValues["big-count"]) || 0;
                            const reg = Number(inputValues["reg-count"]) || 0;
                            currentValue = big + reg;
                          }

                          const currentProb =
                            totalGames > 0 && currentValue > 0
                              ? totalGames / currentValue
                              : null;
                          const expectedValue = element.settingValues[setting];

                          // 最も近い設定を判定するロジック
                          let isClosest = false;
                          if (currentProb !== null) {
                            // 全設定との差分を計算し、最小の差分を持つ設定を探す
                            let minDiff = Infinity;
                            let closestSetting = -1;

                            [1, 2, 3, 4, 5, 6].forEach((s) => {
                              const val = element.settingValues[s];
                              const diff = Math.abs(currentProb - val);
                              if (diff < minDiff) {
                                minDiff = diff;
                                closestSetting = s;
                              }
                            });

                            if (closestSetting === setting) {
                              isClosest = true;
                            }
                          }

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
                                isClosest
                                  ? "bg-red-100 font-extrabold text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800"
                                  : element.label.includes("合成") ||
                                      element.label.includes("合算")
                                    ? "text-slate-900 dark:text-slate-100 font-bold bg-slate-100/50 dark:bg-slate-800/50"
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
