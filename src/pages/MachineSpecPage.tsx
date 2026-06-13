import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import Seo from "../components/Seo";
import { JUGGLER_PAYOUT_RATIOS_3MODE } from "../data/juggler-spec-data";
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
    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
  >
    <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
      <span>{icon}</span>
      <span className="text-sm">{title}</span>
    </span>
    <span
      className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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

  const fmt1 = (v: number, dec = 1) => `1/${v.toFixed(dec)}`;

  const getCombinedDenom = (s: number): number | null => {
    const b = bigEl?.settingValues[s];
    const r = regEl?.settingValues[s];
    if (!b || !r) return null;
    return 1 / (1 / b + 1 / r);
  };

  const rowBg = (s: number) =>
    s === topSetting ? "bg-amber-50 dark:bg-amber-900/20" : "";

  const cellTxt = (s: number) =>
    s === topSetting
      ? "text-amber-700 dark:text-amber-400 font-semibold"
      : "text-slate-600 dark:text-slate-400";

  const settingLabel = (s: number) => {
    const lbl = config.specs?.settingLabels?.[s];
    return lbl ? `${s}(${lbl})` : String(s);
  };

  const thCls =
    "py-2 px-1 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700";
  const tdCls = (s: number) =>
    `py-1.5 px-1 text-center text-[10px] ${cellTxt(s)} border-b border-slate-100 dark:border-slate-800`;

  return (
    <div className="mx-auto w-full max-w-md">
      <Seo
        pageTitle={`${config.name} スペック詳細｜GrapeReverse`}
        pageDescription={`${config.name}のボーナス確率・機械割・小役確率・重複ボーナス確率を設定1〜6で比較。パチスロ設定判別に役立つスペック一覧です。`}
        pagePath={`/${machineId}/specs`}
      />

      {/* Sticky ヘッダー */}
      <div
        className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 shadow-md"
        style={{ backgroundColor: machineInfo.color }}
      >
        <button
          type="button"
          onClick={() => navigate(`/${machineId}`)}
          className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80 active:opacity-60"
        >
          ← 戻る
        </button>
        <h1 className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">
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
        <div className="space-y-3 p-3">

          {/* ① ボーナス確率 */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <AccordionHeader
              title="ボーナス確率"
              icon="🎰"
              isOpen={openState.bonusProb}
              onToggle={() => toggle("bonusProb")}
            />
            {openState.bonusProb && (
              <div className="overflow-x-clip px-3 pb-3">
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
                          <td className={`${tdCls(s)} font-bold`}>{settingLabel(s)}</td>
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
                <div className="overflow-x-clip px-3 pb-3">
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
                          <td className={`${tdCls(s)} font-bold`}>{settingLabel(s)}</td>
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
              <div className="overflow-x-clip px-3 pb-3">
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
                        <td className={`${tdCls(s)} font-bold`}>{settingLabel(s)}</td>
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
                <div className="overflow-x-clip px-3 pb-3">
                  <table className="table-fixed w-full">
                    <thead>
                      <tr>
                        <th className={`${thCls} w-8`}>設定</th>
                        <th className={`${thCls} w-8`}></th>
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
                                className={`py-1.5 px-1 text-center text-[10px] font-bold align-middle border-b border-slate-100 dark:border-slate-800 ${cellTxt(s)}`}
                              >
                                {settingLabel(s)}
                              </td>
                              <td className={`${tdCls(s)} font-bold text-red-500`}>BIG</td>
                              <td className={tdCls(s)}>{bigSolo != null ? fmt1(bigSolo) : "---"}</td>
                              <td className={tdCls(s)}>{bigCherry != null ? fmt1(bigCherry) : "---"}</td>
                            </tr>
                            <tr className={rowBg(s)}>
                              <td className={`${tdCls(s)} font-bold text-blue-500`}>REG</td>
                              <td className={tdCls(s)}>{regSolo != null ? fmt1(regSolo) : "---"}</td>
                              <td className={tdCls(s)}>{regCherry != null ? fmt1(regCherry) : "---"}</td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
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
