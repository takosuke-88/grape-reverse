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
- **機種ID → `MachineConfig` の対応表（CONFIG_MAP）は `src/data/machine-config-map.ts` に一元管理する**（2026-07-19統合）。`GrapeReversePage.tsx` / `MachineSpecPage.tsx` / `MachinePagePreview.tsx` はこのファイルから`CONFIG_MAP`をimportするだけで、各ページに個別のマッピングを持たない。**新機種を追加する場合は `src/data/machines/<slug>.ts` の作成、`machine-list.ts`（`AVAILABLE_MACHINES`）への登録、そして `machine-config-map.ts` への1エントリ追加のみでよい**（以前は3ファイルへの重複追加が必要で、更新漏れによる「特定ページだけ機種が見つからない」不具合のリスクがあった）。

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
- 記事は **`src/content/columns/<slug>.md`** に Markdown（YAML フロントマター + 本文）として配置する。ルーティングは動的ルート **`/columns/:slug`**（`src/pages/columns/ColumnDetailPage.tsx`）一本で処理し、記事ごとの `.tsx`/個別 `<Route>` は追加しない。
- **フロントマター**: `title` / `description` / `date`（`YYYY-MM-DD`。公開日）/ `updatedAt`（`YYYY-MM-DD`。更新日。新規作成時は`date`と同一値で初期化し、リライト時のみ`updatedAt`を更新する。`date`自体は公開後に変更しない）/ `tags: string[]` / `draft: boolean` / `showRelatedColumns?: boolean`（既定 `false`。記事末尾に関連記事セクションを出す場合のみ `true`）。単一の `category` フィールドは持たない（パチンコ/パチスロどちらとも言えない記事があるため `tags` の自由記述で表現する）。
- **公開日・更新日の表示**: `ColumnDetailPage.tsx`が本文の直前に「公開日：YYYY年MM月DD日」を表示。`updatedAt`が`date`と異なる場合のみ「更新日：YYYY年MM月DD日」を追加表示する（同一なら更新日欄は省略）。
- **構造化データ（JSON-LD）**: `src/components/Seo.tsx`が`articleMeta`（`datePublished`/`dateModified`）propを受け取ると`BlogPosting`のJSON-LDを`<head>`に注入する。`articleMeta`未指定のページ（コラム以外）では出力しない。`ColumnDetailPage.tsx`は`frontmatter.date`→`datePublished`、`frontmatter.updatedAt`→`dateModified`として渡す。
- **読み込み**: `src/data/column-content.ts` が `import.meta.glob("/src/content/columns/*.md", { query: "?raw", import: "default", eager: true })` で全記事を読み込み、`front-matter` パッケージ（`gray-matter` ではない — Node組み込み依存がなくブラウザバンドルでもポリフィル不要なため採用）でフロントマターと本文をパース。`draft: true` を除外し日付降順ソート済みの `ALL_COLUMNS` と `getColumnBySlug(slug)` を export する。一覧ページ（`index.tsx`）・`ColumnNavigation`・`RelatedColumns`・機種ページの関連コラム表示（`MachinePageFactory.tsx`）・ホームの最新コラムはすべてこの1モジュールを参照する。**`ATTACHED_COLUMNS` や `column-list.ts` は廃止**（再導入禁止）。
- **本文の描画**: `ColumnDetailPage.tsx` が `react-markdown` + `rehype-raw` で本文をレンダリングする。CTAボタン・コールアウトボックス・パンくず・番号バッジカード・統計グリッドなど「記事固有のカスタムデザインを持つ要素」は Tailwind クラス付きの**生HTMLを `.md` 本文にそのまま埋め込み**、`not-prose` でラップして `@tailwindcss/typography` の `prose` スタイルと衝突させないようにする。平文の `<p>`/`<strong>`/単純な `<ul><li>` は素の Markdown 記法にする。
- **見出し（h2/h3）とtableは記事間で完全に統一デザイン**（2026-07-16決定、`decisions-log.md` 参照）。`<h2>`/`<h3>`/`<table>`/`<th>`/`<td>` には**class属性・style属性を一切付けない**（`not-prose` で囲む必要もない）。見た目は `src/index.css` の `.column-article` クラス（`ColumnDetailPage.tsx` の記事本文コンテナに付与）で一元管理する。テーブルのみ、モバイル幅での横スクロール対応として `<div class="overflow-x-auto my-6">` で囲む（これは唯一の固定・共通の例外的マークアップで、記事ごとに変える必要はない）。表内で特定の数値を強調したい場合は `<strong>`（太字のみ）または `<strong class="highlight">`（色付き強調。色は `.column-article strong.highlight` で一元管理、記事側で色クラスを直接指定しない）を使う。
- **`@tailwindcss/typography`**: `tailwind.config.js` の `plugins` に導入済み（`theme.extend.typography` にサイトのトーンに合わせたデフォルト値を定義）。ただし上記の通り既存記事の本文は`not-prose`ラップの生HTML中心のため、この typography 設定が実際に効くのは将来「素の Markdown 見出しで書かれ`not-prose`を使わない自動生成記事」の場合のみ。h2/h3/tableの統一は `.column-article`（`not-prose`に関係なく効く独立クラス）が担う。
- **内部リンク**: 本文中の `<a href="/...">`（生HTML埋め込み分も含む）は `ReactMarkdown` の `components={{ a: ... }}` オーバーライドで内部パスのみ `react-router` の `<Link>` に差し替え、SPA内遷移を維持する。
- **エラー耐性**: 本文レンダリングは `src/components/ColumnRenderErrorBoundary.tsx` でラップする。将来の自動生成記事でMarkdown/HTMLが壊れていても、そのページだけがフォールバック表示になり他ページに影響しない。
- **ビルド/サイトマップ**: `scripts/generate-sitemap.js` は `src/content/columns/*.md` を直接スキャンしてコラムURLを生成する（`draft: true` は除外）。新規記事追加は `.md` ファイルをこのディレクトリに置くだけで一覧・ナビ・サイトマップに自動反映される（`App.tsx` 等のコード変更は不要）。

## 7. PWA
- 未実装（将来検討）。明示指示がない限り `manifest` / Service Worker は追加しない。

## 8. ハナハナ固有（ベイズ・UI）
- フェザー/REG後ランプの示唆は `src/components/dynamic-ui/hana-lamp-hints.ts` と `bayes-estimator.ts` で下位設定を否定（設定6濃厚は「濃厚」表記、ユーザー向けに「確定」は使わない）。
- カウンター配色: `bell-count` はアンバー、ランプ suffix（`-white` 等）は `DynamicInput.getElementTheme` で個別色。
