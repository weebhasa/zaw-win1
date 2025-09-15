import { useId } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type Question = {
  id: number;
  type: "multiple" | "boolean" | "short";
  question: string;
  options?: string[];
  correctAnswer: number | boolean | string;
  explanation?: string;
};

export type AnswerValue = number | boolean | string | undefined;

export function QuestionCard({
  q,
  answer,
  onChange,
  index,
  total,
  reveal = false,
}: {
  q: Question;
  answer: AnswerValue;
  onChange: (value: AnswerValue) => void;
  index: number;
  total: number;
  reveal?: boolean;
}) {
  const baseId = useId();

  const isAnswerCorrect = (() => {
    if (answer === undefined || answer === "") return false;
    if (q.type === "multiple" || q.type === "boolean") return answer === q.correctAnswer;
    if (q.type === "short") return String(answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    return false;
  })();

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
          Question {index + 1} of {total}
        </div>
        <h2 className="text-xl font-semibold leading-snug">{q.question}</h2>
      </div>
      <div className="p-6 pt-0">
        {q.type === "multiple" && (
          <div className="space-y-3">
            {q.options?.map((opt, i) => {
              const id = `${baseId}-${i}`;
              const isSelected = answer === i;
              const isCorrect = q.correctAnswer === i;
              const revealedClass = reveal
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-50"
                  : isSelected
                  ? "border-destructive bg-destructive/10"
                  : "opacity-80"
                : isSelected
                ? "border-primary bg-primary/5"
                : "hover:bg-accent";
              return (
                <label
                  key={i}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    revealedClass
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`q-${q.id}`}
                    className="h-4 w-4 accent-primary"
                    checked={answer === i}
                    onChange={() => onChange(i)}
                    disabled={reveal}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {q.type === "boolean" && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            {[true, false].map((val) => {
              const id = `${baseId}-${val}`;
              const isSelected = answer === val;
              const isCorrect = q.correctAnswer === val;
              const revealedClass = reveal
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-50"
                  : isSelected
                  ? "border-destructive bg-destructive/10"
                  : "opacity-80"
                : isSelected
                ? "border-primary bg-primary/5"
                : "hover:bg-accent";
              return (
                <label
                  key={String(val)}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                    revealedClass
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`q-${q.id}`}
                    className="h-4 w-4 accent-primary"
                    checked={answer === val}
                    onChange={() => onChange(val)}
                    disabled={reveal}
                  />
                  {val ? "True" : "False"}
                </label>
              );
            })}
          </div>
        )}

        {q.type === "short" && (
          <div className="sm:max-w-md">
            <Input
              value={typeof answer === "string" ? answer : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your answer"
              disabled={reveal}
            />
          </div>
        )}

        {reveal && (
          <div className={cn("mt-4 rounded-lg border p-3 text-sm", isAnswerCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-destructive bg-destructive/10 text-destructive") }>
            <div className="font-medium">{isAnswerCorrect ? "Correct" : "Incorrect"}</div>
            {!isAnswerCorrect && (
              <div className="mt-1 text-foreground">
                Correct answer: {formatAnswer(q)}
              </div>
            )}
            {q.explanation && (
              <div className="mt-2 text-foreground">{q.explanation}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatAnswer(q: Question) {
  if (q.type === "multiple") {
    const idx = Number(q.correctAnswer);
    return q.options?.[idx] ?? String(q.correctAnswer);
  }
  if (q.type === "boolean") return q.correctAnswer ? "True" : "False";
  return String(q.correctAnswer);
}
