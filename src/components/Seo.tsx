import { useEffect } from "react";

interface ArticleMeta {
  headline: string;
  datePublished: string;
  dateModified: string;
}

interface SeoProps {
  pageTitle: string;
  pageDescription: string;
  pagePath: string;
  pageImg?: string;
  articleMeta?: ArticleMeta;
  /** true の場合 <meta name="robots" content="noindex"> を出力する。コンテンツが薄いページ用 */
  noindex?: boolean;
}

/**
 * SPA用のSEOコンポーネント
 * ReactのuseEffectを使用して、ドキュメントのタイトルとメタタグを動的に更新します。
 */
const Seo = ({
  pageTitle,
  pageDescription,
  pagePath,
  pageImg,
  articleMeta,
  noindex,
}: SeoProps) => {
  useEffect(() => {
    // 1. タイトルの更新
    document.title = pageTitle;

    // 2. メタタグの更新関数
    const updateMeta = (
      name: string,
      content: string,
      attr: "name" | "property" = "name",
    ) => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const baseUrl = "https://grape-reverse.com";
    const fullUrl = `${baseUrl}${pagePath.startsWith("/") ? pagePath : "/" + pagePath}`;
    const defaultImg = `${baseUrl}/favicon_io/android-chrome-512x512.png`;

    // 標準メタタグ
    updateMeta("description", pageDescription);

    // robots (noindex): コンテンツが薄いページのみ付与
    const robotsSelector = 'meta[name="robots"]';
    let robotsEl = document.querySelector(robotsSelector);
    if (noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement("meta");
        robotsEl.setAttribute("name", "robots");
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute("content", "noindex");
    } else if (robotsEl) {
      robotsEl.remove();
    }

    // Open Graph
    updateMeta("og:title", pageTitle, "property");
    updateMeta("og:description", pageDescription, "property");
    updateMeta("og:url", fullUrl, "property");
    updateMeta("og:image", pageImg || defaultImg, "property");

    // Twitter Card
    updateMeta("twitter:title", pageTitle);
    updateMeta("twitter:description", pageDescription);
    updateMeta("twitter:image", pageImg || defaultImg);

    // Canonical (オプション: 重複コンテンツ対策)
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // 構造化データ (JSON-LD): 記事ページのみ
    const jsonLdId = "structured-data-jsonld";
    let jsonLdScript = document.getElementById(
      jsonLdId,
    ) as HTMLScriptElement | null;

    if (articleMeta) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.id = jsonLdId;
        jsonLdScript.type = "application/ld+json";
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: articleMeta.headline,
        description: pageDescription,
        datePublished: articleMeta.datePublished,
        dateModified: articleMeta.dateModified,
        url: fullUrl,
        image: pageImg || defaultImg,
      });
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [pageTitle, pageDescription, pagePath, pageImg, articleMeta, noindex]);

  return null;
};

export default Seo;
