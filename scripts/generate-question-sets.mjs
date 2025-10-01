import fs from "fs";
import path from "path";

try {
  const cwd = process.cwd();
  const publicDir = path.resolve(cwd, "public");
  if (!fs.existsSync(publicDir)) {
    console.error(`Public directory not found at ${publicDir}`);
    process.exit(0);
  }

  const files = fs.readdirSync(publicDir);
  const sets = files
    .filter((f) => /Questions\.json$/i.test(f))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => ({
      filename,
      url: `/${encodeURI(filename)}`,
      title: filename.replace(/\.json$/i, ""),
    }));

  const outPath = path.join(publicDir, "question-sets.json");
  fs.writeFileSync(outPath, JSON.stringify(sets, null, 2));
  console.log(`Generated ${outPath} with ${sets.length} entries.`);
} catch (e) {
  console.error("Failed to generate question-sets.json:", e);
  process.exit(1);
}
