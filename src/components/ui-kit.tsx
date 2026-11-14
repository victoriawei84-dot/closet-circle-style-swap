import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Compass, Users, Shirt, CalendarCheck, Sparkles, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { getUser, type Item } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/stylist", label: "AI Stylist", icon: Sparkles },
  { to: "/community", label: "Community", icon: Users },
  { to: "/closet", label: "My Closet", icon: Shirt },
  { to: "/rentals", label: "Rentals", icon: CalendarCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { points } = useStore();
  if (pathname === "/") return <>{children}</>;
  const active = (to: string) => (to === "/discover" ? pathname === "/discover" || pathname.startsWith("/item") : pathname.startsWith(to) || (to === "/community" && pathname.startsWith("/user")));
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-display text-2xl tracking-normal">Sis<em className="text-sage">Use</em></Link>
          <nav className="hidden gap-1 md:flex">
            {tabs.map((t) => (
              <Link key={t.to} to={t.to} className={cn("rounded-full px-4 py-2 text-sm transition", active(t.to) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{t.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"><Sparkles className="h-3 w-3" />{points} pts</span>
            <Link to="/profile" aria-label="Profile" className={cn("grid h-9 w-9 place-items-center rounded-full border border-border", pathname === "/profile" ? "bg-primary text-primary-foreground" : "bg-card")}><UserRound className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 animate-fade-up" key={pathname}>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur md:hidden">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} className={cn("flex flex-col items-center gap-1 py-3 text-[11px]", active(t.to) ? "text-foreground" : "text-muted-foreground")}>
            <t.icon className="h-5 w-5" />{t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function HeartButton({ active, onClick, className }: { active: boolean; onClick: () => void; className?: string }) {
  const [k, setK] = useState(0);
  return (
    <button aria-label={active ? "Unsave" : "Save"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setK(k + 1); onClick(); }}
      className={cn("grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-soft", className)}>
      <Heart key={k} className={cn("h-4 w-4", k && "animate-heart", active ? "fill-blush text-blush" : "text-foreground")} />
    </button>
  );
}

export function Avatar({ id, size = 40 }: { id: string; size?: number }) {
  const u = getUser(id);
  return u.avatar ? <img src={u.avatar} alt={u.name} width={size} height={size} style={{ width: size, height: size }} className="rounded-full object-cover" loading="lazy" />
    : <span style={{ width: size, height: size }} className="grid place-items-center rounded-full bg-secondary font-medium text-secondary-foreground">{u.name[0]}</span>;
}

export function ItemCard({ item, badge }: { item: Item; badge?: string | undefined }) {
  const { favorites, toggleFav } = useStore();
  const owner = getUser(item.ownerId);
  return (
    <Link to="/item/$id" params={{ id: item.id }} className="group mb-4 block break-inside-avoid">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <img src={item.image} alt={item.title} loading="lazy" className="w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <HeartButton active={favorites.includes(item.id)} onClick={() => toggleFav(item.id)} className="absolute right-3 top-3" />
        {badge && <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">{badge}</span>}
      </div>
      <div className="mt-2 flex items-start justify-between gap-2 px-1">
        <div>
          <p className="text-sm font-medium leading-tight">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.brand} · Size {item.size} · {owner.neighborhood} · {item.distance} mi</p>
        </div>
        <p className="whitespace-nowrap text-sm font-semibold">${item.dailyRate}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
      </div>
    </Link>
  );
}

export const Chip = ({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className={cn("whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>{children}</button>
);
export const DemoTag = ({ children = "Demo · simulated AI" }: { children?: ReactNode }) => (
  <span className="rounded-full border border-dashed border-sage px-2 py-0.5 text-[10px] uppercase tracking-normalr text-accent-foreground">{children}</span>
);
export const btn = "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-muted";
export const input = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
