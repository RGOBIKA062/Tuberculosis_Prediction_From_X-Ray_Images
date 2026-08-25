import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { clearLocalUser } from "@/lib/frontend-store";
import { useSession } from "@/hooks/use-session";

export function SiteHeader() {
  const { session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearLocalUser();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black px-6 py-3 text-white">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary font-bold text-primary-foreground">
          P
        </div>
        <span className="text-xl font-bold uppercase tracking-tight">TB Detection AI</span>
      </Link>
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link to="/" className="hidden transition-colors hover:text-primary md:inline">
          Home
        </Link>
        <Link to="/about" className="hidden transition-colors hover:text-primary md:inline">
          About
        </Link>
        {session ? (
          <>
            <Link to="/console" className="hidden transition-colors hover:text-primary md:inline">
              Console
            </Link>
            <Link to="/history" className="hidden transition-colors hover:text-primary md:inline">
              History
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-sm bg-surface-dark px-5 py-2 text-surface-dark-foreground transition-all hover:bg-primary"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="rounded-sm bg-surface-dark px-5 py-2 text-surface-dark-foreground transition-all hover:bg-primary"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
