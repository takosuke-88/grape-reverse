import React, { useState } from "react";
import type { DiscriminationElement } from "../../types/machine-schema";
import { formatBonusText } from "../../utils/formatters";

interface DynamicInputProps {
  element: DiscriminationElement;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
  totalGames?: number;
  vibrationEnabled?: boolean;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  element,
  value,
  onChange,
  totalGames,
  vibrationEnabled = true,
}) => {
  const [showFloat, setShowFloat] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showDirectInput, setShowDirectInput] = useState(false);

  const calculateProbability = () => {
    if (element.type !== "counter" || !totalGames || totalGames === 0) return null;
    const count = Number(value) || 0;
    if (count === 0) return null;
    return totalGames / count;
  };

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
    triggerVibration("inc");
    setShowGlow(true);
    setShowFloat(true);
    setTimeout(() => setShowGlow(false), 450);
    setTimeout(() => setShowFloat(false), 620);
  };

  const handleDecrement = () => {
    if (element.isReadOnly) return;
    onChange((Number(value) || 0) - 1);
    triggerVibration("dec");
  };

  const currentProbability = calculateProbability();

  const renderInput = () => {
    switch (element.type) {
      case "counter": {
        const displayValue = Number(value) || 0;
        return (
          <div
            className="relative flex w-full rounded-xl overflow-hidden select-none"
            style={{
              minHeight: "76px",
              background: element.isReadOnly ? "#1e293b" : "#0f172a",
            }}
          >
            {/* LEFT 30%: minus button + number display */}
            <div className="flex items-center" style={{ width: "30%" }}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!!element.isReadOnly}
                className="h-full flex items-center justify-center text-2xl text-slate-300 transition-all active:scale-95"
                style={{
                  minWidth: "48px",
                  opacity: element.isReadOnly ? 0.2 : 1,
                  background: element.isReadOnly
                    ? "transparent"
                    : "linear-gradient(145deg, #182232, #0b1622)",
                  boxShadow: element.isReadOnly
                    ? "none"
                    : "inset 2px 2px 4px rgba(255,255,255,0.06), inset -1px -1px 3px rgba(0,0,0,0.7), 3px 3px 8px rgba(0,0,0,0.55), -1px -1px 2px rgba(255,255,255,0.03)",
                  borderRadius: "0",
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
                    value={
                      typeof value === "boolean" ? "" : value === "" ? "" : value
                    }
                    onChange={(e) => {
                      if (e.target.value === "") onChange("");
                      else onChange(parseInt(e.target.value) || 0);
                    }}
                    onBlur={() => setShowDirectInput(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setShowDirectInput(false);
                      }
                    }}
                    className="w-full text-center text-3xl font-bold bg-transparent text-white focus:outline-none tabular-nums"
                    style={{ maxWidth: "72px" }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (!element.isReadOnly) setShowDirectInput(true);
                    }}
                    className={`text-3xl font-bold tabular-nums transition-all ${
                      element.isReadOnly
                        ? "text-slate-500"
                        : showGlow
                        ? "text-white counter-number-glow cursor-pointer"
                        : "text-white counter-number cursor-pointer"
                    }`}
                  >
                    {displayValue}
                  </span>
                )}
              </div>
            </div>

            {/* 縦区切り線 */}
            <div
              className="absolute top-3 bottom-3 w-px bg-slate-700"
              style={{ left: "30%" }}
            />

            {/* RIGHT 70%: tap area */}
            <div
              className={`relative flex items-center justify-end ${
                element.isReadOnly
                  ? "pointer-events-none"
                  : "cursor-pointer active:bg-white/[0.04]"
              }`}
              style={{ width: "70%" }}
              onClick={handleIncrement}
            >
              {showFloat && (
                <span
                  className="counter-float-anim absolute text-green-400 font-bold text-xl"
                  style={{
                    left: "40%",
                    top: "50%",
                    zIndex: 10,
                  }}
                >
                  +1
                </span>
              )}
              <span
                className="text-3xl font-thin text-slate-600 pr-4 pointer-events-none"
                style={{ opacity: element.isReadOnly ? 0.2 : 0.4 }}
              >
                ＋
              </span>
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
      {element.type === "counter" ? (
        <div className="flex items-center justify-between px-0.5 mb-1">
          <label className="text-sm font-bold text-gray-800 dark:text-slate-200">
            {formatBonusText(element.label)}
          </label>
          {element.id !== "total-games" && (
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              現在:{" "}
              {currentProbability
                ? `1/${currentProbability.toFixed(1)}`
                : "---"}
            </span>
          )}
        </div>
      ) : (
        <label className="block text-center text-sm font-bold text-gray-800 dark:text-slate-200">
          {formatBonusText(element.label)}
        </label>
      )}

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
