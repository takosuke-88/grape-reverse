const cp = require("child_process");
const fs = require("fs");
try {
  const appTsx = cp
    .execSync(
      "git show 0ea5fa5d6dacda2ad7fb09c331ae37cc094da4ca:grape-reverse_antigravity/src/App.tsx",
    )
    .toString("utf8");
  const articleTsx = cp
    .execSync(
      "git show 0ea5fa5d6dacda2ad7fb09c331ae37cc094da4ca:grape-reverse_antigravity/src/pages/columns/myjuggler5-setting6-behavior.tsx",
    )
    .toString("utf8");
  fs.writeFileSync("old_app.tsx", appTsx);
  fs.writeFileSync("recovered_article.tsx", articleTsx);
  console.log("Dumped successfully");
} catch (e) {
  console.error(e);
}
