// 前任者タブ（/:machineId/prev）。
//
// 途中から座った台では、データランプに前の人が回した分のゲーム数・BIG・REGが
// 残っている。それを自分のカウントとは完全に別の画面で記録し、合算確率を出す。
//
// 【ベイズ判別には混ぜない】ここの数値は設定別期待度・AIアドバイス・グラフへ
//   一切渡さない。前任者のぶどう回数は数えようがないため、総ゲーム数だけ増えると
//   ぶどう確率が実際の数倍悪く計算され、判別が壊れる。

import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import { CONFIG_MAP } from "../data/machine-config-map";
import Seo from "../components/Seo";
import DynamicInput from "../components/dynamic-ui/DynamicInput";
import CurrentPreviousToggle from "../components/machine/CurrentPreviousToggle";
import EstimationResultDisplay from "../components/dynamic-ui/EstimationResultDisplay";
import SettingProbabilityChart from "../components/dynamic-ui/SettingProbabilityChart";
import ProbabilityMetricCard from "../components/dynamic-ui/ProbabilityMetricCard";
import {
  calculateEstimation,
  calculateGrapeWeight,
  calculateMultinomialEstimation,
} from "../logic/bayes-estimator";
import type {
  DiscriminationElement,
  EstimationResult,
  UserInputs,
} from "../types/machine-schema";
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

  const settings = config?.specs?.settings ?? [1, 2, 3, 4, 5, 6];

  // 総ゲーム数・BIG・REG の3つだけで設定推定する。
  // ジャグラーの通常判別は多項分布モデルだが、そのまま渡すとハズレ確率から
  // ぶどう確率が差し引かれ「全ハズレでぶどうが0回」という偽情報になるため、
  // ignoreGrape でぶどう・チェリーを観測対象から外した3項モデルへ切り替える。
  // ハナハナは元々カウント0の要素をスキップする二項モデルなのでそのまま使える。
  const estimationResults = useMemo<EstimationResult[] | null>(() => {
    if (!config || totalGames === 0) return null;
    const inputs: UserInputs = {
      "total-games": totalGames,
      "big-count": bigCount,
      "reg-count": regCount,
    };
    try {
      return isHana
        ? calculateEstimation(config, inputs)
        : calculateMultinomialEstimation(config, inputs, { ignoreGrape: true });
    } catch {
      return null;
    }
  }, [config, totalGames, bigCount, regCount, isHana]);

  // 詳細判別カードに出す確率指標。ぶどう未計測なので BIG / REG / 合算 の3つだけ
  // （単独REG・チェリーREG・ぶどう確率は出さない）。
  const metrics = useMemo(() => {
    const allElements = config?.sections.flatMap((sec) => sec.elements) ?? [];
    const bigEl = allElements.find((e) => e.id === "big-count");
    const regEl = allElements.find((e) => e.id === "reg-count");
    const bonusTotal = bigCount + regCount;

    // 合算の理論値は BIG と REG の確率を足して逆数に戻す
    const combinedValues: Record<number, number> = {};
    if (bigEl?.settingValues && regEl?.settingValues) {
      settings.forEach((st) => {
        const b = bigEl.settingValues![st];
        const r = regEl.settingValues![st];
        if (b && r) combinedValues[st] = 1 / (1 / b + 1 / r);
      });
    }

    return [
      {
        label: "BIG確率",
        val: bigCount > 0 ? totalGames / bigCount : 0,
        settingValues: bigEl?.settingValues,
      },
      {
        label: "REG確率",
        val: regCount > 0 ? totalGames / regCount : 0,
        settingValues: regEl?.settingValues,
      },
      {
        label: "合算確率",
        val: bonusTotal > 0 ? totalGames / bonusTotal : 0,
        settingValues: Object.keys(combinedValues).length
          ? combinedValues
          : undefined,
      },
    ];
  }, [config, totalGames, bigCount, regCount, settings]);

  // 信頼度は小役カウンター・逆算ページと完全に同一の計算（総ゲーム数のみを見る）。
  // ぶどう未計測の分だけ実際の判別力は落ちるが、それはグラフ下の注記で伝える。
  // ページ間で同じ名前・同じ数字になることを優先した（2026-09-11決定）。
  const grapeReliability = useMemo(
    () =>
      calculateGrapeWeight(
        totalGames,
        config?.specs?.judgmentWeights?.grapeWeightMap,
      ),
    [totalGames, config],
  );

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
        noindex
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
              {vibrationEnabled ? "📳 ON" : "📴 OFF"}
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

        {/* 詳細判別（前任者データのみで推定） */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 sm:p-6">
          <h2 className="mb-2 text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400">
            詳細判別
          </h2>

          <div className="mt-4">
            <EstimationResultDisplay
              results={
                estimationResults ||
                settings.map((setting) => ({ setting, probability: 0 }))
              }
              config={config ?? undefined}
              grapeReliability={grapeReliability}
            />
          </div>

          {/* BIG確率・REG確率・合算確率（近似設定ラベル付き） */}
          <div className="mb-4 mt-4 grid grid-cols-2 gap-2">
            {metrics.map((m, idx) => (
              <ProbabilityMetricCard
                key={idx}
                label={m.label}
                val={m.val}
                format={(v) => v.toFixed(1)}
                settingValues={m.settingValues}
                config={config ?? undefined}
              />
            ))}
          </div>

          <SettingProbabilityChart
            results={estimationResults}
            settings={settings}
            note="※ぶどう未計測のため、精度は下がります"
          />
        </div>
      </div>
    </div>
  );
}
