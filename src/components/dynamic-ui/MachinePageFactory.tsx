import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  MachineConfig,
  EstimationResult,
  DiscriminationElement,
} from "../../types/machine-schema";
import {
  calculateEstimation,
  calculateGrapeWeight,
} from "../../logic/bayes-estimator";
import { AVAILABLE_MACHINES } from "../../data/machine-list";
import { ATTACHED_COLUMNS } from "../../data/column-list";
import { formatBonusText } from "../../utils/formatters";
import EstimationResultDisplay from "./EstimationResultDisplay";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import DynamicInput from "./DynamicInput";

interface MachinePageFactoryProps {
  config: MachineConfig;
}

const MachinePageFactory: React.FC<MachinePageFactoryProps> = ({ config }) => {
  const navigate = useNavigate();

  // バイブレーションON/OFF
  const [vibrationEnabled, setVibrationEnabled] = useLocalStorage<boolean>(
    "grape-reverse-vibration",
    true
  );

  // 現在の機種のカテゴリを取得
  // 現在の機種のカテゴリとカラーを取得
  const currentMachineInfo = useMemo(() => {
    return AVAILABLE_MACHINES.find((m) => m.id === config.id);
  }, [config.id]);

  const currentCategory = currentMachineInfo?.category || "juggler";
  const brandColor = currentMachineInfo?.color; // ブランドカラー
  const toolNameSuffix = currentCategory === "hana" ? "ベル逆算ツール" : "ぶどう逆算ツール";
  const toolLabel = `設定判別・${toolNameSuffix}`;

  // 初期化ロジックを関数化
  const initializeValues = () => {
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
  };

  // ユーザー入力State (通常・詳細)
  const [inputValues, setInputValues, removeInputValues] = useLocalStorage<
    Record<string, number | boolean | string>
  >(`grape-reverse-data-${config.id}`, () => initializeValues());

  // ルーティングで機種が切り替わった時にステートを再初期化する
  useEffect(() => {
    setEstimationResults(null);

    // 機種名（または専用に設定されたtitle）をドキュメントタイトルにセット
    if (config.title) {
      document.title = config.title;
    } else {
      const categoryLiteral = currentCategory === "hana" ? "ベル逆算" : currentCategory === "juggler" ? "ぶどう逆算" : "ぶどう/ベル逆算";
      document.title = `${config.name}の攻略・設定判別 ${categoryLiteral}｜GrapeReverse`;
    }
  }, [config.id, config.name, currentCategory]);

  const [estimationResults, setEstimationResults] = useState<
    EstimationResult[] | null
  >(null);

  const currentInputs = inputValues;

  const handleValueChange = (
    elementId: string,
    value: number | boolean | string,
  ) => {
    // ボーナス合計直接入力時の同期処理:
    // Total - (Solo + Cherry) の差分を「契機不明」要素に自動反映する
    if (elementId === "big-count" || elementId === "reg-count") {
      const prefix = elementId === "big-count" ? "big" : "reg";
      const numValue = Number(value);
      const solo = Number(inputValues[`${prefix}-solo-count`]) || 0;
      const cherry = Number(inputValues[`${prefix}-cherry-count`]) || 0;
      const newUnknown = Math.max(0, numValue - (solo + cherry));

      // 機種定義から「契機不明」要素IDを動的に探索する
      const unknownElement = config.sections
        .flatMap((s) => s.elements)
        .find((e) => e.id.startsWith(prefix) && e.id.includes("unknown"));
      const unknownId = unknownElement?.id ?? `${prefix}-unknown-count`;

      setInputValues((prev) => ({
        ...prev,
        [elementId]: value,
        [unknownId]: newUnknown,
      }));
      return;
    }

    setInputValues((prev) => ({
      ...prev,
      [elementId]: value,
    }));
  };

  /* エラー状態の管理を追加 */
  const [error, setError] = useState<string | null>(null);

  const themeColor = config.themeColor || "bg-blue-600";
  const totalGames = Number(currentInputs["total-games"]) || 0;

  /* 自動計算: 入力値が変更されたら自動的に計算を実行 */
  // ボーナス内訳の自動合算 (Total = Solo + Cherry + Unknown)
  useEffect(() => {
    const calculateTotal = (prefix: "big" | "reg") => {
      const solo = Number(currentInputs[`${prefix}-solo-count`]) || 0;
      const cherry = Number(currentInputs[`${prefix}-cherry-count`]) || 0;
      const unknown = Number(currentInputs[`${prefix}-unknown-count`]) || 0;
      return solo + cherry + unknown;
    };

    const newBigTotal = calculateTotal("big");
    const newRegTotal = calculateTotal("reg");

    const currentBigTotal = Number(currentInputs["big-count"]) || 0;
    const currentRegTotal = Number(currentInputs["reg-count"]) || 0;

    // 差分がある場合のみ更新 (無限ループ防止)
    if (newBigTotal !== currentBigTotal) {
      handleValueChange("big-count", newBigTotal);
    }
    if (newRegTotal !== currentRegTotal) {
      handleValueChange("reg-count", newRegTotal);
    }
  }, [
    currentInputs["big-solo-count"],
    currentInputs["big-cherry-count"],
    currentInputs["big-unknown-count"],
    currentInputs["reg-solo-count"],
    currentInputs["reg-cherry-count"],
    currentInputs["reg-unknown-count"],
  ]);


  // 設定推測の自動計算
  useEffect(() => {
    // デバウンス用のタイマー
    const timer = setTimeout(() => {
      // 総ゲーム数が入力されている場合のみ自動計算
      if (totalGames > 0) {
        setError(null);
        try {
          // モードに関わらず、表示中の入力値で推定を行う
          const results = calculateEstimation(config, currentInputs);
          setEstimationResults(results);
        } catch (err) {
          console.error("❌ 自動計算エラー:", err);
          setError("計算中にエラーが発生しました。入力値を確認してください。");
          setEstimationResults(null);
        }
      } else {
        // 総ゲーム数が0の場合は結果をクリア
        setEstimationResults(null);
      }
    }, 500); // 500ms のデバウンス

    return () => clearTimeout(timer);
  }, [currentInputs, totalGames, config]);

  const handleReset = () => {
    if (!window.confirm("これまでのカウントデータを全てリセットしますか？")) return;
    removeInputValues();
    setEstimationResults(null);
    setError(null);
  };

  // 判別要素のみ抽出
  const discriminationElements = useMemo(() => {
    return config.sections.flatMap((section) =>
      section.elements.filter((element) => element.isDiscriminationFactor),
    );
  }, [config.sections]);

  // 角チェリーのバーチャル要素定義
  const CHERRY_ELEMENT: DiscriminationElement = {
    id: "cherry-count",
    label: "角チェリー",
    type: "counter",
    settingValues: {},
    isDiscriminationFactor: false,
  };

  // 通常小役セクションをボーナスセクションより前に移動した表示順を生成
  // さらに、normal-role-section に cherry-count がなければ grape-count の前に注入する
  const orderedSections = useMemo(() => {
    const sections = config.sections.map((section) => {
      if (section.id !== "normal-role-section") return section;
      if (section.elements.some((e) => e.id === "cherry-count")) return section;

      const grapeIdx = section.elements.findIndex((e) => e.id === "grape-count");
      const newElements = [...section.elements];
      newElements.splice(grapeIdx >= 0 ? grapeIdx : 0, 0, CHERRY_ELEMENT);
      return { ...section, layout: "grid" as const, elements: newElements };
    });

    const normalIdx = sections.findIndex((s) => s.id === "normal-role-section");
    const bonusIdx = sections.findIndex((s) => s.id === "bonus-section");
    if (normalIdx !== -1 && bonusIdx !== -1 && normalIdx > bonusIdx) {
      const [normalSection] = sections.splice(normalIdx, 1);
      const newBonusIdx = sections.findIndex((s) => s.id === "bonus-section");
      sections.splice(newBonusIdx, 0, normalSection);
    }
    return sections;
  }, [config.sections]);

  // ブドウ信頼度の計算
  const grapeReliability = useMemo(() => {
    return calculateGrapeWeight(
      totalGames,
      config.specs?.judgmentWeights?.grapeWeightMap,
    );
  }, [totalGames, config]);

  // 最有力設定を計算
  const mostLikelySetting = useMemo(() => {
    if (!estimationResults) return null;
    return estimationResults.reduce((max, current) =>
      current.probability > max.probability ? current : max,
    );
  }, [estimationResults]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* 2行スティッキーヘッダー（タイトルバー＋ナビゲーションバー） */}
      <div className="sticky top-0 z-50">
        {/* タイトルバー（テーマカラー適用） */}
        <div
          className={`${themeColor} py-3 px-4 text-white shadow-lg transition-colors duration-500`}
          style={{ backgroundColor: brandColor || undefined }}
        >
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium shrink-0">
                {config.type}
              </span>
              <h1 className="font-bold min-w-0">
                <span className="block text-lg sm:text-xl font-extrabold leading-tight truncate">{config.name}</span>
                <span className="block text-xs font-normal opacity-80 truncate">{toolLabel}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* 機種選択ナビゲーション */}
        <div className="bg-slate-100/95 backdrop-blur-sm py-3 px-4 shadow-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="mx-auto max-w-md space-y-2">
          {/* 機種選択 + バイブトグル + リセット */}
          <div className="flex items-center gap-2">
            <select
              value={config.id}
              onChange={(e) => {
                const machineId = e.target.value;
                if (machineId) navigate(`/${machineId}`);
              }}
              className="flex-1 text-center font-bold text-base py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            >
              {AVAILABLE_MACHINES.filter((m) => m.category === currentCategory).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {/* リセットピルボタン */}
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 flex items-center gap-1 rounded-full bg-red-950/60 border border-red-800/50 px-2.5 py-1.5 text-xs font-bold text-red-200 shadow-sm transition-opacity hover:opacity-75 active:opacity-60"
              title="データを全てリセット"
            >
              💀 リセット
            </button>
            <button
              type="button"
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-lg shadow-sm transition-all ${
                vibrationEnabled
                  ? "bg-green-500 text-white"
                  : "bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              }`}
              title={vibrationEnabled ? "バイブON（タップでOFF）" : "バイブOFF（タップでON）"}
            >
              📳
            </button>
          </div>
          {/* ナビゲーションボタン */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg bg-slate-700 dark:bg-slate-600 text-white py-2 text-xs font-bold transition-opacity hover:opacity-90 active:opacity-80"
              onClick={() => navigate(`/${config.id}/bonus`)}
            >
              🎰 ボーナス入力へ
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${config.id}/grape`)}
              className="flex-1 rounded-lg bg-emerald-700 text-white py-2 text-xs font-bold transition-opacity hover:opacity-90 active:opacity-80"
            >
              {currentCategory === "hana" ? "🔔 ベル逆算へ" : "🍇 ぶどう逆算へ"}
            </button>
          </div>
        </div>
        </div>{/* end nav bar */}
      </div>{/* end sticky wrapper */}

      <div className="mx-auto w-full max-w-md space-y-4 p-4">
        {/* 入力フォーム */}
        {orderedSections.map((section) => {
          // 通常・詳細を統合して全カウンター要素を表示（grape-calc は逆算ページへ分離済み）
          const visibleElements = section.elements.filter((element) => {
            const visibility = element.visibility || "always";
            return (
              visibility === "always" ||
              visibility === "simple" ||
              visibility === "detail"
            );
          });

          if (visibleElements.length === 0) return null;

          return (
            <React.Fragment key={section.id}>
              <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
                <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
                  {section.title}
                </h2>

                <div
                  className={
                    section.layout === "grid" && visibleElements.length > 1
                      ? "grid grid-cols-2 gap-4"
                      : "space-y-4"
                  }
                >
                  {visibleElements.map((element) => (
                    <div
                      key={element.id}
                      className={
                        element.colSpan === 2
                          ? "col-span-2 grid grid-cols-2 gap-4"
                          : ""
                      }
                    >
                      <div className={element.colSpan === 2 ? "col-start-1" : ""}>
                        <DynamicInput
                          element={{
                            ...element,
                            // BIG/REG回数は直接入力可能にする（詳細内訳と自動同期）
                            isReadOnly:
                              element.id === "big-count" || element.id === "reg-count"
                                ? false
                                : !!element.isReadOnly,
                          }}
                          value={currentInputs[element.id]}
                          onChange={(value: number | string | boolean) => handleValueChange(element.id, value)}
                          totalGames={totalGames}
                          vibrationEnabled={vibrationEnabled}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </React.Fragment>
          );
        })}

        {/* 自動計算の説明 */}
        <div className="flex flex-col gap-2">
          {error && (
            <div className="mb-2 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 数値を入力すると自動で判別結果が更新されます
            </p>
          </div>
        </div>

        {/* 結果表示（常時表示） */}
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
          <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
            詳細判別
          </h2>

          {/* 設定別期待度の詳細表示 */}
          <div className="mt-4">
            <EstimationResultDisplay
              results={
                estimationResults ||
                (config.specs?.settings || [1, 2, 3, 4, 5, 6]).map((s) => ({
                  setting: s,
                  probability: 0,
                }))
              }
              inputs={currentInputs}
              grapeReliability={grapeReliability}
              config={config}
            />
          </div>

          {/* 4大指標 (現在確率) */}
          <div className="mb-4 grid grid-cols-2 gap-2 mt-4">
            {[
              {
                label: "BIG確率",
                val: (() => {
                  const count = Number(currentInputs["big-count"]) || 0;
                  return count > 0 ? totalGames / count : 0;
                })(),
                format: (v: number) => v.toFixed(1),
                settingValues: (() => {
                  const el = config.sections
                    .flatMap((s) => s.elements)
                    .find((e) => e.id === "big-count");
                  return el?.settingValues;
                })(),
              },
              {
                label: "REG確率",
                val: (() => {
                  const count = Number(currentInputs["reg-count"]) || 0;
                  return count > 0 ? totalGames / count : 0;
                })(),
                format: (v: number) => v.toFixed(1),
                settingValues: (() => {
                  const el = config.sections
                    .flatMap((s) => s.elements)
                    .find((e) => e.id === "reg-count");
                  return el?.settingValues;
                })(),
              },
              ...(currentCategory === "hana"
                ? [
                    {
                      label: "BIG中スイカ",
                        val: (() => {
                          const bCount =
                            Number(currentInputs["big-count"]) || 0;
                          const count =
                            Number(currentInputs["big-suika-count"]) || 0;
                          return bCount > 0 && count > 0
                            ? (bCount * 24) / count
                            : 0;
                        })(),
                        format: (v: number) => v.toFixed(1),
                        settingValues: (() => {
                          if (config.detailedProbabilities?.big_suika_raw) {
                            const raw =
                              config.detailedProbabilities.big_suika_raw;
                            return {
                              1: raw[0],
                              2: raw[1],
                              3: raw[2],
                              4: raw[3],
                              5: raw[4],
                              6: raw[5],
                            };
                          }
                          return undefined;
                        })(),
                      },
                      {
                        label: "合算フェザー",
                        val: (() => {
                          const bCount =
                            Number(currentInputs["big-count"]) || 0;
                          const count =
                            Number(currentInputs["feather-lamp-count"]) || 0;
                          return bCount > 0 && count > 0 ? bCount / count : 0;
                        })(),
                        format: (v: number) => v.toFixed(1),
                        settingValues: (() => {
                          if (config.detailedProbabilities?.feather_lamp_raw) {
                            const raw =
                              config.detailedProbabilities.feather_lamp_raw;
                            return {
                              1: raw[0],
                              2: raw[1],
                              3: raw[2],
                              4: raw[3],
                              5: raw[4],
                              6: raw[5],
                            };
                          }
                          return undefined;
                        })(),
                      },
                    ]
                  : [
                      {
                        label: "単独REG",
                        val: (() => {
                          const count =
                            Number(currentInputs["reg-solo-count"]) || 0;
                          return count > 0 ? totalGames / count : 0;
                        })(),
                        format: (v: number) => v.toFixed(1),
                        settingValues: (() => {
                          const el = config.sections
                            .flatMap((s) => s.elements)
                            .find((e) => e.id === "reg-solo-count");
                          return el?.settingValues;
                        })(),
                      },
                      {
                        label: "チェリーREG",
                        val: (() => {
                          const count =
                            Number(currentInputs["reg-cherry-count"]) || 0;
                          return count > 0 ? totalGames / count : 0;
                        })(),
                        format: (v: number) => v.toFixed(1),
                        settingValues: (() => {
                          const el = config.sections
                            .flatMap((s) => s.elements)
                            .find((e) => e.id === "reg-cherry-count");
                          return el?.settingValues;
                        })(),
                      },
                    ]
              ),
              {
                label: "合算確率",
                val: (() => {
                  const big = Number(currentInputs["big-count"]) || 0;
                  const reg = Number(currentInputs["reg-count"]) || 0;
                  const total = big + reg;
                  return total > 0 ? totalGames / total : 0;
                })(),
                format: (v: number) => v.toFixed(1),
                settingValues: (() => {
                  const bigEl = config.sections
                    .flatMap((s) => s.elements)
                    .find((e) => e.id === "big-count");
                  const regEl = config.sections
                    .flatMap((s) => s.elements)
                    .find((e) => e.id === "reg-count");

                  // BIG・REG両方の確率設定があれば、合算確率を計算して返す
                  if (bigEl?.settingValues && regEl?.settingValues) {
                    const combined: Record<number, number> = {};
                    const settings = config.specs?.settings || [
                      1, 2, 3, 4, 5, 6,
                    ];
                    settings.forEach((s) => {
                      if (bigEl.settingValues![s] && regEl.settingValues![s]) {
                        const bigProb = 1 / bigEl.settingValues![s];
                        const regProb = 1 / regEl.settingValues![s];
                        combined[s] = 1 / (bigProb + regProb);
                      }
                    });
                    return combined;
                  }

                  // 事前定義要素があればそちらをフォールバックとして使う
                  const combinedEl = config.sections
                    .flatMap((s) => s.elements)
                    .find((e) => e.id === "bonus-combined");
                  return combinedEl?.settingValues;
                })(),
              },
              {
                label: currentCategory === "hana" ? "ベル確率" : "ブドウ確率",
                val: (() => {
                  const countId =
                    currentCategory === "hana" ? "bell-count" : "grape-count";
                  const count = Number(currentInputs[countId]) || 0;
                  return count > 0 ? totalGames / count : 0;
                })(),
                format: (v: number) => v.toFixed(2),
                settingValues: (() => {
                  const countId =
                    currentCategory === "hana" ? "bell-count" : "grape-count";
                  const el = config.sections
                    .flatMap((s) => s.elements)
                    .find((e) => e.id === countId);
                  return el?.settingValues;
                })(),
              },
            ].map((item, idx) => {
              let approxSetting: number | null = null;
              if (item.val > 0 && item.settingValues) {
                let minDiff = Infinity;
                const settings = config.specs?.settings || [1, 2, 3, 4, 5, 6];
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

          {/* 設定別期待度見出しとAIアドバイス */}
          <h3 className="mb-4 text-center text-lg font-bold text-slate-700 dark:text-slate-200">
            設定別期待度
          </h3>

          {(() => {
            // 高設定（設定5・6）の合算確率を計算
            const highSettingProb = (estimationResults || [])
              .filter((r) => r.setting >= 5)
              .reduce((sum, r) => sum + r.probability, 0);

            // ランク判定とスタイルの定義
            let rankStyle = "";
            let rankIcon = "🤖";

            if (highSettingProb >= 70) {
              // Rank S: 超・高設定圏内
              rankStyle =
                "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20";
              rankIcon = "👑";
            } else if (highSettingProb >= 50) {
              // Rank A: 高設定の期待大
              rankStyle =
                "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
              rankIcon = "🔥";
            } else if (highSettingProb >= 30) {
              // Rank B: 判断保留・様子見
              rankStyle =
                "border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10";
              rankIcon = "🤔";
            } else {
              // Rank C: 低設定の疑い
              rankStyle =
                "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50";
              rankIcon = "⚠️";
            }

            return (
              <div
                className={`mb-4 rounded-lg border p-4 transition-colors duration-300 ${rankStyle}`}
              >
                <div className="mb-2 flex items-center gap-2 border-b border-black/5 pb-2 dark:border-white/5">
                  <span className="text-xl">{rankIcon}</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    AI判定アドバイス ({totalGames}G時点)
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {config.id.includes("siosai") ||
                  config.id === "last-utopia" ? (
                    // ハイハイシオサイ・ラストユートピア専用アドバイスロジック
                    <>
                      {totalGames <= 2000 && (
                        <>
                          序盤戦です。この機種は
                          <span className="font-bold underline decoration-indigo-400 decoration-2">
                            ボーナス合算確率の維持
                          </span>
                          が最重要になります。
                          {highSettingProb >= 50 &&
                            "現在の合算は非常に優秀です。このペースを維持できるか注目しましょう。"}
                          {highSettingProb < 30 &&
                            "ボーナスが重い立ち上がりです。合算が回復しない場合は深追い禁物です。"}
                        </>
                      )}
                      {totalGames > 2000 && totalGames <= 4000 && (
                        <>
                          中盤戦に差し掛かりました。
                          {highSettingProb >= 50
                            ? "ボーナス合算がしっかり引けており、高設定の期待が持てる展開です。引き続き数値を注視しましょう。"
                            : "合算確率が落ちてきています。周囲の状況等も踏まえ、設定の見切り時を探る必要があります。"}
                        </>
                      )}
                      {totalGames > 4000 && (
                        <>
                          終盤戦です。サンプルは十分に集まりました。
                          {highSettingProb >= 70 && (
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              圧巻のボーナス合算です。間違いなく高設定挙動ですので、閉店まで回し切りましょう！
                            </span>
                          )}
                          {highSettingProb >= 50 && highSettingProb < 70 && (
                            <span className="font-bold text-red-600 dark:text-red-400">
                              合算確率は良好な水準をキープしています。設定5・6の可能性を意識して続行を推奨します。
                            </span>
                          )}
                          {highSettingProb >= 30 && highSettingProb < 50 && (
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                              中間設定寄りの数値です。悪くはないですが、これ以上の伸び悩みが見えたら撤退も視野に。
                            </span>
                          )}
                          {highSettingProb < 30 && (
                            <span className="font-bold text-slate-500">
                              ボーナス合算が設定1以下の数値です。これ以上の投資は危険が高いと言えます。
                            </span>
                          )}
                        </>
                      )}
                    </>
                  ) : currentCategory === "hana" ? (
                    // ハナハナ専用アドバイスロジック
                    <>
                      {totalGames <= 1500 && (
                        <>
                          序盤戦です。ボーナス合算よりも
                          <span className="font-bold underline decoration-indigo-400 decoration-2">
                            BIG中のスイカ出現率や、REGサイドランプの色（奇遇判別）
                          </span>
                          の偏りを重視して設定の上下を見極めましょう。
                          {highSettingProb >= 50 &&
                            "現状の滑り出しはとても良好です。"}
                          {highSettingProb < 30 &&
                            "ボーナスが引けていても中身が伴っていない可能性があります、要注意。"}
                        </>
                      )}
                      {totalGames > 1500 && totalGames <= 3000 && (
                        <>
                          中盤戦に差し掛かりました。
                          <span className="font-bold">
                            ベル逆算値とボーナス合算
                          </span>
                          のバランスが重要になります。
                          {highSettingProb >= 50
                            ? "数値は設定4以上、あるいは高設定の塊を十分狙える挙動を示しています。"
                            : "設定4の妥協点を探るか、周囲の台の状況（塊や法則性）も加味して続行を判断してください。"}
                        </>
                      )}
                      {totalGames > 3000 && (
                        <>
                          終盤戦です。サンプルは十分に集まりました。
                          {highSettingProb >= 70 && (
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              サイドランプ・スイカ共に文句なし。閉店までブン回すべきお宝台です！
                            </span>
                          )}
                          {highSettingProb >= 50 && highSettingProb < 70 && (
                            <span className="font-bold text-red-600 dark:text-red-400">
                              挙動は良好。特にREGサイドランプの偶数偏りが強いなら、設定4・6を意識して続行しましょう。虹・赤フェザー等の確定演出にも期待。
                            </span>
                          )}
                          {highSettingProb >= 30 && highSettingProb < 50 && (
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                              まだサンプル不足、または中間設定寄りの数値です。ベル確率がついてくるまでは、周囲の状況も確認しつつ慎重に。
                            </span>
                          )}
                          {highSettingProb < 30 && (
                            <span className="font-bold text-slate-500">
                              厳しい数値です。確定演出（虹フェザー等）が出ていない限り、早めの撤退も視野に。
                            </span>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    // ジャグラーおよびその他のアドバイスロジック（従来通りだがランクで色付け）
                    <>
                      {totalGames <= 3000 && (
                        <>
                          回転数がまだ浅いため、ブレ幅の大きいブドウ・BIG確率の影響度を抑えています。
                          <span className="font-bold underline decoration-indigo-400 decoration-2">
                            現時点ではREG確率を軸に
                          </span>
                          様子を見ましょう。
                        </>
                      )}
                      {totalGames > 3000 && totalGames <= 6000 && (
                        <>
                          折り返し地点です。
                          <span className="font-bold">
                            REG確率が安定している場合
                          </span>
                          、高設定の期待が高まります。ブドウ確率の信頼度も徐々に上がってきました。
                        </>
                      )}
                      {totalGames > 6000 && (
                        <>
                          十分なサンプルが集まりました。
                          {highSettingProb >= 70 ? (
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              REG・ブドウ確率を含めた総合的なデータから、自信を持って高設定と言えます！
                            </span>
                          ) : (
                            <span className="font-bold">
                              REG・ブドウ確率を含めた総合的なデータ
                            </span>
                          )}
                          から、最終的な設定を推測します。
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            );
          })()}

          {/* グラフ描画エリア（縦棒グラフ） - h-48に拡大して視認性向上 */}
          <div className="flex items-end justify-around gap-2 h-48 border-b border-slate-200 pb-1 dark:border-slate-700 mt-6">
            {(
              estimationResults ||
              (config.specs?.settings || [1, 2, 3, 4, 5, 6]).map((s) => ({
                setting: s,
                probability: 0,
              }))
            ).map((result, index, arr) => {
              const colors = [
                { bg: "bg-slate-400", text: "text-slate-600" }, // 1
                { bg: "bg-slate-400", text: "text-slate-600" }, // 2
                { bg: "bg-slate-400", text: "text-slate-600" }, // 3
                { bg: "bg-blue-500", text: "text-blue-600" }, // 4
                { bg: "bg-amber-500", text: "text-amber-600" }, // 5
                { bg: "bg-rose-600", text: "text-rose-600" }, // 6
              ];
              const colorObj = colors[index] || colors[0];
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
            ※ベイズ推定による確率分布
          </div>
        </div>

        {/* 確率・設定差一覧表（一番下に配置） */}
        {discriminationElements.length > 0 && (
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
                      {config.specs.payoutRatio[
                        config.specs.payoutRatio.length - 1
                      ].toFixed(1)}
                      %
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              {/* 詳細項目を除外して表示 */}
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
                  {(config.specs?.settings || [1, 2, 3, 4, 5, 6]).map(
                    (setting, idx) => {
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
                            {config.specs?.settingLabels?.[setting] || setting}
                          </td>
                          {discriminationElements
                            .filter((e) => e.visibility !== "detail")
                            .flatMap((element) => {
                              const cells = [];

                              let currentValue =
                                Number(currentInputs[element.id]) || 0;

                              // 合成確率計算のための特例処理 (既存ロジック維持)
                              if (
                                element.id === "bonus-combined" ||
                                element.label.includes("合成") ||
                                element.label.includes("合算")
                              ) {
                                const big =
                                  Number(currentInputs["big-count"]) || 0;
                                const reg =
                                  Number(currentInputs["reg-count"]) || 0;
                                currentValue = big + reg;
                              }

                              const currentProb =
                                totalGames > 0 && currentValue > 0
                                  ? totalGames / currentValue
                                  : null;
                              const expectedValue =
                                element.settingValues[setting];

                              // 最も近い設定を判定するロジック
                              let isClosest = false;
                              if (currentProb !== null && expectedValue) {
                                let minDiff = Infinity;
                                let closestSetting = -1;

                                (
                                  config.specs?.settings || [1, 2, 3, 4, 5, 6]
                                ).forEach((s) => {
                                  const val = element.settingValues[s];
                                  if (val) {
                                    const diff = Math.abs(currentProb - val);
                                    if (diff < minDiff) {
                                      minDiff = diff;
                                      closestSetting = s;
                                    }
                                  }
                                });

                                if (closestSetting === setting) {
                                  isClosest = true;
                                }
                              }

                              // フォーマット処理
                              let formattedValue: string;
                              if (!expectedValue) {
                                formattedValue = "---";
                              } else if (
                                element.label.includes("ベル") ||
                                element.label.includes("ブドウ")
                              ) {
                                formattedValue =
                                  "1/" + expectedValue.toFixed(2);
                              } else {
                                // ボーナスやスイカなどは小数点第1位まで (整数でも.0をつける)
                                formattedValue =
                                  "1/" + expectedValue.toFixed(1);
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

                              // 合成確率セルの追加
                              if (element.id === "reg-count") {
                                const bigEl = discriminationElements.find(
                                  (e) => e.id === "big-count",
                                );
                                const bigProb =
                                  bigEl?.settingValues[setting] || 0;
                                const regProb =
                                  element.settingValues[setting] || 0;

                                let combinedExpected = 0;
                                if (bigProb > 0 && regProb > 0) {
                                  combinedExpected =
                                    1 / (1 / bigProb + 1 / regProb);
                                }
                                // フォーマットは小数点第1位
                                const formattedCombined =
                                  combinedExpected.toFixed(1);

                                const bigCount =
                                  Number(currentInputs["big-count"]) || 0;
                                const regCount =
                                  Number(currentInputs["reg-count"]) || 0;
                                const totalCount = bigCount + regCount;
                                const combinedProb =
                                  totalGames > 0 && totalCount > 0
                                    ? totalGames / totalCount
                                    : null;

                                let isCombinedClosest = false;
                                if (combinedProb !== null && bigEl) {
                                  let minDiff = Infinity;
                                  let closestSetting = -1;

                                  (
                                    config.specs?.settings || [1, 2, 3, 4, 5, 6]
                                  ).forEach((s) => {
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

                                  if (closestSetting === setting) {
                                    isCombinedClosest = true;
                                  }
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
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* リセットボタン（ページ最下部・破壊的操作の隔離） */}
        <div className="mt-2 mb-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-xl bg-slate-600 dark:bg-slate-700 border border-slate-500 dark:border-slate-600 px-6 py-4 text-base font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
          >
            🗑️ 入力を全てリセット
          </button>
        </div>

        {/* SEOコンテンツ・独自解説テキスト */}
        {config.seoContent && config.seoContent.length > 0 && (
          <div className="mt-8 mb-12 space-y-12 px-2">
            {config.seoContent.map((section, idx) => (
              <section key={idx} className="space-y-6">
                <h2
                  className="text-xl font-bold text-slate-800 dark:text-white border-l-4 pl-4 py-1"
                  style={{ borderLeftColor: brandColor || undefined }}
                >
                  {section.title}
                </h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {section.paragraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      dangerouslySetInnerHTML={{ __html: para }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* --- 詳細確率表 (データがある場合のみ) --- */}
        {config.detailedProbabilities?.big_solo &&
          config.detailedProbabilities?.big_cherry &&
          config.detailedProbabilities?.reg_solo &&
          config.detailedProbabilities?.reg_cherry && (
            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
              <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
                単独・重複ボーナス確率一覧
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                        設定
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-red-500 dark:text-red-400">
                        単独BIG
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-red-500 dark:text-red-400">
                        チェリーBIG
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-blue-500 dark:text-blue-400">
                        単独REG
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-blue-500 dark:text-blue-400">
                        チェリーREG
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const setting = index + 1;
                      const probs = config.detailedProbabilities!;
                      return (
                        <tr key={setting}>
                          <td className="px-2 py-2 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                            {setting}
                          </td>
                          <td className="px-2 py-2 text-center text-xs text-slate-600 dark:text-slate-400">
                            1/{probs.big_solo![index].toFixed(1)}
                          </td>
                          <td className="px-2 py-2 text-center text-xs text-slate-600 dark:text-slate-400">
                            1/{probs.big_cherry![index].toFixed(1)}
                          </td>
                          <td className="px-2 py-2 text-center text-xs text-slate-600 dark:text-slate-400">
                            1/{probs.reg_solo![index].toFixed(1)}
                          </td>
                          <td className="px-2 py-2 text-center text-xs text-slate-600 dark:text-slate-400">
                            1/{probs.reg_cherry![index].toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* この機種に関連する攻略・検証記事 */}
        {(() => {
          // 現在の機種カテゴリ・IDに合致するタグを持つ記事を優先取得
          const currentMachineInfo = AVAILABLE_MACHINES.find(
            (m) => m.id === config.id,
          );
          const currentCategory = currentMachineInfo?.category || "other";

          const sortedColumns = [...ATTACHED_COLUMNS].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          // STEP 1: 機種に関連するコラム
          const specificRelated = sortedColumns
            .filter(
              (col) =>
                col.tags.includes(config.id) ||
                col.tags.includes(currentCategory),
            )
            .slice(0, 3);

          // STEP 2: サイト全体の最新コラム (STEP 1と重複しないもの)
          const siteWideLatest = sortedColumns
            .filter((col) => !specificRelated.find((r) => r.id === col.id))
            .slice(0, 3);

          if (specificRelated.length === 0 && siteWideLatest.length === 0)
            return null;

          return (
            <div className="mt-8 space-y-8">
              {/* セクション1: 機種特化コラム (存在する場合のみ) */}
              {specificRelated.length > 0 && (
                <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
                  <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-indigo-500">📚</span>{" "}
                    この機種の攻略コラム
                  </h2>
                  <div className="flex flex-col gap-4">
                    {specificRelated.map((col) => (
                      <ColumnCard key={col.id} col={col} />
                    ))}
                  </div>
                </div>
              )}

              {/* セクション2: サイト全体の最新コラム */}
              {siteWideLatest.length > 0 && (
                <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
                  <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-indigo-500">✨</span>{" "}
                    最新のパチスロ・業界コラム
                  </h2>
                  <div className="flex flex-col gap-4">
                    {siteWideLatest.map((col) => (
                      <ColumnCard key={col.id} col={col} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// 共通カードコンポーネント
const ColumnCard = ({ col }: { col: (typeof ATTACHED_COLUMNS)[0] }) => (
  <a
    href={col.path}
    className="block p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.01] hover:border-indigo-400 group"
  >
    <div className="flex gap-2 mb-2">
      {col.tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full"
        >
          #{tag}
        </span>
      ))}
    </div>
    <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {col.title}
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
      {col.description}
    </p>
  </a>
);

export default MachinePageFactory;
