import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ALL_MACHINES } from '../data/machineSpecs'

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
    <div className="min-h-screen w-full bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
            GrapeReverse
          </h1>
          <p className="text-lg font-semibold text-slate-700 sm:text-xl dark:text-slate-200">
            ジャグラーぶどう逆算設定判別ツール
          </p>
          <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
            総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。
          </p>
        </div>

        {/* 機種一覧 */}
        <div className="w-full max-w-2xl space-y-4">
          <h2 className="text-xl font-bold text-center sm:text-2xl dark:text-white">
            機種を選択してください
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {ALL_MACHINES.map(machine => {
              // URLパスを生成（例: myj5 -> /myjuggler5）
              const urlPath = getUrlPathForMachine(machine.key)
              return (
                <Link
                  key={machine.key}
                  to={urlPath}
                  className="block rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200 transition-all hover:shadow-lg hover:ring-blue-400 active:scale-[0.98] sm:p-6 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-blue-500"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight sm:text-xl dark:text-white">
                        {machine.label}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        設定判別ツールを開く
                      </p>
                    </div>
                    <svg
                      className="h-6 w-6 text-slate-400 dark:text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* すべての機種を一覧で使えるリンク */}
        <div className="mt-6 w-full max-w-2xl">
          <Link
            to="/all"
            className="block rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/50 p-5 text-center transition-all hover:border-blue-400 hover:bg-slate-100 sm:p-6 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            <h3 className="text-lg font-semibold sm:text-xl dark:text-white">
              すべての機種を一覧で使う
            </h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              機種セレクターで切り替えながら使用できます（従来版）
            </p>
          </Link>
        </div>

        {/* フッター */}
        <footer className="mt-12 w-full text-center text-xs text-gray-400 dark:text-gray-600">
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


