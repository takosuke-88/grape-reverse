import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// key（履歴エントリごとの一意なID）に紐づけてスクロール位置を保持する。
// ブラウザの「戻る」操作時に、元居たページのスクロール位置へ復元するために使う。
const scrollPositions = new Map<string, number>();

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // ブラウザ標準のスクロール復元と競合しないよう、復元は完全に手動で行う
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 現在地のスクロール位置を継続的に記録しておく（次に離脱した時のため）
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(key, window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [key]);

  useEffect(() => {
    if (hash) {
      // ページ遷移直後に要素がマウントされる時間差を考慮して setTimeout を使用
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
      return;
    }

    if (navigationType === "POP") {
      // 「戻る/進む」: 離脱前のスクロール位置へ即座に復元（アニメーションなし）
      const saved = scrollPositions.get(key);
      window.scrollTo({ top: saved ?? 0, left: 0, behavior: "instant" });
    } else {
      // 新規ページへの遷移: 常にトップへ即座にジャンプ（アニメーションなし）
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash, key, navigationType]);

  return null;
}
