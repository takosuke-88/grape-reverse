import React from "react";

/**
 * テキスト内の「BIG」を赤色、「REG」を水色にハイライトするフォーマッタ
 * @param text フォーマット対象の文字列またはReactNode
 * @returns ハイライト部分を含むReactNodeの配列またはそのままの要素
 */
export const formatBonusText = (text: React.ReactNode): React.ReactNode => {
  if (typeof text !== "string") {
    // 文字列以外（既にReact要素になっている等）の場合はそのまま返す
    return text;
  }

  // BIGまたはREGで分割し、それぞれにコンポーネントを当てる
  const regex = /(BIG|REG)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part === "BIG") {
      return (
        <span key={index} className="text-red-500 font-bold">
          BIG
        </span>
      );
    }
    if (part === "REG") {
      return (
        <span key={index} className="text-sky-500 font-bold">
          REG
        </span>
      );
    }
    return part;
  });
};
