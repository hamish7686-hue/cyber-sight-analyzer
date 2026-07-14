import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe, ScanLine, Loader2 } from "lucide-react";
import { generateScan, saveHistory, normalizeUrl } from "@/lib/mock-scan";

export function ScanInput({ big = false }: { big?: boolean }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeUrl(url);
    if (!clean) return;
    setLoading(true);
    // brief delay so the button animation reads
    await new Promise(r => setTimeout(r, 350));
    const scan = generateScan(clean);
    saveHistory(scan);
    navigate({ to: "/scan/$id", params: { id: scan.id } });
  };

  return (
    <form onSubmit={submit} className={`w-full ${big ? "max-w-3xl" : "max-w-2xl"} mx-auto`}>
      <div className="relative glass-strong rounded-2xl p-2 glow-cyan">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="flex items-center flex-1 gap-3 px-4">
            <Globe className="h-5 w-5 text-primary shrink-0" />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`w-full bg-transparent outline-none ${big ? "text-lg py-4" : "text-base py-3"} font-mono placeholder:text-muted-foreground/60`}
              autoComplete="off" spellCheck={false}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={loading || !url.trim()}
            className={`relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-accent px-6 ${big ? "py-4 text-base" : "py-3 text-sm"} font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed glow-cyan`}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
            {loading ? "Scanning..." : "Scan Website"}
          </motion.button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Try:</span>
        {["https://google.com", "https://secure-login-verify.top", "https://github.com", "https://free-wallet-bonus.click"].map(s => (
          <button key={s} type="button" onClick={() => setUrl(s)}
            className="rounded-full glass px-2.5 py-1 hover:bg-white/5 font-mono">
            {s.replace("https://","")}
          </button>
        ))}
      </div>
    </form>
  );
}
