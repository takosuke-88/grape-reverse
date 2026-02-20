import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-bold text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-pink-500">🍇</span> grape-reverse
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base font-bold text-slate-300">
          <Link
            to="/#juggler"
            className="hover:text-pink-400 transition-colors"
          >
            ジャグラー
          </Link>
          <Link to="/#hana" className="hover:text-red-400 transition-colors">
            ハナハナ
          </Link>
          <Link
            to="/columns"
            className="hover:text-indigo-400 transition-colors"
          >
            攻略コラム
          </Link>
        </nav>
      </div>
    </header>
  );
}
