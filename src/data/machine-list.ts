/** btrt: ジャグラー・ハナハナ以外のBT/RT機（トップページの「BT/RT」見出し。2026-10-05） */
export type MachineCategory = "juggler" | "hana" | "btrt" | "other";

export interface MachineInfo {
  id: string;
  name: string;
  title?: string;
  category: MachineCategory;
  color: string;
  /**
   * ぶどう/ベル逆算ページ（/:machineId/grape）を持つか（未指定時 true）。
   * false の機種はナビの逆算ボタンを出さず、sitemap と静的HTML生成からも外す
   * （scripts/generate-sitemap.js / generate-seo-shells.mjs がこの記述を読む）。
   */
  reverseCalc?: boolean;
  /**
   * 詳細判別ページ（/:machineId/detail）を持つか（未指定時 false。2026-10-14）。
   * true の機種はナビの2番目（逆算ボタンの位置）に「詳細判別」を出し、静的HTMLも生成する。
   * noindex のため sitemap には載せない。機種設定に detailSections が必要。
   */
  detailPage?: boolean;
}

/**
 * 利用可能な機種リスト
 * カテゴリごとに分類してナビゲーションに使用
 */
export const AVAILABLE_MACHINES: MachineInfo[] = [
  {
    id: "myjuggler5",
    name: "マイジャグラーⅥ(V)",
    title: "マイジャグラーⅥ(V)の攻略・設定判別 ぶどう逆算｜GrapeReverse",
    category: "juggler",
    color: "#D81B60",
  },
  {
    id: "aimex",
    name: "ネオアイムジャグラーEX",
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
  {
    id: "hanabi",
    name: "スマスロ ハナビ",
    title: "スマスロ ハナビの攻略・設定判別｜GrapeReverse",
    category: "btrt",
    color: "#283593",
    reverseCalc: false,
    detailPage: true,
  },
  {
    id: "takoslo",
    name: "スマスロ タコスロ",
    title: "スマスロ タコスロの攻略・設定判別｜GrapeReverse",
    category: "btrt",
    color: "#9F1239",
    reverseCalc: false,
    detailPage: true,
  },
  {
    id: "thunder-v",
    name: "スマスロ サンダーV",
    title: "スマスロ サンダーVの攻略・設定判別 ベル逆算｜GrapeReverse",
    category: "btrt",
    color: "#92400E",
    // BT/RTで初めて逆算ページ（ベル逆算）と詳細判別ページの両方を持つ機種（ナビは4つ並び）
    detailPage: true,
  },
];

/** ぶどう/ベル逆算ページを持つ機種か */
export function hasReverseCalcPage(machineId: string | undefined): boolean {
  const info = AVAILABLE_MACHINES.find((m) => m.id === machineId);
  return info?.reverseCalc !== false;
}

/** 詳細判別ページを持つ機種か */
export function hasDetailPage(machineId: string | undefined): boolean {
  const info = AVAILABLE_MACHINES.find((m) => m.id === machineId);
  return info?.detailPage === true;
}
