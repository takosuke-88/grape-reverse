// 現在／前任者 の切り替えトグル。
//
// 小役カウンターページの「基本データ」カード見出し行の余白に置く。
// 逆算ページの台メーターにある DiffSignToggle と同じ見た目・同じ寸法・同じ位置
// （右端揃え）に合わせてある。実測: 全体 204px × 52px、ボタン高44px。
//   - container : p-1 (4px×2) + gap-1 (4px) → ボタン2つで 192px
//   - button    : w-24 (96px) × 2 = 192px  →  合計 204px
// 幅を変える場合は DiffSignToggle 側の実測値と合わせること。
//
// 現在＝このページ、前任者＝前任者タブ（/:machineId/prev）への遷移。
// 色は前任者タブのナビボタン（amber-600）と揃えている。

import { Link } from "react-router-dom";

interface CurrentPreviousToggleProps {
  machineId: string;
  /** 現在どちら側の画面にいるか */
  active: "current" | "previous";
}

const BUTTON_BASE =
  "flex w-24 min-h-[44px] items-center justify-center rounded-lg text-sm touch-manipulation transition-all active:scale-95";
const ACTIVE_TEXT = "font-black text-white shadow-md";
const INACTIVE_TEXT = "font-bold text-slate-400 dark:text-slate-500";

export default function CurrentPreviousToggle({
  machineId,
  active,
}: CurrentPreviousToggleProps) {
  const isCurrent = active === "current";

  return (
    <div
      role="group"
      aria-label="表示するデータ"
      className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
    >
      {isCurrent ? (
        <span
          aria-current="page"
          className={`${BUTTON_BASE} bg-indigo-600 ${ACTIVE_TEXT}`}
        >
          現在
        </span>
      ) : (
        <Link to={`/${machineId}`} className={`${BUTTON_BASE} ${INACTIVE_TEXT}`}>
          現在
        </Link>
      )}

      {isCurrent ? (
        <Link
          to={`/${machineId}/prev`}
          className={`${BUTTON_BASE} ${INACTIVE_TEXT}`}
        >
          前任者
        </Link>
      ) : (
        <span
          aria-current="page"
          className={`${BUTTON_BASE} bg-amber-600 ${ACTIVE_TEXT}`}
        >
          前任者
        </span>
      )}
    </div>
  );
}
