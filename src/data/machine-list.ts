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
  { id: "funky-juggler-2", name: "ファンキージャグラー2", category: "juggler" },
  { id: "im-juggler-ex", name: "SアイムEX/ネオアイムEX", category: "juggler" },
  { id: "my-juggler-5", name: "マイジャグラーV", category: "juggler" },

  // ハナハナ系
  { id: "hana-hooh", name: "ハナハナホウオウ～天翔～", category: "hana" },
  // ※今後キングハナハナなどを追加予定
];
