import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import Seo from "../components/Seo";
import { hanaHoohConfig } from "../data/machines/hana-hooh";
import { funkyJuggler2Config } from "../data/machines/funky-juggler-2";
import { myJuggler5Config } from "../data/machines/juggler-my5";
import { imJugglerExConfig } from "../data/machines/juggler-im-ex";
import { gogoJuggler3Config } from "../data/machines/juggler-gogo3";
import { girlsSsConfig } from "../data/machines/juggler-girls-ss";
import { mrJugglerConfig } from "../data/machines/juggler-mr";
import { miracleJugglerConfig } from "../data/machines/juggler-miracle";
import { happyV3Config } from "../data/machines/juggler-happy-v3";
import { kingHanahanaConfig } from "../data/machines/king-hanahana";
import { dragonSenkoConfig } from "../data/machines/dragon-senko";
import { starHanahanaConfig } from "../data/machines/star-hanahana";
import { newHanahanaGoldConfig } from "../data/machines/new-hanahana-gold";
import { newKingVConfig } from "../data/machines/new-king-v";
import { lastUtopiaConfig } from "../data/machines/last-utopia";
import { haihaiSiosai2Config } from "../data/machines/haihai-siosai2";
import { haihaiSiosaiConfig } from "../data/machines/haihai-siosai";
import type { DiscriminationElement, EstimationResult, MachineConfig, UserInputs } from "../types/machine-schema";
import { calculateMultinomialEstimation } from "../logic/bayes-estimator";
import GrapeReverseEstimationPanel from "../components/grape/GrapeReverseEstimationPanel";
import DynamicInput from "../components/dynamic-ui/DynamicInput";

/** 機種Config未登録時の逆算フォールバック（マイジャグラーV基準） */
const REVERSE_CALC_FALLBACK = {
  big: 240,
  reg: 96,
  grape: 8,
  cherry: 2,
  replayDenom: 7.3,
  cherryDenom: 35.6,
  /** フリー打ち時チェリー取得率（旧逆算ページ a6e0409 の 2/3 想定） */
  cherryFreePlayRate: 2 / 3,
  replayPayout: 3,
};

type ReverseCalcPayouts = NonNullable<MachineConfig["specs"]>["payouts"];

/** ぶどう/ベル払出: grape → bell → カテゴリ既定 */
function resolveRolePayout(
  payouts: ReverseCalcPayouts | undefined,
  isHana: boolean,
): number {
  return (
    payouts?.grape ??
    payouts?.bell ??
    (isHana ? 10 : REVERSE_CALC_FALLBACK.grape)
  );
}

/** チェリー払出: config → カテゴリ既定（ハナ4 / ジャグラー2） */
function resolveCherryPayout(
  payouts: ReverseCalcPayouts | undefined,
  isHana: boolean,
): number {
  return payouts?.cherry ?? (isHana ? 4 : REVERSE_CALC_FALLBACK.cherry);
}

type ReverseCalcDenoms = NonNullable<MachineConfig["specs"]>["reverseCalcProbDenominators"];

/** フリー打ち時チェリー取得率（0〜1）。未指定時は 2/3 */
function resolveCherryFreePlayRate(denoms: ReverseCalcDenoms | undefined): number {
  const rate = denoms?.cherryFreePlayRate ?? REVERSE_CALC_FALLBACK.cherryFreePlayRate;
  return Math.min(1, Math.max(0, rate));
}

type GrapeReverseModeResult = {
  prob: number;
  count: number;
};

type GrapeReverseCalcResult = {
  cherryAim: GrapeReverseModeResult | null;
  freePlay: GrapeReverseModeResult | null;
};

function computeGrapeModeResult(
  grapeOut: number,
  grapePayout: number,
  totalGames: number,
): GrapeReverseModeResult | null {
  const grapeCount = grapeOut / grapePayout;
  if (grapeCount <= 0) return null;
  return {
    prob: totalGames / grapeCount,
    count: Math.round(grapeCount),
  };
}

const CONFIG_MAP: Record<string, MachineConfig> = {
  "hana-hooh": hanaHoohConfig,
  funky2: funkyJuggler2Config,
  myjuggler5: myJuggler5Config,
  aimex: imJugglerExConfig,
  gogo3: gogoJuggler3Config,
  girlsss: girlsSsConfig,
  mr: mrJugglerConfig,
  miracle: miracleJugglerConfig,
  happyv3: happyV3Config,
  "king-hanahana": kingHanahanaConfig,
  "dragon-senko": dragonSenkoConfig,
  "star-hanahana": starHanahanaConfig,
  "new-king-v": newKingVConfig,
  "new-hanahana-gold": newHanahanaGoldConfig,
  "last-utopia": lastUtopiaConfig,
  "haihai-siosai2": haihaiSiosai2Config,
  "haihai-siosai": haihaiSiosaiConfig,
};

// 各カウンター要素定義（DynamicInput に直接渡す）
const ELEM_TOTAL_GAMES: DiscriminationElement = {
  id: "total-games", label: "総ゲーム数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};
const ELEM_DIFF_COINS: DiscriminationElement = {
  id: "diff-coins", label: "差枚数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};
const ELEM_BIG: DiscriminationElement = {
  id: "big-count", label: "BIG回数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};
const ELEM_REG: DiscriminationElement = {
  id: "reg-count", label: "REG回数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};

// ─────────────────────────────────────────────
// GrapeReversePage 本体
// ─────────────────────────────────────────────
export default function GrapeReversePage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();

  const config = machineId ? CONFIG_MAP[machineId] : null;
  const machineInfo = AVAILABLE_MACHINES.find((m) => m.id === machineId);
  const brandColor = machineInfo?.color ?? "#334155";
  const machineName = machineInfo?.name ?? machineId ?? "機種不明";
  const isHana = machineInfo?.category === "hana";
  const currentCategory = machineInfo?.category ?? "juggler";
  const roleLabel = isHana ? "ベル" : "ぶどう";
  const roleIcon = isHana ? "🔔" : "🍇";

  const [vibrationEnabled, setVibrationEnabled] = useLocalStorage<boolean>("grape-reverse-vibration", true);
  const [estimationResults, setEstimationResults] = useState<EstimationResult[] | null>(null);
  const [estimationError, setEstimationError] = useState<string | null>(null);

  const [grapeData, setGrapeData] = useLocalStorage<Record<string, number>>(
    `grape-reverse-data-grape-mode-${machineId}`,
    {}
  );

  const totalGames = Math.max(0, grapeData["total-games"] ?? 0);
  const bigCount   = Math.max(0, grapeData["big-count"]   ?? 0);
  const regCount   = Math.max(0, grapeData["reg-count"]   ?? 0);
  const diffCoins  = Math.max(0, grapeData["diff-coins"]  ?? 0);

  const update = (key: string, v: number) =>
    setGrapeData((prev) => ({ ...prev, [key]: v }));

  const handleReset = () => {
    if (!window.confirm(`${roleLabel}逆算の入力を全てリセットしますか？`)) return;
    setGrapeData({});
  };

  // ─── 逆算計算（チェリー狙い / フリー打ち） ───
  // リプレイは打ち方に依存しない → 両モードで同一補正。
  // 差分はフリー打ち時のチェリー取りこぼし（取得率）のみ。
  const calcResult = useMemo((): GrapeReverseCalcResult | null => {
    if (totalGames === 0) return null;

    const payouts = config?.specs?.payouts;
    const denoms = config?.specs?.reverseCalcProbDenominators;
    const BIG_PAYOUT = payouts?.big ?? REVERSE_CALC_FALLBACK.big;
    const REG_PAYOUT = payouts?.reg ?? REVERSE_CALC_FALLBACK.reg;
    const ROLE_PAYOUT = resolveRolePayout(payouts, isHana);
    const CHERRY_PAYOUT = resolveCherryPayout(payouts, isHana);
    const REPLAY_DENOM = denoms?.replay ?? REVERSE_CALC_FALLBACK.replayDenom;
    const CHERRY_DENOM =
      denoms?.cherry ?? (isHana ? 36.0 : REVERSE_CALC_FALLBACK.cherryDenom);
    const CHERRY_FREE_PLAY_RATE = resolveCherryFreePlayRate(denoms);

    const coinIn = totalGames * 3;
    // 差枚 = 払出 − 投入（+なら勝ち）→ 総払出 = 総投入 + 差枚
    const payout = coinIn + diffCoins;
    const bonusOut = bigCount * BIG_PAYOUT + regCount * REG_PAYOUT;

    const replayCorrection =
      (totalGames / REPLAY_DENOM) * REVERSE_CALC_FALLBACK.replayPayout;
    const cherryCorrectionAim = (totalGames / CHERRY_DENOM) * CHERRY_PAYOUT;
    const cherryCorrectionFree =
      cherryCorrectionAim * CHERRY_FREE_PLAY_RATE;

    const roleOutBase = payout - bonusOut - replayCorrection;

    const cherryAim = computeGrapeModeResult(
      roleOutBase - cherryCorrectionAim,
      ROLE_PAYOUT,
      totalGames,
    );
    const freePlay = computeGrapeModeResult(
      roleOutBase - cherryCorrectionFree,
      ROLE_PAYOUT,
      totalGames,
    );

    if (!cherryAim && !freePlay) return null;
    return { cherryAim, freePlay };
  }, [totalGames, bigCount, regCount, diffCoins, config, isHana]);

  const cherryAimResult = calcResult?.cherryAim ?? null;

  const estimationInputs = useMemo((): UserInputs | null => {
    if (!cherryAimResult || cherryAimResult.count <= 0 || totalGames <= 0) return null;
    const grapeKey = isHana ? "bell-count" : "grape-count";
    return {
      "total-games": totalGames,
      "big-count": bigCount,
      "reg-count": regCount,
      [grapeKey]: cherryAimResult.count,
    };
  }, [cherryAimResult, totalGames, bigCount, regCount, isHana]);

  useEffect(() => {
    if (!config || !estimationInputs) {
      setEstimationResults(null);
      setEstimationError(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        setEstimationError(null);
        const results = calculateMultinomialEstimation(config, estimationInputs);
        setEstimationResults(results);
      } catch (err) {
        console.error("❌ ぶどう逆算・設定推定エラー:", err);
        setEstimationError("計算中にエラーが発生しました。入力値を確認してください。");
        setEstimationResults(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [config, estimationInputs]);

  // ゲーム数バーに表示する BIG+REG 合算確率
  const bonusTotal = bigCount + regCount;
  const bonusProbText = bonusTotal > 0 && totalGames > 0
    ? `1/${(totalGames / bonusTotal).toFixed(1)}`
    : undefined;

  return (
    <>
      <Seo
        pageTitle={`${machineName} ${roleLabel}逆算｜GrapeReverse`}
        pageDescription={`${machineName}の${roleLabel}確率を差枚数とボーナス回数から逆算。設定判別に直結するリアルタイム計算ツール。`}
        pagePath={`/${machineId}/grape`}
      />

      <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 dark:bg-slate-950">

        {/* タイトルバー（スクロールアウト） ─ MachinePageFactoryと同一 */}
        <div
          className="py-3 px-4 text-white shadow-lg"
          style={{ backgroundColor: brandColor }}
        >
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium shrink-0">
                {config?.type ?? "A-type"}
              </span>
              <h1 className="font-bold min-w-0">
                <span className="block text-lg sm:text-xl font-extrabold leading-tight truncate">{machineName}</span>
                <span className="block text-xs font-normal opacity-80 truncate">{roleLabel}逆算ツール</span>
              </h1>
            </div>
          </div>
        </div>

        {/* 2行 Sticky Header ─ MachinePageFactoryと完全同一 */}
        <div className="sticky top-0 z-50 bg-slate-100/95 backdrop-blur-sm py-3 px-4 shadow-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
          <div className="mx-auto max-w-md space-y-2">

            {/* Row 1: 機種名 + リセット + バイブ */}
            <div className="flex items-center gap-2">
              <select
                value={machineId ?? ""}
                onChange={(e) => { if (e.target.value) navigate(`/${e.target.value}/grape`); }}
                className="flex-1 text-center font-bold text-base py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              >
                {AVAILABLE_MACHINES.filter((m) => m.category === (machineInfo?.category ?? "juggler")).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-80 active:opacity-60"
                title="データを全てリセット"
              >
                🗑️ リセット
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !vibrationEnabled;
                  setVibrationEnabled(next);
                  if (next && navigator.vibrate) navigator.vibrate(40);
                }}
                className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 mr-1 text-xs font-semibold shadow-md transition-all ${
                  vibrationEnabled ? "bg-emerald-600 text-white" : "bg-gray-800 text-white"
                }`}
                title={vibrationEnabled ? "バイブON（タップでOFF）" : "バイブOFF（タップでON）"}
              >
                {vibrationEnabled ? "📳 ON" : "📴 OFF"}
              </button>
            </div>

            {/* Row 2: ナビゲーション */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/${machineId}`)}
                className={`flex-1 rounded-lg bg-slate-700 dark:bg-slate-600 text-white py-2 font-bold transition-opacity hover:opacity-90 active:opacity-80 ${currentCategory === "juggler" ? "text-[10px]" : "text-xs"}`}
              >
                🎰 小役カウンター
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg bg-emerald-700 text-white py-2 font-bold ${currentCategory === "juggler" ? "text-[10px]" : "text-xs"}`}
              >
                {roleIcon} {roleLabel}逆算
              </button>
              {currentCategory === "juggler" && (
                <button
                  type="button"
                  onClick={() => navigate(`/${machineId}/specs`)}
                  className="flex-1 rounded-lg bg-indigo-700 text-white py-2 text-[10px] font-bold transition-opacity hover:opacity-90 active:opacity-80"
                >
                  📊 機種スペック
                </button>
              )}
            </div>
          </div>
        </div>

        {/* カードエリア */}
        <div className="mx-auto w-full max-w-md space-y-4 p-4">

          {/* 基本データ：総ゲーム数 */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 sm:p-6">
            <h2 className="mb-2 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
              基本データ
            </h2>
            <DynamicInput
              element={ELEM_TOTAL_GAMES}
              value={totalGames}
              onChange={(v) => update("total-games", Number(v) || 0)}
              totalGames={totalGames}
              vibrationEnabled={vibrationEnabled}
              overrideProbText={bonusProbText ? `合算 ${bonusProbText}` : undefined}
            />
          </div>

          {/* 差枚数（台メーター） */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 sm:p-6">
            <h2 className="mb-2 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
              差枚数（台メーター）
            </h2>
            <DynamicInput
              element={ELEM_DIFF_COINS}
              value={diffCoins}
              onChange={(v) => update("diff-coins", Number(v) || 0)}
              vibrationEnabled={vibrationEnabled}
            />
          </div>

          {/* ボーナス回数 */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 sm:p-6">
            <h2 className="mb-2 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
              ボーナス回数
            </h2>
            <div className="grid min-w-0 grid-cols-2 gap-4">
              <DynamicInput
                element={ELEM_BIG}
                value={bigCount}
                onChange={(v) => update("big-count", Number(v) || 0)}
                totalGames={totalGames}
                vibrationEnabled={vibrationEnabled}
                compactLayout
              />
              <DynamicInput
                element={ELEM_REG}
                value={regCount}
                onChange={(v) => update("reg-count", Number(v) || 0)}
                totalGames={totalGames}
                vibrationEnabled={vibrationEnabled}
                compactLayout
              />
            </div>
          </div>

          {/* ぶどう逆算結果 */}
          <div
            className={`rounded-2xl p-5 shadow-xl transition-all ${
              calcResult
                ? "bg-white dark:bg-slate-900 ring-1 ring-emerald-800/50"
                : "bg-white/60 dark:bg-slate-900/40"
            }`}
          >
            <h2 className="mb-2 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
              {roleIcon} {roleLabel}逆算結果
            </h2>

            {!calcResult ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3 opacity-20">{roleIcon}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  総ゲーム数・差枚数を入力すると<br />リアルタイムで計算されます
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/50">
                  <p className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    チェリー狙い
                  </p>
                  <div
                    className="text-center text-4xl font-black italic tabular-nums sm:text-5xl"
                    style={{
                      fontFamily: "'Urbanist', -apple-system, sans-serif",
                      color: calcResult.cherryAim ? "#059669" : "#94a3b8",
                      textShadow: calcResult.cherryAim
                        ? "0 0 16px rgba(52, 211, 153, 0.35), 0 0 32px rgba(52, 211, 153, 0.15)"
                        : "none",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {calcResult.cherryAim
                      ? `1/${calcResult.cherryAim.prob.toFixed(2)}`
                      : "計算不可"}
                  </div>
                  {calcResult.cherryAim && (
                    <p
                      className="mt-2 text-center text-base font-bold tabular-nums text-emerald-800 dark:text-emerald-300 sm:text-lg"
                      style={{ fontFamily: "'Urbanist', -apple-system, sans-serif" }}
                    >
                      推計 {calcResult.cherryAim.count.toLocaleString()} 回
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                  <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    フリー打ち
                  </p>
                  <div
                    className="text-center text-4xl font-black italic tabular-nums sm:text-5xl"
                    style={{
                      fontFamily: "'Urbanist', -apple-system, sans-serif",
                      color: calcResult.freePlay ? "#475569" : "#94a3b8",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {calcResult.freePlay
                      ? `1/${calcResult.freePlay.prob.toFixed(2)}`
                      : "計算不可"}
                  </div>
                  {calcResult.freePlay && (
                    <p
                      className="mt-2 text-center text-base font-bold tabular-nums text-slate-700 dark:text-slate-300 sm:text-lg"
                      style={{ fontFamily: "'Urbanist', -apple-system, sans-serif" }}
                    >
                      推計 {calcResult.freePlay.count.toLocaleString()} 回
                    </p>
                  )}
                </div>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  {totalGames.toLocaleString()} G ／ 設定推定はチェリー狙い基準
                </p>
                {totalGames < 1000 && (
                  <p className="text-center text-xs text-amber-600/80 dark:text-amber-500/70">
                    ⚠️ ゲーム数が少ないため参考値
                  </p>
                )}
              </div>
            )}
          </div>

          {config && (
            <GrapeReverseEstimationPanel
              config={config}
              inputs={estimationInputs ?? {
                "total-games": totalGames,
                "big-count": bigCount,
                "reg-count": regCount,
                ...(isHana
                  ? { "bell-count": cherryAimResult?.count ?? 0 }
                  : { "grape-count": cherryAimResult?.count ?? 0 }),
              }}
              estimationResults={estimationResults}
              estimationError={estimationError}
              totalGames={totalGames}
              currentCategory={currentCategory}
              roleLabel={roleLabel}
            />
          )}

          <div className="pb-6" />
        </div>
      </div>
    </>
  );
}
