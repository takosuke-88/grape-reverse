import { useEffect } from 'react'
import HanaHanaCalculator from '../../components/HanaHanaCalculator'

export default function HighHighShiosaiPage() {
  useEffect(() => {
    document.title = 'ハイハイシオサイ(6号機) 設定判別ツール | GrapeReverse'
  }, [])

  return (
    <HanaHanaCalculator machineId="high-high-shiosai" showMachineSelector={true} />
  )
}
