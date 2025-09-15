import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <main className="relative">
      <section className="bg-gradient-to-br from-primary/10 via-background to-fuchsia-100/40 py-16 sm:py-24">
        <div className="container max-w-4xl">
          <h1 className="text-balance bg-gradient-to-r from-primary to-fuchsia-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Online Test Platform
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Take a 100-question test featuring multiple choice, true/false, and short answer questions. Your progress is tracked as you go, and detailed results are shown at the end.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/test?session=0">Start Test</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold">How it works</h2>
            <ul className="mt-4 grid list-disc gap-3 pl-6 text-muted-foreground">
              <li>One question displayed at a time with Next/Previous navigation.</li>
              <li>A progress bar indicates how many questions you have answered.</li>
              <li>Results page shows your score, correct answers, and explanations.</li>
              <li>Restart the test anytime after submission.</li>
              <li>Fully responsive and mobile-friendly UI.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
