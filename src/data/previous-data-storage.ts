// 前任者データ（データランプに残っている前の人の実績）の保存先と、
// リセット時に連動して消す必要があるキーの定義。
//
// 設定判別ページと前任者ページは、判別が「現在 − 前任者」で連動しているため
// どちらでリセットしても両方消える（2026-09-22決定）。そのため両ページが同じ
// キーを参照する必要があり、文字列の二重定義でズレないようここへ集約している。
// 逆算ページは判別に関与しない独立したページなので、自分の入力だけを消す。

/** 前任者データの localStorage キー */
export function previousDataStorageKey(machineId: string): string {
  return `grape-reverse-prev-${machineId}`;
}

/** 設定判別ページ（小役カウンター）の入力値の localStorage キー */
export function counterDataStorageKey(machineId: string): string {
  return `grape-reverse-data-${machineId}`;
}

/** 設定判別ページのボーナス履歴（LIFO スタック）の localStorage キー */
export function bonusHistoryStorageKeys(machineId: string): string[] {
  return [
    `grape-reverse-big-history-${machineId}`,
    `grape-reverse-reg-history-${machineId}`,
  ];
}

/** 前任者データの初期値（total-games / big-count / reg-count） */
export const PREVIOUS_DATA_INITIAL: Record<string, number> = {};
