// 確率指標の小カード（BIG確率・REG確率・合成確率など）。
//
// 小役カウンターページ（MachinePageFactory）の「4大指標」グリッドに
// ベタ書きされていたものを、前任者ページからも使えるよう切り出したもの。
// DOM構造・クラスは元の実装と同一。近似設定ラベルの判定だけは 2026-09-22 に
// approximation-label.ts へ移し、逆算ページの指標カードと共通化した。

import type { MachineConfig } from "../../types/machine-schema";
import { formatBonusText } from "../../utils/formatters";
import { resolveApproximation } from "../../utils/approximation-label";

interface ProbabilityMetricCardProps {
  label: string;
  /** 実測の確率分母（1/x の x）。0 のときは「---」表示 */
  val: number;
  /**
   * この確率の母数になっている実測回数。ラベル横に「◯◯回」と出す。
   * 前任者分を差し引いている場合はその差し引き後の回数が渡る（カード内の確率と
   * 同じ基準）。カウンターバーのラベルと違い「差分」の語は付けない。
   * 0（未計測）のときは何も出さない。
   */
  count?: number;
  format: (v: number) => string;
  /** 設定別の理論値。与えると最も近い設定を「(設定N近似)」として出す */
  settingValues?: Record<number, number>;
  config?: MachineConfig;
  /**
   * 3列グリッド用の詰めた表示（2026-09-23）。設定判別ページの詳細判別だけが使う。
   * 375pxで3列にするとカード内側が126.0px→92.0pxまで狭まるため、
   * ラベル14px→12px・値20px→18px・左右の内余白12px→4pxに落とす。
   * 上下の余白は変えないので、カードの背の高さは文字サイズ分しか変わらない。
   * 省略時は従来の2列用の見た目のまま（前任者ページはこちら）。
   */
  dense?: boolean;
  /**
   * dense のときにラベルを12pxへ落とす。判定はグリッド側がまとめて行う
   * （MachinePageFactory）。1枚でも14pxで入らなければ全枚数そろって12pxに
   * するため、カードごとに文字サイズがバラつくことはない。
   *
   * 14px（既定）のときはラベルを whitespace-nowrap にしてあり、折り返さずに
   * はみ出す。グリッド側はその「はみ出し」を scrollWidth で検出する。
   * 12pxへ落ちたあとは通常どおり折り返しを許す（最後の逃げ道として残す）。
   */
  compactLabel?: boolean;
}

export default function ProbabilityMetricCard({
  label,
  val,
  count,
  format,
  settingValues,
  config,
  dense = false,
  compactLabel = false,
}: ProbabilityMetricCardProps) {
  // 設定値が一致している設定は「(設定4-6近似)」のようにまとめて出す。
  // 色分けは同値グループの最小設定を基準にする（approximation-label.ts 参照）。
  const approximation = resolveApproximation(val, settingValues, config);

  const valueText = val > 0 ? `1/${format(val)}` : "---";
  // 3列（dense）でも値は原則20pxのまま。20pxで枠92.0pxに入らないのは
  // `1/12000.0` のような9文字＝5桁の分母だけ（95.0px）で、これは総ゲーム数が
  // 10000G以上あってその項目が1回しか出ていないときにしか現れない。
  // 8文字（`1/1090.9` 83.0px）までは20pxで余9.0px。9文字のときだけ18px
  // （85.0px）へ落とす。分母は総ゲーム数が上限なので `1/99999.0` の9文字が最長。
  const valueSizeClass = dense && valueText.length > 8 ? "text-lg" : "text-xl";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800 ${
        dense ? "px-1 py-3" : "p-3"
      }`}
    >
      <div
        data-metric-label
        className={`text-slate-500 dark:text-slate-400 ${
          dense && compactLabel ? "text-xs" : "text-sm"
        } ${
          // dense では常にカード幅いっぱいの箱にする。flexアイテムの既定
          // (min-width:auto) のままだと箱が中身に張り付き、clientWidth と
          // scrollWidth が常に一致してはみ出しを検出できない（2026-08-05の
          // min-w-0 と同じ落とし穴）。14pxで測っている間だけ nowrap +
          // overflow-hidden にして、はみ出しを scrollWidth に出す。
          dense
            ? `w-full min-w-0 text-center ${
                compactLabel ? "" : "overflow-hidden whitespace-nowrap"
              }`
            : ""
        }`}
      >
        {formatBonusText(label)}
        {count != null && count > 0 && (
          <span className="ml-1 font-bold text-slate-600 dark:text-slate-300">
            {count}回
          </span>
        )}
      </div>
      <div
        className={`font-bold text-slate-800 dark:text-white ${valueSizeClass}`}
      >
        {valueText}
      </div>
      {approximation && (
        <div
          className={`text-xs font-bold ${
            approximation.settings[0] >= 5
              ? "text-red-500 dark:text-red-400"
              : "text-blue-500 dark:text-blue-400"
          }`}
        >
          {approximation.label}
        </div>
      )}
    </div>
  );
}
