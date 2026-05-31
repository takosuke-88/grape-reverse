import { useMemo } from "react";
import type {
  EstimationResult,
  MachineConfig,
  UserInputs,
} from "../../types/machine-schema";
import { calculateGrapeWeight } from "../../logic/bayes-estimator";
import { formatBonusText } from "../../utils/formatters";
import EstimationResultDisplay from "../dynamic-ui/EstimationResultDisplay";
import EstimationAiAdvice from "../dynamic-ui/EstimationAiAdvice";

interface GrapeReverseEstimationPanelProps {
  config: MachineConfig;
  inputs: UserInputs;
  estimationResults: EstimationResult[] | null;
  estimationError: string | null;
  totalGames: number;
  currentCategory: string;
  roleLabel: string;
}

export default function GrapeReverseEstimationPanel({
  config,
  inputs,
  estimationResults,
  estimationError,
  totalGames,
  currentCategory,
  roleLabel,
}: GrapeReverseEstimationPanelProps) {
  const discriminationElements = useMemo(
    () =>
      config.sections.flatMap((section) =>
        section.elements.filter((element) => element.isDiscriminationFactor),
      ),
    [config.sections],
  );

  const grapeReliability = useMemo(
    () =>
      calculateGrapeWeight(
        totalGames,
        config.specs?.judgmentWeights?.grapeWeightMap,
      ),
    [totalGames, config],
  );

  const mostLikelySetting = useMemo(() => {
    if (!estimationResults) return null;
    return estimationResults.reduce((max, current) =>
      current.probability > max.probability ? current : max,
    );
  }, [estimationResults]);

  const settings = config.specs?.settings || [1, 2, 3, 4, 5, 6];
  const placeholderResults = settings.map((s) => ({
    setting: s,
    probability: 0,
  }));
  const displayResults = estimationResults || placeholderResults;

  const metricItems = useMemo(() => {
    const findEl = (id: string) =>
      config.sections.flatMap((s) => s.elements).find((e) => e.id === id);

    const base = [
      {
        label: "BIG確率",
        val: (() => {
          const count = Number(inputs["big-count"]) || 0;
          return count > 0 ? totalGames / count : 0;
        })(),
        format: (v: number) => v.toFixed(1),
        settingValues: findEl("big-count")?.settingValues,
      },
      {
        label: "REG確率",
        val: (() => {
          const count = Number(inputs["reg-count"]) || 0;
          return count > 0 ? totalGames / count : 0;
        })(),
        format: (v: number) => v.toFixed(1),
        settingValues: findEl("reg-count")?.settingValues,
      },
    ];

    const categoryExtras =
      currentCategory === "hana"
        ? [
            {
              label: "BIG中スイカ",
              val: (() => {
                const bCount = Number(inputs["big-count"]) || 0;
                const count = Number(inputs["big-suika-count"]) || 0;
                return bCount > 0 && count > 0 ? (bCount * 24) / count : 0;
              })(),
              format: (v: number) => v.toFixed(1),
              settingValues: config.detailedProbabilities?.big_suika_raw
                ? {
                    1: config.detailedProbabilities.big_suika_raw[0],
                    2: config.detailedProbabilities.big_suika_raw[1],
                    3: config.detailedProbabilities.big_suika_raw[2],
                    4: config.detailedProbabilities.big_suika_raw[3],
                    5: config.detailedProbabilities.big_suika_raw[4],
                    6: config.detailedProbabilities.big_suika_raw[5],
                  }
                : undefined,
            },
            {
              label: "合算フェザー",
              val: (() => {
                const bCount = Number(inputs["big-count"]) || 0;
                const count = Number(inputs["feather-lamp-count"]) || 0;
                return bCount > 0 && count > 0 ? bCount / count : 0;
              })(),
              format: (v: number) => v.toFixed(1),
              settingValues: config.detailedProbabilities?.feather_lamp_raw
                ? {
                    1: config.detailedProbabilities.feather_lamp_raw[0],
                    2: config.detailedProbabilities.feather_lamp_raw[1],
                    3: config.detailedProbabilities.feather_lamp_raw[2],
                    4: config.detailedProbabilities.feather_lamp_raw[3],
                    5: config.detailedProbabilities.feather_lamp_raw[4],
                    6: config.detailedProbabilities.feather_lamp_raw[5],
                  }
                : undefined,
            },
          ]
        : [
            {
              label: "単独REG",
              val: (() => {
                const count = Number(inputs["reg-solo-count"]) || 0;
                return count > 0 ? totalGames / count : 0;
              })(),
              format: (v: number) => v.toFixed(1),
              settingValues: findEl("reg-solo-count")?.settingValues,
            },
            {
              label: "チェリーREG",
              val: (() => {
                const count = Number(inputs["reg-cherry-count"]) || 0;
                return count > 0 ? totalGames / count : 0;
              })(),
              format: (v: number) => v.toFixed(1),
              settingValues: findEl("reg-cherry-count")?.settingValues,
            },
          ];

    const grapeKey = currentCategory === "hana" ? "bell-count" : "grape-count";
    const grapeLabel = currentCategory === "hana" ? "ベル確率" : "ブドウ確率";

    return [
      ...base,
      ...categoryExtras,
      {
        label: "合算確率",
        val: (() => {
          const big = Number(inputs["big-count"]) || 0;
          const reg = Number(inputs["reg-count"]) || 0;
          const total = big + reg;
          return total > 0 ? totalGames / total : 0;
        })(),
        format: (v: number) => v.toFixed(1),
        settingValues: (() => {
          const bigEl = findEl("big-count");
          const regEl = findEl("reg-count");
          if (bigEl?.settingValues && regEl?.settingValues) {
            const combined: Record<number, number> = {};
            settings.forEach((s) => {
              if (bigEl.settingValues![s] && regEl.settingValues![s]) {
                const bigProb = 1 / bigEl.settingValues![s];
                const regProb = 1 / regEl.settingValues![s];
                combined[s] = 1 / (bigProb + regProb);
              }
            });
            return combined;
          }
          return findEl("bonus-combined")?.settingValues;
        })(),
      },
      {
        label: grapeLabel,
        val: (() => {
          const count = Number(inputs[grapeKey]) || 0;
          return count > 0 ? totalGames / count : 0;
        })(),
        format: (v: number) => v.toFixed(2),
        settingValues: findEl(grapeKey)?.settingValues,
      },
    ];
  }, [config, inputs, totalGames, currentCategory, settings]);

  if (discriminationElements.length === 0) return null;

  return (
    <>
      <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
        ※本画面の判別結果は、差枚数から逆算した「推定{roleLabel}回数」に基づくシミュレーション値です。実際の実測値とは異なる場合があります。
      </p>

      <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
        <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
          詳細判別
        </h2>

        {estimationError && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {estimationError}
          </div>
        )}

        <div className="mt-4">
          <EstimationResultDisplay
            results={displayResults}
            inputs={inputs}
            grapeReliability={grapeReliability}
            config={config}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 mt-4">
          {metricItems.map((item, idx) => {
            let approxSetting: number | null = null;
            if (item.val > 0 && item.settingValues) {
              let minDiff = Infinity;
              settings.forEach((setting) => {
                const settingVal = (
                  item.settingValues as Record<number, number>
                )[setting];
                if (settingVal) {
                  const diff = Math.abs(item.val - settingVal);
                  if (diff < minDiff) {
                    minDiff = diff;
                    approxSetting = setting;
                  }
                }
              });
            }

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBonusText(item.label)}
                </div>
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  {item.val > 0 ? `1/${item.format(item.val)}` : "---"}
                </div>
                {approxSetting && (
                  <div
                    className={`text-xs font-bold ${
                      approxSetting >= 5
                        ? "text-red-500 dark:text-red-400"
                        : "text-blue-500 dark:text-blue-400"
                    }`}
                  >
                    {config.id === "aimex" &&
                    item.settingValues![approxSetting] === 255.0
                      ? "(設定5・6近似)"
                      : `(設定${config.specs?.settingLabels?.[approxSetting] || approxSetting}近似)`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <h3 className="mb-4 text-center text-lg font-bold text-slate-700 dark:text-slate-200">
          設定別期待度
        </h3>

        <EstimationAiAdvice
          config={config}
          totalGames={totalGames}
          currentCategory={currentCategory}
          estimationResults={estimationResults}
        />

        <div className="flex items-end justify-around gap-2 h-48 border-b border-slate-200 pb-1 dark:border-slate-700 mt-6">
          {displayResults.map((result, index, arr) => {
            const colors = [
              { bg: "bg-slate-400", text: "text-slate-600" },
              { bg: "bg-slate-400", text: "text-slate-600" },
              { bg: "bg-slate-400", text: "text-slate-600" },
              { bg: "bg-blue-500", text: "text-blue-600" },
              { bg: "bg-amber-500", text: "text-amber-600" },
              { bg: "bg-rose-600", text: "text-rose-600" },
            ];
            const colorObj = colors[index] || colors[0];
            const maxResult = arr.reduce((max, current) =>
              current.probability > max.probability ? current : max,
            );
            const isMax =
              result.setting === maxResult.setting && result.probability > 0;
            const percentage = Math.max(result.probability, 1);

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
                          ? "設定6確定！"
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
                    style={{ height: `${percentage}%` }}
                  />
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
          ※ベイズ推定による確率分布
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            確率・設定差一覧
          </h2>
          {config.specs?.baseGamesPerMedal && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              ベース: {config.specs.baseGamesPerMedal}G / 50枚
              {config.specs.payoutRatio && (
                <>
                  {" "}
                  ｜ 機械割: {config.specs.payoutRatio[0].toFixed(1)}～
                  {config.specs.payoutRatio[config.specs.payoutRatio.length - 1].toFixed(1)}
                  %
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
                {discriminationElements
                  .filter((e) => e.visibility !== "detail")
                  .flatMap((element) => {
                    const headers = [
                      <th
                        key={element.id}
                        className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
                      >
                        {formatBonusText(element.label.replace("回数", "確率"))}
                      </th>,
                    ];
                    if (element.id === "reg-count") {
                      headers.push(
                        <th
                          key="bonus-combined"
                          className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                          合成確率
                        </th>,
                      );
                    }
                    return headers;
                  })}
                {config.specs?.payoutRatio && (
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    機械割
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {settings.map((setting, idx) => (
                <tr
                  key={setting}
                  className={
                    idx % 2 === 0
                      ? "bg-slate-50 dark:bg-slate-800/50"
                      : "bg-white dark:bg-slate-900"
                  }
                >
                  <td className="px-2 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    {config.specs?.settingLabels?.[setting] || setting}
                  </td>
                  {discriminationElements
                    .filter((e) => e.visibility !== "detail")
                    .flatMap((element) => {
                      const cells = [];
                      let currentValue = Number(inputs[element.id]) || 0;
                      if (
                        element.id === "bonus-combined" ||
                        element.label.includes("合成") ||
                        element.label.includes("合算")
                      ) {
                        const big = Number(inputs["big-count"]) || 0;
                        const reg = Number(inputs["reg-count"]) || 0;
                        currentValue = big + reg;
                      }
                      const currentProb =
                        totalGames > 0 && currentValue > 0
                          ? totalGames / currentValue
                          : null;
                      const expectedValue = element.settingValues[setting];

                      let isClosest = false;
                      if (currentProb !== null && expectedValue) {
                        let minDiff = Infinity;
                        let closestSetting = -1;
                        settings.forEach((s) => {
                          const val = element.settingValues[s];
                          if (val) {
                            const diff = Math.abs(currentProb - val);
                            if (diff < minDiff) {
                              minDiff = diff;
                              closestSetting = s;
                            }
                          }
                        });
                        if (closestSetting === setting) isClosest = true;
                      }

                      let formattedValue: string;
                      if (!expectedValue) {
                        formattedValue = "---";
                      } else if (
                        element.label.includes("ベル") ||
                        element.label.includes("ブドウ")
                      ) {
                        formattedValue = "1/" + expectedValue.toFixed(2);
                      } else {
                        formattedValue = "1/" + expectedValue.toFixed(1);
                      }

                      cells.push(
                        <td
                          key={element.id}
                          className={`px-2 py-2 text-center text-xs tabular-nums ${
                            isClosest
                              ? "bg-red-100 font-extrabold text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {formattedValue}
                        </td>,
                      );

                      if (element.id === "reg-count") {
                        const bigEl = discriminationElements.find(
                          (e) => e.id === "big-count",
                        );
                        const bigProb = bigEl?.settingValues[setting] || 0;
                        const regProb = element.settingValues[setting] || 0;
                        let combinedExpected = 0;
                        if (bigProb > 0 && regProb > 0) {
                          combinedExpected = 1 / (1 / bigProb + 1 / regProb);
                        }
                        const formattedCombined = combinedExpected.toFixed(1);
                        const bigCount = Number(inputs["big-count"]) || 0;
                        const regCount = Number(inputs["reg-count"]) || 0;
                        const totalCount = bigCount + regCount;
                        const combinedProb =
                          totalGames > 0 && totalCount > 0
                            ? totalGames / totalCount
                            : null;

                        let isCombinedClosest = false;
                        if (combinedProb !== null && bigEl) {
                          let minDiff = Infinity;
                          let closestSetting = -1;
                          settings.forEach((s) => {
                            const bP = bigEl.settingValues[s];
                            const rP = element.settingValues[s];
                            if (bP && rP) {
                              const cE = 1 / (1 / bP + 1 / rP);
                              const diff = Math.abs(combinedProb - cE);
                              if (diff < minDiff) {
                                minDiff = diff;
                                closestSetting = s;
                              }
                            }
                          });
                          if (closestSetting === setting) isCombinedClosest = true;
                        }

                        cells.push(
                          <td
                            key="bonus-combined"
                            className={`px-2 py-2 text-center text-xs tabular-nums ${
                              isCombinedClosest
                                ? "bg-red-100 font-extrabold text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            1/{formattedCombined}
                          </td>,
                        );
                      }

                      return cells;
                    })}
                  {config.specs?.payoutRatio &&
                    config.specs.payoutRatio[idx] !== undefined && (
                      <td
                        className={`px-2 py-2 text-center text-xs tabular-nums ${
                          mostLikelySetting?.setting === setting
                            ? "bg-red-100 font-extrabold text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {config.specs.payoutRatio[idx].toFixed(1)}%
                      </td>
                    )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
