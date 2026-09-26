import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { analyzeWithBackend, saveScan, type ScanRecord } from "@/lib/frontend-store";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/console")({ component: ConsolePage });

function ConsolePage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState(() => "PT-" + crypto.randomUUID().split("-")[0].toUpperCase());
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Unspecified");
  
  const [geneInput, setGeneInput] = useState("");
  const [mutationInput, setMutationInput] = useState("");
  const [mutations, setMutations] = useState<{ gene: string; mutation: string }[]>([]);

  const [result, setResult] = useState<ScanRecord | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  function addMutation() {
    if (!geneInput.trim() || !mutationInput.trim()) return;
    setMutations([...mutations, { gene: geneInput.trim(), mutation: mutationInput.trim() }]);
    setGeneInput("");
    setMutationInput("");
  }

  function removeMutation(index: number) {
    setMutations(mutations.filter((_, i) => i !== index));
  }

  function downloadReport() {
    if (!result) return;
    
    const mutationsHtml = mutations.length > 0 
      ? `<table border="1" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
          <tr><th style="padding: 8px; text-align: left;">Gene</th><th style="padding: 8px; text-align: left;">Mutation</th></tr>
          ${mutations.map(m => `<tr><td style="padding: 8px;">${m.gene}</td><td style="padding: 8px;">${m.mutation}</td></tr>`).join('')}
         </table>`
      : "<p>No genomic mutations provided.</p>";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Multimodal Tuberculosis Analysis Report - ${result.patientName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { color: #000; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .grid { display: flex; gap: 20px; }
          .grid > div { flex: 1; }
          .card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f9f9f9; }
          img { max-width: 100%; border-radius: 4px; border: 1px solid #ddd; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .verdict { font-size: 24px; font-weight: bold; color: ${result.verdict.includes('Resistant') ? '#d32f2f' : '#2e7d32'}; }
        </style>
      </head>
      <body>
        <h1>Multimodal Tuberculosis Analysis Report</h1>
        <p><strong>Date:</strong> ${new Date(result.createdAt).toLocaleString()}</p>
        <p><strong>Report ID:</strong> ${result.id}</p>

        <div class="grid">
          <div class="card">
            <h2>Patient Information</h2>
            <p><strong>Patient ID:</strong> ${result.patientName}</p>
            <p><strong>Age:</strong> ${result.age || 'Unspecified'}</p>
            <p><strong>Sex:</strong> ${result.gender}</p>
          </div>
          <div class="card">
            <h2>Genomic Information</h2>
            ${mutationsHtml}
          </div>
        </div>

        <h2>Analysis Results</h2>
        <div class="card">
          <p><strong>Final Fusion Prediction:</strong> <span class="verdict">${result.verdict}</span></p>
          <p><strong>Overall Confidence:</strong> ${result.confidence}%</p>
          
          <table style="margin-top: 20px;">
            <tr>
              <th>Model Component</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>DS-TB Probability</th>
              <th>DR-TB Probability</th>
            </tr>
            <tr>
              <td>Fusion Engine</td>
              <td>${result.fusionModel.prediction}</td>
              <td>${result.fusionModel.confidence}%</td>
              <td>${result.fusionModel.ds_prob}%</td>
              <td>${result.fusionModel.dr_prob}%</td>
            </tr>
            <tr>
              <td>Chest X-Ray Analysis</td>
              <td>${result.xrayModel.prediction}</td>
              <td>${result.xrayModel.confidence}%</td>
              <td>${result.xrayModel.ds_prob}%</td>
              <td>${result.xrayModel.dr_prob}%</td>
            </tr>
            <tr>
              <td>Genomic Sequence Analysis</td>
              <td>${result.genomicModel.prediction}</td>
              <td>${result.genomicModel.confidence}%</td>
              <td>${result.genomicModel.ds_prob}%</td>
              <td>${result.genomicModel.dr_prob}%</td>
            </tr>
          </table>
        </div>

        <h2>Explainability / Visual Evidence</h2>
        <div class="grid" style="margin-top: 20px;">
          <div>
            <h3>Original X-Ray</h3>
            <img src="${result.imageDataUrl}" alt="Original X-Ray" />
          </div>
          <div>
            <h3>Grad-CAM++ Heatmap</h3>
            ${result.gradcamDataUrl 
              ? `<img src="${result.gradcamDataUrl}" alt="Grad-CAM++" />`
              : `<p style="padding: 20px; border: 1px dashed #ccc; text-align: center;">Heatmap not available</p>`}
          </div>
        </div>

        <h2>Findings & Recommendations</h2>
        <div class="card">
          <p><strong>Findings:</strong> ${result.findings}</p>
          <p><strong>Recommendation:</strong> ${result.recommendation}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TB_Analysis_Report_${result.patientName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !patientId.trim()) {
      toast.error("Add a patient ID and chest X-ray image first.");
      return;
    }
    setBusy(true);
    try {
      const imageDataUrl = await readImageDataUrl(file);
      const analysis = await analyzeWithBackend(file, mutations);
      const scan: ScanRecord = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        patientName: patientId.trim(),
        age,
        gender: sex,
        symptoms: "",
        previousTreatment: "",
        treatmentHistory: "",
        fileName: file.name,
        genomicFileName: mutations.length > 0 ? "Mutations manually entered" : undefined,
        imageDataUrl,
        createdAt: new Date().toISOString(),
        ...analysis,
      };
      saveScan(scan);
      setResult(scan);
      toast.success("Multimodal analysis complete.");
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
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">New multimodal study</h1>
            <p className="mt-2 text-muted-foreground">
              Upload a chest X-ray and optional genomic sequence to create a fusion AI report for DS-TB vs DR-TB.
            </p>
          </div>
          <Link
            to="/history"
            className="rounded-sm border border-border px-4 py-2 text-sm font-semibold hover:bg-card"
          >
            View history
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col"
          >
            <div className="mb-6 border-b border-border pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider text-primary">DRUG-RESISTANT TUBERCULOSIS ANALYSIS</h2>
            </div>

            <h2 className="text-lg font-bold uppercase">PATIENT INFORMATION</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="label-micro">Patient ID *</span>
                <input
                  className="field-input mt-1"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                  placeholder="Patient ID"
                  required
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
                <span className="label-micro">Sex</span>
                <select
                  className="field-input mt-1"
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                >
                  <option>Unspecified</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            
            <hr className="my-8 border-border" />

            <h2 className="text-lg font-bold uppercase">CHEST X-RAY</h2>
            <div 
              className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary transition-colors cursor-pointer bg-background/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                }
              }}
            >
              {file ? (
                <div className="w-full">
                  <div className="relative mx-auto max-w-[16rem] overflow-hidden rounded-md border border-border">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="block w-full object-cover" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-primary">{file.name}</p>
                  <button type="button" onClick={() => setFile(null)} className="mt-2 text-xs font-bold text-destructive hover:underline">
                    REMOVE / REPLACE
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center py-4">
                  <span className="text-sm font-semibold">Upload Chest X-Ray</span>
                  <span className="mt-2 block text-xs text-muted-foreground">Supported formats: DICOM / PNG / JPG</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,.dcm"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>

            <hr className="my-8 border-border" />

            <h2 className="text-lg font-bold uppercase">PATHOGEN GENOMIC INFORMATION</h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">GENOMIC MUTATIONS</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label-micro">Gene</span>
                <input
                  className="field-input mt-1"
                  value={geneInput}
                  onChange={(event) => setGeneInput(event.target.value)}
                  placeholder="e.g. rpoB"
                />
              </label>
              <label>
                <span className="label-micro">Mutation</span>
                <input
                  className="field-input mt-1"
                  value={mutationInput}
                  onChange={(event) => setMutationInput(event.target.value)}
                  placeholder="e.g. S450L"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addMutation}
              className="mt-4 rounded-sm border border-border px-4 py-2 text-sm font-bold hover:bg-card text-center transition-colors"
            >
              + Add Mutation
            </button>

            {mutations.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Entered Mutations:</p>
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-card">
                      <tr>
                        <th className="border-b border-border px-4 py-2 font-semibold">Gene</th>
                        <th className="border-b border-border px-4 py-2 font-semibold">Mutation</th>
                        <th className="border-b border-border px-4 py-2 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mutations.map((m, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2">{m.gene}</td>
                          <td className="px-4 py-2">{m.mutation}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeMutation(i)}
                              className="text-xs font-bold text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-8 w-full rounded-sm bg-surface-dark py-4 text-sm font-bold tracking-wider text-surface-dark-foreground hover:bg-primary disabled:opacity-60 uppercase transition-colors"
            >
              {busy ? "ANALYZING..." : "ANALYZE DR-TB"}
            </button>
          </form>

          <section className="rounded-xl border border-border bg-viewer p-6 text-white flex flex-col">
            <p className="label-micro text-accent">MULTIMODAL RESULT PANEL</p>
            {result ? (
              <div className="mt-8 flex-1 flex flex-col">
                <p className="text-sm font-semibold text-primary mb-1">Final Fusion Prediction</p>
                <div className="text-4xl font-extrabold text-success">{result.verdict}</div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-md bg-white/5 p-4 border-l-4 border-primary">
                    <p className="text-xs text-white/60">DS-TB Probability (Fusion)</p>
                    <p className="mt-1 text-3xl font-bold">{result.fusionModel.ds_prob}%</p>
                  </div>
                  <div className="rounded-md bg-white/5 p-4 border-l-4 border-destructive">
                    <p className="text-xs text-white/60">DR-TB Probability (Fusion)</p>
                    <p className="mt-1 text-3xl font-bold">{result.fusionModel.dr_prob}%</p>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="text-sm font-bold mb-4">Multimodal Contributions</h3>
                  <div className="grid gap-3">
                    <div className="rounded-md border border-white/10 p-3 flex justify-between items-center bg-white/5">
                      <div>
                        <p className="font-semibold text-accent">{result.xrayModel.name}</p>
                        <p className="text-xs text-white/60">Image Analysis</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/80">DS-TB: <span className="font-bold">{result.xrayModel.ds_prob}%</span></p>
                        <p className="text-sm text-white/80">DR-TB: <span className="font-bold">{result.xrayModel.dr_prob}%</span></p>
                      </div>
                    </div>
                    
                    <div className="rounded-md border border-white/10 p-3 flex justify-between items-center bg-white/5">
                      <div>
                        <p className="font-semibold text-purple-400">{result.genomicModel.name}</p>
                        <p className="text-xs text-white/60">Genomic Sequence Analysis</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/80">DS-TB: <span className="font-bold">{result.genomicModel.ds_prob}%</span></p>
                        <p className="text-sm text-white/80">DR-TB: <span className="font-bold">{result.genomicModel.dr_prob}%</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <AttentionOverlay scan={result} />
                
                <p className="mt-8 text-sm leading-relaxed text-white/80">{result.findings}</p>
                <p className="mt-6 border-l-2 border-accent pl-4 text-sm text-white/80">
                  {result.recommendation}
                </p>

                <div className="mt-10 pt-6 border-t border-white/10 flex gap-4">
                  <button 
                    onClick={downloadReport}
                    className="flex-1 rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    DOWNLOAD REPORT
                  </button>
                  <button 
                    onClick={() => { 
                      setResult(null); 
                      setFile(null); 
                      setMutations([]);
                      setGeneInput("");
                      setMutationInput("");
                      setPatientId("PT-" + crypto.randomUUID().split("-")[0].toUpperCase()); 
                      setBusy(false); 
                    }}
                    className="flex-1 rounded-sm border border-white/20 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    NEW PREDICTION
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-16 flex flex-col items-center justify-center text-white/40 flex-1">
                <div className="text-6xl font-light">+</div>
                <p className="mt-4 text-sm">Your multimodal fusion result will appear here.</p>
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
  // Synthesized AI explainability views for the prototype
  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 className="text-sm font-bold mb-4">Grad-CAM++ Explainability</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Original */}
        <div className="relative overflow-hidden rounded-md border border-white/15 bg-black/50">
          <img src={scan.imageDataUrl} alt="Original" className="block aspect-square w-full object-cover" />
          <div className="absolute bottom-1.5 left-1.5 rounded-sm bg-black/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Original</div>
        </div>

        {/* Grad-CAM++ */}
        <div className="relative overflow-hidden rounded-md border border-white/15 bg-black/50 flex items-center justify-center">
          {scan.gradcamDataUrl ? (
            <img src={scan.gradcamDataUrl} alt="Grad-CAM++" className="block aspect-square w-full object-cover" />
          ) : (
            <div className="text-center text-xs text-white/50 p-4">
              <p>Grad-CAM++ visualization not available.</p>
              <p className="mt-2 text-[10px]">Ensure the backend successfully generated the CAM overlay.</p>
            </div>
          )}
          <div className="absolute bottom-1.5 left-1.5 rounded-sm bg-black/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Grad-CAM++</div>
        </div>
      </div>
    </div>
  );
}
