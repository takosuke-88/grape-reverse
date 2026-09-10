// 差枚数（台メーター）の符号トグル。
//
// 台メーターはマイナスが日常的に発生するため、カウンターには絶対値を入力し、
// 符号はこのトグルが持つ（差枚 = 絶対値 × 符号）。カウンターバー本体
// （DynamicInput）の構造・行高76pxには一切手を入れない方針。
//
// 【レイアウト】このコンポーネントはトグル本体だけを返す。見出し（h2）と配置は
// ページ側が持ち、カードを relative にして absolute right-4 top-3 で見出し右の
// 余白へ重ねる。行として置くとカードが52px縦に伸びるため（2026-09-10変更）。
// 寸法は小役カウンターページの CurrentPreviousToggle と統一: 全体204x52px、
// ボタンは w-24 (96px) x 44px。片方を変えるならもう片方も合わせること。
//
// 【あとから変更する場合の勘所】
//  - 配色・文言・記号 → SIGN_OPTIONS の1行を書き換える
//  - 寸法            → BUTTON の w-24 / min-h-[44px]（CurrentPreviousToggle と共通）

export type DiffSign = 1 | -1;

/** localStorage 上の符号キー（値: 1 | -1。キーが無い既存データは + 扱い） */
export const DIFF_SIGN_KEY = "diff-coins-sign";

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
            className={`flex w-24 min-h-[44px] items-center justify-center gap-1.5 rounded-lg touch-manipulation transition-all active:scale-95 ${
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
  );
}
