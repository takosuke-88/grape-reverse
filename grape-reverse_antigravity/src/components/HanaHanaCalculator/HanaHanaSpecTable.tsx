import type { HanaHanaMachine } from '../../data/hanahanaData'

type Props = {
  machine: HanaHanaMachine
  bellMatch?: number | null
  bigMatch?: number | null
  regMatch?: number | null
  bigSuikaMatch?: number | null
  actualBell?: number | null
  actualBig?: number | null
  actualReg?: number | null
  actualBigSuika?: number | null
}

export default function HanaHanaSpecTable({
  machine,
  bellMatch,
  bigMatch,
  regMatch,
  bigSuikaMatch,
  actualBell,
  actualBig,
  actualReg,
  actualBigSuika,
}: Props) {
  const hasActuals = actualBell !== null && actualBell !== undefined

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <h3 className="text-center text-base font-bold text-slate-700 dark:text-slate-200">
          設定別 ボーナス＆ベル確率
        </h3>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {machine.name}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center text-sm">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            <tr>
              <th className="py-2.5 px-2 font-semibold">設定</th>
              <th className="py-2.5 px-2 font-semibold">{machine.bellLabel}</th>
              <th className="py-2.5 px-2 font-semibold">BIG</th>
              <th className="py-2.5 px-2 font-semibold">REG</th>
              {machine.hasBigSuika && (
                <th className="py-2.5 px-2 font-semibold">BIGスイカ</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {hasActuals && (
              <tr className="bg-amber-50 dark:bg-amber-900/20">
                <td className="py-2.5 px-2 font-bold text-amber-700 dark:text-amber-400">
                  実績値
                </td>
                <td className="py-2.5 px-2 font-bold text-amber-700 dark:text-amber-400">
                  1/{actualBell?.toFixed(2) || '-'}
                </td>
                <td className="py-2.5 px-2 font-bold text-amber-600 dark:text-amber-500">
                  1/{actualBig?.toFixed(0) || '-'}
                </td>
                <td className="py-2.5 px-2 font-bold text-amber-600 dark:text-amber-500">
                  1/{actualReg?.toFixed(0) || '-'}
                </td>
                {machine.hasBigSuika && (
                  <td className="py-2.5 px-2 font-bold text-amber-600 dark:text-amber-500">
                    {actualBigSuika ? `1/${actualBigSuika.toFixed(1)}` : '-'}
                  </td>
                )}
              </tr>
            )}
            {machine.settings.map((s, idx) => {
              const isBellMatch = s === bellMatch
              const isBigMatch = s === bigMatch
              const isRegMatch = s === regMatch
              const isBigSuikaMatch = s === bigSuikaMatch
              const isAnyMatch = isBellMatch || isBigMatch || isRegMatch || isBigSuikaMatch

              const rowBg = isAnyMatch ? 'bg-red-50/50 dark:bg-red-900/10' : ''

              return (
                <tr key={s} className={rowBg}>
                  <td className={`py-2.5 px-2 font-medium ${isAnyMatch ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                    設定{s}
                  </td>
                  <td className={`py-2.5 px-2 ${isBellMatch ? 'font-bold text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    1/{machine.bellProbabilities[idx].toFixed(2)}
                    {isBellMatch && <span className="ml-1 text-xs">◀</span>}
                  </td>
                  <td className={`py-2.5 px-2 ${isBigMatch ? 'font-bold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    1/{machine.bigProbabilities[idx]}
                    {isBigMatch && <span className="ml-1 text-xs">◀</span>}
                  </td>
                  <td className={`py-2.5 px-2 ${isRegMatch ? 'font-bold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    1/{machine.regProbabilities[idx]}
                    {isRegMatch && <span className="ml-1 text-xs">◀</span>}
                  </td>
                  {machine.hasBigSuika && (
                    <td className={`py-2.5 px-2 ${isBigSuikaMatch ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-emerald-500 dark:text-emerald-500'}`}>
                      {machine.bigSuikaProbabilities?.[idx]
                        ? `1/${machine.bigSuikaProbabilities[idx].toFixed(1)}`
                        : '-'}
                      {isBigSuikaMatch && <span className="ml-1 text-xs">◀</span>}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
