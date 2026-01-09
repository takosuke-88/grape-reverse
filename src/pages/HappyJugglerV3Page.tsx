import { useEffect } from 'react'
import GrapeCalculator from '../components/GrapeCalculator'
import { happyJugglerV3 } from '../data/machineSpecs'

export default function HappyJugglerV3Page() {
  useEffect(() => {
    document.title = 'ハッピージャグラーVⅢ 設定判別ツール | GrapeReverse'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'ハッピージャグラーVⅢ（ブイスリー）の総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。設定1〜6の詳細なスペック表付き。',
      )
    }
  }, [])

  return (
    <GrapeCalculator
      machine={happyJugglerV3}
      showMachineSelector={true}
      pageTitle="ハッピージャグラーVⅢ 設定判別ツール"
      pageDescription="総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。"
    />
  )
}

