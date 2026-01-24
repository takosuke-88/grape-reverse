import { useEffect } from 'react'
import GrapeCalculator from '../components/GrapeCalculator'
import { aimEX6 } from '../data/machineSpecs'

export default function AimEX6Page() {
  useEffect(() => {
    document.title = 'SアイムEX／ネオアイムジャグラーEX 設定判別ツール | GrapeReverse'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'SアイムEX／ネオアイムジャグラーEX（6号機）の総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。設定1〜6の詳細なスペック表付き。',
      )
    }
  }, [])

  return (
    <GrapeCalculator
      machine={aimEX6}
      showMachineSelector={true}
      pageTitle="SアイムEX／ネオアイムジャグラーEX 設定判別ツール"
      pageDescription="総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。"
    />
  )
}


