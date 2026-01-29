import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  1: { big: 1 / 273.1, reg: 1 / 409.6, combined: 1 / 163.8, grape: 1 / 5.98 },
  2: { big: 1 / 270.8, reg: 1 / 385.5, combined: 1 / 159.1, grape: 1 / 5.98 },
  3: { big: 1 / 266.4, reg: 1 / 336.1, combined: 1 / 148.6, grape: 1 / 5.98 },
  4: { big: 1 / 258.0, reg: 1 / 315.1, combined: 1 / 141.9, grape: 1 / 5.98 },
  5: { big: 1 / 250.0, reg: 1 / 280.1, combined: 1 / 132.1, grape: 1 / 5.88 },
  6: { big: 1 / 226.0, reg: 1 / 270.8, combined: 1 / 123.2, grape: 1 / 5.83 },
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

// 近似設定の判定結果型
type ApproxResult = {
  setting: number
  label: string
  colorClass: string
  probability: number // その設定である事後確率（簡易的に尤度の正規化値）
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
    return calculatedGrapeCount || 0
  }, [isManualMode, manualGrapeCount, calculatedGrapeCount])

  // ベイズ推定で最も確からしい設定を計算するヘルパー関数
  const getBayesApproxSetting = (
    type: 'big' | 'reg' | 'combined' | 'grape',
    count: number,
    games: number
  ): ApproxResult => {
    // 尤度を計算: L = p^k * (1-p)^(n-k)
    // 対数尤度: ln(L) = k * ln(p) + (n-k) * ln(1-p)
    const likelihoods = Object.entries(MACHINE_SPECS).map(([setting, spec]) => {
      const p = spec[type]
      const logLikelihood =
        count * Math.log(p) + (games - count) * Math.log(1 - p)
      return {
        setting: Number(setting),
        logLikelihood,
      }
    })

    // 最大対数尤度を見つけて正規化（アンダーフロー防止）
    const maxLogLi = Math.max(...likelihoods.map((l) => l.logLikelihood))
    
    // 尤度（事後確率の比例値）に変換: P(Hi|D) ∝ P(D|Hi) * P(Hi)
    // 事前分布 P(Hi) は一様と仮定するので、尤度比較だけでOK
    const posteriors = likelihoods.map((l) => ({
      setting: l.setting,
      val: Math.exp(l.logLikelihood - maxLogLi),
    }))

    // 最も高い値を持つ設定を選択
    // 複数ある場合は高設定寄りを優先するなど細工できるが、基本は最大値
    const bestMatch = posteriors.reduce((prev, current) => 
      current.val > prev.val ? current : prev
    )

    const isHighSetting = bestMatch.setting >= 5

    return {
      setting: bestMatch.setting,
      label: `設定${bestMatch.setting}近似`,
      colorClass: isHighSetting
        ? 'text-red-500 dark:text-red-400'
        : 'text-blue-500 dark:text-blue-400',
      probability: bestMatch.val, // 相対的な尤度 (最大が1.0)
    }
  }

  // 各種確率と近似設定の計算
  const stats = useMemo(() => {
    if (!totalGames || totalGames <= 0) return null

    return {
      big: {
        count: bigCount,
        probDeon: bigCount > 0 ? totalGames / bigCount : 0,
        approx: bigCount > 0 ? getBayesApproxSetting('big', bigCount, totalGames) : null,
      },
      reg: {
        count: regCount,
        probDeon: regCount > 0 ? totalGames / regCount : 0,
        approx: regCount > 0 ? getBayesApproxSetting('reg', regCount, totalGames) : null,
      },
      combined: {
        count: bigCount + regCount,
        probDeon: (bigCount + regCount) > 0 ? totalGames / (bigCount + regCount) : 0,
        approx: (bigCount + regCount) > 0 ? getBayesApproxSetting('combined', bigCount + regCount, totalGames) : null,
      },
      grape: {
        count: grapeCount,
        probDeon: grapeCount > 0 ? totalGames / grapeCount : 0,
        approx: grapeCount > 0 ? getBayesApproxSetting('grape', grapeCount, totalGames) : null,
      },
    }
  }, [totalGames, bigCount, regCount, grapeCount])

  // 確率計算ロジック（グラフ用 - 既存ロジック維持）
  const probabilities = useMemo(() => {
    const t = totalGames
    const b = bigCount
    const r = regCount
    const g = grapeCount

    if (!t || t <= 0) return []

    const likelihoods = Object.entries(MACHINE_SPECS).map(([setting, spec]) => {
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
    <div className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-200 sm:p-5 dark:bg-slate-900 dark:ring-slate-800">
      
      {/* ヘッダー＆手動スイッチ */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
         <h2 className="text-lg font-bold text-slate-800 dark:text-white">
           詳細判別
         </h2>
         <label className="flex items-center gap-2 cursor-pointer">
             <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
               ブドウ手動
             </span>
             <div 
               className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                 isManualMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
               }`}
               onClick={() => setIsManualMode(!isManualMode)}
             >
                <span 
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isManualMode ? 'translate-x-4' : 'translate-x-0.5'
                  }`} 
                />
             </div>
         </label>
      </div>

      {isManualMode && (
         <div className="mb-3">
             <input
               type="number"
               value={manualGrapeCount}
               onChange={(e) => setManualGrapeCount(e.target.value)}
               placeholder="ブドウ回数を入力"
               className="w-full rounded-lg border border-slate-300 p-2 text-center text-sm font-bold focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
             />
         </div>
      )}

      {hasData && stats ? (
        <>
          {/* データグリッド (2列レイアウト) */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* BIG */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">BIG確率</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                1/{stats.big.probDeon.toFixed(1)}
              </div>
              <div className={`text-[11px] font-bold ${stats.big.approx?.colorClass || 'text-slate-400'}`}>
                ({stats.big.approx?.label || '-'})
              </div>
            </div>

            {/* REG */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">REG確率</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                1/{stats.reg.probDeon.toFixed(1)}
              </div>
              <div className={`text-[11px] font-bold ${stats.reg.approx?.colorClass || 'text-slate-400'}`}>
                ({stats.reg.approx?.label || '-'})
              </div>
            </div>

            {/* 合算 */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">合算確率</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                1/{stats.combined.probDeon.toFixed(1)}
              </div>
              <div className={`text-[11px] font-bold ${stats.combined.approx?.colorClass || 'text-slate-400'}`}>
                ({stats.combined.approx?.label || '-'})
              </div>
            </div>

            {/* ぶどう */}
             <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">ぶどう確率</div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                1/{stats.grape.probDeon > 0 ? stats.grape.probDeon.toFixed(2) : '-'}
              </div>
              <div className={`text-[11px] font-bold ${stats.grape.approx?.colorClass || 'text-slate-400'}`}>
                ({stats.grape.approx?.label || '-'})
              </div>
            </div>

          </div>

          {/* 注釈リンク */}
          <div className="mt-1 flex justify-end">
             <Link to="/columns/bayes-theorem" className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline dark:hover:text-slate-300">
               ※ベイズの定理から算出
             </Link>
          </div>

          {/* グラフ描画エリア */}
          <div className="mt-2 h-40 w-full sm:h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={probabilities}
                margin={{ top: 15, right: 5, left: 5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
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
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}%`, '期待度']}
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
                    formatter={(val: any) => `${val}%`}
                    style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            

          </div>
        </>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
           <p className="text-xs text-slate-400">データ入力待ち...</p>
        </div>
      )}
    </div>
  )
}
