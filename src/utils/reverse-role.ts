import type { MachineConfig } from "../types/machine-schema";
import { resolveSmallRoleId } from "../logic/bayes-estimator";

/**
 * 逆算ページで逆算する小役（ぶどう／ベル）。
 * ハナハナと、設定ファイルに bell-count を持つ機種（スマスロ サンダーV。2026-10-26）はベル、
 * それ以外はぶどう。ナビの「ベル逆算／ぶどう逆算」・逆算ページ・その判別パネルで共通に使う。
 */
export function getReverseRole(
  config: MachineConfig | null | undefined,
  category: string | undefined,
) {
  const isBell =
    category === "hana" || (!!config && resolveSmallRoleId(config) === "bell-count");
  return isBell
    ? { id: "bell-count", label: "ベル", icon: "🔔", metricLabel: "ベル確率" }
    : { id: "grape-count", label: "ぶどう", icon: "🍇", metricLabel: "ブドウ確率" };
}
