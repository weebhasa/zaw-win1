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
    // Single letter like "A" | match by value fallback
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
  // Already normalized
  if (Array.isArray(data) && data.length && data[0]?.question && data[0]?.type) {
    return data as Question[];
  }

  // Legacy formats: array of items
  if (Array.isArray(data)) {
    return normalizeArray(data);
  }

  // Object with "questions" array and optional metadata
  if (data && Array.isArray(data.questions)) {
    return normalizeArray(data.questions);
  }

  return [];
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

        const url = sourceUrl ? sourceUrl : "/questions.json";
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            if (mounted) setQuestions([]);
            return;
          }
          throw new Error(`Failed to load questions: ${res.status}`);
        }

        const data = await res.json();
        const normalized = normalizeData(data);
        if (mounted) setQuestions(normalized);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Unknown error");
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
