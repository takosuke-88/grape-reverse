import { useEffect } from 'react'
import HanaHanaCalculator from '../../components/HanaHanaCalculator'

export default function StarHanaPage() {
  useEffect(() => {
    document.title = 'スターハナハナ-30 設定判別ツール | GrapeReverse'
  }, [])

  return (
    <HanaHanaCalculator machineId="star-hanahana" showMachineSelector={true} />
  )
}
