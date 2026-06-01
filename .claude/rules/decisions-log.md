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

## 参考（明示指示なき限り実施しない）

- CMS導入、PWA（manifest / Service Worker）
- コラムは `src/pages/columns/*.tsx` + `src/data/column-list.ts`（`architecture.md` §6）
