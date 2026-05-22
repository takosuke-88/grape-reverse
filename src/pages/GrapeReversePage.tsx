import { useState, useMemo } from "react";
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
import type { MachineConfig } from "../types/machine-schema";

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

// ─────────────────────────────────────────────
// DynamicInput の counter を完全再現したコンポーネント
// ─────────────────────────────────────────────
interface CounterTheme {
  bg: string;
  minusBg: string;
  accent: string;
}

interface GrapeCounterProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  vibrationEnabled: boolean;
  theme: CounterTheme;
  probText?: string;       // バー右下に白斜体で表示
  onDirectInput?: () => void;
}

function GrapeCounter({
  label,
  value,
  onChange,
  vibrationEnabled,
  theme,
  probText,
  onDirectInput,
}: GrapeCounterProps) {
  const [showFloat, setShowFloat] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showDirectInput, setShowDirectInput] = useState(false);

  const triggerVibration = (type: "inc" | "dec") => {
    if (!vibrationEnabled) return;
    try { window.navigator?.vibrate?.(type === "inc" ? 15 : 40); } catch (_) {}
  };

  const handleIncrement = () => {
    onChange(value + 1);
    triggerVibration("inc");
    setShowGlow(true);
    setShowFloat(true);
    setTimeout(() => setShowGlow(false), 450);
    setTimeout(() => setShowFloat(false), 620);
  };

  const handleDecrement = () => {
    if (value <= 0) return;
    onChange(value - 1);
    triggerVibration("dec");
  };

  const numFontSize =
    value >= 10000 ? "text-xl" : value >= 1000 ? "text-2xl" : "text-3xl";

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-slate-200">
        {label}
      </label>
      <div
        className="relative flex w-full rounded-xl overflow-hidden select-none"
        style={{ minHeight: "76px", background: theme.bg }}
      >
        {/* LEFT 30%: minus + number */}
        <div className="flex items-center" style={{ width: "30%" }}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= 0}
            className="h-full flex items-center justify-center text-2xl text-white/80 transition-all active:scale-95"
            style={{
              minWidth: "48px",
              background: theme.minusBg,
              boxShadow:
                "inset 2px 2px 4px rgba(255,255,255,0.10), inset -1px -1px 3px rgba(0,0,0,0.5), 3px 3px 8px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.05)",
              opacity: value <= 0 ? 0.25 : 1,
            }}
            aria-label="減らす"
          >
            −
          </button>
          <div className="flex-1 flex items-center justify-center">
            {showDirectInput ? (
              <input
                type="number"
                autoFocus
                min={0}
                value={value === 0 ? "" : value}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  onChange(isNaN(v) ? 0 : Math.max(0, v));
                  onDirectInput?.();
                }}
                onBlur={() => setShowDirectInput(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); setShowDirectInput(false); }
                }}
                className={`w-full text-center ${numFontSize} font-black bg-transparent text-white focus:outline-none tabular-nums`}
                style={{ maxWidth: "72px", fontFamily: "'Urbanist', -apple-system, sans-serif" }}
              />
            ) : (
              <span
                onClick={() => setShowDirectInput(true)}
                className={`${numFontSize} font-black tabular-nums cursor-pointer`}
                style={{
                  fontFamily: "'Urbanist', -apple-system, sans-serif",
                  color: "#ffffff",
                  textShadow: showGlow
                    ? `0 0 20px ${theme.accent}, 0 0 40px ${theme.accent}, 0 0 60px ${theme.accent}`
                    : `0 0 10px ${theme.accent}cc, 0 0 22px ${theme.accent}88`,
                }}
              >
                {value}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT 70%: tap area */}
        <div
          className="relative flex items-center justify-end cursor-pointer active:bg-white/10"
          style={{ width: "70%" }}
          onClick={handleIncrement}
        >
          {showFloat && (
            <span
              className="counter-float-anim absolute font-black text-xl pointer-events-none"
              style={{
                left: "40%", top: "50%",
                color: "#ffffff",
                textShadow: `0 0 14px ${theme.accent}`,
                zIndex: 10,
              }}
            >
              +1
            </span>
          )}
          <span
            className="text-3xl font-thin pr-4 pointer-events-none select-none"
            style={{ color: "#ffffff", opacity: 0.45 }}
          >
            ＋
          </span>
          {probText && (
            <span
              className="absolute right-2 bottom-1.5 text-lg italic font-black tabular-nums pointer-events-none select-none"
              style={{
                color: "rgba(255,255,255,0.92)",
                fontFamily: "'Urbanist', -apple-system, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {probText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// テーマ定義
const THEME_GAMES: CounterTheme = {
  bg: "#334155",
  minusBg: "linear-gradient(145deg, #253447, #182232)",
  accent: "#e2e8f0",
};
const THEME_DIFF: CounterTheme = {
  bg: "#78350f",
  minusBg: "linear-gradient(145deg, #5c2a0c, #3f1a07)",
  accent: "#fde68a",
};
const THEME_BIG: CounterTheme = {
  bg: "#b91c1c",
  minusBg: "linear-gradient(145deg, #991515, #7a1010)",
  accent: "#fecaca",
};
const THEME_REG: CounterTheme = {
  bg: "#1d4ed8",
  minusBg: "linear-gradient(145deg, #1840c0, #112c9a)",
  accent: "#bfdbfe",
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
  const roleLabel = isHana ? "ベル" : "ぶどう";
  const roleIcon = isHana ? "🔔" : "🍇";

  const [vibrationEnabled, setVibrationEnabled] = useLocalStorage<boolean>("grape-reverse-vibration", true);

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

  // ─── 逆算計算 ───
  const calcResult = useMemo(() => {
    if (totalGames === 0) return null;

    const BIG_PAYOUT    = config?.specs?.payouts?.big    ?? 240;
    const REG_PAYOUT    = config?.specs?.payouts?.reg    ?? 96;
    const GRAPE_PAYOUT  = config?.specs?.payouts?.grape  ?? 8;
    const REPLAY_DENOM  = config?.specs?.reverseCalcProbDenominators?.replay ?? 7.3;
    const CHERRY_DENOM  = config?.specs?.reverseCalcProbDenominators?.cherry ?? 36.0;

    const coinIn    = totalGames * 3;
    const payout    = coinIn - diffCoins;
    const bonusOut  = bigCount * BIG_PAYOUT + regCount * REG_PAYOUT;
    const correction = (totalGames / REPLAY_DENOM) * 3 + (totalGames / CHERRY_DENOM) * 2;

    const grapeOut   = payout - bonusOut - correction;
    const grapeCount = grapeOut / GRAPE_PAYOUT;

    if (grapeCount <= 0) return null;

    return {
      prob: totalGames / grapeCount,
      count: Math.round(grapeCount),
    };
  }, [totalGames, bigCount, regCount, diffCoins, config]);

  // 差枚数バー右下に表示するテキスト
  const diffProbText = calcResult ? `1/${calcResult.prob.toFixed(2)}` : undefined;

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

      <div className="min-h-screen w-full bg-slate-950">

        {/* カラーバー（スクロールアウト） */}
        <div className="py-4 px-4 shadow-lg" style={{ backgroundColor: brandColor }}>
          <div className="mx-auto max-w-md">
            <h1 className="text-base font-bold text-white">{machineName}</h1>
            <p className="text-xs text-white/70 mt-0.5">{roleLabel}逆算ツール</p>
          </div>
        </div>

        {/* 2行 Sticky Header ─ 小役カウンターページと同一構造 */}
        <div className="sticky top-0 z-50 bg-slate-100/95 backdrop-blur-sm py-3 px-4 shadow-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
          <div className="mx-auto max-w-md space-y-2">

            {/* Row 1: 機種名 + リセット */}
            <div className="flex items-center gap-2">
              <span
                className="flex-1 text-center font-bold text-base py-2 px-3 rounded-xl border-2 border-slate-300 bg-white text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-white truncate"
              >
                {machineName}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-80 active:opacity-60"
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
                className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-all ${
                  vibrationEnabled ? "bg-emerald-600 text-white" : "bg-gray-800 text-white"
                }`}
              >
                {vibrationEnabled ? "📳 ON" : "📴 OFF"}
              </button>
            </div>

            {/* Row 2: ナビゲーション */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/${machineId}`)}
                className="flex-1 rounded-lg bg-slate-700 dark:bg-slate-600 text-white py-2 text-xs font-bold transition-opacity hover:opacity-90 active:opacity-80"
              >
                🎰 小役カウンター
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-emerald-700 text-white py-2 text-xs font-bold"
              >
                {roleIcon} {roleLabel}逆算
              </button>
            </div>
          </div>
        </div>

        {/* カードエリア */}
        <div className="mx-auto w-full max-w-md space-y-4 p-4">

          {/* 基本データ：総ゲーム数 */}
          <div className="rounded-2xl bg-slate-900 p-4 space-y-3 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              基本データ
            </h2>
            <GrapeCounter
              label="総ゲーム数"
              value={totalGames}
              onChange={(n) => update("total-games", n)}
              vibrationEnabled={vibrationEnabled}
              theme={THEME_GAMES}
              probText={bonusProbText ? `合算 ${bonusProbText}` : undefined}
            />
          </div>

          {/* 差枚数（台メーター） */}
          <div className="rounded-2xl bg-slate-900 p-4 space-y-3 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              差枚数（台メーター）
            </h2>
            <GrapeCounter
              label="差枚数"
              value={diffCoins}
              onChange={(n) => update("diff-coins", n)}
              vibrationEnabled={vibrationEnabled}
              theme={THEME_DIFF}
              probText={diffProbText}
            />
          </div>

          {/* ボーナス回数 */}
          <div className="rounded-2xl bg-slate-900 p-4 space-y-3 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              ボーナス回数
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <GrapeCounter
                label="BIG回数"
                value={bigCount}
                onChange={(n) => update("big-count", n)}
                vibrationEnabled={vibrationEnabled}
                theme={THEME_BIG}
                probText={bigCount > 0 && totalGames > 0 ? `1/${(totalGames / bigCount).toFixed(1)}` : undefined}
              />
              <GrapeCounter
                label="REG回数"
                value={regCount}
                onChange={(n) => update("reg-count", n)}
                vibrationEnabled={vibrationEnabled}
                theme={THEME_REG}
                probText={regCount > 0 && totalGames > 0 ? `1/${(totalGames / regCount).toFixed(1)}` : undefined}
              />
            </div>
          </div>

          {/* ぶどう逆算結果 */}
          <div
            className={`rounded-2xl p-5 ring-1 transition-all ${
              calcResult
                ? "bg-slate-900 ring-emerald-800/50"
                : "bg-slate-900/40 ring-slate-800"
            }`}
          >
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {roleIcon} {roleLabel}逆算結果
            </h2>

            {!calcResult ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3 opacity-20">{roleIcon}</div>
                <p className="text-sm text-slate-600">
                  総ゲーム数・差枚数を入力すると<br />リアルタイムで計算されます
                </p>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className="text-6xl font-black italic tabular-nums"
                  style={{
                    fontFamily: "'Urbanist', -apple-system, sans-serif",
                    color: "#ffffff",
                    textShadow:
                      "0 0 20px #34d399, 0 0 40px #34d39988, 0 0 80px #34d39944",
                    letterSpacing: "-0.02em",
                  }}
                >
                  1/{calcResult.prob.toFixed(2)}
                </span>
                <p className="mt-3 text-xs text-slate-500">
                  推計 {calcResult.count} 回 ／ {totalGames.toLocaleString()} G
                </p>
                {totalGames < 1000 && (
                  <p className="mt-2 text-xs text-amber-500/70">
                    ⚠️ ゲーム数が少ないため参考値
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pb-6" />
        </div>
      </div>
    </>
  );
}
