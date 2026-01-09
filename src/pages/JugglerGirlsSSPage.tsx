import { useEffect } from 'react'
import GrapeCalculator from '../components/GrapeCalculator'
import { jugglerGirlsSS } from '../data/machineSpecs'

export default function JugglerGirlsSSPage() {
  useEffect(() => {
    document.title = 'ジャグラーガールズSS 設定判別ツール | GrapeReverse'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'ジャグラーガールズSSの総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。設定1〜6の詳細なスペック表付き。',
      )
    }
  }, [])

  return (
    <GrapeCalculator
      machine={jugglerGirlsSS}
      showMachineSelector={true}
      pageTitle="ジャグラーガールズSS 設定判別ツール"
      pageDescription="総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。"
    />
  )
}


