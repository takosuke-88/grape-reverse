"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGrapeWeight = calculateGrapeWeight;
exports.calculateEstimation = calculateEstimation;
exports.getMostLikelySetting = getMostLikelySetting;
exports.getHighSettingProbability = getHighSettingProbability;
/**
 * 回転数に応じたブドウのウェイト（信頼度）を計算（線形補間）
 */
function calculateGrapeWeight(totalGames, weightMap) {
    if (!weightMap)
        return 1.0;
    var thresholds = Object.keys(weightMap)
        .map(Number)
        .sort(function (a, b) { return a - b; });
    if (thresholds.length === 0)
        return 1.0;
    // 範囲外の処理
    if (totalGames <= thresholds[0])
        return weightMap[thresholds[0]];
    if (totalGames >= thresholds[thresholds.length - 1])
        return weightMap[thresholds[thresholds.length - 1]];
    // 線形補間
    for (var i = 0; i < thresholds.length - 1; i++) {
        var lower = thresholds[i];
        var upper = thresholds[i + 1];
        if (totalGames >= lower && totalGames < upper) {
            var lowerWeight = weightMap[lower];
            var upperWeight = weightMap[upper];
            var ratio = (totalGames - lower) / (upper - lower);
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
function calculateEstimation(config, inputs) {
    var settings = [1, 2, 3, 4, 5, 6];
    // 総ゲーム数を取得（判別の試行回数として使用）
    var totalGames = Number(inputs["total-games"]) || 0;
    if (totalGames === 0) {
        // データがない場合は均等確率を返す
        return settings.map(function (setting) { return ({
            setting: setting,
            probability: 100 / settings.length,
        }); });
    }
    // --- 設定6確定演出（例外処理） ---
    // ハナハナホウオウの「reg-lamp-rainbow」等、入力が1以上の場合は設定6の期待度を100%とする
    var isSetting6Guaranteed = (Number(inputs["reg-lamp-rainbow"]) || 0) > 0 ||
        (Number(inputs["bonus-rainbow"]) || 0) > 0; // 汎用的な別フラグも念のため
    if (isSetting6Guaranteed) {
        return settings.map(function (setting) { return ({
            setting: setting,
            probability: setting === 6 ? 100 : 0,
        }); });
    }
    // 無効化すべき要素IDを特定 (conflictsWith)
    var activeElements = config.sections
        .flatMap(function (s) { return s.elements; })
        .filter(function (e) { return (Number(inputs[e.id]) || 0) > 0; });
    var disabledIds = new Set();
    activeElements.forEach(function (e) {
        var _a;
        (_a = e.conflictsWith) === null || _a === void 0 ? void 0 : _a.forEach(function (id) { return disabledIds.add(id); });
    });
    // 各設定の対数尤度を計算
    var logLikelihoods = settings.map(function (setting) {
        var logLikelihood = 0;
        // 全セクションの判別要素を走査
        config.sections.forEach(function (section) {
            section.elements.forEach(function (element) {
                var _a;
                // 判別要素のみを計算対象とする
                if (!element.isDiscriminationFactor)
                    return;
                // 競合により無効化された要素はスキップ
                if (disabledIds.has(element.id))
                    return;
                var count = Number(inputs[element.id]) || 0;
                if (count === 0)
                    return; // データがない要素はスキップ
                var expectedValue = element.settingValues[setting];
                if (!expectedValue || expectedValue === 0)
                    return;
                // 確率を計算（分母から確率へ変換）
                var probability = 1 / expectedValue;
                // 対数尤度を計算
                // L = p^k * (1-p)^(n-k)
                // log(L) = k * log(p) + (n-k) * log(1-p)
                var logP = Math.log(probability);
                var log1MinusP = Math.log(1 - probability);
                var elementLogLikelihood = count * logP + (totalGames - count) * log1MinusP;
                // 判別重要度で重み付け
                var weight = element.discriminationWeight || 1.0;
                // 可変ウェイトの適用 (judgmentWeights)
                if ((_a = config.specs) === null || _a === void 0 ? void 0 : _a.judgmentWeights) {
                    var judgmentWeights = config.specs.judgmentWeights;
                    // REG: 基礎ウェイトの適用
                    if (element.id === "reg-count" &&
                        judgmentWeights.regBaseWeight !== undefined) {
                        weight *= judgmentWeights.regBaseWeight;
                    }
                    // BIG: 基礎ウェイトの適用
                    if (element.id === "big-count" &&
                        judgmentWeights.bigBaseWeight !== undefined) {
                        weight *= judgmentWeights.bigBaseWeight;
                    }
                    // ブドウ: 回転数連動型ウェイト (線形補間)
                    if (element.id === "grape-count" && judgmentWeights.grapeWeightMap) {
                        var dynamicWeight = calculateGrapeWeight(totalGames, judgmentWeights.grapeWeightMap);
                        weight *= dynamicWeight;
                    }
                }
                logLikelihood += elementLogLikelihood * weight;
            });
        });
        return {
            setting: setting,
            logLikelihood: logLikelihood,
        };
    });
    // --- REG後フェザーランプ等による設定否定ロジック ---
    var deniedSettings = new Set();
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
    logLikelihoods.forEach(function (item) {
        if (deniedSettings.has(item.setting)) {
            item.logLikelihood = -Infinity;
        }
    });
    // 最大対数尤度でオフセット（数値の安定性のため）
    var maxLogLikelihood = Math.max.apply(Math, logLikelihoods.map(function (l) { return l.logLikelihood; }));
    // 尤度に変換（exp）
    var likelihoods = logLikelihoods.map(function (_a) {
        var setting = _a.setting, logLikelihood = _a.logLikelihood;
        return ({
            setting: setting,
            likelihood: Math.exp(logLikelihood - maxLogLikelihood),
        });
    });
    // 正規化して確率（%）に変換
    var totalLikelihood = likelihoods.reduce(function (sum, l) { return sum + l.likelihood; }, 0);
    if (totalLikelihood === 0) {
        // 全て0の場合は均等確率
        return settings.map(function (setting) { return ({
            setting: setting,
            probability: 100 / settings.length,
        }); });
    }
    return likelihoods.map(function (_a) {
        var setting = _a.setting, likelihood = _a.likelihood;
        return ({
            setting: setting,
            probability: (likelihood / totalLikelihood) * 100,
        });
    });
}
/**
 * 最も可能性の高い設定を取得
 */
function getMostLikelySetting(results) {
    return results.reduce(function (max, current) {
        return current.probability > max.probability ? current : max;
    });
}
/**
 * 高設定（5-6）の合算確率を計算
 */
function getHighSettingProbability(results) {
    return results
        .filter(function (r) { return r.setting >= 5; })
        .reduce(function (sum, r) { return sum + r.probability; }, 0);
}
