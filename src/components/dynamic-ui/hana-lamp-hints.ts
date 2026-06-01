import type { UserInputs } from "../../types/machine-schema";

/**
 * ハナハナ系：BIG後 / REG後 フェザーランプ（トップパネル）の示唆テキスト
 */

const BIG_AFTER_HINTS: Record<string, string> = {
  "big-feather-blue": "高設定期待度：低",
  "big-feather-yellow": "高設定期待度：低〜中",
  "big-feather-green": "高設定期待度：中",
  "big-feather-red": "高設定期待度：高",
  "big-feather-rainbow": "設定6濃厚",
};

const REG_AFTER_HINTS: Record<string, string> = {
  "reg-after-blue": "設定2以上確定",
  "reg-after-yellow": "設定3以上確定",
  "reg-after-green": "設定4以上確定",
  "reg-after-red": "設定5以上確定",
  "reg-after-rainbow": "設定6濃厚",
};

/** 白・未登録は null（デフォルト＝注記なし） */
export function getHanaFeatherLampHint(elementId: string): string | null {
  return BIG_AFTER_HINTS[elementId] ?? REG_AFTER_HINTS[elementId] ?? null;
}

/** 設定推測で設定6を100%固定する虹ランプID */
export const HANA_SETTING6_GUARANTEE_IDS = [
  "reg-lamp-rainbow",
  "bonus-rainbow",
  "big-feather-rainbow",
  "reg-after-rainbow",
] as const;

export function isHanaSetting6GuaranteeElementId(elementId: string): boolean {
  return (HANA_SETTING6_GUARANTEE_IDS as readonly string[]).includes(elementId);
}

export function isHanaSetting6GuaranteeInput(inputs: UserInputs): boolean {
  return HANA_SETTING6_GUARANTEE_IDS.some(
    (id) => (Number(inputs[id]) || 0) > 0,
  );
}

/** EstimationResultDisplay 用バッジ文言 */
export function getRegAfterDenialBadge(
  elementId: string,
  count: number,
): string | null {
  if (count <= 0) return null;
  return getHanaFeatherLampHint(elementId);
}
