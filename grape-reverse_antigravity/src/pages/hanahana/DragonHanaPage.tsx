import { useEffect } from 'react'
import HanaHanaCalculator from '../../components/HanaHanaCalculator'

export default function DragonHanaPage() {
  useEffect(() => {
    document.title = 'ドラゴンハナハナ～閃光～-30 設定判別ツール | GrapeReverse'
  }, [])

  return (
    <HanaHanaCalculator machineId="dragon-hanahana" showMachineSelector={true} />
  )
}
