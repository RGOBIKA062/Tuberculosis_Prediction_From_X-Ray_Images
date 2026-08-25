import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { getScans, type ScanRecord } from "@/lib/frontend-store";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRecord[]>(getScans);

  useEffect(() => {
    const refresh = () => setScans(getScans());
    window.addEventListener("pulmoscan-scans", refresh);
    return () => window.removeEventListener("pulmoscan-scans", refresh);
  }, []);

  if (!user) {
    navigate({ to: "/auth", replace: true });
    return null;
  }

  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-micro text-primary">BROWSER STORAGE</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Scan history</h1>
            <p className="mt-2 text-muted-foreground">
              {scans.length} local demonstration {scans.length === 1 ? "record" : "records"}
            </p>
          </div>
          <Link
            to="/console"
            className="rounded-sm bg-surface-dark px-4 py-2 text-sm font-semibold text-surface-dark-foreground hover:bg-primary"
          >
            New study
          </Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
          {scans.length ? (
            scans.map((scan) => (
              <article
                key={scan.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 last:border-0"
              >
                <div>
                  <h2 className="font-bold">{scan.patientName}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scan.fileName} · {new Date(scan.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={
                      scan.verdict === "Normal"
                        ? "font-bold text-success"
                        : "font-bold text-destructive"
                    }
                  >
                    {scan.verdict}
                  </p>
                  <p className="text-xs text-muted-foreground">{scan.confidence}% confidence</p>
                </div>
              </article>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No local scans yet. Start with a new study.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
