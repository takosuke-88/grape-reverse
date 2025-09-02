import { PRESETS } from "./presets";

const preset = PRESETS.find(p => p.id === "myj5")!;

console.log("機種名:", preset.name);
console.log("BIG獲得枚数:", preset.bigPayout);
console.log("ぶどう分母(設定6):", preset.grapePerHitBySetting[6]);
console.log("非重複チェリー分母(設定6):", preset.cherryNonOverlapPerHitBySetting[6]);
