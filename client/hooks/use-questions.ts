import { useEffect, useState } from "react";
import type { Question } from "@/components/quiz/QuestionCard";

function stripLabel(opt: string) {
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

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/questions.json", { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            if (mounted) setQuestions([]);
            return;
          }
          throw new Error(`Failed to load questions: ${res.status}`);
        }

        const data = await res.json();
        let normalized: Question[] = [];
        if (Array.isArray(data)) {
          if (data.length && data[0]?.choices && data[0]?.answer) {
            normalized = transformPaper(data);
          } else {
            normalized = data as Question[];
          }
        }
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
  }, []);

  return { questions, loading, error };
}
