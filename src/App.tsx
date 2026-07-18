import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import MachinePagePreview from "./pages/MachinePagePreview";
import GrapeReversePage from "./pages/GrapeReversePage";
import MachineSpecPage from "./pages/MachineSpecPage";
import { AVAILABLE_MACHINES } from "./data/machine-list";
import { ALL_COLUMNS } from "./data/column-content";
import ColumnIndexPage from "./pages/columns/index";
import ColumnDetailPage from "./pages/columns/ColumnDetailPage";
import GoogleAnalytics from "./components/GoogleAnalytics";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Seo from "./components/Seo";

export default function App() {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <ScrollToTop />
      <ScrollToTopButton />
      <Header />
      <div className="flex min-h-screen w-full max-w-full flex-col">
        <main className="w-full max-w-full flex-1">
          <Routes>
            {/* 古いURL（/v2/preview/:id）からの301リダイレクト設定 */}
            <Route path="/v2/preview/:machineId" element={<MachineRedirect />} />

            {/* 古いURL（/machine/:id）からの301リダイレクト設定 */}
            <Route path="/machine/:machineId" element={<MachineRedirect />} />

            {/* ぶどう/ベル逆算ページ: /:machineId/grape */}
            <Route path="/:machineId/grape" element={<GrapeReversePage />} />

            {/* 機種スペック詳細ページ: /:machineId/specs */}
            <Route path="/:machineId/specs" element={<MachineSpecPage />} />

            {/* 本番用ルート: /myjuggler5 など */}
            <Route path="/:machineId" element={<MachinePagePreview />} />

            {/* コラム記事 */}
            <Route path="/columns" element={<ColumnIndexPage />} />
            <Route path="/columns/:slug" element={<ColumnDetailPage />} />

            {/* デフォルトルート */}
            <Route
              path="/"
              element={
                <div className="bg-slate-50 flex justify-center p-4 py-12">
                  <Seo
                    pageTitle="パチスロ攻略・設定判別 ぶどう/ベル逆算｜GrapeReverse"
                    pageDescription="ジャグラーやハナハナのAタイプから、最新スマスロまで対応！独自のぶどう/ベル逆算ロジックを搭載した、高精度な設定判別ツールが完全無料でスマホでサクサク使えます。"
                    pagePath="/"
                  />
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
                    <div id="juggler" className="mb-12 scroll-mt-24">
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
                    <div id="hana" className="mb-12 scroll-mt-24">
                      <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center justify-center gap-2">
                        <span className="w-8 h-1 bg-red-600 rounded-full"></span>
                        ハナハナ・シオサイシリーズ
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
                        {ALL_COLUMNS.slice(0, 3).map((entry) => (
                          <a
                            key={entry.slug}
                            href={`/columns/${entry.slug}`}
                            className="block p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-indigo-300 group"
                          >
                            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                              {entry.frontmatter.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {entry.frontmatter.description}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>

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

// 過去の /machine/:id URLから /:id へリダイレクトするコンポーネント
// React Router の <Navigate replace /> を使用して履歴を残さずに転送します（SEO上の301リダイレクト相当）
function MachineRedirect() {
  const { machineId } = useParams<{ machineId: string }>();
  return <Navigate to={`/${machineId}`} replace />;
}
