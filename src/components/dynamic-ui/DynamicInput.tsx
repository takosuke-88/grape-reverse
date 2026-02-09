import React from 'react';
import type { DiscriminationElement } from '../../types/machine-schema';

interface DynamicInputProps {
  element: DiscriminationElement;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
  totalGames?: number; // 総ゲーム数（確率計算用）
}

const DynamicInput: React.FC<DynamicInputProps> = ({ element, value, onChange, totalGames }) => {
  // リアルタイム確率計算
  const calculateProbability = () => {
    if (element.type !== 'counter' || !totalGames || totalGames === 0) return null;
    const count = Number(value) || 0;
    if (count === 0) return null;
    const denominator = totalGames / count;
    return denominator;
  };

  const currentProbability = calculateProbability();

  const renderInput = () => {
    switch (element.type) {
      case 'counter':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const numValue = Number(value) || 0;
                  onChange(numValue + 1);
                }}
                className="min-w-[44px] min-h-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-lg transition-colors flex items-center justify-center"
                aria-label="増やす"
              >
                ＋
              </button>
              
              <input
                type="number"
                value={value === '' ? '' : value}
                onChange={(e) => {
                  if (e.target.value === '') {
                    onChange('');
                  } else {
                    const newValue = parseInt(e.target.value) || 0;
                    onChange(Math.max(0, newValue));
                  }
                }}
                className="w-24 h-[44px] text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                min="0"
                placeholder="0"
              />
              
              <button
                type="button"
                onClick={() => {
                  const numValue = Number(value) || 0;
                  onChange(Math.max(0, numValue - 1));
                }}
                className="min-w-[44px] min-h-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-lg transition-colors flex items-center justify-center dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                aria-label="減らす"
              >
                －
              </button>
              
              {/* リアルタイム確率表示（常時表示） */}
              <div className="ml-2 text-right min-w-[60px]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">現在</div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {currentProbability ? `1/${currentProbability.toFixed(1)}` : '---'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'select':
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

      case 'flag':
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-11 w-20 items-center rounded-full transition-colors ${
              value ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={!!value}
            aria-label={element.label}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                value ? 'translate-x-10' : 'translate-x-1'
              }`}
            />
            <span
              className={`absolute text-xs font-bold ${
                value 
                  ? 'left-2 text-white' 
                  : 'right-2 text-slate-600'
              }`}
            >
              {value ? 'ON' : 'OFF'}
            </span>
          </button>
        );

      case 'ratio':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value === '' ? '' : value}
              onChange={(e) => {
                if (e.target.value === '') {
                  onChange('');
                } else {
                  const newValue = parseFloat(e.target.value) || 0;
                  onChange(Math.max(0, newValue));
                }
              }}
              className="w-full h-[44px] px-4 text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              min="0"
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
      <label className="block text-center text-sm font-medium text-slate-700 dark:text-slate-300">
        {element.label}
        {element.context?.description && (
          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
            ({element.context.description})
          </span>
        )}
      </label>
      <div className="flex justify-center">
        {renderInput()}
      </div>
    </div>
  );
};

export default DynamicInput;
