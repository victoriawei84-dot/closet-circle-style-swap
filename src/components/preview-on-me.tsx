import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Loader2, MessageCircle, RefreshCw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { fitCheck, type FitVerdict } from "@/lib/fit";
import { getUser, type Item } from "@/lib/data";
import { useStore } from "@/lib/store";
import { streamImage } from "@/lib/stream-image";
import { btn, btnGhost } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import sampleBurgundy from "@/assets/sample-preview-burgundy.jpg";

const samples: Record<string, string> = { "burgundy-zip": sampleBurgundy };
const tone: Record<FitVerdict, string> = {
  "Likely to fit": "bg-accent text-accent-foreground",
  "May be snug": "bg-secondary text-secondary-foreground",
  "Unlikely to fit": "bg-destructive/15 text-destructive",
  "More measurements needed": "bg-muted text-foreground",
};

export const toBlob = async (src: string) => (await fetch(src)).blob();

export function FitCheckCard({ item }: { item: Item }) {
  const s = useStore();
  const r = fitCheck(item.category, s.fitProfile, item.garment);
  const owner = getUser(item.ownerId);
  const asked = s.lenderQuestions.some((q) => q.itemId === item.id);
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-medium">Fit Check <span className="font-normal text-muted-foreground">· based on measurements</span></p>
      <p className={cn("inline-block rounded-full px-3 py-1 text-sm font-medium", tone[r.verdict])}>{r.verdict}</p>
      <p className="text-sm text-muted-foreground">{r.explanation}</p>
      {r.details.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">{r.details.map((d) => (
          <li key={d.dim} className="flex justify-between capitalize"><span>{d.dim}</span><span>{d.status === "ok" ? "Comfortable" : d.status === "snug" ? "Snug" : "Too tight"}</span></li>))}</ul>
      )}
      {item.garment && <p className="text-[11px] text-muted-foreground">Intended fit: {item.garment.fit} · Stretch: {item.garment.stretch}{item.garment.confirmed ? " · Confirmed by owner" : ""}</p>}
      {r.missingProfile.length > 0 && <Link to="/profile" className={btn + " w-full"}>Add {r.missingProfile.join(", ")} to Fit Profile</Link>}
      {(r.missingGarment.length > 0 || r.unconfirmed || !item.garment) && (
        <button disabled={asked} onClick={() => { s.askLender(item.id, `Could you add the ${(r.missingGarment.length ? r.missingGarment : ["garment"]).join(", ")} measurements for ${item.title}?`); toast.success(`Question sent to ${owner.name}`); }} className={btnGhost + " w-full"}>
          <MessageCircle className="h-4 w-4" />{asked ? "Asked the lender" : "Ask the lender"}
        </button>
      )}
      <p className="text-[11px] text-muted-foreground">An estimate, not a promise. Results depend on the accuracy of both sets of measurements.</p>
    </div>
  );
}

export function PreviewOnMe({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [img, setImg] = useState("");
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [isSample, setIsSample] = useState(false);
  const sample = samples[item.id];

  const pick = (f?: File) => { if (!f) return; if (f.size > 8 * 1024 * 1024) { toast.error("Please use a photo under 8 MB"); return; } setPhoto(f); setPhotoUrl(URL.createObjectURL(f)); setImg(""); };
  const run = async () => {
    if (!photo) return;
    setBusy(true); setErr(""); setImg(""); setFinal(false); setIsSample(false);
    try {
      const fd = new FormData();
      fd.append("person", photo);
      fd.append("garment", new File([await toBlob(item.image)], "garment.jpg", { type: "image/jpeg" }));
      fd.append("title", item.title);
      await streamImage("/api/preview-on-me", fd, (u, f) => { setImg(u); setFinal(f); });
    } catch (e) {
      console.error(e);
      setErr("We couldn't create a live preview right now.");
      if (sample) { setImg(sample); setFinal(true); setIsSample(true); }
    } finally { setBusy(false); }
  };

  if (!open) return <button onClick={() => setOpen(true)} className={btnGhost + " w-full"}><Sparkles className="h-4 w-4" />Preview on Me</button>;
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between"><p className="font-display text-2xl">Preview on Me</p><button aria-label="Close" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {!img ? (
            <label className="grid aspect-[3/4] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted text-center text-sm text-muted-foreground">
              {photoUrl ? <img src={photoUrl} alt="Your photo" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2 px-6"><Camera className="h-6 w-6" />Add a full-body photo<span className="text-xs">Face-free is fine — crop it out or cover it with your phone.</span></span>}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          ) : (
            <figure className="relative overflow-hidden rounded-2xl">
              <img src={img} alt="AI styling preview" className={cn("w-full transition-[filter] duration-500", final ? "blur-0" : "blur-2xl")} />
              <figcaption className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium">{isSample ? "Sample AI preview" : "AI styling preview"}</figcaption>
            </figure>
          )}
          <div className="flex flex-wrap gap-2">
            {photo && <button onClick={run} disabled={busy} className={btn}>{busy ? <><Loader2 className="h-4 w-4 animate-spin" />Creating preview…</> : img ? <><RefreshCw className="h-4 w-4" />Try again</> : <><Sparkles className="h-4 w-4" />Create preview</>}</button>}
            {img && <button onClick={() => { setImg(""); setPhoto(null); setPhotoUrl(""); }} className={btnGhost}>New photo</button>}
            {!photo && sample && !img && <button onClick={() => { setImg(sample); setFinal(true); setIsSample(true); }} className={btnGhost}>See a sample</button>}
          </div>
          {err && <p className="text-xs text-destructive">{err}{isSample ? " Showing a sample instead." : ""}</p>}
          <p className="text-[11px] text-muted-foreground">Illustrative only — not a fit guarantee. Your photo is sent once to create the preview and isn't saved to your profile or shown to lenders.</p>
        </div>
        <FitCheckCard item={item} />
      </div>
    </div>
  );
}
