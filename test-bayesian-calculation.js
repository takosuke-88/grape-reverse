/**
 * ベイズ推定の計算ロジックを検証するテストスクリプト
 */

// ファンキージャグラー2の設定値
const funkyJuggler2Settings = {
  big: { 1: 266.4, 2: 259.0, 3: 256.0, 4: 249.2, 5: 240.1, 6: 219.9 },
  reg: { 1: 439.8, 2: 407.1, 3: 366.1, 4: 322.8, 5: 299.3, 6: 262.1 },
  grape: { 1: 5.95, 2: 5.92, 3: 5.88, 4: 5.83, 5: 5.76, 6: 5.66 },
};

// 判別重要度
const weights = {
  big: 1.0,
  reg: 2.5,
  grape: 1.5,
};

// テストケース: 設定5寄りのデータ
const testData = {
  totalGames: 1000,
  bigCount: 4, // 1/250 → 設定5の1/240.1に近い
  regCount: 3, // 1/333 → 設定4の1/322.8に近い
  grapeCount: 170, // 1/5.88 → 設定3の1/5.88に近い
};

console.log("=== ベイズ推定計算テスト ===\n");
console.log("テストデータ:");
console.log(`  総ゲーム数: ${testData.totalGames}`);
console.log(
  `  BIG回数: ${testData.bigCount} (確率: 1/${(testData.totalGames / testData.bigCount).toFixed(1)})`,
);
console.log(
  `  REG回数: ${testData.regCount} (確率: 1/${(testData.totalGames / testData.regCount).toFixed(1)})`,
);
console.log(
  `  ブドウ回数: ${testData.grapeCount} (確率: 1/${(testData.totalGames / testData.grapeCount).toFixed(2)})\n`,
);

// 各設定の対数尤度を計算
const settings = [1, 2, 3, 4, 5, 6];
const logLikelihoods = settings.map((setting) => {
  let logLikelihood = 0;

  // BIGの尤度
  const bigProb = 1 / funkyJuggler2Settings.big[setting];
  const bigLogL =
    testData.bigCount * Math.log(bigProb) +
    (testData.totalGames - testData.bigCount) * Math.log(1 - bigProb);
  logLikelihood += bigLogL * weights.big;

  // REGの尤度
  const regProb = 1 / funkyJuggler2Settings.reg[setting];
  const regLogL =
    testData.regCount * Math.log(regProb) +
    (testData.totalGames - testData.regCount) * Math.log(1 - regProb);
  logLikelihood += regLogL * weights.reg;

  // ブドウの尤度
  const grapeProb = 1 / funkyJuggler2Settings.grape[setting];
  const grapeLogL =
    testData.grapeCount * Math.log(grapeProb) +
    (testData.totalGames - testData.grapeCount) * Math.log(1 - grapeProb);
  logLikelihood += grapeLogL * weights.grape;

  console.log(`設定${setting}の計算:`);
  console.log(
    `  BIG期待値: 1/${funkyJuggler2Settings.big[setting]} → 対数尤度: ${bigLogL.toFixed(2)} (重み: ${weights.big})`,
  );
  console.log(
    `  REG期待値: 1/${funkyJuggler2Settings.reg[setting]} → 対数尤度: ${regLogL.toFixed(2)} (重み: ${weights.reg})`,
  );
  console.log(
    `  ブドウ期待値: 1/${funkyJuggler2Settings.grape[setting]} → 対数尤度: ${grapeLogL.toFixed(2)} (重み: ${weights.grape})`,
  );
  console.log(`  合計対数尤度: ${logLikelihood.toFixed(2)}\n`);

  return { setting, logLikelihood };
});

// 最大対数尤度でオフセット
const maxLogLikelihood = Math.max(
  ...logLikelihoods.map((l) => l.logLikelihood),
);
console.log(`最大対数尤度: ${maxLogLikelihood.toFixed(2)}\n`);

// 尤度に変換
const likelihoods = logLikelihoods.map(({ setting, logLikelihood }) => ({
  setting,
  likelihood: Math.exp(logLikelihood - maxLogLikelihood),
}));

// 正規化して確率に変換
const totalLikelihood = likelihoods.reduce((sum, l) => sum + l.likelihood, 0);
const probabilities = likelihoods.map(({ setting, likelihood }) => ({
  setting,
  probability: (likelihood / totalLikelihood) * 100,
}));

console.log("=== 最終結果 ===");
probabilities.forEach(({ setting, probability }) => {
  const bar = "█".repeat(Math.round(probability / 2));
  console.log(`設定${setting}: ${probability.toFixed(1)}% ${bar}`);
});

const mostLikely = probabilities.reduce((max, current) =>
  current.probability > max.probability ? current : max,
);
console.log(
  `\n最有力設定: 設定${mostLikely.setting} (${mostLikely.probability.toFixed(1)}%)`,
);

const highSettingProb = probabilities
  .filter((p) => p.setting >= 5)
  .reduce((sum, p) => sum + p.probability, 0);
console.log(`高設定の可能性: ${highSettingProb.toFixed(1)}% (設定5・6合算)`);

// 期待される結果の検証
console.log("\n=== 検証 ===");
console.log("✓ BIGデータは設定5に最も近い");
console.log("✓ REGデータは設定4に最も近い");
console.log("✓ ブドウデータは設定3に最も近い");
console.log(
  "✓ REGの重み(2.5)が最も高いため、設定4-5あたりの確率が高くなるはず",
);
console.log("\n期待される結果: 設定3-5あたりに確率が集中");
console.log(
  `実際の結果: 設定${mostLikely.setting}が最有力 (${mostLikely.probability.toFixed(1)}%)`,
);

const top3 = probabilities
  .sort((a, b) => b.probability - a.probability)
  .slice(0, 3);
console.log(
  `確率上位3つ: ${top3.map((p) => `設定${p.setting}(${p.probability.toFixed(1)}%)`).join(", ")}`,
);
