import React from 'react';
import type { EstimationResult } from '../../types/machine-schema';

interface EstimationResultDisplayProps {
  results: EstimationResult[];
}

// 設定ごとのカラー定義
const SETTING_COLORS = [
  { bg: 'bg-slate-400', text: 'text-slate-600' }, // 1
  { bg: 'bg-slate-400', text: 'text-slate-600' }, // 2
  { bg: 'bg-slate-400', text: 'text-slate-600' }, // 3
  { bg: 'bg-blue-500', text: 'text-blue-600' },   // 4
  { bg: 'bg-amber-500', text: 'text-amber-600' }, // 5
  { bg: 'bg-rose-600', text: 'text-rose-600' },   // 6
];

const EstimationResultDisplay: React.FC<EstimationResultDisplayProps> = ({ results }) => {
  // 最も可能性の高い設定を特定
  const maxResult = results.reduce((max, current) => 
    current.probability > max.probability ? current : max
  );

  // 高設定（5-6）の合算確率
  const highSettingProb = results
    .filter(r => r.setting >= 5)
    .reduce((sum, r) => sum + r.probability, 0);

  return (
    <div className="space-y-4">
      {/* サマリーカード（コンパクト化） */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500 mb-1">判別結果</div>
            <div className="text-3xl font-bold text-slate-800">
              設定{maxResult.setting}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {maxResult.probability.toFixed(1)}%
            </div>
          </div>
          
          <div className="border-l border-slate-200">
            <div className="text-xs text-slate-500 mb-1">高設定</div>
            <div className="text-3xl font-bold text-rose-600">
              {highSettingProb.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400 mt-1">%</div>
          </div>
          
          <div className="border-l border-slate-200">
            <div className="text-xs text-slate-500 mb-1">信頼度</div>
            <div className="text-3xl font-bold text-slate-600">
              {maxResult.probability >= 50 ? '高' : maxResult.probability >= 30 ? '中' : '低'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {maxResult.probability >= 50 ? '★★★' : maxResult.probability >= 30 ? '★★☆' : '★☆☆'}
            </div>
          </div>
        </div>
      </div>

      {/* 詳細グラフ */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-600 mb-3">
          設定別期待度
        </h3>
        
        <div className="space-y-2">
          {results.map((result, index) => {
            const isMax = result.setting === maxResult.setting;
            const colors = SETTING_COLORS[index];
            
            return (
              <div key={result.setting} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isMax ? colors.text : 'text-slate-500'}`}>
                      設定{result.setting}
                    </span>
                    {isMax && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        最有力
                      </span>
                    )}
                  </div>
                  <span className={`font-bold tabular-nums ${isMax ? colors.text : 'text-slate-600'}`}>
                    {result.probability.toFixed(1)}%
                  </span>
                </div>
                
                <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${colors.bg} transition-all duration-700 ease-out`}
                    style={{
                      width: `${Math.max(result.probability, 2)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 注釈 */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          ※ベイズの定理による推定値です。
        </div>
      </div>
    </div>
  );
};

export default EstimationResultDisplay;
