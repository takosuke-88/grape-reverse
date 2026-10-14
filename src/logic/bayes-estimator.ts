import type {
  MachineConfig,
  UserInputs,
  EstimationResult,
} from "../types/machine-schema";
import { isHanaSetting6GuaranteeInput } from "../components/dynamic-ui/hana-lamp-hints";

/**
 * 判別の主軸にする通常時小役のカウンターID。
 * ハナハナ＝ベル、スマスロ ハナビ＝風鈴、それ以外（ジャグラー）＝ぶどう。
 * 既存機種は bell-count / grape-count のどちらかしか持たないため、従来の判定と結果は同じ。
 */
export function resolveSmallRoleId(config: MachineConfig): string {
  const ids = new Set(
    config.sections.flatMap((s) => s.elements).map((e) => e.id),
  );
  if (ids.has("bell-count")) return "bell-count";
  if (ids.has("furin-count")) return "furin-count";
  return "grape-count";
}

/**
 * 設定示唆カウンター（impliedSettings 付きの要素。2026-10-05）で否定された設定を集める。
 * 1回でも数えられた要素について、impliedSettings に含まれない設定を否定する。
 */
function collectImpliedDenials(
  config: MachineConfig,
  inputs: UserInputs,
  settings: number[],
  denied: Set<number>,
): void {
  [...config.sections, ...(config.detailSections ?? [])]
    .flatMap((s) => s.elements)
    .forEach((e) => {
      if (!e.impliedSettings) return;
      if ((Number(inputs[e.id]) || 0) <= 0) return;
      settings.forEach((s) => {
        if (!e.impliedSettings!.includes(s)) denied.add(s);
      });
    });
}

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
  collectImpliedDenials(config, inputs, settings, deniedSettings);

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
/**
 * 多項分布モデルによる設定推定。
 *
 * options.ignoreGrape: ぶどう（ベル）を計測していない入力に対して使う。
 *   通常モデルはハズレ確率を「1 − BIG − REG − ぶどう」で求めるため、ぶどうが
 *   未計測（0回）のまま渡すと「全ハズレの中でぶどうが1度も出ていない」という
 *   偽情報になり、ぶどう確率の低い低設定ほど尤度が跳ね上がる。実測では
 *   マイジャグラーV 3250G/BIG12/REG9 で設定1が99.7%という誤判定になった。
 *   このフラグを立てるとぶどう・チェリーを観測対象から外し、
 *   ハズレ確率を「1 − BIG − REG」とする3項モデルに切り替える
 *   （同条件で 20.6/21.7/21.5/17.0/13.0/6.2% と妥当な分布になる）。
 */
export function calculateMultinomialEstimation(
  config: MachineConfig,
  inputs: UserInputs,
  options?: { ignoreGrape?: boolean },
): EstimationResult[] {
  const ignoreGrape = options?.ignoreGrape === true;
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

  // 判別の主軸にする小役（ハナハナ＝ベル / ハナビ＝風鈴 / ジャグラー＝ぶどう）
  const allElements = config.sections.flatMap((s) => s.elements);
  const hasBell = allElements.some((e) => e.id === "bell-count");
  const grapeKey = resolveSmallRoleId(config);
  const k = ignoreGrape ? 0 : Number(inputs[grapeKey]) || 0;

  // BIG / REG / ぶどう(ベル) の settingValues を取得
  const bigEl = allElements.find((e) => e.id === "big-count");
  const regEl = allElements.find((e) => e.id === "reg-count");
  const grapeEl = allElements.find((e) => e.id === grapeKey);

  // 要素が揃わない場合は均等確率にフォールバック
  // （ignoreGrape 時はぶどう要素を使わないので存在しなくてよい）
  if (!bigEl || !regEl || (!grapeEl && !ignoreGrape)) {
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
  const c = !hasBell && !ignoreGrape ? (Number(inputs["cherry-count"]) || 0) : 0;

  // --- REG の契機内訳（単独REG / チェリーREG）を判別に使う（2026-09-13追加） ---
  // ジャグラーで最も設定差が大きいのは単独REG（例: マイジャグラーV 設定1→6 で確率2.00倍。
  // REG合計は1.68倍、BIG合計は1.21倍）。内訳を数えている人はその情報を活かす。
  //
  // 【重要】REG合計に内訳を「足す」と同じREG 1回を二重計上して尤度が壊れる。
  // そのため合計を内訳へ「分解」する。さらに内訳の生確率をそのまま使うのではなく、
  // **公表REG合計を基準にして単独:チェリーの比率だけを内訳データから使う**。
  // 理由: ミスタージャグラーは 1/単独REG + 1/チェリーREG が公表REGと最大4.53%ずれており、
  // 生値だとREG確率自体が公表スペックから外れてしまう。比率のみ使えば単独REGの判別力は
  // そのまま活き、ハズレ確率（pOther）も一切変化しない＝純粋に情報が増えるだけになる。
  const regSoloEl = allElements.find((e) => e.id === "reg-solo-count");
  const regCherryEl = allElements.find((e) => e.id === "reg-cherry-count");
  const rSolo = Number(inputs["reg-solo-count"]) || 0;
  const rCherry = Number(inputs["reg-cherry-count"]) || 0;
  const rUnknown = Number(inputs["reg-unknown-count"]) || 0;
  // 内訳の合計がREG合計と一致する時だけ使う（REG回数を直接入力した場合は不一致になる）。
  // 全て契機不明なら分解しても結果は REG合計のみの場合と数学的に同一。
  const useRegSplit =
    !!regSoloEl &&
    !!regCherryEl &&
    rSolo + rCherry > 0 &&
    rSolo + rCherry + rUnknown === r;

  // 各設定の多項分布対数尤度を計算
  const logLikelihoods = settings.map((setting) => {
    const denomBig = bigEl.settingValues[setting];
    const denomReg = regEl.settingValues[setting];
    const denomGrape = grapeEl?.settingValues[setting];

    // 分母が未定義・0の設定は計算不能 → -Infinity
    if (!denomBig || !denomReg || (!denomGrape && !ignoreGrape)) {
      return { setting, logLikelihood: -Infinity };
    }

    const pBig   = 1 / denomBig;
    const pReg   = 1 / denomReg;
    // ぶどう(ベル)を観測対象から外す条件（外すとハズレ確率から差し引かれない）:
    //   1. ignoreGrape 指定時（前任者ページ。ぶどうを数えようがない）
    //   2. k === 0、つまり未計測時（2026-09-13 追加）
    // 2 が無いと「ぶどうが1回も出ていない n ゲーム」という偽の観測になり、
    // ぶどう確率が最も低い設定1へ強烈に張り付く（ボーナスがどれだけ良くても覆らない）。
    // 実測: ファンキージャグラー2 2500G/BIG14/REG15（合成1/86.2＝設定6の1/119.6より遥かに上）
    // でも設定1=72.1%。除外すれば設定6=62.5%。
    // チェリーは元から `c > 0 &&` で同じガードを持っており、その形に揃えたもの。
    const pGrape = ignoreGrape || !denomGrape || k === 0 ? 0 : 1 / denomGrape;

    // 4軸: チェリーの確率（ジャグラー + cherry-count > 0 + settingValues 有効時のみ）
    const denomCherry = cherryEl?.settingValues[setting];
    const pCherry = (!ignoreGrape && c > 0 && denomCherry) ? 1 / denomCherry : 0;

    // 外れ項（ハズレ+リプレイ等）= 1 - P_BIG - P_REG - P_ぶどう - P_チェリー
    const pOther = 1 - pBig - pReg - pGrape - pCherry;

    let logL = 0;

    // b*log(P_BIG)
    if (b > 0) {
      if (pBig <= 0) return { setting, logLikelihood: -Infinity };
      logL += b * Math.log(pBig);
    }
    // REG項: 内訳（単独/チェリー）が揃っていれば分解して尤度に加える。
    // 揃っていなければ従来どおり REG合計だけを使う。
    const denomRegSolo = regSoloEl?.settingValues[setting];
    const denomRegCherry = regCherryEl?.settingValues[setting];
    if (useRegSplit && denomRegSolo && denomRegCherry) {
      if (pReg <= 0) return { setting, logLikelihood: -Infinity };
      // 公表REG合計を、内訳データ由来の比率で単独/チェリーへ配分する
      const soloShare =
        1 / denomRegSolo / (1 / denomRegSolo + 1 / denomRegCherry);
      const pRegSolo = pReg * soloShare;
      const pRegCherry = pReg * (1 - soloShare);
      if (rSolo > 0) logL += rSolo * Math.log(pRegSolo);
      if (rCherry > 0) logL += rCherry * Math.log(pRegCherry);
      // 契機不明REGは「単独かチェリーのどちらか」＝ REG合計の確率で評価する
      if (rUnknown > 0) logL += rUnknown * Math.log(pReg);
    } else if (r > 0) {
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
  collectImpliedDenials(config, inputs, settings, deniedSettings);

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
 * 詳細判別モデル（estimationModel: "detailed"。2026-10-14、スマスロ ハナビで導入）。
 *
 * 1. 通常時: 総ゲーム数を母数とする多項分布。観測はボーナス合計（BB/RB）と、
 *    入力のある小役グループの各項目。ハズレ等は「1 − 観測した役の確率の和」。
 *    - グループ単位で判別に入れる。グループ内のどれか1つでも入力があれば、
 *      そのグループの0回の項目も「数えた結果0回」として扱う（ハズレ確率から差し引く）。
 *      丸ごと0のグループは外す（数えていない項目を「0回出た」と扱わないため。2026-09-13の
 *      ぶどう未計測と同じ理由）。項目ごとに0を外すと、出たときだけ証拠にして出なかったときの
 *      証拠を捨てることになり、項目が多いほど判別が高設定側へ偏る。
 *    - members を持つ部品（風鈴の区別なし等）は「members のどれか」として確率の和で評価する。
 * 2. ボーナスの契機: ボーナス合計を契機へ「分解」する（足すと同じ当選を二重に数える）。
 *    公表のボーナス合計確率を基準に、契機ごとの比率だけ内訳の確率から使う（2026-09-13の
 *    REG内訳と同じ考え方。ハズレ確率が変わらない）。契機を記録していなければ合計だけで評価。
 * 3. ボーナス中・RT中: その状態のゲーム数を母数に、judgedIds の項目と「それ以外」で評価する。
 *    judgedIds の確率の和が1を超える組み合わせ（資料の値が粗い BB中の風鈴A 等）は入れない。
 * 4. 設定示唆（impliedSettings）による除外は他のモデルと共通。
 */
export function calculateDetailedEstimation(
  config: MachineConfig,
  inputs: UserInputs,
): EstimationResult[] {
  const settings = config.specs?.settings || [1, 2, 3, 4, 5, 6];
  const model = config.detailModel;
  const n = Number(inputs["total-games"]) || 0;
  const uniform = () =>
    settings.map((setting) => ({ setting, probability: 100 / settings.length }));
  if (n <= 0 || !model) return uniform();

  const elements = new Map(
    [...config.sections, ...(config.detailSections ?? [])]
      .flatMap((s) => s.elements)
      .map((e) => [e.id, e] as const),
  );
  const count = (id: string) => Math.max(0, Number(inputs[id]) || 0);
  const prob = (id: string, s: number) => {
    const denom = elements.get(id)?.settingValues[s];
    return denom ? 1 / denom : 0;
  };
  const partProb = (part: { id: string; members?: string[] }, s: number) =>
    part.members
      ? part.members.reduce((sum, m) => sum + prob(m, s), 0)
      : prob(part.id, s);

  const logLikelihoods = settings.map((setting) => {
    let logL = 0;
    let observed = 0; // 通常時の観測回数（ボーナス＋小役）
    let pObserved = 0; // 通常時に観測対象とした確率の和

    for (const split of model.bonusSplits) {
      const total = count(split.totalId);
      const pTotal = prob(split.totalId, setting);
      if (!pTotal) return { setting, logLikelihood: -Infinity };
      observed += total;
      pObserved += pTotal;
      const classified = split.parts.filter((p) => p.id !== split.unknownId);
      if (!classified.some((p) => count(p.id) > 0)) {
        if (total > 0) logL += total * Math.log(pTotal);
        continue;
      }
      const leafSum = classified
        .filter((p) => !p.members)
        .reduce((sum, p) => sum + prob(p.id, setting), 0);
      if (leafSum <= 0) return { setting, logLikelihood: -Infinity };
      const scale = pTotal / leafSum;
      let classifiedCount = 0;
      for (const part of classified) {
        const k = count(part.id);
        if (k === 0) continue;
        const p = partProb(part, setting) * scale;
        if (p <= 0) return { setting, logLikelihood: -Infinity };
        classifiedCount += k;
        logL += k * Math.log(p);
      }
      const unknown = total - classifiedCount;
      if (unknown > 0) logL += unknown * Math.log(pTotal);
    }

    for (const group of model.normalGroups) {
      if (!group.parts.some((p) => count(p.id) > 0)) continue;
      for (const part of group.parts) {
        if (!part.members) pObserved += prob(part.id, setting);
        const k = count(part.id);
        if (k === 0) continue;
        const p = partProb(part, setting);
        if (p <= 0) return { setting, logLikelihood: -Infinity };
        observed += k;
        logL += k * Math.log(p);
      }
    }

    const otherCount = n - observed;
    if (otherCount > 0) {
      const pOther = 1 - pObserved;
      if (pOther <= 0) return { setting, logLikelihood: -Infinity };
      logL += otherCount * Math.log(pOther);
    }

    for (const state of model.stateGroups) {
      const games = count(state.gamesId);
      if (games <= 0) continue;
      let judgedCount = 0;
      let pJudged = 0;
      for (const id of state.judgedIds) {
        const p = prob(id, setting);
        if (!p) continue;
        const k = count(id);
        pJudged += p;
        judgedCount += k;
        if (k > 0) logL += k * Math.log(p);
      }
      const rest = games - judgedCount;
      if (rest > 0) {
        if (1 - pJudged <= 0) return { setting, logLikelihood: -Infinity };
        logL += rest * Math.log(1 - pJudged);
      }
    }

    return { setting, logLikelihood: logL };
  });

  const deniedSettings = new Set<number>();
  collectImpliedDenials(config, inputs, settings, deniedSettings);
  logLikelihoods.forEach((item) => {
    if (deniedSettings.has(item.setting)) item.logLikelihood = -Infinity;
  });

  const maxLogLikelihood = Math.max(...logLikelihoods.map((l) => l.logLikelihood));
  if (!Number.isFinite(maxLogLikelihood)) return uniform();
  const likelihoods = logLikelihoods.map(({ setting, logLikelihood }) => ({
    setting,
    likelihood: Math.exp(logLikelihood - maxLogLikelihood),
  }));
  const totalLikelihood = likelihoods.reduce((sum, l) => sum + l.likelihood, 0);
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
