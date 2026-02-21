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
}

/**
 * UIのセクション分割用
 */
export interface ConfigSection {
  id: string;
  title: string;
  elements: DiscriminationElement[];
}

/**
 * 機種ごとの設定ファイル (Config) のルート定義
 */
export interface MachineConfig {
  id: string;
  name: string;
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
      grape: number;
    };
    judgmentWeights?: {
      grapeWeightMap?: Record<number, number>;
      regBaseWeight?: number;
      bigBaseWeight?: number;
    };
    reverseCalcProbDenominators?: {
      replay: number;
      cherry: number;
    };
  };
  detailedProbabilities?: {
    // 各配列は [設定1, 設定2, 設定3, 設定4, 設定5, 設定6] の順
    big_solo: number[];
    big_cherry: number[];
    reg_solo: number[];
    reg_cherry: number[];
  };
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
