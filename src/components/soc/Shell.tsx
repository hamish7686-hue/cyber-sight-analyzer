import { Link } from "@tanstack/react-router";
import { Shield, LayoutDashboard, ScanLine, History, Bell, User } from "lucide-react";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Shield className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 rounded-lg animate-pulse-ring" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">Sentinel Vision</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">SOC • v1.0</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" icon={<ScanLine className="h-4 w-4" />} label="Scanner" />
          <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavLink to="/history" icon={<History className="h-4 w-4" />} label="History" />
        </nav>
        <div className="flex items-center gap-2">
          <button className="relative rounded-md p-2 hover:bg-white/5" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-critical" />
          </button>
          <div className="flex items-center gap-2 rounded-full glass px-2.5 py-1">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 ring-1 ring-primary/40">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="hidden sm:inline text-xs font-medium">Analyst</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
      activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground bg-white/5" }}
      activeOptions={{ exact: to === "/" }}
    >
      {icon}{label}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border/50 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
          All systems operational · Threat feed synced
        </div>
        <div>© {new Date().getFullYear()} Sentinel Vision · Enterprise SOC Platform</div>
      </div>
    </footer>
  );
}
