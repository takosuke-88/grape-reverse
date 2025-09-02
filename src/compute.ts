// ぶどう逆算の最小実装
import type { MachinePreset } from "./presets";

type PlayStyle = "free" | "cherry" | "full";
const CAPTURE = { free: 0.20, cherry: 0.95, full: 0.98 } as const;

export function computeGrapeSimple(opts: {
  preset: MachinePreset;
  totalSpins: number; // 総回転（通常時）
  big: number;
  reg: number;
  // 差枚 か 投資/回収 のどちらか一方を入れる
  diffMedals?: number;     // ±枚（勝ち負けの差枚）
  investCoins?: number;    // 投資（枚）
  returnCoins?: number;    // 回収（枚）
  playStyle?: PlayStyle;   // 打ち方（既定: "cherry"）
  assumedSetting?: 1|2|3|4|5|6; // チェリー期待値の仮置き（既定: 6）
  otherMinorOut?: number;  // 任意：その他小役の手動上乗せ（枚）
}) {
  const {
    preset, totalSpins, big, reg,
    diffMedals, investCoins, returnCoins,
    playStyle = "cherry",
    assumedSetting = 6,
    otherMinorOut = 0,
  } = opts;

  // 入出力
  const coinsIn = totalSpins * preset.betPerSpin;
  const bonusOut = big * preset.bigPayout + reg * preset.regPayout;

  // 差枚の決定（どちらか一方でOK）
  let net: number | undefined;
  if (typeof diffMedals === "number") net = diffMedals;
  else if (typeof investCoins === "number" && typeof returnCoins === "number") net = returnCoins - investCoins;
  if (typeof net !== "number") {
    throw new Error("差枚 もしくは 投資/回収 のどちらか一方を入力してください。");
  }

  // 非重複チェリー期待払い出し（打ち方で取得率を調整）
  const cherryPer = preset.cherryNonOverlapPerHitBySetting[assumedSetting];
  const cherryHits = totalSpins / cherryPer;
  const cherryOut = cherryHits * preset.cherryPayout * CAPTURE[playStyle];

  // ぶどう回数を逆算
  const grapeCountRaw = (net + coinsIn - bonusOut - otherMinorOut - cherryOut) / preset.grapePayout;
  const grapeCount = Math.max(0, Math.round(grapeCountRaw));
  const grapeProb = grapeCountRaw > 0 ? totalSpins / grapeCountRaw : Infinity; // 1/◯ の◯

  // ちょい安全チェック
  const warnings: string[] = [];
  if (!Number.isFinite(grapeCountRaw)) warnings.push("計算不能な入力です。");
  if (grapeCountRaw < 0) warnings.push("推定ぶどう回数が負です。入力や前提を見直してください。");
  if (grapeCount > totalSpins) warnings.push("推定ぶどう回数が総回転数を超えています。");

  return {
    coinsIn,
    bonusOut,
    cherryOut: Math.max(0, Math.round(cherryOut)),
    grapeCount,                // 推定ぶどう回数（整数）
    grapeProb,                 // ぶどう分母（1/この値）
    grapeProbDisplay: grapeProb === Infinity ? "—" : `1/${grapeProb.toFixed(2)}`,
    warnings,
  };
}
