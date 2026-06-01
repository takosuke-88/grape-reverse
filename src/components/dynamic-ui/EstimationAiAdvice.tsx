import type { EstimationResult, MachineConfig } from "../../types/machine-schema";

interface EstimationAiAdviceProps {
  config: MachineConfig;
  totalGames: number;
  currentCategory: string;
  estimationResults: EstimationResult[] | null;
}

export default function EstimationAiAdvice({
  config,
  totalGames,
  currentCategory,
  estimationResults,
}: EstimationAiAdviceProps) {
  const highSettingProb = (estimationResults || [])
    .filter((r) => r.setting >= 5)
    .reduce((sum, r) => sum + r.probability, 0);

  let rankStyle = "";
  let rankIcon = "🤖";

  if (highSettingProb >= 70) {
    rankStyle =
      "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20";
    rankIcon = "👑";
  } else if (highSettingProb >= 50) {
    rankStyle =
      "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
    rankIcon = "🔥";
  } else if (highSettingProb >= 30) {
    rankStyle =
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10";
    rankIcon = "🤔";
  } else {
    rankStyle =
      "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50";
    rankIcon = "⚠️";
  }

  return (
    <div
      className={`mb-4 rounded-lg border p-4 transition-colors duration-300 ${rankStyle}`}
    >
      <div className="mb-2 flex items-center gap-2 border-b border-black/5 pb-2 dark:border-white/5">
        <span className="text-xl">{rankIcon}</span>
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          AI判定アドバイス ({totalGames}G時点)
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {config.id.includes("siosai") || config.id === "last-utopia" ? (
          <>
            {totalGames <= 2000 && (
              <>
                序盤戦です。この機種は
                <span className="font-bold underline decoration-indigo-400 decoration-2">
                  ボーナス合算確率の維持
                </span>
                が最重要になります。
                {highSettingProb >= 50 &&
                  "現在の合算は非常に優秀です。このペースを維持できるか注目しましょう。"}
                {highSettingProb < 30 &&
                  "ボーナスが重い立ち上がりです。合算が回復しない場合は深追い禁物です。"}
              </>
            )}
            {totalGames > 2000 && totalGames <= 4000 && (
              <>
                中盤戦に差し掛かりました。
                {highSettingProb >= 50
                  ? "ボーナス合算がしっかり引けており、高設定の期待が持てる展開です。引き続き数値を注視しましょう。"
                  : "合算確率が落ちてきています。周囲の状況等も踏まえ、設定の見切り時を探る必要があります。"}
              </>
            )}
            {totalGames > 4000 && (
              <>
                終盤戦です。サンプルは十分に集まりました。
                {highSettingProb >= 70 && (
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    圧巻のボーナス合算です。間違いなく高設定挙動ですので、閉店まで回し切りましょう！
                  </span>
                )}
                {highSettingProb >= 50 && highSettingProb < 70 && (
                  <span className="font-bold text-red-600 dark:text-red-400">
                    合算確率は良好な水準をキープしています。設定5・6の可能性を意識して続行を推奨します。
                  </span>
                )}
                {highSettingProb >= 30 && highSettingProb < 50 && (
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    中間設定寄りの数値です。悪くはないですが、これ以上の伸び悩みが見えたら撤退も視野に。
                  </span>
                )}
                {highSettingProb < 30 && (
                  <span className="font-bold text-slate-500">
                    ボーナス合算が設定1以下の数値です。これ以上の投資は危険が高いと言えます。
                  </span>
                )}
              </>
            )}
          </>
        ) : currentCategory === "hana" ? (
          <>
            {totalGames <= 1500 && (
              <>
                序盤戦です。ボーナス合算よりも
                <span className="font-bold underline decoration-indigo-400 decoration-2">
                  BIG中のスイカ出現率や、REGサイドランプの色（奇遇判別）
                </span>
                の偏りを重視して設定の上下を見極めましょう。
                {highSettingProb >= 50 && "現状の滑り出しはとても良好です。"}
                {highSettingProb < 30 &&
                  "ボーナスが引けていても中身が伴っていない可能性があります、要注意。"}
              </>
            )}
            {totalGames > 1500 && totalGames <= 3000 && (
              <>
                中盤戦に差し掛かりました。
                <span className="font-bold">ベル逆算値とボーナス合算</span>
                のバランスが重要になります。
                {highSettingProb >= 50
                  ? "数値は設定4以上、あるいは高設定の塊を十分狙える挙動を示しています。"
                  : "設定4の妥協点を探るか、周囲の台の状況（塊や法則性）も加味して続行を判断してください。"}
              </>
            )}
            {totalGames > 3000 && (
              <>
                終盤戦です。サンプルは十分に集まりました。
                {highSettingProb >= 70 && (
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    サイドランプ・スイカ共に文句なし。閉店までブン回すべきお宝台です！
                  </span>
                )}
                {highSettingProb >= 50 && highSettingProb < 70 && (
                  <span className="font-bold text-red-600 dark:text-red-400">
                    挙動は良好。特にREGサイドランプの偶数偏りが強いなら、設定4・6を意識して続行しましょう。虹・赤フェザー等の確定演出にも期待。
                  </span>
                )}
                {highSettingProb >= 30 && highSettingProb < 50 && (
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    まだサンプル不足、または中間設定寄りの数値です。ベル確率がついてくるまでは、周囲の状況も確認しつつ慎重に。
                  </span>
                )}
                {highSettingProb < 30 && (
                  <span className="font-bold text-slate-500">
                    厳しい数値です。確定演出（虹フェザー等）が出ていない限り、早めの撤退も視野に。
                  </span>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {totalGames <= 3000 && (
              <>
                回転数がまだ浅いため、ブレ幅の大きいブドウ・BIG確率の影響度を抑えています。
                <span className="font-bold underline decoration-indigo-400 decoration-2">
                  現時点ではREG確率を軸に
                </span>
                様子を見ましょう。
              </>
            )}
            {totalGames > 3000 && totalGames <= 6000 && (
              <>
                折り返し地点です。
                <span className="font-bold">REG確率が安定している場合</span>
                、高設定の期待が高まります。ブドウ確率の信頼度も徐々に上がってきました。
              </>
            )}
            {totalGames > 6000 && (
              <>
                十分なサンプルが集まりました。
                {highSettingProb >= 70 ? (
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    REG・ブドウ確率を含めた総合的なデータから、自信を持って高設定と言えます！
                  </span>
                ) : (
                  <span className="font-bold">
                    REG・ブドウ確率を含めた総合的なデータ
                  </span>
                )}
                から、最終的な設定を推測します。
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}
