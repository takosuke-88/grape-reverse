/** 30:70 スプリットカウンター共通レイアウト定数 */

/**
 * カウンターの操作ヒント文（2026-09-13）。
 * 小役カウンターページ・ぶどう/ベル逆算ページとも、一番上のカード（基本データ＝
 * 総ゲーム数）1枚にだけ表示する。以降のカードは操作方法が同じなので繰り返さない。
 * ページごとに書き分けると表記が割れるため（`📴 OFF` の統一漏れの前例あり）、
 * 文言はこの定数へ集約している。
 */
export const COUNTER_HINT_TEXT =
  "－ タップで減算　数字タップで直接入力　＋ タップで加算";

/** 操作ヒント文の共通クラス（表示位置・字面を2ページで揃える） */
export const COUNTER_HINT_CLASS =
  "mt-3 text-center text-xs text-slate-400 dark:text-slate-500";

/** マイナスボタン幅（固定） */
export const COUNTER_MINUS_WIDTH_CLASS = "w-12 shrink-0";

/** 狭いバー用：数字タップゾーン幅（4桁対応 = 80px） */
export const COUNTER_COMPACT_ZONE_WIDTH_CLASS = "w-20 shrink-0";


/** マイナス右端〜数字ゾーン左端の固定余白（コンパクト） */
export const COUNTER_COMPACT_PAD_FROM_MINUS = "pl-3";

/** 狭いバー：flex コンテナ用（左固定・右伸び） */
export const COUNTER_COMPACT_FLEX = `${COUNTER_COMPACT_PAD_FROM_MINUS} justify-start`;

/** 狭いバー：span / input 用（左固定・右伸び） */
export const COUNTER_COMPACT_TEXT = `${COUNTER_COMPACT_PAD_FROM_MINUS} text-left`;

/** 長いバー：マイナス右端〜数字左端の固定余白 */
export const COUNTER_DEFAULT_PAD_FROM_MINUS = "pl-3";

/** 長いバー：flex コンテナ用（左端固定） */
export const COUNTER_DEFAULT_FLEX = `${COUNTER_DEFAULT_PAD_FROM_MINUS} justify-start`;

/** 長いバー：span / input 用 */
export const COUNTER_DEFAULT_TEXT = `${COUNTER_DEFAULT_PAD_FROM_MINUS} text-left`;

/** 長いバー：数字ゾーン（マイナス右〜ゾーン右端いっぱい） */
export const COUNTER_DEFAULT_ZONE_WIDTH_CLASS = "flex-1 w-full";

/** 想定桁数から数字面の最小幅クラスを返す（default 用） */
export function counterMinWidthForDigits(digits: number): string {
  if (digits >= 5) return "min-w-[8rem]";
  if (digits >= 4) return "min-w-[6.5rem]";
  if (digits >= 3) return "min-w-[4.5rem]";
  return "min-w-[3rem]";
}

/**
 * 2列グリッド内のボーナス内訳のみコンパクト。
 * 総G・差枚・1列ぶどう・BIG/REG合計は default（左端固定・長いバー）。
 */
export function isGridOnlyCompactCounterId(elementId: string): boolean {
  return /^(big|reg)-(solo|cherry|unknown)-count$/.test(elementId);
}

/** BIG/REG 本数および詳細内訳（最大3桁=999） */
export function isThreeDigitBonusCounterId(elementId: string): boolean {
  return (
    elementId === "big-count" ||
    elementId === "reg-count" ||
    isGridOnlyCompactCounterId(elementId)
  );
}

/** カウンター要素の最大桁数（undefined = 制限なし） */
export function getCounterMaxDigits(elementId: string): number | undefined {
  if (elementId === "total-games") return 5;
  if (elementId === "diff-coins") return 5;
  if (isThreeDigitBonusCounterId(elementId)) return 3;
  if (
    elementId === "grape-count" ||
    elementId === "bell-count" ||
    elementId === "cherry-count"
  ) {
    return 4;
  }
  return undefined;
}

/** 表示幅最適化用の想定桁数 */
export function getCounterDigitCapacity(
  elementId: string,
  useCompact: boolean,
): number {
  if (useCompact) return 3;
  return getCounterMaxDigits(elementId) ?? 4;
}

/** 最大桁数に応じた数値上限（例: 3桁→999） */
export function counterMaxValueForDigits(maxDigits: number): number {
  return 10 ** maxDigits - 1;
}

/** 要素IDに応じて 0〜上限にクランプ */
export function clampCounterValueByElementId(
  elementId: string,
  n: number,
): number {
  const maxDigits = getCounterMaxDigits(elementId);
  if (maxDigits == null) return Math.max(0, n);
  const cap = counterMaxValueForDigits(maxDigits);
  return Math.min(cap, Math.max(0, n));
}

/** 数字文字列をサニタイズし最大桁数で切り詰め */
export function sanitizeCounterDigitString(
  raw: string,
  maxDigits?: number,
): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (maxDigits == null) return digits;
  return digits.slice(0, maxDigits);
}
