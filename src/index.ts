#!/usr/bin/env node
import { reverseGrape } from './lib/reverse'
import readline from 'readline'

// CLIインターフェース設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('🍇 grape-reverse CLI へようこそ！')
console.log('投入枚数・ボーナス回数・チェリー回数を順に入力してください。\n')

const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve))

async function main() {
  try {
    const coinIn = Number(await ask('投入枚数: '))
    const bonus = Number(await ask('ボーナス回数: '))
    const cherry = Number(await ask('チェリー回数: '))
    rl.close()

    const result = reverseGrape({
      series: 'ime',
      payout: 252,
      coinIn,
      bonus,
      cherry,
    })

    console.log('\n--- 結果 ---')
    console.log(`ぶどう回数: ${result.grapeCount}`)
    console.log(`ぶどう確率: 1/${result.grapeProb.toFixed(4)}`)
  } catch (err) {
    console.error('エラー:', err)
    rl.close()
  }
}

main()
