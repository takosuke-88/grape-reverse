import { useParams, Navigate, Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import Seo from "../../components/Seo";
import ColumnNavigation from "../../components/ColumnNavigation";
import RelatedColumns from "../../components/RelatedColumns";
import ColumnRenderErrorBoundary from "../../components/ColumnRenderErrorBoundary";
import { getColumnBySlug } from "../../data/column-content";

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

const markdownComponents: Components = {
  a: InternalLinkAwareAnchor,
};

const ColumnDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getColumnBySlug(slug) : undefined;

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
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="column-article prose dark:prose-invert max-w-none">
          <ColumnRenderErrorBoundary>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {body}
            </ReactMarkdown>
          </ColumnRenderErrorBoundary>
        </div>

        {frontmatter.showRelatedColumns && (
          <RelatedColumns currentId={entry.slug} />
        )}
        <ColumnNavigation currentId={entry.slug} />
      </main>
    </div>
  );
};

export default ColumnDetailPage;
