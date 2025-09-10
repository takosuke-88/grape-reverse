# grape-reverse（作業メモ）

## 概要
ジャグラーのプレイデータから「推定ぶどう回数」「ぶどう確率」を逆算するツール。  
TypeScript + Node.js で作成。CLI としての利用を想定。

## インストール（開発環境）
```bash
corepack enable || npm i -g corepack
pnpm install
```

## 実行例（開発中）
```bash
npx ts-node src/run.ts --coins 15000 --bonus 6720 --cherry 267
```

出力例:
```
投入枚数: 15000
ボーナス払い出し: 6720
チェリー払い出し(推定): 267
推定ぶどう回数: 1288
ぶどう確率: 1/3.88
```

## 今後やること
- CLIコマンド化（`npx grape-rev ...` で実行できるようにする）
- テスト環境（vitest）導入
- GitHub の Description / Topics 設定
- README を外向けドキュメント化
- note用に文章や図解を流用できるよう整理
