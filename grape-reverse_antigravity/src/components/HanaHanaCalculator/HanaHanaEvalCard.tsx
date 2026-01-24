type EvalItem = {
  actualDenom: number
  nearestSetting: number
  nearestSettingDenom: number
}

type HanaHanaEval = {
  bell: EvalItem
  big?: EvalItem
  reg?: EvalItem
  bigSuika?: EvalItem
  confidence: 'low' | 'mid' | 'high'
  totalGames: number
}

type Props = {
  eval: HanaHanaEval | null
  hasBigSuika: boolean
}

export default function HanaHanaEvalCard({ eval: evalResult, hasBigSuika }: Props) {
  if (!evalResult) {
    return (
      <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 p-4 shadow ring-1 ring-slate-200 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
        <h3 className="mb-3 text-center text-lg font-bold text-slate-700 dark:text-slate-200">
          簡易設定評価
        </h3>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          データを入力すると設定推測が表示されます
        </p>
      </div>
    )
  }

  const { bell, big, reg, bigSuika, confidence, totalGames } = evalResult

  const confidenceLabel = {
    low: { text: '参考程度', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    mid: { text: 'やや信頼', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    high: { text: '高信頼度', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  }[confidence]

  const getSettingColor = (setting: number) => {
    if (setting >= 5) return 'text-green-600 dark:text-green-400'
    if (setting >= 3) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSettingBg = (setting: number) => {
    if (setting >= 5) return 'bg-green-50 dark:bg-green-900/20'
    if (setting >= 3) return 'bg-yellow-50 dark:bg-yellow-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 p-4 shadow ring-1 ring-slate-200 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          簡易設定評価
        </h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceLabel.bg} ${confidenceLabel.color}`}>
          {confidenceLabel.text} ({totalGames.toLocaleString()}G)
        </span>
      </div>

      <div className={`grid gap-2 ${hasBigSuika ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
        <EvalItemCard
          label="ベル"
          setting={bell.nearestSetting}
          actualDenom={bell.actualDenom}
          specDenom={bell.nearestSettingDenom}
          getColor={getSettingColor}
          getBg={getSettingBg}
        />
        {big ? (
          <EvalItemCard
            label="BIG"
            setting={big.nearestSetting}
            actualDenom={big.actualDenom}
            specDenom={big.nearestSettingDenom}
            getColor={getSettingColor}
            getBg={getSettingBg}
          />
        ) : (
          <EmptyEvalItemCard label="BIG" />
        )}
        {reg ? (
          <EvalItemCard
            label="REG"
            setting={reg.nearestSetting}
            actualDenom={reg.actualDenom}
            specDenom={reg.nearestSettingDenom}
            getColor={getSettingColor}
            getBg={getSettingBg}
          />
        ) : (
          <EmptyEvalItemCard label="REG" />
        )}
        {hasBigSuika && (bigSuika ? (
          <EvalItemCard
            label="BIGスイカ"
            setting={bigSuika.nearestSetting}
            actualDenom={bigSuika.actualDenom}
            specDenom={bigSuika.nearestSettingDenom}
            getColor={getSettingColor}
            getBg={getSettingBg}
          />
        ) : (
          <EmptyEvalItemCard label="BIGスイカ" />
        ))}
      </div>

      <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        ※各要素から最も近い設定を推測しています
      </div>
    </div>
  )
}

function EvalItemCard({
  label,
  setting,
  actualDenom,
  specDenom,
  getColor,
  getBg,
}: {
  label: string
  setting: number
  actualDenom: number
  specDenom: number
  getColor: (s: number) => string
  getBg: (s: number) => string
}) {
  return (
    <div className={`rounded-xl p-3 text-center ${getBg(setting)}`}>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`text-2xl font-extrabold ${getColor(setting)}`}>
        設定{setting}
      </div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold">実績:</span> 1/{actualDenom.toFixed(1)}
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500">
        <span className="font-semibold">理論:</span> 1/{specDenom.toFixed(1)}
      </div>
    </div>
  )
}

function EmptyEvalItemCard({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 text-center dark:bg-slate-800">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-xl font-bold text-slate-400 dark:text-slate-500">
        -
      </div>
      <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        データなし
      </div>
    </div>
  )
}
