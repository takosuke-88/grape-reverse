import { useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { HanaHanaMachine } from '../../data/hanahanaData'

type Props = {
  machine: HanaHanaMachine
}

type DataPoint = {
  game: number
  coins: number
}

export default function SlumpGraphSimulator({ machine }: Props) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [stats, setStats] = useState<{
    bigCount: number
    regCount: number
    finalCoins: number
  } | null>(null)

  const simulate = useCallback(() => {
    if (!machine.coinPayout) return

    setIsSimulating(true)
    setData([])
    setStats(null)

    const setting6Index = machine.settings.indexOf(6)
    if (setting6Index === -1) return

    const bigProb = 1 / machine.bigProbabilities[setting6Index]
    const regProb = 1 / machine.regProbabilities[setting6Index]
    const bellProb = 1 / machine.bellProbabilities[setting6Index]

    const bigPayout = machine.coinPayout.big
    const regPayout = machine.coinPayout.reg
    const bellPayout = 14

    const totalGames = 8000
    const points: DataPoint[] = [{ game: 0, coins: 0 }]
    let coins = 0
    let bigCount = 0
    let regCount = 0

    for (let g = 1; g <= totalGames; g++) {
      coins -= 3

      const rand = Math.random()
      if (rand < bigProb) {
        coins += bigPayout
        bigCount++
      } else if (rand < bigProb + regProb) {
        coins += regPayout
        regCount++
      } else if (rand < bigProb + regProb + bellProb) {
        coins += bellPayout
      }

      if (g % 100 === 0 || g === totalGames) {
        points.push({ game: g, coins })
      }
    }

    setData(points)
    setStats({ bigCount, regCount, finalCoins: coins })
    setIsSimulating(false)
  }, [machine])

  const minCoins = data.length > 0 ? Math.min(...data.map(d => d.coins)) : -1000
  const maxCoins = data.length > 0 ? Math.max(...data.map(d => d.coins)) : 1000
  const yMin = Math.floor(minCoins / 500) * 500 - 500
  const yMax = Math.ceil(maxCoins / 500) * 500 + 500

  if (!machine.coinPayout) {
    return null
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-lg ring-1 ring-purple-200 sm:p-6 dark:from-purple-900/20 dark:to-indigo-900/20 dark:ring-purple-800">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-purple-800 dark:text-purple-300">
        <span className="text-2xl">📈</span>
        スランプグラフ シミュレーター
        <span className="ml-auto rounded-full bg-purple-200 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-800 dark:text-purple-200">
          設定6
        </span>
      </h3>

      <button
        type="button"
        onClick={simulate}
        disabled={isSimulating}
        className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-base font-bold text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50"
      >
        {isSimulating ? (
          <>
            <span className="animate-spin">⏳</span>
            シミュレーション中...
          </>
        ) : (
          <>
            <span>🎰</span>
            設定6をシミュレーション（8000G）
          </>
        )}
      </button>

      {data.length > 0 && (
        <>
          <div className="h-64 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="game"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={[yMin, yMax]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v}`}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(value: number | undefined) => value !== undefined ? [`${value >= 0 ? '+' : ''}${value}枚`, '差枚数'] : ['-', '差枚数']}
                  labelFormatter={(label: string | number) => `${label}G`}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="coins"
                  stroke={stats && stats.finalCoins >= 0 ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-red-100 p-3 text-center dark:bg-red-900/40">
                <div className="text-xs font-medium text-red-600 dark:text-red-300">BIG</div>
                <div className="text-xl font-bold text-red-700 dark:text-red-200">
                  {stats.bigCount}回
                </div>
                <div className="text-xs text-red-500 dark:text-red-400">
                  1/{(8000 / stats.bigCount).toFixed(0)}
                </div>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 text-center dark:bg-blue-900/40">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-300">REG</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-200">
                  {stats.regCount}回
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-400">
                  1/{(8000 / stats.regCount).toFixed(0)}
                </div>
              </div>
              <div
                className={`rounded-xl p-3 text-center ${
                  stats.finalCoins >= 0
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    stats.finalCoins >= 0
                      ? 'text-green-600 dark:text-green-300'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  最終差枚
                </div>
                <div
                  className={`text-xl font-bold ${
                    stats.finalCoins >= 0
                      ? 'text-green-700 dark:text-green-200'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {stats.finalCoins >= 0 ? '+' : ''}
                  {stats.finalCoins.toLocaleString()}枚
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {data.length === 0 && (
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20">
          <p className="text-sm text-purple-400 dark:text-purple-500">
            ボタンを押してシミュレーション開始
          </p>
        </div>
      )}

      <p className="mt-3 text-center text-xs text-purple-600 dark:text-purple-400">
        ※ 確率に基づくランダムシミュレーションのため、毎回結果が異なります
      </p>
    </div>
  )
}
