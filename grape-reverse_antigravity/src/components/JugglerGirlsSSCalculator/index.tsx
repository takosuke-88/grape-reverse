import { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
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

// 設定ごとのカラー定義
const SETTING_COLORS = [
  '#94a3b8', // 1: slate-400
  '#94a3b8', // 2: slate-400
  '#94a3b8', // 3: slate-400
  '#60a5fa', // 4: blue-400
  '#f59e0b', // 5: amber-500
  '#ef4444', // 6: red-500
]

type Props = {
  totalGames: number
  bigCount: number
  regCount: number
  calculatedGrapeCount: number
}

export default function JugglerGirlsSSEstimator({
  totalGames,
  bigCount,
  regCount,
  calculatedGrapeCount,
}: Props) {
  // マニュアルモード（ブドウ回数手動入力）
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualGrapeCount, setManualGrapeCount] = useState('')

  // 実際に計算に使用するブドウ回数
  const grapeCount = useMemo(() => {
    if (isManualMode && manualGrapeCount !== '') {
      return Number(manualGrapeCount)
    }
    // 自動読み込み（逆算値）
    // 逆算値がない場合は0
    return calculatedGrapeCount || 0
  }, [isManualMode, manualGrapeCount, calculatedGrapeCount])

  // 確率計算ロジック
  const probabilities = useMemo(() => {
    const t = totalGames
    const b = bigCount
    const r = regCount
    const g = grapeCount

    if (!t || t <= 0) return []

    const likelihoods = Object.entries(MACHINE_SPECS).map(([setting, spec]) => {
      // log(P) = k * log(p) + (n-k) * log(1-p)
      const bigLog = b * Math.log(spec.big) + (t - b) * Math.log(1 - spec.big)
      const regLog = r * Math.log(spec.reg) + (t - r) * Math.log(1 - spec.reg)
      
      let grapeLog = 0
      if (g > 0) {
        grapeLog = g * Math.log(spec.grape) + (t - g) * Math.log(1 - spec.grape)
      }

      return {
        setting: Number(setting),
        logLikelihood: bigLog + regLog + grapeLog,
      }
    })

    const maxLog = Math.max(...likelihoods.map((l) => l.logLikelihood))
    const pureLikelihoods = likelihoods.map((l) => ({
      setting: l.setting,
      value: Math.exp(l.logLikelihood - maxLog),
    }))
    const totalLikelihood = pureLikelihoods.reduce((sum, item) => sum + item.value, 0)

    return pureLikelihoods.map((item, index) => ({
      name: `設定${item.setting}`,
      percent: parseFloat(((item.value / totalLikelihood) * 100).toFixed(1)),
      fill: SETTING_COLORS[index],
    }))
  }, [totalGames, bigCount, regCount, grapeCount])

  const hasData = probabilities.length > 0 && totalGames > 0

  return (
    <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800">
      <div className="border-b border-slate-100 pb-4 text-center dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          詳細設定判別ツール
        </h2>
        <div className="mt-2 flex items-center justify-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ブドウ逆算値
            </span>
            <div 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isManualMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              onClick={() => setIsManualMode(!isManualMode)}
            >
               <span 
                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                   isManualMode ? 'translate-x-6' : 'translate-x-1'
                 }`} 
               />
            </div>
            <span className={`text-xs font-medium ${isManualMode ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
              手動入力
            </span>
          </label>
        </div>
      </div>

      {/* 手動入力フォーム（ON時のみ表示） */}
      {isManualMode && (
        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
           <label className="block max-w-xs mx-auto text-center">
             <span className="block text-sm font-semibold text-slate-700 mb-1 dark:text-slate-300">
               ブドウ回数 (実際の数値)
             </span>
             <input
               type="number"
               value={manualGrapeCount}
               onChange={(e) => setManualGrapeCount(e.target.value)}
               placeholder="カウント値を入力"
               className="w-full rounded-lg border border-slate-300 p-2 text-center text-lg font-bold focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
             />
           </label>
        </div>
      )}

      {/* グラフ描画エリア */}
      {hasData ? (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={probabilities}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: 'none',
                  color: '#1e293b',
                }}
                formatter={(value: number) => [`${value}%`, '期待度']}
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
                <LabelList 
                  dataKey="percent" 
                  position="top" 
                  formatter={(val: number) => `${val}%`}
                  style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
           <div className="mt-2 text-center text-[10px] text-slate-400">
             ブドウ確率: 1/{grapeCount > 0 ? (totalGames / grapeCount).toFixed(2) : '-'} ({grapeCount.toFixed(0)}回)
           </div>
        </div>
      ) : (
        <div className="mt-8 flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
           <p className="text-sm text-slate-400">データ入力待ち...</p>
        </div>
      )}
    </div>
  )
}
