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
- すべてのカウントデータ、入力履歴、差枚数データは、ブラウザのリロードやセッション切断で消失しないよう `localStorage` に保存・同期する。
- カウンター画面と「ぶどう逆算」ページは同一のState（または `localStorage` の同一キー）を参照し、データの一貫性・自動同期を担保する。
- ボーナス関連の項目（BIG/REG、詳細内訳）で、テンキーによる「直接入力」が行われた瞬間、および全体リセットが実行された瞬間に、履歴スタック（`bonusHistory`）の配列をクリア（`[]` にリセット）する安全ガードを実装すること。
  - **理由**: 直接入力はタップ履歴との整合性が断絶するため。Undo（LIFO）の前提が壊れる状態で `pop` させないための防衛策。

## 5. 機種設定とファクトリーパターン
- UIコア（`DynamicInput.tsx` 等の30:70スプリット、Glow等）は**完全共通化**する。
- 小役構成・配色・判別テーブル・期待値計算は機種設定オブジェクト（`config`）に分離し、`MachinePageFactory.tsx` が機種ID（例: `myjug5`）を検知して動的にマッピング・注入する。
- コンポーネントへのベタ書きは禁止。新機種追加は設定オブジェクトの追加で対応する。

### `MachineConfig` 型（ぶどう逆算・多機種対応）

```typescript
export interface MachineConfig {
  id: string;
  name: string;
  bonusPayouts: {
    big: number;  // 例: 240（マイジャグラーV）
    reg: number;  // 例: 96
  };
  grapePayout: number;           // ぶどう1回あたりの払出枚数（例: 8）
  baseCorrectionFactor: number;  // ぶどう・ボーナス以外の小役による1Gあたり払出期待値の合計
}
```

**主要機種の参照値（Config実装用）**

| 機種 | `bonusPayouts.big` | `bonusPayouts.reg` | `grapePayout` | `baseCorrectionFactor` |
|---|---|---|---|---|
| マイジャグラーV（デフォルト） | 240 | 96 | 8 | 0.494 |
| キングハナハナ-30（将来用） | — | — | 10 | 0.526 |

- `baseCorrectionFactor` はリプレイ・チェリー・ベル・ピエロ等を合算した「1Gあたりの払出期待枚数」。個別確率の毎回シミュレートより、Configから参照する方式を採用する。
- 現フェーズ（`ui-sandbox`）はマイジャグラーVの値をデフォルトとして実装する。定数のハードコードは禁止し、必ず `config.*` を参照すること。

### ぶどう逆算の計算式

1. 総投入枚数 = 総ゲーム数 × 3
2. 総払出枚数 = 総投入枚数 + 差枚数
3. ベース補正枚数 = 総ゲーム数 × `config.baseCorrectionFactor`
4. 推定ぶどう払出枚数 = 総払出枚数 − (BIG回数 × `config.bonusPayouts.big` + REG回数 × `config.bonusPayouts.reg`) − ベース補正枚数
5. 推定ぶどう回数 = 推定ぶどう払出枚数 ÷ `config.grapePayout`
6. 推定ぶどう確率 = 総ゲーム数 ÷ 推定ぶどう回数

```typescript
const baseCorrectionCoins = totalGames * config.baseCorrectionFactor;
const estimatedGrapeCoins =
  estimatedTotalOutCoins
  - (bigCount * config.bonusPayouts.big + regCount * config.bonusPayouts.reg)
  - baseCorrectionCoins;
const estimatedGrapeCount = estimatedGrapeCoins / config.grapePayout;
const estimatedGrapeProbability = totalGames / estimatedGrapeCount;
```

## 6. コラム（記事）コンテンツ
- CMSは未導入。`/src/content/columns/` 等に Markdown（`.md`）を配置し、ビルド時または動的インポートでパースして展開する静的ファイル管理とする。

## 7. PWA
- 現時点では対象外（ロードマップ上の将来像）。`manifest.json` や Service Worker によるオフラインキャッシュは、コアUI/UX（`ui-sandbox`）が安定した後のフェーズで実装する。
