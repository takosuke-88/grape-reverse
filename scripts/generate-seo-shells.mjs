// ビルド後の各ルートをヘッドレスブラウザでレンダリングし、
// クライアントJS実行後のDOM（正しい<title>/<meta description>/<h1>/本文を含む）を
// 静的HTMLシェルとして dist/ 配下に書き出す。
//
// 目的: 本サイトは完全CSRのSPAで、index.html は全ルート共通の静的meta情報しか
// 持たない。JSを実行しないSEOクローラーにはどのURLも同一の空HTMLに見えるため、
// ビルド成果物側にルートごとの完成形HTMLを追加で用意する（Reactロジックは無変更）。
import { chromium } from "playwright-core";
import { preview } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.resolve(ROOT_DIR, "dist");
const MACHINE_LIST_PATH = path.resolve(ROOT_DIR, "src/data/machine-list.ts");
const COLUMNS_CONTENT_DIR = path.resolve(ROOT_DIR, "src/content/columns");

const PREVIEW_PORT = 4321;
// networkidle は遅延読み込み・アニメーション等で解決しないケースがあるため使わない。
// domcontentloaded + 固定ウェイトで、React本体とSeo.tsxのuseEffectの実行を待つ。
const POST_LOAD_WAIT_MS = 1200;

// AdSense実行後DOMを示す固有文字列。標準スクリプトタグ
// (pagead/js/adsbygoogle.js) 自体はこれに該当しない。
const AD_DOM_MARKERS = [
  "adsbygoogle-noablate",
  "data-adsbygoogle-status",
  "data-ad-status=",
  "aswift_",
  "google_esf",
  "show_ads_impl.js",
  "data-checked-head=",
  '<ins class="adsbygoogle"',
  "recaptcha/api2/aframe",
];

function extractIdsFromFile(filePath, regex) {
  const content = fs.readFileSync(filePath, "utf-8");
  const ids = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) ids.push(match[1]);
  }
  return ids;
}

function getMachineIds() {
  return extractIdsFromFile(MACHINE_LIST_PATH, /id:\s*["']([^"']+)["']/g);
}

function getColumnSlugs() {
  const frontmatterBlockRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  return fs
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
}

function buildRouteList() {
  const machineIds = getMachineIds();
  const columnSlugs = getColumnSlugs();
  const routes = ["/"];
  machineIds.forEach((id) => {
    routes.push(`/${id}`);
    routes.push(`/${id}/grape`);
    routes.push(`/${id}/specs`);
  });
  routes.push("/columns");
  columnSlugs.forEach((slug) => routes.push(`/columns/${slug}`));
  return routes;
}

function routeToOutputPath(route) {
  if (route === "/") return path.join(DIST_DIR, "index.html");
  return path.join(DIST_DIR, route.replace(/^\//, ""), "index.html");
}

async function main() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    console.error(
      "❌ dist/index.html が見つかりません。先に `vite build` を実行してください。",
    );
    process.exit(1);
  }

  const routes = buildRouteList();
  console.log(`🔍 ${routes.length} ルートをプリレンダリングします`);

  const server = await preview({
    root: ROOT_DIR,
    preview: { port: PREVIEW_PORT, strictPort: true },
  });
  const baseUrl = `http://localhost:${PREVIEW_PORT}`;

  // Vercelのビルドコンテナ（Amazon Linux、root権限なし）には
  // Playwright標準Chromiumが必要とする共有ライブラリ（libnspr4.so等）が無く
  // 起動に失敗するため、サーバーレス環境向けの自己完結ビルドである
  // @sparticuz/chromium に切り替える。ローカル開発では
  // `playwright install chromium` でダウンロードした標準Chromiumを使う。
  let launchOptions = {};
  if (process.env.VERCEL) {
    const { default: sparticuzChromium } = await import(
      "@sparticuz/chromium"
    );
    launchOptions = {
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    };
  }

  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  // page.content() はライブDOMをシリアライズするため、プリレンダリング中に
  // Auto adsが実行されると広告DOMが静的HTMLへ混入する。ビルド時のブラウザ内だけで
  // 遮断し、本番の閲覧者ブラウザは index.html の標準スクリプトから初回実行する。
  await page.route(
    /googlesyndication\.com|doubleclick\.net|googletagservices\.com|adservice\.google\./,
    (route) => route.abort(),
  );

  // 全ルートの出力をメモリ上に集めてから最後に一括で書き込む。
  // 途中で dist/index.html を上書きすると、SPAフォールバックで配信されている
  // 未処理ルートの検証結果が壊れるため。
  const results = [];
  const errors = [];

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(POST_LOAD_WAIT_MS);
      const html = await page.content();

      const adHits = AD_DOM_MARKERS.filter((marker) => html.includes(marker));
      if (adHits.length > 0) {
        throw new Error(
          `AdSense実行後DOMが混入しています（${url}）: ${adHits.join(", ")}`,
        );
      }

      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const descMatch = html.match(
        /<meta\s+name="description"\s+content="([^"]*)"/,
      );

      if (!titleMatch || !titleMatch[1].trim()) {
        throw new Error("<title>が空です");
      }
      if (!h1Match || !h1Match[1].replace(/<[^>]+>/g, "").trim()) {
        throw new Error("<h1>が存在しないか空です");
      }
      if (!descMatch || !descMatch[1].trim()) {
        throw new Error("meta descriptionが空です");
      }

      results.push({ route, html, title: titleMatch[1] });
      console.log(`  ✅ ${route} — ${titleMatch[1]}`);
    } catch (err) {
      errors.push({ route, message: err.message });
      console.error(`  ❌ ${route}: ${err.message}`);
    }
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  if (errors.length > 0) {
    console.error(
      `\n❌ ${errors.length}/${routes.length} ルートのプリレンダリングに失敗しました。書き込みを中止します。`,
    );
    errors.forEach((e) => console.error(`   - ${e.route}: ${e.message}`));
    process.exit(1);
  }

  for (const { route, html } of results) {
    const outPath = routeToOutputPath(route);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, "utf-8");
  }

  console.log(
    `\n🎉 ${results.length}/${routes.length} ページのプリレンダリングが完了しました。`,
  );
}

main().catch((err) => {
  console.error("❌ SEOシェル生成中に致命的なエラーが発生しました:", err);
  process.exit(1);
});
