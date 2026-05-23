import React, { useState } from "react";
import type { DiscriminationElement } from "../../types/machine-schema";
import { formatBonusText } from "../../utils/formatters";

interface DynamicInputProps {
  element: DiscriminationElement;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
  totalGames?: number;
  vibrationEnabled?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onDirectInput?: () => void;
}

interface ElementTheme {
  bg: string;
  minusBg: string;
  accent: string;
}

function getElementTheme(id: string): ElementTheme {
  if (id.includes("grape")) {
    return {
      bg: "#15803d",
      minusBg: "linear-gradient(145deg, #0f6030, #0a4a24)",
      accent: "#bbf7d0",
    };
  }
  if (id.includes("big")) {
    return {
      bg: "#b91c1c",
      minusBg: "linear-gradient(145deg, #991515, #7a1010)",
      accent: "#fecaca",
    };
  }
  if (id.includes("reg")) {
    return {
      bg: "#1d4ed8",
      minusBg: "linear-gradient(145deg, #1840c0, #112c9a)",
      accent: "#bfdbfe",
    };
  }
  if (id.includes("cherry")) {
    return {
      bg: "#be185d",
      minusBg: "linear-gradient(145deg, #9d154d, #7a1040)",
      accent: "#fbcfe8",
    };
  }
  return {
    bg: "#334155",
    minusBg: "linear-gradient(145deg, #253447, #182232)",
    accent: "#e2e8f0",
  };
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  element,
  value,
  onChange,
  totalGames,
  vibrationEnabled = true,
  onIncrement,
  onDecrement,
  onDirectInput,
}) => {
  const [showFloat, setShowFloat] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showDirectInput, setShowDirectInput] = useState(false);

  const triggerVibration = (type: "inc" | "dec") => {
    if (!vibrationEnabled) return;
    try {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(type === "inc" ? 15 : 40);
      }
    } catch (_) {}
  };

  const handleIncrement = () => {
    if (element.isReadOnly) return;
    onChange((Number(value) || 0) + 1);
    onIncrement?.();
    triggerVibration("inc");
    setShowGlow(true);
    setShowFloat(true);
    setTimeout(() => setShowGlow(false), 450);
    setTimeout(() => setShowFloat(false), 620);
  };

  const handleDecrement = () => {
    if (element.isReadOnly) return;
    if (onDecrement) {
      onDecrement();
      triggerVibration("dec");
      return;
    }
    const current = Number(value) || 0;
    if (current <= 0) return;
    onChange(current - 1);
    triggerVibration("dec");
  };

  const theme = getElementTheme(element.id);

  const renderInput = () => {
    switch (element.type) {
      case "counter": {
        const displayValue = Number(value) || 0;
        const showProb =
          element.id !== "total-games" &&
          totalGames != null &&
          totalGames > 0 &&
          displayValue > 0;
        const probText = showProb
          ? `1/${(totalGames! / displayValue).toFixed(1)}`
          : null;
        // 4桁以上はフォントを縮小（1000超のぶどうカウント等に対応）
        const numFontSize =
          displayValue >= 10000 ? "text-xl" : displayValue >= 1000 ? "text-2xl" : "text-3xl";

        return (
          <div
            className="relative flex w-full rounded-xl overflow-hidden select-none"
            style={{
              minHeight: "76px",
              background: theme.bg,
              opacity: element.isReadOnly ? 0.6 : 1,
            }}
          >
            {/* LEFT 30%: minus button + number display */}
            <div className="flex items-center" style={{ width: "30%" }}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!!element.isReadOnly}
                className="h-full flex items-center justify-center text-2xl text-white/80 transition-all active:scale-95"
                style={{
                  minWidth: "48px",
                  background: element.isReadOnly ? "transparent" : theme.minusBg,
                  boxShadow: element.isReadOnly
                    ? "none"
                    : "inset 2px 2px 4px rgba(255,255,255,0.10), inset -1px -1px 3px rgba(0,0,0,0.5), 3px 3px 8px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.05)",
                  borderRadius: "0",
                }}
                aria-label="減らす"
              >
                −
              </button>
              <div className="flex-1 flex items-center justify-center">
                {showDirectInput ? (
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    value={
                      typeof value === "boolean" ? "" : value === "" ? "" : value
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      if (raw === "") onChange("");
                      else onChange(parseInt(raw) || 0);
                      onDirectInput?.();
                    }}
                    onBlur={() => setShowDirectInput(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setShowDirectInput(false);
                      }
                    }}
                    className={`w-full text-center ${numFontSize} font-black bg-transparent text-white focus:outline-none tabular-nums`}
                    style={{
                      maxWidth: "72px",
                      fontFamily: "'Urbanist', -apple-system, sans-serif",
                    }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (!element.isReadOnly) setShowDirectInput(true);
                    }}
                    className={`${numFontSize} font-black tabular-nums`}
                    style={{
                      fontFamily: "'Urbanist', -apple-system, sans-serif",
                      color: "#ffffff",
                      cursor: element.isReadOnly ? "default" : "pointer",
                      textShadow: showGlow
                        ? `0 0 20px ${theme.accent}, 0 0 40px ${theme.accent}, 0 0 60px ${theme.accent}`
                        : `0 0 10px ${theme.accent}cc, 0 0 22px ${theme.accent}88`,
                    }}
                  >
                    {displayValue}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT 70%: tap area */}
            <div
              className={`relative flex items-center justify-end ${
                element.isReadOnly
                  ? "pointer-events-none"
                  : "cursor-pointer active:bg-white/10"
              }`}
              style={{ width: "70%" }}
              onClick={handleIncrement}
            >
              {showFloat && (
                <span
                  className="counter-float-anim absolute font-black text-xl pointer-events-none"
                  style={{
                    left: "40%",
                    top: "50%",
                    color: "#ffffff",
                    textShadow: `0 0 14px ${theme.accent}`,
                    zIndex: 10,
                  }}
                >
                  +1
                </span>
              )}

              {/* ＋ : 右寄せ（前バージョンと同じ位置） */}
              <span
                className="text-3xl font-thin pr-4 pointer-events-none select-none"
                style={{
                  color: "#ffffff",
                  opacity: element.isReadOnly ? 0.2 : 0.45,
                }}
              >
                ＋
              </span>

              {/* 確率：右下に絶対配置（数字エリアと重ならない） */}
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
        );
      }

      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[44px] px-4 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">選択してください</option>
            <option value="あり">あり</option>
            <option value="なし">なし</option>
          </select>
        );

      case "flag":
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-11 w-20 items-center rounded-full transition-colors ${
              value ? "bg-blue-600" : "bg-slate-300"
            }`}
            role="switch"
            aria-checked={!!value}
            aria-label={element.label}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                value ? "translate-x-10" : "translate-x-1"
              }`}
            />
            <span
              className={`absolute text-xs font-bold ${
                value ? "left-2 text-white" : "right-2 text-slate-600"
              }`}
            >
              {value ? "ON" : "OFF"}
            </span>
          </button>
        );

      case "ratio":
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              readOnly={!!element.isReadOnly}
              value={
                typeof value === "boolean" ? "" : value === "" ? "" : value
              }
              onChange={(e) => {
                if (element.isReadOnly) return;
                if (e.target.value === "") onChange("");
                else onChange(parseFloat(e.target.value) || 0);
              }}
              className="w-full h-[44px] px-4 text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              step="0.01"
              placeholder="1/○○○"
            />
          </div>
        );

      default:
        return <div className="text-slate-400 text-sm">未対応の入力タイプ</div>;
    }
  };

  return (
    <div className="space-y-1.5">
      <label
        className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${
          element.type === "counter" ? "block" : "block text-center"
        }`}
      >
        {formatBonusText(element.label)}
      </label>

      <div className={element.type === "counter" ? "w-full" : "flex justify-center"}>
        {renderInput()}
      </div>

      {(element.id === "reg-lamp-rainbow" || element.id === "bonus-rainbow") &&
        Number(value) > 0 && (
          <div className="text-center text-xs font-bold text-red-500 animate-pulse mt-1">
            ※設定6確定演出として計算されます
          </div>
        )}
    </div>
  );
};

export default DynamicInput;
