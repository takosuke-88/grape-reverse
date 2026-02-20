const fs = require("fs");
try {
  const content = fs.readFileSync("all_articles_history.patch", "utf8");
  const lines = content.split("\n");
  const results = [];
  let currentCommit = "";
  let currentFile = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("commit ")) {
      currentCommit = line.substring(0, 14); // truncated commit
    } else if (line.startsWith("diff --git ")) {
      currentFile = line;
    } else if (
      line.includes("記事") ||
      line.includes("blog") ||
      line.includes("ブログ") ||
      line.includes("article")
    ) {
      if (line.startsWith("-") || line.startsWith("+")) {
        results.push({
          commit: currentCommit,
          file: currentFile,
          content: line.trim(),
        });
      }
    }
  }
  fs.writeFileSync("search_results.json", JSON.stringify(results, null, 2));
  console.log("Found " + results.length + " results.");
} catch (e) {
  console.error(e);
}
