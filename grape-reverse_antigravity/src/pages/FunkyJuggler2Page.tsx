import { useEffect } from 'react'
import GrapeCalculator from '../components/GrapeCalculator'
import { funkyJuggler2 } from '../data/machineSpecs'

export default function FunkyJuggler2Page() {
  useEffect(() => {
    document.title = 'ファンキージャグラー2 設定判別ツール | GrapeReverse'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'ファンキージャグラー2の総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。設定1〜6の詳細なスペック表付き。',
      )
    }
  }, [])

  return (
    <GrapeCalculator
      machine={funkyJuggler2}
      showMachineSelector={true}
      pageTitle="ファンキージャグラー2 設定判別ツール"
      pageDescription="総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定を推測します。"
    />
  )
}

