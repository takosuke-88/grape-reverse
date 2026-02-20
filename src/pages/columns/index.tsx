import { Link } from "react-router-dom";
import { ATTACHED_COLUMNS } from "../../data/column-list";

const ColumnIndexPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-12">
      <header className="bg-indigo-600 p-4 text-white shadow-md">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <Link
            to="/"
            className="font-bold text-sm sm:text-base hover:underline flex items-center gap-1"
          >
            <span>←</span> ホームに戻る
          </Link>
          <div className="text-sm font-bold opacity-90">
            GrapeReverse コラム一覧
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-white">
            パチスロ攻略コラム
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            データと数学から導き出された、ジャグラー・ハナハナの「本当の狙い方」
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ATTACHED_COLUMNS.map((col) => (
            <Link
              key={col.id}
              to={col.path}
              className="group flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {col.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="px-2 py-1 text-slate-400 text-xs ml-auto">
                    {col.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {col.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                  {col.description}
                </p>
                <div className="mt-auto flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  記事を読む <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ColumnIndexPage;
