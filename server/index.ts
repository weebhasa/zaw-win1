import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleQuestionSets } from "./routes/question-sets";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Question sets discovery (serve JSON files placed in /public that end with "Questions.json")
  import { handleQuestionSets } from "./routes/question-sets";
  app.get("/api/question-sets", handleQuestionSets);

  return app;
}
