import { useState } from "react";
import { Lock, Ruler } from "lucide-react";
import { fromCm, toCm, type FitProfile, type Unit } from "@/lib/fit";
import { btn, btnGhost, input } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

const fields = [
  { k: "height", l: "Height", tip: "Stand straight against a wall, no shoes." },
  { k: "bust", l: "Bust", tip: "Around the fullest part of your chest, tape level." },
  { k: "waist", l: "Waist", tip: "Around your natural waist, the narrowest part." },
  { k: "hips", l: "Hips", tip: "Around the fullest part of your hips and seat." },
] as const;

export function FitProfileForm({ value, onSave, onSkip, saveLabel = "Save Fit Profile" }: { value?: FitProfile | undefined; onSave: (f: FitProfile) => void; onSkip?: () => void; saveLabel?: string }) {
  const [unit, setUnit] = useState<Unit>(value?.unit ?? "in");
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.k, value?.[f.k] ? String(value[f.k]) : ""])));
  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    setV(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x && !isNaN(+x) ? String(Math.round(fromCm(toCm(+x, unit), u) * 10) / 10) : x])));
    setUnit(u);
  };
  const num = (x: string) => { const n = parseFloat(x); return n > 0 && n < 300 ? n : undefined; };
  const save = () => {
    const f: FitProfile = { unit };
    fields.forEach(({ k }) => { const n = num(v[k] ?? ""); if (n) f[k] = n; });
    onSave(f);
  };
  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-2xl bg-secondary/60 p-4 text-sm text-secondary-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />Private to you. We use these only to estimate how a garment will fit — they never appear on your profile, your posts, or to lenders.
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Units</span>
        <div className="flex rounded-full bg-muted p-1">
          {(["in", "cm"] as const).map((u) => <button key={u} type="button" onClick={() => switchUnit(u)} className={cn("rounded-full px-4 py-1 text-sm", unit === u ? "bg-card shadow-soft" : "text-muted-foreground")}>{u === "in" ? "Inches" : "Centimeters"}</button>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.k} className="block text-sm">
            <span className="font-medium">{f.l}</span>
            <span className="relative mt-1 block">
              <input inputMode="decimal" className={input + " pr-12"} value={v[f.k]} onChange={(e) => setV({ ...v, [f.k]: e.target.value.replace(/[^0-9.]/g, "").slice(0, 5) })} aria-label={`${f.l} (${unit})`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{f.tip}</span>
          </label>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Ruler className="h-3.5 w-3.5" />Use a soft tape measure over light clothing. Keep it snug, not tight.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} className={btn}>{saveLabel}</button>
        {onSkip && <button type="button" onClick={onSkip} className={btnGhost}>I'll measure later</button>}
      </div>
    </div>
  );
}
