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

const urlElement = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

async function generateSitemap() {
  const urls = [];
  const today = new Date().toISOString().split("T")[0];

  // 1. Top Page
  urls.push(urlElement(`${BASE_URL}/`, today, "weekly", "1.0"));

  // 2. Machine Pages
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
      urls.push(urlElement(`${BASE_URL}/${id}`, today, "weekly", "0.8"));
    });
  }

  // 3. Column Index
  urls.push(urlElement(`${BASE_URL}/columns`, today, "weekly", "0.9"));

  // 4. Column Article Pages
  // src/content/columns/*.md のファイル名をslugとして使用し、
  // フロントマターの draft: true が付いた記事は除外する
  const frontmatterBlockRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  let columnSlugs = [];
  try {
    columnSlugs = fs
      .readdirSync(COLUMNS_CONTENT_DIR)
      .filter((file) => file.endsWith(".md"))
      .filter((file) => {
        const content = fs.readFileSync(
          path.join(COLUMNS_CONTENT_DIR, file),
          "utf-8",
        );
        const match = content.match(frontmatterBlockRegex);
        const frontmatter = match ? match[1] : "";
        return !/draft:\s*true/.test(frontmatter);
      })
      .map((file) => file.replace(/\.md$/, ""));
  } catch (error) {
    console.error(`Error reading ${COLUMNS_CONTENT_DIR}:`, error);
  }

  if (columnSlugs.length === 0) {
    console.warn(
      "⚠️ No column articles found in src/content/columns. Check the directory.",
    );
  } else {
    console.log(`✅ Found ${columnSlugs.length} columns`);
    columnSlugs.forEach((slug) => {
      urls.push(
        urlElement(`${BASE_URL}/columns/${slug}`, today, "monthly", "0.7"),
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
