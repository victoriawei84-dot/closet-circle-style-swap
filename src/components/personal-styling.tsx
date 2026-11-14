import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Lock, MapPin, Repeat, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { getUser, ME } from "@/lib/data";
import { fmt } from "@/lib/availability";
import { isClothing } from "@/lib/fit";
import { useStore } from "@/lib/store";
import { FitCheckCard, PreviewOnMe } from "@/components/preview-on-me";
import { Avatar, Chip, btn, btnGhost, input } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import {
  BODY_SHAPES, COVERAGE_OPTS, COLOR_FAMILIES, FIT_OPTS, SKIN_TONES, SILHOUETTES, SLOT_LABEL, UNDERTONES,
  buildLooks, type Coverage, type LookRequest, type Slot, type StylingPrefs,
} from "@/lib/styling";

const OCCASIONS = ["Wedding", "Date", "Brunch", "Party", "Work", "Everyday"];
const iso = (n: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const daysBetween = (a: string, b: string) => Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1);

/** Example request from the brief: a wedding guest under $60 with a warm undertone and cream heels at home. */
const DEMO_PREFS: StylingPrefs = { undertone: "warm", skinTone: "sand", bodyShape: "hourglass", colors: ["olive", "gold", "cream"], silhouettes: ["Wrap"], coverage: "balanced", fit: "regular" };
const covOrder: Coverage[] = ["show-skin", "balanced", "more-coverage"];

function Field({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm">{label}{note && <span className="ml-1 text-xs text-muted-foreground">{note}</span>}</p>
      {children}
    </div>
  );
}

export function PersonalStyling() {
  const s = useStore();
  const [prefs, setPrefs] = useState<StylingPrefs>(s.styling.colors.length || s.styling.undertone ? s.styling : DEMO_PREFS);
  const save = (p: StylingPrefs) => { setPrefs(p); s.setStyling(p); };
  const [occ, setOcc] = useState("Wedding");
  const [start, setStart] = useState(iso(1));
  const [end, setEnd] = useState(iso(1));
  const [zip, setZip] = useState("94110");
  const [budget, setBudget] = useState(60);
  const [radius, setRadius] = useState(3);
  const [owned, setOwnedList] = useState<string[]>(s.ownedPieces.length ? s.ownedPieces : ["cream heels"]);
  const [ownInput, setOwnInput] = useState("");
  const [picks, setPicks] = useState<Partial<Record<string, number>>>({});
  const [open, setOpen] = useState<Record<string, "preview" | "fit" | null>>({});

  const days = daysBetween(start, end);
  const req: LookRequest = { occasion: occ, start, end, zip, budget, radius, days, size: getUser(ME).size };
  const looks = useMemo(() => buildLooks(s.allItems, req, prefs, owned, s.fitProfile, picks),
    [s.allItems, occ, start, end, zip, budget, radius, owned, prefs, s.fitProfile, picks]);
  const hasMeasurements = !!(s.fitProfile?.bust && s.fitProfile?.waist && s.fitProfile?.hips);

  const setOwned = (a: string[]) => { setOwnedList(a); s.setOwnedPieces(a); };

  const swap = (lookId: string, slot: Slot, options: number) => {
    if (options < 2) { toast("No other matching piece for this slot right now"); return; }
    const key = `${lookId}:${slot}`;
    setPicks({ ...picks, [key]: (picks[key] ?? 0) + 1 });
  };
  const askColor = () => {
    const next = COLOR_FAMILIES.find((c) => !prefs.colors.includes(c.id)) ?? COLOR_FAMILIES[0]!;
    save({ ...prefs, colors: [...prefs.colors.slice(1), next.id] });
    toast(`Showing ${next.name.toLowerCase()} pieces instead`);
  };
  const askCut = () => {
    const next = SILHOUETTES[(SILHOUETTES.indexOf(prefs.silhouettes[0] ?? "Wrap") + 1) % SILHOUETTES.length]!;
    save({ ...prefs, silhouettes: [next] });
    toast(`Trying a ${next.toLowerCase()} cut`);
  };
  const askCoverage = () => {
    const next = covOrder[(covOrder.indexOf(prefs.coverage) + 1) % covOrder.length]!;
    save({ ...prefs, coverage: next });
    toast(`Styling for ${COVERAGE_OPTS.find((c) => c.id === next)?.name.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-4xl">Personal styling</h2>
        <p className="text-muted-foreground">Tell us about you — optionally — and we'll build complete looks from pieces neighbors actually lend.</p>
      </div>

      {/* PRIVATE PREFERENCES */}
      <section className="space-y-4 rounded-3xl bg-hero p-5 md:p-6">
        <div className="flex items-start gap-2">
          <Lock className="mt-1 h-4 w-4 shrink-0" />
          <div>
            <p className="font-display text-2xl">Your styling preferences</p>
            <p className="text-xs text-muted-foreground">Private — never shown on your profile or to lenders. Skip anything: we'll style from the occasion and whatever you do give us.</p>
          </div>
        </div>

        <Field label="Undertone">
          <div className="flex flex-wrap gap-2">
            {UNDERTONES.map((u) => <Chip key={u.id} active={prefs.undertone === u.id} onClick={() => save({ ...prefs, undertone: u.id })}>{u.name}</Chip>)}
          </div>
          {prefs.undertone && prefs.undertone !== "unsure" && <p className="text-xs text-muted-foreground">{UNDERTONES.find((u) => u.id === prefs.undertone)?.note} — we'll favor matching colors.</p>}
        </Field>

        <Field label="Skin tone" note="pick the closest swatch">
          <div className="flex flex-wrap items-center gap-2">
            {SKIN_TONES.map((t) => (
              <button key={t.id} aria-label={t.name} onClick={() => save({ ...prefs, skinTone: t.id })}
                className={cn("h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition", prefs.skinTone === t.id ? "ring-foreground" : "ring-transparent")}
                style={{ backgroundColor: t.hex }} />
            ))}
            <button onClick={() => { const { skinTone, ...rest } = prefs; save(rest); }} className="rounded-full border border-border px-3 py-1 text-xs">Not sure</button>
          </div>
        </Field>

        <Field label="Body shape or proportions" note="we only read the numbers you already saved">
          <div className="flex flex-wrap gap-2">
            <Chip active={prefs.bodyShape === "measurements"} onClick={() => save({ ...prefs, bodyShape: "measurements" })}>Use my Fit Profile</Chip>
            {BODY_SHAPES.map((b) => <Chip key={b.id} active={prefs.bodyShape === b.id} onClick={() => save({ ...prefs, bodyShape: b.id })}>{b.name}</Chip>)}
            <Chip active={prefs.bodyShape === "skip"} onClick={() => save({ ...prefs, bodyShape: "skip" })}>Skip</Chip>
          </div>
          {prefs.bodyShape === "measurements" && !hasMeasurements && <p className="text-xs text-muted-foreground">Your Fit Profile is missing bust, waist or hips — add them in Profile, or pick Skip.</p>}
          {prefs.bodyShape === "measurements" && hasMeasurements && <p className="text-xs text-muted-foreground">We'll favor cuts that suit the proportions your measurements suggest.</p>}
        </Field>

        <Field label="Favorite colors">
          <div className="flex flex-wrap gap-2">
            {COLOR_FAMILIES.map((c) => {
              const on = prefs.colors.includes(c.id);
              return (
                <button key={c.id} onClick={() => save({ ...prefs, colors: on ? prefs.colors.filter((x) => x !== c.id) : [...prefs.colors, c.id] })}
                  className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition", on ? "border-foreground bg-card" : "border-border")}>
                  <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c.hex }} />{c.name}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Preferred silhouettes">
          <div className="flex flex-wrap gap-2">{SILHOUETTES.map((s2) => <Chip key={s2} active={prefs.silhouettes.includes(s2)} onClick={() => save({ ...prefs, silhouettes: prefs.silhouettes.includes(s2) ? prefs.silhouettes.filter((x) => x !== s2) : [...prefs.silhouettes, s2] })}>{s2}</Chip>)}</div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coverage">
            <div className="flex flex-wrap gap-2">{COVERAGE_OPTS.map((c) => <Chip key={c.id} active={prefs.coverage === c.id} onClick={() => save({ ...prefs, coverage: c.id })}>{c.name}</Chip>)}</div>
          </Field>
          <Field label="How you like clothes to fit">
            <div className="flex flex-wrap gap-2">{FIT_OPTS.map((f) => <Chip key={f.id} active={prefs.fit === f.id} onClick={() => save({ ...prefs, fit: f.id })}>{f.name}</Chip>)}</div>
          </Field>
        </div>
      </section>

      {/* THE REQUEST */}
      <section className="space-y-4 rounded-3xl border border-border p-5 md:p-6">
        <p className="font-display text-2xl">What do you need?</p>
        <div className="flex flex-wrap gap-2">{OCCASIONS.map((o) => <Chip key={o} active={occ === o} onClick={() => setOcc(o)}>{o}</Chip>)}</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <label>From<input type="date" className={input} value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label>To<input type="date" className={input} min={start} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          <label>ZIP for pickup<input className={input} value={zip} maxLength={5} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} /></label>
          <label>Total budget (${budget})<input type="range" min={20} max={400} step={5} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-primary" /></label>
          <label className="col-span-2">Pickup within {radius} mi<input type="range" min={1} max={5} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-primary" /></label>
        </div>

        <Field label="Pieces you already own" note="worn, not rented — kept out of the total">
          <div className="flex flex-wrap gap-2">
            {owned.map((o) => (
              <span key={o} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{o}
                <button aria-label={`Remove ${o}`} onClick={() => setOwned(owned.filter((x) => x !== o))}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {!owned.length && <span className="text-xs text-muted-foreground">Nothing added yet.</span>}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = ownInput.trim(); if (v && !owned.includes(v)) setOwned([...owned, v]); setOwnInput(""); }}>
            <input className={input} value={ownInput} onChange={(e) => setOwnInput(e.target.value.slice(0, 40))} placeholder="e.g. cream heels" />
            <button className={btnGhost}>Add</button>
          </form>
          {s.myItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {s.myItems.map((i) => <Chip key={i.id} active={owned.includes(i.title)} onClick={() => setOwned(owned.includes(i.title) ? owned.filter((x) => x !== i.title) : [...owned, i.title])}>{i.title}</Chip>)}
            </div>
          )}
        </Field>
      </section>

      {/* THE LOOKS */}
      {!looks.length && <p className="rounded-3xl bg-hero p-6 text-sm text-muted-foreground">Nothing matches yet — try a bigger budget, a wider pickup radius, or another size.</p>}
      {looks.map((look) => {
        const main = look.pieces.find((p) => p.slot === "main");
        const clothes = look.pieces.filter((p) => isClothing(p.item.category));
        const mode = open[look.id] ?? null;
        return (
          <article key={look.id} className="space-y-4 rounded-3xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-3xl">{look.name}</p>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{look.reason}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-2xl">${look.total}</p>
                <p className="text-[11px] text-muted-foreground">rental total · {days} {days === 1 ? "day" : "days"}</p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{look.pickup}</p>
            {look.nextFree && <p className="text-xs text-muted-foreground">Something was already booked — the earliest free date nearby is {fmt(look.nextFree)}.</p>}
            {look.missing.length > 0 && <p className="text-xs text-muted-foreground">No matching {look.missing.map((m) => SLOT_LABEL[m].toLowerCase()).join(" or ")} inside your budget — wear your own, or raise the budget.</p>}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {look.pieces.map((pc) => (
                <div key={pc.slot} className="space-y-2 rounded-2xl border border-border p-3">
                  <img src={pc.item.image} alt={pc.item.title} loading="lazy" width={1024} height={1280} className="aspect-[3/4] w-full rounded-xl object-cover" />
                  <p className="text-[11px] text-muted-foreground">{SLOT_LABEL[pc.slot]}</p>
                  <p className="text-sm font-medium leading-tight">{pc.item.title}</p>
                  <p className="text-xs text-muted-foreground">${pc.item.dailyRate}/day · ${pc.price} for {days} {days === 1 ? "day" : "days"}</p>
                  {pc.why && <p className="text-xs text-sage">{pc.why}</p>}
                  <Link to="/user/$id" params={{ id: pc.item.ownerId }} className="flex items-center gap-2 text-xs"><Avatar id={pc.item.ownerId} size={20} />{getUser(pc.item.ownerId).name}</Link>
                  <div className="flex items-center gap-2 text-xs">
                    <Link to="/item/$id" params={{ id: pc.item.id }} className="rounded-full border border-border px-3 py-1">Listing</Link>
                    <button onClick={() => swap(look.id, pc.slot, pc.options)} className="ml-auto flex items-center gap-1 text-muted-foreground"><Repeat className="h-3 w-3" />Swap a piece</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setOpen({ ...open, [look.id]: mode === "preview" ? null : "preview" })} className={btnGhost}><Sparkles className="h-4 w-4" />Preview on Me</button>
              <button onClick={() => setOpen({ ...open, [look.id]: mode === "fit" ? null : "fit" })} className={btnGhost}>Check Fit</button>
              <button onClick={askColor} className={btnGhost}>Different color</button>
              <button onClick={askCut} className={btnGhost}>Different cut</button>
              <button onClick={askCoverage} className={btnGhost}>Coverage</button>
              <button onClick={() => { s.saveOutfit({ name: `${look.name} · ${occ}`, place: `ZIP ${zip}`, itemIds: look.pieces.map((p) => p.item.id) }); toast.success("Outfit saved"); }} className={btn}><Bookmark className="h-4 w-4" />Save outfit</button>
            </div>

            {mode === "preview" && main && (
              <div className="space-y-2 rounded-2xl bg-muted/50 p-4">
                <p className="text-sm">Preview on Me — {main.item.title}</p>
                <PreviewOnMe item={main.item} />
              </div>
            )}
            {mode === "fit" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {clothes.length ? clothes.map((pc) => <FitCheckCard key={pc.item.id} item={pc.item} />) : <p className="text-xs text-muted-foreground">Nothing in this look is clothing, so there's nothing to measure.</p>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
