// web/src/lib/reverse.ts
// ==========================
// ぶどう逆算ロジック（CLI版と同一）
// ==========================

export type ReverseInput = {
  coins: number;   // 投入枚数
  bonus: number;   // ボーナス払い出し合計
  cherry?: number; // チェリー払い出し（任意）
  payout?: number; // ぶどう1回あたりの払い出し（既定: 7枚）
};

export type ReverseResult = {
  grapeCount: number;   // 推定ぶどう回数（整数）
  grapeProb: number;    // ぶどう確率（1/x の x 部分）
};

export function reverseGrape(input: ReverseInput): ReverseResult {
  const payout = input.payout ?? 7;
  if (payout <= 0) throw new Error("payout は正の数で指定してください");
  if (input.coins < 0 || input.bonus < 0) throw new Error("coins/bonus は0以上で");

  const cherry = input.cherry ?? 0;

  // ぶどう推定回数 = (投入枚数 - ボーナス - チェリー) / ぶどう1回の払い出し
  const remain = input.coins - input.bonus - cherry;
  const grapeCountRaw = remain / payout;

  // 0未満になったら 0 に丸める（入力過大/不足時の保険）
  const grapeCount = Math.max(0, Math.round(grapeCountRaw));

  // ぶどう確率 = 投入枚数 / ぶどう回数（単純モデル）
  const grapeProb = grapeCount > 0 ? +(input.coins / grapeCount).toFixed(2) : Infinity;

  return { grapeCount, grapeProb };
}
