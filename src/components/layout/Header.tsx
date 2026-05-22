import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="font-bold text-white flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="text-pink-500 text-lg">🍇</span>
          <span className="flex flex-col leading-tight text-base min-[440px]:flex-row min-[440px]:items-center min-[440px]:gap-1">
            <span>Grape</span>
            <span>Reverse</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-bold text-slate-300 whitespace-nowrap shrink-0">
          <Link to="/#juggler" className="hover:text-pink-400 transition-colors">
            ジャグラー
          </Link>
          <Link to="/#hana" className="hover:text-red-400 transition-colors">
            ハナハナ
          </Link>
          <Link to="/columns" className="hover:text-indigo-400 transition-colors">
            攻略コラム
          </Link>
        </nav>
      </div>
    </header>
  );
}
