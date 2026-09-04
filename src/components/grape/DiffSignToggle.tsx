// 差枚数（台メーター）の符号トグル。
//
// 台メーターはマイナスが日常的に発生するため、カウンターには絶対値を入力し、
// 符号はこのトグルが持つ（差枚 = 絶対値 × 符号）。カウンターバー本体
// （DynamicInput）の構造・行高76pxには一切手を入れない方針。
//
// 【暫定レイアウト】見出しとトグルを1行に並べている。375px でカード内側 311px、
// 見出し「差枚数（台メーター）」は実測132pxあり、記号＋語のトグル204.3pxと
// 並べると390pxでも溢れる。そのため見出しを「台メーター」(66px)へ短縮した。
// 直下の DynamicInput ラベルが「差枚数（プラス/マイナス）」を表示するため、
// 見出し側の「差枚数」は重複であり落としても情報は失われない。
//
// 【あとから変更する場合の勘所】
//  - 配色・文言・記号      → SIGN_OPTIONS の1行を書き換える
//  - 見出し文言            → HEADING を書き換える（長くすると1行に収まらなくなる）
//  - 縦積み（全幅2分割）へ → ヘッダーの div を分解し、トグル側 div を
//                            "grid grid-cols-2 gap-1" にする。ボタンは150x44になる。
//  - 折り返し防止          → flex-nowrap / shrink-0 / min-w-0 truncate の3点セット。
//                            限界時は見出しが省略され、二段にはならない。

export type DiffSign = 1 | -1;

/** localStorage 上の符号キー（値: 1 | -1。キーが無い既存データは + 扱い） */
export const DIFF_SIGN_KEY = "diff-coins-sign";

/** 見出し文言。長くすると375pxで1行に収まらなくなる（上記コメント参照） */
const HEADING = "台メーター";

/**
 * 選択中の側だけを塗りつぶし＋白の極太文字で強調し、非選択側は背景なしの
 * グレー細字まで落とす。色に頼らず「塗りの有無」で現在の状態が分かるようにする。
 * 赤を使わないのは coding-style.md §2 で赤＝破壊的操作（リセット）専用のため。
 */
const SIGN_OPTIONS: ReadonlyArray<{
  sign: DiffSign;
  glyph: string;
  label: string;
  activeClass: string;
}> = [
  { sign: 1, glyph: "＋", label: "プラス", activeClass: "bg-emerald-600" },
  { sign: -1, glyph: "−", label: "マイナス", activeClass: "bg-blue-600" },
];

interface DiffSignToggleProps {
  sign: DiffSign;
  onChange: (sign: DiffSign) => void;
}

export default function DiffSignToggle({ sign, onChange }: DiffSignToggleProps) {
  return (
    <div className="mb-2 flex flex-nowrap items-center justify-between gap-2">
      <h2 className="min-w-0 truncate text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
        {HEADING}
      </h2>

      <div
        role="group"
        aria-label="差枚数の符号"
        className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
      >
        {SIGN_OPTIONS.map((opt) => {
          const isActive = sign === opt.sign;
          return (
            <button
              key={opt.sign}
              type="button"
              onClick={() => onChange(opt.sign)}
              aria-pressed={isActive}
              className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 touch-manipulation transition-all active:scale-95 ${
                isActive
                  ? `${opt.activeClass} font-black text-white shadow-md`
                  : "font-bold text-slate-400 dark:text-slate-500"
              }`}
            >
              <span className="text-xl leading-none">{opt.glyph}</span>
              <span className="text-sm">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
