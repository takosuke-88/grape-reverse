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
// 汎用スプリットカウンター（逆算ページ専用）
// ─────────────────────────────────────────────
interface SplitCounterProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  vibrationEnabled: boolean;
  accentGlow?: string; // text-shadow 用の色
}

function SplitCounter({ label, value, onChange, vibrationEnabled, accentGlow }: SplitCounterProps) {
  const [showFloat, setShowFloat] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showDirect, setShowDirect] = useState(false);

  const vibrate = (type: "inc" | "dec") => {
    if (!vibrationEnabled) return;
    try { window.navigator?.vibrate?.(type === "inc" ? 15 : 40); } catch (_) {}
  };

  const inc = () => {
    onChange(value + 1);
    vibrate("inc");
    setShowGlow(true); setShowFloat(true);
    setTimeout(() => setShowGlow(false), 450);
    setTimeout(() => setShowFloat(false), 650);
  };
  const dec = () => {
    if (value <= 0) return;
    onChange(value - 1);
    vibrate("dec");
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-slate-300">{label}</label>
      <div
        className="relative flex w-full rounded-xl overflow-hidden select-none"
        style={{ minHeight: "72px", background: "#0f172a" }}
      >
        {/* LEFT 30%: minus + number */}
        <div className="flex items-center" style={{ width: "30%" }}>
          <button
            type="button"
            onClick={dec}
            disabled={value <= 0}
            className="h-full flex items-center justify-center text-2xl text-slate-300 transition-all active:scale-95"
            style={{
              minWidth: "48px",
              opacity: value <= 0 ? 0.2 : 1,
              background: "linear-gradient(145deg, #182232, #0b1622)",
              boxShadow: value <= 0
                ? "none"
                : "inset 2px 2px 4px rgba(255,255,255,0.06), inset -1px -1px 3px rgba(0,0,0,0.7), 3px 3px 8px rgba(0,0,0,0.55)",
            }}
            aria-label="減らす"
          >
            −
          </button>
          <div className="flex-1 flex items-center justify-center">
            {showDirect ? (
              <input
                type="number"
                autoFocus
                min={0}
                value={value === 0 ? "" : value}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  onChange(isNaN(v) ? 0 : Math.max(0, v));
                }}
                onBlur={() => setShowDirect(false)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setShowDirect(false); } }}
                className="w-full text-center text-3xl font-bold bg-transparent text-white focus:outline-none tabular-nums"
                style={{ maxWidth: "72px", fontFamily: "'Urbanist', sans-serif" }}
              />
            ) : (
              <span
                onClick={() => setShowDirect(true)}
                className={`text-3xl font-bold tabular-nums text-white cursor-pointer ${
                  showGlow ? "counter-number-glow" : "counter-number"
                }`}
                style={{
                  fontFamily: "'Urbanist', sans-serif",
                  ...(accentGlow && !showGlow
                    ? { textShadow: `0 0 8px ${accentGlow}44, 0 0 16px ${accentGlow}22` }
                    : {}),
                }}
              >
                {value}
              </span>
            )}
          </div>
        </div>

        {/* 縦区切り */}
        <div className="absolute top-3 bottom-3 w-px bg-slate-700" style={{ left: "30%" }} />

        {/* RIGHT 70%: tap area */}
        <div
          className="relative flex items-center justify-end cursor-pointer active:bg-white/[0.04] transition-colors"
          style={{ width: "70%" }}
          onClick={inc}
        >
          {showFloat && (
            <span
              className="counter-float-anim absolute font-bold text-xl pointer-events-none"
              style={{ left: "40%", top: "50%", color: accentGlow || "#86efac", zIndex: 10 }}
            >
              +1
            </span>
          )}
          <span className="text-3xl font-thin text-slate-600 pr-4 pointer-events-none" style={{ opacity: 0.4 }}>
            ＋
          </span>
        </div>
      </div>
    </div>
  );
}

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

  // 逆算専用 LocalStorage（メイン画面とは独立）
  const [grapeData, setGrapeData] = useLocalStorage<Record<string, number | boolean | string>>(
    `grape-reverse-data-grape-mode-${machineId}`,
    {}
  );
  const [vibrationEnabled] = useLocalStorage<boolean>("grape-reverse-vibration", true);

  const totalGames = Math.max(0, Number(grapeData["total-games"]) || 0);
  const bigCount = Math.max(0, Number(grapeData["big-count"]) || 0);
  const regCount = Math.max(0, Number(grapeData["reg-count"]) || 0);
  const diffCoinsRaw = grapeData["diff-coins"];
  const diffCoins =
    diffCoinsRaw !== undefined && diffCoinsRaw !== "" ? Number(diffCoinsRaw) : null;

  const update = (key: string, v: number | string) =>
    setGrapeData((prev) => ({ ...prev, [key]: v }));

  const handleReset = () => {
    if (!window.confirm(`${roleLabel}逆算の入力を全てリセットしますか？`)) return;
    setGrapeData({});
  };

  // リアルタイム逆算計算
  const calcResult = useMemo(() => {
    if (!config?.specs?.payouts?.grape) return null;
    if (totalGames === 0 || diffCoins === null || isNaN(diffCoins)) return null;

    const PAYOUT = {
      BIG: config.specs.payouts.big,
      REG: config.specs.payouts.reg,
      GRAPE: config.specs.payouts.grape,
      CHERRY: 2,
    };
    const REPLAY_PROB = 1 / (config.specs.reverseCalcProbDenominators?.replay ?? 7.3);
    const CHERRY_PROB = 1 / (config.specs.reverseCalcProbDenominators?.cherry ?? 36.0);

    const coinIn = totalGames * (1 - REPLAY_PROB) * 3;
    const bonusOut = bigCount * PAYOUT.BIG + regCount * PAYOUT.REG;

    // A: チェリー狙い（完全取得）
    const grapePayoutA = diffCoins + coinIn - bonusOut - totalGames * CHERRY_PROB * PAYOUT.CHERRY * 1.0;
    const grapeCountA = grapePayoutA / PAYOUT.GRAPE;
    const grapeProbA = grapeCountA > 0 ? totalGames / grapeCountA : 0;

    // B: フリー打ち（チェリー取得率 2/3）
    const grapePayoutB = diffCoins + coinIn - bonusOut - totalGames * CHERRY_PROB * PAYOUT.CHERRY * (2 / 3);
    const grapeCountB = grapePayoutB / PAYOUT.GRAPE;
    const grapeProbB = grapeCountB > 0 ? totalGames / grapeCountB : 0;

    return {
      A: { prob: grapeProbA, count: Math.round(grapeCountA) },
      B: { prob: grapeProbB, count: Math.round(grapeCountB) },
    };
  }, [totalGames, bigCount, regCount, diffCoins, config]);

  const hasResult = calcResult !== null;

  return (
    <>
      <Seo
        pageTitle={`${machineName} ${roleLabel}逆算｜GrapeReverse`}
        pageDescription={`${machineName}の${roleLabel}確率を差枚数とボーナス回数から逆算。設定判別に直結するリアルタイム計算ツール。`}
        pagePath={`/${machineId}/grape`}
      />

      <div className="min-h-screen w-full bg-slate-950">
        {/* ヘッダー */}
        <div className="py-5 px-4 text-white shadow-lg" style={{ backgroundColor: brandColor }}>
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={() => navigate(`/${machineId}`)}
              className="mb-3 flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              ← カウンターへ戻る
            </button>
            <h1 className="text-xl font-bold">{machineName}</h1>
            <p className="text-sm text-white/70 mt-0.5">{roleLabel}逆算</p>
          </div>
        </div>

        <div className="mx-auto max-w-md space-y-4 p-4">
          {/* 入力セクション */}
          <div className="rounded-2xl bg-slate-900 p-4 space-y-4 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              入力データ
            </h2>

            <SplitCounter
              label="総ゲーム数"
              value={totalGames}
              onChange={(n) => update("total-games", n)}
              vibrationEnabled={vibrationEnabled}
              accentGlow="#94a3b8"
            />

            <div className="grid grid-cols-2 gap-3">
              <SplitCounter
                label="BIG回数"
                value={bigCount}
                onChange={(n) => update("big-count", n)}
                vibrationEnabled={vibrationEnabled}
                accentGlow="#f87171"
              />
              <SplitCounter
                label="REG回数"
                value={regCount}
                onChange={(n) => update("reg-count", n)}
                vibrationEnabled={vibrationEnabled}
                accentGlow="#60a5fa"
              />
            </div>
          </div>

          {/* 差枚数入力 */}
          <div className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                差枚数（台メーター）
              </h2>
              <span className="text-[10px] text-slate-600">マイナスは沈み</span>
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={diffCoinsRaw === undefined || diffCoinsRaw === "" ? "" : String(diffCoinsRaw)}
              onChange={(e) => update("diff-coins", e.target.value === "" ? "" : e.target.value)}
              placeholder="例: -1200"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-center text-4xl font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent py-5 tabular-nums"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            />
            <p className="mt-2 text-center text-xs text-slate-600">
              台のメーター（OUT − IN）を入力してください
            </p>
          </div>

          {/* 逆算結果 */}
          <div
            className={`rounded-2xl p-4 ring-1 transition-all duration-300 ${
              hasResult
                ? "bg-slate-900 ring-emerald-800/50"
                : "bg-slate-900/50 ring-slate-800"
            }`}
          >
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {roleLabel}逆算結果
            </h2>

            {!hasResult ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2 opacity-30">{isHana ? "🔔" : "🍇"}</div>
                <p className="text-sm text-slate-600">
                  総ゲーム数と差枚数を入力すると<br />リアルタイムで計算されます
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* チェリー狙い */}
                <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/50 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-400">チェリー狙い</span>
                    <span className="text-[10px] text-slate-600">推計 {calcResult!.A.count} 回</span>
                  </div>
                  <div
                    className="text-center text-3xl font-black tabular-nums"
                    style={{
                      fontFamily: "'Urbanist', sans-serif",
                      color: calcResult!.A.prob > 0 ? "#34d399" : "#475569",
                      textShadow: calcResult!.A.prob > 0
                        ? "0 0 16px rgba(52, 211, 153, 0.5), 0 0 32px rgba(52, 211, 153, 0.2)"
                        : "none",
                    }}
                  >
                    {calcResult!.A.prob > 0 ? `1/${calcResult!.A.prob.toFixed(2)}` : "計算不可"}
                  </div>
                </div>

                {/* フリー打ち */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400">フリー打ち</span>
                    <span className="text-[10px] text-slate-600">推計 {calcResult!.B.count} 回</span>
                  </div>
                  <div
                    className="text-center text-3xl font-black tabular-nums"
                    style={{
                      fontFamily: "'Urbanist', sans-serif",
                      color: calcResult!.B.prob > 0 ? "#94a3b8" : "#475569",
                    }}
                  >
                    {calcResult!.B.prob > 0 ? `1/${calcResult!.B.prob.toFixed(2)}` : "計算不可"}
                  </div>
                </div>

                {/* ゲーム数注記 */}
                {totalGames < 1000 && (
                  <p className="text-center text-xs text-amber-500/70">
                    ⚠️ ゲーム数が少ないため、参考値としてご確認ください
                  </p>
                )}
              </div>
            )}
          </div>

          {/* リセットボタン */}
          <div className="pt-2 pb-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-6 py-4 text-base font-bold text-white/60 hover:text-white transition-colors"
            >
              🗑️ {roleLabel}逆算の入力をリセット
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
