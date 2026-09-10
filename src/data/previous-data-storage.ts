// 前任者データ（データランプに残っている前の人の実績）の保存先。
//
// 前任者タブ（/:machineId/prev）が読み書きし、小役カウンター・逆算ページの
// リセットからも消せるようにキー定義だけを共有する。

/** 前任者データの localStorage キー */
export function previousDataStorageKey(machineId: string): string {
  return `grape-reverse-prev-${machineId}`;
}

/** 前任者データの初期値（total-games / big-count / reg-count） */
export const PREVIOUS_DATA_INITIAL: Record<string, number> = {};
