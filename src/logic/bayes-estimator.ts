import type {
  MachineConfig,
  UserInputs,
  EstimationResult,
} from "../types/machine-schema";
import { isHanaSetting6GuaranteeInput } from "../components/dynamic-ui/hana-lamp-hints";

/**
 * 回転数に応じたブドウのウェイト（信頼度）を計算（線形補間）
 */
export function calculateGrapeWeight(
  totalGames: number,
  weightMap?: Record<number, number>,
): number {
  if (!weightMap) return 1.0;

  const thresholds = Object.keys(weightMap)
    .map(Number)
    .sort((a, b) => a - b);

  if (thresholds.length === 0) return 1.0;

  // 範囲外の処理
  if (totalGames <= thresholds[0]) return weightMap[thresholds[0]];
  if (totalGames >= thresholds[thresholds.length - 1])
    return weightMap[thresholds[thresholds.length - 1]];

  // 線形補間
  for (let i = 0; i < thresholds.length - 1; i++) {
    const lower = thresholds[i];
    const upper = thresholds[i + 1];
    if (totalGames >= lower && totalGames < upper) {
      const lowerWeight = weightMap[lower];
      const upperWeight = weightMap[upper];
      const ratio = (totalGames - lower) / (upper - lower);
      return lowerWeight + (upperWeight - lowerWeight) * ratio;
    }
  }

  return 1.0;
}

/**
 * ベイズ推定による設定期待度計算
 *
 * @param config 機種の設定ファイル
 * @param inputs ユーザーの入力値
 * @returns 設定1〜6の期待度（%）
 */
export function calculateEstimation(
  config: MachineConfig,
  inputs: UserInputs,
): EstimationResult[] {
  const settings = config.specs?.settings || [1, 2, 3, 4, 5, 6];

  // 総ゲーム数を取得（判別の試行回数として使用）
  const totalGames = Number(inputs["total-games"]) || 0;

  if (totalGames === 0) {
    // データがない場合は均等確率を返す
    return settings.map((setting) => ({
      setting,
      probability: 100 / settings.length,
    }));
  }

  // --- 設定6濃厚（虹ランプ）：期待度を設定6に100%再分配 ---
  if (isHanaSetting6GuaranteeInput(inputs)) {
    const topSetting = Math.max(...settings);
    return settings.map((setting) => ({
      setting,
      probability: setting === topSetting ? 100 : 0,
    }));
  }

  // 無効化すべき要素IDを特定 (conflictsWith)
  const activeElements = config.sections
    .flatMap((s) => s.elements)
    .filter((e) => (Number(inputs[e.id]) || 0) > 0);
  const disabledIds = new Set<string>();
  activeElements.forEach((e) => {
    e.conflictsWith?.forEach((id) => disabledIds.add(id));
  });

  // 各設定の対数尤度を計算
  const logLikelihoods = settings.map((setting) => {
    let logLikelihood = 0;

    // 全セクションの判別要素を走査
    config.sections.forEach((section) => {
      section.elements.forEach((element) => {
        // 判別要素のみを計算対象とする
        if (!element.isDiscriminationFactor) return;
        // 競合により無効化された要素はスキップ
        if (disabledIds.has(element.id)) return;

        const count = Number(inputs[element.id]) || 0;
        if (count === 0) return; // データがない要素はスキップ

        const expectedValue = element.settingValues[setting];
        if (!expectedValue || expectedValue === 0) return;

        // 確率を計算（分母から確率へ変換）
        const probability = 1 / expectedValue;

        // 対数尤度を計算
        // L = p^k * (1-p)^(n-k)
        // log(L) = k * log(p) + (n-k) * log(1-p)
        const logP = Math.log(probability);
        const log1MinusP = Math.log(1 - probability);

        const elementLogLikelihood =
          count * logP + (totalGames - count) * log1MinusP;

        // 判別重要度で重み付け
        let weight = element.discriminationWeight || 1.0;

        // 可変ウェイトの適用 (judgmentWeights)
        if (config.specs?.judgmentWeights) {
          const { judgmentWeights } = config.specs;

          // REG: 基礎ウェイトの適用
          if (
            element.id === "reg-count" &&
            judgmentWeights.regBaseWeight !== undefined
          ) {
            weight *= judgmentWeights.regBaseWeight;
          }

          // BIG: 基礎ウェイトの適用
          if (
            element.id === "big-count" &&
            judgmentWeights.bigBaseWeight !== undefined
          ) {
            weight *= judgmentWeights.bigBaseWeight;
          }

          // ブドウ: 回転数連動型ウェイト (線形補間)
          if (element.id === "grape-count" && judgmentWeights.grapeWeightMap) {
            const dynamicWeight = calculateGrapeWeight(
              totalGames,
              judgmentWeights.grapeWeightMap,
            );
            weight *= dynamicWeight;
          }
        }

        logLikelihood += elementLogLikelihood * weight;
      });
    });

    return {
      setting,
      logLikelihood,
    };
  });

  // --- REG後フェザーランプ等による設定否定ロジック ---
  const deniedSettings = new Set<number>();
  if ((Number(inputs["reg-after-blue"]) || 0) > 0) {
    deniedSettings.add(1);
  }
  if ((Number(inputs["reg-after-yellow"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
  }
  if ((Number(inputs["reg-after-green"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
    deniedSettings.add(3);
  }
  if ((Number(inputs["reg-after-red"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
    deniedSettings.add(3);
    deniedSettings.add(4);
  }
  if ((Number(inputs["reg-after-rainbow"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
    deniedSettings.add(3);
    deniedSettings.add(4);
    deniedSettings.add(5);
  }

  // 否定された設定の対数尤度を -Infinity にする（尤度に変換した際に0になる）
  logLikelihoods.forEach((item) => {
    if (deniedSettings.has(item.setting)) {
      item.logLikelihood = -Infinity;
    }
  });

  // 最大対数尤度でオフセット（数値の安定性のため）
  const maxLogLikelihood = Math.max(
    ...logLikelihoods.map((l) => l.logLikelihood),
  );

  // 尤度に変換（exp）
  const likelihoods = logLikelihoods.map(({ setting, logLikelihood }) => ({
    setting,
    likelihood: Math.exp(logLikelihood - maxLogLikelihood),
  }));

  // 正規化して確率（%）に変換
  const totalLikelihood = likelihoods.reduce((sum, l) => sum + l.likelihood, 0);

  if (totalLikelihood === 0) {
    // 全て0の場合は均等確率
    return settings.map((setting) => ({
      setting,
      probability: 100 / settings.length,
    }));
  }

  return likelihoods.map(({ setting, likelihood }) => ({
    setting,
    probability: (likelihood / totalLikelihood) * 100,
  }));
}

/**
 * 多項分布の対数尤度モデルによるベイズ推定（逆算ページ専用）
 *
 * ぶどう逆算ページ用に設計された3軸（BIG / REG / ぶどう）の多項分布モデル。
 * 独自重み付け（discriminationWeight / grapeWeightMap）は使用せず、
 * 数学的に正確な多項分布対数尤度のみで設定期待度を算出する。
 *
 * logL(設定X) = b*log(P_BIG) + r*log(P_REG) + k*log(P_grape)
 *             + (n - b - r - k) * log(1 - P_BIG - P_REG - P_grape)
 *
 * @param config 機種の設定ファイル
 * @param inputs ユーザーの入力値（total-games, big-count, reg-count, grape-count or bell-count）
 * @returns 設定1〜6の期待度（%）
 */
export function calculateMultinomialEstimation(
  config: MachineConfig,
  inputs: UserInputs,
): EstimationResult[] {
  const settings = config.specs?.settings || [1, 2, 3, 4, 5, 6];
  const n = Number(inputs["total-games"]) || 0;
  const b = Number(inputs["big-count"]) || 0;
  const r = Number(inputs["reg-count"]) || 0;

  if (n === 0) {
    return settings.map((setting) => ({
      setting,
      probability: 100 / settings.length,
    }));
  }

  // ハナハナ（bell-count）かジャグラー（grape-count）かを判定
  const allElements = config.sections.flatMap((s) => s.elements);
  const hasBell = allElements.some((e) => e.id === "bell-count");
  const grapeKey = hasBell ? "bell-count" : "grape-count";
  const k = Number(inputs[grapeKey]) || 0;

  // BIG / REG / ぶどう(ベル) の settingValues を取得
  const bigEl = allElements.find((e) => e.id === "big-count");
  const regEl = allElements.find((e) => e.id === "reg-count");
  const grapeEl = allElements.find((e) => e.id === grapeKey);

  // 要素が揃わない場合は均等確率にフォールバック
  if (!bigEl || !regEl || !grapeEl) {
    return settings.map((setting) => ({
      setting,
      probability: 100 / settings.length,
    }));
  }

  // --- 設定6濃厚（虹ランプ）：期待度を設定6に100%再分配 ---
  if (isHanaSetting6GuaranteeInput(inputs)) {
    const topSetting = Math.max(...settings);
    return settings.map((setting) => ({
      setting,
      probability: setting === topSetting ? 100 : 0,
    }));
  }

  // チェリー（ジャグラー限定・ハナハナは常に0扱い）
  // cherry-count > 0 かつ settingValues が存在する場合のみ4軸モデルへ自動切替
  const cherryEl = !hasBell
    ? allElements.find((e) => e.id === "cherry-count")
    : undefined;
  const c = !hasBell ? (Number(inputs["cherry-count"]) || 0) : 0;

  // 各設定の多項分布対数尤度を計算
  const logLikelihoods = settings.map((setting) => {
    const denomBig = bigEl.settingValues[setting];
    const denomReg = regEl.settingValues[setting];
    const denomGrape = grapeEl.settingValues[setting];

    // 分母が未定義・0の設定は計算不能 → -Infinity
    if (!denomBig || !denomReg || !denomGrape) {
      return { setting, logLikelihood: -Infinity };
    }

    const pBig   = 1 / denomBig;
    const pReg   = 1 / denomReg;
    const pGrape = 1 / denomGrape;

    // 4軸: チェリーの確率（ジャグラー + cherry-count > 0 + settingValues 有効時のみ）
    const denomCherry = cherryEl?.settingValues[setting];
    const pCherry = (c > 0 && denomCherry) ? 1 / denomCherry : 0;

    // 外れ項（ハズレ+リプレイ等）= 1 - P_BIG - P_REG - P_ぶどう - P_チェリー
    const pOther = 1 - pBig - pReg - pGrape - pCherry;

    let logL = 0;

    // b*log(P_BIG)
    if (b > 0) {
      if (pBig <= 0) return { setting, logLikelihood: -Infinity };
      logL += b * Math.log(pBig);
    }
    // r*log(P_REG)
    if (r > 0) {
      if (pReg <= 0) return { setting, logLikelihood: -Infinity };
      logL += r * Math.log(pReg);
    }
    // k*log(P_ぶどう or P_ベル)
    if (k > 0) {
      if (pGrape <= 0) return { setting, logLikelihood: -Infinity };
      logL += k * Math.log(pGrape);
    }
    // c*log(P_チェリー)  ← 4軸拡張: チェリーあり時のみ加算（多項係数は正規化で相殺されるため省略）
    if (pCherry > 0 && c > 0) {
      logL += c * Math.log(pCherry);
    }
    // (n - b - r - k - c)*log(pOther)  ← 外れ項（設定によって変動するため省略不可）
    const otherCount = n - b - r - k - (pCherry > 0 ? c : 0);
    if (otherCount > 0) {
      if (pOther <= 0) return { setting, logLikelihood: -Infinity };
      logL += otherCount * Math.log(pOther);
    }

    return { setting, logLikelihood: logL };
  });

  // --- フェザーランプ等による設定否定ロジック（既存と同一） ---
  const deniedSettings = new Set<number>();
  if ((Number(inputs["reg-after-blue"]) || 0) > 0) {
    deniedSettings.add(1);
  }
  if ((Number(inputs["reg-after-yellow"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
  }
  if ((Number(inputs["reg-after-green"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
    deniedSettings.add(3);
  }
  if ((Number(inputs["reg-after-red"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
    deniedSettings.add(3);
    deniedSettings.add(4);
  }
  if ((Number(inputs["reg-after-rainbow"]) || 0) > 0) {
    deniedSettings.add(1);
    deniedSettings.add(2);
    deniedSettings.add(3);
    deniedSettings.add(4);
    deniedSettings.add(5);
  }

  logLikelihoods.forEach((item) => {
    if (deniedSettings.has(item.setting)) {
      item.logLikelihood = -Infinity;
    }
  });

  // 最大対数尤度でオフセット後に exp → 正規化
  const maxLogLikelihood = Math.max(
    ...logLikelihoods.map((l) => l.logLikelihood),
  );

  const likelihoods = logLikelihoods.map(({ setting, logLikelihood }) => ({
    setting,
    likelihood: Math.exp(logLikelihood - maxLogLikelihood),
  }));

  const totalLikelihood = likelihoods.reduce((sum, l) => sum + l.likelihood, 0);

  if (totalLikelihood === 0) {
    return settings.map((setting) => ({
      setting,
      probability: 100 / settings.length,
    }));
  }

  return likelihoods.map(({ setting, likelihood }) => ({
    setting,
    probability: (likelihood / totalLikelihood) * 100,
  }));
}

/**
 * 最も可能性の高い設定を取得
 */
export function getMostLikelySetting(
  results: EstimationResult[],
): EstimationResult {
  return results.reduce((max, current) =>
    current.probability > max.probability ? current : max,
  );
}

/**
 * 高設定（5-6）の合算確率を計算
 */
export function getHighSettingProbability(results: EstimationResult[]): number {
  return results
    .filter((r) => r.setting >= 5)
    .reduce((sum, r) => sum + r.probability, 0);
}
