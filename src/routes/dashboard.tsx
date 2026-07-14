import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/soc/Shell";
import { useEffect, useMemo, useState } from "react";
import { getHistory, type ScanResult } from "@/lib/mock-scan";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, RadialBarChart, RadialBar, Legend } from "recharts";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Skull, Fish, Activity, Gauge, Radar, Flag } from "lucide-react";
import { VerdictBadge } from "@/routes/index";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Sentinel Vision" }, { name: "description", content: "SOC dashboard: threat distribution, risk levels, and monthly scan trends." }] }),
  component: Dashboard,
});

const COLORS = {
  safe: "oklch(0.75 0.17 155)",
  low: "oklch(0.72 0.15 190)",
  medium: "oklch(0.82 0.16 85)",
  high: "oklch(0.68 0.21 35)",
  critical: "oklch(0.62 0.24 25)",
  cyan: "oklch(0.82 0.14 200)",
};

function Dashboard() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  useEffect(() => { setHistory(getHistory()); }, []);

  const stats = useMemo(() => {
    const total = history.length || 24;
    const by = (v: string) => history.filter(s => s.verdict === v).length;
    const avg = history.length ? Math.round(history.reduce((a,b) => a + b.threatScore, 0) / history.length) : 42;
    return {
      total,
      safe: by("Safe") || 9,
      suspicious: by("Suspicious") || 7,
      malicious: by("Malicious") || 5,
      phishing: by("Phishing") || 3,
      avg,
      critical: history.filter(s => s.risk === "critical").length || 4,
      tiHits: history.reduce((a,s) => a + s.threatIntel.filter(t=>t.hit).length, 0) || 38,
    };
  }, [history]);

  const cards = [
    { label: "Websites Scanned", value: stats.total, icon: Radar, tone: "cyan" },
    { label: "Safe", value: stats.safe, icon: Shield, tone: "safe" },
    { label: "Suspicious", value: stats.suspicious, icon: AlertTriangle, tone: "warn" },
    { label: "Malicious", value: stats.malicious, icon: Skull, tone: "danger" },
    { label: "Phishing", value: stats.phishing, icon: Fish, tone: "critical" },
    { label: "Avg Risk Score", value: stats.avg, icon: Gauge, tone: "cyan" },
    { label: "Critical Sites", value: stats.critical, icon: AlertTriangle, tone: "critical" },
    { label: "Threat Intel Hits", value: stats.tiHits, icon: Activity, tone: "warn" },
  ];

  const threatData = [
    { name: "Safe", value: stats.safe, fill: COLORS.safe },
    { name: "Suspicious", value: stats.suspicious, fill: COLORS.medium },
    { name: "Malicious", value: stats.malicious, fill: COLORS.high },
    { name: "Phishing", value: stats.phishing, fill: COLORS.critical },
  ];
  const monthly = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({
    month: m, scans: Math.round(200 + Math.sin(i)*80 + i*15 + Math.random()*40),
    threats: Math.round(30 + Math.cos(i*1.3)*20 + i*4 + Math.random()*10),
  }));
  const categories = [
    { name: "Business", value: 34 }, { name: "Finance", value: 18 },
    { name: "Social", value: 14 }, { name: "Streaming", value: 9 },
    { name: "Crypto", value: 12 }, { name: "Shopping", value: 13 },
  ];
  const risks = [
    { name: "Safe", value: stats.safe, fill: COLORS.safe },
    { name: "Low", value: 6, fill: COLORS.low },
    { name: "Medium", value: stats.suspicious, fill: COLORS.medium },
    { name: "High", value: stats.malicious, fill: COLORS.high },
    { name: "Critical", value: stats.phishing + stats.critical, fill: COLORS.critical },
  ];
  const tiSources = [
    { source: "VirusTotal", hits: 42 }, { source: "Google SB", hits: 18 },
    { source: "AbuseIPDB", hits: 25 }, { source: "AlienVault", hits: 12 },
    { source: "URLHaus", hits: 9 }, { source: "PhishTank", hits: 15 },
  ];
  const countries = [
    { country: "US", n: 38 }, { country: "DE", n: 22 }, { country: "RU", n: 19 },
    { country: "CN", n: 17 }, { country: "NL", n: 14 }, { country: "UA", n: 11 }, { country: "BR", n: 8 },
  ];

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Security Operations Center</div>
          <h1 className="text-3xl font-bold font-display mt-1">Threat Intelligence Overview</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((c, i) => (
            <motion.div key={c.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.04 }}
              className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{c.label}</span>
                <c.icon className={`h-4 w-4 ${toneClass(c.tone)}`} />
              </div>
              <div className={`mt-2 text-3xl font-bold font-display tabular-nums ${toneClass(c.tone)}`}>{c.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Threat Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threatData} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {threatData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Legend2 items={threatData} />
          </Card>

          <Card title="Monthly Scans & Threats" wide>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="month" stroke="oklch(0.7 0 0)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="scans" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="threats" stroke={COLORS.critical} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Website Categories">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories}>
                  <XAxis dataKey="name" stroke="oklch(0.7 0 0)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill={COLORS.cyan} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Risk Levels">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="20%" outerRadius="90%" data={risks} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={6} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <Legend2 items={risks} />
          </Card>

          <Card title="Threat Intelligence Sources" wide>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tiSources} layout="vertical" margin={{ left: 40 }}>
                  <XAxis type="number" stroke="oklch(0.7 0 0)" fontSize={11} />
                  <YAxis type="category" dataKey="source" stroke="oklch(0.7 0 0)" fontSize={11} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="hits" fill={COLORS.critical} radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Country Distribution">
            <div className="space-y-2 py-2">
              {countries.map(c => (
                <div key={c.country} className="flex items-center gap-3">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs w-8">{c.country}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.n*2}%`, background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.critical})` }} />
                  </div>
                  <span className="tabular-nums text-xs font-mono w-8 text-right">{c.n}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {history.length > 0 && (
          <Card title="Latest scans" wide>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="text-left py-2 font-mono">Host</th><th className="text-left py-2 font-mono">Verdict</th><th className="text-left py-2 font-mono">Score</th><th className="text-left py-2 font-mono">Country</th></tr>
              </thead>
              <tbody>
                {history.slice(0,6).map(s => (
                  <tr key={s.id} className="border-t border-border/50">
                    <td className="py-2 font-mono">{s.host}</td>
                    <td className="py-2"><VerdictBadge verdict={s.verdict} /></td>
                    <td className="py-2 font-mono tabular-nums">{s.threatScore}</td>
                    <td className="py-2 text-muted-foreground">{s.dns.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </Shell>
  );
}

const tooltipStyle = { background: "oklch(0.19 0.035 240)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 };

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}
function Legend2({ items }: { items: { name: string; value: number; fill: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map(i => (
        <div key={i.name} className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="h-2 w-2 rounded-full" style={{ background: i.fill }} />
          <span className="text-muted-foreground">{i.name}</span>
          <span className="tabular-nums">{i.value}</span>
        </div>
      ))}
    </div>
  );
}
function toneClass(t: string) {
  return t === "safe" ? "text-safe" : t === "warn" ? "text-warn" : t === "danger" ? "text-danger" : t === "critical" ? "text-critical" : "text-primary";
}
