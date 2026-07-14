// Mock scanning engine — simulates a full Sentinel Vision analysis for a URL.
// Deterministic per-host using a small hash so results feel stable across visits.

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";
export type Verdict = "Safe" | "Suspicious" | "Malicious" | "Phishing" | "Compromised";

export interface ScanResult {
  id: string;
  url: string;
  host: string;
  scannedAt: string;
  threatScore: number; // 0-100
  confidence: number; // 0-100
  verdict: Verdict;
  risk: RiskLevel;
  screenshotSeed: string;
  dns: {
    ip: string; country: string; nameservers: string[];
    mx: string[]; txt: string[]; spf: boolean; dkim: boolean; dmarc: boolean;
  };
  whois: {
    registrar: string; owner: string; created: string; expires: string;
    ageDays: number; country: string; newlyRegistered: boolean;
  };
  ssl: {
    https: boolean; valid: boolean; issuer: string; expires: string;
    tls: string; strength: string; chainOk: boolean; score: number;
  };
  headers: { name: string; present: boolean; severity: "ok" | "warn" | "bad" }[];
  headerScore: number;
  html: { hiddenForms: number; hiddenIframes: number; suspiciousMeta: number; encodedHtml: number; maliciousLinks: number; embeddedScripts: number; externalResources: number; };
  js: { indicator: string; hits: number; severity: RiskLevel }[];
  threatIntel: { source: string; hit: boolean; category?: string; lastSeen?: string }[];
  network: { domain: string; type: "script" | "image" | "api" | "tracker" | "cdn"; suspicious: boolean }[];
  vulns: { name: string; severity: "low" | "medium" | "high" | "critical"; passive: boolean }[];
  ai: {
    zeroDay: boolean;
    features: { name: string; contribution: number; direction: "up" | "down" }[];
  };
  recommendations: string[];
  timeline: { step: string; ms: number }[];
}

const STEPS = [
  "Validate URL","DNS Lookup","WHOIS Lookup","SSL Analysis","Capture Screenshot",
  "HTML Analysis","JavaScript Analysis","Security Headers","Threat Intelligence",
  "Network Resources","AI Risk Prediction","Explainable AI","Recommendations","Generate Report",
];

function hash(s: string) { let h = 2166136261; for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; }; }
function pick<T>(r: () => number, arr: T[]) { return arr[Math.floor(r() * arr.length)]; }

export function normalizeUrl(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return "https://" + t;
}

export function generateScan(rawUrl: string): ScanResult {
  const url = normalizeUrl(rawUrl);
  let host = "unknown";
  try { host = new URL(url).hostname; } catch {}
  const seed = hash(host);
  const r = rng(seed);
  const suspiciousDomain = /(login|verify|secure|update|free|gift|bonus|wallet|bank)/i.test(host) || /-|xn--/.test(host);
  const bias = suspiciousDomain ? 40 : 0;
  const threatScore = Math.min(99, Math.max(2, Math.floor(r() * 60) + bias));
  const verdict: Verdict = threatScore >= 85 ? "Phishing" : threatScore >= 70 ? "Malicious" : threatScore >= 45 ? "Suspicious" : threatScore >= 25 ? "Suspicious" : "Safe";
  const risk: RiskLevel = threatScore >= 85 ? "critical" : threatScore >= 65 ? "high" : threatScore >= 40 ? "medium" : threatScore >= 20 ? "low" : "safe";
  const ageDays = Math.floor(r() * (suspiciousDomain ? 60 : 4000)) + 3;

  const countries = ["United States","Germany","Netherlands","Russia","China","Ukraine","Singapore","Brazil","India","France"];
  const registrars = ["Namecheap","GoDaddy","Cloudflare Registrar","Google Domains","OVH","Porkbun"];
  const issuers = ["Let's Encrypt R3","DigiCert Global CA","Sectigo RSA","Google Trust Services","Cloudflare Inc ECC CA"];
  const jsIndicators = ["eval()","document.write()","Base64-encoded payload","Obfuscated JavaScript","Dynamic script loader","Crypto miner","Clipboard hijack","Hidden redirect","Keylogger pattern","Browser exploit kit"];

  const headers = [
    { name: "Content-Security-Policy", present: r() > (suspiciousDomain ? 0.9 : 0.4) },
    { name: "Strict-Transport-Security", present: r() > 0.35 },
    { name: "X-Frame-Options", present: r() > 0.3 },
    { name: "X-Content-Type-Options", present: r() > 0.25 },
    { name: "Referrer-Policy", present: r() > 0.45 },
    { name: "Permissions-Policy", present: r() > 0.7 },
    { name: "Cross-Origin-Opener-Policy", present: r() > 0.7 },
  ].map(h => ({ ...h, severity: (h.present ? "ok" : (h.name.includes("Security-Policy") ? "bad" : "warn")) as "ok"|"warn"|"bad" }));
  const headerScore = Math.round((headers.filter(h => h.present).length / headers.length) * 100);

  const jsCount = suspiciousDomain ? 4 + Math.floor(r()*5) : Math.floor(r()*3);
  const js = Array.from({ length: jsCount }).map(() => {
    const ind = pick(r, jsIndicators);
    const sev: RiskLevel = pick(r, ["low","medium","high","critical"] as RiskLevel[]);
    return { indicator: ind, hits: 1 + Math.floor(r()*6), severity: sev };
  });

  const intelSources = ["VirusTotal","Google Safe Browsing","AbuseIPDB","AlienVault OTX","URLHaus","PhishTank"];
  const threatIntel = intelSources.map(s => {
    const hit = suspiciousDomain ? r() > 0.35 : r() > 0.85;
    return hit ? { source: s, hit, category: pick(r, ["Phishing","Malware C2","Drive-by Download","Credential Theft","Scam"]), lastSeen: `${Math.floor(r()*30)+1}d ago` } : { source: s, hit: false };
  });

  const netDomains = ["googletagmanager.com","google-analytics.com","cloudflare.com","cdn.jsdelivr.net","fonts.gstatic.com","facebook.net","doubleclick.net","hotjar.com","stripe.com","segment.io","sketchy-cdn.top","tracker-xyz.click"];
  const network = Array.from({ length: 8 + Math.floor(r()*6) }).map(() => {
    const d = pick(r, netDomains);
    const suspicious = /sketchy|tracker-xyz|\.click|\.top$/.test(d);
    const type = pick(r, ["script","image","api","tracker","cdn"] as const);
    return { domain: d, type, suspicious };
  });

  const vulnPool = [
    { name: "Reflected XSS surface", severity: "high" as const },
    { name: "SQL Injection exposure", severity: "critical" as const },
    { name: "Clickjacking (missing XFO)", severity: "medium" as const },
    { name: "Open Redirect parameter", severity: "medium" as const },
    { name: "Directory Listing enabled", severity: "high" as const },
    { name: "Weak / missing cookie flags", severity: "medium" as const },
    { name: "Insecure security headers", severity: "low" as const },
    { name: "Sensitive file exposure (.env)", severity: "critical" as const },
    { name: "CORS misconfiguration", severity: "high" as const },
  ];
  const vulns = vulnPool.filter(() => r() > (suspiciousDomain ? 0.4 : 0.75)).map(v => ({ ...v, passive: true }));

  const features = [
    { name: "Obfuscated JavaScript", contribution: js.length ? 0.24 : 0.02, direction: "up" as const },
    { name: "Recently registered domain", contribution: ageDays < 90 ? 0.22 : 0.03, direction: "up" as const },
    { name: "Missing CSP header", contribution: headers[0].present ? 0.02 : 0.18, direction: "up" as const },
    { name: "Threat intel hits", contribution: threatIntel.filter(t => t.hit).length * 0.06, direction: "up" as const },
    { name: "Suspicious external domains", contribution: network.filter(n => n.suspicious).length * 0.05, direction: "up" as const },
    { name: "Valid SSL certificate", contribution: 0.08, direction: "down" as const },
    { name: "Established registrar", contribution: 0.05, direction: "down" as const },
  ].sort((a,b) => b.contribution - a.contribution);

  const recs = [
    threatScore >= 70 ? "Do not visit this website" : "Proceed with caution",
    threatScore >= 60 ? "Block domain at DNS / firewall" : "Monitor domain activity",
    !headers[0].present && "Configure a Content-Security-Policy header",
    !headers[1].present && "Enable Strict-Transport-Security (HSTS)",
    js.length > 0 && "Remove or audit suspicious JavaScript",
    ageDays < 90 && "Flag newly registered domain in SIEM",
    threatIntel.some(t => t.hit) && "Notify SOC — reputation hits detected",
    "Regenerate SSL certificate if compromise suspected",
  ].filter(Boolean) as string[];

  const timeline = STEPS.map((s) => ({ step: s, ms: 120 + Math.floor(r()*260) }));

  return {
    id: `SV-${seed.toString(16).slice(0,8).toUpperCase()}`,
    url, host,
    scannedAt: new Date().toISOString(),
    threatScore, confidence: 70 + Math.floor(r()*28), verdict, risk,
    screenshotSeed: host,
    dns: {
      ip: `${20+Math.floor(r()*220)}.${Math.floor(r()*255)}.${Math.floor(r()*255)}.${Math.floor(r()*255)}`,
      country: pick(r, countries),
      nameservers: [`ns1.${host}`, `ns2.${host}`],
      mx: [`mail.${host}`],
      txt: [`v=spf1 include:_spf.${host} ~all`],
      spf: r() > 0.2, dkim: r() > 0.3, dmarc: r() > 0.4,
    },
    whois: {
      registrar: pick(r, registrars),
      owner: suspiciousDomain ? "REDACTED FOR PRIVACY" : "Domain Admin, " + host,
      created: new Date(Date.now() - ageDays*86400000).toISOString().slice(0,10),
      expires: new Date(Date.now() + (365 + Math.floor(r()*400))*86400000).toISOString().slice(0,10),
      ageDays, country: pick(r, countries),
      newlyRegistered: ageDays < 90,
    },
    ssl: {
      https: url.startsWith("https"), valid: r() > (suspiciousDomain ? 0.4 : 0.05),
      issuer: pick(r, issuers),
      expires: new Date(Date.now() + Math.floor(r()*300)*86400000).toISOString().slice(0,10),
      tls: pick(r, ["TLS 1.3","TLS 1.2","TLS 1.3"]),
      strength: pick(r, ["ECDHE-RSA-AES256-GCM-SHA384","TLS_AES_128_GCM_SHA256","TLS_CHACHA20_POLY1305_SHA256"]),
      chainOk: r() > 0.15,
      score: Math.max(30, 100 - (suspiciousDomain ? 40 : 5) - Math.floor(r()*15)),
    },
    headers, headerScore,
    html: {
      hiddenForms: Math.floor(r()*(suspiciousDomain?4:1)),
      hiddenIframes: Math.floor(r()*(suspiciousDomain?3:1)),
      suspiciousMeta: Math.floor(r()*3),
      encodedHtml: Math.floor(r()*(suspiciousDomain?5:1)),
      maliciousLinks: Math.floor(r()*(suspiciousDomain?8:2)),
      embeddedScripts: 3 + Math.floor(r()*10),
      externalResources: 5 + Math.floor(r()*15),
    },
    js, threatIntel, network, vulns,
    ai: { zeroDay: suspiciousDomain && r() > 0.6, features },
    recommendations: recs,
    timeline,
  };
}

// Session-side scan history
const HISTORY_KEY = "sv_history";
export function saveHistory(scan: ScanResult) {
  if (typeof window === "undefined") return;
  const list = getHistory();
  const filtered = list.filter(s => s.id !== scan.id).slice(0, 24);
  filtered.unshift(scan);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}
export function getHistory(): ScanResult[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
export function getScan(id: string): ScanResult | null {
  return getHistory().find(s => s.id === id) || null;
}
