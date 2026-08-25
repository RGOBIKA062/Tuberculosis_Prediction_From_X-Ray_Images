import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { analyzeLocally, saveScan, type ScanRecord } from "@/lib/frontend-store";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/console")({ component: ConsolePage });

function ConsolePage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Unspecified");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<ScanRecord | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    navigate({ to: "/auth", replace: true });
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !patientName.trim()) {
      toast.error("Add a patient name and chest X-ray image first.");
      return;
    }
    setBusy(true);
    try {
      const imageDataUrl = await readImageDataUrl(file);
      const analysis = await analyzeLocally();
      const scan: ScanRecord = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        patientName: patientName.trim(),
        age,
        gender,
        symptoms: symptoms.trim(),
        fileName: file.name,
        imageDataUrl,
        createdAt: new Date().toISOString(),
        ...analysis,
      };
      saveScan(scan);
      setResult(scan);
      toast.success("Frontend demonstration analysis complete.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-micro text-primary">LOCAL WORKSPACE</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">New chest X-ray study</h1>
            <p className="mt-2 text-muted-foreground">
              Upload a study and create a browser-only demonstration report.
            </p>
          </div>
          <Link
            to="/history"
            className="rounded-sm border border-border px-4 py-2 text-sm font-semibold hover:bg-card"
          >
            View history
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold">Patient details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="label-micro">Patient name</span>
                <input
                  className="field-input mt-1"
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                  placeholder="Patient name"
                />
              </label>
              <label>
                <span className="label-micro">Age</span>
                <input
                  className="field-input mt-1"
                  type="number"
                  min="0"
                  max="130"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="Age"
                />
              </label>
              <label>
                <span className="label-micro">Gender</span>
                <select
                  className="field-input mt-1"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option>Unspecified</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="label-micro">Symptoms</span>
                <textarea
                  className="field-input mt-1 min-h-24"
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  placeholder="Cough, fever, weight loss..."
                />
              </label>
            </div>
            <label className="mt-6 block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary">
              <span className="text-sm font-semibold">
                {file ? file.name : "Choose a chest X-ray image"}
              </span>
              <span className="mt-2 block text-xs text-muted-foreground">PNG, JPG or WEBP</span>
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-sm bg-surface-dark py-3 text-sm font-bold text-surface-dark-foreground hover:bg-primary disabled:opacity-60"
            >
              {busy ? "ANALYSING..." : "RUN DEMO ANALYSIS"}
            </button>
          </form>

          <section className="rounded-xl border border-border bg-viewer p-6 text-white">
            <p className="label-micro text-accent">RESULT PANEL</p>
            {result ? (
              <div className="mt-8">
                <div className="text-5xl font-extrabold text-success">{result.verdict}</div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60">TB probability</p>
                    <p className="mt-1 text-2xl font-bold">{result.probability}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Confidence</p>
                    <p className="mt-1 text-2xl font-bold">{result.confidence}%</p>
                  </div>
                </div>
                <AttentionOverlay scan={result} />
                <p className="mt-8 text-sm leading-relaxed text-white/80">{result.findings}</p>
                <p className="mt-6 border-l-2 border-accent pl-4 text-sm text-white/80">
                  {result.recommendation}
                </p>
              </div>
            ) : (
              <div className="mt-16 text-center text-white/60">
                <div className="text-6xl">+</div>
                <p className="mt-4 text-sm">Your explainable result will appear here.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function readImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The X-ray image could not be read."));
    reader.readAsDataURL(file);
  });
}

function AttentionOverlay({ scan }: { scan: ScanRecord }) {
  const { x, y, width, height } = scan.regionBox;
  const hasRegion = scan.verdict === "Tuberculosis" && width > 0 && height > 0;

  return (
    <div className="relative mt-6 overflow-hidden rounded-lg border border-white/15 bg-black">
      <img src={scan.imageDataUrl} alt="Analysed chest X-ray" className="block h-auto w-full" />
      {hasRegion ? (
        <div
          className="pointer-events-none absolute rounded-[50%] border-2 border-red-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${width}%`,
            height: `${height}%`,
            background:
              "radial-gradient(ellipse at center, rgba(255,35,35,0.58), rgba(255,142,0,0.32) 45%, rgba(255,220,0,0.08) 72%, transparent 100%)",
            boxShadow: "0 0 28px 10px rgba(255, 60, 20, 0.28)",
          }}
        />
      ) : null}
      <div className="absolute bottom-3 left-3 rounded-sm bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/85">
        Grad-CAM++ attention
      </div>
    </div>
  );
}
