import { useEffect, useRef } from "react";

// コラム本文中盤の手動広告ユニット（AdSense管理画面上の名称: コラム本文中盤）
const AD_CLIENT = "ca-pub-1717003557291713";
const AD_SLOT = "3272741534";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    /**
     * ビルド時プリレンダリング（scripts/generate-seo-shells.mjs）のブラウザだけに
     * page.addInitScript で立てるフラグ。本番の閲覧者のブラウザでは常に未定義。
     */
    __GR_PRERENDER__?: boolean;
  }
}

/** プリレンダリング中か。hostname や User-Agent では判定しない */
export const isPrerendering = (): boolean =>
  typeof window !== "undefined" && window.__GR_PRERENDER__ === true;

/**
 * このモジュールが push 済みの ins 要素。
 * StrictMode の Effect 再実行・通常の再レンダリングでは同じ DOM 要素が渡ってくるため、
 * ここに入っていれば二度と push しない。記事を移動すると要素ごと作り直されるので、
 * 新しい記事の枠は未登録の新しい要素として扱われる。
 */
const requestedSlots = new WeakSet<HTMLElement>();

const ColumnAdUnit = () => {
  const insRef = useRef<HTMLModElement | null>(null);
  const prerendering = isPrerendering();

  useEffect(() => {
    // 静的HTMLへ広告実行後のDOMを焼き込まないため、ビルド中は push しない
    if (prerendering) return;
    const ins = insRef.current;
    if (!ins || requestedSlots.has(ins)) return;
    // 何らかの理由で既に処理済みの要素には触れない
    if (ins.hasAttribute("data-adsbygoogle-status")) return;

    requestedSlots.add(ins);
    try {
      // adsbygoogle.js が未読込でも配列へ積まれ、読込後に1回だけ処理される
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("[ColumnAdUnit] 広告枠の初期化に失敗しました", error);
    }
  }, [prerendering]);

  // ビルド中は ins 自体を出力しない（混入検査の `<ins class="adsbygoogle"` を弱めずに済む）
  if (prerendering) return null;

  return (
    <div className="column-ad-slot not-prose">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </div>
  );
};

export default ColumnAdUnit;
