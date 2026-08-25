import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TB Detection AI — Explainable TB Screening" },
      {
        name: "description",
        content:
          "Why lung-focused analysis and visual explanation matter for AI-assisted tuberculosis detection on chest X-rays.",
      },
      { property: "og:title", content: "About TB Detection AI" },
      {
        property: "og:description",
        content:
          "Lung segmentation plus visual explanation for interpretable tuberculosis screening.",
      },
    ],
  }),
  component: About,
});

const problems = [
  "Tuberculosis remains a major global health challenge requiring early and accurate diagnosis.",
  "Manual chest X-ray interpretation is time-consuming and depends on experienced radiologists.",
  "Existing automated TB classifiers analyse the entire film, including regions irrelevant to the lungs.",
  "Explanations that only rank pixels rarely show enough of the model's internal decision process.",
];

function About() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-extrabold tracking-tighter md:text-5xl">
          Why an explainable TB framework
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          TB Detection AI was built around one requirement: a clinician should be able to see why
          the model reached its conclusion, not just read a label.
        </p>

        <section className="mt-14 rounded-xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            The problem
          </h2>
          <ul className="mt-6 space-y-4">
            {problems.map((item) => (
              <li key={item} className="flex gap-4 border-b border-border pb-4 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-xl border border-border bg-card p-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Our approach
          </h2>
          <p className="mt-4 text-sm leading-relaxed">
            Each study is read with attention restricted to the lung fields, so the verdict is
            driven by pulmonary evidence rather than markers, collars or image borders. The result
            is returned with a TB probability, a confidence score, the named affected lobe, and a
            highlighted region drawn directly on the X-ray, together with a short description of the
            radiological signs and a recommended next step.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Every scan is stored against the doctor's own account with the patient record, so cases
            can be reviewed and compared later.
          </p>
        </section>

        <p className="mt-10 rounded-sm border-l-4 border-destructive bg-destructive/5 p-4 text-sm">
          TB Detection AI is a screening aid. It does not replace radiological interpretation,
          microbiological confirmation, or clinical judgement.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
