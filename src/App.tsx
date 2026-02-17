import { BrowserRouter, Routes, Route } from "react-router-dom";
import MachinePagePreview from "./pages/MachinePagePreview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* v2: Schema-driven UI プレビュー */}
        <Route path="/v2/preview/:machineId" element={<MachinePagePreview />} />

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
                <a
                  href="/v2/preview/hana-hooh"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mr-4"
                >
                  ハナハナホウオウを試す
                </a>
                <a
                  href="/v2/preview/funky-juggler-2"
                  className="inline-block px-6 py-3 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 transition-colors"
                >
                  ファンキージャグラー2を試す
                </a>
                <div className="mt-4">
                  <a
                    href="/v2/preview/my-juggler-5"
                    className="inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors mr-4"
                  >
                    マイジャグラーVを試す
                  </a>
                  <a
                    href="/v2/preview/im-juggler-ex"
                    className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    SアイムジャグラーEXを試す
                  </a>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
