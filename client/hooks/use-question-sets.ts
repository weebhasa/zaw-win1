import { useEffect, useState } from "react";

export type QuestionSet = {
  filename: string;
  url: string;
  title: string;
};

export function useQuestionSets() {
  const [sets, setSets] = useState<QuestionSet[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/question-sets", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch question sets: ${res.status}`);
        const data = await res.json();
        if (mounted) setSets(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { sets, loading, error };
}
