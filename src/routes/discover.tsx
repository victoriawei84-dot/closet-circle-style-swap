import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { recommend, getUser } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ItemCard, Chip, DemoTag, btn, input } from "@/components/ui-kit";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [
    { title: "Discover — SisUse" },
    { name: "description", content: "Find outfits for any occasion from closets in your neighborhood." },
    { property: "og:title", content: "Discover looks nearby — SisUse" },
    { property: "og:description", content: "AI-inspired outfit picks from neighbors' closets." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Discover,
});

const cats = ["All", "Dress", "Top", "Bottom", "Suit", "Shoes", "Bag", "Jewelry", "Accessory"];

function Discover() {
  const { soulmates, allItems, postRequest, favorites, savedPosts, allPosts } = useStore();
  const savedPostItems = allPosts.filter((p) => savedPosts.includes(p.id)).flatMap((p) => [p.itemId, ...(p.alsoTagged ?? [])]);
  const [q, setQ] = useState({ occasion: "Wedding", date: "2026-11-21", size: "S", budget: 80, zip: "94110" });
  const [results, setResults] = useState<ReturnType<typeof recommend> | null>(null);
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState("All");
  const [maxDist, setMaxDist] = useState(5);
  const [maxPrice, setMaxPrice] = useState(50);
  const [req, setReq] = useState("");

  const run = () => { setLoading(true); setResults(null); setTimeout(() => { setResults(recommend(q, { soulmates, favorites, savedPostItems }, allItems).slice(0, 3)); setLoading(false); }, 900); };
const filtered = useMemo(() => allItems.filter((i) => (!i.real || i.published) && (cat === "All" || i.category === cat) && i.distance <= maxDist && i.dailyRate <= maxPrice), [allItems, cat, maxDist, maxPrice]);
  const fromSoulmates = allItems.filter((i) => soulmates.includes(i.ownerId));

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-hero p-6 md:p-10">
                <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight md:text-6xl">What are you dressing for?</h1>
        <div className="mt-6 grid gap-3 rounded-2xl bg-card/80 p-4 shadow-soft md:grid-cols-6">
          <label className="md:col-span-2 text-xs text-muted-foreground">Occasion<input className={input} value={q.occasion} onChange={(e) => setQ({ ...q, occasion: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Date<input type="date" className={input} value={q.date} onChange={(e) => setQ({ ...q, date: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Size<select className={input} value={q.size} onChange={(e) => setQ({ ...q, size: e.target.value })}>{["XS", "S", "M", "L"].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="text-xs text-muted-foreground">Budget ($)<input type="number" className={input} value={q.budget} onChange={(e) => setQ({ ...q, budget: +e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">ZIP<input className={input} value={q.zip} onChange={(e) => setQ({ ...q, zip: e.target.value })} /></label>
          <button onClick={run} className={btn + " md:col-span-6"}><Sparkles className="h-4 w-4" />Style me</button>
        </div>
      </section>

      {(loading || results) && (
        <section>
          <div className="mb-4 flex items-center gap-3"><h2 className="text-3xl">Picked for your {q.occasion.toLowerCase()}</h2><DemoTag /></div>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />)}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {results!.length === 0 && <p className="text-sm text-muted-foreground">No pieces fit that date, size and budget — try widening your budget.</p>}
              {results!.map(({ item, reasons }, i) => (
                <div key={item.id}>
                  <ItemCard item={item} badge={reasons[0] ?? (i === 0 ? "Best match" : undefined)} />
                  <p className="-mt-2 px-1 text-xs text-muted-foreground">Why: {reasons.length ? reasons.join(" · ").toLowerCase() + " · " : ""}fits {(item.occasions[0] ?? "").toLowerCase()} · size {item.size} · from {getUser(item.ownerId).name}'s closet</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {fromSoulmates.length > 0 && (
        <section>
          <h2 className="mb-4 text-3xl">From your Closet Soulmates</h2>
          <div className="columns-2 gap-4 md:columns-4">{fromSoulmates.map((i) => <ItemCard key={i.id} item={i} />)}</div>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">Browse nearby</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <label className="flex items-center gap-2">≤ {maxDist} mi<input type="range" min={1} max={5} step={0.5} value={maxDist} onChange={(e) => setMaxDist(+e.target.value)} /></label>
            <label className="flex items-center gap-2">≤ ${maxPrice}/day<input type="range" min={10} max={50} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} /></label>
          </div>
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto">{cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
        {filtered.length ? <div className="columns-2 gap-4 md:columns-3 lg:columns-4">{filtered.map((i) => <ItemCard key={i.id} item={i} />)}</div>
          : <p className="text-sm text-muted-foreground">Nothing matches — try widening your filters or post a request below.</p>}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-2xl">Can't find it? Request an outfit</h2>
        <p className="text-sm text-muted-foreground">Neighbors with matching pieces will be notified.</p>
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!req.trim()) return; postRequest(req); setReq(""); toast.success("Request posted to your neighborhood"); }}>
          <input className={input} placeholder="e.g. Emerald satin dress, size S, Dec 6" value={req} onChange={(e) => setReq(e.target.value)} />
          <button className={btn}><Search className="h-4 w-4" />Post</button>
        </form>
      </section>
    </div>
  );
}
