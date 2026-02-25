export type MachineCategory = "juggler" | "hana" | "other";

export interface MachineInfo {
  id: string;
  name: string;
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
    category: "juggler",
    color: "#D81B60",
  },
  {
    id: "aimex",
    name: "SアイムEX/ネオアイムEX",
    category: "juggler",
    color: "#C62828",
  },
  {
    id: "funky2",
    name: "ファンキージャグラー2",
    category: "juggler",
    color: "#6A1B9A",
  },
  {
    id: "gogo3",
    name: "ゴーゴージャグラー3",
    category: "juggler",
    color: "#E91E63", // Pink
  },
  {
    id: "girlsss",
    name: "ジャグラーガールズSS",
    category: "juggler",
    color: "#2E7D32", // Green (swapped from miracle)
  },
  {
    id: "mr",
    name: "ミスタージャグラー",
    category: "juggler",
    color: "#263238",
  },
  {
    id: "miracle",
    name: "ウルトラミラクルジャグラー",
    category: "juggler",
    color: "#AD1457", // Pink/Red (swapped from girlsss)
  },
  {
    id: "happyv3",
    name: "ハッピージャグラーVⅢ",
    category: "juggler",
    color: "#AED581", // Light Yellow Green
  },
  {
    id: "hana-hooh",
    name: "ハナハナホウオウ～天翔～",
    category: "hana",
    color: "#BF360C",
  },
];
