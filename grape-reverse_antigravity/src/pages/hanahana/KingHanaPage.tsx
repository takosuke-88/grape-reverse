import { useEffect } from 'react'
import HanaHanaCalculator from '../../components/HanaHanaCalculator'

export default function KingHanaPage() {
  useEffect(() => {
    document.title = 'キングハナハナ-30 設定判別ツール | GrapeReverse'
  }, [])

  return (
    <HanaHanaCalculator machineId="king-hanahana" showMachineSelector={true} />
  )
}
