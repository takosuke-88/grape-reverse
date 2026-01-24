import { useEffect } from 'react'
import HanaHanaCalculator from '../../components/HanaHanaCalculator'

export default function HouohHanaPage() {
  useEffect(() => {
    document.title = 'ハナハナホウオウ～天翔～ 設定判別ツール | GrapeReverse'
  }, [])

  return (
    <HanaHanaCalculator machineId="houoh-tensho" />
  )
}
