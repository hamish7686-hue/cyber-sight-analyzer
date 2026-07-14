import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/soc/Shell";
import { ThreatGauge } from "@/components/soc/ThreatGauge";
import { VerdictBadge } from "@/routes/index";
import { getScan, type ScanResult } from "@/lib/mock-scan";
import {
  Globe, Server, Calendar, Lock, ShieldCheck, ShieldAlert, FileCode2, Code2, Radar,
  Network, Bug, Sparkles, ClipboardCheck, Download, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  MapPin,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, RadialBarChart, RadialBar } from "recharts";

export const Route = createFileRoute("/scan/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Scan ${params.id} — Sentinel Vision` },
      { name: "description", content: "AI website threat analysis report." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScanPage,
  notFoundComponent: () => (
    <Shell><div className="max-w-2xl mx-auto py-24 px-6 text-center">
      <h1 className="text-2xl font-semibold">Scan not found</h1>
      <p className="mt-2 text-muted-foreground">This scan is not in your session history.</p>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">← Run a new scan</Link>
    </div></Shell>
  ),
});

function ScanPage() {
  const { id } = Route.useParams();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = getScan(id);
    if (!s) { throw notFound(); }
    setScan(s);
  }, [id]);

  // Animate timeline progress
  useEffect(() => {
    if (!scan) return;
    setStepIdx(0); setDone(false);
    let i = 0;
    const tick = () => {
      i++;
      if (i >= scan.timeline.length) { setDone(true); setStepIdx(scan.timeline.length); return; }
      setStepIdx(i);
      setTimeout(tick, 120 + Math.random()*140);
    };
    const t = setTimeout(tick, 200);
    return () => clearTimeout(t);
  }, [scan]);

  if (!scan) return <Shell><div className="p-10 text-muted-foreground">Loading…</div></Shell>;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> New scan
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadJSON(scan)} className="inline-flex items-center gap-1.5 rounded-md glass px-3 py-1.5 text-xs font-mono hover:bg-white/5">
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
            <button onClick={() => downloadCSV(scan)} className="inline-flex items-center gap-1.5 rounded-md glass px-3 py-1.5 text-xs font-mono hover:bg-white/5">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md bg-primary/20 ring-1 ring-primary/40 px-3 py-1.5 text-xs font-mono text-primary hover:bg-primary/30">
              <Download className="h-3.5 w-3.5" /> PDF Report
            </button>
          </div>
        </div>

        {/* Verdict banner */}
        <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-30"
            style={{ background: scan.risk === "critical" || scan.risk === "high" ? "var(--critical)" : scan.risk === "medium" ? "var(--warn)" : "var(--safe)" }} />
          <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] items-center relative">
            <div className="flex items-center justify-center">
              <ThreatGauge score={scan.threatScore} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <VerdictBadge verdict={scan.verdict} />
                {scan.ai.zeroDay && <span className="inline-flex items-center gap-1 rounded-full bg-warn/15 text-warn ring-1 ring-warn/30 px-2 py-0.5 text-[10px] font-mono">
                  <Sparkles className="h-3 w-3" /> POTENTIAL ZERO-DAY
                </span>}
                <span className="text-[10px] font-mono text-muted-foreground">ID {scan.id}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold break-all">{scan.host}</h1>
              <a href={scan.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-muted-foreground hover:text-primary break-all">{scan.url}</a>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="Confidence" value={`${scan.confidence}%`} />
                <MiniStat label="SSL Score" value={`${scan.ssl.score}/100`} />
                <MiniStat label="Headers" value={`${scan.headerScore}/100`} />
                <MiniStat label="TI Hits" value={`${scan.threatIntel.filter(t=>t.hit).length}/6`} />
              </div>
            </div>
            {/* Screenshot */}
            <div className="w-full lg:w-80">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10 bg-black/40 scan-line animate-scan-sweep">
                <img
                  src={`https://image.thum.io/get/width/640/crop/480/${encodeURIComponent(scan.url)}`}
                  alt={`Screenshot of ${scan.host}`}
                  className="h-full w-full object-cover object-top opacity-80"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/80">
                  <span className="rounded bg-black/60 px-1.5 py-0.5">LIVE CAPTURE</span>
                  <span className="rounded bg-black/60 px-1.5 py-0.5">{new Date(scan.scannedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Panel title="Scan Timeline" icon={<Radar className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-1.5">
            {scan.timeline.map((t, i) => {
              const active = i < stepIdx;
              const current = i === stepIdx && !done;
              return (
                <div key={t.step}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono ring-1 transition-all ${
                    active ? "bg-safe/10 text-safe ring-safe/30" : current ? "bg-primary/10 text-primary ring-primary/40" : "bg-white/[0.02] text-muted-foreground ring-white/10"
                  }`}>
                  {active ? <CheckCircle2 className="h-3 w-3" /> : current ? <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> : <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                  {t.step}
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="DNS Analysis" icon={<Server className="h-4 w-4" />}>
            <KV k="IP Address" v={scan.dns.ip} mono />
            <KV k="Country" v={<span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{scan.dns.country}</span>} />
            <KV k="Nameservers" v={scan.dns.nameservers.join(", ")} mono />
            <KV k="MX" v={scan.dns.mx.join(", ")} mono />
            <KV k="TXT (SPF)" v={scan.dns.txt[0]} mono />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Chip ok={scan.dns.spf} label="SPF" />
              <Chip ok={scan.dns.dkim} label="DKIM" />
              <Chip ok={scan.dns.dmarc} label="DMARC" />
            </div>
          </Panel>

          <Panel title="WHOIS" icon={<Calendar className="h-4 w-4" />}>
            <KV k="Owner" v={scan.whois.owner} />
            <KV k="Registrar" v={scan.whois.registrar} />
            <KV k="Created" v={scan.whois.created} mono />
            <KV k="Expires" v={scan.whois.expires} mono />
            <KV k="Age" v={`${scan.whois.ageDays} days`} />
            <KV k="Country" v={scan.whois.country} />
            {scan.whois.newlyRegistered && (
              <div className="mt-2 rounded-md bg-warn/10 ring-1 ring-warn/30 text-warn text-xs px-2 py-1.5 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Newly registered domain
              </div>
            )}
          </Panel>

          <Panel title="SSL / TLS" icon={<Lock className="h-4 w-4" />}>
            <div className="flex items-center justify-between mb-3">
              <Chip ok={scan.ssl.https} label="HTTPS" />
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums font-display" style={{ color: scan.ssl.score >= 80 ? "var(--safe)" : scan.ssl.score >= 60 ? "var(--warn)" : "var(--danger)" }}>{scan.ssl.score}</div>
                <div className="text-[10px] font-mono text-muted-foreground">SSL SCORE</div>
              </div>
            </div>
            <KV k="Valid" v={scan.ssl.valid ? <CheckCircle2 className="h-4 w-4 text-safe" /> : <XCircle className="h-4 w-4 text-danger" />} />
            <KV k="Issuer" v={scan.ssl.issuer} />
            <KV k="Expires" v={scan.ssl.expires} mono />
            <KV k="TLS" v={scan.ssl.tls} mono />
            <KV k="Cipher" v={scan.ssl.strength} mono />
            <KV k="Chain" v={scan.ssl.chainOk ? "Valid" : "Broken"} />
          </Panel>

          <Panel title="Security Headers" icon={<ShieldCheck className="h-4 w-4" />} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-muted-foreground">HTTP Response Headers</div>
              <div className="flex items-center gap-2">
                <div className="w-40 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${scan.headerScore}%`, background: "linear-gradient(90deg, var(--cyan), var(--teal))" }} />
                </div>
                <span className="font-mono text-sm tabular-nums">{scan.headerScore}/100</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {scan.headers.map(h => (
                <div key={h.name} className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="font-mono">{h.name}</span>
                  {h.present
                    ? <CheckCircle2 className="h-4 w-4 text-safe" />
                    : h.severity === "bad" ? <XCircle className="h-4 w-4 text-danger" /> : <AlertTriangle className="h-4 w-4 text-warn" />}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Threat Intelligence" icon={<Radar className="h-4 w-4" />}>
            <div className="space-y-1.5">
              {scan.threatIntel.map(t => (
                <div key={t.source} className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="font-medium">{t.source}</span>
                  {t.hit
                    ? <span className="text-danger font-mono">{t.category} · {t.lastSeen}</span>
                    : <span className="text-safe font-mono flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> CLEAN</span>}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="HTML Analysis" icon={<FileCode2 className="h-4 w-4" />}>
            {Object.entries(scan.html).map(([k, v]) => (
              <KV key={k} k={k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())} v={<span className={`font-mono ${v > 0 && /malicious|hidden|encoded|suspicious/i.test(k) ? "text-danger" : ""}`}>{v}</span>} />
            ))}
          </Panel>

          <Panel title="JavaScript Analysis" icon={<Code2 className="h-4 w-4" />} className="lg:col-span-2">
            {scan.js.length === 0 ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-safe" /> No suspicious JavaScript patterns detected.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {scan.js.map((j, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2 text-xs">
                    <span className="font-mono">{j.indicator}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">×{j.hits}</span>
                      <SeverityChip sev={j.severity} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Network Resources" icon={<Network className="h-4 w-4" />} className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {scan.network.map((n, i) => (
                <div key={i} className={`flex items-center justify-between rounded-md px-3 py-2 text-xs ring-1 ${n.suspicious ? "bg-danger/10 ring-danger/30" : "bg-white/[0.02] ring-white/5"}`}>
                  <span className="font-mono truncate">{n.domain}</span>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">{n.type}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Vulnerabilities" icon={<Bug className="h-4 w-4" />}>
            {scan.vulns.length === 0 ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-safe" /> No passive vulnerability indicators.
              </div>
            ) : scan.vulns.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 text-xs">
                <span>{v.name}</span>
                <SeverityChip sev={v.severity} />
              </div>
            ))}
          </Panel>

          <Panel title="Explainable AI (SHAP)" icon={<Sparkles className="h-4 w-4" />} className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scan.ai.features.map(f => ({ ...f, value: f.contribution * 100 * (f.direction === "up" ? 1 : -1) }))} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="oklch(0.7 0 0)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.7 0 0)" fontSize={11} width={180} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.035 240)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {scan.ai.features.map((f, i) => (
                      <Cell key={i} fill={f.direction === "up" ? "var(--danger)" : "var(--safe)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Red bars push toward malicious; green pulls toward safe. Length = feature contribution.</div>
          </Panel>

          <Panel title="Recommendations" icon={<ClipboardCheck className="h-4 w-4" />} className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {scan.recommendations.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-lg glass p-3 text-sm flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{r}</span>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

function Panel({ title, icon, children, className = "" }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className={`glass rounded-2xl p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="grid place-items-center h-7 w-7 rounded-md bg-primary/10 ring-1 ring-primary/30 text-primary">{icon}</div>
        <h3 className="text-sm font-semibold tracking-wide uppercase font-mono">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </motion.section>
  );
}

function KV({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-xs">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className={`text-right break-all ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
      <div className="text-lg font-semibold font-display tabular-nums">{value}</div>
    </div>
  );
}
function Chip({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono ring-1 ${ok ? "bg-safe/10 text-safe ring-safe/30" : "bg-danger/10 text-danger ring-danger/30"}`}>
    {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{label}
  </span>;
}
function SeverityChip({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    low: "bg-teal/15 text-teal ring-teal/30",
    medium: "bg-warn/15 text-warn ring-warn/30",
    high: "bg-danger/15 text-danger ring-danger/30",
    critical: "bg-critical/15 text-critical ring-critical/30",
    safe: "bg-safe/15 text-safe ring-safe/30",
  };
  return <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-mono uppercase ring-1 ${map[sev] || map.low}`}>{sev}</span>;
}

function downloadJSON(scan: ScanResult) {
  const blob = new Blob([JSON.stringify(scan, null, 2)], { type: "application/json" });
  triggerDownload(blob, `${scan.host}-${scan.id}.json`);
}
function downloadCSV(scan: ScanResult) {
  const rows = [
    ["field","value"],
    ["id", scan.id], ["url", scan.url], ["host", scan.host], ["verdict", scan.verdict],
    ["threatScore", String(scan.threatScore)], ["confidence", String(scan.confidence)],
    ["risk", scan.risk], ["ip", scan.dns.ip], ["country", scan.dns.country],
    ["registrar", scan.whois.registrar], ["created", scan.whois.created], ["ageDays", String(scan.whois.ageDays)],
    ["sslScore", String(scan.ssl.score)], ["headerScore", String(scan.headerScore)],
    ["threatIntelHits", String(scan.threatIntel.filter(t=>t.hit).length)],
  ];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv" }), `${scan.host}-${scan.id}.csv`);
}
function triggerDownload(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
