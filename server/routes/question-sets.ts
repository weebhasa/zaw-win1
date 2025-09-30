import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

export const handleQuestionSets: RequestHandler = (_req, res) => {
  try {
    const publicDir = path.resolve(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) return res.json([]);
    const files = fs.readdirSync(publicDir);
    const sets = files
      .filter((f) => /Questions\.json$/i.test(f))
      .map((filename) => ({
        filename,
        url: `/${encodeURI(filename)}`,
        title: filename.replace(/\.json$/i, ""),
      }));
    res.json(sets);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? String(e) });
  }
};
