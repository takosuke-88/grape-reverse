import { useEffect, useState } from "react";

interface Props {
  /** 記事タイトル（サイト名サフィックス無し） */
  title: string;
  /** `/columns/:slug` 形式のパス */
  path: string;
}

// Seo.tsx / scripts/generate-sitemap.js と同じ値。サイト全体でbaseUrlを
// 一元管理する仕組みが無いため、既存の慣習に合わせてこのファイルでも定義する。
const BASE_URL = "https://grape-reverse.com";

// ハッシュタグは最大2個まで。x.com/intent/tweetのhashtagsパラメータへ渡す
// （text側には重複して含めない）。カンマ区切り・#無し・スペース無しの表記。
const HASHTAGS = ["パチスロ", "GrapeReverse"];

const COPIED_RESET_MS = 2000;

/**
 * X共有ボタン + URLコピーボタン。widgets.js等の外部スクリプトは使わず、
 * 実HTMLの<a>タグ（x.com/intent/tweet）とnavigator.clipboardのみで実装する。
 */
const ColumnShareButtons = ({ title, path }: Props) => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copyState]);

  const canonicalUrl = `${BASE_URL}${path}`;
  // text/url/hashtagsは役割ごとに分離し、URLやハッシュタグをtextへ
  // 重複して埋め込まない（Xが投稿作成画面でtext→url→hashtagsの順に結合する）。
  const shareText = `「${title}」｜GrapeReverse`;
  const shareParams = new URLSearchParams({
    text: shareText,
    url: canonicalUrl,
    hashtags: HASHTAGS.join(","),
  });
  const shareHref = `https://x.com/intent/tweet?${shareParams.toString()}`;

  const handleCopy = async () => {
    // 表示中のページのURL（クエリ・ハッシュ込み）をそのままコピー対象にする
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setCopyState("copied");
        return;
      }
      throw new Error("Clipboard API unavailable");
    } catch {
      // フォールバック①: 非HTTPS環境やClipboard API非対応ブラウザ向け
      try {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.top = "-1000px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          setCopyState("copied");
          return;
        }
        throw new Error("execCommand copy failed");
      } catch {
        // フォールバック②: それでも失敗した場合、選択・手動コピーできる
        // ダイアログでURLを提示する（画面遷移は発生しない）
        window.prompt("このURLをコピーしてください", url);
        setCopyState("failed");
      }
    }
  };

  return (
    <div className="not-prose my-6 flex flex-wrap items-center gap-2">
      <a
        href={shareHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-85 active:opacity-70 dark:bg-white dark:text-slate-900"
        aria-label="この記事をXでシェアする"
      >
        <svg
          className="h-4 w-4 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Xでシェア
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
        aria-label="この記事のURLをコピーする"
      >
        <svg
          className="h-4 w-4 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copyState === "copied"
          ? "コピーしました"
          : copyState === "failed"
            ? "コピー欄を表示しました"
            : "URLをコピー"}
      </button>
    </div>
  );
};

export default ColumnShareButtons;
