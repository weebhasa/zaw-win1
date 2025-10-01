import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

export const handleQuestionSets: RequestHandler = (_req, res) => {
  try {
    const publicDir = path.resolve(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) return res.json([]);
    const files = fs.readdirSync(publicDir);
    const filtered = files.filter((f) => /Questions\.json$/i.test(f));

    // Attach file mtime and sort by newest first so UI shows latest uploads first
    const withStat = filtered.map((filename) => {
      try {
        const stat = fs.statSync(path.join(publicDir, filename));
        return { filename, mtime: stat.mtimeMs };
      } catch {
        return { filename, mtime: 0 };
      }
    });

    withStat.sort((a, b) => b.mtime - a.mtime);

    const sets = withStat.map(({ filename }) => ({
      filename,
      url: `/${encodeURI(filename)}`,
      title: filename.replace(/\.json$/i, ""),
    }));

    res.json(sets);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? String(e) });
  }
};
