import { useMemo } from "react";
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
// 30:70 スプリットカウンター（逆算ページ専用）
// ─────────────────────────────────────────────
interface SplitCounterProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  vibrationEnabled: boolean;
  accentGlow?: string;
  probText?: string; // バー内部に白斜体で表示する確率テキスト
  step?: number;
}

function SplitCounter({
  label,
  value,
  onChange,
  vibrationEnabled,
  accentGlow,
  probText,
  step = 1,
}: SplitCounterProps) {
  const vibrate = (type: "inc" | "dec") => {
    if (!vibrationEnabled) return;
    try { window.navigator?.vibrate?.(type === "inc" ? 15 : 40); } catch (_) {}
  };

  const inc = () => { onChange(value + step); vibrate("inc"); };
  const dec = () => { if (value <= 0) return; onChange(Math.max(0, value - step)); vibrate("dec"); };

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
            <span
              className="text-3xl font-bold tabular-nums text-white cursor-pointer counter-number"
              style={{
                fontFamily: "'Urbanist', sans-serif",
                ...(accentGlow ? { textShadow: `0 0 8px ${accentGlow}44, 0 0 16px ${accentGlow}22` } : {}),
              }}
              onClick={() => {
                const raw = window.prompt(label, String(value));
                if (raw === null) return;
                const v = parseInt(raw);
                if (!isNaN(v)) onChange(Math.max(0, v));
              }}
            >
              {value}
            </span>
          </div>
        </div>

        {/* 縦区切り */}
        <div className="absolute top-3 bottom-3 w-px bg-slate-700" style={{ left: "30%" }} />

        {/* RIGHT 70%: tap area + 確率表示 */}
        <div
          className="relative flex items-center justify-end cursor-pointer active:bg-white/[0.04] transition-colors"
          style={{ width: "70%" }}
          onClick={inc}
        >
          {/* 確率テキスト（白斜体） */}
          {probText && (
            <span
              className="absolute left-0 right-8 text-center text-sm font-bold italic text-white/80 pointer-events-none"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              {probText}
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

  const [vibrationEnabled] = useLocalStorage<boolean>("grape-reverse-vibration", true);

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

  // ─── リアルタイム逆算計算 ───
  const calcResult = useMemo(() => {
    if (totalGames === 0) return null;

    const BIG_PAYOUT   = config?.specs?.payouts?.big   ?? 240;
    const REG_PAYOUT   = config?.specs?.payouts?.reg   ?? 96;
    const GRAPE_PAYOUT = config?.specs?.payouts?.grape ?? 8;
    const REPLAY_DENOM = config?.specs?.reverseCalcProbDenominators?.replay ?? 7.3;
    const CHERRY_DENOM = config?.specs?.reverseCalcProbDenominators?.cherry ?? 36.0;

    // ユーザー指定の逆算式
    const coinIn  = totalGames * 3;
    const payout  = coinIn - diffCoins; // 差枚数 = 投入 - 払出（正値＝沈み）

    const bonusOut  = bigCount * BIG_PAYOUT + regCount * REG_PAYOUT;
    const replayOut = (totalGames / REPLAY_DENOM) * 3;
    const cherryOut = (totalGames / CHERRY_DENOM) * 2;
    const correction = replayOut + cherryOut;

    const grapeOut   = payout - bonusOut - correction;
    const grapeCount = grapeOut / GRAPE_PAYOUT;

    if (grapeCount <= 0) return null;

    const prob = totalGames / grapeCount;
    return { prob, count: Math.round(grapeCount) };
  }, [totalGames, bigCount, regCount, diffCoins, config]);

  const probText = calcResult ? `1/${calcResult.prob.toFixed(2)}` : undefined;

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

        {/* 2行Sticky Header */}
        <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm py-3 px-4 shadow-md border-b border-slate-800">
          <div className="mx-auto max-w-md space-y-2">
            {/* Row 1: 機種名 + リセット */}
            <div className="flex items-center gap-2">
              <span className="flex-1 text-center text-sm font-bold text-white truncate">
                {machineName}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-80 active:opacity-60"
              >
                🗑️ リセット
              </button>
            </div>
            {/* Row 2: ナビゲーション */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/${machineId}`)}
                className="flex-1 rounded-lg bg-slate-700 text-white py-2 text-xs font-bold transition-opacity hover:opacity-90 active:opacity-80"
              >
                🎰 小役カウンター
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-emerald-700 text-white py-2 text-xs font-bold"
              >
                {isHana ? "🔔 ベル逆算" : "🍇 ぶどう逆算"}
              </button>
            </div>
          </div>
        </div>

        {/* カードエリア */}
        <div className="mx-auto max-w-md space-y-4 p-4">

          {/* 基本データカード：総ゲーム数 */}
          <div className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              基本データ
            </h2>
            <SplitCounter
              label="総ゲーム数"
              value={totalGames}
              onChange={(n) => update("total-games", n)}
              vibrationEnabled={vibrationEnabled}
              accentGlow="#94a3b8"
              step={10}
            />
          </div>

          {/* 差枚数カード */}
          <div className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              差枚数（沈み額）
            </h2>
            <p className="text-[10px] text-slate-600 mb-3">プラスが沈み・ゼロは±0以上</p>
            <SplitCounter
              label="差枚数"
              value={diffCoins}
              onChange={(n) => update("diff-coins", n)}
              vibrationEnabled={vibrationEnabled}
              accentGlow="#f59e0b"
              probText={probText}
              step={50}
            />
          </div>

          {/* ボーナス回数カード */}
          <div className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              ボーナス回数
            </h2>
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

          {/* 計算結果サマリー */}
          {totalGames === 0 && (
            <div className="rounded-2xl bg-slate-900/50 ring-1 ring-slate-800 p-6 text-center">
              <div className="text-3xl mb-2 opacity-30">{isHana ? "🔔" : "🍇"}</div>
              <p className="text-sm text-slate-600">
                総ゲーム数を入力すると<br />リアルタイムで計算されます
              </p>
            </div>
          )}

          {totalGames > 0 && !calcResult && (
            <div className="rounded-2xl bg-slate-900/50 ring-1 ring-amber-800/40 p-4 text-center">
              <p className="text-sm text-amber-500/80">
                差枚数・ボーナス回数を確認してください<br />
                <span className="text-xs text-slate-600">（{roleLabel}枚数が算出できません）</span>
              </p>
            </div>
          )}

          {calcResult && (
            <div className="rounded-2xl bg-slate-900 ring-1 ring-emerald-800/50 p-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {roleLabel}逆算結果
              </h2>
              <div className="text-center">
                <div
                  className="text-5xl font-black tabular-nums"
                  style={{
                    fontFamily: "'Urbanist', sans-serif",
                    color: "#34d399",
                    textShadow: "0 0 20px rgba(52,211,153,0.5), 0 0 40px rgba(52,211,153,0.2)",
                  }}
                >
                  1/{calcResult.prob.toFixed(2)}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  推計 {calcResult.count} 回 ／ {totalGames} G
                </p>
                {totalGames < 1000 && (
                  <p className="mt-2 text-xs text-amber-500/70">
                    ⚠️ ゲーム数が少ないため参考値
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pb-4" />
        </div>
      </div>
    </>
  );
}
