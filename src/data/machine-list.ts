export type MachineCategory = "juggler" | "hana" | "other";

export interface MachineInfo {
  id: string;
  name: string;
  category: MachineCategory;
}

/**
 * 利用可能な機種リスト
 * カテゴリごとに分類してナビゲーションに使用
 */
export const AVAILABLE_MACHINES: MachineInfo[] = [
  // ジャグラー系
  { id: "funky2", name: "ファンキージャグラー2", category: "juggler" },
  { id: "imex", name: "SアイムEX/ネオアイムEX", category: "juggler" },
  { id: "myjuggler5", name: "マイジャグラーV", category: "juggler" },
  { id: "gogo3", name: "ゴーゴージャグラー3", category: "juggler" },
  { id: "girlsss", name: "ジャグラーガールズSS", category: "juggler" },
  { id: "mr", name: "ミスタージャグラー", category: "juggler" },
  { id: "miracle", name: "ウルトラミラクルジャグラー", category: "juggler" },
  { id: "happyv3", name: "ハッピージャグラーVⅢ", category: "juggler" },

  // ハナハナ系
  { id: "hana-hooh", name: "ハナハナホウオウ～天翔～", category: "hana" },
  // ※今後キングハナハナなどを追加予定
];
