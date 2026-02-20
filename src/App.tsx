import { BrowserRouter, Routes, Route } from "react-router-dom";
import MachinePagePreview from "./pages/MachinePagePreview";
import { AVAILABLE_MACHINES } from "./data/machine-list";
import MyJugglerColumn from "./pages/columns/myjuggler5-setting6-behavior";
import Funky2Column from "./pages/columns/funky2-setting6-behavior";
import ColumnIndexPage from "./pages/columns/index";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* v2: Schema-driven UI プレビュー - 互換性のため残す */}
        <Route path="/v2/preview/:machineId" element={<MachinePagePreview />} />

        {/* 本番用ルート: /myjuggler5 など */}
        <Route path="/:machineId" element={<MachinePagePreview />} />

        {/* コラム記事 */}
        <Route path="/columns" element={<ColumnIndexPage />} />
        <Route
          path="/columns/myjuggler5-setting6-behavior"
          element={<MyJugglerColumn />}
        />
        <Route
          path="/columns/funky2-setting6-behavior"
          element={<Funky2Column />}
        />

        {/* デフォルトルート */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="text-center w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                  GrapeReverse
                </h1>
                <p className="text-slate-600 mb-6">
                  ジャグラー・ハナハナ・Aタイプ設定判別ツール
                </p>

                {/* 攻略コラム一覧へのリンク */}
                <div className="mb-10 flex justify-center">
                  <a
                    href="/columns"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md transition-transform hover:scale-105"
                  >
                    <span>📚</span> パチスロ攻略コラム一覧を見る
                  </a>
                </div>

                {/* ジャグラーシリーズ */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center justify-center gap-2">
                    <span className="w-8 h-1 bg-pink-500 rounded-full"></span>
                    ジャグラーシリーズ
                    <span className="w-8 h-1 bg-pink-500 rounded-full"></span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVAILABLE_MACHINES.filter(
                      (m) => m.category === "juggler",
                    ).map((machine) => (
                      <a
                        key={machine.id}
                        href={`/${machine.id}`}
                        className="block px-6 py-4 text-white font-bold rounded-xl transition-transform hover:scale-105 shadow-md hover:shadow-xl relative overflow-hidden group"
                        style={{ backgroundColor: machine.color }}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-2">
                          <span className="text-lg">{machine.name}</span>
                        </div>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* ハナハナシリーズ */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center justify-center gap-2">
                    <span className="w-8 h-1 bg-red-600 rounded-full"></span>
                    ハナハナシリーズ
                    <span className="w-8 h-1 bg-red-600 rounded-full"></span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVAILABLE_MACHINES.filter(
                      (m) => m.category === "hana",
                    ).map((machine) => (
                      <a
                        key={machine.id}
                        href={`/${machine.id}`}
                        className="block px-6 py-4 text-white font-bold rounded-xl transition-transform hover:scale-105 shadow-md hover:shadow-xl relative overflow-hidden group"
                        style={{ backgroundColor: machine.color }}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-2">
                          <span className="text-2xl">🌺</span>
                          <span className="text-lg">{machine.name}</span>
                          <span className="text-2xl">🌺</span>
                        </div>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 攻略コラム */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center justify-center gap-2">
                    <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
                    パチスロ攻略コラム
                    <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
                  </h2>
                  <div className="flex flex-col gap-4 text-left mx-auto max-w-xl">
                    <a
                      href="/columns/myjuggler5-setting6-behavior"
                      className="block p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-indigo-300 group"
                    >
                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                        【マイジャグ5】設定6はこう動く！ボーナス確率よりも「ぶどう」を信じるべき数学的理由
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        「合算1/120の台が空いた！」←実はそれ、罠かもしれません。AIシミュレーションと実戦データから導き出した、マイジャグ5の本当の狙い方を解説します。
                      </p>
                    </a>

                    <a
                      href="/columns/funky2-setting6-behavior"
                      className="block p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-indigo-300 group"
                    >
                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                        ファンキージャグラー2の設定6は別格？BIG先行の罠と、本当に見るべき「単独REG」の正体
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        BIG確率だけで設定判別していませんか？ファンキー2で勝つために見落としがちな「単独REG」と「ぶどう」の重要性を徹底解説。
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </Routes>

      {/* 開発者用：GA計測停止リンク */}
      <button
        onClick={() => {
          localStorage.setItem("ga-disable-G-VENL1QQD4E", "true");
          (window as any)["ga-disable-G-VENL1QQD4E"] = true;
          alert("計測を無効化しました（反映にはリロード推奨）");
        }}
        className="fixed bottom-2 right-2 text-[10px] opacity-10 hover:opacity-50 transition-opacity cursor-pointer bg-transparent border-none text-slate-500 z-50"
      >
        このブラウザの計測を無効にする
      </button>
    </BrowserRouter>
  );
}
