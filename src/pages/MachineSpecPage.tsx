import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import Seo from "../components/Seo";
import { JUGGLER_PAYOUT_RATIOS_3MODE } from "../data/juggler-spec-data";
import { JUGGLER_SPEC_ADVICE } from "../data/juggler-spec-advice";
import type { MachineConfig } from "../types/machine-schema";
import { hanaHoohConfig } from "../data/machines/hana-hooh";
import { funkyJuggler2Config } from "../data/machines/funky-juggler-2";
import { myJuggler5Config } from "../data/machines/juggler-my5";
import { imJugglerExConfig } from "../data/machines/juggler-im-ex";
import { gogoJuggler3Config } from "../data/machines/juggler-gogo3";
import { girlsSsConfig } from "../data/machines/juggler-girls-ss";
import { mrJugglerConfig } from "../data/machines/juggler-mr";
import { miracleJugglerConfig } from "../data/machines/juggler-miracle";
import { happyV3Config } from "../data/machines/juggler-happy-v3";
import { kingHanahanaConfig } from "../data/machines/king-hanahana";
import { dragonSenkoConfig } from "../data/machines/dragon-senko";
import { starHanahanaConfig } from "../data/machines/star-hanahana";
import { newHanahanaGoldConfig } from "../data/machines/new-hanahana-gold";
import { newKingVConfig } from "../data/machines/new-king-v";
import { lastUtopiaConfig } from "../data/machines/last-utopia";
import { haihaiSiosai2Config } from "../data/machines/haihai-siosai2";
import { haihaiSiosaiConfig } from "../data/machines/haihai-siosai";

const CONFIG_MAP: Record<string, MachineConfig> = {
  "hana-hooh": hanaHoohConfig,
  funky2: funkyJuggler2Config,
  myjuggler5: myJuggler5Config,
  aimex: imJugglerExConfig,
  gogo3: gogoJuggler3Config,
  girlsss: girlsSsConfig,
  mr: mrJugglerConfig,
  miracle: miracleJugglerConfig,
  happyv3: happyV3Config,
  "king-hanahana": kingHanahanaConfig,
  "dragon-senko": dragonSenkoConfig,
  "star-hanahana": starHanahanaConfig,
  "new-king-v": newKingVConfig,
  "new-hanahana-gold": newHanahanaGoldConfig,
  "last-utopia": lastUtopiaConfig,
  "haihai-siosai2": haihaiSiosai2Config,
  "haihai-siosai": haihaiSiosaiConfig,
};

interface AccordionState {
  bonusProb: boolean;
  payoutRatio: boolean;
  smallRole: boolean;
  bonusDetail: boolean;
}

const DEFAULT_ACCORDION: AccordionState = {
  bonusProb: true,
  payoutRatio: true,
  smallRole: true,
  bonusDetail: true,
};

interface AccordionHeaderProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
  >
    <span className="flex items-center gap-2 text-slate-800 dark:text-white">
      <span className="text-xl">{icon}</span>
      <span className="text-base font-bold">{title}</span>
    </span>
    <span
      className={`text-lg text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    >
      ▼
    </span>
  </button>
);

export default function MachineSpecPage() {
  const { machineId = "" } = useParams<{ machineId: string }>();
  const navigate = useNavigate();

  const config = CONFIG_MAP[machineId];
  const machineInfo = AVAILABLE_MACHINES.find((m) => m.id === machineId);
  const isJuggler = machineInfo?.category === "juggler";

  const [openState, setOpenState] = useLocalStorage<AccordionState>(
    `spec_page_block_states_${machineId}`,
    DEFAULT_ACCORDION,
  );

  const toggle = (key: keyof AccordionState) => {
    setOpenState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!config || !machineInfo) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8 text-slate-500">
        機種が見つかりません
      </div>
    );
  }

  const allElements = config.sections.flatMap((s) => s.elements);
  const bigEl    = allElements.find((e) => e.id === "big-count");
  const regEl    = allElements.find((e) => e.id === "reg-count");
  const grapeEl  = allElements.find((e) => e.id === "grape-count");
  const cherryEl = allElements.find((e) => e.id === "cherry-count");

  const settings   = config.specs?.settings ?? [1, 2, 3, 4, 5, 6];
  const topSetting = Math.max(...settings);
  const payoutData = JUGGLER_PAYOUT_RATIOS_3MODE[machineId];
  const detProbs   = config.detailedProbabilities;
  const advice     = JUGGLER_SPEC_ADVICE[machineId];

  const fmt1 = (v: number, dec = 1) => `1/${v.toFixed(dec)}`;

  const getCombinedDenom = (s: number): number | null => {
    const b = bigEl?.settingValues[s];
    const r = regEl?.settingValues[s];
    if (!b || !r) return null;
    return 1 / (1 / b + 1 / r);
  };

  // ── 行背景：縞模様 + 設定6アンバーハイライト ──────────────────
  const rowBg = (s: number) => {
    if (s === topSetting)
      return "bg-amber-50 dark:bg-amber-950/50";
    return s % 2 === 1
      ? "bg-slate-50 dark:bg-slate-900/40"   // 奇数設定 (1, 3, 5)
      : "bg-white dark:bg-slate-800/50";      // 偶数設定 (2, 4)
  };

  // ── セルテキスト色・太さ ──────────────────────────────────────
  const cellTxt = (s: number) =>
    s === topSetting
      ? "text-amber-700 dark:text-amber-400 font-extrabold"
      : "text-slate-800 dark:text-slate-100 font-bold";

  // 設定6に追加する上部セパレーター（強調ボーダー）
  const s6Border = (s: number) =>
    s === topSetting
      ? "border-t-2 border-t-amber-400 dark:border-t-amber-500"
      : "";

  const settingLabel = (s: number) => {
    const lbl = config.specs?.settingLabels?.[s];
    return lbl ? `${s}(${lbl})` : String(s);
  };

  // ── 共通スタイル定数 ─────────────────────────────────────────
  // ヘッダー行：小さめ・太字で列名を明示
  const thCls =
    "py-3 px-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-b-2 border-slate-300 dark:border-slate-600";

  // データ行：text-base(16px) + tracking-tighter で横幅を維持しつつ最大サイズ
  const tdCls = (s: number) =>
    `py-4 px-1 text-center text-base tracking-tighter ${cellTxt(s)} ${s6Border(s)} border-b border-slate-200 dark:border-slate-700`;

  // 解説テキストの共通スタイル
  const adviceCls =
    "px-4 pt-3 pb-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400";

  return (
    <div className="mx-auto w-full max-w-md">
      <Seo
        pageTitle={`${config.name} スペック詳細｜GrapeReverse`}
        pageDescription={`${config.name}のボーナス確率・機械割・小役確率・重複ボーナス確率を設定1〜6で比較。パチスロ設定判別に役立つスペック一覧です。`}
        pagePath={`/${machineId}/specs`}
      />

      {/* Sticky ヘッダー */}
      <div
        className="sticky top-0 z-50 flex items-center gap-3 px-4 py-4 shadow-md"
        style={{ backgroundColor: machineInfo.color }}
      >
        <button
          type="button"
          onClick={() => navigate(`/${machineId}`)}
          className="shrink-0 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-80 active:opacity-60"
        >
          ← 戻る
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-extrabold text-white">
          {config.name} スペック詳細
        </h1>
      </div>

      {!isJuggler ? (
        <div className="m-6 rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            このシリーズのスペック詳細は準備中です。
          </p>
        </div>
      ) : (
        <div className="space-y-4 p-4">

          {/* ① ボーナス確率 */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <AccordionHeader
              title="ボーナス確率"
              icon="🎰"
              isOpen={openState.bonusProb}
              onToggle={() => toggle("bonusProb")}
            />
            {openState.bonusProb && (
              <div className="overflow-x-clip pb-4">
                <table className="table-fixed w-full">
                  <thead>
                    <tr>
                      <th className={`${thCls} w-8`}>設定</th>
                      <th className={thCls}>BIG確率</th>
                      <th className={thCls}>REG確率</th>
                      <th className={thCls}>合算</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((s) => {
                      const combined = getCombinedDenom(s);
                      return (
                        <tr key={s} className={rowBg(s)}>
                          <td className={`${tdCls(s)} font-extrabold`}>{settingLabel(s)}</td>
                          <td className={tdCls(s)}>
                            {bigEl?.settingValues[s] ? fmt1(bigEl.settingValues[s]) : "---"}
                          </td>
                          <td className={tdCls(s)}>
                            {regEl?.settingValues[s] ? fmt1(regEl.settingValues[s]) : "---"}
                          </td>
                          <td className={tdCls(s)}>
                            {combined !== null ? fmt1(combined) : "---"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {advice?.bonusProb && (
                  <p className={adviceCls}>{advice.bonusProb}</p>
                )}
              </div>
            )}
          </div>

          {/* ② 打ち方別機械割 */}
          {payoutData && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <AccordionHeader
                title="打ち方別 機械割"
                icon="💹"
                isOpen={openState.payoutRatio}
                onToggle={() => toggle("payoutRatio")}
              />
              {openState.payoutRatio && (
                <div className="overflow-x-clip pb-4">
                  <table className="table-fixed w-full">
                    <thead>
                      <tr>
                        <th className={`${thCls} w-8`}>設定</th>
                        <th className={thCls}>公表値</th>
                        <th className={thCls}>チェリー狙</th>
                        <th className={thCls}>フル攻略</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.map((s, idx) => (
                        <tr key={s} className={rowBg(s)}>
                          <td className={`${tdCls(s)} font-extrabold`}>{settingLabel(s)}</td>
                          <td className={tdCls(s)}>
                            {payoutData.free[idx] != null
                              ? `${payoutData.free[idx].toFixed(2)}%`
                              : "---"}
                          </td>
                          <td className={tdCls(s)}>
                            {payoutData.cherry[idx] != null
                              ? `${payoutData.cherry[idx].toFixed(2)}%`
                              : "---"}
                          </td>
                          <td className={tdCls(s)}>
                            {payoutData.full[idx] != null
                              ? `${payoutData.full[idx].toFixed(2)}%`
                              : "---"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {advice?.payoutRatio && (
                    <p className={adviceCls}>{advice.payoutRatio}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ③ 通常時小役確率 */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <AccordionHeader
              title="通常時小役確率"
              icon="🍇"
              isOpen={openState.smallRole}
              onToggle={() => toggle("smallRole")}
            />
            {openState.smallRole && (
              <div className="overflow-x-clip pb-4">
                <table className="table-fixed w-full">
                  <thead>
                    <tr>
                      <th className={`${thCls} w-8`}>設定</th>
                      <th className={thCls}>ぶどう確率</th>
                      <th className={thCls}>チェリー確率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((s) => (
                      <tr key={s} className={rowBg(s)}>
                        <td className={`${tdCls(s)} font-extrabold`}>{settingLabel(s)}</td>
                        <td className={tdCls(s)}>
                          {grapeEl?.settingValues[s] ? fmt1(grapeEl.settingValues[s]) : "---"}
                        </td>
                        <td className={tdCls(s)}>
                          {cherryEl?.settingValues[s] ? fmt1(cherryEl.settingValues[s]) : "---"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {advice?.smallRole && (
                  <p className={adviceCls}>{advice.smallRole}</p>
                )}
              </div>
            )}
          </div>

          {/* ④ 単独・重複ボーナス確率 */}
          {detProbs?.big_solo && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <AccordionHeader
                title="単独・重複ボーナス確率"
                icon="🎲"
                isOpen={openState.bonusDetail}
                onToggle={() => toggle("bonusDetail")}
              />
              {openState.bonusDetail && (
                <div className="overflow-x-clip pb-4">
                  <table className="table-fixed w-full">
                    <thead>
                      <tr>
                        <th className={`${thCls} w-8`}>設定</th>
                        <th className={`${thCls} w-10`}></th>
                        <th className={thCls}>単独確率</th>
                        <th className={thCls}>重複確率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.map((s, idx) => {
                        const bigSolo   = detProbs.big_solo?.[idx];
                        const bigCherry = detProbs.big_cherry?.[idx];
                        const regSolo   = detProbs.reg_solo?.[idx];
                        const regCherry = detProbs.reg_cherry?.[idx];
                        return (
                          <React.Fragment key={s}>
                            <tr className={rowBg(s)}>
                              <td
                                rowSpan={2}
                                className={`py-4 px-1 text-center text-base font-extrabold tracking-tighter leading-relaxed align-middle border-b border-slate-200 dark:border-slate-700 ${s6Border(s)} ${cellTxt(s)}`}
                              >
                                {settingLabel(s)}
                              </td>
                              <td className={`${tdCls(s)} font-extrabold text-red-600 dark:text-red-400`}>BIG</td>
                              <td className={tdCls(s)}>{bigSolo != null ? fmt1(bigSolo) : "---"}</td>
                              <td className={tdCls(s)}>{bigCherry != null ? fmt1(bigCherry) : "---"}</td>
                            </tr>
                            <tr className={rowBg(s)}>
                              <td className={`${tdCls(s)} font-extrabold text-blue-600 dark:text-blue-400`}>REG</td>
                              <td className={tdCls(s)}>{regSolo != null ? fmt1(regSolo) : "---"}</td>
                              <td className={tdCls(s)}>{regCherry != null ? fmt1(regCherry) : "---"}</td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  {advice?.bonusDetail && (
                    <p className={adviceCls}>{advice.bonusDetail}</p>
                  )}
                  <p className="px-4 pt-1 pb-1 text-xs text-slate-400 dark:text-slate-500">
                    ※重複確率は一部算出値を含みます
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
