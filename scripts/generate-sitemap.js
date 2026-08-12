import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://grape-reverse.com";
const SITEMAP_PATH = path.resolve(__dirname, "../public/sitemap.xml");
const MACHINE_LIST_PATH = path.resolve(
  __dirname,
  "../src/data/machine-list.ts",
);
const COLUMNS_CONTENT_DIR = path.resolve(
  __dirname,
  "../src/content/columns",
);

// Function to extract IDs from TS array of objects
function extractIdsFromFile(filePath, regex) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const ids = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) {
        ids.push(match[1]);
      }
    }
    return ids;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Ensure the priority and changefreq match our plan
const sitemapTemplate = (urls) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

// lastmodは「実際に管理できている更新日」がある場合のみ出力する。
// 機種一覧・トップページ・コラム一覧のように、コンテンツごとの更新日を
// 追跡する仕組みが存在しないURLに毎回ビルド日を書き込むと、Googleが
// 再クロール要否を判断するための鮮度シグナルとして機能しなくなる
// （全件が常に「たった今更新された」ことになるため）。そのためlastmod引数が
// undefinedのときはタグ自体を省略する（sitemapプロトコル上lastmodは任意）。
const urlElement = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${loc}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

async function generateSitemap() {
  const urls = [];

  // 1. Top Page
  // 「最新コラム3件」等が変動するが、変更日を個別に追跡していないためlastmodは省略。
  urls.push(urlElement(`${BASE_URL}/`, undefined, "weekly", "1.0"));

  // 2. Machine Pages
  // 機種ページ（カウンター/ぶどう逆算/スペック）は記事のような
  // 個別の更新日トラッキング（frontmatterのupdatedAt相当）を持たないため、
  // 不正確な日付を出すよりlastmodを省略する。
  // Regex looks for: id: "something" or id: 'something'
  const machineIdRegex = /id:\s*["']([^"']+)["']/g;
  const machineIds = extractIdsFromFile(MACHINE_LIST_PATH, machineIdRegex);

  if (machineIds.length === 0) {
    console.warn(
      "⚠️ No machine IDs found in machine-list.ts. Check the file structure.",
    );
  } else {
    console.log(`✅ Found ${machineIds.length} machines`);
    machineIds.forEach((id) => {
      urls.push(urlElement(`${BASE_URL}/${id}`, undefined, "weekly", "0.8"));
      urls.push(
        urlElement(`${BASE_URL}/${id}/grape`, undefined, "weekly", "0.7"),
      );
      urls.push(
        urlElement(`${BASE_URL}/${id}/specs`, undefined, "weekly", "0.7"),
      );
    });
  }

  // 3. Column Index
  // 一覧ページ自体の更新日は個別記事の追加のたびに変わるが、これも追跡していないため省略。
  urls.push(urlElement(`${BASE_URL}/columns`, undefined, "weekly", "0.9"));

  // 4. Column Article Pages
  // src/content/columns/*.md のファイル名をslugとして使用し、
  // フロントマターの draft: true が付いた記事は除外する
  const frontmatterBlockRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  // コラム記事はフロントマターにupdatedAt/dateという「実際に管理された更新日」が
  // あるため、これらだけはlastmodを出力する（唯一の例外）。
  let columnEntries = [];
  try {
    columnEntries = fs
      .readdirSync(COLUMNS_CONTENT_DIR)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const content = fs.readFileSync(
          path.join(COLUMNS_CONTENT_DIR, file),
          "utf-8",
        );
        const match = content.match(frontmatterBlockRegex);
        const frontmatter = match ? match[1] : "";
        const draft = /draft:\s*true/.test(frontmatter);
        const updatedAtMatch = frontmatter.match(
          /updatedAt:\s*["']([^"']+)["']/,
        );
        const dateMatch = frontmatter.match(/^date:\s*["']([^"']+)["']/m);
        // date/updatedAtがどちらもパースできない（フロントマター破損等）場合は
        // todayで埋めず素直に省略する。不正確な日付を出す方が実害が大きい。
        const lastmod = updatedAtMatch?.[1] ?? dateMatch?.[1] ?? undefined;
        return { slug: file.replace(/\.md$/, ""), draft, lastmod };
      })
      .filter((entry) => !entry.draft);
  } catch (error) {
    console.error(`Error reading ${COLUMNS_CONTENT_DIR}:`, error);
  }

  if (columnEntries.length === 0) {
    console.warn(
      "⚠️ No column articles found in src/content/columns. Check the directory.",
    );
  } else {
    console.log(`✅ Found ${columnEntries.length} columns`);
    columnEntries.forEach(({ slug, lastmod }) => {
      urls.push(
        urlElement(`${BASE_URL}/columns/${slug}`, lastmod, "monthly", "0.7"),
      );
    });
  }

  // Generate and write XML
  const xmlContent = sitemapTemplate(urls);
  fs.writeFileSync(SITEMAP_PATH, xmlContent, "utf-8");
  console.log(
    `🎉 Successfully generated sitemap with ${urls.length} URLs at ${SITEMAP_PATH}`,
  );
}

generateSitemap();
