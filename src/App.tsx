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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AVAILABLE_MACHINES.map((machine) => (
                    <a
                      key={machine.id}
                      href={`/${machine.id}`}
                      className={`block px-6 py-4 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg
                        ${
                          machine.category === "hana"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : machine.id.includes("funky")
                              ? "bg-fuchsia-600 hover:bg-fuchsia-700"
                              : machine.id.includes("my")
                                ? "bg-pink-500 hover:bg-pink-600"
                                : machine.id.includes("im") ||
                                    machine.id.includes("aim")
                                  ? "bg-red-600 hover:bg-red-700"
                                  : machine.id.includes("happy")
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-slate-700 hover:bg-slate-800"
                        }`}
                    >
                      {machine.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
