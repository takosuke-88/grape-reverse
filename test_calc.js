function testCalculation() {
  // Test parameters
  const currentTotalGames = 7000;
  const currentBig = 30;
  const currentReg = 30;
  const diffCoinsNum = 2000;

  // Constants for aimex
  const PAYOUT = {
    BIG: 252,
    REG: 96,
    GRAPE: 8,
    CHERRY: 2,
  };
  const PROB_DENOM = {
    REPLAY: 7.33,
    CHERRY: 33.0,
  };

  const REPLAY_PROB = 1 / PROB_DENOM.REPLAY;
  const CHERRY_PROB = 1 / PROB_DENOM.CHERRY;

  // 1. 消費枚数 = (総回転数 / 7.33 * 0) + (総回転数 * (1 - 1/7.33) * 3)
  const coinIn = currentTotalGames * (1 - REPLAY_PROB) * 3;

  // 2. ボーナス総獲得 = (BIG回数 * 252) + (REG回数 * 96)
  const bonusOut = currentBig * PAYOUT.BIG + currentReg * PAYOUT.REG;

  // 3. チェリー期待枚数 = (総回転数 / 33.0) * 2
  const cherryPayout = currentTotalGames * CHERRY_PROB * PAYOUT.CHERRY;

  // 4. 推定ブドウ獲得枚数 = 差枚数 + 消費枚数 - ボーナス総獲得 - チェリー期待枚数
  const grapePayout = diffCoinsNum + coinIn - bonusOut - cherryPayout;

  // 5. 推定ブドウ回数 = 推定ブドウ獲得枚数 / 8
  const calculatedGrapeCount = Math.round(grapePayout / PAYOUT.GRAPE);

  const grapeProb = currentTotalGames / calculatedGrapeCount;

  console.log("Expected target: ~1/6.03");
  console.log("------------------------");
  console.log("coinIn:", coinIn);
  console.log("bonusOut:", bonusOut);
  console.log("cherryPayout:", cherryPayout);
  console.log("grapePayout:", grapePayout);
  console.log("calculatedGrapeCount:", calculatedGrapeCount);
  console.log(`Grape Prob: 1/${grapeProb.toFixed(4)}`);
}

testCalculation();
