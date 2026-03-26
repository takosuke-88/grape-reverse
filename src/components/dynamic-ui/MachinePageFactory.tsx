import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type {
  MachineConfig,
  EstimationResult,
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

  // モード管理
  const [currentMode, setCurrentMode] = useLocalStorage<"simple" | "detail" | "grape">(
    "grape-reverse-active-tab",
    "simple"
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

  // ユーザー入力State (ぶどう・ベル逆算専用)
  const [grapeInputValues, setGrapeInputValues, removeGrapeInputValues] = useLocalStorage<
    Record<string, number | boolean | string>
  >(`grape-reverse-data-grape-mode-${config.id}`, () => initializeValues());

  // ルーティングで機種が切り替わった時にステートを再初期化する
  useEffect(() => {
    setCalculatedGrapeCount(null);
    setEstimationResults(null);

    // 機種名（または専用に設定されたtitle）をドキュメントタイトルにセット
    if (config.title) {
      document.title = config.title;
    } else {
      const categoryLiteral = currentCategory === "hana" ? "ベル逆算" : currentCategory === "juggler" ? "ぶどう逆算" : "ぶどう/ベル逆算";
      document.title = `${config.name}の攻略・設定判別 ${categoryLiteral}｜GrapeReverse`;
    }
  }, [config.id, config.name, currentCategory]);

  // ブドウ算出結果用
  const [calculatedGrapeCount, setCalculatedGrapeCount] = useState<
    number | null
  >(null);

  const [estimationResults, setEstimationResults] = useState<
    EstimationResult[] | null
  >(null);

  // 現在のモードに応じた入力値を参照 (ブドウ逆算結果を合成)
  const currentInputs = useMemo(() => {
    if (currentMode === "grape") {
      return calculatedGrapeCount !== null
        ? { ...grapeInputValues, "grape-count": calculatedGrapeCount }
        : grapeInputValues;
    }
    return inputValues;
  }, [currentMode, inputValues, grapeInputValues, calculatedGrapeCount]);

  const handleValueChange = (
    elementId: string,
    value: number | boolean | string,
  ) => {
    if (currentMode === "grape") {
      setGrapeInputValues((prev) => ({
        ...prev,
        [elementId]: value,
      }));
      return;
    }

    // 通常モードでのボーナス合計直接入力時の同期処理
    // Total入力時に、その値を維持するようにUnknownを調整する
    if (
      currentMode !== "detail" &&
      (elementId === "big-count" || elementId === "reg-count")
    ) {
      const prefix = elementId === "big-count" ? "big" : "reg";
      const numValue = Number(value);
      const solo = Number(inputValues[`${prefix}-solo-count`]) || 0;
      const cherry = Number(inputValues[`${prefix}-cherry-count`]) || 0;
      // Total - (Solo + Cherry) = Unknown
      // 負の値にならないように0でクリップ (Total < 内訳合計 の矛盾回避)
      const newUnknown = Math.max(0, numValue - (solo + cherry));

      setInputValues((prev) => ({
        ...prev,
        [elementId]: value,
        [`${prefix}-unknown-count`]: newUnknown,
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
    currentMode, // モード切り替え時にも再計算
  ]);


  // 依存値の変更を追跡するためのRef
  const prevDepsRef = useRef({
    totalGames: -1,
    diffCoins: "" as string | number,
    bigCount: -1,
    regCount: -1,
    mode: "",
  });

  useEffect(() => {
    // currentInputsを使用
    const currentTotalGames = Number(currentInputs["total-games"]) || 0;
    const currentDiffCoins = currentInputs["diff-coins"];
    const currentBig = Number(currentInputs["big-count"]) || 0;
    const currentReg = Number(currentInputs["reg-count"]) || 0;

    const prev = prevDepsRef.current;

    // 依存値（総ゲーム数、差枚数、ボーナス、またはモード）が変更されたかチェック
    const isDepChanged =
      currentTotalGames !== prev.totalGames ||
      currentDiffCoins !== prev.diffCoins ||
      currentBig !== prev.bigCount ||
      currentReg !== prev.regCount ||
      currentMode !== prev.mode;

    // 依存値が変更された場合のみ、ブドウ逆算を実行
    if (isDepChanged) {
      // Refを更新
      prevDepsRef.current = {
        totalGames: currentTotalGames,
        diffCoins: currentDiffCoins as string | number,
        bigCount: currentBig,
        regCount: currentReg,
        mode: currentMode,
      };

      // 差枚数からのブドウ逆算ロジック
      const diffCoinsNum = Number(currentDiffCoins);
      const hasDiffCoins = currentDiffCoins !== "" && !isNaN(diffCoinsNum);

      if (
        currentTotalGames > 0 &&
        hasDiffCoins &&
        config.specs?.payouts &&
        config.specs.payouts.grape
      ) {
        // 定数定義
        const PAYOUT = {
          BIG: config.specs.payouts.big,
          REG: config.specs.payouts.reg,
          GRAPE: config.specs.payouts.grape,
          CHERRY: 2,
        };
        const PROB_DENOM = {
          REPLAY: config.specs.reverseCalcProbDenominators?.replay || 7.3,
          CHERRY: config.specs.reverseCalcProbDenominators?.cherry || 36.0,
        };

        const REPLAY_PROB = 1 / PROB_DENOM.REPLAY;
        const CHERRY_PROB = 1 / PROB_DENOM.CHERRY;

        // ユーザー指定の正確な計算式に基づく逆算アルゴリズム
        // 1. 消費枚数 = (総回転数 / 7.33 * 0) + (総回転数 * (1 - 1/7.33) * 3)
        // ※リプレイを除いた回転数に3を乗じる
        const coinIn = currentTotalGames * (1 - REPLAY_PROB) * 3;

        // 2. ボーナス総獲得 = (BIG回数 * BIG_PAYOUT) + (REG回数 * REG_PAYOUT)
        const bonusOut = currentBig * PAYOUT.BIG + currentReg * PAYOUT.REG;

        // 3. チェリー期待枚数 = (総回転数 / 33.0) * 2
        const cherryPayout = currentTotalGames * CHERRY_PROB * PAYOUT.CHERRY;

        // 4. 推定ブドウ獲得枚数 = 差枚数 + 消費枚数 - ボーナス総獲得 - チェリー期待枚数
        // 差枚数(diffCoinsNum)がプラスの場合は客の浮き、マイナスの場合は沈みを示すとする。
        // 出玉の定義: 差枚数 = INとOUTの差分 (通常 差枚 = OUT - IN だが、この式では 獲得 = 差枚 + 消費 という考え方)
        // ここでの消費枚数はすでに「純消費」
        const grapePayout = diffCoinsNum + coinIn - bonusOut - cherryPayout;

        // 5. 推定ブドウ回数 = 推定ブドウ獲得枚数 / GRAPE_PAYOUT
        const calculatedGrapeCount = Math.round(grapePayout / PAYOUT.GRAPE);

        console.log("🍇 ブドウ逆算実行 (Strict Formula):", {
          Trigger: "Dependency Changed",
          Calculated: calculatedGrapeCount,
        });
        setCalculatedGrapeCount(calculatedGrapeCount);
      } else {
        // 条件を満たさない場合は結果をクリア
        setCalculatedGrapeCount(null);
      }
    }
  }, [currentInputs, totalGames, config, currentMode]);

  // 設定推測の自動計算
  useEffect(() => {
    // デバウンス用のタイマー
    const timer = setTimeout(() => {
      // 総ゲーム数が入力されている場合のみ自動計算
      if (totalGames > 0) {
        setError(null);
        console.log("🔄 自動計算開始:", {
          機種: config.name,
          モード: currentMode,
          総ゲーム数: totalGames,
          入力値: currentInputs,
        });
        try {
          // モードに関わらず、表示中の入力値で推定を行う
          const results = calculateEstimation(config, currentInputs);
          console.log(
            "✅ 計算完了:",
            results.map((r) => ({
              設定: r.setting,
              確率: `${r.probability.toFixed(1)}%`,
            })),
          );
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
  }, [currentInputs, totalGames, config, currentMode]);

  const handleReset = () => {
    if (currentMode === "grape") {
      // ぶどう・ベル逆算タブのリセット
      removeGrapeInputValues();
      setCalculatedGrapeCount(null);
    } else {
      // 通常・詳細タブのリセット
      removeInputValues();
      setEstimationResults(null);
      setError(null);
    }
  };

  // 判別要素のみ抽出
  const discriminationElements = useMemo(() => {
    return config.sections.flatMap((section) =>
      section.elements.filter((element) => element.isDiscriminationFactor),
    );
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
      {/* ヘッダー（テーマカラー適用） */}
      <div
        className={`${themeColor} py-6 px-4 text-white shadow-lg transition-colors duration-500`}
        style={{ backgroundColor: brandColor || undefined }} // ブランドカラー適用 (優先)
      >
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium">
              {config.type}
            </span>
            {/* 詳細フラグ判別中の表示を削除 */}
          </div>
          <h1 className="font-bold">
            <span className="block text-2xl sm:text-3xl">{config.name}</span>
            <span className="block mt-2 text-sm sm:text-base font-normal opacity-90">
              {toolLabel}
            </span>
          </h1>
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
              {mode === "grape" &&
                (currentCategory === "hana" ? "ベル逆算" : "ぶどう逆算")}
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

          // ぶどう逆算モード: 差枚数セクション(other-section)の直後にリセットボタンを挿入
          if (currentMode === "grape" && section.id === "other-section") {
            return (
              <React.Fragment key={section.id}>
                <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
                  <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {visibleElements.map((element) => (
                      <DynamicInput
                        key={element.id}
                        element={{
                          ...element,
                          isReadOnly: false,
                        }}
                        value={currentInputs[element.id]}
                        onChange={(value: number | string | boolean) =>
                          handleValueChange(element.id, value)
                        }
                        totalGames={totalGames}
                      />
                    ))}
                  </div>
                </div>
                {/* リセットボタン（差枚数の直下） */}
                <button
                  type="button"
                  onClick={handleReset}
                  className={`w-full rounded-xl ${themeColor} px-6 py-4 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80`}
                  style={{ backgroundColor: brandColor || undefined }}
                >
                  入力を全てリセット
                </button>
              </React.Fragment>
            );
          }

          // ブドウ逆算モードかつ通常時小役セクションの場合、特別な結果カードを表示
          if (currentMode === "grape" && section.id === "normal-role-section") {
            const diffCoins = Number(currentInputs["diff-coins"]);
            const bigCount = Number(currentInputs["big-count"]) || 0;
            const regCount = Number(currentInputs["reg-count"]) || 0;

              // --- 定数定義 (Strict Formula) ---
              const PAYOUT = {
                BIG: config.specs?.payouts?.big || 252,
                REG: config.specs?.payouts?.reg || 96,
                GRAPE: config.specs?.payouts?.grape || 8,
                CHERRY: 2,
              };
              const PROB_DENOM = {
                REPLAY:
                  config.specs?.reverseCalcProbDenominators?.replay || 7.3,
                CHERRY:
                  config.specs?.reverseCalcProbDenominators?.cherry || 36.0,
              };

              const REPLAY_PROB = 1 / PROB_DENOM.REPLAY;
              const CHERRY_PROB = 1 / PROB_DENOM.CHERRY;

              // --- A. チェリー狙い (完全取得) ---
              const CHERRY_ACQUISITION_RATE_A = 1.0;
              const coinInA = totalGames * (1 - REPLAY_PROB) * 3;
              const bonusOutA = bigCount * PAYOUT.BIG + regCount * PAYOUT.REG;
              const cherryPayoutA =
                totalGames *
                CHERRY_PROB *
                PAYOUT.CHERRY *
                CHERRY_ACQUISITION_RATE_A;
              const grapePayoutA =
                diffCoins + coinInA - bonusOutA - cherryPayoutA;
              const grapeCountA = grapePayoutA / PAYOUT.GRAPE;
              const grapeProbA = grapeCountA > 0 ? totalGames / grapeCountA : 0;

              // --- B. フリー打ち (チェリー取得率 約66.7% = 2/3) ---
              // ※チェリーを取りこぼすとその分ぶどう獲得枚数が減ったように計算されるため、見かけ上のぶどう確率が悪くなる方向へ補正される
              const CHERRY_ACQUISITION_RATE_B = 2 / 3;
              const coinInB = totalGames * (1 - REPLAY_PROB) * 3;
              const bonusOutB = bigCount * PAYOUT.BIG + regCount * PAYOUT.REG;
              const cherryPayoutB =
                totalGames *
                CHERRY_PROB *
                PAYOUT.CHERRY *
                CHERRY_ACQUISITION_RATE_B;
              const grapePayoutB =
                diffCoins + coinInB - bonusOutB - cherryPayoutB;
              const grapeCountB = grapePayoutB / PAYOUT.GRAPE;
              const grapeProbB = grapeCountB > 0 ? totalGames / grapeCountB : 0;

              return (
                <div
                  key={section.id}
                  className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
                >
                  <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
                    {currentCategory === "hana"
                      ? "ベル逆算結果"
                      : "ブドウ逆算結果"}
                  </h2>

                  <div className="space-y-3">
                    {/* チェリー狙い */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/20">
                      <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        チェリー狙い
                      </div>
                      <div className="text-center text-2xl font-bold text-slate-800 dark:text-white">
                        {grapeProbA > 0 ? `1/${grapeProbA.toFixed(2)}` : "---"}
                      </div>
                      <div className="mt-1 text-center text-[10px] text-slate-400">
                        推計回数: {Math.round(grapeCountA)}回
                      </div>
                    </div>

                    {/* フリー打ち */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                        フリー打ち
                      </div>
                      <div className="text-center text-2xl font-bold text-slate-800 dark:text-white">
                        {grapeProbB > 0 ? `1/${grapeProbB.toFixed(2)}` : "---"}
                      </div>
                      <div className="mt-1 text-center text-[10px] text-slate-400">
                        推計回数: {Math.round(grapeCountB)}回
                      </div>
                    </div>
                  </div>
                </div>
              );
          }

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
                            isReadOnly: element.isReadOnly
                              ? currentMode === "detail"
                              : false,
                          }}
                          value={currentInputs[element.id]}
                          onChange={(value: number | string | boolean) => handleValueChange(element.id, value)}
                          totalGames={totalGames}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ボーナス合算確率（BIG/REGが含まれるセクションのみ） */}
                {section.elements.some((e) => e.id === "big-count") &&
                  section.elements.some((e) => e.id === "reg-count") &&
                  (() => {
                    const bigCount = Number(currentInputs["big-count"]) || 0;
                    const regCount = Number(currentInputs["reg-count"]) || 0;
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

              {/* ハナハナシリーズの詳細入力タブ限定で、通常時小役の下にリセットボタンを追加 */}
              {currentCategory === "hana" &&
                currentMode === "detail" &&
                section.id === "normal-role-section" && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`w-full rounded-xl ${themeColor} px-6 py-4 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80`}
                    style={{ backgroundColor: brandColor || undefined }}
                  >
                    入力を全てリセット
                  </button>
                )}
            </React.Fragment>
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

          {/* リセットボタン（ぶどう逆算モード以外で表示。ぶどう逆算モードでは差枚数の直下に配置済み） */}
          {currentMode !== "grape" && (
            <button
              type="button"
              onClick={handleReset}
              className={`w-full rounded-xl ${themeColor} px-6 py-4 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80`}
              style={{ backgroundColor: brandColor || undefined }}
            >
              入力を全てリセット
            </button>
          )}
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
              ...(currentMode === "detail"
                ? currentCategory === "hana"
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
                : []),
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

        {/* --- 詳細確率表 (詳細モードかつデータがある場合のみ) --- */}
        {currentMode === "detail" &&
          config.detailedProbabilities?.big_solo &&
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
