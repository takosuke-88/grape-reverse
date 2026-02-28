import { useState, useEffect } from "react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // スクロール位置を監視
  useEffect(() => {
    const toggleVisibility = () => {
      // 300px以上スクロールしたら表示
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // トップへスムーズスクロール
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:bg-indigo-600 active:scale-95 dark:bg-slate-700 dark:hover:bg-indigo-500 sm:bottom-8 sm:right-8 group"
      aria-label="ページトップへ戻る"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:-translate-y-1"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
