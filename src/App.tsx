import { BrowserRouter, Routes, Route } from "react-router-dom";
import MachinePagePreview from "./pages/MachinePagePreview";
import { AVAILABLE_MACHINES } from "./data/machine-list";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* v2: Schema-driven UI プレビュー - 互換性のため残す */}
        <Route path="/v2/preview/:machineId" element={<MachinePagePreview />} />

        {/* 本番用ルート: /myjuggler5 など */}
        <Route path="/:machineId" element={<MachinePagePreview />} />

        {/* デフォルトルート */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="text-center w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                  GrapeReverse
                </h1>
                <p className="text-slate-600 mb-8">
                  ジャグラー・ハナハナ・Aタイプ設定判別ツール
                </p>

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
