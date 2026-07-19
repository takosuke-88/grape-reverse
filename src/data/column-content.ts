import fm from "front-matter";

export interface ColumnFrontmatter {
  title: string;
  description: string;
  date: string;
  updatedAt: string;
  tags: string[];
  draft: boolean;
  showRelatedColumns?: boolean;
}

export interface ColumnEntry {
  slug: string;
  frontmatter: ColumnFrontmatter;
  body: string;
}

const rawModules = import.meta.glob("/src/content/columns/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const ALL_COLUMNS: ColumnEntry[] = Object.entries(rawModules)
  .map(([path, raw]) => {
    const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
    const parsed = fm<ColumnFrontmatter>(raw);
    return { slug, frontmatter: parsed.attributes, body: parsed.body };
  })
  .filter((entry) => !entry.frontmatter.draft)
  .sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );

export function getColumnBySlug(slug: string): ColumnEntry | undefined {
  return ALL_COLUMNS.find((entry) => entry.slug === slug);
}
