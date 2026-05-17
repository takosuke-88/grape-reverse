import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import Seo from "../components/Seo";

// ─────────────────────────────────────────────
// 30:70 スプリットカウンター（ボーナス専用）
// ─────────────────────────────────────────────
interface BonusSplitCounterProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (n: number) => void;
  totalGames: number;
  cardBg: string;       // カード全体の背景色
  minusBg: string;      // 左エリア用グラデーション
  plusBg: string;       // 右エリア用グラデーション
  accentColor: string;  // 確率文字色
  vibrationEnabled: boolean;
}

function BonusSplitCounter({
  label,
  sublabel,
  value,
  onChange,
  totalGames,
  cardBg,
  minusBg,
  plusBg,
  accentColor,
  vibrationEnabled,
}: BonusSplitCounterProps) {
  const [showFloat, setShowFloat] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showDirectInput, setShowDirectInput] = useState(false);

  const triggerVibration = (type: "inc" | "dec") => {
    if (!vibrationEnabled) return;
    try {
      if (window.navigator?.vibrate) window.navigator.vibrate(type === "inc" ? 15 : 40);
    } catch (_) {}
  };

  const handleIncrement = () => {
    onChange(value + 1);
    triggerVibration("inc");
    setShowGlow(true);
    setShowFloat(true);
    setTimeout(() => setShowGlow(false), 450);
    setTimeout(() => setShowFloat(false), 650);
  };

  const handleDecrement = () => {
    if (value <= 0) return;
    onChange(value - 1);
    triggerVibration("dec");
  };

  const prob = value > 0 && totalGames > 0 ? totalGames / value : 0;

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: cardBg }}>
      {/* ラベル行 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <span className="text-xs font-bold text-white/50 tracking-widest uppercase">
            {sublabel}
          </span>
          <h3 className="text-lg font-extrabold text-white leading-none">{label}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">現在の確率</div>
          <div
            className="text-xl font-bold tabular-nums"
            style={{ color: accentColor, fontFamily: "'Urbanist', sans-serif" }}
          >
            {prob > 0 ? `1/${prob.toFixed(1)}` : "---"}
          </div>
        </div>
      </div>

      {/* スプリットボタン本体 */}
      <div className="relative flex" style={{ minHeight: "96px" }}>
        {/* LEFT 30%: minus + number */}
        <div className="flex items-center" style={{ width: "30%" }}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= 0}
            className="h-full flex items-center justify-center text-3xl text-white/60 transition-all active:scale-95"
            style={{
              minWidth: "52px",
              background: minusBg,
              boxShadow:
                value <= 0
                  ? "none"
                  : "inset 2px 2px 5px rgba(255,255,255,0.07), inset -1px -1px 4px rgba(0,0,0,0.6), 4px 4px 10px rgba(0,0,0,0.5), -1px -1px 3px rgba(255,255,255,0.03)",
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
                }}
                onBlur={() => setShowDirectInput(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); setShowDirectInput(false); }
                }}
                className="w-full text-center text-4xl font-black bg-transparent text-white focus:outline-none tabular-nums"
                style={{ maxWidth: "80px", fontFamily: "'Urbanist', sans-serif" }}
              />
            ) : (
              <span
                onClick={() => setShowDirectInput(true)}
                className={`text-4xl font-black tabular-nums text-white cursor-pointer select-none transition-all ${
                  showGlow ? "counter-number-glow" : "counter-number"
                }`}
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                {value}
              </span>
            )}
          </div>
        </div>

        {/* 縦区切り */}
        <div className="absolute top-4 bottom-4 w-px bg-white/10" style={{ left: "30%" }} />

        {/* RIGHT 70%: tap area */}
        <div
          className="relative flex items-center justify-end cursor-pointer select-none active:brightness-110 transition-all"
          style={{ width: "70%", background: plusBg }}
          onClick={handleIncrement}
        >
          {showFloat && (
            <span
              className="counter-float-anim absolute font-black text-2xl pointer-events-none"
              style={{
                left: "40%",
                top: "50%",
                color: accentColor,
                zIndex: 10,
              }}
            >
              +1
            </span>
          )}
          <span
            className="text-4xl font-thin pr-6 pointer-events-none select-none"
            style={{ color: accentColor, opacity: 0.35 }}
          >
            ＋
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BonusInputPage 本体
// ─────────────────────────────────────────────
export default function BonusInputPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();

  const machineInfo = AVAILABLE_MACHINES.find((m) => m.id === machineId);
  const brandColor = machineInfo?.color ?? "#334155";
  const machineName = machineInfo?.name ?? machineId ?? "機種不明";

  // メイン画面と同じLocalStorageキーを共有して即座に同期
  const [data, setData] = useLocalStorage<Record<string, number | boolean | string>>(
    `grape-reverse-data-${machineId}`,
    {}
  );

  const [vibrationEnabled] = useLocalStorage<boolean>("grape-reverse-vibration", true);

  const bigCount = Math.max(0, Number(data["big-count"]) || 0);
  const regCount = Math.max(0, Number(data["reg-count"]) || 0);
  const totalGames = Math.max(0, Number(data["total-games"]) || 0);

  const updateBig = (n: number) =>
    setData((prev) => ({ ...prev, "big-count": Math.max(0, n) }));
  const updateReg = (n: number) =>
    setData((prev) => ({ ...prev, "reg-count": Math.max(0, n) }));

  const combinedCount = bigCount + regCount;
  const combinedProb = combinedCount > 0 && totalGames > 0
    ? totalGames / combinedCount
    : 0;

  return (
    <>
      <Seo
        pageTitle={`${machineName} ボーナス入力｜GrapeReverse`}
        pageDescription={`${machineName}のBIG/REG回数を入力。設定判別ツールとリアルタイムで同期します。`}
        pagePath={`/${machineId}/bonus`}
      />

      <div className="min-h-screen w-full bg-slate-950">
        {/* ヘッダー */}
        <div
          className="py-5 px-4 text-white shadow-lg"
          style={{ backgroundColor: brandColor }}
        >
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={() => navigate(`/${machineId}`)}
              className="mb-3 flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              ← カウンターへ戻る
            </button>
            <h1 className="text-xl font-bold">{machineName}</h1>
            <p className="text-sm text-white/70 mt-0.5">ボーナス入力</p>
          </div>
        </div>

        <div className="mx-auto max-w-md space-y-4 p-4">
          {/* 総ゲーム数表示（参照用・読み取り専用） */}
          {totalGames > 0 && (
            <div className="rounded-xl bg-slate-800 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">総ゲーム数</span>
              <span
                className="text-2xl font-black text-white tabular-nums"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                {totalGames.toLocaleString()}
              </span>
            </div>
          )}

          {/* BIG BONUS カウンター（赤） */}
          <BonusSplitCounter
            label="BIG BONUS"
            sublabel="big"
            value={bigCount}
            onChange={updateBig}
            totalGames={totalGames}
            cardBg="#1a0408"
            minusBg="linear-gradient(145deg, #2d0810, #150205)"
            plusBg="linear-gradient(135deg, #3d0912 0%, #1a0408 100%)"
            accentColor="#f87171"
            vibrationEnabled={vibrationEnabled}
          />

          {/* REG BONUS カウンター（青） */}
          <BonusSplitCounter
            label="REG BONUS"
            sublabel="reg"
            value={regCount}
            onChange={updateReg}
            totalGames={totalGames}
            cardBg="#020c1a"
            minusBg="linear-gradient(145deg, #05183a, #010810)"
            plusBg="linear-gradient(135deg, #0a2240 0%, #020c1a 100%)"
            accentColor="#60a5fa"
            vibrationEnabled={vibrationEnabled}
          />

          {/* 合算確率カード */}
          <div className="rounded-2xl bg-slate-800 p-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              確率サマリー
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "BIG確率",
                  prob: bigCount > 0 && totalGames > 0 ? totalGames / bigCount : 0,
                  color: "#f87171",
                },
                {
                  label: "REG確率",
                  prob: regCount > 0 && totalGames > 0 ? totalGames / regCount : 0,
                  color: "#60a5fa",
                },
                {
                  label: "合算確率",
                  prob: combinedProb,
                  color: "#a78bfa",
                },
              ].map(({ label, prob, color }) => (
                <div key={label} className="text-center">
                  <div className="text-[10px] text-slate-500 mb-1">{label}</div>
                  <div
                    className="text-lg font-black tabular-nums"
                    style={{ color, fontFamily: "'Urbanist', sans-serif" }}
                  >
                    {prob > 0 ? `1/${prob.toFixed(1)}` : "---"}
                  </div>
                </div>
              ))}
            </div>

            {/* ボーナス合計 */}
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500">合計ボーナス</span>
              <span
                className="text-xl font-black text-white tabular-nums"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                {combinedCount} 回
              </span>
            </div>
          </div>

          {/* 戻るボタン（下部） */}
          <button
            type="button"
            onClick={() => navigate(`/${machineId}`)}
            className="w-full rounded-xl bg-slate-700 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            ← カウンター画面に戻る
          </button>
        </div>
      </div>
    </>
  );
}
