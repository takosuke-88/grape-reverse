import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // pathname（URLのパス部分）が変更されたら、ページの先頭へスクロールする
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
