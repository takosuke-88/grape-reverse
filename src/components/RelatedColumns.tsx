import { Link } from "react-router-dom";
import { ATTACHED_COLUMNS } from "../data/column-list";

interface RelatedColumnsProps {
  currentId: string;
}

const RelatedColumns = ({ currentId }: RelatedColumnsProps) => {
  // 現在の記事を除外し、最新の3件を取得
  const related = ATTACHED_COLUMNS
    .filter((col) => col.id !== currentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-12">
      <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-white flex items-center gap-2">
        <span className="text-indigo-500">📖</span> こちらのコラムもおすすめ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((col) => (
          <Link
            key={col.id}
            to={col.path}
            className="group flex flex-col bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex gap-2 mb-3">
                {col.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <h3 className="text-base font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {col.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                {col.description}
              </p>
              <div className="mt-auto text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                続きを読む <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedColumns;
