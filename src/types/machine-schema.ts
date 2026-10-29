export type InputType = "counter" | "ratio" | "select" | "flag";
export type InputVisibility =
  | "always"
  | "simple"
  | "detail"
  | "grape-calc"
  | "table-only";

/**
 * 判別要素が有効になる「状況・状態」を定義
 * 全てオプショナルとし、指定がない場合は「常時/通常時」とみなす
 */
export interface StateContext {
  duringBonus?: "big" | "reg" | "both";
  duringART?: boolean;
  duringCZ?: boolean;
  mode?: "normal" | "high" | "super_high" | "rt" | "at";
  flags?: string[]; // 例: ['cherry_overlap']
  description?: string;
}

/**
 * 個別の設定判別要素
 */
export interface DiscriminationElement {
  id: string;
  label: string;
  type: InputType;
  visibility?: InputVisibility; // 省略時は 'always'
  options?: string[]; // for select type
  unit?: string;
  context?: StateContext; // 追加: 文脈情報
  settingValues: { [setting: number]: number };
  isDiscriminationFactor: boolean;
  discriminationWeight?: number; // デフォルト1.0
  conflictsWith?: string[]; // 他の要素と競合する場合（例: REG詳細入力時はREGトータルを除外）
  isReadOnly?: boolean; // ユーザー編集不可（自動計算項目など）
  colSpan?: number; // UI表示時のカラムスパン（例: 2）
  /**
   * 設定示唆カウンター用（2026-10-05、スマスロ ハナビで導入）。
   * 1回でも数えられたら、ここに列挙した設定以外を判別から除外する
   * （例: ピース花火＝[2, 5, 6]で設定1を除外）。指定した要素は確率の表示もしない。
   * ハナハナの虹ランプ等は従来どおり hana-lamp-hints.ts の固定IDで扱っており、
   * こちらは設定ファイルだけで示唆を足せるようにするための汎用版。
   */
  impliedSettings?: number[];
  /** カウンター名の後ろに括弧書きで添える示唆の文言（例: "設定5・6濃厚"） */
  hintLabel?: string;
  /**
   * カウンター名に添える文言だけを短くしたいとき（2列のセルで折り返す場合）。
   * 「※〇〇として計算されます」の注記は hintLabel のまま。
   */
  hintLabelShort?: string;
  /** 数えたときの注記の文言を差し替える（未指定なら「※{hintLabel}として計算されます」） */
  hintNotice?: string;
  /**
   * バー右下の確率の母数にする要素ID（未指定なら総ゲーム数）。
   * ボーナス中・RT中の役は、その状態のゲーム数を母数にする（2026-10-14）。
   */
  probBase?: string;
  /** バー右下の確率を出さない（ゲーム数のカウンター等） */
  hideProb?: boolean;
}

/**
 * UIのセクション分割用
 */
export interface ConfigSection {
  id: string;
  title: string;
  layout?: "grid" | "list";
  /** 見出しをタップで折り畳めるカードにする（開閉状態は機種ごとに保存） */
  collapsible?: boolean;
  /**
   * カード内の全バーの配色を上書きする（2026-10-14、スマスロ ハナビの詳細判別で導入）。
   * 要素IDによる自動配色（getElementTheme）より優先。RBの契機などIDが他機種と共通の
   * カードで、他機種の色を変えずにそのカードだけ色を変えるための口。
   */
  barTheme?: BarThemeName;
  elements: DiscriminationElement[];
}

/** ConfigSection.barTheme で指定できる配色（定義は DynamicInput の BAR_THEMES） */
export type BarThemeName = "darkBlue" | "darkRed" | "blueYellow" | "gray" | "whiteRed" | "blue";

/** 指標グリッドのカード1枚（MachineConfig.metricRows） */
export interface MetricRowItem {
  label: string;
  /** 回数を取る要素ID（確率の基準値もこの要素の settingValues） */
  id: string;
}

/**
 * 合計カウンターと内訳カウンターの関係（2026-10-14、スマスロ ハナビの詳細判別で導入）。
 * 合計は常に内訳の和に揃える。合計を直接入力・＋した分は unknownId（区別なし）へ入る。
 * unknownId が無い合計（ボーナス中のゲーム数など）は内訳の和の表示専用。
 */
export interface SumGroup {
  totalId: string;
  partIds: string[];
  unknownId?: string;
}

/**
 * 詳細判別の計算モデル（estimationModel: "detailed"）。確率は各要素の settingValues（分母）を使う。
 */
export interface DetailedModel {
  /** ボーナス合計を契機ごとに分解する。合計の確率は totalId の settingValues を基準にする */
  bonusSplits: { totalId: string; unknownId: string; parts: DetailedPart[] }[];
  /** 通常時の小役グループ。総ゲーム数を母数とする多項分布に、入力のあるグループだけ入れる */
  normalGroups: { parts: DetailedPart[] }[];
  /** ボーナス中・RT中。gamesId（その状態のゲーム数）を母数に judgedIds を評価する */
  stateGroups: { gamesId: string; judgedIds: string[] }[];
}

/** members がある部品は「members のどれか（区別できなかった分）」として評価する */
export interface DetailedPart {
  id: string;
  members?: string[];
}

/**
 * 機種ごとの設定ファイル (Config) のルート定義
 */
export interface MachineConfig {
  id: string;
  name: string;
  title?: string;
  type: "A-type" | "BT" | "AT";
  themeColor?: string; // Tailwind BG クラス (例: 'bg-rose-600')
  sections: ConfigSection[];
  specs?: {
    baseGamesPerMedal?: number; // ベース: 50枚あたりの回転数
    payoutRatio?: number[]; // 機械割（設定1〜6）
    netIncreasePerART?: number; // ART純増（AT/ART機のみ）
    payouts?: {
      big: number;
      reg: number;
      grape?: number;
      bell?: number;
      /** 逆算用チェリー払出（未指定時: ジャグラー2枚 / ハナハナ4枚） */
      cherry?: number;
      /** 逆算用スイカ払出（スマスロ サンダーV。reverseCalcCustomRates とセットで使う） */
      suika?: number;
    };
    judgmentWeights?: {
      grapeWeightMap?: Record<number, number>;
      regBaseWeight?: number;
      bigBaseWeight?: number;
    };
    reverseCalcProbDenominators?: {
      replay: number;
      cherry: number;
      /**
       * フリー打ち時のチェリー取得率（0〜1）。
       * チェリー狙いは常に 1.0。リプレイは打ち方に依存しないため両モード同一補正。
       */
      cherryFreePlayRate?: number;
      /** 逆算で差し引くスイカの分母（スマスロ サンダーV） */
      suika?: number;
    };
    /**
     * 逆算ページで、チェリー・スイカの取得率を利用者が入力する方式にする（2026-10-26、スマスロ サンダーV）。
     * 指定時は「チェリー狙い／フリー打ち」の2つの結果ではなく、入力した取得率での結果を1つだけ出す。
     * 値は入力欄の初期値（0〜1）。
     */
    reverseCalcCustomRates?: {
      cherry: number;
      suika: number;
    };
    settings?: number[]; // [1, 2, 3, 4, 5, 6] by default
    /**
     * 詳細判別の計算方式。未指定時は従来どおりカテゴリで決まる
     * （ジャグラー＝多項分布 / それ以外＝重み付き）。機種IDでの分岐を避けるため設定ファイルで指定する。
     */
    estimationModel?: "multinomial" | "weighted" | "detailed";
    /**
     * 通常時小役カードへ「角チェリー」カウンターを自動で差し込むか（未指定時 true）。
     * 角チェリーという呼び方が当てはまらない機種（スマスロ ハナビ等）は false にする。
     */
    injectCherryCounter?: boolean;
    settingLabels?: Record<number, string>; // e.g. {6: "V"}
    // 旧 approximationLabelOverride は廃止（2026-09-22）。
    // 設定値が一致する設定をまとめて「(設定5-6近似)」と出す処理が
    // src/utils/approximation-label.ts に入り、特例が不要になったため。
  };
  detailedProbabilities?: {
    // 各配列は [設定1, 設定2, 設定3, 設定4, 設定5, 設定6] の順
    big_solo?: number[];
    big_cherry?: number[];
    reg_solo?: number[];
    reg_cherry?: number[];
    big_suika_raw?: number[];
    reg_lamp_blue_raw?: number[];
    reg_lamp_yellow_raw?: number[];
    reg_lamp_green_raw?: number[];
    reg_lamp_red_raw?: number[];
    feather_lamp_raw?: number[];
    retro_sound_raw?: number[];
  };
  exceptions?: {
    type: "highlight" | "warning";
    condition: string;
    description: string;
  }[];
  /**
   * ボーナス名の表記（未指定時 BIG / REG）。スマスロ ハナビは BB / RB（2026-10-13 ユーザー決定）。
   * 共通部品が固定で書いている「BIG」「REG」（指標カード・前任者ページ・スペックページの
   * ボーナス確率表）をこの値に置き換える。カウンターのラベルは各要素の label で指定する。
   */
  bonusLabels?: { big: string; reg: string };
  /**
   * 設定判別カードの指標グリッド（3列）の2行目以降（2026-10-15、スマスロ タコスロで導入）。
   * 1行目（BIG / REG / 合成）は共通。null は空きマス。指定時はカテゴリ別の既定の並びより優先。
   * 確率は「総ゲーム数（判別用）÷ 回数」。要素に probBase があればそのゲーム数を母数にする。
   * ラベルは全角3文字までが目安（3列の枠は92px。decisions-log 2026-09-23）。
   */
  metricRows?: (MetricRowItem | null)[];
  /**
   * 詳細判別ページ（/:machineId/detail）のカード。入力データは設定判別ページと共有する
   * （同じ localStorage キー）。machine-list.ts の detailPage: true とセットで使う。
   */
  detailSections?: ConfigSection[];
  /** 合計と内訳の関係。指定時は MachinePageFactory の自動合算をこの定義で行う */
  sumGroups?: SumGroup[];
  /** estimationModel: "detailed" のときの計算モデル */
  detailModel?: DetailedModel;
  seoContent?: SEOSection[];
  /**
   * 機種スペックページの内容を設定ファイルから汎用の表として描画する機種向け
   * （ジャグラー・ハナハナ以外。2026-10-05、スマスロ ハナビで導入）。
   */
  specPage?: SpecPageContent;
  /**
   * 標準（ジャグラー/ハナハナ）と異なる進行のAIアドバイス文言を持つ機種向け。
   * 指定があれば MachinePageFactory はこちらを優先表示する。
   */
  specialAdvice?: {
    tiers: SpecialAdviceTier[];
  };
}

/**
 * 総ゲーム数の区切り(段階)ごとに切り替わるAIアドバイス文言の1段階分。
 */
export interface SpecialAdviceTier {
  /** このtierが適用される総ゲーム数の上限（null = 上限なし・最終tier） */
  maxGames: number | null;
  /** tier冒頭に常に表示するHTML（dangerouslySetInnerHTMLで描画） */
  introHtml: string;
  /**
   * highSettingProb（設定5・6の合算期待度%）に応じて先頭から順に判定し、
   * 最初にマッチしたものを introHtml の直後に表示する。該当なしなら何も追加しない。
   */
  brackets: SpecialAdviceBracket[];
}

export interface SpecialAdviceBracket {
  /** highSettingProb がこの値以上のときマッチ（省略時は下限なし） */
  minProb?: number;
  /** highSettingProb がこの値未満のときマッチ（省略時は上限なし） */
  maxProb?: number;
  /** マッチ時に表示するHTML（dangerouslySetInnerHTMLで描画） */
  html: string;
}

/**
 * 機種スペックページの汎用表示データ。
 * 値は表示用の文字列で持つ（"1/297.9"・"98.6%"・"なし" 等、表ごとに書式が違うため）。
 */
export interface SpecPageContent {
  /** 冒頭の攻略アドバイス */
  strategy?: string;
  /** 「ボーナス確率」カード（BIG/REG/合成。big-count/reg-count から自動生成）の解説文 */
  bonusProbAdvice?: string;
  /** ボーナス確率カードの後ろに並べるカード */
  cards: SpecCard[];
}

export interface SpecCard {
  /** 開閉状態の保存キー（spec_page_block_states_${machineId} 内） */
  id: string;
  title: string;
  icon: string;
  blocks: SpecBlock[];
  /** 表の下に出す解説文 */
  advice?: string;
  /** 解説文の下に小さく出す注記 */
  note?: string;
}

/**
 * bySetting: 行＝設定、列＝項目（列は4つまで。375pxで収まる上限）
 * byItem:    行＝項目、列＝設定（項目が多い表向け。設定が4段階以下の機種で使う）
 * info:      設定に関係しない文章の一覧（ボーナス仕様・示唆演出など）
 */
export type SpecBlock =
  | {
      kind: "bySetting";
      caption?: string;
      columns: { label: string; values: Record<number, string> }[];
    }
  | {
      kind: "byItem";
      caption?: string;
      rows: { label: string; note?: string; values: Record<number, string> }[];
    }
  | {
      kind: "info";
      caption?: string;
      items: { title: string; lines: { label: string; value: string }[] }[];
    };

/**
 * SEO・解説用セクション
 */
export interface SEOSection {
  title: string;
  paragraphs: string[];
}

/**
 * ユーザーの入力値（設定判別に使用）
 */
export type UserInputs = Record<string, number | boolean | string>;

/**
 * 設定期待度の計算結果
 */
export interface EstimationResult {
  setting: number;
  probability: number; // 0-100の百分率
}
