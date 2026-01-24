import { useMemo, useState, useEffect } from 'react'
import { hanahanaData, type HanaHanaMachine } from '../../data/hanahanaData'
import { HANAHANA_PAYOUTS, REPLAY_RATE, CHERRY_RATE_APPROX, SUIKA_RATE_APPROX } from './payouts'
import ExpectedIncomeSimulator from './ExpectedIncomeSimulator'
import SlumpGraphSimulator from './SlumpGraphSimulator'
import AdviceCard from './AdviceCard'

type CalcResult =
  | { ok: true; p: number; denom: number; percent: number; count: number }
  | { ok: false; reason: string }

type EvalItem = {
  actualDenom: number
  nearestSetting: number
  nearestSettingDenom: number
}

type HanaHanaEval = {
  bell: EvalItem
  big: EvalItem
  reg: EvalItem
  bigSuika?: EvalItem
  confidence: 'low' | 'mid' | 'high'
  totalGames: number
}

// Helper function outside component
const findNearest = (val: number, settings: number[], machine: HanaHanaMachine, targetType: 'bell' | 'big' | 'reg' | 'bigSuika') => {
  let bestSetting = settings[0]
  let minDiff = Infinity
  let bestDenom = 0

  settings.forEach((s, idx) => {
    let targetVal = 0
    if (targetType === 'bell') targetVal = machine.bellProbabilities[idx]
    else if (targetType === 'big') targetVal = machine.bigProbabilities[idx]
    else if (targetType === 'reg') targetVal = machine.regProbabilities[idx]
    else if (targetType === 'bigSuika' && machine.bigSuikaProbabilities) targetVal = machine.bigSuikaProbabilities[idx]

    if (targetVal) {
      const diff = Math.abs(val - targetVal)
      if (diff < minDiff) {
        minDiff = diff
        bestSetting = s
        bestDenom = targetVal
      }
    }
  })
  return { nearestSetting: bestSetting, nearestSettingDenom: bestDenom, actualDenom: val }
}

export default function HanaHanaCalculator({ machineId }: { machineId?: string }) {
  // Default to first machine or select based on some logic if needed
  // If machineId provided, use that.
  const machines = Object.values(hanahanaData)
  const isSingleMode = !!machineId
  const [selectedId, setSelectedId] = useState<string>(machineId || machines[0].id)

  const currentMachine = hanahanaData[selectedId]
  const currentPayouts = HANAHANA_PAYOUTS[selectedId]

  // Inputs
  const [bigCount, setBigCount] = useState('')
  const [regCount, setRegCount] = useState('')
  const [diffCoins, setDiffCoins] = useState('')
  const [totalGames, setTotalGames] = useState('')
  const [bigSuikaCount, setBigSuikaCount] = useState('') // For machines with Big Suika

  // LocalStorage
  // Use unique key if single mode to avoid collision or sharing state unexpectedly
  // Or share state? The request implies individual pages, so maybe unique state is better.
  // Original implementation was shared 'hanahana-calc-form' which had a selectedId field.
  // If we move to individual pages, user might expect state to be per-machine.
  const STORAGE_KEY = machineId ? `hanahana-calc-form-${machineId}` : `hanahana-calc-form`
  
  // Load State
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // If single mode, ignore selectedId from parsed if doesn't match? Or just trust props.
        if (!isSingleMode && parsed.selectedId && hanahanaData[parsed.selectedId]) setSelectedId(parsed.selectedId)
        
        if (parsed.bigCount) setBigCount(String(parsed.bigCount))
        if (parsed.regCount) setRegCount(String(parsed.regCount))
        if (parsed.diffCoins) setDiffCoins(String(parsed.diffCoins))
        if (parsed.totalGames) setTotalGames(String(parsed.totalGames))
        if (parsed.bigSuikaCount) setBigSuikaCount(String(parsed.bigSuikaCount))
      }
    } catch {
      // ignore
    }
  }, [STORAGE_KEY, isSingleMode])

  // Save State
  useEffect(() => {
    try {
      const dataToSave = {
        selectedId,
        bigCount,
        regCount,
        diffCoins,
        totalGames,
        bigSuikaCount
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch {
      // ignore
    }
  }, [selectedId, bigCount, regCount, diffCoins, totalGames, bigSuikaCount, STORAGE_KEY])

  // Parse Inputs
  const parsed = useMemo(() => {
    return {
      big: Number(bigCount),
      reg: Number(regCount),
      diff: Number(diffCoins),
      total: Number(totalGames),
      bigSuika: Number(bigSuikaCount)
    }
  }, [bigCount, regCount, diffCoins, totalGames, bigSuikaCount])

  const ready =
    Number.isFinite(parsed.big) &&
    Number.isFinite(parsed.reg) &&
    Number.isFinite(parsed.diff) &&
    Number.isFinite(parsed.total) &&
    parsed.total > 0

  // Calculate Bell Probability
  const resBell = useMemo((): CalcResult => {
    if (!ready || !currentPayouts) return { ok: false, reason: 'not_ready' }
    const { big, reg, diff, total } = parsed
    
    // Logic:
    // Invest = Total * 3
    // Out_Total = Diff + Invest
    // Out_Big = Big * PayoutBig
    // Out_Reg = Reg * PayoutReg
    // Out_Replay = Total * ReplayRate * 3
    // Out_Cherry = Total * CherryRate * PayoutCherry
    // Out_Suika = Total * SuikaRate * PayoutSuika
    // Out_Bell = Out_Total - (Out_Big + Out_Reg + Out_Replay + Out_Cherry + Out_Suika)
    // BellCount = Out_Bell / PayoutBell

    const invest = total * 3
    const totalOut = diff + invest

    const outBig = big * currentPayouts.big
    const outReg = reg * currentPayouts.reg
    const outReplay = total * REPLAY_RATE * currentPayouts.replay
    const outCherry = total * CHERRY_RATE_APPROX * currentPayouts.cherry
    const outSuika = total * SUIKA_RATE_APPROX * currentPayouts.suika

    const outNonBell = outBig + outReg + outReplay + outCherry + outSuika
    const outBell = totalOut - outNonBell

    if (outBell <= 0) return { ok: false, reason: 'no_bell' }
    
    const count = outBell / currentPayouts.bell
    if (count <= 0) return { ok: false, reason: 'bell_error' }

    const denom = total / count
    const p = 1 / denom
    const percent = p * 100

    return { ok: true, p, denom, percent, count }
  }, [parsed, ready, currentPayouts])

  // Calculate Big Suika Probability
  const resBigSuika = useMemo((): CalcResult => {
    if (!currentMachine.hasBigSuika || !ready) return { ok: false, reason: 'not_applicable' }
    if (parsed.big <= 0) return { ok: false, reason: 'no_big' }
    
    // Estimate Games in Big
    // Assuming Net Increase of ~12 coins per game (15 out - 3 in)
    // Games = BigNetPayout / 12
    const gamesPerBig = currentPayouts.big / 12
    const totalBigGames = parsed.big * gamesPerBig
    
    if (totalBigGames <= 0) return { ok: false, reason: 'error' }
    
    const count = parsed.bigSuika
    const denom = totalBigGames / count
    const p = count / totalBigGames // 1/denom
    const percent = p * 100

    return { ok: true, p, denom, percent, count }
  }, [currentMachine, parsed.big, parsed.bigSuika, currentPayouts, ready])

  const evalResult = useMemo((): HanaHanaEval | null => {
    if (!ready || !resBell.ok) return null
    
    const bellEval = findNearest(resBell.denom, currentMachine.settings, currentMachine, 'bell')
    
    const actualBigDenom = parsed.total / (parsed.big || 1) // Avoid div 0
    const bigEval = findNearest(actualBigDenom, currentMachine.settings, currentMachine, 'big')

    const actualRegDenom = parsed.total / (parsed.reg || 1)
    const regEval = findNearest(actualRegDenom, currentMachine.settings, currentMachine, 'reg')

    let bigSuikaEval: EvalItem | undefined = undefined
    if (currentMachine.hasBigSuika && resBigSuika.ok) {
       bigSuikaEval = findNearest(resBigSuika.denom, currentMachine.settings, currentMachine, 'bigSuika')
    }

    let confidence: 'low' | 'mid' | 'high' = 'low'
    if (parsed.total >= 5000) confidence = 'high'
    else if (parsed.total >= 2000) confidence = 'mid'

    return {
      bell: bellEval,
      big: bigEval,
      reg: regEval,
      bigSuika: bigSuikaEval,
      confidence,
      totalGames: parsed.total
    }
  }, [ready, resBell, resBigSuika, currentMachine, parsed])

  return (
     <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-50 px-4 py-6 sm:py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:gap-8">
        
        <div className="w-full max-w-2xl text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
              ハナハナシリーズ 設定判別ツール
            </h1>
            <p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">
               {currentMachine.name} 対応・ベル確率逆算
            </p>
        </div>

        <div className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800">
             {/* Machine Selector */}
             {!isSingleMode && (
             <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
               <label className="block">
                 <span className="block text-sm font-semibold text-slate-700 mb-2 sm:text-base dark:text-slate-200">
                   機種を選択
                 </span>
                 <select
                   value={selectedId}
                   onChange={e => setSelectedId(e.target.value)}
                   className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-medium text-slate-900 shadow-sm transition-all focus:border-red-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                 >
                   {machines.map(m => (
                     <option key={m.id} value={m.id}>{m.name}</option>
                   ))}
                 </select>
               </label>
             </div>
             )}

             {/* Inputs */}
             <form className="grid grid-cols-2 gap-3">
                <Field label="BIG回数" value={bigCount} onChange={setBigCount} />
                <Field label="REG回数" value={regCount} onChange={setRegCount} />
                {currentMachine.hasBigSuika && (
                    <div className="col-span-2">
                        <Field label="BIG中スイカ回数" value={bigSuikaCount} onChange={setBigSuikaCount} placeholder="こぼしなし推奨" />
                    </div>
                )}
                <Field label="差枚数（±）" value={diffCoins} onChange={setDiffCoins} placeholder="プラスはそのまま、マイナスは-" />
                <Field label="総回転数" value={totalGames} onChange={setTotalGames} placeholder="G数" />
             </form>

             {/* Results */}
             <div className="mt-4 grid grid-cols-1 gap-2.5 sm:gap-3">
                <ResultCard
                  title={`${currentMachine.bellLabel}確率 (逆算)`}
                  res={resBell}
                  color="red"
                  subText={ready && evalResult ? `推測設定: ${evalResult.bell.nearestSetting} (1/${evalResult.bell.nearestSettingDenom?.toFixed(2)})` : ''}
                />
                
                {currentMachine.hasBigSuika && (
                     <ResultCard
                        title="BIG中スイカ確率"
                        res={resBigSuika}
                        color="green"
                        subText={ready && resBigSuika.ok && evalResult?.bigSuika ? `推測設定: ${evalResult.bigSuika.nearestSetting} (1/${evalResult.bigSuika.nearestSettingDenom?.toFixed(1)})` : 'BIG回数とスイカ回数を入力'}
                     />
                )}
             </div>
             
             <button
               type="button"
               onClick={() => {
                 setBigCount('')
                 setRegCount('')
                 setDiffCoins('')
                 setTotalGames('')
                 setBigSuikaCount('')
               }}
               className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
             >
               リセット
             </button>
        </div>

        {/* Spec Table */}
        {ready && (
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
               <table className="w-full text-center text-sm sm:text-base">
                 <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                   <tr>
                     <th className="py-3 px-2 font-semibold">設定</th>
                     <th className="py-3 px-2 font-semibold">{currentMachine.bellLabel}</th>
                     <th className="py-3 px-2 font-semibold">BIG</th>
                     <th className="py-3 px-2 font-semibold">REG</th>
                     {currentMachine.hasBigSuika && <th className="py-3 px-2 font-semibold">BIGスイカ</th>}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentMachine.settings.map((s, idx) => {
                        const isBellMatch = s === evalResult?.bell.nearestSetting
                        const isBg = isBellMatch ? 'bg-red-50 dark:bg-red-900/20 font-bold' : ''
                        
                        return (
                            <tr key={s} className={isBg}>
                                <td className="py-3 px-2 dark:text-slate-200">Setting {s}</td>
                                <td className="py-3 px-2 text-slate-700 dark:text-slate-200">1/{currentMachine.bellProbabilities[idx].toFixed(2)}</td>
                                <td className="py-3 px-2 text-slate-500 dark:text-slate-400">1/{currentMachine.bigProbabilities[idx]}</td>
                                <td className="py-3 px-2 text-slate-500 dark:text-slate-400">1/{currentMachine.regProbabilities[idx]}</td>
                                {currentMachine.hasBigSuika && <td className="py-3 px-2 text-emerald-600 dark:text-emerald-400">
                                   {currentMachine.bigSuikaProbabilities?.[idx] ? `1/${currentMachine.bigSuikaProbabilities[idx].toFixed(1)}` : '-'}
                                </td>}
                            </tr>
                        )
                    })}
                 </tbody>
               </table>
            </div>
        )}

        {/* アドバイスカード */}
        {ready && evalResult && (
          <AdviceCard
            nearestSetting={evalResult.bell.nearestSetting}
            totalGames={evalResult.totalGames}
          />
        )}

        {/* 期待収支シミュレーター */}
        <ExpectedIncomeSimulator machine={currentMachine} />

        {/* スランプグラフ シミュレーター */}
        <SlumpGraphSimulator machine={currentMachine} />

      </div>
     </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <label className="block space-y-0.5">
      <span className="block text-[15px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-400 bg-white px-3 text-lg focus:ring-red-500 focus:outline-none dark:border-slate-500 dark:bg-slate-800 dark:text-white"
        inputMode="decimal"
      />
    </label>
  )
}

function ResultCard({ title, res, color, subText }: { title: string, res: CalcResult, color: 'red' | 'green', subText?: string }) {
  const isRed = color === 'red'
  // Styling based on color...
  const theme = isRed ? {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50/70 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300'
  } : {
      border: 'border-emerald-200 dark:border-emerald-800',
      bg: 'bg-emerald-50/70 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300'
  }

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.bg} px-4 py-3 text-center`}>
       <div className={`text-sm font-semibold ${theme.text}`}>{title}</div>
       {res.ok ? (
          <div>
              <div className={`text-3xl font-extrabold ${theme.text}`}>1 / {res.denom.toFixed(2)}</div>
              {subText && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subText}</div>}
              <div className="text-xs text-slate-400 mt-0.5">({res.count.toFixed(0)}回)</div>
          </div>
       ) : (
          <div className="text-sm text-slate-400 mt-1">データ入力待ち</div>
       )}
    </div>
  )
}
