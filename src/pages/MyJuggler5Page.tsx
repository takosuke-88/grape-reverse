import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import GrapeCalculator from '../components/GrapeCalculator'
import { myJuggler5 } from '../data/machineSpecs'

export default function MyJuggler5Page() {
  useEffect(() => {
    document.title = 'マイジャグラーV 設定判別ツール | GrapeReverse'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'マイジャグラーVの総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。設定1〜6の詳細なスペック表付き。',
      )
    }
  }, [])

  return (
    <>
      <GrapeCalculator
        machine={myJuggler5}
        showMachineSelector={true}
        pageTitle="マイジャグラーV 設定判別ツール"
        pageDescription="総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。"
      />
      
      <div className="container mx-auto px-4 mt-8 mb-12 max-w-md">
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
            💡 攻略情報のヒント
          </h3>
          <Link
            to="/columns/myjuggler5-setting6-behavior"
            className="block text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            【必読】設定6はこう動く！ボーナスより「ぶどう」を信じるべき理由 &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}

