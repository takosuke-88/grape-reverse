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
- **現行仕様**: `src/pages/MachineSpecPage.tsx`。ルート `/:machineId/specs`。ジャグラー8機種のみ4アコーディオン実装（ボーナス確率・機械割・小役確率・重複ボーナス）。ハナハナは `isJuggler` 判定で「準備中」表示。スペック数値: `src/data/juggler-spec-data.ts` / 解説テキスト: `src/data/juggler-spec-advice.ts`。ナビバー: ジャグラー系ページのみ「📊 機種スペック」ボタンを3ボタン構成で追加。
- **SEO・アクセシビリティ**: 最下部SEO解説テキストがダークモード等で掠れて見づらかったため、フォントを中太（`font-medium`）以上に格上げし、文字色を高コントラスト化（`text-slate-700 dark:text-slate-200`）。
- **テキスト更新**: マイジャグラーVの4箇所の解説テキストを、ホールの実戦状況（設定4ボーダー等）に即した最新のプロ仕様文章へピンポイントで差し替え（`juggler-spec-advice.ts` `myjuggler5` キー）。

## 参考（明示指示なき限り実施しない）

- CMS導入、PWA（manifest / Service Worker）
- コラムは `src/pages/columns/*.tsx` + `src/data/column-list.ts`（`architecture.md` §6）
