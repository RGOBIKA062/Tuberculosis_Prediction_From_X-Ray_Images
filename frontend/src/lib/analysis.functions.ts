import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().min(32).max(12_000_000),
  patientName: z.string().trim().min(1).max(120),
  age: z.number().int().min(0).max(130).nullable(),
  gender: z.string().trim().max(20),
  symptoms: z.string().trim().max(1000),
});

export type AnalysisResult = {
  verdict: "Tuberculosis" | "Normal";
  probability: number;
  confidence: number;
  affectedRegion: string;
  regionBox: { x: number; y: number; width: number; height: number };
  findings: string;
  recommendation: string;
  inferenceMs: number;
};

const SYSTEM_PROMPT = `You are a radiology decision-support model for tuberculosis screening on chest X-rays.
You analyse the lung fields only and report whether the image shows findings consistent with pulmonary tuberculosis or appears normal.
Reply with STRICT JSON only, no markdown, matching exactly:
{
 "verdict": "Tuberculosis" | "Normal",
 "probability": number (0-100, likelihood of TB),
 "confidence": number (0-100, your certainty in the verdict),
 "affectedRegion": string (e.g. "Right upper lobe", or "None" when normal),
 "regionBox": { "x": number, "y": number, "width": number, "height": number },
 "findings": string (2-3 sentences describing radiological signs),
 "recommendation": string (one sentence clinical next step)
}
regionBox values are percentages (0-100) of the image dimensions marking the most suspicious area; use zeros when normal.
If the image is not a chest X-ray, set verdict "Normal", confidence 0 and say so in findings.`;

export const analyzeXray = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project.");

    const started = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Patient: ${data.patientName}, age ${data.age ?? "unknown"}, gender ${
                  data.gender || "unspecified"
                }. Reported symptoms: ${data.symptoms || "none provided"}. Analyse the attached chest X-ray.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) {
        throw new Error("AI rate limit reached. Please wait a moment and try again.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue analysing scans.");
      }
      throw new Error(`AI analysis failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      throw new Error("AI returned an unreadable result. Please try the scan again.");
    }

    const num = (value: unknown, fallback = 0) => {
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
    };
    const box = (parsed["regionBox"] ?? {}) as Record<string, unknown>;

    return {
      verdict: parsed["verdict"] === "Tuberculosis" ? "Tuberculosis" : "Normal",
      probability: num(parsed["probability"]),
      confidence: num(parsed["confidence"]),
      affectedRegion: String(parsed["affectedRegion"] ?? "None"),
      regionBox: {
        x: num(box["x"]),
        y: num(box["y"]),
        width: num(box["width"]),
        height: num(box["height"]),
      },
      findings: String(parsed["findings"] ?? ""),
      recommendation: String(parsed["recommendation"] ?? ""),
      inferenceMs: Date.now() - started,
    };
  });
