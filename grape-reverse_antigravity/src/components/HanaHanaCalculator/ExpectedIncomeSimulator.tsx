import { useState, useMemo } from 'react'
import type { HanaHanaMachine } from '../../data/hanahanaData'

type Props = {
  machine: HanaHanaMachine
}

const EXCHANGE_RATES = [
  { label: '等価 (5.0枚)', value: 5.0 },
  { label: '5.6枚交換', value: 5.6 },
  { label: '6.0枚交換', value: 6.0 },
  { label: '6.5枚交換', value: 6.5 },
  { label: '7.0枚交換', value: 7.0 },
]

const PLAY_TIMES = [
  { label: '2時間', hours: 2 },
  { label: '4時間', hours: 4 },
  { label: '6時間', hours: 6 },
  { label: '8時間', hours: 8 },
  { label: '10時間', hours: 10 },
  { label: '12時間 (終日)', hours: 12 },
]

export default function ExpectedIncomeSimulator({ machine }: Props) {
  const [exchangeRate, setExchangeRate] = useState(5.0)
  const [playHours, setPlayHours] = useState(8)

  const result = useMemo(() => {
    if (!machine.payoutRatios || !machine.coinPayout) {
      return null
    }

    const setting6PayoutRatio = machine.payoutRatios[5]
    const gamesPerHour = 700
    const totalGames = gamesPerHour * playHours
    const totalCoinsIn = totalGames * 3
    const totalCoinsOut = totalCoinsIn * (setting6PayoutRatio / 100)
    const profitCoins = totalCoinsOut - totalCoinsIn
    const profitYen = Math.round((profitCoins / exchangeRate) * 1000)
    const hourlyRate = Math.round(profitYen / playHours)

    return {
      totalGames,
      profitCoins: Math.round(profitCoins),
      profitYen,
      hourlyRate,
      payoutRatio: setting6PayoutRatio,
    }
  }, [machine, exchangeRate, playHours])

  if (!machine.payoutRatios) {
    return null
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg ring-1 ring-amber-200 sm:p-6 dark:from-amber-900/20 dark:to-orange-900/20 dark:ring-amber-800">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-300">
        <span className="text-2xl">💰</span>
        期待収支シミュレーター
        <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-800 dark:text-amber-200">
          設定6
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-amber-700 dark:text-amber-300">
            交換率
          </span>
          <select
            value={exchangeRate}
            onChange={e => setExchangeRate(Number(e.target.value))}
            className="h-11 w-full rounded-xl border-2 border-amber-300 bg-white px-3 text-base font-medium text-amber-900 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          >
            {EXCHANGE_RATES.map(rate => (
              <option key={rate.value} value={rate.value}>
                {rate.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-amber-700 dark:text-amber-300">
            稼働時間
          </span>
          <select
            value={playHours}
            onChange={e => setPlayHours(Number(e.target.value))}
            className="h-11 w-full rounded-xl border-2 border-amber-300 bg-white px-3 text-base font-medium text-amber-900 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          >
            {PLAY_TIMES.map(time => (
              <option key={time.hours} value={time.hours}>
                {time.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultBox
            label="総回転数"
            value={`${result.totalGames.toLocaleString()}G`}
            color="slate"
          />
          <ResultBox
            label="機械割"
            value={`${result.payoutRatio}%`}
            color="blue"
          />
          <ResultBox
            label="期待収支"
            value={`${result.profitYen >= 0 ? '+' : ''}${result.profitYen.toLocaleString()}円`}
            color={result.profitYen >= 0 ? 'green' : 'red'}
            large
          />
          <ResultBox
            label="時給"
            value={`${result.hourlyRate >= 0 ? '+' : ''}${result.hourlyRate.toLocaleString()}円`}
            color={result.hourlyRate >= 0 ? 'emerald' : 'red'}
            large
          />
        </div>
      )}

      <p className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400">
        ※ 時速700G、チェリー狙いの理論値に基づく計算です
      </p>
    </div>
  )
}

function ResultBox({
  label,
  value,
  color,
  large,
}: {
  label: string
  value: string
  color: 'slate' | 'blue' | 'green' | 'red' | 'emerald'
  large?: boolean
}) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  }

  return (
    <div className={`rounded-xl p-3 text-center ${colorClasses[color]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className={`font-bold ${large ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
        {value}
      </div>
    </div>
  )
}
