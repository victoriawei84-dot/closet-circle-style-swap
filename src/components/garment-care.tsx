import { useState } from "react";
import { MapPin, Navigation, Shirt } from "lucide-react";
import type { Item } from "@/lib/data";
import { DemoTag, input } from "@/components/ui-kit";

type Kind = "Dry cleaning" | "Laundry" | "Leather care";
type Provider = { name: string; kind: Kind[]; area: string; mi: number };
/** Sample providers only — no places integration is connected. */
const SAMPLE: Provider[] = [
  { name: "Valencia Garment Care", kind: ["Dry cleaning"], area: "Mission", mi: 0.4 },
  { name: "Bluebird Wash & Fold", kind: ["Laundry"], area: "Mission", mi: 0.7 },
  { name: "Bernal Eco Cleaners", kind: ["Dry cleaning", "Laundry"], area: "Bernal Heights", mi: 1.1 },
  { name: "SoMa Leather & Suede Studio", kind: ["Leather care"], area: "SoMa", mi: 1.8 },
  { name: "Noe Valley Fine Cleaners", kind: ["Dry cleaning"], area: "Noe Valley", mi: 2.2 },
];

export function careType(item?: Item): Kind | null {
  const c = (item?.care ?? "").toLowerCase();
  if (!c) return null;
  if (item?.category === "Bag" || item?.category === "Shoes" || c.includes("leather")) return "Leather care";
  if (c.includes("dry clean")) return "Dry cleaning";
  return "Laundry";
}

export function GarmentCare({ item, defaultArea }: { item?: Item | undefined; defaultArea: string }) {
  const [area, setArea] = useState(defaultArea);
  const rec = careType(item);
  const list = [...SAMPLE].sort((a, b) => Number(rec ? b.kind.includes(rec) : 0) - Number(rec ? a.kind.includes(rec) : 0) || a.mi - b.mi);
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl">Nearby garment care</h2><DemoTag>Sample recommendations</DemoTag>
      </div>
      {item && (
        <div className="flex gap-2 rounded-xl bg-muted p-3 text-sm">
          <Shirt className="mt-0.5 h-4 w-4 shrink-0" />
          <div><p className="font-medium">{item.title} — care instructions</p><p className="text-muted-foreground">{item.care ?? "No care instructions from the owner yet. Ask before cleaning."}</p>
            {rec && <p className="mt-1 text-accent-foreground">Suggested: {rec}</p>}</div>
        </div>
      )}
      <label className="block text-xs text-muted-foreground">Search area (ZIP or neighborhood)<input className={input} value={area} onChange={(e) => setArea(e.target.value)} /></label>
      <ul className="divide-y divide-border">{list.map((p) => (
        <li key={p.name} className="flex items-center justify-between gap-3 py-3 text-sm">
          <div><p className="font-medium">{p.name}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{p.kind.join(" · ")} · ~{p.mi} mi · {p.area}{rec && p.kind.includes(rec) && <span className="ml-1 rounded-full bg-accent px-2 text-accent-foreground">Matches care</span>}</p></div>
          <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.kind[0]} near ${area || "San Francisco"}`)}`} className="flex shrink-0 items-center gap-1 text-xs underline"><Navigation className="h-3 w-3" />View directions</a>
        </li>))}</ul>
      <p className="text-xs text-muted-foreground">Sample providers for the demo — names and distances are illustrative. Directions open a map search for that service near your area.</p>
    </section>
  );
}
