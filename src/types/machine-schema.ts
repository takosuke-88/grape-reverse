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
    };
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
