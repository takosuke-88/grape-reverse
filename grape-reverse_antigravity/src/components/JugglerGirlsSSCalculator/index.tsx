import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// ジャグラーガールズSSのスペック定義
const MACHINE_SPECS = {
  1: { big: 1 / 273.1, reg: 1 / 409.6, grape: 1 / 5.96 },
  2: { big: 1 / 270.8, reg: 1 / 385.5, grape: 1 / 5.93 },
  3: { big: 1 / 266.4, reg: 1 / 336.1, grape: 1 / 5.88 },
  4: { big: 1 / 258.0, reg: 1 / 315.1, grape: 1 / 5.83 },
  5: { big: 1 / 250.0, reg: 1 / 280.1, grape: 1 / 5.76 },
  6: { big: 1 / 226.0, reg: 1 / 270.8, grape: 1 / 5.72 },
}

// 設定ごとのカラー定義（Rechartsで使用）
const SETTING_COLORS = [
  '#94a3b8', // 1: slate-400
  '#94a3b8', // 2: slate-400
  '#94a3b8', // 3: slate-400
  '#60a5fa', // 4: blue-400
  '#f59e0b', // 5: amber-500
  '#ef4444', // 6: red-500
]

export default function JugglerGirlsSSEstimator() {
  const [totalGames, setTotalGames] = useState('')
  const [bigCount, setBigCount] = useState('')
  const [regCount, setRegCount] = useState('')
  const [grapeCount, setGrapeCount] = useState('')

  // 確率計算ロジック (ベイズ推定の簡易実装)
  const probabilities = useMemo(() => {
    const t = Number(totalGames)
    const b = Number(bigCount)
    const r = Number(regCount)
    const g = Number(grapeCount)

    if (!t || t <= 0) return []

    // 各設定の尤度を計算
    const likelihoods = Object.entries(MACHINE_SPECS).map(([setting, spec]) => {
      // 確率の対数をとって計算（アンダーフロー防止）
      // log(P) = k * log(p) + (n-k) * log(1-p)
      
      const bigLog = b * Math.log(spec.big) + (t - b) * Math.log(1 - spec.big)
      const regLog = r * Math.log(spec.reg) + (t - r) * Math.log(1 - spec.reg)
      
      let grapeLog = 0
      if (g > 0) {
        // ブドウカウントがある場合のみ加算
        grapeLog = g * Math.log(spec.grape) + (t - g) * Math.log(1 - spec.grape)
      }

      return {
        setting: Number(setting),
        logLikelihood: bigLog + regLog + grapeLog,
      }
    })

    // 最大の対数尤度を見つける（正規化のため）
    const maxLog = Math.max(...likelihoods.map((l) => l.logLikelihood))

    // 尤度を実数に戻す（最大値を基準にしてオーバーフロー/アンダーフローを防ぐ）
    const pureLikelihoods = likelihoods.map((l) => ({
      setting: l.setting,
      value: Math.exp(l.logLikelihood - maxLog),
    }))

    const totalLikelihood = pureLikelihoods.reduce((sum, item) => sum + item.value, 0)

    // パーセンテージに変換
    return pureLikelihoods.map((item, index) => ({
      name: `設定${item.setting}`,
      percent: parseFloat(((item.value / totalLikelihood) * 100).toFixed(1)),
      fill: SETTING_COLORS[index],
    }))
  }, [totalGames, bigCount, regCount, grapeCount])

  const hasData = probabilities.length > 0 && Number(totalGames) > 0

  return (
    <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800">
      <div className="border-b border-slate-100 pb-4 text-center dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          詳細設定判別ツール
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          ブドウ回数も含めて各設定の期待度を算出します
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1">
          <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            総回転数
          </span>
          <input
            type="number"
            value={totalGames}
            onChange={(e) => setTotalGames(e.target.value)}
            placeholder="例: 3000"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-center text-lg font-bold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            inputMode="numeric"
          />
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            ブドウ回数
            <span className="ml-1 text-[10px] font-normal text-slate-400">
              (任意)
            </span>
          </span>
          <input
            type="number"
            value={grapeCount}
            onChange={(e) => setGrapeCount(e.target.value)}
            placeholder="例: 500"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-center text-lg font-bold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            inputMode="numeric"
          />
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold text-red-600 dark:text-red-400">
            BIG回数
          </span>
          <input
            type="number"
            value={bigCount}
            onChange={(e) => setBigCount(e.target.value)}
            placeholder="例: 10"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-center text-lg font-bold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            inputMode="numeric"
          />
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-semibold text-blue-600 dark:text-blue-400">
            REG回数
          </span>
          <input
            type="number"
            value={regCount}
            onChange={(e) => setRegCount(e.target.value)}
            placeholder="例: 10"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-center text-lg font-bold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            inputMode="numeric"
          />
        </label>
      </div>

      {/* グラフ描画エリア */}
      {hasData ? (
        <div className="mt-6 h-64 w-full">
          <p className="mb-2 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
            設定期待度 (%)
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={probabilities}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                hide
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: 'none',
                  color: '#1e293b',
                }}
              />
              <Bar
                dataKey="percent"
                name="期待度"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              >
                {probabilities.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-8 flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
           <p className="text-sm text-slate-400">データを入力するとグラフが表示されます</p>
        </div>
      )}
      
      {/* リセットボタン */}
      <button
        onClick={() => {
            setTotalGames('')
            setBigCount('')
            setRegCount('')
            setGrapeCount('')
        }}
        className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        入力をリセット
      </button>
    </div>
  )
}
