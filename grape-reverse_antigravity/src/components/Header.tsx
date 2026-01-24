import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg dark:from-blue-800 dark:to-blue-900">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-center">
          {/* ロゴ・タイトル */}
          <div
            className="cursor-pointer text-center"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/')
              }
            }}
          >
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              GrapeReverse
            </h1>
            <p className="text-xs text-blue-100 sm:text-sm">
              ジャグラー設定判別ツール
            </p>
          </div>
          
          {/* 右側のナビゲーション */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6">
            <button
              onClick={() => navigate('/columns/myjuggler5-setting6-behavior')}
              className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/30 sm:text-sm"
            >
              攻略コラム
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
