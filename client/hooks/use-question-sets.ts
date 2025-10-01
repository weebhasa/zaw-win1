import { useEffect, useState } from "react";

export type QuestionSet = {
  filename: string;
  url: string;
  title: string;
};

async function fetchJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

export function useQuestionSets() {
  const [sets, setSets] = useState<QuestionSet[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Try API first (works locally and on servers with Node FS access)
        let data: unknown = [];
        try {
          data = await fetchJson("/api/question-sets");
        } catch {
          data = [];
        }

        // Fallback to static manifest for static hosts (e.g., Netlify)
        if (!Array.isArray(data) || data.length === 0) {
          try {
            data = await fetchJson("/question-sets.json");
          } catch {
            data = [];
          }
        }

        if (mounted) setSets(Array.isArray(data) ? data : []);
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

  return { sets, loading, error };
}
