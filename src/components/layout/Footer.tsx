import { Link } from "react-router-dom";
import { AVAILABLE_MACHINES } from "../../data/machine-list";

export default function Footer() {
  const jugglerMachines = AVAILABLE_MACHINES.filter(
    (m) => m.category === "juggler",
  );
  const hanahanaMachines = AVAILABLE_MACHINES.filter(
    (m) => m.category === "hana",
  );

  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm">
          {/* カラム1: サイトについて */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-pink-500">🍇</span> grape-reverse
            </h3>
            <p className="leading-relaxed text-slate-400">
              設定判別ツールの決定版。
              <br />
              ベイズ推定などの高度な数学ロジックと、実戦データに基づいた精度の高い攻略情報・推測ツールを無料で提供しています。
            </p>
          </div>

          {/* カラム2: 機種一覧 */}
          <div>
            <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">
              機種一覧
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-pink-400 font-bold mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500 block"></span>{" "}
                  ジャグラーシリーズ
                </h4>
                <ul className="flex flex-col gap-1.5 pl-3">
                  {jugglerMachines.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={`/${m.id}`}
                        className="hover:text-white transition-colors block"
                      >
                        {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-bold mb-2 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 block"></span>{" "}
                  ハナハナシリーズ
                </h4>
                <ul className="flex flex-col gap-1.5 pl-3">
                  {hanahanaMachines.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={`/${m.id}`}
                        className="hover:text-white transition-colors block"
                      >
                        {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* カラム3: メニュー */}
          <div>
            <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">
              メニュー
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to="/columns"
                  className="hover:text-white transition-colors"
                >
                  攻略コラム一覧
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  免責事項
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/10 text-xs text-slate-500">
          <p className="mb-2">
            当サイトのコード・データ・コラム等の無断転載・使用は固く禁じます。
          </p>
          <p>Copyright &copy; 2026 grape-reverse.com All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
