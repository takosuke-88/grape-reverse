import React, { useCallback } from "react";
import type { DiscriminationElement } from "../../types/machine-schema";

interface DynamicInputProps {
  element: DiscriminationElement;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
  totalGames?: number; // 総ゲーム数（確率計算用）
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  element,
  value,
  onChange,
  totalGames,
}) => {
  // リアルタイム確率計算
  const calculateProbability = () => {
    if (element.type !== "counter" || !totalGames || totalGames === 0)
      return null;
    const count = Number(value) || 0;
    if (count === 0) return null;
    const denominator = totalGames / count;
    return denominator;
  };

  // ネイティブtouchstartイベントをDOMに直接アタッチするcallback ref
  // Reactのイベント委譲を完全にバイパスし、タッチした瞬間に即座に振動させる
  const hapticRef = useCallback((node: HTMLButtonElement | null) => {
    if (!node) return;
    const handler = () => {
      try {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(30);
        }
      } catch (_) {
        // Firefox Android等はVibration API無効のためsilent fail
      }
    };
    // passive: true でスクロールブロッキングを防止し、最速で発火させる
    node.addEventListener("touchstart", handler, { passive: true });
    // クリーンアップは不要（Reactがノードをアンマウントすればリスナーも消える）
  }, []);

  const currentProbability = calculateProbability();

  const renderInput = () => {
    switch (element.type) {
      case "counter":
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <button
                ref={element.isReadOnly ? undefined : hapticRef}
                type="button"
                onClick={() => {
                  if (element.isReadOnly) return;
                  const numValue = Number(value) || 0;
                  onChange(numValue + 1);
                }}
                disabled={!!element.isReadOnly}
                className={`min-w-[44px] min-h-[44px] rounded-lg text-slate-700 font-bold text-lg transition-colors flex items-center justify-center ${
                  element.isReadOnly
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed opacity-50"
                    : "bg-slate-100 hover:bg-slate-200 active:bg-slate-300"
                }`}
                aria-label="増やす"
              >
                ＋
              </button>

              <input
                type="number"
                readOnly={!!element.isReadOnly}
                value={
                  typeof value === "boolean" ? "" : value === "" ? "" : value
                }
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // 現在のDOMからすべてのnumberタイプのinput要素を取得
                    const inputs = Array.from(
                      document.querySelectorAll(
                        'input[type="number"]:not([readonly])',
                      ),
                    ) as HTMLInputElement[];
                    const currentIndex = inputs.indexOf(e.currentTarget);
                    if (currentIndex > -1 && currentIndex < inputs.length - 1) {
                      // 次のinputへフォーカス移動
                      inputs[currentIndex + 1].focus();
                    } else {
                      // 最後の入力欄だった場合はキーボードを閉じる
                      e.currentTarget.blur();
                    }
                  }
                }}
                onChange={(e) => {
                  if (element.isReadOnly) return;
                  if (e.target.value === "") {
                    onChange("");
                  } else {
                    const newValue = parseInt(e.target.value) || 0;
                    onChange(newValue);
                  }
                }}
                className={`w-24 h-[44px] text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-white ${
                  element.isReadOnly
                    ? "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-500 cursor-not-allowed opacity-60"
                    : ""
                }`}
                placeholder="0"
              />

              <button
                ref={element.isReadOnly ? undefined : hapticRef}
                type="button"
                onClick={() => {
                  if (element.isReadOnly) return;
                  const numValue = Number(value) || 0;
                  onChange(numValue - 1);
                }}
                disabled={!!element.isReadOnly}
                className={`min-w-[44px] min-h-[44px] rounded-lg text-slate-700 font-bold text-lg transition-colors flex items-center justify-center dark:bg-slate-700 dark:text-slate-200 ${
                  element.isReadOnly
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed opacity-50 dark:bg-slate-800 dark:text-slate-600"
                    : "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:hover:bg-slate-600"
                }`}
                aria-label="減らす"
              >
                －
              </button>
            </div>

            {/* リアルタイム確率表示（下行に配置） */}
            {element.id !== "total-games" && (
              <div className="text-center">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  現在
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {currentProbability
                    ? `1/${currentProbability.toFixed(1)}`
                    : "---"}
                </div>
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[44px] px-4 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">選択してください</option>
            <option value="あり">あり</option>
            <option value="なし">なし</option>
          </select>
        );

      case "flag":
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-11 w-20 items-center rounded-full transition-colors ${
              value ? "bg-blue-600" : "bg-slate-300"
            }`}
            role="switch"
            aria-checked={!!value}
            aria-label={element.label}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                value ? "translate-x-10" : "translate-x-1"
              }`}
            />
            <span
              className={`absolute text-xs font-bold ${
                value ? "left-2 text-white" : "right-2 text-slate-600"
              }`}
            >
              {value ? "ON" : "OFF"}
            </span>
          </button>
        );

      case "ratio":
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              readOnly={!!element.isReadOnly}
              value={
                typeof value === "boolean" ? "" : value === "" ? "" : value
              }
              onChange={(e) => {
                if (element.isReadOnly) return;
                if (e.target.value === "") {
                  onChange("");
                } else {
                  const newValue = parseFloat(e.target.value) || 0;
                  onChange(newValue);
                }
              }}
              className="w-full h-[44px] px-4 text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              step="0.01"
              placeholder="1/○○○"
            />
          </div>
        );

      default:
        return <div className="text-slate-400 text-sm">未対応の入力タイプ</div>;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-center text-sm font-bold text-gray-800 dark:text-slate-200">
        {element.label}
      </label>
      <div className="flex justify-center">{renderInput()}</div>
      {/* 設定6確定演出の注意書き表示 */}
      {(element.id === "reg-lamp-rainbow" || element.id === "bonus-rainbow") &&
        Number(value) > 0 && (
          <div className="text-center text-xs font-bold text-red-500 animate-pulse mt-1">
            ※設定6確定演出として計算されます
          </div>
        )}
    </div>
  );
};

export default DynamicInput;
