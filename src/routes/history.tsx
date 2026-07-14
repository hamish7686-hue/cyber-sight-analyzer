import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/soc/Shell";
import { useEffect, useMemo, useState } from "react";
import { getHistory, type ScanResult } from "@/lib/mock-scan";
import { VerdictBadge } from "@/routes/index";
import { Search } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Scan History — Sentinel Vision" }, { name: "description", content: "All previously scanned websites, searchable by domain, risk and country." }] }),
  component: History,
});

function History() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  useEffect(() => { setHistory(getHistory()); }, []);
  const filtered = useMemo(() => history.filter(s => {
    const matchesQ = !q || s.host.toLowerCase().includes(q.toLowerCase()) || s.dns.country.toLowerCase().includes(q.toLowerCase());
    const matchesF = filter === "all" || s.verdict === filter;
    return matchesQ && matchesF;
  }), [history, q, filter]);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Archive</div>
            <h1 className="text-3xl font-bold font-display mt-1">Scan History</h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="glass rounded-xl flex items-center gap-2 px-3 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by domain or country…"
              className="bg-transparent outline-none flex-1 py-2.5 text-sm" />
          </div>
          <div className="glass rounded-xl px-2 py-1 flex gap-1">
            {["all","Safe","Suspicious","Malicious","Phishing"].map(v => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${filter===v ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
            No scans yet. <Link to="/" className="text-primary hover:underline">Run your first scan →</Link>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
                <tr>
                  <th className="text-left px-4 py-3 font-mono">Host</th>
                  <th className="text-left px-4 py-3 font-mono">Verdict</th>
                  <th className="text-left px-4 py-3 font-mono">Score</th>
                  <th className="text-left px-4 py-3 font-mono">Country</th>
                  <th className="text-left px-4 py-3 font-mono">Date</th>
                  <th className="text-right px-4 py-3 font-mono">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-t border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono">{s.host}</td>
                    <td className="px-4 py-3"><VerdictBadge verdict={s.verdict} /></td>
                    <td className="px-4 py-3 font-mono tabular-nums">{s.threatScore}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.dns.country}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(s.scannedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/scan/$id" params={{ id: s.id }} className="text-primary hover:underline text-xs font-mono">OPEN →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
