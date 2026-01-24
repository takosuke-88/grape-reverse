type AdviceLevel = 'danger' | 'caution' | 'excellent'

type Props = {
  nearestSetting: number | null
  totalGames: number
}

export default function AdviceCard({ nearestSetting, totalGames }: Props) {
  if (nearestSetting === null || totalGames < 500) {
    return null
  }

  const advice = getAdvice(nearestSetting)

  const bgClasses = {
    danger: 'bg-gradient-to-r from-red-100 to-rose-100 ring-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:ring-red-800',
    caution: 'bg-gradient-to-r from-yellow-100 to-amber-100 ring-yellow-200 dark:from-yellow-900/30 dark:to-amber-900/30 dark:ring-yellow-800',
    excellent: 'bg-gradient-to-r from-blue-100 to-cyan-100 ring-blue-200 dark:from-blue-900/30 dark:to-cyan-900/30 dark:ring-blue-800',
  }

  const textClasses = {
    danger: 'text-red-700 dark:text-red-300',
    caution: 'text-yellow-700 dark:text-yellow-300',
    excellent: 'text-blue-700 dark:text-blue-300',
  }

  const iconBgClasses = {
    danger: 'bg-red-200 dark:bg-red-800',
    caution: 'bg-yellow-200 dark:bg-yellow-800',
    excellent: 'bg-blue-200 dark:bg-blue-800',
  }

  return (
    <div className={`w-full max-w-2xl rounded-2xl p-4 shadow-lg ring-1 sm:p-5 ${bgClasses[advice.level]}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${iconBgClasses[advice.level]}`}>
          {advice.icon}
        </div>
        <div className="flex-1">
          <h4 className={`text-base font-bold sm:text-lg ${textClasses[advice.level]}`}>
            {advice.title}
          </h4>
          <p className={`mt-1 text-sm sm:text-base ${textClasses[advice.level]} opacity-90`}>
            {advice.message}
          </p>
          {totalGames < 2000 && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              ※ 現在 {totalGames.toLocaleString()}G — 2000G以上で精度が上がります
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function getAdvice(setting: number): {
  level: AdviceLevel
  icon: string
  title: string
  message: string
} {
  if (setting <= 1) {
    return {
      level: 'danger',
      icon: '⚠️',
      title: '危険水域！深追いは禁物かも…',
      message: '現在の確率は設定1相当です。ヤメ時を検討しましょう。粘っても状況が改善しない可能性が高いです。',
    }
  }

  if (setting <= 3) {
    return {
      level: 'caution',
      icon: '🤔',
      title: '様子見推奨！もう少し回して判断',
      message: `設定${setting}付近の挙動です。まだ判断するには早いかも。追加で1000G程度回して再判定してみましょう。`,
    }
  }

  if (setting <= 5) {
    return {
      level: 'caution',
      icon: '👀',
      title: '様子見推奨！ベルを信じて続行',
      message: `設定${setting}相当の好調な推移です！このまま続けてベルの収束を待ちましょう。高設定の可能性あり。`,
    }
  }

  return {
    level: 'excellent',
    icon: '🎉',
    title: '最高！閉店までブン回しましょう',
    message: '設定6相当の素晴らしい数値です！このツキを逃さず、最後まで粘りましょう。期待値の塊です！',
  }
}
