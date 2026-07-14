import { motion } from "framer-motion";

export function ThreatGauge({ score, size = 220 }: { score: number; size?: number }) {
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = score >= 85 ? "var(--critical)" : score >= 65 ? "var(--danger)" : score >= 40 ? "var(--warn)" : score >= 20 ? "var(--teal)" : "var(--safe)";
  const label = score >= 85 ? "CRITICAL" : score >= 65 ? "HIGH" : score >= 40 ? "MEDIUM" : score >= 20 ? "LOW" : "SAFE";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="10" fill="none" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} stroke="url(#gauge-g)" strokeWidth="10" fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <motion.div
            className="font-display text-5xl font-bold tabular-nums"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ color }}
          >
            {score}
          </motion.div>
          <div className="text-[10px] font-mono tracking-[0.25em] mt-1" style={{ color }}>{label}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">AI THREAT SCORE</div>
        </div>
      </div>
    </div>
  );
}
