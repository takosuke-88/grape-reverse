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
    color: "#0277BD",
  },
  {
    id: "girlsss",
    name: "ジャグラーガールズSS",
    category: "juggler",
    color: "#AD1457",
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
    color: "#2E7D32",
  },
  {
    id: "happyv3",
    name: "ハッピージャグラーVⅢ",
    category: "juggler",
    color: "#FBC02D",
  },
  {
    id: "hana-hooh",
    name: "ハナハナホウオウ～天翔～",
    category: "hana",
    color: "#BF360C",
  },
];
