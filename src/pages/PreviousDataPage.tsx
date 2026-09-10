// 前任者タブ（/:machineId/prev）。
//
// 途中から座った台では、データランプに前の人が回した分のゲーム数・BIG・REGが
// 残っている。それを自分のカウントとは完全に別の画面で記録し、合算確率を出す。
//
// 【ベイズ判別には混ぜない】ここの数値は設定別期待度・AIアドバイス・グラフへ
//   一切渡さない。前任者のぶどう回数は数えようがないため、総ゲーム数だけ増えると
//   ぶどう確率が実際の数倍悪く計算され、判別が壊れる。

import { useParams, useNavigate, Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import { CONFIG_MAP } from "../data/machine-config-map";
import Seo from "../components/Seo";
import DynamicInput from "../components/dynamic-ui/DynamicInput";
import CurrentPreviousToggle from "../components/machine/CurrentPreviousToggle";
import type { DiscriminationElement } from "../types/machine-schema";
import {
  PREVIOUS_DATA_INITIAL,
  previousDataStorageKey,
} from "../data/previous-data-storage";

const ELEM_TOTAL_GAMES: DiscriminationElement = {
  id: "total-games", label: "総ゲーム数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};
const ELEM_BIG: DiscriminationElement = {
  id: "big-count", label: "BIG回数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};
const ELEM_REG: DiscriminationElement = {
  id: "reg-count", label: "REG回数", type: "counter",
  settingValues: {}, isDiscriminationFactor: false,
};

export default function PreviousDataPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();

  const config = machineId ? CONFIG_MAP[machineId] : null;
  const machineInfo = AVAILABLE_MACHINES.find((m) => m.id === machineId);
  const brandColor = machineInfo?.color ?? "#334155";
  const machineName = machineInfo?.name ?? machineId ?? "機種不明";
  const isHana = machineInfo?.category === "hana";
  const roleLabel = isHana ? "ベル" : "ぶどう";
  const roleIcon = isHana ? "🔔" : "🍇";

  const [vibrationEnabled, setVibrationEnabled] = useLocalStorage<boolean>(
    "grape-reverse-vibration",
    true,
  );

  const [prevData, setPrevData, removePrevData] = useLocalStorage<
    Record<string, number>
  >(previousDataStorageKey(machineId ?? ""), PREVIOUS_DATA_INITIAL);

  const totalGames = Math.max(0, prevData["total-games"] ?? 0);
  const bigCount = Math.max(0, prevData["big-count"] ?? 0);
  const regCount = Math.max(0, prevData["reg-count"] ?? 0);

  const update = (key: string, v: number) =>
    setPrevData((prev) => ({ ...prev, [key]: v }));

  const handleReset = () => {
    if (!window.confirm("前任者データをリセットしますか？")) return;
    removePrevData();
  };

  const bonusTotal = bigCount + regCount;
  const canCalc = totalGames > 0 && bonusTotal > 0;
  const bigProb = totalGames > 0 && bigCount > 0 ? totalGames / bigCount : null;
  const regProb = totalGames > 0 && regCount > 0 ? totalGames / regCount : null;
  const combined = canCalc ? totalGames / bonusTotal : null;

  if (!machineInfo) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8 text-slate-500">
        機種が見つかりません
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 dark:bg-slate-950">
      <Seo
        pageTitle={`${machineName} 前任者データ｜GrapeReverse`}
        pageDescription={`${machineName}の前任者が回した総ゲーム数・BIG・REGを入力して、BIG確率・REG確率・合算確率を確認できます。台に途中から座ったときの判断材料に。`}
        pagePath={`/${machineId}/prev`}
      />

      {/* タイトルバー（スクロールアウト） */}
      <div
        className="py-3 px-4 text-white shadow-lg"
        style={{ backgroundColor: brandColor }}
      >
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium shrink-0">
              {config?.type ?? "A-type"}
            </span>
            <h1 className="font-bold min-w-0">
              <span className="block text-lg sm:text-xl font-extrabold leading-tight truncate">
                {machineName}
              </span>
              <span className="block text-xs font-normal opacity-80 truncate">
                前任者データ
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* 2行 Sticky Header ─ 他ページと同一構成 */}
      <div className="sticky top-0 z-50 bg-slate-100/95 backdrop-blur-sm py-3 px-4 shadow-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="mx-auto max-w-md space-y-2">

          {/* Row 1: 機種名 + リセット + バイブ */}
          <div className="flex items-center gap-2">
            <select
              value={machineId ?? ""}
              onChange={(e) => { if (e.target.value) navigate(`/${e.target.value}/prev`); }}
              className="min-w-0 flex-1 text-center font-bold text-base py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            >
              {AVAILABLE_MACHINES.filter((m) => m.category === machineInfo.category).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-80 active:opacity-60"
              title="前任者データをリセット"
            >
              🗑️ リセット
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !vibrationEnabled;
                setVibrationEnabled(next);
                if (next && navigator.vibrate) navigator.vibrate(40);
              }}
              className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1.5 mr-1 text-sm font-semibold shadow-md transition-all ${
                vibrationEnabled ? "bg-emerald-600 text-white" : "bg-gray-800 text-white"
              }`}
              title={vibrationEnabled ? "バイブON（タップでOFF）" : "バイブOFF（タップでON）"}
            >
              {vibrationEnabled ? "📳 ON" : "🔇 OFF"}
            </button>
          </div>

          {/* Row 2: ナビゲーション ─ 他ページと同一の3ボタン。
              前任者⇄現在の行き来は基本データカードのトグルが担う。 */}
          <div className="flex gap-2">
            <Link
              to={`/${machineId}`}
              className="flex-1 rounded-lg bg-slate-700 dark:bg-slate-600 text-white py-2 font-bold transition-opacity hover:opacity-90 active:opacity-80 text-xs text-center"
            >
              🎰 小役カウンター
            </Link>
            <Link
              to={`/${machineId}/grape`}
              className="flex-1 rounded-lg bg-emerald-700 text-white py-2 font-bold transition-opacity hover:opacity-90 active:opacity-80 text-xs text-center"
            >
              {roleIcon} {roleLabel}逆算
            </Link>
            <Link
              to={`/${machineId}/specs`}
              className="flex-1 rounded-lg bg-indigo-700 text-white py-2 text-xs font-bold transition-opacity hover:opacity-90 active:opacity-80 text-center"
            >
              📊 機種スペック
            </Link>
          </div>
        </div>
      </div>

      {/* カードエリア */}
      <div className="mx-auto w-full max-w-md space-y-4 p-4">

        <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 sm:p-6">
          {/* カウンターページの基本データカードと同一の見出し＋トグル配置。
              トグルは absolute で見出し右の余白に重ね、カードの高さを増やさない。 */}
          <h2 className="mb-2 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
            基本データ
          </h2>
          <div className="absolute right-4 top-3 sm:right-6 sm:top-4">
            <CurrentPreviousToggle machineId={machineId ?? ""} active="previous" />
          </div>
          <div className="space-y-4">
            <DynamicInput
              element={ELEM_TOTAL_GAMES}
              value={totalGames}
              onChange={(v) => update("total-games", Number(v) || 0)}
              vibrationEnabled={vibrationEnabled}
            />
            <div className="grid min-w-0 grid-cols-2 gap-4">
              <DynamicInput
                element={ELEM_BIG}
                value={bigCount}
                onChange={(v) => update("big-count", Number(v) || 0)}
                totalGames={totalGames}
                vibrationEnabled={vibrationEnabled}
                compactLayout
              />
              <DynamicInput
                element={ELEM_REG}
                value={regCount}
                onChange={(v) => update("reg-count", Number(v) || 0)}
                totalGames={totalGames}
                vibrationEnabled={vibrationEnabled}
                compactLayout
              />
            </div>
          </div>
        </div>

        {/* 合算確率 */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 sm:p-6">
          <h2 className="mb-3 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
            前任者データの確率
          </h2>

          <div className="rounded-xl bg-amber-50 px-3 py-4 text-center dark:bg-amber-950/40">
            <div className="text-[10px] font-medium tracking-widest text-amber-700 dark:text-amber-400">
              合算確率
            </div>
            <div className="text-4xl font-black tabular-nums text-amber-700 dark:text-amber-300">
              {combined != null ? `1/${combined.toFixed(1)}` : "—"}
            </div>
            <div className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
              {canCalc
                ? `${totalGames.toLocaleString()}G ÷ BIG${bigCount} + REG${regCount}`
                : "総ゲーム数とBIG・REGを入力すると表示されます"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 px-2 py-3 text-center dark:bg-slate-800/60">
              <div className="text-[10px] font-medium tracking-widest text-slate-500 dark:text-slate-400">
                BIG確率
              </div>
              <div className="text-xl font-black tabular-nums text-slate-800 dark:text-slate-100">
                {bigProb != null ? `1/${bigProb.toFixed(1)}` : "—"}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-3 text-center dark:bg-slate-800/60">
              <div className="text-[10px] font-medium tracking-widest text-slate-500 dark:text-slate-400">
                REG確率
              </div>
              <div className="text-xl font-black tabular-nums text-slate-800 dark:text-slate-100">
                {regProb != null ? `1/${regProb.toFixed(1)}` : "—"}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            この数値は前任者の実績です。設定判別（設定別期待度・AIアドバイス）には使いません。
          </p>
        </div>
      </div>
    </div>
  );
}
