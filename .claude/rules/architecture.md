# Architecture Rules

## 1. システム概要 & ライフサイクル
- **Frontend**: React + Vite + TypeScript によるSPA（Single Page Application）。
- **Hosting**: Vercel による静的ホスティング。
- **Routing**: `react-router-dom` を使用したクライアントサイド・ルーティング。

## 2. ページ遷移 & アクセス解析 (GA4)
- SPA特有のページ遷移（疑似URL変更）をGoogleアナリティクス（GA4）で正確に検知するため、`src/components/GoogleAnalytics.tsx` を用いて制御する。
- **ルール**: ルーティングの変更を常に監視し、明示的にPV（Page View）イベントを発火させること。コンポーネントの改修や新規ページ追加時に、この送信処理を漏らしてはならない。

## 3. SEO (Search Engine Optimization)
- 新しいページを作成する際は、必ず `src/components/Seo.tsx` を配置する。
- 適切なProps（`pageTitle`, `pageDescription`, `pagePath`）を必ず渡すこと。
- **情報の継続性**: 既存ページの改修時、設定済みのSEOパラメータ（特にディスクリプション）は、明示的な指示がない限り変更せず**維持**すること。勝手に内容を薄めたり削除したりしてはならない。

## 4. データ永続化 (State Management)
- すべてのカウントデータ、入力履歴、差枚数データは、ブラウザのリロードやセッション切断で消失しないよう `localStorage` に保存する。
- **小役カウンター**（`MachinePageFactory`）: キー `grape-reverse-data-${config.id}`
- **ぶどう/ベル逆算ページ**（`GrapeReversePage`、ルート `/:machineId/grape`）: キー `grape-reverse-data-grape-mode-${machineId}` — **カウンター画面とは別キー**（自動同期しない。逆算ページで再入力する運用）。
- ボーナス関連の項目（BIG/REG、詳細内訳）で、数字ゾーンの直接入力（Enter確定）が行われた瞬間、および全体リセットが実行された瞬間に、履歴スタック（`bonusHistory`）をクリアする。
  - **理由**: 直接入力はタップ履歴との整合性が断絶するため。Undo（LIFO）の前提が壊れる状態で `pop` させないための防衛策。

## 5. 機種設定とファクトリーパターン
- UIコア（`DynamicInput.tsx` 等の30:70スプリット、Glow等）は**完全共通化**する。
- 小役構成・配色・判別テーブル・期待値計算は機種設定オブジェクト（`config`）に分離し、`MachinePageFactory.tsx` が機種ID（例: `myjug5`）を検知して動的にマッピング・注入する。
- コンポーネントへのベタ書きは禁止。新機種追加は設定オブジェクトの追加で対応する。

### `MachineConfig.specs`（ぶどう/ベル逆算・多機種対応）

実装は `src/types/machine-schema.ts` の `specs.payouts` / `specs.reverseCalcProbDenominators` を参照する（`GrapeReversePage.tsx`）。

```typescript
specs?: {
  payouts?: {
    big: number;
    reg: number;
    grape?: number;   // ジャグラーぶどう（8）
    bell?: number;    // ハナベル（10）。逆算では grape ?? bell
    cherry?: number;  // 逆算用。未指定: ジャグラー2 / ハナ4
  };
  reverseCalcProbDenominators?: {
    replay: number;              // 例: 7.3
    cherry: number;              // 例: 35.6（ジャグラー）/ 36.0（ハナ）
    cherryFreePlayRate?: number; // 0〜1。未指定: 2/3（21コマ系理論値）
  };
};
```

**主要機種の参照値**

| 機種 | big | reg | 小役払出 | cherry払出 | cherry分母 | 備考 |
|---|---|---|---|---|---|---|
| マイジャグラーV | 240 | 96 | grape 8 | 2 | 35.6 | フォールバック基準 |
| ハナハナホウオウ等 | 240 | 120 | bell/grape 10 | 4 | 36.0 | `grape: 10` を併記推奨 |

- **`baseCorrectionFactor` は未実装**（`decisions-log.md` 参照）。リプレイ・チェリーは下記の個別控除式を使用すること。
- 定数のマイジャグ固定ハードコードは禁止。未設定時のみ `REVERSE_CALC_FALLBACK`（`GrapeReversePage.tsx`）を使用。

### ぶどう/ベル逆算の計算式（`GrapeReversePage.tsx`）

1. 総投入 = 総ゲーム数 × 3
2. **総払出 = 総投入 + 差枚**（差枚は払出−投入。プラス＝勝ち）
3. ボーナス払出 = BIG × `payouts.big` + REG × `payouts.reg`
4. リプレイ補正 = (G / `replay`) × 3 — **チェリー狙い・フリー打ちで同一**
5. チェリー補正（狙い）= (G / `cherry`) × チェリー払出（100%取得）
6. チェリー補正（フリー）= 上記 × `cherryFreePlayRate`（既定 2/3）
7. 残り小役払出 = 総払出 − ボーナス − リプレイ補正 − チェリー補正
8. 推定回数 = 残り ÷ 小役払出（`grape ?? bell`）、確率 = G ÷ 回数
9. 設定推定（ベイズ）には**チェリー狙い**の推計回数を使用（ハナは `bell-count`、ジャグラーは `grape-count`）

## 6. コラム（記事）コンテンツ
- CMSは未導入。記事は **`src/pages/columns/*.tsx`** に React コンポーネントとして配置し、`src/data/column-list.ts` で一覧・ルーティング（`/columns/...`）を管理する。
- 新規記事追加時: `.tsx` 作成 → `column-list.ts` 登録 → `App.tsx` のルート追加（必要時）→ 各記事に `Seo` を配置。

## 7. PWA
- 未実装（将来検討）。明示指示がない限り `manifest` / Service Worker は追加しない。

## 8. ハナハナ固有（ベイズ・UI）
- フェザー/REG後ランプの示唆は `src/components/dynamic-ui/hana-lamp-hints.ts` と `bayes-estimator.ts` で下位設定を否定（設定6濃厚は「濃厚」表記、ユーザー向けに「確定」は使わない）。
- カウンター配色: `bell-count` はアンバー、ランプ suffix（`-white` 等）は `DynamicInput.getElementTheme` で個別色。
