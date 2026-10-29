import type { MachineConfig } from "../types/machine-schema";

/**
 * AI判定アドバイス欄の色・アイコンを決めるための「設定5・6の可能性」を、6段階機種の目盛りへ換算する（2026-10-13）。
 * 判別材料が無いときの値は 高設定の数 ÷ 設定の数 で決まり、6段階なら33.3%だが、4段階機種は50%で最初から赤🔥になる。
 * オッズ比を保ったまま「材料なし＝33.3%」の目盛りへ換算してから 70/50/30 の境目に当てる。6段階の機種は値が変わらない。
 * 文言の切り替え（specialAdvice の minProb/maxProb 等）は換算前の値のまま判定すること。
 * 設定判別ページ（MachinePageFactory）と逆算ページ（EstimationAiAdvice）で共通に使う。
 */
export function toSixStepScale(highSettingProb: number, config: MachineConfig): number {
  const settings = config.specs?.settings || [1, 2, 3, 4, 5, 6];
  const highCount = settings.filter((s) => s >= 5).length;
  if (highCount === 0 || highCount === settings.length) return highSettingProb;
  if (highCount * 3 === settings.length) return highSettingProb;
  const base = highCount / settings.length;
  const p = Math.min(Math.max(highSettingProb / 100, 1e-9), 1 - 1e-9);
  const oddsRatio = p / (1 - p) / (base / (1 - base));
  const sixStepOdds = oddsRatio * 0.5; // 6段階の材料なし時のオッズ = 2:4
  return (sixStepOdds / (1 + sixStepOdds)) * 100;
}

/** 機種固有のAIアドバイス（config.specialAdvice）から、総ゲーム数と設定5・6の可能性に合う文言（HTML）を返す */
export function resolveSpecialAdviceHtml(
  config: MachineConfig,
  totalGames: number,
  highSettingProb: number,
): string | null {
  if (!config.specialAdvice) return null;
  const { tiers } = config.specialAdvice;
  const tier =
    tiers.find((t) => t.maxGames !== null && totalGames <= t.maxGames) ?? tiers[tiers.length - 1];
  const bracket = tier.brackets.find(
    (b) =>
      (b.minProb === undefined || highSettingProb >= b.minProb) &&
      (b.maxProb === undefined || highSettingProb < b.maxProb),
  );
  return tier.introHtml + (bracket?.html ?? "");
}
