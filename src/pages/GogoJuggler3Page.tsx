import { useEffect } from 'react'
import GrapeCalculator from '../components/GrapeCalculator'
import { gogoJuggler3 } from '../data/machineSpecs'

export default function GogoJuggler3Page() {
  useEffect(() => {
    document.title = 'ゴーゴージャグラー3 設定判別ツール | GrapeReverse'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'ゴーゴージャグラー3の総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。設定1〜6の詳細なスペック表付き。',
      )
    }
  }, [])

  return (
    <GrapeCalculator
      machine={gogoJuggler3}
      showMachineSelector={true}
      pageTitle="ゴーゴージャグラー3 設定判別ツール"
      pageDescription="総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。"
    />
  )
}


