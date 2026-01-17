import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ALL_MACHINES } from '../data/machineSpecs'

// 機種ごとのカラーテーマ定義（筐体イメージに基づく）
const MACHINE_THEMES: Record<string, string> = {
  myj5: 'bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 text-white',
  funky2: 'bg-gradient-to-r from-gray-900 via-purple-900 to-black text-purple-100',
  happy_v3: 'bg-gradient-to-r from-green-800 to-lime-500 text-white',
  ultra_miracle: 'bg-gradient-to-r from-purple-800 via-yellow-600 to-purple-900 text-yellow-100',
  gogo3: 'bg-gradient-to-r from-pink-700 to-pink-800 text-pink-50',
  aim_ex6: 'bg-gradient-to-r from-red-600 to-yellow-500 text-white',
  mister: 'bg-gradient-to-r from-gray-800 via-gray-400 to-gray-900 text-white',
  girls_ss: 'bg-gradient-to-r from-green-500 to-orange-500 text-white',
}

export default function HomePage() {
  useEffect(() => {
    document.title = 'GrapeReverse - ジャグラーぶどう逆算設定判別ツール'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'ジャグラーの総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。マイジャグラーV、ネオアイムジャグラーEXなど各機種対応。',
      )
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-slate-50 px-6 py-8 sm:px-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
            機種を選択
          </h1>
          <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
            ぶどう逆算で設定を推測
          </p>
        </div>

        {/* 機種一覧リスト */}
        <div className="w-full space-y-3 px-1 sm:px-0">
          {ALL_MACHINES.map(machine => {
            const urlPath = getUrlPathForMachine(machine.key)
            const themeClass = MACHINE_THEMES[machine.key] || 'bg-gradient-to-r from-slate-600 to-slate-800 text-white'
            
            return (
              <Link
                key={machine.key}
                to={urlPath}
                className={`flex h-20 items-center justify-between rounded-lg px-5 shadow-md transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${themeClass}`}
              >
                {/* 機種名 */}
                <h3 className="text-base font-bold tracking-tight sm:text-lg drop-shadow-md">
                  {machine.label}
                </h3>
                
                {/* 矢印アイコン */}
                <svg
                  className="h-6 w-6 flex-shrink-0 drop-shadow-md sm:h-7 sm:w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )
          })}
        </div>

        {/* すべての機種を一覧で使えるリンク */}
        <div className="mt-4 w-full">
          <Link
            to="/all"
            className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white/80 shadow-sm transition-all hover:border-blue-400 hover:bg-white hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            <div className="text-center">
              <h3 className="text-sm font-semibold sm:text-base dark:text-white">
                すべての機種を一覧で使う
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                機種セレクターで切り替え（従来版）
              </p>
            </div>
          </Link>
        </div>

        {/* フッター */}
        <footer className="mt-8 w-full text-center text-xs text-gray-400 dark:text-gray-400">
          <p>Copyright(c) 2026 GrapeReverse All Rights Reserved.</p>
          <p className="mt-1">当サイトのコード・タグ等の無断転載・使用は固く禁じます。</p>
        </footer>
      </div>
    </div>
  )
}

/** 機種キーからURLパスを生成 */
function getUrlPathForMachine(key: string): string {
  const pathMap: Record<string, string> = {
    aim_ex6: '/aimex',
    myj5: '/myjuggler5',
    funky2: '/funky2',
    gogo3: '/gogo3',
    girls_ss: '/girlsss',
    ultra_miracle: '/ultramiracle',
    mister: '/mister',
    happy_v3: '/happyv3',
  }
  return pathMap[key] || `/${key}`
}


