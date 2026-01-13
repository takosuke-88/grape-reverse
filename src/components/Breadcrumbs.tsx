import { Link, useLocation } from 'react-router-dom'
import { ALL_MACHINES } from '../data/machineSpecs'

export default function Breadcrumbs() {
  const location = useLocation()

  // トップページでは表示しない
  if (location.pathname === '/' || location.pathname === '') {
    return null
  }

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

  // 現在のパスから機種情報を取得
  const currentKey = pathToKey[location.pathname]
  const currentMachine = currentKey ? ALL_MACHINES.find(m => m.key === currentKey) : null

  // パンくずリストの項目を生成
  const breadcrumbItems: Array<{ label: string; path?: string }> = [
    { label: 'HOME', path: '/' },
  ]

  if (location.pathname === '/all') {
    breadcrumbItems.push({ label: 'すべての機種' })
  } else if (currentMachine) {
    breadcrumbItems.push({ label: currentMachine.label })
  } else {
    // その他のページ（404など）
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="w-full bg-slate-100/80 py-2 dark:bg-slate-900/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ol className="flex items-center space-x-2 text-xs sm:text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="mx-2 h-3 w-3 flex-shrink-0 text-slate-400 dark:text-slate-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isLast ? (
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path || '/'}
                    className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
