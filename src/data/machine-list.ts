export type MachineCategory = "juggler" | "hana" | "other";

export interface MachineInfo {
  id: string;
  name: string;
  title?: string;
  category: MachineCategory;
  color: string;
}

/**
 * 利用可能な機種リスト
 * カテゴリごとに分類してナビゲーションに使用
 */
export const AVAILABLE_MACHINES: MachineInfo[] = [
  {
    id: "myjuggler5",
    name: "マイジャグラーV",
    title: "マイジャグラーVの攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#D81B60",
  },
  {
    id: "aimex",
    name: "ネオアイムジャグラーEX",
    title: "【即計算】ネオアイムジャグラーEX ぶどう逆算・設定判別｜GrapeReverse",
    category: "juggler",
    color: "#C62828",
  },
  {
    id: "funky2",
    name: "ファンキージャグラー2",
    title: "ファンキージャグラー2の攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#6A1B9A",
  },
  {
    id: "gogo3",
    name: "ゴーゴージャグラー3",
    title: "ゴーゴージャグラー3の攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#FF4081", // Brighter Pink
  },
  {
    id: "girlsss",
    name: "ジャグラーガールズSS",
    title: "ジャグラーガールズSSの攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#2E7D32", // Green (swapped from miracle)
  },
  {
    id: "mr",
    name: "ミスタージャグラー",
    title: "ミスタージャグラーの攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#263238",
  },
  {
    id: "miracle",
    name: "ウルトラミラクルジャグラー",
    title: "ウルトラミラクルジャグラーの攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#AD1457", // Pink/Red (swapped from girlsss)
  },
  {
    id: "happyv3",
    name: "ハッピージャグラーVⅢ",
    title: "ハッピージャグラーVⅢの攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#AED581", // Light Yellow Green
  },
  {
    id: "hana-hooh",
    name: "ハナハナホウオウ～天翔～",
    title: "ハナハナホウオウ～天翔～の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#BF360C",
  },
  {
    id: "king-hanahana",
    name: "キングハナハナ-30",
    title: "キングハナハナ-30の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#D32F2F",
  },
  {
    id: "new-king-v",
    name: "ニューキングハナハナV-30",
    title: "ニューキングハナハナV-30の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#7B1FA2",
  },
  {
    id: "star-hanahana",
    name: "スターハナハナ-30",
    title: "スターハナハナ-30の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#E65100",
  },
  {
    id: "dragon-senko",
    name: "ドラゴンハナハナ～閃光～-30",
    title: "ドラゴンハナハナ～閃光～-30の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#B71C1C",
  },
  {
    id: "haihai-siosai2",
    name: "ハイハイシオサイ2",
    title: "ハイハイシオサイ2の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#00796B",
  },
  {
    id: "haihai-siosai",
    name: "ハイハイシオサイ",
    title: "ハイハイシオサイの攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#00695C",
  },
  {
    id: "new-hanahana-gold",
    name: "ニューハナハナゴールド-30",
    title: "ニューハナハナゴールド-30の攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#FBC02D", // gold color
  },
  {
    id: "last-utopia",
    name: "ラストユートピア",
    title: "ラストユートピアの攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "hana",
    color: "#1976D2",
  },
];
