import { PRESETS } from "./presets";
import { computeGrapeSimple } from "./compute";

// ここを自分の実戦値に置き換えて試せます
const preset = PRESETS.find(p => p.id === "myj5")!; // 例：マイジャグ5

const result = computeGrapeSimple({
  preset,
  totalSpins: 5000, // 総回転
  big: 20,
  reg: 20,
  diffMedals: 1000, // 直接 差枚 を入れる例（±枚）
  // investCoins: 15000, returnCoins: 16000, // ←投資/回収で入れたい場合はこちらを使う
  playStyle: "cherry",  // free / cherry / full
  assumedSetting: 6,    // チェリー期待値の仮置き
  // otherMinorOut: 0,  // 任意の上乗せがあれば
});

console.log("―― 計算結果 ――");
console.log("投入枚数:", result.coinsIn);
console.log("ボーナス払い出し:", result.bonusOut);
console.log("チェリー払い出し(推定):", result.cherryOut);
console.log("推定ぶどう回数:", result.grapeCount);
console.log("ぶどう確率:", result.grapeProbDisplay);
if (result.warnings.length) {
  console.log("警告:", result.warnings.join(" / "));
}
