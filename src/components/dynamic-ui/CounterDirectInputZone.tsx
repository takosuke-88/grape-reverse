import { useRef, useState } from "react";
import {
  COUNTER_COMPACT_FLEX,
  COUNTER_COMPACT_TEXT,
  COUNTER_COMPACT_ZONE_WIDTH_CLASS,
  COUNTER_DEFAULT_FLEX,
  COUNTER_DEFAULT_TEXT,
  COUNTER_DEFAULT_ZONE_WIDTH_CLASS,
  counterMinWidthForDigits,
  sanitizeCounterDigitString,
} from "./counter-layout";

const URBANIST = "'Urbanist', -apple-system, sans-serif";

export interface CounterDirectInputZoneProps {
  label: string;
  displayValue: string | number;
  inputValue: string;
  onInputChange: (rawDigits: string) => void;
  numFontSize: string;
  numberGlow: string;
  readOnly?: boolean;
  onDirectInput?: () => void;
  /** 狭いバー：固定タップ幅（文字揃えは常に左固定） */
  variant?: "default" | "compact";
  /** 最大桁数（超過分は入力ブロック） */
  maxDigits?: number;
  /** 想定桁数（min-width 最適化。未指定は 5 = 総G想定） */
  digitCapacity?: number;
  /** 数字・カーソル色（白背景時など明るい背景に対応するため。デフォルト: "#ffffff"） */
  textColor?: string;
}

export default function CounterDirectInputZone({
  label,
  displayValue,
  inputValue,
  onInputChange,
  numFontSize,
  numberGlow,
  readOnly = false,
  onDirectInput,
  variant = "default",
  maxDigits,
  digitCapacity = 5,
  textColor = "#ffffff",
}: CounterDirectInputZoneProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCompact = variant === "compact";

  const focusInput = () => {
    if (!readOnly) inputRef.current?.focus();
  };

  /** 幅制御のみ variant で切り分け。文字揃えは常に左固定 */
  const capacity = isCompact ? (maxDigits ?? digitCapacity) : digitCapacity;
  const zoneWidthClass = isCompact
    ? COUNTER_COMPACT_ZONE_WIDTH_CLASS
    : COUNTER_DEFAULT_ZONE_WIDTH_CLASS;
  const contentAlignClass = isCompact ? COUNTER_COMPACT_FLEX : COUNTER_DEFAULT_FLEX;
  const sharedTextPadding = isCompact ? COUNTER_COMPACT_TEXT : COUNTER_DEFAULT_TEXT;

  const digitTypography = `${numFontSize} font-black tabular-nums`;
  /**
   * compact: zone幅がそのまま上限なので min-width 不要（つけると zone を突き破る原因になる）
   * default: zone は flex-1 で可変なので min-width で最低幅を保証する
   */
  const minWidthClass = isCompact ? "" : counterMinWidthForDigits(capacity);
  /** span / input で完全同一: 左固定・右伸び */
  const numberSurfaceClass = `w-full ${minWidthClass} text-left ${digitTypography} ${sharedTextPadding}`;

  const textStyle = {
    fontFamily: URBANIST,
    color: textColor,
    textShadow: numberGlow,
  };

  const inputFocusedClass = `${numberSurfaceClass} m-0 box-border min-h-[76px] w-full cursor-text touch-manipulation border-0 bg-transparent focus:outline-none focus:ring-0`;

  const commitOrFallbackZero = () => {
    if (inputValue === "") {
      onInputChange("0");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitOrFallbackZero();
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    commitOrFallbackZero();
    setIsFocused(false);
  };

  return (
    <div
      className={`relative self-stretch ${zoneWidthClass}`}
      style={{ minHeight: "76px" }}
    >
      {/* タップ判定: compact は左2桁分（約40px）のみ、default はゾーン全体 */}
      <div
        className={`absolute left-0 top-0 h-full ${isCompact ? "w-[2.5rem]" : "w-full"} z-20`}
        onClick={() => {
          if (!isFocused) focusInput();
        }}
      />
      <div
        className={`flex h-full min-h-[76px] w-full items-center ${contentAlignClass}`}
      >
        {!isFocused && (
          <span
            className={`relative z-10 block ${numberSurfaceClass}`}
            style={textStyle}
          >
            {displayValue}
          </span>
        )}

        {!readOnly && (
          <form
            onSubmit={handleSubmit}
            className={isFocused ? "contents" : "sr-only"}
          >
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              maxLength={maxDigits}
              value={inputValue}
              onChange={(e) => {
                onInputChange(
                  sanitizeCounterDigitString(e.target.value, maxDigits),
                );
                onDirectInput?.();
              }}
              onFocus={() => {
                setIsFocused(true);
                requestAnimationFrame(() => {
                  const el = inputRef.current;
                  if (el) {
                    const len = el.value.length;
                    el.setSelectionRange(len, len);
                  }
                });
              }}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitOrFallbackZero();
                  inputRef.current?.blur();
                }
              }}
              className={inputFocusedClass}
              style={{
                ...textStyle,
                caretColor: textColor,
                WebkitAppearance: "none",
                appearance: "none",
              }}
              aria-label={`${label}を直接入力`}
            />
          </form>
        )}
      </div>
    </div>
  );
}
