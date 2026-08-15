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
| コラム記事の `<h2>`/`<h3>`/`<table>`/`<th>`/`<td>` への個別class/style付与 | 禁止（2026-07-16）。`src/index.css` の `.column-article` で一元管理（`architecture.md` §6） |
| コラム記事CTAボタンへの個別グラデーション・色指定 | 禁止（2026-07-16）。`<a href="/機種id" class="cta-button">` のみ使用 |
| 表内の数値強調に個別色クラス（`text-red-600`等）を直接指定 | 禁止（2026-07-16）。`<strong class="highlight">` のみ使用（色は`.column-article strong.highlight`が一元管理）
| コラム記事のフロントマター`date`を、ユーザー提供ドラフトの値をそのままコピーする | 禁止（2026-07-25）。ドラフトには前回記事からの使い回しと思われる仮の日付が入っていることがあり、そのまま採用すると実際の公開日と一致しない。**実装前に「今日の実際の作業日」を確認し、`date`/`updatedAt`に設定すること**（詳細は下記エントリ参照） |
| `tailwind.config.js` の `content` から `.md` パスを外す（`src/content/` 配下に新ディレクトリを追加した際の更新漏れも含む） | 禁止・要注意。外れているとその配下のクラスが静かに未生成になる（2026-07-16に実際発生、同日エントリ参照） |
| ビルド時プリレンダリングで通常の `playwright` パッケージ（標準Chromiumダウンロード）をそのままVercelビルドで使う | 禁止（2026-07-29）。VercelのビルドコンテナはAmazon Linuxベースでroot権限が無く、標準Chromiumが依存する共有ライブラリ（`libnspr4.so`等）が存在せず起動失敗する。**`playwright-core` + `@sparticuz/chromium`**（サーバーレス環境向け自己完結ビルド）を`process.env.VERCEL`判定で切り替える方式が必須（`scripts/generate-seo-shells.mjs`） |
| 新しいページ種別（ルート）を追加した際、`scripts/generate-sitemap.js`への登録を忘れる | 要注意（2026-07-29）。`/:machineId/grape`・`/:machineId/specs`ページは2026年6月の実装当初からsitemap.xmlに一度も登録されておらず、AIクローラー（Perplexity等）がページを発見できない状態が長期間放置されていた。**新しいルートパターンを追加する際は必ず`generate-sitemap.js`の対象に含めること**（詳細は下記エントリ参照） |
| カウンターの「＋1／−1」フィードバックを減算側だけ下方向（`floatDown`）に飛ばす | 禁止（2026-08-05）。タップしている指に隠れて見えない。**＋1／−1とも上方向、起点の水平位置のみで区別**（詳細は下記エントリ参照） |
| `vercel.json`に`{ "source": "/(.*)", "destination": "/index.html" }`のcatch-all rewriteを復活させる | 禁止（2026-08-13）。存在しないURLがHTTP 200を返すソフト404状態に逆戻りする。正規URLは全てビルド時プリレンダリング済みの静的ファイルとして`dist/`に実在するため、catch-allが無くても正規URLの配信には影響しない（詳細は下記エントリ参照） |
| `flex-1`を付けた可変幅要素（`<select>`等）を固定幅ボタンと同じflex行に並べる際、`min-w-0`を省略する | 要注意（2026-08-05）。Flexboxのデフォルト`min-width: auto`により、コンテンツの実寸分だけ縮まなくなり狭い画面幅で隣接要素が見切れる（詳細は下記エントリ参照） |
| ページ間ナビゲーションを `<button onClick={() => navigate(...)}>` で実装する | 禁止（2026-08-13）。`<a href>` が出力されずGooglebotがリンクとして認識できない。内部リンクとして機能させたい遷移は必ず `react-router-dom` の `<Link to>` を使う（詳細は下記エントリ参照） |
| コラム記事のフロントマター`title`に「｜GrapeReverse」を含める | 禁止（2026-08-13）。`ColumnDetailPage.tsx`が常に付与するため二重になる。`title`はサイト名を含まない記事タイトルのみ（詳細は下記エントリ参照） |
| sitemap.xmlの`lastmod`に、更新日を管理していないURLのビルド日を出力する | 禁止（2026-08-13）。全URLが常に「今日」だと鮮度シグナルとして機能しない。実更新日を管理しているコラム記事のみ出力し、それ以外はタグごと省略（詳細は下記エントリ参照） |
| カウンターの**−button**に背景（`theme.minusBg`）・boxShadowを戻して立体化する | 禁止（2026-08-16）。立体的な見た目は**＋側**が持つ。−は`background: transparent`のフラット（詳細は下記エントリ参照） |
| ＋の視覚装飾divから`pointer-events-none`を外す／＋エリア外側に背景・boxShadowを付ける | 禁止（2026-08-16）。クリック判定は横長の＋エリア全体に残す設計。装飾divが判定を奪うと打感が変わる |
| ＋エリアに`active:bg-white/10`（バー全体の白フラッシュ）を戻す | 禁止（2026-08-16）。加算フィードバックの発光は数字の`textShadow`（`dynamicGlow`）のみが担う |
| `flex-1`の`<select>`に`min-w-0`を付け忘れる | 要注意（2026-08-05制定→2026-08-16に`GrapeReversePage`/`MachineSpecPage`で再発）。狭幅で隣接ボタンが画面外へ押し出される |

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

## 2026-07-16: コラム記事の見出し（h2/h3）・テーブルをサイト全体で完全統一
- **決定事項**: 16記事間で見出し・テーブルの色/サイズ/paddingにばらつきがあった問題を解消するため、`<h2>`/`<h3>`/`<table>`/`<th>`/`<td>` から個別のclass指定を全て撤去し、`src/index.css` の `.column-article` クラス（`not-prose`の内外を問わず効く独立CSS。詳細は `architecture.md` §6）で一元的にスタイルを適用する方式に変更した。コールアウトボックス・CTAボタン・パンくず・番号バッジカード・統計グリッドなど、見出し・テーブル以外の記事固有デザイン要素（`not-prose`ラップの生HTML）は本変更の対象外で、従来通り維持している。
- **理由**: 2026-07-15のMarkdown移行時点では、既存記事の「一字一句・見た目を変えない」ことを最優先し、記事ごとに元の`.tsx`が持っていた固有の見出し色・テーブルデザインをそのまま生HTMLとして温存した。しかし実機確認の結果、記事間で見出し・テーブルの見た目がバラバラなことが「サイトとしての一貫性のなさ」として問題視されたため、統一する方針に転換した。
- **判明した技術的制約**: `@tailwindcss/typography`の`.prose`セレクタは、生成規則上`not-prose`配下の要素を自動的に除外する仕様（`:not(:where(.not-prose *))`がセレクタに組み込まれる）。そのため`tailwind.config.js`の`theme.extend.typography`をどれだけ調整しても、`not-prose`で囲まれた見出し・テーブルには一切反映されない。この制約により、`.prose`/`not-prose`に依存しない独立クラス（`.column-article`、`src/index.css`の`@layer components`内でプレーンなCSSセレクタとして定義）で統一する方式を採用した。
- **表内の数値強調について**: 一部の比較表では特定の数値を色付きテキストで強調していたが、記事ごとの個別色指定は撤去した。その後「色による強調も復活させたいが記事ごとにバラバラにはしたくない」という要望を受け、`<strong class="highlight">`という意味ベースのクラス名のみを記事側に残し、実際の色は`.column-article strong.highlight`（`src/index.css`）で一元管理する方式に変更した（2026-07-16追記）。元々複数色（赤・青等）で意味を書き分けていた表もあったが、統一のため単一の強調色に集約した。
- **現行仕様（今後AIが記事を自動生成する場合のルール）**:
  - `.md`本文内で `<h2>`/`<h3>`/`<table>`/`<th>`/`<td>` を使う際は**class属性・style属性を一切付けない**（素のタグのみ）。サイト側の`.column-article`が自動的に統一デザインを適用する。
  - テーブルはモバイル幅対応のため `<div class="overflow-x-auto my-6"><table>...</table></div>` で囲む。これは唯一の固定・共通マークアップで、記事ごとに変える必要はない。
  - 表内で特定の値を強調したい場合は `<strong>` タグを使う（色クラスは付けない）。
  - h1・CTAボタン・コールアウトボックス・パンくず・番号バッジカード・統計グリッドなど「記事固有のカスタムデザイン」は引き続き`not-prose`ラップの生HTMLで個別に表現してよい（今回の統一対象はh2/h3/tableのみ）。

## 2026-07-16: tailwind.config.js の content に `.md` が含まれておらず記事内クラスが未生成だった不具合を修正
- **決定事項**: `tailwind.config.js` の `content` 配列に `"./src/content/**/*.md"` を追加した。
- **理由**: `src/content/columns/*.md` 内の生HTMLで使っているTailwindクラス（`pl-6`等）が、`.tsx`側で偶然同じ文字列が使われているもの以外は一切CSSとして生成されていなかった。Tailwindはビルド時に`content`で指定したファイル群をテキストスキャンしてクラス名を検出する仕組みのため、`.md`が対象外だと記事内だけで使うクラスは静かに無視される。実際、リスト（`<ul class="list-disc pl-6 ...">`）の`pl-6`が生成されておらず、`list-style-position: outside`のバレット（中点）がpadding不足でコンテナ左端からはみ出す不具合として顕在化した。
- **現行仕様**: `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/content/**/*.md"]`。**今後 `src/content/` 配下に新しいコンテンツ用ディレクトリを追加する場合も、必ずこの`content`配列に対応するglobを追加すること**（忘れると同種の「クラスは書いてあるのにスタイルが当たらない」不具合が再発する）。

## 2026-07-16: 記事末尾の機種CTAボタンをサイト全体で統一
- **決定事項**: 12記事・14箇所にあった「各機種の設定判別ツールへ」CTAボタンを、`.column-article a.cta-button`（`src/index.css`）1クラスに統一した。従来は記事ごとにグラデーション色・角丸有無・絵文字有無がバラバラだった。
- **理由**: h2/h3/table統一と同じ「記事間の一貫性」方針の延長。
- **現行仕様**:
  - ボタン色は`indigo-600`（ホームの「📚 パチスロ攻略コラム一覧を見る」ボタンと同系統）で固定。絵文字装飾は廃止。
  - 文言は機種固有リンクの場合「{機種名}の設定判別ツールを使う」、カテゴリ一覧リンク（`/#juggler`・`/#hana`）の場合「{ジャグラー/ハナハナ}シリーズの設定判別ツール一覧へ」に統一。
  - `mrjuggler-expectations.md`内のCTAリンク先が`/mrjuggler`という存在しないパスになっていた不具合（機種IDは`mr`が正しい。`machine-list.ts`参照）も本対応で修正した。
  - 今後CTAボタンを追加する場合は `<a href="/機種id" class="cta-button">{機種名}の設定判別ツールを使う</a>` の形式のみを使い、個別に色・角丸等を指定しない。

## 2026-07-16: コラムの見出し/CTA統一に伴う設計判断の整理（却下案・スコープ境界）
- **背景**: 2026-07-15のMarkdown移行時点では「既存デザインを一字一句・見た目とも変えない」方針で、見出し・CTAも記事ごとの個別スタイルを生HTMLのまま温存した。その後の実機確認で「記事間の見た目のばらつき」自体が問題視され、07-16に方針を転換して統一した（詳細は本日の別エントリ）。**この転換は最新の決定が優先される。** 07-15エントリの「生HTMLでスタイルを個別に持たせる」という記述を見て、見出し/table/CTAにも個別スタイルを足してよいと誤解しないこと。
- **却下した設計・意図的なスコープ境界**:
  - **見出し統一の対象は h2/h3 のみ**。h1（記事タイトル、ページに1つだけ）は対象外で、引き続き記事ごとに固有の色・サイズを`not-prose`の生HTMLで持たせてよい。h1まで統一すべきという指示は出ていない。
  - **コールアウトボックス・統計カード内部のh2/h3も統一対象に含める、という判断は意図的**。カード背景色とのコントラストが下がるリスクを事前に提示した上で、ユーザーが「それでも統一する」を選択した（見た目の一貫性を優先）。将来「ボックス内だけ元の色に戻したい」場合は改めて指示が必要（自動では戻さない）。
  - **表内強調色は単一色（red-600）に集約**。元は記事によって赤・青など複数色で意味を書き分けていたが、統一のため1色にした。「設定によって色を変えて2軸の意味を持たせたい」等の要望が今後出た場合は、`.highlight`とは別の新しいクラス（例: `.highlight-alt`）を追加する形で対応し、記事側に色コードを直書きしない。
  - **React.lazyによるコラムルートのコード分割は導入していない**。移行プラン検討時に「App.tsxにmarkdownペイロードが乗るのを避ける」案として出たが、実装コストと効果が見合わないと判断し不採用。`ColumnDetailPage`等は他ページと同様、静的importのままでよい（意図的な未実装であり、実装漏れではない）。
  - **`LatestColumnsTeaser.tsx`のような専用コンポーネント切り出しはしていない**。ホームの「最新コラム3件」表示は`App.tsx`内に残したまま、参照データだけ`ALL_COLUMNS`に差し替えた（最小差分を優先）。将来切り出す場合も機能的な変更ではないことに注意。
- **教訓**: Tailwindの`content`設定は「クラス文字列が物理的に存在する全てのファイル」を含める必要があり、`.tsx`以外の新しいコンテンツ形式（今回は`.md`）を追加する際は真っ先に確認すべき項目。今回はビルドも`tsc`も通ってしまい、目視で気づくまで発覚しなかった（型エラーにもコンパイルエラーにもならない性質の不具合のため）。

## 2026-07-19: MachinePageFactory.tsx の機種IDハードコード分岐を撤廃、config専用フィールド方式を採用
- **決定事項**: `MachinePageFactory.tsx`内にあった`config.id.includes("siosai")`・`config.id === "last-utopia"`・`config.id === "aimex"`という機種IDのハードコード分岐を撤廃した。ハイハイシオサイ系・ラストユートピアのAIアドバイス文言は`MachineConfig.specialAdvice`（`SpecialAdviceTier`/`SpecialAdviceBracket`、`src/types/machine-schema.ts`）に、アイムジャグラーEXの近似設定ラベル特例（BIG払出252枚により設定5・6の確率値が255.0で一致する問題）は`MachineConfig.specs.approximationLabelOverride`に、それぞれ専用フィールドとして分離した。
- **理由**: この2つは見た目こそ両方「機種固有の特殊表示」だが、データの形状が根本的に異なる（前者は総ゲーム数×確率閾値によるテキスト分岐、後者は数値一致による単純なラベル置換）。共通の汎用フィールド（例: 何でも入る`overrides: Record<string, any>`）に無理やり統合すると型安全性が失われ、結局`MachinePageFactory.tsx`側に「このoverride種別の場合はこう解釈する」という分岐が復活し、撤廃したはずの「機種IDハードコード」が「フラグ種別ハードコード」に形を変えて再発するリスクがあった。
- **今後の判断基準（先祖返り防止）**: 今後3つ目以降の異なる性質の特殊対応が必要になった場合も、**性質が異なるなら安易に既存フィールド（`specialAdvice`等）や汎用フラグに寄せず、都度その性質に合った専用フィールドを`MachineConfig`に追加してよい**。共通化（例えば`specialCases: SpecialCase[]`のような汎用配列への統合）を検討するのは、**同じ形状の特殊対応が4〜5機種分たまった時点**で十分。まだ1〜2件しかない段階での早すぎる共通化（premature abstraction）は行わない。
- **現行仕様**: 実装例は `src/data/machines/haihai-siosai.ts` / `haihai-siosai2.ts` / `last-utopia.ts`（`specialAdvice`）、`src/data/machines/juggler-im-ex.ts`（`specs.approximationLabelOverride`）。詳細は `architecture.md` §5参照。

## 2026-07-25: コラム記事date不整合の発覚と修正、X投稿リンクカードパターンの確立

- **決定事項**: 2026-07-19〜23にかけて追加した新規コラム記事7本すべてで、フロントマターの`date`が実際の公開日と異なり「2026-07-15」に固定されていた不具合を修正した。あわせて、記事中でXの元投稿を紹介する際のリンクカードHTMLパターンを標準化した。
- **理由（date不整合）**: ユーザーから渡される記事ドラフトには`date: "2026-07-15"`という値が毎回そのまま含まれており、これは「その日最初に書いたドラフトの日付」が使い回されたものだった。Claude側がこの値を無条件にコピーしてフロントマターへ採用し続けた結果、`ALL_COLUMNS`のdate降順ソートで7本が同日タイになり、コラム一覧・関連コラム表示で「最新記事」が実態を反映しない状態になった。ユーザーが「本番のコラムの最終投稿日時が7月15日から更新されていない」と気づくまで、ビルドもtscも通過してしまい発覚しなかった（型エラー・コンパイルエラーにならない性質の不具合という点で、2026-07-16のtailwind content漏れの教訓と同種）。
- **現行仕様**: 記事を新規作成・テスト環境実装する際、フロントマターの`date`は**ドラフトの値をそのまま使わず、その日の実際の作業日を確認してから設定する**。`updatedAt`は初回公開時`date`と同値で初期化するルール（`architecture.md` §6）は従来通り。
- **X投稿リンクカードの標準形**（2026-07-15以降、複数記事で反復使用し安定したパターン）:
  ```html
  <div class="not-prose my-6">
  <a href="{X投稿URL}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md transition-shadow">
    <svg class="w-8 h-8 flex-shrink-0 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">@{ハンドル名} の投稿を見る</p>
      <p class="text-xs text-slate-500 dark:text-slate-400">X（旧Twitter）で元の投稿を確認する</p>
    </div>
  </a>
  </div>
  ```
  記事本文中で最初にその投稿へ言及する段落の直後に配置する。1記事に複数のX投稿（元ネタ＋関連投稿など）を貼る場合は、それぞれの言及箇所の直後に個別配置してよい（`hamazuru-wakura-onsen-slot-room.md`が実装例）。実在アカウントの表示名は、本人確認が取れない限り**ハンドル名（@から始まる文字列）のみを使い、日本語の表示名を推測で補完しない**（誤った人物紐付けのリスクを避けるため）。

## 2026-07-25: Google AdSenseスニペットはindex.html 1箇所に集約

- **決定事項**: Google AdSenseの所有者確認・自動広告用スクリプトを`index.html`の`<head>`先頭（GA4タグの直前）に設置した。
- **理由**: 本プロジェクトはVite製のSPAで、Next.jsの`_document.tsx`のようなサーバーサイドテンプレートは存在せず、全ルート（ツール・コラム・機種スペック含む）が単一の`index.html`から配信される。そのため「共通レイアウトファイル」は実質`index.html`の1ファイルのみであり、ここに1回だけ設置すれば全ページに反映される。
- **現行仕様**: 今後、他の第三者スクリプト（広告・解析タグ等）を追加する場合も同様に`index.html`に集約する。ページ単位でのhead操作が必要になった場合のみ`react-helmet`等の導入を検討する（現時点では不要、SEO用の動的head操作は既存の`Seo.tsx`で足りている）。

## 2026-07-29: SEO静的シェル生成（ビルド時プリレンダリング）を導入

- **決定事項**: 外部SEOツールが41ページで「title重複」「meta description重複」「h1タグなし」「文字数不足」を同時指摘した問題に対し、Next.js移行やSSR化は行わず、**`vite build`後にPlaywrightで全ルートを実レンダリングし、ルートごとの静的HTMLシェルを`dist/`配下に書き出すビルドステップ**（`scripts/generate-seo-shells.mjs`）を追加した。Reactアプリ本体のロジックは無変更。
- **理由**: 調査の結果、原因は個々のページの作り込み不足ではなく、**サイト全体が完全CSRのSPAで、`index.html`が全ルート共通の静的meta情報しか持たず`<div id="root"></div>`が空**という単一の構造的問題だった。ページごとのtitle/description/h1はすべて`Seo.tsx`のクライアント側`useEffect`で生成されており、JSを実行しない（または実行前にHTMLを取得する）クローラーには、どのURLも同一の空HTMLに見えていた。
- **却下した選択肢**: Next.js等フレームワークへの全面移行、React.lazyによるコード分割導入（いずれも2026-07-16に不採用済みの方針と同じ理由＝実装コストと効果が見合わない）。SSR化も、Vite SPA構成を維持したまま解決できる問題であるため見送った。
- **現行仕様**: `npm run build`が`generate-sitemap.js → tsc → vite build → generate-seo-shells.mjs`の順に実行される。全80ルート（home 1 + 機種17×3 + columns一覧1 + コラム記事N）を**メモリ上に集めてから一括で`dist/`へ書き込む**設計（トップページの出力が先に`dist/index.html`を上書きし、後続ルートの検証結果を壊す事故を防ぐため）。待機処理は`networkidle`ではなく`domcontentloaded`＋固定ウェイト（`networkidle`は遅延読み込みやアニメーションがあると解決しないケースがあるため）。

## 2026-07-29: Vercelビルド環境でのPlaywright Chromium起動失敗と`@sparticuz/chromium`への切り替え

- **決定事項**: 上記のSEOシェル生成をVercelへデプロイしたところ、`chrome-headless-shell: error while loading shared libraries: libnspr4.so: cannot open shared object file`でビルドが失敗した。**`playwright-core` + `@sparticuz/chromium`**（サーバーレス環境向けに共有ライブラリを同梱した自己完結Chromiumビルド）に切り替えて解決した。
- **理由**: VercelのビルドコンテナはAmazon Linuxベースで`apt-get`のようなパッケージマネージャへのroot権限が無く、標準Playwright Chromiumが前提とするOS側の共有ライブラリ（NSPR/NSS等）をインストールする手段が存在しない。ローカル（Windows）では問題なく動作したため、この環境差に気づけなかった。`--with-deps`オプションはapt-get前提のためAmazon Linuxでは使用不可。
- **教訓**: ヘッドレスブラウザをビルドステップに組み込む場合、**ローカルでの動作確認だけでは不十分**。デプロイ先のビルド環境（Vercel/Amazon Linux等）がroot権限・パッケージマネージャの有無でOSレベルの依存関係を解決できるかを事前に確認する必要がある。幸い、Vercelは新デプロイのビルドが失敗しても直前の成功デプロイを配信し続けるため、この種の失敗が本番ダウンタイムに直結しなかった。
- **現行仕様**: `scripts/generate-seo-shells.mjs`は`playwright-core`をimportし、`process.env.VERCEL`が真の場合のみ`@sparticuz/chromium`の`executablePath()`/`args`を`launch()`に渡す。ローカル開発（Windows/macOS）では`playwright`パッケージ経由でダウンロードした標準Chromiumをそのまま使う（`scripts/postinstall.mjs`が`process.env.VERCEL`で分岐し、Vercel上では標準Chromiumのダウンロード自体をスキップする）。

## 2026-07-29: sitemap.xmlに`/grape`・`/specs`ページが未登録だった不具合を修正

- **決定事項**: SEOシェル導入後もPerplexityが`/:machineId/grape`ページ群だけを読み取れないという報告を受けて調査した結果、`scripts/generate-sitemap.js`が機種ページとして`/:machineId`のみを登録し、**`/:machineId/grape`・`/:machineId/specs`を実装当初（2026年6月）から一度も登録していなかった**ことが判明。34件（17機種×2）を追加登録した。
- **理由**: canonical・noindex・プリレンダリング内容はすべて正常で、原因はページ側ではなくサイトマップ生成ロジックの元々の設計漏れだった。`/grape`・`/specs`へは各ページのナビゲーションボタンから内部リンクは張られていたが、クロール予算の限られた（特に新しいドメインに対する）クローラーはサイトマップ経由の発見を優先しやすく、長期間見つけてもらえない状態が続いていたとみられる。
- **教訓**: 新しいルートパターン（ページ種別）を追加する際は、そのページが実際にユーザーの目に触れて機能するかだけでなく、**`generate-sitemap.js`の対象に含まれているか必ず確認すること**。今回は「動いている・リンクもある」ことに気を取られ、サイトマップ登録という地味な工程が長期間見落とされていた。ビルドもtscも通過してしまう性質の不具合という点で、2026-07-16のtailwind content漏れ・2026-07-25のdate不整合と同種の教訓。
- **現行仕様**: `scripts/generate-sitemap.js`は機種1件につき`/:id`・`/:id/grape`・`/:id/specs`の3URLを登録する。サイトマップ総URL数（80件）が`generate-seo-shells.mjs`のプリレンダリング対象ルート数と一致することを、今後の変更時の整合性チェックの目安にする。

## 2026-08-05: 「＋1／−1」カウンターフィードバックのバッジ化（白文字テキストの廃止）
- **決定事項**: カウンター操作時に飛び出す「＋1」「−1」の表現を、白文字＋グロー（発光）のテキストから、**`theme.bg`（機種テーマ色）を背景に持つピルバッジ**に変更した。文字色は`theme.textColor`があればそれを使用（白背景ランプ等での可読性確保）。
- **理由**: 白文字＋text-shadowのグローはダークモードでは映えるが、ライトモード（明るいカード背景）に飛び出した瞬間に文字が背景へ溶けて読めなくなっていた。`dark:`での色出し分けも検討したが、バーの色との関連が切れて演出が弱まるため不採用（却下）。背景付きバッジにすることで、**ライト/ダーク・機種テーマ色を問わず同一実装で可読性を担保**できる。
- **却下した設計**: 「−1」を`floatUp`の上下反転（`floatDown`、下方向に飛ばす）で実装したが、**タップしている指に隠れて見えない**という実戦上の問題が発覚し撤回。最終的に**＋1／−1とも上方向に飛ばし、起点の水平位置（プラスエリア側／マイナスボタン側）だけで区別する**方式に統一した。「現場至上主義」（`coding-style.md` §2）の観点では、画面上の演出的な正しさ（減算だから下、という直感的対応）より、**実機でタップ指に隠れないこと**を優先する。
- **現行仕様**: `DynamicInput.tsx`の`floats`状態は`{ id, dir: 1 | -1 }[]`。バッジのCSSアニメーションは`.counter-float-anim`（`floatUp`）1本のみを共有し、方向専用のCSSキーフレームは持たない。バッジ背景色・影は`theme.bg`/`theme.accent`由来（`getElementTheme`）。−1は実際に値が減る場合のみ表示（0のときや、履歴切れで見た目上減らない`onDecrement`経路では出さない）。
- **今後の判断基準**: 今後この手の「操作フィードバックの飛び出し演出」を他要素に追加する場合も、方向の見た目的な正しさより、**タップ中の指の位置に隠れないか**を先に検証すること。

## 2026-08-05: カウンター選択セレクトのflex縮小不具合（バイブトグルボタンの見切れ）を修正
- **決定事項**: `MachinePageFactory.tsx`の機種選択`<select>`に`min-w-0`を追加した。
- **理由**: `flex-1`を付与していても、Flexboxアイテムのデフォルト`min-width: auto`により、選択中の機種名テキストの実寸分だけ`<select>`が縮まずに幅を確保しようとしていた。結果、Pixel 10（6.3インチ、幅約360〜384px）のような狭い画面幅で、隣接するリセット/バイブトグルボタンが右にはみ出し、バイブボタンの右側約1/3が画面外に切れる形で見切れていた。
- **教訓**: `flex-1`（または`flex-grow`）を付けた要素が「思ったほど縮まない」場合、まず`min-width: auto`のデフォルト挙動を疑い、`min-w-0`の付け忘れがないか確認する。**ビルドも`tsc`も通過し、目視（それも特定の狭い画面幅）でしか気づけない性質の不具合**である点で、2026-07-16のtailwind content漏れ・2026-07-25のdate不整合と同種の教訓として記録する。今後、リセットボタン・バイブトグルのような`shrink-0`の固定幅要素と、可変幅の`<select>`/`<input>`を同じflex行に並べる実装をする際は、可変幅側に`min-w-0`を付けることを標準とする。

## 2026-08-05: 記念日ネタのコラム記事における date フィールドの扱い（2026-07-25エントリの補足）
- **決定事項**: 「パチスロの日（8月4日）」のような特定の記念日・イベント当日を主題にした記事では、`date`/`updatedAt`は**その記念日（イベント当日）の日付**を採用してよい。実際にAIが記事ファイルを生成した作業日（本件では8/5）と記念日当日（8/4）がずれる場合、ユーザーの明示的な指示があればイベント当日を優先する。
- **背景**: 2026-08-05のセッションで、「パチスロの日」関連の2記事を初回は2026-07-25エントリのルール（「ドラフトの日付をそのまま使わず実際の作業日を確認して設定する」）に従い、実際の作業日である`2026-08-05`で作成した。しかし本文が「今日はパチスロの日」という8/4当日視点で書かれていたため、ユーザーから「間違えた、8月4日にしておいて」と明確な訂正が入った。
- **2026-07-25エントリとの関係**: 2026-07-25のルールは「**ドラフトに使い回された仮の日付をAIが機械的にコピーしてしまう**」事故（同日タイで最新記事が実態を反映しない問題）の再発防止が目的であり、「AIが常に自分の作業日を機械的に採用すべき」という意味ではない。**記事の主題が特定の日付（記念日・イベント当日）に強く紐づいており、ユーザーがその日付を明示的に指定した場合は、その指定が優先される**。作業日をデフォルトにするのは、あくまで「ドラフトの仮日付をそのままコピーする」という機械的ミスを防ぐためのフォールバックであり、ユーザーの明示的な日付指定を上書きする根拠にはならない。
- **今後の判断基準**: 記念日・イベントネタの記事を作成する際は、まず**実際の作業日**を仮のdateとして設定しつつ、記事本文が特定の日付（「今日は〇〇の日」等）を主題にしている場合は、**その日付で公開する意図かどうかをユーザーに確認する**（本件のように後から訂正が入ると手戻りになるため、次回以降は先回りして確認するのが望ましい）。

## 2026-08-05: 外部ツール由来ドラフトの `<cite index="...">` マークアップはコラム本文に残さない
- **決定事項**: ユーザーから提供されたコラム記事ドラフトに含まれていた`<cite index="242-1">...</cite>`のような出典マークアップは、コラム本文への実装時にタグを除去しテキストのみを残す（除去してもドラフト末尾の出典注記〔`<small>`内の参照元一覧〕に情報は残っているため、情報の欠落はない）。
- **理由**: `index`属性付き`<cite>`タグは本サイトのMarkdown本文（`architecture.md` §6）が定めるマークアップ規約に存在しない、リサーチツール側が自動付与したと見られる出典トラッキング用マークアップであり、`.column-article`のスタイル管理外でレンダリング結果が意図せず崩れる／不要なデータ属性が本文に残るリスクがある。
- **今後の判断基準**: 今後もリサーチツール経由で生成されたドラフトを記事化する際は、`<cite>`・その他track用と思われる見慣れない属性付きタグが混入していないか確認し、テキストのみを残す形で正規化してから`.md`に反映する。

## 2026-08-13: GSC「検出 - インデックス未登録」39件の技術監査と3つの原因の修正

- **決定事項**: 外部からの指摘（Search Consoleで39URLが「検出 - インデックス未登録」「前回のクロール：該当なし」）を受けて技術監査を実施し、**noindex・robots.txt・canonical・プリレンダリングHTMLはすべて健全**であること、原因は別の3点であることを特定して修正した。
  1. `/grape`・`/specs`への内部リンクが`<a href>`としてサイト全体に1件も存在しなかった（機種34URL）
  2. コラム28記事で`<title>`が「…｜GrapeReverse｜GrapeReverse」と重複していた
  3. sitemap.xmlの`lastmod`が全URL常にビルド日だった
- **理由（①内部リンク）**: `MachinePageFactory.tsx`/`GrapeReversePage.tsx`/`MachineSpecPage.tsx`の3ページとも、ページ間ナビゲーションを`<button type="button" onClick={() => navigate(...)}>`で実装していた。**`<button onClick>`はhref属性を持たないためGooglebotがリンクとして辿れない**。sitemap.xmlには2026-07-29に登録済みだったが、内部リンクがゼロのURLはクロール優先度が低く判定されるため、「検出はされたがクロールされない」状態が続いていた。`<Link to>`（`react-router-dom`）に置換して実際の`<a href>`を出力させ、カウンター/逆算/スペックの3ページが相互リンクされる状態にした。SPAのクライアント遷移は`<Link>`でも維持される（フルリロードは発生しない）。
- **理由（②title重複）**: `ColumnDetailPage.tsx:47`が``pageTitle={`${frontmatter.title}｜GrapeReverse`}``と常にサフィックスを付与する実装なのに対し、2026-07-30以降に追加した28記事は**フロントマターの`title`自体にすでに「｜GrapeReverse」が含まれていた**ため二重になっていた。フロントマター側から除去して解消。7/19〜7/28の11記事は元々サフィックス無しで正しかった。
- **理由（③lastmod）**: `generate-sitemap.js`が全URLに`today`（ビルド実行日）を書き込んでいたため、7月公開の記事も当日追加の記事も同じ「たった今更新された」という信号になり、Googleが再クロール要否を判断する材料として機能していなかった。
- **現行仕様**:
  - ページ間の遷移を内部リンクとしてクローラーに認識させたい場合は`<Link to>`を使う。`navigate()`は、遷移先が無い（同一ページ内スクロール等）・遷移がユーザー操作の副作用である場合に限る。
  - コラムのフロントマター`title`はサイト名を含めない（記事タイトルのみ）。
  - sitemapの`lastmod`は「実際に更新日を管理できているURL」のみ出力する。`urlElement()`は`lastmod`が`undefined`のときタグ自体を省略する（sitemapプロトコル上`lastmod`は任意）。現状これに該当するのはコラム記事（frontmatterの`updatedAt`／`date`）のみで、トップ・機種ページ（root/grape/specs）・コラム一覧は省略。frontmatterがパースできない場合も`today`で埋めず省略する。
- **教訓**: **プリレンダリングでHTMLが完璧でも、内部リンクが無ければクロールされない。** 2026-07-29にSEO静的シェルとsitemap登録の両方を整備したにもかかわらず改善しなかったのは、「HTMLの中身」と「sitemapへの登録」だけを見て**サイト内のリンクグラフを確認していなかった**ため。今後SEO調査を行う際は、`curl`で取得した生HTMLに対象URLへの`<a href>`が実在するかを必ず確認する（ブラウザ上でボタンが機能することは、クローラーにとってのリンク存在を意味しない）。ビルドも`tsc`も通り、実機でも正常に動作してしまう性質の不具合という点で、2026-07-16のtailwind content漏れ・2026-07-25のdate不整合・2026-08-05の`min-w-0`と同種。

## 2026-08-13: ソフト404（存在しないURLがHTTP 200を返す問題）の解消と独自404ページの実装 — 完了

- **決定事項**: `vercel.json`の`{ "source": "/(.*)", "destination": "/index.html" }`という無条件catch-all rewriteを削除し、**存在しないURLがHTTP 200で`index.html`を返す**（ソフト404）状態を解消した。あわせて`public/404.html`に独自404ページを実装し、実HTTP 404のまま自サイトのトーンに合わせた画面を表示できるようにした。手動のルート列挙もEdge Middlewareも使用していない。
- **却下した案（重要）**: 当初「`vercel.json`のrewriteを既知ルートのみに限定する」案を検討したが、その中の`{ "source": "/columns/(.*)", "destination": "/index.html" }`というワイルドカード指定は、**存在しないコラムURLも200のままになるため解決にならない**。機種IDを手動列挙する方式も、新機種追加のたびに`vercel.json`の更新が必要で、更新漏れが「新機種ページが本物の404になる」という実害に直結するため不採用。Edge Middleware案も、新しいランタイム概念の導入となるため見送った。
- **採用した方式**: `generate-seo-shells.mjs`が**全ルートを物理ファイル（`dist/<path>/index.html`）としてプリレンダリング済み**であるため、catch-all rewriteを1行削除するだけで、正規URLはVercelの静的ファイル配信で200を返し、存在しないURLは標準の実404に落ちることを検証で確認した。根拠として、本番で`/aimex/specs`のレスポンスに`Content-Disposition: inline; filename="specs"`が付いており、rewriteを経由せず静的ファイルが直接ヒットしていることを観測している。
- **独自404ページ（`public/404.html`）の実装方針**: Vercelは静的出力ルートに`404.html`があると、存在しないURLに対して**HTTP 404ステータス付きで**その内容を配信する。React側（SPA本体）で404画面を描画する方式はHTTP 200になりソフト404に逆戻りするため**採用していない**。ビルド済みCSSはハッシュ付きファイル名で参照できないため、スタイルは全てファイル内にインラインで持たせた自己完結ページとした。`<meta name="robots" content="noindex">`を付与し、ホーム／設定判別ツール一覧（`/#juggler`）／攻略コラム一覧（`/columns`）への`<a href>`導線を設置。
- **検証手順**: 検証専用ブランチ（`verify/soft-404-no-catchall-2` → `verify/custom-404`）でPreviewデプロイを作成し、都度VercelのDeployment Protection（Vercel Authentication）をユーザーが一時的にDisabled→検証後Enabledへ戻す運用で計測した。Deployment Protection Exceptionsは**ドメイン単位**の除外機能で自動生成Preview URLの個別指定には使えず、per-deploymentのShareable Linkは実質Bypassシークレットと同種のため不採用。**本番ドメインは元々この保護の対象外**（匿名アクセスに200を返す）のため、Preview側のみの一時解除は本番の公開状態に影響しない。
- **本番検証結果**: 全17機種×root/grape/specs（51URL）・全57コラム記事、いずれも200。`/nonexistent-machine-xyz`・`/columns/nonexistent-slug-xyz`・`/aimex/nonexistent-path`の3URLは全て実HTTP 404かつ独自404画面を表示（`X-Vercel-Error`ヘッダの消失、`Content-Type: text/html`、`<title>ページが見つかりません（404）｜GrapeReverse</title>`で確認）。`/api/chat`は405（ルーティング健全）、`sitemap.xml`・`robots.txt`・`ads.txt`は200。独自404画面の3導線（ホーム／設定判別ツール一覧／攻略コラム一覧）もブラウザ実クリックで遷移を確認済み。
- **今後の判断基準**: `vercel.json`にcatch-all rewriteを再度追加しない（先祖返り禁止テーブル参照）。新機種・新記事はプリレンダリング（`generate-seo-shells.mjs`）が自動でカバーするため`vercel.json`側の追加対応は不要だが、**プリレンダリングがビルド失敗した場合そのURLが実404になる**ため、ビルド失敗を静かに見逃さない体制（現状`generate-seo-shells.mjs`は1ルートでも失敗すると`process.exit(1)`で書き込みを中止する設計）を維持すること。
- **補足（調査で判明した事実）**: フロントエンド（`src/`配下）には`fetch()`が1箇所も存在せず、**`/api/chat`はSPAから呼ばれていない**（`api/chat.js`はサーバーレス関数として存在するのみ）。

## 2026-08-16: カウンター＋／−の視覚的優先順位を反転（レイアウトは不変）

- **決定事項**: 実戦で頻繁に押す**＋を主操作として立体的に**、**−を訂正操作として控えめなフラット**に見せる。ただし**レイアウトには一切手を入れない**（行高76px、横長＋エリアの`flex-1`構造、probTextの`absolute right-2 bottom-1.5`、compact 2列グリッド、30:70の幅配分はすべてHEAD時点のまま）。
- **理由**: 従来は−だけが濃い立体ボタンで、主操作の＋が`opacity: 0.45`の薄い文字だった。実戦の使用頻度と視覚的な強さが逆転していた。
- **却下した実装（重要）**: この結論に至るまでに3案を試作して破棄している。**同じ道を再度たどらないこと。**
  1. **＋エリア自体を48px固定幅にする案** → 横長バーが消え、probTextが＋ボタンと40px重なる。ユーザー却下。
  2. **probTextを中央領域の下段へ通常フロー配置する案（3領域flex構造）** → 重なりは完全に解消できたが、**行高が76px→102pxに増加**し、確率表示の位置・バーの太さ・スマホ時のグリッド構成が変わるため却下。
  3. **横長要素へのboxShadow再設計** → boxShadowのoffset/blurは絶対px値のため、48px用の値を200〜700px幅の面に当てても端しか効かず、中央が平坦に見える。横長要素で立体感を出そうとしないこと。
- **現行仕様（`DynamicInput.tsx`）**:
  - **−button**: `background: "transparent"`、boxShadowなし、`color: theme.textColor ?? "#ffffff"`（不透明）。幅・`onClick`・`disabled`・`aria-label`は不変。
  - **＋**: 外側の横長divは**構造・クリック判定とも従来どおり**（`relative flex min-w-0 flex-1 items-center justify-end` ＋ `onClick={handleIncrement}`、背景・影なし）。その内側に**視覚装飾専用のdiv**を`absolute right-0 top-0` ＋ `pointer-events-none`で重ね、旧−buttonの`theme.minusBg`とboxShadowを適用する。幅は非compactで`COUNTER_MINUS_WIDTH_CLASS`（48px）、compactでは`w-full`（親幅に追従。375px時19.5px。48pxを押し込むとoverflowするため）。
  - **外側drop shadowのみX反転**（`3px 3px 8px` → **`-3px 3px 8px`**）。右端配置では右方向の影が親の`overflow-hidden`で切られるため、左下＝カード内側へ落とす。他3レイヤーは旧−buttonの値のまま。
  - **加算フィードバックの発光は数字のみ**。＋エリアの`active:bg-white/10`（バー全体が白くフラッシュ）を削除し、`dynamicGlow`（数字の`textShadow`が10/22px→20/40/60pxへ変化）だけが残る。
  - **compact行ではprobTextと＋装飾が重なる**が、これはHEAD時点から存在する既存の制約（probTextの座標を変更していないため）であり、今回の変更で発生したものではない。

## 2026-08-16: `<select>`の`min-w-0`欠落が2ページで再発（2026-08-05エントリの再掲）

- **決定事項**: `GrapeReversePage.tsx`・`MachineSpecPage.tsx`の機種選択`<select>`に`min-w-0`を追加し、`MachinePageFactory.tsx`（`min-w-0 flex-1`）と同一の見た目に揃えた。
- **症状**: 375px幅で他2ページのselectが232pxまでしか縮まず（基準は169.2px）、バイブトグルが`r417.8`＝**画面幅375pxを42px超えて見切れていた**。原因はFlexboxのデフォルト`min-width: auto`。
- **教訓**: 2026-08-05に`MachinePageFactory.tsx`で同じ不具合を修正した際、**同型のUIを持つ他2ページを確認していなかった**。今後この種の共通ヘッダーUIを修正する場合は、`MachinePageFactory` / `GrapeReversePage` / `MachineSpecPage` の**3ページすべて**を対象に含めること（3ページは共通コンポーネント化されておらず、それぞれ独立にヘッダー行を持つ）。

## 参考（明示指示なき限り実施しない）

- CMS導入、PWA（manifest / Service Worker）
- コラムは `src/pages/columns/*.tsx` + `src/data/column-list.ts`（`architecture.md` §6）
