import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuestions } from "@/hooks/use-questions";
import { useQuestionSets } from "@/hooks/use-question-sets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";

import { useEffect, useMemo, useState } from "react";

export default function Index() {
  const { questions, loading } = useQuestions();
  const { sets, loading: setsLoading } = useQuestionSets();

  const totalSessions = useMemo(() => {
    const count = questions ? Math.ceil(questions.length / 20) : 1;
    return Math.max(1, count);
  }, [questions]);

  // Group sets by base title
  const groups = useMemo(() => {
    if (!sets) return [] as { base: string; items: typeof sets }[];
    const map = new Map<string, typeof sets>();
    for (const s of sets) {
      const m = s.title.match(/^(.*)\bPart\b\s*\d+/i);
      const base = m ? m[1].trim() : s.title;
      if (!map.has(base)) map.set(base, [] as typeof sets);
      map.get(base)!.push(s);
    }
    return Array.from(map.entries()).map(([base, items]) => ({ base, items }));
  }, [sets]);

  const [selectedBase, setSelectedBase] = useState<string>("\0");
  const [selectedPart, setSelectedPart] = useState<string>("");

  // Initialize selection when groups load
  useEffect(() => {
    if (!groups || groups.length === 0) return;
    const first = groups[0];
    setSelectedBase(first.base);
    setSelectedPart(first.items[0]?.filename ?? "");
  }, [groups]);

  const isLoading = loading || setsLoading;

  const currentGroup = useMemo(() => groups.find((g) => g.base === selectedBase) ?? null, [groups, selectedBase]);

  const startSessionFilename = selectedPart || (currentGroup?.items?.[0]?.filename ?? "0");

  return (
    <main className="relative">
      <section className="bg-gradient-to-br from-primary/10 via-background to-fuchsia-100/40 py-16 sm:py-24">
        <div className="container max-w-4xl">
          <h1 className="text-balance bg-gradient-to-r from-primary to-fuchsia-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Online Test Platform
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Take a 100-question test featuring multiple choice, true/false, and
            short answer questions. Your progress is tracked as you go, and
            detailed results are shown at the end.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <div className="w-full sm:w-64">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Choose session
              </label>
              <Select
                value={session}
                onValueChange={setSession}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sets && sets.length > 0 ? (
                    (() => {
                      // Group sets by base title (e.g., "Question for G+1 and G+4") when parts exist
                      const map = new Map<string, typeof sets>();
                      for (const s of sets) {
                        const m = s.title.match(/^(.*)\bPart\b\s*\d+/i);
                        const base = m ? m[1].trim() : s.title;
                        if (!map.has(base)) map.set(base, [] as typeof sets);
                        map.get(base)!.push(s);
                      }

                      const out: React.ReactNode[] = [];
                      for (const [base, items] of map) {
                        if (items.length === 1) {
                          out.push(
                            <SelectItem key={items[0].filename} value={items[0].filename}>
                              {items[0].title}
                            </SelectItem>,
                          );
                        } else {
                          out.push(
                            <SelectGroup key={`group-${base}`}>
                              <SelectLabel>{base}</SelectLabel>
                              {items.map((it) => (
                                <SelectItem key={it.filename} value={it.filename}>
                                  {it.title}
                                </SelectItem>
                              ))}
                            </SelectGroup>,
                          );
                        }
                      }
                      return out;
                    })()
                  ) : (
                    Array.from({ length: totalSessions }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        Session {i + 1}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button asChild size="lg" className="w-full sm:w-64">
              <Link to={`/test?session=${encodeURIComponent(session)}`}>
                Start Test
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold">How it works</h2>
            <ul className="mt-4 grid list-disc gap-3 pl-6 text-muted-foreground">
              <li>
                One question displayed at a time with Next/Previous navigation.
              </li>
              <li>
                A progress bar indicates how many questions you have answered.
              </li>
              <li>
                Results page shows your score, correct answers, and
                explanations.
              </li>
              <li>Restart the test anytime after submission.</li>
              <li>Fully responsive and mobile-friendly UI.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
