import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shell } from "@/components/soc/Shell";
import { ScanInput } from "@/components/soc/ScanInput";
import { getHistory } from "@/lib/mock-scan";
import { Shield, Activity, Globe2, Cpu, Fingerprint, LockKeyhole, Radar, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import type { ScanResult } from "@/lib/mock-scan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel Vision — AI Website Malware & Phishing Analyzer" },
      { name: "description", content: "Enterprise-grade SOC platform. Scan any URL for malware, phishing, malicious JavaScript, SSL & DNS issues, and threat intelligence." },
      { property: "og:title", content: "Sentinel Vision — AI Website Malware & Phishing Analyzer" },
      { property: "og:description", content: "Scan any URL for malware, phishing, and threat intelligence signals." },
    ],
  }),
  component: Landing,
});

const STATS = [
  { label: "Websites Analyzed", value: "12.4M", icon: Globe2 },
  { label: "Threats Blocked (24h)", value: "48,921", icon: Shield },
  { label: "Phishing Campaigns", value: "1,204", icon: Fingerprint },
  { label: "Zero-Day Anomalies", value: "37", icon: Radar },
];

const FEATURES = [
  { icon: Cpu, title: "Ensemble AI Engine", desc: "Transformer + XGBoost + Random Forest + Isolation Forest fused into a single verdict." },
  { icon: LockKeyhole, title: "SSL / TLS Deep Inspection", desc: "Chain of trust, cipher strength, expiration and issuer analysis." },
  { icon: Radar, title: "6× Threat Intelligence Feeds", desc: "VirusTotal, Google Safe Browsing, AbuseIPDB, AlienVault OTX, URLHaus, PhishTank." },
  { icon: Activity, title: "Explainable AI", desc: "SHAP & LIME visualizations show exactly why the verdict was reached." },
];

function Landing() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  useEffect(() => { setHistory(getHistory().slice(0, 5)); }, []);

  return (
    <Shell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
              LIVE • Threat intelligence feeds synchronized
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              AI-Powered Website<br />
              <span className="text-gradient">Threat Analyzer</span>
            </h1>
            <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              Sentinel Vision inspects any URL for <span className="text-foreground">malware, phishing, malicious JavaScript, vulnerabilities, SSL issues, DNS signals</span> and cross-references six global threat feeds — in seconds.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-10">
            <ScanInput big />
          </motion.div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i*0.06 }}
                className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{s.label}</span>
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display">{s.value}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Marquee threat ticker */}
        <div className="border-y border-border/50 bg-black/20 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap py-2.5 text-xs font-mono text-muted-foreground">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex items-center gap-6 pr-6">
                {["APT29 · Credential harvesting", "Emotet · Malspam wave", "Lazarus · Fake job portal", "FIN7 · POS malware", "Qakbot · C2 refresh", "Agent Tesla · Phishing kit", "IcedID · Loader chain", "TA505 · Clop ransomware"].map(t => (
                  <span key={t} className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-warn" />{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i*0.06 }}
              className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
              <f.icon className="h-6 w-6 text-primary" />
              <div className="mt-3 font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* RECENT SCANS */}
      {history.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Recent scans</h2>
              <p className="text-sm text-muted-foreground">Your most recently analyzed targets.</p>
            </div>
            <Link to="/history" className="text-xs font-mono text-primary hover:underline">VIEW ALL →</Link>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
                <tr>
                  <th className="text-left px-4 py-3 font-mono">Host</th>
                  <th className="text-left px-4 py-3 font-mono">Verdict</th>
                  <th className="text-left px-4 py-3 font-mono">Score</th>
                  <th className="text-left px-4 py-3 font-mono">Scanned</th>
                  <th className="text-right px-4 py-3 font-mono">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map(s => (
                  <tr key={s.id} className="border-t border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono">{s.host}</td>
                    <td className="px-4 py-3"><VerdictBadge verdict={s.verdict} /></td>
                    <td className="px-4 py-3 font-mono tabular-nums">{s.threatScore}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(s.scannedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/scan/$id" params={{ id: s.id }} className="text-primary hover:underline text-xs font-mono">OPEN →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </Shell>
  );
}

export function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, string> = {
    Safe: "bg-safe/15 text-safe ring-safe/30",
    Suspicious: "bg-warn/15 text-warn ring-warn/30",
    Malicious: "bg-danger/15 text-danger ring-danger/30",
    Phishing: "bg-critical/15 text-critical ring-critical/30",
    Compromised: "bg-critical/15 text-critical ring-critical/30",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-mono ring-1 ${map[verdict] || map.Safe}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{verdict.toUpperCase()}
  </span>;
}
