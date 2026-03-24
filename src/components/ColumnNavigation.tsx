import { Link } from "react-router-dom";
import { ATTACHED_COLUMNS } from "../data/column-list";

interface Props {
  currentId: string;
}

const ColumnNavigation = ({ currentId }: Props) => {
  // 日付の降順（新しい順）にソート
  const sortedColumns = [...ATTACHED_COLUMNS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentIndex = sortedColumns.findIndex((col) => col.id === currentId);

  // 「次の記事」は現在の記事より新しいもの（インデックスが1小さい）
  const nextArticle = currentIndex > 0 ? sortedColumns[currentIndex - 1] : null;
  // 「前の記事」は現在の記事より古いもの（インデックスが1大きい）
  const prevArticle =
    currentIndex !== -1 && currentIndex < sortedColumns.length - 1
      ? sortedColumns[currentIndex + 1]
      : null;

  return (
    <nav className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* 次の記事（新しい記事）：左側 */}
        <div className="flex-1 min-w-0">
          {nextArticle ? (
            <Link
              to={nextArticle.path}
              className="group flex flex-col items-start gap-1 p-4 -m-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ← 次の記事
              </span>
              <span className="text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 truncate w-full">
                {nextArticle.title}
              </span>
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>

        {/* コラム一覧へ */}
        <div className="flex justify-center order-last md:order-none">
          <Link
            to="/columns"
            className="w-full md:w-auto px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm active:scale-95 text-center"
          >
            コラム一覧へ
          </Link>
        </div>

        {/* 前の記事（古い記事）：右側 */}
        <div className="flex-1 min-w-0 text-right">
          {prevArticle ? (
            <Link
              to={prevArticle.path}
              className="group flex flex-col items-end gap-1 p-4 -m-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                前の記事 →
              </span>
              <span className="text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 truncate w-full">
                {prevArticle.title}
              </span>
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default ColumnNavigation;
