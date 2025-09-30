import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuestions } from "@/hooks/use-questions";
import {
  QuestionCard,
  type Question,
  type AnswerValue,
} from "@/components/quiz/QuestionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type AnswersMap = Record<number, AnswerValue>;

function normalizeShort(a: string) {
  return a.trim().toLowerCase();
}

function isCorrect(q: Question, ans: AnswerValue): boolean {
  if (ans === undefined || ans === null) return false;
  if (q.type === "multiple") return ans === q.correctAnswer;
  if (q.type === "boolean") return ans === q.correctAnswer;
  if (q.type === "short")
    return (
      normalizeShort(String(ans)) === normalizeShort(String(q.correctAnswer))
    );
  return false;
}

export default function TestPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const rawSession = search.get("session") ?? "0";

  // Determine if session is a numeric index or a filename
  const isNumericSession = /^\d+$/.test(rawSession);
  const sessionFilename = isNumericSession ? undefined : rawSession;

  const { questions, loading, error } = useQuestions(
    sessionFilename ? `/${encodeURIComponent(sessionFilename)}` : undefined,
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const sessionIndex = Math.max(
    0,
    Number(isNumericSession ? rawSession : 0) | 0,
  );
  const totalSessions = useMemo(
    () => (questions ? Math.ceil(questions.length / 20) : 0),
    [questions],
  );

  const start = useMemo(() => {
    if (!questions) return 0;
    if (sessionFilename) return 0; // when using a file, use entire file as single session
    return sessionIndex * 20;
  }, [questions, sessionIndex, sessionFilename]);

  const session = useMemo(
    () =>
      questions
        ? questions.slice(
            start,
            start + (sessionFilename ? questions.length : 20),
          )
        : [],
    [questions, start, sessionFilename],
  );
  const total = session.length;

  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setRevealed({});
  }, [start]);

  const completed = useMemo(() => {
    return session.filter((q) => {
      const v = answers[q.id];
      return v !== undefined && v !== "";
    }).length;
  }, [answers, session]);

  const progress = total ? Math.round((completed / total) * 100) : 0;

  function handleChange(value: AnswerValue) {
    const id = session[index].id;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    const curr = session[index];
    const isRevealed = !!revealed[curr.id];
    if (!isRevealed) {
      setRevealed((r) => ({ ...r, [curr.id]: true }));
      return;
    }
    setIndex((i) => Math.min(total - 1, i + 1));
  }

  function submit() {
    if (!session.length) return;
    const details = session.map((q) => {
      const user = answers[q.id];
      return {
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: user,
        explanation: q.explanation,
        correct: isCorrect(q, user),
      };
    });
    const score = details.filter((d) => d.correct).length;
    navigate("/results", {
      state: { details, score, total, sessionIndex, totalSessions },
    });
  }

  if (loading)
    return (
      <div className="container py-24 text-center">Loading questions…</div>
    );
  if (error)
    return (
      <div className="container py-24 text-center text-destructive">
        {error}
      </div>
    );
  if (!session.length)
    return (
      <div className="container py-24 text-center">No questions available.</div>
    );

  const q = session[index];
  const answer = answers[q.id];
  const isRevealed = !!revealed[q.id];
  const isLast = index === total - 1;

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-lg font-semibold">
              {completed} / {total} answered
            </div>
          </div>
          <div className="min-w-[160px]">
            <Progress value={progress} />
          </div>
        </div>
      </div>

      <QuestionCard
        q={q}
        answer={answer}
        onChange={handleChange}
        index={index}
        total={total}
        reveal={isRevealed}
      />

      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={prev} disabled={index === 0}>
            Previous
          </Button>
          <Button onClick={next} disabled={isLast && isRevealed}>
            {isRevealed ? "Next" : "Show Answer"}
          </Button>
        </div>
        <Button variant="outline" onClick={submit}>
          Submit Test
        </Button>
      </div>
    </div>
  );
}
