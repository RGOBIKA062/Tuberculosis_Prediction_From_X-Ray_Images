import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import heroImage from "@/assets/hero-ribcage.jpg";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TB Detection AI — Explainable TB Detection from Chest X-rays" },
      {
        name: "description",
        content:
          "Upload a chest X-ray, add patient details, and get an explainable tuberculosis screening result with the affected lung region highlighted.",
      },
      { property: "og:title", content: "TB Detection AI — Explainable TB Detection" },
      {
        property: "og:description",
        content:
          "AI-assisted tuberculosis screening with lung region localization for radiologists and clinicians.",
      },
    ],
  }),
  component: Index,
});

const pipeline = [
  {
    step: "01",
    title: "Patient record",
    body: "Capture name, age, gender and presenting symptoms alongside the study.",
  },
  {
    step: "02",
    title: "Lung-focused analysis",
    body: "The model reads the lung fields and ignores irrelevant regions of the film.",
  },
  {
    step: "03",
    title: "Localized explanation",
    body: "The suspicious region is boxed on the image with findings you can review.",
  },
];

import { useEffect } from "react";

function Index() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate({ to: "/auth", replace: true });
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />

      <header className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-14 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            CLINICAL DECISION SUPPORT
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tighter md:text-6xl">
            Explainable AI for <br />
            <span className="text-primary">TB Detection.</span>
          </h1>
          <p className="mb-10 max-w-lg text-lg text-muted-foreground">
            Chest X-ray screening that tells you not only whether tuberculosis is present, but
            exactly where in the lungs the evidence sits.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/console"
              className="rounded-sm bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-clinical transition-all hover:-translate-y-0.5"
            >
              Start Diagnosis
            </Link>
            <Link
              to="/about"
              className="rounded-sm border border-border px-8 py-4 font-semibold transition-all hover:bg-card"
            >
              How it works
            </Link>
          </div>
        </div>
        <img
          src={heroImage}
          alt="Translucent 3D rendering of a human ribcage and lungs with neural network data points"
          width={1200}
          height={1200}
          className="w-full rounded-2xl border border-border bg-card"
        />
      </header>

      <section className="border-y border-border bg-card/35 py-24 backdrop-blur-[2px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Diagnostic pipeline</h2>
              <p className="text-muted-foreground">From patient submission to localized findings</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {pipeline.map((item) => (
              <div key={item.step} className="rounded-xl border border-border bg-background/60 p-6">
                <div className="font-mono text-2xl font-bold text-primary">{item.step}</div>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Comprehensive Detection Capabilities</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Our advanced AI model goes beyond basic detection to identify specific patterns of Tuberculosis, helping clinicians determine the most appropriate treatment pathways.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* TB DS Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                  TB DS
                </div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight">Drug-Susceptible TB</h3>
                <p className="mb-6 text-muted-foreground leading-relaxed">
                  Tuberculosis Drug-Susceptible (TB DS) refers to TB bacteria that respond to standard first-line anti-TB medications. Early and accurate detection of TB DS is crucial for initiating standard, highly effective treatment protocols.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</div>
                    Responsive to standard medications (Isoniazid, Rifampicin)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</div>
                    Higher treatment success rate with standard protocols
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</div>
                    Classic radiographic patterns accurately identified
                  </li>
                </ul>
              </div>
            </div>
            
            {/* TB DR Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
                  TB DR
                </div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight">Drug-Resistant TB</h3>
                <p className="mb-6 text-muted-foreground leading-relaxed">
                  Tuberculosis Drug-Resistant (TB DR) indicates that the bacteria do not respond to at least one primary first-line drug. Identifying markers associated with MDR or XDR TB helps prioritize patients for rapid molecular testing and intensive care.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive">!</div>
                    Resistant to core drugs (MDR-TB / XDR-TB)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive">!</div>
                    Requires specialized, prolonged intensive treatment
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive">!</div>
                    Flags high-risk atypical radiographic presentations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
