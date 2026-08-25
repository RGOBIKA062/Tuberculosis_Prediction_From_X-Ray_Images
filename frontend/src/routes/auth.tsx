import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { authenticateLocalAccount, createLocalAccount, setLocalUser } from "@/lib/frontend-store";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Doctor Sign In — TB Detection AI" },
      {
        name: "description",
        content:
          "Sign in or create a clinician account to run explainable TB chest X-ray screening.",
      },
      { property: "og:title", content: "Doctor Sign In — TB Detection AI" },
      {
        property: "og:description",
        content: "Access the TB Detection AI diagnostic console.",
      },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email({ message: "Enter a valid email address" }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72);

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [hospital, setHospital] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) navigate({ to: "/", replace: true });
  }, [session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return toast.error(parsedEmail.error.issues[0]!.message);
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) return toast.error(parsedPassword.error.issues[0]!.message);

    setBusy(true);
    const account = {
      email: parsedEmail.data,
      name: fullName.trim() || parsedEmail.data.split("@")[0] || "Clinician",
      hospital: hospital.trim() || "Local demo workspace",
      password: parsedPassword.data,
    };

    if (mode === "signup") {
      if (!createLocalAccount(account)) {
        toast.error("An account with this email already exists. Please sign in.");
        setBusy(false);
        return;
      }
      setLocalUser(account);
      toast.success("Account created. You are now signed in.");
    } else {
      const user = authenticateLocalAccount(parsedEmail.data, parsedPassword.data);
      if (!user) {
        toast.error("Account not found or password is incorrect. Please create an account first.");
        setBusy(false);
        return;
      }
      setLocalUser(user);
      toast.success("Signed in successfully.");
    }
    navigate({ to: "/", replace: true });
    setBusy(false);
  }

  async function handleGoogle() {
    setBusy(true);
    setLocalUser({
      email: "demo@tbdetection.local",
      name: "Demo Clinician",
      hospital: "Local demo workspace",
    });
    toast.success("Signed in to the frontend demo.");
    navigate({ to: "/" });
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <div className="border-b border-border bg-card px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary font-bold text-primary-foreground">
            P
          </div>
          <span className="text-xl font-bold uppercase tracking-tight">TB Detection AI</span>
        </Link>
      </div>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create clinician account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the diagnostic console and your scan history.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <>
                <div>
                  <label className="label-micro mb-1 block" htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={120}
                    className="field-input focus:ring-2 focus:ring-ring"
                    placeholder="Dr. A. Kumar"
                  />
                </div>
                <div>
                  <label className="label-micro mb-1 block" htmlFor="hospital">
                    Hospital / institution
                  </label>
                  <input
                    id="hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    maxLength={160}
                    className="field-input focus:ring-2 focus:ring-ring"
                    placeholder="Government Medical College"
                  />
                </div>
              </>
            ) : null}
            <div>
              <label className="label-micro mb-1 block" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="field-input focus:ring-2 focus:ring-ring"
                placeholder="doctor@hospital.org"
              />
            </div>
            <div>
              <label className="label-micro mb-1 block" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                className="field-input focus:ring-2 focus:ring-ring"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-surface-dark py-3 text-sm font-bold tracking-wide text-surface-dark-foreground transition-colors hover:bg-primary disabled:opacity-60"
            >
              {busy ? "PLEASE WAIT…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full rounded-sm border border-border py-3 text-sm font-semibold transition-colors hover:bg-background disabled:opacity-60"
          >
            Continue with Google
          </button>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-sm text-primary hover:underline"
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already registered? Sign in instead"}
          </button>
        </div>
      </main>
    </div>
  );
}
