import React, { useState } from "react";
import type { DiscriminationElement } from "../../types/machine-schema";
import { formatBonusText } from "../../utils/formatters";
import CounterDirectInputZone from "./CounterDirectInputZone";
import {
  COUNTER_MINUS_WIDTH_CLASS,
  clampCounterValueByElementId,
  getCounterDigitCapacity,
  getCounterMaxDigits,
  isGridOnlyCompactCounterId,
  sanitizeCounterDigitString,
} from "./counter-layout";
import {
  getHanaFeatherLampHint,
  isHanaSetting6GuaranteeElementId,
} from "./hana-lamp-hints";

interface DynamicInputProps {
  element: DiscriminationElement;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
  totalGames?: number;
  vibrationEnabled?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onDirectInput?: () => void;
  /** 2列グリッド内のカウンター（ぶどう・内訳など） */
  compactLayout?: boolean;
}

interface ElementTheme {
  bg: string;
  minusBg: string;
  accent: string;
  /** 背景が明るい（白・黄など）場合に数字色を暗くするためのオーバーライド */
  textColor?: string;
  /** 虹グラデーション用のbgはinlineスタイルで上書き */
  bgStyle?: React.CSSProperties;
}

function getElementTheme(id: string): ElementTheme {
  // ─── ランプ色テーマ（big/reg より先にマッチさせる） ───
  if (id.endsWith("-white")) {
    return {
      bg: "#e2e8f0",
      minusBg: "linear-gradient(145deg, #cbd5e1, #94a3b8)",
      accent: "#1e293b",
      textColor: "#1e293b",
    };
  }
  if (id.endsWith("-yellow")) {
    return {
      bg: "#d97706",
      minusBg: "linear-gradient(145deg, #b45309, #92400e)",
      accent: "#fef3c7",
    };
  }
  if (id.endsWith("-green")) {
    return {
      bg: "#15803d",
      minusBg: "linear-gradient(145deg, #0f6030, #0a4a24)",
      accent: "#bbf7d0",
    };
  }
  if (id.endsWith("-red")) {
    return {
      bg: "#b91c1c",
      minusBg: "linear-gradient(145deg, #991515, #7a1010)",
      accent: "#fecaca",
    };
  }
  if (id.endsWith("-rainbow")) {
    return {
      bg: "#7c3aed",
      minusBg: "linear-gradient(145deg, #5b21b6, #3b0764)",
      accent: "#f0abfc",
      bgStyle: {
        background:
          "linear-gradient(135deg, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #a855f7 100%)",
      },
    };
  }
  if (id.endsWith("-blue")) {
    return {
      bg: "#1d4ed8",
      minusBg: "linear-gradient(145deg, #1840c0, #112c9a)",
      accent: "#bfdbfe",
    };
  }

  // ─── 既存テーマ ───
  if (id.includes("grape") || id.includes("bell")) {
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
  compactLayout = false,
}) => {
  const [showFloat, setShowFloat] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

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
    const maxDigits =
      element.type === "counter" ? getCounterMaxDigits(element.id) : undefined;
    const current = Number(value) || 0;
    if (maxDigits != null) {
      const cap = 10 ** maxDigits - 1;
      if (current >= cap) return;
    }
    const next = current + 1;
    onChange(
      element.type === "counter"
        ? clampCounterValueByElementId(element.id, next)
        : next,
    );
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
        const useCompact =
          compactLayout || isGridOnlyCompactCounterId(element.id);
        const maxDigits = getCounterMaxDigits(element.id);
        const digitCapacity = getCounterDigitCapacity(element.id, useCompact);
        const numFontSize = useCompact ? "text-2xl" : "text-3xl";

        const clampCounter = (n: number) =>
          clampCounterValueByElementId(element.id, n);

        const dynamicGlow = showGlow
          ? `0 0 20px ${theme.accent}, 0 0 40px ${theme.accent}, 0 0 60px ${theme.accent}`
          : `0 0 10px ${theme.accent}cc, 0 0 22px ${theme.accent}88`;

        return (
          <div
            className="relative flex w-full min-w-0 max-w-full rounded-xl overflow-hidden select-none"
            style={{
              minHeight: "76px",
              background: theme.bg,
              opacity: element.isReadOnly ? 0.6 : 1,
              ...theme.bgStyle,
            }}
          >
            {/* 左: マイナス固定 + 数字ゾーン */}
            <div
              className="flex shrink-0 items-stretch"
              style={useCompact ? undefined : { width: "30%" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecrement();
                }}
                disabled={!!element.isReadOnly}
                className={`flex ${COUNTER_MINUS_WIDTH_CLASS} items-center justify-center self-stretch text-2xl transition-all active:scale-95 touch-manipulation`}
                style={{
                  minHeight: "76px",
                  background: element.isReadOnly ? "transparent" : theme.minusBg,
                  boxShadow: element.isReadOnly
                    ? "none"
                    : "inset 2px 2px 4px rgba(255,255,255,0.10), inset -1px -1px 3px rgba(0,0,0,0.5), 3px 3px 8px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.05)",
                  color: theme.textColor ? `${theme.textColor}cc` : "rgba(255,255,255,0.8)",
                }}
                aria-label="減らす"
              >
                −
              </button>

              <CounterDirectInputZone
                label={element.label}
                displayValue={displayValue}
                inputValue={
                  typeof value === "boolean"
                    ? ""
                    : Number(value) > 0
                      ? String(Number(value))
                      : ""
                }
                onInputChange={(raw) => {
                  const digits = sanitizeCounterDigitString(raw, maxDigits);
                  if (digits === "") onChange("");
                  else onChange(clampCounter(parseInt(digits, 10) || 0));
                }}
                numFontSize={numFontSize}
                numberGlow={dynamicGlow}
                readOnly={!!element.isReadOnly}
                onDirectInput={onDirectInput}
                variant={useCompact ? "compact" : "default"}
                maxDigits={maxDigits}
                digitCapacity={digitCapacity}
                textColor={theme.textColor ?? "#ffffff"}
              />
            </div>

            {/* 右: プラスエリア */}
            <div
              className={`relative flex min-w-0 flex-1 items-center justify-end ${
                element.isReadOnly
                  ? "pointer-events-none"
                  : "cursor-pointer active:bg-white/10"
              }`}
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
              <span
                className="text-3xl font-thin pr-4 pointer-events-none select-none"
                style={{ color: theme.textColor ?? "#ffffff", opacity: element.isReadOnly ? 0.2 : 0.45 }}
              >
                ＋
              </span>
              {probText && (
                <span
                  className="absolute right-2 bottom-1.5 text-lg italic font-black tabular-nums pointer-events-none select-none"
                  style={{
                    color: theme.textColor ? `${theme.textColor}ee` : "rgba(255,255,255,0.92)",
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
              value={typeof value === "boolean" ? "" : value === "" ? "" : value}
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

  const lampHint = getHanaFeatherLampHint(element.id);
  const isSetting6RainbowLamp =
    isHanaSetting6GuaranteeElementId(element.id) && Number(value) > 0;

  return (
    <div className="space-y-1.5">
      <label
        className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${
          element.type === "counter" ? "block" : "block text-center"
        }`}
      >
        {lampHint
          ? `${formatBonusText(element.label)} (${lampHint})`
          : formatBonusText(element.label)}
      </label>

      <div className={element.type === "counter" ? "w-full" : "flex justify-center"}>
        {renderInput()}
      </div>

      {isSetting6RainbowLamp && (
        <div className="text-center text-xs font-bold text-red-500 animate-pulse mt-1">
          ※設定6濃厚として計算されます
        </div>
      )}
    </div>
  );
};

export default DynamicInput;
