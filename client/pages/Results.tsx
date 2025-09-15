import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const state = location.state as
    | {
        details: any[];
        score: number;
        total: number;
        sessionIndex?: number;
        totalSessions?: number;
      }
    | undefined;

  if (!state) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-semibold">No results to show</h1>
        <p className="mt-2 text-muted-foreground">
          Please take the test first.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate("/test?session=0")}>
            Start Test
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Home
          </Button>
        </div>
      </div>
    );
  }

  const { details, score, total, sessionIndex = 0, totalSessions = 1 } = state;
  const percent = Math.round((score / total) * 100);
  const hasNext = sessionIndex < totalSessions - 1;

  return (
    <div className="container max-w-4xl py-8">
      <div className="rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-bold">Your Results</h1>
        <p className="mt-1 text-muted-foreground">
          Score: {score} / {total} ({percent}%)
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={() =>
              navigate(
                `/test?session=${hasNext ? sessionIndex + 1 : sessionIndex}`,
              )
            }
          >
            {hasNext ? "Next Session" : "Restart Test"}
          </Button>
          {hasNext && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/test?session=${sessionIndex}`)}
            >
              Restart
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {details.map((d) => {
          const correct = d.correct as boolean;
          return (
            <div key={d.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium">{d.question}</h2>
                <span
                  className={correct ? "text-emerald-600" : "text-destructive"}
                >
                  {correct ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <div className="grid gap-1">
                  {d.type !== "short" && d.options && (
                    <div className="text-xs">
                      Options: {d.options.join(", ")}
                    </div>
                  )}
                  <div>
                    Correct answer:{" "}
                    <span className="font-medium">
                      {formatAnswer(d.type, d.correctAnswer, d.options)}
                    </span>
                  </div>
                  <div>
                    Your answer:{" "}
                    <span className="font-medium">
                      {formatAnswer(d.type, d.userAnswer, d.options)}
                    </span>
                  </div>
                </div>
                {d.explanation && (
                  <div className="mt-2 text-foreground">
                    Explanation: {d.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

function formatAnswer(type: string, value: any, options?: string[]) {
  if (value === undefined || value === null || value === "") return "—";
  if (type === "multiple") {
    if (typeof value === "number" && options)
      return options[value] ?? String(value);
    return String(value);
  }
  if (type === "boolean") return value ? "True" : "False";
  return String(value);
}
