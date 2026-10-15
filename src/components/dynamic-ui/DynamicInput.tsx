import React, { useRef, useState } from "react";
import type { BarThemeName, DiscriminationElement } from "../../types/machine-schema";
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
  /** 確率テキストを強制上書き（例: total-games の合成確率表示） */
  overrideProbText?: string;
  /**
   * 確率計算に使う回数（未指定ならバーに表示中の値をそのまま使う）。
   * 設定判別ページで前任者分を差し引いた回数を渡すための口。バーに表示する
   * 数字（生の入力値）は変えずに、確率だけ詳細判別と同じ基準に揃える。
   */
  probCount?: number;
  /**
   * 確率テキストの「上」に重ねる小さな一行（例: total-games の「設定5かも？」）。
   * probText（absolute right-2 bottom-1.5）の座標・スタイルには一切触れず、
   * 独立した absolute 要素として置く。バーの行高76pxは変わらない。
   * 位置が right-2 top-1.5（上端）なのは、バー上下中央にある ＋ グリフ
   * （text-2xl）と重なるため。bottom 側へ寄せると ＋ の上に文字が乗る。
   */
  aboveProbText?: string;
  /** カード単位の配色の上書き（ConfigSection.barTheme） */
  barTheme?: BarThemeName;
}

interface ElementTheme {
  bg: string;
  minusBg: string;
  accent: string;
  /** 背景が明るい（白・黄など）場合に数字色を暗くするためのオーバーライド */
  textColor?: string;
  /** 虹グラデーション用のbgはinlineスタイルで上書き */
  bgStyle?: React.CSSProperties;
  /** ＋エリアの文字（＋・確率）の色。＋エリアだけ明るい色のとき用。未指定なら textColor */
  plusTextColor?: string;
  /** 数字だけの色。−・＋と別の色にしたいとき用。未指定なら textColor */
  digitColor?: string;
}

/**
 * カード単位の配色（ConfigSection.barTheme。2026-10-14、スマスロ ハナビの詳細判別）。
 * minusBg は＋エリアの背景（歴史的経緯の名前。−側は透明）。
 */
const BAR_THEMES: Record<BarThemeName, ElementTheme> = {
  // 花火チャレンジ: RB（#1d4ed8）より暗く、紺寄りの青
  darkBlue: {
    bg: "#1e3a8a",
    minusBg: "linear-gradient(145deg, #172f6e, #0f1f4d)",
    accent: "#bfdbfe",
  },
  // 花火GAME: BB（#b91c1c）より暗い赤
  darkRed: {
    bg: "#7f1d1d",
    minusBg: "linear-gradient(145deg, #651717, #4a1010)",
    accent: "#fecaca",
  },
  // BBの契機（ドンBB）: 青と黄色のツートン（バー全体が青、＋が黄色）
  blueYellow: {
    bg: "#1d4ed8",
    minusBg: "linear-gradient(145deg, #facc15, #eab308)",
    accent: "#fef08a",
    plusTextColor: "#422006",
  },
  // RBの契機（スマスロ ハナビ）・REGの契機（スマスロ タコスロ）: 灰色
  gray: {
    bg: "#64748b",
    minusBg: "linear-gradient(145deg, #4b5563, #374151)",
    accent: "#e2e8f0",
  },
  // スマスロ タコスロのBIGの契機（白7BB）: 白地に赤い＋・−、数字は濃いグレー（2026-10-15 ユーザー指定）。
  // 白はハナハナの白ランプと同じ slate-200（真っ白だとライトモードのカード背景に溶ける）
  whiteRed: {
    bg: "#e2e8f0",
    minusBg: "linear-gradient(145deg, #cbd5e1, #94a3b8)",
    accent: "#fecaca",
    textColor: "#dc2626",
    // 赤い数字は毒々しいため、数字だけハナハナの白ランプと同じ濃いグレー（ユーザー指定）
    digitColor: "#1e293b",
  },
};

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
  if (id === "bell-count") {
    return {
      bg: "#f59e0b",
      minusBg: "linear-gradient(145deg, #d97706, #b45309)",
      accent: "#fffbeb",
      textColor: "#ffffff",
    };
  }

  // 設定示唆カウンター（hint-*。2026-10-05）。ID に big/reg を含んでも
  // ボーナスの赤・青にならないよう、それらより先にマッチさせる
  if (id.startsWith("hint-")) {
    return {
      bg: "#6d28d9",
      minusBg: "linear-gradient(145deg, #5b21b6, #4c1d95)",
      accent: "#ede9fe",
    };
  }
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
  // スマスロ ハナビの風鈴（設定判別ページの合計・詳細判別ページの内訳とも。2026-10-14）は
  // 明るい黄色。白い数字では読めないため数字は濃い茶色。BBの契機「風鈴A」
  // （big-don-furin-count）は上の big 判定で赤になる。
  if (id.includes("furin")) {
    return {
      bg: "#facc15",
      minusBg: "linear-gradient(145deg, #eab308, #ca8a04)",
      accent: "#713f12",
      textColor: "#422006",
    };
  }
  // スマスロ ハナビの氷（2026-10-14、ユーザー指定）: 緑の単色。
  // （上半分白・下半分緑のグラデーション＋赤線も試したが、ユーザー判断で単色に戻した）
  if (id.startsWith("ice-")) {
    return {
      bg: "#22c55e",
      minusBg: "linear-gradient(145deg, #16a34a, #15803d)",
      accent: "#14532d",
      textColor: "#14532d",
    };
  }
  // スマスロ タコスロの通常時小役（2026-10-15）。BIG/REGの契機（big-w7-plum-count 等）は
  // 上の big/reg 判定が先に当たるので赤・青のまま
  if (id.includes("plum")) {
    return {
      bg: "#a21caf",
      minusBg: "linear-gradient(145deg, #86198f, #701a75)",
      accent: "#f5d0fe",
    };
  }
  if (id.includes("suika")) {
    return {
      bg: "#15803d",
      minusBg: "linear-gradient(145deg, #0f6030, #0a4a24)",
      accent: "#bbf7d0",
    };
  }
  if (id.includes("cherry")) {
    return {
      bg: "#be185d",
      minusBg: "linear-gradient(145deg, #9d154d, #7a1040)",
      accent: "#fbcfe8",
    };
  }
  if (id === "diff-coins") {
    return {
      bg: "#78350f",
      minusBg: "linear-gradient(145deg, #5c2a0c, #3f1a07)",
      accent: "#fde68a",
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
  overrideProbText,
  probCount,
  barTheme,
  aboveProbText,
}) => {
  // 「＋1」「−1」の飛び出し演出。dir: 1 = 上へ（加算）/ -1 = 下へ（減算）
  const [floats, setFloats] = useState<{ id: number; dir: 1 | -1 }[]>([]);
  const floatIdRef = useRef(0);
  const [showGlow, setShowGlow] = useState(false);

  /** 連打した回数分だけバッジを積み上げる（1つのbooleanで使い回さない） */
  const pushFloat = (dir: 1 | -1) => {
    const floatId = ++floatIdRef.current;
    setFloats((prev) => [...prev, { id: floatId, dir }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== floatId));
    }, 750);
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
    setTimeout(() => setShowGlow(false), 450);
    pushFloat(1);
  };

  const handleDecrement = () => {
    if (element.isReadOnly) return;
    // 実際に減る場合のみ「−1」を出す（0のときや履歴切れで見た目だけ減るのを防ぐ）
    const current = Number(value) || 0;
    if (onDecrement) {
      onDecrement();
      triggerVibration("dec");
      if (current > 0) pushFloat(-1);
      return;
    }
    if (current <= 0) return;
    onChange(current - 1);
    triggerVibration("dec");
    pushFloat(-1);
  };

  const theme = barTheme ? BAR_THEMES[barTheme] : getElementTheme(element.id);

  const renderInput = () => {
    switch (element.type) {
      case "counter": {
        const displayValue = Number(value) || 0;
        // 確率の分母に使う回数。probCount が来ていればそれを優先する
        // （前任者分を差し引いた回数。バーに出る displayValue は変えない）。
        const probValue = probCount ?? displayValue;
        // 設定示唆カウンター（impliedSettings 付き）は「出たか否か」が意味を持つ
        // 項目で、ゲーム数に対する確率は判別に使わないため出さない
        const showProb =
          element.id !== "total-games" &&
          !element.impliedSettings &&
          !element.hideProb &&
          totalGames != null &&
          totalGames > 0 &&
          probValue > 0;
        const autoProbText = showProb
          ? `1/${(totalGames! / probValue).toFixed(1)}`
          : null;
        const probText = overrideProbText ?? autoProbText;
        const useCompact =
          compactLayout || isGridOnlyCompactCounterId(element.id);
        const maxDigits = getCounterMaxDigits(element.id);
        const digitCapacity = getCounterDigitCapacity(element.id, useCompact);
        const numFontSize = useCompact ? "text-2xl" : "text-3xl";

        const clampCounter = (n: number) =>
          clampCounterValueByElementId(element.id, n);

        // 数字が濃い色のバー（ハナハナの白ランプ・ハナビの風鈴/氷）は、濃い色の発光だと
        // 数字の周りが黒く滲んで見える（2026-10-14 ユーザー指摘）。普段は発光させず、
        // ＋で加算した瞬間だけ白く光らせる（加算フィードバックは textShadow が担う設計のため残す）。
        // ＋エリアの文字色（＋・確率）。＋エリアだけ明るいツートン配色では別の色にする
        const plusTextColor = theme.plusTextColor ?? theme.textColor;
        const darkDigits = !!theme.textColor && theme.textColor !== "#ffffff";
        const dynamicGlow = darkDigits
          ? showGlow
            ? "0 0 12px #ffffff, 0 0 24px #ffffff"
            : "none"
          : showGlow
            ? `0 0 20px ${theme.accent}, 0 0 40px ${theme.accent}, 0 0 60px ${theme.accent}`
            : `0 0 10px ${theme.accent}cc, 0 0 22px ${theme.accent}88`;

        return (
          // 外側はoverflow-hiddenを持たない。「+1」は枠外（画面上方向）まで
          // 飛び出す演出のため、角丸クリップ用のoverflow-hiddenは内側のみに限定する。
          <div className="relative w-full min-w-0 max-w-full select-none">
          <div
            className="relative flex w-full min-w-0 max-w-full rounded-xl overflow-hidden"
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
                  background: "transparent",
                  color: theme.textColor ?? "#ffffff",
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
                textColor={theme.digitColor ?? theme.textColor ?? "#ffffff"}
              />
            </div>

            {/* 右: プラスエリア */}
            <div
              className={`relative flex min-w-0 flex-1 items-center justify-end ${
                element.isReadOnly ? "pointer-events-none" : "cursor-pointer"
              }`}
              onClick={handleIncrement}
            >
              {/* ＋の視覚装飾のみ。クリック判定は外側の横長＋エリアが担う（pointer-events-none）。
                  compact時は親＋エリアが48pxより狭く縮むため w-full で親幅に追従し、はみ出しを防ぐ。 */}
              <div
                className={`pointer-events-none absolute right-0 top-0 flex h-full items-center justify-center ${
                  useCompact ? "w-full" : COUNTER_MINUS_WIDTH_CLASS
                }`}
                style={{
                  background: element.isReadOnly ? "transparent" : theme.minusBg,
                  boxShadow: element.isReadOnly
                    ? "none"
                    // 外側drop shadowのみX反転（-3px）。右端配置では右方向の影が
                    // 親のoverflow-hiddenで切られるため、左下＝カード内側へ落とす。
                    : "inset 2px 2px 4px rgba(255,255,255,0.10), inset -1px -1px 3px rgba(0,0,0,0.5), -3px 3px 8px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.05)",
                }}
              >
                <span
                  className="text-2xl pointer-events-none select-none"
                  style={{ color: plusTextColor ? `${plusTextColor}cc` : "rgba(255,255,255,0.8)" }}
                >
                  ＋
                </span>
              </div>
              {aboveProbText && (
                <span
                  className="absolute right-2 top-1 text-sm font-bold pointer-events-none select-none whitespace-nowrap"
                  style={{
                    color: plusTextColor
                      ? `${plusTextColor}cc`
                      : "rgba(255,255,255,0.78)",
                    fontFamily: "'Urbanist', -apple-system, sans-serif",
                  }}
                >
                  {aboveProbText}
                </span>
              )}
              {probText && (
                <span
                  className="absolute right-2 bottom-1.5 text-lg italic font-black tabular-nums pointer-events-none select-none"
                  style={{
                    color: plusTextColor ? `${plusTextColor}ee` : "rgba(255,255,255,0.92)",
                    fontFamily: "'Urbanist', -apple-system, sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {probText}
                </span>
              )}
            </div>
          </div>
          {floats.map((f) => (
            <span
              key={f.id}
              className="counter-float-anim absolute rounded-full px-2.5 py-0.5 font-black text-lg leading-none pointer-events-none"
              style={{
                // どちらも上へ飛ばす（下方向はタップしている指で隠れて見えないため）。
                // 起点だけ押したボタンの真上に置いて＋/−を区別する。
                left: f.dir === 1 ? "72%" : "24px",
                top: "50%",
                // バーの外（明るいカード背景）まで飛び出すため、白文字だけだと
                // ライトモードで消えて見える。バー本体と同じ濃色のピル背景を敷き、
                // 影で輪郭を出すことで背景色に依存せず視認できるようにする。
                background: theme.bg,
                color: theme.textColor ?? "#ffffff",
                boxShadow: `0 2px 10px rgba(0,0,0,0.35), 0 0 14px ${theme.accent}`,
                zIndex: 10,
              }}
            >
              {f.dir === 1 ? "+1" : "−1"}
            </span>
          ))}
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

  const lampHint =
    getHanaFeatherLampHint(element.id) ?? element.hintLabelShort ?? element.hintLabel;
  const isSetting6RainbowLamp =
    isHanaSetting6GuaranteeElementId(element.id) && Number(value) > 0;
  // 設定示唆カウンター（2026-10-05）。数えられている間は判別へ反映していることを示す
  const impliedNotice =
    element.impliedSettings && element.hintLabel && Number(value) > 0
      ? (element.hintNotice ?? `※${element.hintLabel}として計算されます`)
      : null;

  return (
    <div className="space-y-1.5">
      <label
        className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${
          element.type === "counter" ? "block" : "block text-center"
        }`}
      >
        {/* formatBonusText は配列（React要素）を返すため、テンプレート文字列に入れると
            「,[object Object],後 虹」のように崩れる。JSXのまま並べる（2026-10-05修正。
            ラベルにBIG/REGを含むランプ要素＝ドラゴンハナハナの「BIG後 虹」等で発生していた） */}
        {formatBonusText(element.label)}
        {lampHint && ` (${lampHint})`}
      </label>

      <div className={element.type === "counter" ? "w-full" : "flex justify-center"}>
        {renderInput()}
      </div>

      {isSetting6RainbowLamp && (
        <div className="text-center text-xs font-bold text-red-500 animate-pulse mt-1">
          ※設定6濃厚として計算されます
        </div>
      )}
      {impliedNotice && (
        <div className="text-center text-xs font-bold text-red-500 mt-1">
          {impliedNotice}
        </div>
      )}
    </div>
  );
};

export default DynamicInput;
