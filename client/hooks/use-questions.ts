import { useEffect, useState } from "react";
import type { Question } from "@/components/quiz/QuestionCard";

function stripLabel(opt: string) {
  const m = opt.match(/^\s*[A-Fa-f]\s*[:.)-]\s*(.*)$/);
  return m ? m[1].trim() : opt.trim();
}

function letterToIndex(letter: string): number {
  const ch = letter.trim().toUpperCase();
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
  return map[ch] ?? 0;
}

function toOptionsArray(options: any): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options.map((c) => stripLabel(String(c)));
  if (typeof options === "object") {
    const order = ["A", "B", "C", "D", "E", "F"];
    return order
      .map((k) => options[k])
      .filter((v) => v !== undefined && v !== null)
      .map((v) => stripLabel(String(v)));
  }
  return [];
}

function toCorrectIndex(item: any, opts: string[]): number {
  const raw = item.correctAnswer ?? item.answer;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const letterMatch = raw.trim().match(/^[A-Fa-f]$/);
    if (letterMatch) return letterToIndex(raw);
    const idx = opts.findIndex(
      (o) => o.trim().toLowerCase() === raw.trim().toLowerCase(),
    );
    return idx >= 0 ? idx : 0;
  }
  return 0;
}

function normalizeArray(arr: any[]): Question[] {
  return arr.map((item, idx) => {
    const options = toOptionsArray(item.choices ?? item.options);
    const id = typeof item.id === "number" ? item.id : idx + 1;
    return {
      id,
      type: (item.type as Question["type"]) ?? "multiple",
      question: String(item.question ?? ""),
      options,
      correctAnswer: toCorrectIndex(item, options),
      explanation: item.explanation ? String(item.explanation) : undefined,
    } satisfies Question;
  });
}

function normalizeData(data: any): Question[] {
  // Already normalized (array of Question-like objects)
  if (Array.isArray(data) && data.length && data[0]?.question && data[0]?.type) {
    return data as Question[];
  }

  // Object with "questions" array and optional metadata
  if (data && Array.isArray(data.questions)) {
    return normalizeArray(data.questions);
  }

  // Legacy array of items without explicit type
  if (Array.isArray(data)) {
    return normalizeArray(data);
  }

  return [];
}

async function safeFetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<")) {
    // Likely HTML (index.html) returned instead of JSON
    throw new Error(`Non-JSON response from ${url}`);
  }
  try {
    return JSON.parse(text);
  } catch (e: any) {
    throw new Error(`Invalid JSON from ${url}: ${e?.message ?? String(e)}`);
  }
}

export function useQuestions(sourceUrl?: string) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // If a specific source URL is provided, fetch that single file
        if (sourceUrl) {
          try {
            const data = await safeFetchJson(sourceUrl);
            const normalized = normalizeData(data);
            if (mounted) setQuestions(normalized);
          } catch (e: any) {
            if (mounted) setError(e?.message ?? String(e));
          }
          return;
        }

        // No specific source: discover all sets and aggregate their questions
        try {
          const sets = await safeFetchJson("/api/question-sets");
          if (!Array.isArray(sets) || sets.length === 0) {
            // Fallback: try /questions.json (legacy)
            try {
              const data = await safeFetchJson("/questions.json");
              const normalized = normalizeData(data);
              if (mounted) setQuestions(normalized);
            } catch (e: any) {
              // No questions found
              if (mounted) setQuestions([]);
            }
            return;
          }

          const all: Question[] = [];
          for (const s of sets) {
            try {
              const data = await safeFetchJson(s.url ?? s.filename ?? s);
              const normalized = normalizeData(data);
              all.push(...normalized);
            } catch (e) {
              // Skip individual set failures but continue processing others
              // eslint-disable-next-line no-console
              console.warn("Skipping set", s, e);
            }
          }

          if (mounted) setQuestions(all);
        } catch (e: any) {
          if (mounted) setError(e?.message ?? String(e));
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sourceUrl]);

  return { questions, loading, error };
}
