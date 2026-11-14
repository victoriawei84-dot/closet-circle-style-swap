import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, EyeOff, Loader2, MapPin, RefreshCw, Repeat, Bookmark, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/lib/data";
import { useStore } from "@/lib/store";
import { getHotspots, buildOutfit, candidates, type Prefs, type Slot, type Spot } from "@/lib/stylist";
import { taggedIds } from "@/lib/community";
import { streamImage } from "@/lib/stream-image";
import { toBlob } from "@/components/preview-on-me";
import { Avatar, Chip, btn, btnGhost, input } from "@/components/ui-kit";
import { PersonalStyling } from "@/components/personal-styling";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stylist")({
  head: () => ({ meta: [
    { title: "AI Stylist — SisUse" },
    { name: "description", content: "Pick a place, choose a pose, and see a look styled from pieces you can actually rent from neighbors." },
    { property: "og:title", content: "AI Stylist — SisUse" },
    { property: "og:description", content: "Outfit ideas for your next photo spot, built only from rentable pieces." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Stylist,
});

const OCCASIONS = ["Date", "Brunch", "Travel", "Party", "Everyday"];
const STYLES = ["Minimal", "French", "Sweet", "Vintage", "Street", "Elegant"];
const SLOT_LABEL: Record<Slot, string> = { main: "Outfit", bag: "Bag", shoes: "Shoes" };
const daysBetween = (a: string, b: string) => Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1);

function Stylist() {
  const s = useStore();
  const [place, setPlace] = useState("San Francisco");
  const [{ city, spots }, setHot] = useState(() => getHotspots("San Francisco"));
  const [spot, setSpot] = useState<Spot | null>(spots[0]!);
  const [customScene, setCustomScene] = useState("");
  const [occasion, setOccasion] = useState("Brunch");
  const [style, setStyle] = useState("Minimal");
  const [start, setStart] = useState("2026-11-20");
  const [end, setEnd] = useState("2026-11-21");
  const [size, setSize] = useState("S");
  const [budget, setBudget] = useState(150);
  const [radius, setRadius] = useState(3);
  const [mode, setMode] = useState<"photo" | "noface">("noface");
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [poseRef, setPoseRef] = useState<File | null>(null);
  const [pick, setPick] = useState<Partial<Record<Slot, number>>>({});
  const [img, setImg] = useState(""); const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [step, setStep] = useState(1); // mobile stepper
  const [tab, setTab] = useState<"preview" | "personal">("preview");

  const prefs: Prefs = { occasion, style, size, budget, radius, start, end, days: daysBetween(start, end) };
  const outfit = useMemo(() => buildOutfit(s.allItems, prefs, pick), [s.allItems, occasion, style, size, budget, radius, start, end, pick]);
  const pieces = (Object.entries(outfit.slots) as [Slot, NonNullable<(typeof outfit.slots)[Slot]>][]);
  const inspiration = s.allPosts.filter((p) => pieces.some(([, i]) => taggedIds(p).includes(i.id)));
  const scene = customScene.trim() || (spot ? `${spot.name}, ${spot.area}` : place);
  const pose = spot?.pose ?? "Relaxed walking pose";
  const noFace = mode === "noface" || !photo || !consent;

  const search = () => { const h = getHotspots(place); setHot(h); setSpot(h.spots[0]!); };
  const swap = (slot: Slot) => {
    const n = candidates(slot, s.allItems, prefs).length;
    if (n < 2) { toast("No other matching piece for this slot right now"); return; }
    setPick({ ...pick, [slot]: ((pick[slot] ?? 0) + 1) % n });
  };
  const generate = async () => {
    if (!pieces.length) return;
    setBusy(true); setErr(""); setImg(""); setFinal(false);
    try {
      const fd = new FormData();
      for (const [, i] of pieces) fd.append("item", new File([await toBlob(i.image)], `${i.id}.jpg`, { type: "image/jpeg" }));
      if (!noFace && photo) fd.append("person", photo);
      if (poseRef) fd.append("pose", poseRef);
      if (spot && !customScene.trim()) fd.append("sceneImage", new File([await toBlob(spot.image)], "scene.jpg", { type: "image/jpeg" }));
      fd.append("titles", pieces.map(([, i]) => i.title).join(", "));
      fd.append("scene", scene); fd.append("poseText", pose);
      await streamImage("/api/stylist-look", fd, (u, f) => { setImg(u); setFinal(f); });
      setStep(3);
    } catch (e) { console.error(e); setErr("The AI look couldn't be created. Check your connection and try again."); }
    finally { setBusy(false); }
  };
  const onPhoto = (f?: File, set = setPhoto) => { if (!f) return; if (f.size > 8 * 1024 * 1024) { toast.error("Use a photo under 8 MB"); return; } set(f); };

  const settings = (
    <div className="space-y-6">
      <section className={cn("space-y-3", step !== 1 && "hidden md:block")}>
        <p className="font-display text-2xl">1 · Where are you going?</p>
        <div className="flex gap-2"><input className={input} value={place} onChange={(e) => setPlace(e.target.value.slice(0, 80))} placeholder="City, neighborhood or landmark — e.g. SoHo" onKeyDown={(e) => e.key === "Enter" && search()} /><button onClick={search} className={btnGhost}>Find</button></div>
        <p className="text-xs text-muted-foreground">Popular photo spots in {city} <span className="text-muted-foreground/70">(demo list)</span>{city !== "San Francisco" && " · pieces are picked up in San Francisco before your trip"}</p>
        <div className="grid grid-cols-2 gap-2">{spots.map((sp) => (
          <button key={sp.id} onClick={() => { setSpot(sp); setCustomScene(""); }} className={cn("relative overflow-hidden rounded-2xl text-left ring-2 transition", spot?.id === sp.id && !customScene ? "ring-primary" : "ring-transparent")}>
            <img src={sp.image} alt={sp.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-2 text-xs text-ink-foreground">{sp.name}<br /><span className="opacity-80">{sp.zip}</span></span>
          </button>))}</div>
        <input className={input} value={customScene} onChange={(e) => setCustomScene(e.target.value.slice(0, 120))} placeholder="Or describe your own scene" />
      </section>
      <section className={cn("space-y-3", step !== 1 && "hidden md:block")}>
        <p className="font-display text-2xl">2 · Your look</p>
        <div className="flex flex-wrap gap-1.5">{OCCASIONS.map((o) => <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>{o}</Chip>)}</div>
        <div className="flex flex-wrap gap-1.5">{STYLES.map((o) => <Chip key={o} active={style === o} onClick={() => setStyle(o)}>{o}</Chip>)}</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <label>From<input type="date" className={input} value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label>To<input type="date" className={input} min={start} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          <label>Size<select className={input} value={size} onChange={(e) => setSize(e.target.value)}>{["XS", "S", "M", "L"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label>Budget for the rental (${budget})<input type="range" min={20} max={400} step={10} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-primary" /></label>
          <label className="col-span-2">Pickup within {radius} mi<input type="range" min={1} max={5} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-primary" /></label>
        </div>
      </section>
      <section className={cn("space-y-3", step !== 2 && "hidden md:block")}>
        <p className="font-display text-2xl">3 · How should you appear?</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMode("photo")} className={cn("rounded-2xl border p-3 text-left text-sm", mode === "photo" ? "border-primary bg-secondary/50" : "border-border")}><Camera className="mb-1 h-4 w-4" />Upload my photo</button>
          <button onClick={() => setMode("noface")} className={cn("rounded-2xl border p-3 text-left text-sm", mode === "noface" ? "border-primary bg-secondary/50" : "border-border")}><EyeOff className="mb-1 h-4 w-4" />No-face mode</button>
        </div>
        {mode === "photo" ? (
          <div className="space-y-2">
            {photo ? (
              <div className="flex items-center gap-3"><img src={URL.createObjectURL(photo)} alt="Your photo" className="h-24 w-20 rounded-xl object-cover" />
                <label className={btnGhost + " cursor-pointer"}>Replace<input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
                <button aria-label="Remove photo" onClick={() => { setPhoto(null); setConsent(false); }} className="text-muted-foreground"><Trash2 className="h-4 w-4" /></button></div>
            ) : <label className={btnGhost + " w-full cursor-pointer"}><Camera className="h-4 w-4" />Take or choose a photo<input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} /></label>}
            <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />I agree to send this photo once to create my styling preview. It isn't saved or shown to anyone.</label>
            {photo && !consent && <p className="text-xs text-muted-foreground">Until you agree, we'll use no-face mode.</p>}
          </div>
        ) : <p className="text-xs text-muted-foreground">We'll use a natural faceless pose — back view, phone over the face, or a neck-down crop. No stranger's face is invented.</p>}
        <label className="block text-xs text-muted-foreground">Pose reference (optional)
          <input type="file" accept="image/*" className={input} onChange={(e) => onPhoto(e.target.files?.[0], setPoseRef)} /></label>
      </section>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div><h1 className="text-5xl">AI <em>Stylist</em></h1><p className="text-muted-foreground">Pick a place, choose how you appear, and we'll style a look from pieces neighbors actually lend.</p></div>
      <div className="flex max-w-md rounded-full bg-muted p-1">
        {([["preview", "Styling preview"], ["personal", "Personal styling"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("flex-1 rounded-full px-4 py-2 text-sm", tab === k ? "bg-card shadow-soft" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>
      {tab === "preview" && <div className="grid gap-8 md:grid-cols-[360px_1fr]">
        <aside>{settings}</aside>
        <section className={cn("space-y-5", step !== 3 && "hidden md:block")}>
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <figure className="relative overflow-hidden rounded-3xl bg-muted">
              {img ? <img src={img} alt="AI styling preview" className={cn("w-full transition-[filter] duration-500", final ? "blur-0" : "blur-2xl")} />
                : <div className="grid aspect-[2/3] place-items-center p-8 text-center text-sm text-muted-foreground">{busy ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Styling your look…</span> : pieces.length ? "Your look will appear here. Tap Generate look." : "No pieces match yet — try a bigger budget, another size, or a wider pickup range."}</div>}
              {img && <figcaption className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium">AI styling preview{noFace ? " · no-face" : ""}</figcaption>}
              {img && final && <div className="absolute right-3 top-3 flex flex-col gap-2">{pieces.map(([slot, i], n) => (
                <a key={slot} href={`#piece-${i.id}`} title={i.title} className="grid h-8 w-8 place-items-center rounded-full bg-card/90 text-xs font-medium shadow-soft">{n + 1}</a>))}</div>}
            </figure>
            <div className="space-y-3">
              <p className="font-display text-3xl capitalize">{outfit.name}</p>
              <p className="text-sm text-muted-foreground">{outfit.reason}</p>
              <p className="flex items-start gap-1 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{scene}</p>
              <p className="text-sm text-muted-foreground">Pose: {pose}</p>
              <p className="flex justify-between border-t border-border pt-3 text-sm"><span>Rental total · {prefs.days} {prefs.days === 1 ? "day" : "days"}</span><b>${outfit.total}</b></p>
              <p className="text-[11px] text-muted-foreground">Before deposits and cleaning fees. Availability is confirmed by each owner — nothing is booked yet.</p>
              <div className="grid gap-2">
                <button onClick={generate} disabled={busy || !pieces.length} className={btn}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : img ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{img ? "Regenerate" : "Generate look"}</button>
                <button disabled={!pieces.length} onClick={() => { s.saveOutfit({ name: outfit.name, place: scene, itemIds: pieces.map(([, i]) => i.id) }); toast.success("Outfit saved"); }} className={btnGhost}><Bookmark className="h-4 w-4" />Save outfit</button>
                {pieces[0] && <Link to="/item/$id" params={{ id: pieces[0][1].id }} className={btnGhost}>View rental</Link>}
              </div>
              {err && <p className="text-xs text-destructive">{err} <button onClick={generate} className="underline">Retry</button></p>}
              {outfit.missing.length > 0 && pieces.length > 0 && <p className="text-xs text-muted-foreground">No matching {outfit.missing.map((m) => SLOT_LABEL[m].toLowerCase()).join(" or ")} within your filters — wear your own.</p>}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">AI-generated looks are styling references only. Actual color, cut and fit depend on the real piece.</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{pieces.map(([slot, i], n) => {
            const owner = getUser(i.ownerId);
            return (
              <div key={slot} id={`piece-${i.id}`} className="space-y-2 rounded-2xl border border-border bg-card p-3">
                <div className="flex gap-3"><img src={i.image} alt={i.title} className="h-24 w-20 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0 text-sm"><p className="text-xs text-muted-foreground">{n + 1} · {SLOT_LABEL[slot]}</p><p className="font-medium leading-tight">{i.title}</p><p className="text-xs text-muted-foreground">Size {i.size} · ${i.dailyRate}/day</p></div></div>
                <Link to="/user/$id" params={{ id: owner.id }} className="flex items-center gap-2 text-xs"><Avatar id={owner.id} size={22} />Owner · {owner.name}</Link>
                <div className="flex gap-2 text-xs">
                  <Link to="/item/$id" params={{ id: i.id }} className="rounded-full border border-border px-3 py-1">View item</Link>
                  <Link to="/user/$id" params={{ id: owner.id }} className="rounded-full border border-border px-3 py-1">View closet</Link>
                  <button onClick={() => swap(slot)} className="ml-auto flex items-center gap-1 text-muted-foreground"><Repeat className="h-3 w-3" />Swap</button>
                </div>
              </div>);
          })}</div>

          {inspiration.length > 0 && (
            <div className="space-y-3">
              <p className="font-display text-3xl">Community styling inspiration</p>
              <p className="text-xs text-muted-foreground">Real posts from neighbors who wore these pieces — separate from the AI look above.</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{inspiration.slice(0, 4).map((p) => (
                <Link key={p.id} to="/community" className="block overflow-hidden rounded-2xl border border-border bg-card">
                  <img src={p.image} alt={p.caption} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                  <p className="p-2 text-xs">Styled by {getUser(p.userId).name}{p.demo ? " · demo" : ""}</p>
                </Link>))}</div>
            </div>
          )}
        </section>
      </div>}
      {tab === "preview" && <div className="fixed inset-x-0 bottom-16 z-20 flex gap-2 border-t border-border bg-card/95 p-3 md:hidden">
        {step > 1 && <button onClick={() => setStep(step - 1)} className={btnGhost + " flex-1"}>Back</button>}
        {step < 3 ? <button onClick={() => setStep(step + 1)} className={btn + " flex-1"}>Next</button>
          : <button onClick={generate} disabled={busy || !pieces.length} className={btn + " flex-1"}>{img ? "Regenerate" : "Generate look"}</button>}
      </div>}
      {tab === "personal" && <PersonalStyling />}
    </div>
  );
}
