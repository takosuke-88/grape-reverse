import { BrowserRouter, Routes, Route } from "react-router-dom";
import MachinePagePreview from "./pages/MachinePagePreview";

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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                  GrapeReverse
                </h1>
                <p className="text-slate-600 mb-6">
                  ジャグラー・ハナハナ・Aタイプ設定判別ツール
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 justify-center">
                    <a
                      href="/hana-hooh"
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ハナハナホウオウを試す
                    </a>
                    <a
                      href="/funky2"
                      className="inline-block px-6 py-3 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 transition-colors"
                    >
                      ファンキージャグラー2を試す
                    </a>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <a
                      href="/myjuggler5"
                      className="inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      マイジャグラーVを試す
                    </a>
                    <a
                      href="/aimex"
                      className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      SアイムジャグラーEXを試す
                    </a>
                  </div>
                </div>
                <div className="mt-8 text-slate-500 text-sm">
                  <p>その他の機種もURL直接入力でアクセス可能です:</p>
                  <p className="mt-2 text-xs">
                    /gogo3, /girlsss, /mr, /miracle, /happyv3 など
                  </p>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
