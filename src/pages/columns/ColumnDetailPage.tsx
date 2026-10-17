import { useEffect, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import Seo from "../../components/Seo";
import ColumnNavigation from "../../components/ColumnNavigation";
import RelatedColumns from "../../components/RelatedColumns";
import ColumnRenderErrorBoundary from "../../components/ColumnRenderErrorBoundary";
import ColumnShareButtons from "../../components/ColumnShareButtons";
import ColumnAdUnit from "../../components/ads/ColumnAdUnit";
import { getColumnBySlug } from "../../data/column-content";
import {
  COLUMN_AD_SLOT_TAG,
  rehypeColumnAdSlot,
} from "../../utils/column-ad-placement";

const InternalLinkAwareAnchor: Components["a"] = ({ href, children, ...rest }) => {
  if (href && href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
};

// 広告枠のプレースホルダー要素（rehypeColumnAdSlot が本文中に最大1つ差し込む）は
// HTMLの標準要素ではないため Components の型に無く、キャストして登録する
const markdownComponents = {
  a: InternalLinkAwareAnchor,
  [COLUMN_AD_SLOT_TAG]: ColumnAdUnit,
} as Components;

const rehypePlugins = [rehypeRaw, rehypeColumnAdSlot];

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: Element) => void } };
  }
}

const TWITTER_WIDGETS_SRC = "https://platform.twitter.com/widgets.js";

// 本文に <blockquote class="twitter-tweet"> がある記事だけ、閲覧者のブラウザで widgets.js を読む。
// ビルド用ブラウザ（__GR_PRERENDER__）では読まない: 読むと埋め込み後のiframeが静的HTMLへ焼き込まれる
const useTwitterEmbeds = (
  container: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) => {
  useEffect(() => {
    if (!enabled || !container.current) return;
    if ((window as { __GR_PRERENDER__?: boolean }).__GR_PRERENDER__) return;
    const el = container.current;
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(el);
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${TWITTER_WIDGETS_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = TWITTER_WIDGETS_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    const onLoad = () => window.twttr?.widgets?.load(el);
    script.addEventListener("load", onLoad);
    return () => script?.removeEventListener("load", onLoad);
  }, [container, enabled]);
};

const formatJaDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
};

const ColumnDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getColumnBySlug(slug) : undefined;
  const articleRef = useRef<HTMLDivElement>(null);
  useTwitterEmbeds(articleRef, !!entry && entry.body.includes("twitter-tweet"));

  if (!entry) {
    return <Navigate to="/columns" replace />;
  }

  const { frontmatter, body } = entry;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Seo
        pageTitle={`${frontmatter.title}｜GrapeReverse`}
        pageDescription={frontmatter.description}
        pagePath={`/columns/${entry.slug}`}
        articleMeta={{
          headline: frontmatter.title,
          datePublished: frontmatter.date,
          dateModified: frontmatter.updatedAt,
        }}
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <span>公開日：{formatJaDate(frontmatter.date)}</span>
          {frontmatter.updatedAt !== frontmatter.date && (
            <span className="ml-4">
              更新日：{formatJaDate(frontmatter.updatedAt)}
            </span>
          )}
        </div>
        <ColumnShareButtons
          title={frontmatter.title}
          path={`/columns/${entry.slug}`}
        />
        {/* key: 記事A→Bへ移動したとき本文を作り直し、旧記事の広告枠を使い回さない */}
        <div
          key={entry.slug}
          ref={articleRef}
          className="column-article prose dark:prose-invert max-w-none"
        >
          <ColumnRenderErrorBoundary>
            <ReactMarkdown
              rehypePlugins={rehypePlugins}
              components={markdownComponents}
            >
              {body}
            </ReactMarkdown>
          </ColumnRenderErrorBoundary>
        </div>
        <ColumnShareButtons
          title={frontmatter.title}
          path={`/columns/${entry.slug}`}
        />

        {/* 表示するかどうかは RelatedColumns 側の候補件数に委ねる
            （関連が無ければ null を返すため、ここでのフラグ制御は不要） */}
        <RelatedColumns currentId={entry.slug} />
        <ColumnNavigation currentId={entry.slug} />
      </main>
    </div>
  );
};

export default ColumnDetailPage;
