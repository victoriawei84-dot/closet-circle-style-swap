export type Unit = "in" | "cm";
export type Dim = "bust" | "waist" | "hips";
export type FitProfile = { unit: Unit; height?: number; bust?: number; waist?: number; hips?: number };
export type GarmentFit = {
  unit: Unit; bust?: number; waist?: number; hips?: number; length?: number;
  stretch: "none" | "some" | "high"; fit: "fitted" | "regular" | "relaxed"; confirmed: boolean;
};
export type FitVerdict = "Likely to fit" | "May be snug" | "Unlikely to fit" | "More measurements needed";
export type FitResult = { verdict: FitVerdict; explanation: string; missingProfile: Dim[]; missingGarment: Dim[]; unconfirmed: boolean; details: { dim: Dim; status: "ok" | "snug" | "tight"; ease: number }[] };

export const toCm = (v: number, u: Unit) => (u === "in" ? v * 2.54 : v);
export const fromCm = (v: number, u: Unit) => (u === "in" ? v / 2.54 : v);

/** Which body measurements a clothing category needs. Non-clothing returns []. */
export function requiredDims(category: string): Dim[] {
  switch (category) {
    case "Dress": case "Suit": return ["bust", "waist", "hips"];
    case "Top": return ["bust"];
    case "Bottom": return ["waist", "hips"];
    default: return [];
  }
}
export const isClothing = (category: string) => requiredDims(category).length > 0;

/** Extra room the garment can give (cm) thanks to stretch. */
const STRETCH_CM = { none: 0, some: 2.5, high: 6 } as const;
/** Minimum comfortable ease (cm) for the intended fit. */
const EASE_CM = { fitted: 0, regular: 3, relaxed: 6 } as const;

/**
 * Compare body vs garment (both normalized to cm).
 * effective = garment − body + stretch. effective < −2.5 cm → tight; < intended ease → snug; else ok.
 */
export function fitCheck(category: string, body: FitProfile | undefined, g: GarmentFit | undefined): FitResult {
  const dims = requiredDims(category);
  const missingProfile = dims.filter((d) => !body?.[d]);
  const missingGarment = dims.filter((d) => !g?.[d]);
  const unconfirmed = !!g && !g.confirmed;
  const base = { missingProfile, missingGarment, unconfirmed, details: [] as FitResult["details"] };
  if (!dims.length) return { ...base, verdict: "More measurements needed", explanation: "Fit Check works for clothing only." };
  if (missingProfile.length || missingGarment.length || !g || unconfirmed) {
    const parts: string[] = [];
    if (missingProfile.length) parts.push(`add your ${list(missingProfile)} to your Fit Profile`);
    if (!g || missingGarment.length) parts.push(`the lender hasn't listed the garment's ${list(missingGarment.length ? missingGarment : dims)}`);
    else if (unconfirmed) parts.push("the lender hasn't confirmed the garment measurements yet");
    return { ...base, verdict: "More measurements needed", explanation: cap(parts.join(", and ")) + "." };
  }
  const details = dims.map((d) => {
    const ease = toCm(g[d]!, g.unit) - toCm(body![d]!, body!.unit) + STRETCH_CM[g.stretch];
    const need = d === "waist" ? EASE_CM[g.fit] / 2 : EASE_CM[g.fit];
    const status = ease < -2.5 ? "tight" as const : ease < need ? "snug" as const : "ok" as const;
    return { dim: d, status, ease: Math.round(ease * 10) / 10 };
  });
  const tight = details.filter((x) => x.status === "tight").map((x) => x.dim);
  const snug = details.filter((x) => x.status === "snug").map((x) => x.dim);
  const ok = details.filter((x) => x.status === "ok").map((x) => x.dim);
  const verdict: FitVerdict = tight.length ? "Unlikely to fit" : snug.length ? "May be snug" : "Likely to fit";
  let explanation: string;
  if (verdict === "Likely to fit") explanation = `The ${list(ok)} ${ok.length > 1 ? "look" : "looks"} comfortable for a ${g.fit} fit.`;
  else {
    const bad = tight.length ? `the ${list(tight)} will likely be too tight` : `the ${list(snug)} may feel snug`;
    explanation = ok.length ? `The ${list(ok)} ${ok.length > 1 ? "look" : "looks"} comfortable, but ${bad}.` : cap(bad) + ".";
  }
  return { ...base, details, verdict, explanation };
}
const list = (a: string[]) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
