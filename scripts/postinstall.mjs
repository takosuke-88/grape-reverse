// Vercel(Amazon Linuxベースのビルドコンテナ)では、Playwright標準の
// Chromiumバイナリが依存する共有ライブラリ(libnspr4.so等)が存在せず
// 起動に失敗する。Vercelビルド時はscripts/generate-seo-shells.mjs側で
// @sparticuz/chromium（サーバーレス環境向けの自己完結ビルド）を使うため、
// ここでは通常のPlaywright Chromiumダウンロードをスキップする。
// ローカル開発（Windows/macOS等）では従来通りダウンロードする。
import { execSync } from "child_process";

if (process.env.VERCEL) {
  console.log(
    "ℹ️ Vercelビルド環境のため、Playwright Chromiumのダウンロードをスキップします（@sparticuz/chromiumを使用）。",
  );
} else {
  console.log("⬇️ ローカル開発用にPlaywright Chromiumをダウンロードします…");
  execSync("npx playwright install chromium", { stdio: "inherit" });
}
