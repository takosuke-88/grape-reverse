import { useEffect } from 'react'
import HanaHanaCalculator from '../components/HanaHanaCalculator'

export default function HanaHanaPage() {
  useEffect(() => {
    document.title = 'ハナハナ設定判別（ベル逆算） | GrapeReverse'
  }, [])

  return (
    <HanaHanaCalculator />
  )
}
