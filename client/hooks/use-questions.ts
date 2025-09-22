import { useEffect, useState } from "react";
import type { Question } from "@/components/quiz/QuestionCard";

const PAPER_URL = "https://cdn.builder.io/o/assets%2Fcd542e002c72460ba3c19abfa4b6d1f6%2Fc23fd364ba984ce0a4b4fe408f37c95e?alt=media&token=c385f910-dd60-4cd6-9503-fb5f1481f60f&apiKey=cd542e002c72460ba3c19abfa4b6d1f6";

function stripLabel(opt: string) {
  // Remove leading labels like "A:", "B:", etc.
  const m = opt.match(/^\s*[A-Da-d]\s*[:.)-]\s*(.*)$/);
  return m ? m[1].trim() : opt.trim();
}

function letterToIndex(letter: string): number {
  const ch = letter.trim().toUpperCase();
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return map[ch] ?? 0;
}

function transformPaper(paper: any[]): Question[] {
  return paper.map((item, idx) => {
    const options: string[] = Array.isArray(item.choices)
      ? item.choices.map((c: string) => stripLabel(String(c)))
      : [];
    return {
      id: idx + 1,
      type: "multiple",
      question: String(item.question ?? ""),
      options,
      correctAnswer: letterToIndex(String(item.answer ?? "A")),
      explanation: undefined,
    } satisfies Question;
  });
}

function findOptionIndex(options: string[] | undefined, label: string): number {
  if (!options) return -1;
  const target = label.trim().toLowerCase();
  return options.findIndex((o) => String(o).trim().toLowerCase() === target);
}

function applyOverrides(list: Question[]): Question[] {
  return list.map((q) => {
    const text = String(q.question || "").toLowerCase();
    if (q.type === "multiple" && text.includes("shutters") && text.includes("bottom support") && text.includes("beam")) {
      const idx = findOptionIndex(q.options, "21 days");
      if (idx >= 0) {
        return { ...q, correctAnswer: idx };
      }
    }
    return q;
  });
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        // Try external paper first
        let data: any;
        try {
          const res = await fetch(PAPER_URL, { cache: "no-store" });
          if (!res.ok) throw new Error("Failed to fetch external paper");
          data = await res.json();
        } catch {
          const resLocal = await fetch("/questions.json", { cache: "no-store" });
          if (!resLocal.ok) throw new Error(`Failed to load questions: ${resLocal.status}`);
          data = await resLocal.json();
        }

        let normalized: Question[];
        if (Array.isArray(data) && data.length && data[0]?.choices && data[0]?.answer) {
          normalized = transformPaper(data);
        } else {
          normalized = data as Question[];
        }
        normalized = applyOverrides(normalized);
        if (mounted) setQuestions(normalized);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { questions, loading, error };
}
