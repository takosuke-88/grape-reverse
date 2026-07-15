# Decisions Log (意思決定・変更履歴)

重要な仕様変更・廃止機能の記録。実装時に過去の設計を覆す指示がない限り厳守すること。新規の廃止・仕様確定時は `## YYYY-MM-DD: タイトル` + **決定事項** / **理由** / **現行仕様** で追記。

## 廃止・先祖返り禁止（常時有効）

| 項目 | 現行 |
|------|------|
| ホールド入力（長押しテンキー・Glowゲージ） | 廃止。`CounterDirectInputZone`（Enter確定・0フォールバック）のみ |
| `BonusInputPage` 等の分離ページ | 廃止。1画面完結（`MachinePageFactory`） |
| `baseCorrectionFactor` の新規実装 | 未実装。逆算はリプレイ・チェリー個別控除（`architecture.md` §5） |
| 差枚 `payout = coinIn - diffCoins` | 禁止。**`coinIn + diffCoins`** |
| フリー打ちのみリプレイ控除 | 禁止。リプレイは両モード共通、差分はチェリーこぼし率のみ |
| `bell-count` を緑（grape色）にする | 禁止。**アンバー**（`getElementTheme`） |
| `GrapeReversePage` 内カウンターの独自ローカル実装 | 廃止。`DynamicInput` を直接インポートして使用 |
| カウンターコンテナ div への独自 `boxShadow` 追加 | 禁止。`DynamicInput` のコンテナに boxShadow はない |
| コンパクトバー左セクションへの `maxWidth: "50%"` 制約 | 禁止。コンパクト時は `style={undefined}`（制約なし）が正解 |
| コラム記事を `src/pages/columns/*.tsx` にベタ書き＋`column-list.ts`へ手動登録 | 廃止（2026-07-15）。`src/content/columns/*.md` ＋ 動的ルート `/columns/:slug`（`architecture.md` §6） |

## 2026-04以前: ボーナス履歴 LIFO
- **現行仕様**: `bonusHistory` を `localStorage` に保持。「−」は直前の契機から `pop`。直接入力・全体リセット時はスタッククリア。

## 2026-05-23: ヘッダー・Sticky
- **現行仕様**: ブランドは `Grape Reverse`（狭幅時2行改行）。スクロール時は機種名バー＋ナビバーの2行のみ `sticky`。

## 2026-05-23: ぶどう/ベル逆算ページ
- **現行仕様**: `GrapeReversePage.tsx`（`/:machineId/grape`）の1画面完結。チェリー狙い／フリー打ちの2結果表示。詳細は `architecture.md` §5。

## 2026-05-24: 機種別 Config 注入
- **現行仕様**: 払出・分母は `MachineConfig.specs`。計算式のハードコード（マイジャグ固定）は禁止。

## 2026-05-31: カウンターUI（スマホ）
- **現行仕様**: Enter確定フォーム、0フォールバック、`w-20`左寄せ4桁、Sticky 2段。詳細は `coding-style.md` §3。

## 2026-06-01: 逆算ロジック確定
- **現行仕様**: 総払出=投入+差枚。リプレイ補正は両モード同一。フリー打ちは `cherryFreePlayRate`（既定2/3）。ハナ: bell/grape10・cherry4・分母36。設定推定はチェリー狙い基準。差枚は0以上のみ。逆算LSキーは `grape-reverse-data-grape-mode-${machineId}`（カウンター本体と別）。

## 2026-06-01: 本番ブランチ
- **現行仕様**: 開発・リリース基準は **`main`**。`ui-sandbox` は参照用。

## 2026-06-17: GrapeReversePage カウンターを DynamicInput に完全置換
- **決定事項**: `GrapeCounter` ローカルコンポーネントを廃止。`DynamicInput` を直接インポートして使用。
- **理由**: 「目コピー再実装」を繰り返すたびに独自 boxShadow 追加・z-index 付与・maxWidth 誤制約など DynamicInput との差異が蓄積した。UIコア完全共通化（`architecture.md` §5）の原則を徹底するためページ固有カウンターの独自実装を根絶した。
- **現行仕様**:
  - `total-games` → `DynamicInput` + `overrideProbText` prop（合算確率「合算 1/130.0」表示用。`element.id === "total-games"` では showProb が false になるため専用 prop で上書き）
  - `diff-coins` → `getElementTheme` に茶テーマ（`bg: "#78350f"`）を追加して DynamicInput 使用
  - `big-count` / `reg-count` → `compactLayout={true}` で DynamicInput 使用
  - `totalGames` prop を渡さない要素（diff-coins）は確率表示が自動的に抑制される

## 2026-06-17: 機種スペック詳細ページ新設
- **現行仕様**: `src/pages/MachineSpecPage.tsx`。ルート `/:machineId/specs`。ジャグラー8機種の4アコーディオン実装（ボーナス確率・機械割・小役確率・重複ボーナス）。スペック数値: `src/data/juggler-spec-data.ts` / 解説テキスト: `src/data/juggler-spec-advice.ts`。
- **SEO・アクセシビリティ**: 最下部SEO解説テキストがダークモード等で掠れて見づらかったため、フォントを中太（`font-medium`）以上に格上げし、文字色を高コントラスト化（`text-slate-700 dark:text-slate-200`）。
- **テキスト更新**: マイジャグラーVの4箇所の解説テキストを、ホールの実戦状況（設定4ボーダー等）に即した最新のプロ仕様文章へピンポイントで差し替え（`juggler-spec-advice.ts` `myjuggler5` キー）。
- ※ハナハナ対応・攻略アドバイスカードは 2026-07-06 のエントリを参照（本エントリの「ハナハナは準備中」「ナビはジャグラー限定」は過去の状態であり現行仕様ではない）。

## 2026-07-06: 機種スペックページ ハナハナ対応・攻略アドバイスカード追加
- **決定事項**: 機種スペックページ（`MachineSpecPage.tsx`）をハナハナ全9機種に対応させ、最上段に機種別「攻略アドバイス」カードを新設した。
- **理由**: ジャグラーのみの機能では片手落ちのため、既存の `MachineConfig.specs` / `detailedProbabilities`（ハナハナ側に既存のデータ）を活用してハナハナにも同等のスペック閲覧体験を提供する。攻略アドバイスは機種ごとに個別の文章が必要なため、テキスト未実装機種でプレースホルダーを出すと安っぽく見える／SEO上望ましくないという判断から、非表示に倒す設計とした。
- **現行仕様**:
  - **攻略アドバイスカード**: 最上段に `[機種名]の攻略アドバイス` カードを表示。`advice?.strategy` が存在する機種のみ表示し、未実装機種はカード自体を非表示にする（「準備中です」等のプレースホルダーは使わない）。ジャグラーは `JUGGLER_SPEC_ADVICE`（`src/data/juggler-spec-advice.ts`）の `strategy` フィールドで管理（現状 `myjuggler5` のみ実装）。
  - **ハナハナのカード構成**: `isHana` 分岐で以下に差し替え。①ボーナス確率（BIG/REG/合算、ジャグラーと共通ロジック）②機械割（`config.specs.payoutRatio` の公表機械割・単一列）③通常時小役・BIG中スイカ（`bell-count` 確率＋`detailedProbabilities.big_suika_raw`）④REGビタ押しサイドランプ示唆（`reg_lamp_blue/yellow/green/red_raw` の青/黄/緑/赤 出現比率）。データが無い機種はカード単位でグレースフルに非表示。
  - **解説テキストのデータファイル**: ハナハナ用は `src/data/hanahana-spec-advice.ts`（新規、`HANAHANA_SPEC_ADVICE`）に分離。`MachineSpecPage.tsx` の `advice` は `JUGGLER_SPEC_ADVICE[machineId] ?? HANAHANA_SPEC_ADVICE[machineId]` で解決する。`HanaSpecAdvice` インターフェースに `strategy` フィールドは未定義（＝ハナハナの攻略アドバイスは現状すべて未実装で意図的に非表示）。
  - **ナビボタンの全カテゴリ表示**: 小役カウンター（`MachinePageFactory.tsx`）・ぶどう/ベル逆算（`GrapeReversePage.tsx`）双方の「📊 機種スペック」ボタンから `category === "juggler"` ゲートを撤廃。ハナハナでも3ボタン構成（🎰小役カウンター／🔔ベル逆算／📊機種スペック）で表示する。
  - **今後ハナハナの攻略アドバイスを実装する場合**: `HanaSpecAdvice` interface に `strategy?: string` を追加し、`HANAHANA_SPEC_ADVICE` の該当機種に文章を追加するだけで、コード変更なしに自動でカードが表示される。

## 2026-07-15: コラム記事のMarkdown化（`.tsx`直書きから移行）
- **決定事項**: 16本のコラム記事を `src/pages/columns/*.tsx`（個別コンポーネント＋`App.tsx`個別ルート）から `src/content/columns/*.md`（YAMLフロントマター＋Markdown本文）＋動的ルート `/columns/:slug`（`ColumnDetailPage.tsx`）へ全面移行した。`src/data/column-list.ts`（`ATTACHED_COLUMNS`）は廃止し `src/data/column-content.ts`（`ALL_COLUMNS` / `getColumnBySlug`）に統合。
- **理由**: 今後の記事はAIによる自動生成との親和性を重視するため。`.tsx`直書き＋手動データ登録は新規記事追加のたびに複数ファイルへの手作業が必要で、自動化パイプラインと相性が悪かった。
- **現行仕様**:
  - コンテンツ: `src/content/columns/<slug>.md`。フロントマターは `title` / `description` / `date` / `tags: string[]` / `draft` / `showRelatedColumns?`（`category`単一フィールドは持たない）。
  - 読み込み: `src/data/column-content.ts` が `import.meta.glob` + `front-matter`（`gray-matter`ではない。ブラウザバンドルで`fs`/`path`ポリフィルが不要なため）でパース。
  - 描画: `ColumnDetailPage.tsx` が `react-markdown` + `rehype-raw`。既存16記事は見出し・table・CTA・コールアウト等の非prose要素を`not-prose`ラップの生HTMLとして本文中に保持し、一字一句・見た目を維持した（`architecture.md` §6 参照）。
  - `@tailwindcss/typography` を新規導入（`tailwind.config.js`）。`prose dark:prose-invert` が初めて実際に機能するようになった。
  - 本文レンダリングは `ColumnRenderErrorBoundary` でラップ。壊れたMarkdown/HTMLが混入してもページ単位でフォールバックし、サイト全体はクラッシュしない。
  - `scripts/generate-sitemap.js` は `column-list.ts` ではなく `src/content/columns/*.md` を直接スキャンする方式に変更。
  - **今後ハナハナ/ジャグラー以外も含め新規コラムを追加する場合**: `src/content/columns/<slug>.md` を1ファイル追加するだけでよい（`App.tsx`のルート追加・`column-list.ts`登録は不要。一覧・ナビ・サイトマップに自動反映される）。

## 参考（明示指示なき限り実施しない）

- CMS導入、PWA（manifest / Service Worker）
- コラムは `src/pages/columns/*.tsx` + `src/data/column-list.ts`（`architecture.md` §6）
