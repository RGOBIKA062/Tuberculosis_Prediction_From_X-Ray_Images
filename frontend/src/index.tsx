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

function Index() {
  const { session } = useSession();
  const navigate = useNavigate();

  if (!session) {
    navigate({ to: "/auth", replace: true });
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

      <SiteFooter />
    </div>
  );
}
