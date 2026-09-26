export type LocalUser = {
  email: string;
  name: string;
  hospital: string;
};

type LocalAccount = LocalUser & {
  password: string;
};

export type ModelPrediction = {
  name: string;
  prediction: string;
  confidence: number;
  ds_prob: number;
  dr_prob: number;
  gradcam?: string;
};

export type ScanRecord = {
  id: string;
  patientName: string;
  age: string;
  gender: string;
  symptoms: string;
  previousTreatment: string;
  treatmentHistory: string;
  fileName: string;
  genomicFileName?: string;
  verdict: "Drug-Sensitive TB (DS-TB)" | "Drug-Resistant TB (DR-TB)" | string;
  probability: number;
  confidence: number;
  xrayModel: ModelPrediction;
  genomicModel: ModelPrediction;
  fusionModel: ModelPrediction;
  affectedRegion: string;
  regionBox: { x: number; y: number; width: number; height: number };
  imageDataUrl: string;
  gradcamDataUrl?: string;
  findings: string;
  recommendation: string;
  createdAt: string;
};

const userKey = "pulmoscan.local-user";
const accountsKey = "pulmoscan.local-accounts";
const scansKey = "pulmoscan.local-scans";

function getAccounts(): LocalAccount[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(accountsKey);
  return raw ? (JSON.parse(raw) as LocalAccount[]) : [];
}

export function createLocalAccount(account: LocalAccount): boolean {
  const accounts = getAccounts();
  const email = account.email.toLowerCase();
  if (accounts.some((existing) => existing.email.toLowerCase() === email)) return false;
  window.localStorage.setItem(accountsKey, JSON.stringify([...accounts, { ...account, email }]));
  return true;
}

export function authenticateLocalAccount(email: string, password: string): LocalUser | null {
  const account = getAccounts().find(
    (candidate) =>
      candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
  );
  if (!account) return null;
  const { password: _password, ...user } = account;
  return user;
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(userKey);
  return raw ? (JSON.parse(raw) as LocalUser) : null;
}

export function setLocalUser(user: LocalUser) {
  window.localStorage.setItem(userKey, JSON.stringify(user));
  window.dispatchEvent(new Event("pulmoscan-auth"));
}

export function clearLocalUser() {
  window.localStorage.removeItem(userKey);
  window.dispatchEvent(new Event("pulmoscan-auth"));
}

export function getScans(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(scansKey);
  return raw ? (JSON.parse(raw) as ScanRecord[]) : [];
}

export function saveScan(scan: ScanRecord) {
  window.localStorage.setItem(scansKey, JSON.stringify([scan, ...getScans()]));
  window.dispatchEvent(new Event("pulmoscan-scans"));
}

export async function analyzeWithBackend(file: File, mutations?: { gene: string; mutation: string }[]): Promise<
  Pick<
    ScanRecord,
    | "verdict"
    | "probability"
    | "confidence"
    | "xrayModel"
    | "genomicModel"
    | "fusionModel"
    | "affectedRegion"
    | "regionBox"
    | "findings"
    | "recommendation"
  >
> {
  const formData = new FormData();
  formData.append("image", file);
  if (mutations && mutations.length > 0) {
    formData.append("mutations", JSON.stringify(mutations));
  }
  const response = await fetch(
    `${import.meta.env["VITE_API_URL"] ?? "http://127.0.0.1:5000"}/api/predict`,
    { method: "POST", body: formData },
  );
  const payload = (await response.json()) as {
    success?: boolean;
    xray_model?: ModelPrediction;
    genomic_model?: ModelPrediction;
    fusion_model?: ModelPrediction;
    error?: string;
  };
  if (!response.ok || !payload.success || !payload.xray_model || !payload.genomic_model || !payload.fusion_model) {
    throw new Error(payload.error ?? "Analysis failed. Please try again.");
  }

  return {
    verdict: payload.fusion_model.prediction,
    probability: payload.fusion_model.ds_prob > payload.fusion_model.dr_prob ? payload.fusion_model.ds_prob : payload.fusion_model.dr_prob,
    confidence: payload.fusion_model.confidence,
    xrayModel: payload.xray_model,
    genomicModel: payload.genomic_model,
    fusionModel: payload.fusion_model,
    affectedRegion: "None",
    regionBox: { x: 0, y: 0, width: 0, height: 0 },
    gradcamDataUrl: payload.xray_model.gradcam,
    findings:
      "The Multimodal AI completed an automated prediction combining X-Ray and Genomic features for DS-TB vs DR-TB. Review the probabilities and explainability map alongside clinical context before making a decision.",
    recommendation:
      "Use this as an initial screening tool. Perform phenotypic drug susceptibility testing (DST) or molecular tests (e.g., Xpert MTB/RIF) to confirm drug resistance.",
  };
}
