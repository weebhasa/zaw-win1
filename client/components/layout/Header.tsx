import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">Q</span>
          <span className="bg-gradient-to-r from-primary to-fuchsia-600 bg-clip-text text-transparent">
            QuizCraft
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn("text-muted-foreground hover:text-foreground", isActive && "text-foreground")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/test?session=0"
            className={({ isActive }) =>
              cn("text-muted-foreground hover:text-foreground", isActive && "text-foreground")
            }
          >
            Test
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
