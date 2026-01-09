import { useEffect } from 'react'
import GrapeCalculator from '../components/GrapeCalculator'
import { ALL_MACHINES } from '../data/machineSpecs'

export default function AllMachinesPage() {
  useEffect(() => {
    document.title = 'すべての機種 - GrapeReverse | ジャグラーぶどう逆算設定判別ツール'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'ジャグラーの総回転数・ボーナス回数・差枚数から、ぶどう確率を逆算して設定判別を行う無料Webツールです。マイジャグラーV、ネオアイムジャグラーEXなど各機種対応。',
      )
    }
  }, [])

  return (
    <GrapeCalculator
      machines={ALL_MACHINES}
      showMachineSelector={true}
      defaultMachine="aim_ex6"
    />
  )
}


