import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { MachineSpec, Setting } from '../../data/machineSpecs'
import { CONSTS, ALL_MACHINES } from '../../data/machineSpecs'

const nf1 = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const nf2 = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 計算結果型 */
type CalcResult =
  | { ok: true; p: number; denom: number; percent: number; grapeCount: number }
  | { ok: false; reason: string }

// ぶどう評価用の型（拡張版：ぶどう・REG・合成の3要素）
type GrapeConfidence = 'low' | 'mid' | 'high'

type EvalItem = {
  actualDenom: number
  nearestSetting: Setting
  nearestSettingDenom: number
}

type GrapeEval = {
  grape: EvalItem
  soloReg?: EvalItem // Pro Mode Only
  reg: EvalItem
  combined: EvalItem
  confidence: GrapeConfidence
  totalGames: number
}

/** GrapeCalculatorのProps */
export type GrapeCalculatorProps = {
  /** 単一機種モード: 特定の機種データのみを使用 */
  machine?: MachineSpec
  /** 複数機種モード: 機種セレクターを表示（既存の動作） */
  machines?: MachineSpec[]
  /** デフォルトで選択する機種キー */
  defaultMachine?: string
  /** 機種セレクターの表示/非表示 */
  showMachineSelector?: boolean
  /** ページ固有のタイトルと説明 */
  pageTitle?: string
  pageDescription?: string
}

export default function GrapeCalculator({
  machine,
  machines,
  defaultMachine,
  showMachineSelector = true,
  pageTitle,
  pageDescription,
}: GrapeCalculatorProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // URLパスと機種キーのマッピング
  const pathToKey: Record<string, string> = {
    '/aimex': 'aim_ex6',
    '/myjuggler5': 'myj5',
    '/funky2': 'funky2',
    '/gogo3': 'gogo3',
    '/girlsss': 'girls_ss',
    '/ultramiracle': 'ultra_miracle',
    '/mister': 'mister',
    '/happyv3': 'happy_v3',
  }

  // 機種キーとURLパスのマッピング（逆引き用）
  const keyToPath: Record<string, string> = {
    aim_ex6: '/aimex',
    myj5: '/myjuggler5',
    funky2: '/funky2',
    gogo3: '/gogo3',
    girls_ss: '/girlsss',
    ultra_miracle: '/ultramiracle',
    mister: '/mister',
    happy_v3: '/happyv3',
  }

  // 現在のパスから機種キーを取得（単一機種モードの場合）
  const currentKeyFromPath = pathToKey[location.pathname] || machine?.key || ''

  // 機種セレクターの状態（複数機種モードのみ使用）
  const [selectedKey, setSelectedKey] = useState<string>(
    defaultMachine || machine?.key || machines?.[0]?.key || '',
  )

  // 実際に使用する機種データ
  const currentMachine = useMemo(() => {
    if (machine) return machine
    if (machines) {
      return machines.find(m => m.key === selectedKey) || machines[0]
    }
    return null
  }, [machine, machines, selectedKey])

  // モード切替（シンプル/プロ）
  const [isProMode, setIsProMode] = useState(false)

  // シンプルモード用
  const [bigCount, setBigCount] = useState('')
  const [regCount, setRegCount] = useState('')
  const [diffCoins, setDiffCoins] = useState('')
  const [totalGames, setTotalGames] = useState('')

  // プロモード用（詳細入力）
  const [soloBig, setSoloBig] = useState('')
  const [cherryBig, setCherryBig] = useState('')
  const [soloReg, setSoloReg] = useState('')
  const [cherryReg, setCherryReg] = useState('')

  // localStorage自動保存・復元（機種ごとに異なるキーを使用）
  const STORAGE_KEY = machine ? `grape-reverse-form-${machine.key}` : 'grape-reverse-form-all'
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // 複数機種モードの場合のみselectedKeyを復元
        if (parsed.selectedKey && !machine) setSelectedKey(parsed.selectedKey)
        if (parsed.isProMode !== undefined) setIsProMode(parsed.isProMode)
        if (parsed.bigCount) setBigCount(String(parsed.bigCount))
        if (parsed.regCount) setRegCount(String(parsed.regCount))
        if (parsed.diffCoins) setDiffCoins(String(parsed.diffCoins))
        if (parsed.totalGames) setTotalGames(String(parsed.totalGames))
        // プロモード用
        if (parsed.soloBig) setSoloBig(String(parsed.soloBig))
        if (parsed.cherryBig) setCherryBig(String(parsed.cherryBig))
        if (parsed.soloReg) setSoloReg(String(parsed.soloReg))
        if (parsed.cherryReg) setCherryReg(String(parsed.cherryReg))
      }
    } catch {}
  }, [STORAGE_KEY, machine])

  useEffect(() => {
    try {
      const dataToSave = machine
        ? { isProMode, bigCount, diffCoins, regCount, totalGames, soloBig, cherryBig, soloReg, cherryReg }
        : { selectedKey, isProMode, bigCount, diffCoins, regCount, totalGames, soloBig, cherryBig, soloReg, cherryReg }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch {}
  }, [STORAGE_KEY, selectedKey, isProMode, bigCount, regCount, diffCoins, totalGames, soloBig, cherryBig, soloReg, cherryReg, machine])

  // プロモード時は詳細入力を合算
  const parsed = {
    big: isProMode ? Number(soloBig || 0) + Number(cherryBig || 0) : Number(bigCount),
    reg: isProMode ? Number(soloReg || 0) + Number(cherryReg || 0) : Number(regCount),
    diff: Number(diffCoins),
    total: Number(totalGames),
  }

  const ready =
    Number.isFinite(parsed.big) &&
    Number.isFinite(parsed.reg) &&
    Number.isFinite(parsed.diff) &&
    Number.isFinite(parsed.total) &&
    parsed.total > 0

  if (!currentMachine) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-red-500">機種データが読み込めませんでした。</p>
      </div>
    )
  }

  /** 選択機種の逆算（上部カード） */
  const CHERRY_RATE = currentMachine.cherryRateBySetting[3]
  const compute = (cherryGetRate: number): CalcResult => {
    if (!ready) return { ok: false, reason: 'not_ready' }
    const { big, reg, diff, total } = parsed
    const invest = total * 3
    const payoutBigReg = big * currentMachine.big + reg * currentMachine.reg
    const payoutReplay = total * CONSTS.REPLAY_RATE * CONSTS.REPLAY_PAYOUT
    const payoutCherry = total * CHERRY_RATE * CONSTS.CHERRY_PAYOUT * cherryGetRate
    const payoutNonGrape = payoutBigReg + payoutReplay + payoutCherry
    const grapePayoutTotal = diff + invest - payoutNonGrape
    if (grapePayoutTotal <= 0) return { ok: false, reason: 'no_grape' }
    const grapeCount = grapePayoutTotal / CONSTS.GRAPE_PAYOUT
    if (grapeCount <= 0) return { ok: false, reason: 'grape_error' }
    const p = grapeCount / total
    const denom = total / grapeCount
    const percent = p * 100
    return { ok: true, p, denom, percent, grapeCount }
  }

  // チェリー狙い／フリー打ちの結果
  const resAim = useMemo(() => compute(CONSTS.CHERRY_GET_AIM), [parsed, ready, currentMachine])
  const resFree = useMemo(() => compute(CONSTS.CHERRY_GET_FREE), [parsed, ready, currentMachine])

  /** ---- 4つの確率から「最も近い設定番号」を求める ---- */
  const highlightBigSetting = useMemo(() => {
    if (!ready || parsed.big <= 0) return null
    const actualBig = parsed.total / parsed.big
    const table = Object.fromEntries(
      Object.entries(currentMachine.bonusRateBySetting).map(([s, v]) => [Number(s), v.big]),
    )
    return findNearestSetting(actualBig, table)
  }, [ready, parsed.big, parsed.total, currentMachine])

  const highlightRegSetting = useMemo(() => {
    if (!ready || parsed.reg <= 0) return null
    const actualReg = parsed.total / parsed.reg
    const table = Object.fromEntries(
      Object.entries(currentMachine.bonusRateBySetting).map(([s, v]) => [Number(s), v.reg]),
    )
    return findNearestSetting(actualReg, table)
  }, [ready, parsed.reg, parsed.total, currentMachine])

  const highlightCombinedSetting = useMemo(() => {
    if (!ready || parsed.big + parsed.reg <= 0) return null
    const actualCombined = parsed.total / (parsed.big + parsed.reg)
    const table = Object.fromEntries(
      Object.entries(currentMachine.bonusRateBySetting).map(([s, v]) => [Number(s), v.combined]),
    )
    return findNearestSetting(actualCombined, table)
  }, [ready, parsed.big, parsed.reg, parsed.total, currentMachine])

  const highlightGrapeSetting = useMemo(() => {
    if (!ready || resFree.ok === false) return null
    const actualGrape = resFree.denom
    return findNearestSetting(actualGrape, currentMachine.grapeRateBySetting)
  }, [ready, resFree, currentMachine])

  // ぶどう設定マッチ＋簡易評価（チェリー狙いを基準に判定）
  // 拡張：REG、合成も同様に最近似設定を求める
  const grapeEval: GrapeEval | null = useMemo(() => {
    if (!ready) return null
    if (!resAim.ok) return null

    // 1. ぶどう (既存ロジック)
    const grapeData = currentMachine.grapeRateBySetting
    const actualGrape = resAim.denom
    let bestGrape: EvalItem | null = null
    {
      let minDiff = Infinity
      for (let s = 1; s <= 6; s++) {
        const setting = s as Setting
        const val = grapeData[setting]
        if (!val) continue
        const diff = Math.abs(actualGrape - val)
        if (diff < minDiff) {
          minDiff = diff
          bestGrape = {
            actualDenom: actualGrape,
            nearestSetting: setting,
            nearestSettingDenom: val,
          }
        }
      }
    }

    // 2. REG単独確率 (Proモードかつデータがある場合のみ)
    let bestSoloReg: EvalItem | undefined = undefined
    if (isProMode && currentMachine.soloReg) {
      // soloReg (string state) を数値変換
      const soloRegNum = Number(soloReg || 0)
      if (soloRegNum > 0 && parsed.total > 0) {
        const actualSoloReg = parsed.total / soloRegNum
        const soloRegData = currentMachine.soloReg
        
        let minDiff = Infinity
        for (let s = 1; s <= 6; s++) {
          const setting = s as Setting
          const val = soloRegData[setting]
          if (!val) continue
          const diff = Math.abs(actualSoloReg - val)
          if (diff < minDiff) {
            minDiff = diff
            bestSoloReg = {
              actualDenom: actualSoloReg,
              nearestSetting: setting,
              nearestSettingDenom: val,
            }
          }
        }
      } else {
        // データ不足時は便宜上設定1付近の値をセットするか、undefinedのままにして表示側でハンドリング
        // ここではundefinedのままとし、表示側で「-」とする
      }
    }

    // 3. REG (トータル)
    const actualReg = parsed.total / parsed.reg // regが0の場合はInfinity
    let bestReg: EvalItem | null = null
    {
       // regが0の場合は計算不能 -> nearestSetting=1, nearestSettingDenom=0 (便宜上)
       if (parsed.reg <= 0) {
         bestReg = {
           actualDenom: Infinity,
           nearestSetting: 1,
           nearestSettingDenom: currentMachine.bonusRateBySetting[1].reg, // 便宜上設定1
         }
       } else {
        let minDiff = Infinity
        for (let s = 1; s <= 6; s++) {
          const setting = s as Setting
          const val = currentMachine.bonusRateBySetting[setting].reg
          if (!val) continue
          const diff = Math.abs(actualReg - val)
           if (diff < minDiff) {
             minDiff = diff
             bestReg = {
               actualDenom: actualReg,
               nearestSetting: setting,
               nearestSettingDenom: val,
             }
           }
        }
       }
    }

    // 4. 合成
    const hitCount = parsed.big + parsed.reg
    const actualCombined = parsed.total / hitCount
    let bestCombined: EvalItem | null = null
    {
       if (hitCount <= 0) {
          bestCombined = {
             actualDenom: Infinity,
             nearestSetting: 1,
             nearestSettingDenom: currentMachine.bonusRateBySetting[1].combined
          }
       } else {
          let minDiff = Infinity
          for (let s = 1; s <= 6; s++) {
             const setting = s as Setting
             const val = currentMachine.bonusRateBySetting[setting].combined
             if (!val) continue
             const diff = Math.abs(actualCombined - val)
             if (diff < minDiff) {
                minDiff = diff
                bestCombined = {
                   actualDenom: actualCombined,
                   nearestSetting: setting,
                   nearestSettingDenom: val,
                }
             }
          }
       }
    }

    if (!bestGrape || !bestReg || !bestCombined) return null

    // 総回転数から信頼度をざっくり決める
    let confidence: GrapeConfidence = 'low'
    if (parsed.total >= 3000) {
      confidence = 'high'
    } else if (parsed.total >= 1000) {
      confidence = 'mid'
    }

    return {
       grape: bestGrape,
       soloReg: bestSoloReg,
       reg: bestReg,
       combined: bestCombined,
       confidence,
       totalGames: parsed.total
    }
  }, [ready, resAim, currentMachine, parsed.total, parsed.reg, parsed.big, isProMode, soloReg]) // 依存配列に isProMode, soloReg を追加

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-50 px-4 py-6 sm:py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:gap-8">
        {/* ページ固有のタイトルと説明 */}
        {(pageTitle || pageDescription) && (
          <div className="w-full max-w-2xl text-center space-y-2">
            {pageTitle && (
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
                {pageTitle}
              </h1>
            )}
            {pageDescription && (
              <p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">
                {pageDescription}
              </p>
            )}
          </div>
        )}

        {/* 上部：入力カード ＋ 結果カード */}
        <div className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800">
          <div className="text-center">
            <h2 className="text-[22px] font-bold tracking-tight leading-tight sm:text-3xl">
              6号機ジャグラーぶどう確率 逆算
            </h2>
            <p className="text-[18px] font-bold tracking-tight sm:text-2xl">設定推測ツール</p>
          </div>

          {/* 機種切り替えセレクター */}
          {showMachineSelector && (
            <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2 sm:text-base dark:text-slate-200">
                  機種を選択
                </span>
                <select
                  value={machine ? currentKeyFromPath : selectedKey}
                  onChange={e => {
                    const newKey = e.target.value
                    if (machine) {
                      // 単一機種モード：ページ遷移
                      const newPath = keyToPath[newKey]
                      if (newPath) {
                        navigate(newPath)
                      }
                    } else {
                      // 複数機種モード：state更新
                      setSelectedKey(newKey)
                    }
                  }}
                  className="h-12 w-full max-w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-medium text-center text-slate-900 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:h-14 sm:text-lg dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-600"
                  style={{ minWidth: '100%' }}
                >
                  {(machine ? ALL_MACHINES : machines || []).map(m => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* 機種セレクターを非表示にする場合は機種名のみ表示 */}
          {!showMachineSelector && machine && (
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                {currentMachine.label}
              </p>
            </div>
          )}

          {/* モード切替 */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsProMode(false)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:px-5 sm:py-2.5 sm:text-base ${
                !isProMode
                  ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              シンプル
            </button>
            <button
              type="button"
              onClick={() => setIsProMode(true)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:px-5 sm:py-2.5 sm:text-base ${
                isProMode
                  ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              プロモード
            </button>
          </div>

          {/* 入力フォーム */}
          {!isProMode ? (
            // シンプルモード
            <form className="grid grid-cols-2 gap-3">
              <Field label="BIG回数" value={bigCount} onChange={setBigCount} />
              <Field label="REG回数" value={regCount} onChange={setRegCount} />
              <Field
                label="差枚数（±）"
                value={diffCoins}
                onChange={setDiffCoins}
                placeholder="例: 500 / -300"
              />
              <Field label="総回転数" value={totalGames} onChange={setTotalGames} placeholder="G数" />
            </form>
          ) : (
            // プロモード（詳細入力）
            <form className="space-y-4">
              {/* BIGグループ */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">BIG回数</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="単独BIG" value={soloBig} onChange={setSoloBig} placeholder="0" />
                  <Field label="チェリー重複BIG" value={cherryBig} onChange={setCherryBig} placeholder="0" />
                </div>
              </div>
              
              {/* REGグループ */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">REG回数</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="単独REG" value={soloReg} onChange={setSoloReg} placeholder="0" />
                  <Field label="チェリー重複REG" value={cherryReg} onChange={setCherryReg} placeholder="0" />
                </div>
              </div>
              
              {/* 差枚数・総回転数 */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="差枚数（±）"
                  value={diffCoins}
                  onChange={setDiffCoins}
                  placeholder="例: 500 / -300"
                />
                <Field label="総回転数" value={totalGames} onChange={setTotalGames} placeholder="G数" />
              </div>
            </form>
          )}

          {/* 結果（選択機種） */}
          <div className="mt-1.5 grid grid-cols-2 gap-2.5 sm:gap-3">
            <ResultCard title="チェリー狙い" res={resAim} color="emerald" />
            <ResultCard title="フリー打ち" res={resFree} color="blue" />
          </div>
          <button
            type="button"
            onClick={() => {
              setBigCount('')
              setRegCount('')
              setDiffCoins('')
              setTotalGames('')
              setSoloBig('')
              setCherryBig('')
              setSoloReg('')
              setCherryReg('')
              localStorage.removeItem(STORAGE_KEY)
            }}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-500 bg-rose-500/90 text-sm font-semibold tracking-wide text-white shadow-md hover:bg-rose-500 focus:ring-2 focus:ring-rose-500/70 focus:outline-none active:scale-[0.98] dark:border-rose-300 dark:bg-rose-400/90 dark:text-slate-900 dark:hover:bg-rose-300"
          >
            <span className="inline-block scale-125 text-3xl leading-none font-extrabold sm:scale-110 sm:text-2xl">
              ↺
            </span>
            <span>入力をすべてリセット</span>
          </button>
        </div>
        {ready && (
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-xs">▼</span>
              <span>下に設定別ボーナス＆ぶどう確率の一覧があります</span>
            </span>
          </div>
        )}
        {/* ぶどう逆算の簡易評価カード */}
        {grapeEval && <GrapeEvalCard eval={grapeEval} />}
        {/* 機種別：設定ごとのボーナス＆ぶどう確率（分母） */}
        <GrapeTable
          machine={currentMachine}
          highlightBig={highlightBigSetting}
          highlightReg={highlightRegSetting}
          highlightCombined={highlightCombinedSetting}
          highlightGrape={highlightGrapeSetting}
        />

        {/* ---- 注意書き（ミスタージャグラー以外） ---- */}
        {currentMachine.key !== 'mister' && (
          <div className="mt-6 w-full max-w-md text-center text-[11px] text-slate-500 dark:text-slate-400">
            ※計算前提：チェリーは設定3の確率を使用。フリー打ちは奪取率66.7%（2/3）、ベル／ピエロは非奪取として無視。
          </div>
        )}

        {/* フッター */}
        <footer className="mt-12 w-full text-center text-xs text-gray-400 dark:text-gray-600">
          <p>Copyright(c) 2026 GrapeReverse All Rights Reserved.</p>
          <p className="mt-1">当サイトのコード・タグ等の無断転載・使用は固く禁じます。</p>
        </footer>
      </div>

      {/* 管理者設定（GA除外）- 右下隅固定 */}
      <button
        type="button"
        onClick={() => {
          localStorage.setItem('is_admin_user', 'true')
          alert('管理者のアクセス除外設定をONにしました。以降のアクセスは計測されません。')
          window.location.reload()
        }}
        className="fixed bottom-0 right-0 text-[10px] text-gray-500 opacity-20 hover:opacity-40 p-2"
      >
        Admin Settings
      </button>
    </div>
  )
}

/* ---- 入力フィールド（Enterで次へ） ---- */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const form = e.currentTarget.form
      if (!form) return
      const elements = Array.from(form.elements).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && el.tagName === 'INPUT',
      )
      const index = elements.indexOf(e.currentTarget)
      if (index >= 0 && index < elements.length - 1) elements[index + 1].focus()
    }
  }
  return (
    <label className="block space-y-0.5">
      <span className="block text-[15px] font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        step="1"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="mt-0.5 h-10 w-full rounded-xl border border-slate-400 bg-white px-3 text-left text-lg tracking-wide tabular-nums focus:ring-blue-500 focus:outline-none sm:text-base dark:border-slate-500 dark:bg-slate-700 dark:text-white"
      />
    </label>
  )
}

/* ---- 結果カード ---- */
function ResultCard({
  title,
  res,
  color,
}: {
  title: string
  res: CalcResult
  color: 'emerald' | 'blue'
}) {
  const theme =
    color === 'emerald'
      ? {
          border: 'border-emerald-200 dark:border-emerald-800',
          bg: 'bg-emerald-50/70 dark:bg-emerald-900/30',
          title: 'text-emerald-700 dark:text-emerald-300',
          num: 'text-emerald-700 dark:text-emerald-200',
          badgeBg: 'bg-emerald-100/80 dark:bg-emerald-800/70',
        }
      : {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-50/70 dark:bg-blue-900/30',
          title: 'text-blue-700 dark:text-blue-300',
          num: 'text-blue-700 dark:text-blue-200',
          badgeBg: 'bg-blue-100/80 dark:bg-blue-800/70',
        }

  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.bg} px-4 py-3 sm:px-5 sm:py-4`}>
      {/* タイトル行 */}
      <div className="mb-2 flex items-center justify-center gap-2 sm:mb-3">
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide sm:text-[13px] ${theme.badgeBg}`}
        >
          {title}
        </div>
      </div>

      {res.ok ? (
        <div className="mt-2 space-y-2 text-center sm:mt-3">
          <div
            className={`text-3xl font-extrabold tracking-tight tabular-nums sm:text-[28px] ${theme.num}`}
          >
            1 / {nf2.format(res.denom)}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-center text-[12px] text-slate-500 sm:text-sm dark:text-slate-400">
          BIG / REG / 差枚 / 総回転数を入力すると自動で表示します。
        </p>
      )}
    </div>
  )
}

/** 分母に最も近い設定番号を求める */
function findNearestSetting(target: number, table: { [key: number]: number }) {
  let nearest = 1
  let minDiff = Math.abs(table[1] - target)

  for (let s = 2; s <= 6; s++) {
    const diff = Math.abs(table[s] - target)
    if (diff < minDiff) {
      minDiff = diff
      nearest = s
    }
  }

  return nearest
}

/* ---- ぶどう＋ボーナス確率テーブル（設定別・分母） ---- */
function GrapeTable({
  machine,
  highlightBig,
  highlightReg,
  highlightCombined,
  highlightGrape,
}: {
  machine: MachineSpec
  highlightBig: number | null
  highlightReg: number | null
  highlightCombined: number | null
  highlightGrape: number | null
}) {
  const grapeData = machine.grapeRateBySetting
  const bonusData = machine.bonusRateBySetting

  const rows: { s: Setting; grape: number; big: number; reg: number; combined: number }[] = [
    {
      s: 1,
      grape: grapeData[1],
      big: bonusData[1].big,
      reg: bonusData[1].reg,
      combined: bonusData[1].combined,
    },
    {
      s: 2,
      grape: grapeData[2],
      big: bonusData[2].big,
      reg: bonusData[2].reg,
      combined: bonusData[2].combined,
    },
    {
      s: 3,
      grape: grapeData[3],
      big: bonusData[3].big,
      reg: bonusData[3].reg,
      combined: bonusData[3].combined,
    },
    {
      s: 4,
      grape: grapeData[4],
      big: bonusData[4].big,
      reg: bonusData[4].reg,
      combined: bonusData[4].combined,
    },
    {
      s: 5,
      grape: grapeData[5],
      big: bonusData[5].big,
      reg: bonusData[5].reg,
      combined: bonusData[5].combined,
    },
    {
      s: 6,
      grape: grapeData[6],
      big: bonusData[6].big,
      reg: bonusData[6].reg,
      combined: bonusData[6].combined,
    },
  ]

  return (
    <div className="mt-4 w-full max-w-md sm:mt-2 sm:max-w-lg">
      <div className="overflow-hidden rounded-2xl shadow ring-1 ring-slate-300 dark:ring-slate-800">
        <div className="bg-white px-4 py-3 dark:bg-slate-900">
          <h3 className="text-base font-semibold sm:text-lg">
            {machine.label}：設定別 ボーナス＆ぶどう確率
          </h3>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-900">
          <table className="min-w-full text-sm sm:text-base">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="w-14 px-3 py-2.5 text-left whitespace-nowrap sm:w-16 sm:px-4 sm:py-3">
                  設定
                </th>
                <th className="px-3 py-2.5 text-left whitespace-nowrap sm:px-4 sm:py-3">B確率</th>
                <th className="px-3 py-2.5 text-left whitespace-nowrap sm:px-4 sm:py-3">R確率</th>
                <th className="px-3 py-2.5 text-left whitespace-nowrap sm:px-4 sm:py-3">合成</th>
                <th className="px-3 py-2.5 text-left whitespace-nowrap sm:px-4 sm:py-3">ぶ確率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map(r => {
                const isBigHit = highlightBig === r.s
                const isRegHit = highlightReg === r.s
                const isCombinedHit = highlightCombined === r.s
                const isGrapeHit = highlightGrape === r.s

                // ハイライトスタイルの定義
                // 通常ハイライト（設定1～5）: 赤文字・太字・サイズ大
                const styleNormal = 'text-red-600 dark:text-red-500 font-bold text-lg'
                // プレミアムハイライト（設定6）: レインボー文字・極太・サイズ特大
                const stylePremium =
                  'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent font-extrabold text-xl'

                // 判定ロジック関数
                const getStyle = (isHit: boolean) => {
                  if (!isHit) return '' // ヒットなし（デフォルト色）
                  return r.s === 6 ? stylePremium : styleNormal
                }

                // 各セルのスタイル決定
                // ヒットしていない場合は、標準色（Slate）を使用
                // ※元々Step79ではヒット時以外クラス指定なし（親継承）だったが、
                //   ダークモード視認性確保のため明示的に指定する
                const baseText = 'text-slate-900 dark:text-slate-200'

                const clsBig = isBigHit ? getStyle(true) : baseText
                const clsReg = isRegHit ? getStyle(true) : baseText
                const clsCombined = isCombinedHit ? getStyle(true) : baseText
                const clsGrape = isGrapeHit ? getStyle(true) : baseText

                return (
                  <tr key={r.s}>
                    <td className="px-4 py-2.5 sm:py-3">{r.s}</td>

                    <td className={`px-4 py-2.5 sm:py-3 tabular-nums ${clsBig}`}>
                      1/{nf1.format(r.big)}
                    </td>
                    <td className={`px-4 py-2.5 sm:py-3 tabular-nums ${clsReg}`}>
                      1/{nf1.format(r.reg)}
                    </td>
                    <td className={`px-4 py-2.5 sm:py-3 tabular-nums ${clsCombined}`}>
                      1/{nf1.format(r.combined)}
                    </td>
                    <td className={`px-4 py-2.5 sm:py-3 tabular-nums ${clsGrape}`}>
                      1/{nf2.format(r.grape)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ---- ぶどう評価カード ---- */
/* ---- ぶどう評価カード（拡張版） ---- */
/* ---- ぶどう評価カード（拡張版） ---- */
function GrapeEvalCard({ eval: e }: { eval: GrapeEval }) {
  const confidenceLabel =
    e.confidence === 'high' ? '信頼度：高' : e.confidence === 'mid' ? '信頼度：中' : '信頼度：低'

  // 行コンポーネント
  const Row = ({ label, item }: { label: string; item: EvalItem }) => {
     // Infinityハンドリング
     const actualText = item.actualDenom === Infinity ? '-' : `1/${nf2.format(item.actualDenom)}`
     
     return (
        <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2 border-b border-amber-200/50 py-2 last:border-0 dark:border-amber-700/50">
           <div className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
              {label}
           </div>
           {/* 実戦値 */}
           <div className="text-right text-base font-bold tabular-nums text-slate-800 dark:text-slate-100 sm:text-lg">
              {actualText}
           </div>
           {/* 近似設定 */}
           <div className="text-right text-sm font-bold text-slate-600 dark:text-slate-300 sm:text-base">
              設定{item.nearestSetting}：1/{nf2.format(item.nearestSettingDenom)}
           </div>
        </div>
     )
  }

  return (
    <div className="mt-3 w-full max-w-md sm:mt-3 sm:max-w-lg">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 shadow-sm sm:px-5 sm:py-4 dark:border-amber-700 dark:bg-amber-900/30">
        <div className="mb-2 flex items-center justify-between border-b-2 border-amber-200 pb-2 dark:border-amber-700/50">
          <span className="text-base font-bold text-amber-900 sm:text-lg dark:text-amber-100">
            簡易設定評価（チェリー狙い）
          </span>
          <span className="text-xs font-semibold text-amber-800/80 sm:text-sm dark:text-amber-200/80">
            {confidenceLabel}
          </span>
        </div>
        
        <div className="flex flex-col">
           <Row label="ぶどう確率" item={e.grape} />
           {e.soloReg && <Row label="単独REG" item={e.soloReg} />}
           <Row label="REG確率" item={e.reg} />
           <Row label="合成確率" item={e.combined} />
        </div>

        <div className="mt-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
           総回転数：{e.totalGames.toLocaleString('ja-JP')}G
        </div>
      </div>
    </div>
  )
}

