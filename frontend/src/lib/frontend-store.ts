export type LocalUser = {
  email: string;
  name: string;
  hospital: string;
};

type LocalAccount = LocalUser & {
  password: string;
};

export type ScanRecord = {
  id: string;
  patientName: string;
  age: string;
  gender: string;
  symptoms: string;
  fileName: string;
  verdict: "Tuberculosis" | "Normal";
  probability: number;
  confidence: number;
  affectedRegion: string;
  regionBox: { x: number; y: number; width: number; height: number };
  imageDataUrl: string;
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

export async function analyzeLocally(): Promise<
  Pick<
    ScanRecord,
    | "verdict"
    | "probability"
    | "confidence"
    | "affectedRegion"
    | "regionBox"
    | "findings"
    | "recommendation"
  >
> {
  await new Promise((resolve) => window.setTimeout(resolve, 900));
  return {
    verdict: "Normal",
    probability: 12,
    confidence: 88,
    affectedRegion: "None",
    regionBox: { x: 0, y: 0, width: 0, height: 0 },
    findings:
      "No focal opacity is detected in this frontend demonstration result. Review the image quality and clinical context before making a decision.",
    recommendation:
      "Use clinical assessment and confirmatory testing where tuberculosis remains suspected.",
  };
}
