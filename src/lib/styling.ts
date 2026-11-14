import { isRangeBlocked, nextAvailable } from "./availability";
import type { Item } from "./data";
import type { FitProfile } from "./fit";

/* ---------- private styling preferences ---------- */

export type Undertone = "warm" | "cool" | "neutral" | "unsure";
export type Coverage = "show-skin" | "balanced" | "more-coverage";
export type FitPref = "fitted" | "regular" | "relaxed";
export type StylingPrefs = {
  undertone?: Undertone;
  skinTone?: string;
  bodyShape?: string; // "measurements" | "skip" | a BODY_SHAPES id
  colors: string[];
  silhouettes: string[];
  coverage: Coverage;
  fit: FitPref;
};

export const DEFAULT_STYLING: StylingPrefs = { colors: [], silhouettes: [], coverage: "balanced", fit: "regular", bodyShape: "skip" };

export const UNDERTONES: { id: Undertone; name: string; note: string }[] = [
  { id: "warm", name: "Warm", note: "gold, peach or olive casts" },
  { id: "cool", name: "Cool", note: "pink, red or blue casts" },
  { id: "neutral", name: "Neutral", note: "neither one stands out" },
  { id: "unsure", name: "Not sure", note: "we'll style without it" },
];

export const SKIN_TONES = [
  { id: "porcelain", name: "Porcelain", hex: "#F6E4D7" },
  { id: "ivory", name: "Ivory", hex: "#F0DCC6" },
  { id: "sand", name: "Sand", hex: "#E2C19C" },
  { id: "honey", name: "Honey", hex: "#C89A6B" },
  { id: "amber", name: "Amber", hex: "#A9713F" },
  { id: "umber", name: "Umber", hex: "#7A4A2A" },
  { id: "deep", name: "Deep", hex: "#4E2E1C" },
];

export const BODY_SHAPES = [
  { id: "hourglass", name: "Defined waist" },
  { id: "straight", name: "Straight" },
  { id: "pear", name: "Hips wider" },
  { id: "apple", name: "Soft middle" },
  { id: "athletic", name: "Athletic" },
];

export const COLOR_FAMILIES: { id: string; name: string; hex: string; warm: boolean; cool: boolean }[] = [
  { id: "cream", name: "Cream", hex: "#EFE3CE", warm: true, cool: false },
  { id: "camel", name: "Camel", hex: "#C39B6B", warm: true, cool: false },
  { id: "gold", name: "Gold", hex: "#C6A340", warm: true, cool: false },
  { id: "olive", name: "Olive", hex: "#7C8552", warm: true, cool: false },
  { id: "terracotta", name: "Terracotta", hex: "#B4614A", warm: true, cool: false },
  { id: "blush", name: "Blush", hex: "#E3BFC0", warm: false, cool: true },
  { id: "denim", name: "Denim", hex: "#7590B2", warm: false, cool: true },
  { id: "jewel", name: "Jewel", hex: "#41608C", warm: false, cool: true },
  { id: "wine", name: "Wine", hex: "#6E2233", warm: false, cool: true },
  { id: "black", name: "Black", hex: "#231F1C", warm: true, cool: true },
  { id: "white", name: "White", hex: "#F7F4EE", warm: true, cool: true },
];
const FAMILY = Object.fromEntries(COLOR_FAMILIES.map((c) => [c.id, c]));

export const SILHOUETTES = ["Wrap", "Bias slip", "Column", "Pleated", "Tailored", "Oversized", "Fit-and-flare"];
export const COVERAGE_OPTS: { id: Coverage; name: string }[] = [
  { id: "show-skin", name: "Show some skin" },
  { id: "balanced", name: "Balanced" },
  { id: "more-coverage", name: "More coverage" },
];
export const FIT_OPTS: { id: FitPref; name: string }[] = [
  { id: "fitted", name: "Close to the body" },
  { id: "regular", name: "True to size" },
  { id: "relaxed", name: "Easy and loose" },
];

/* ---------- reading color / cut / coverage off a listing ---------- */

const COLOR_WORDS: Record<string, string[]> = {
  cream: ["cream", "champagne", "ivory", "pearl"],
  camel: ["camel", "tan", "caramel", "cognac", "beige"],
  gold: ["gold", "gilt", "brass", "vermeil"],
  olive: ["olive", "sage", "moss", "khaki"],
  terracotta: ["terracotta", "rust", "clay", "ochre"],
  blush: ["blush", "rose", "pink", "peach"],
  denim: ["denim", "indigo", "blue"],
  jewel: ["emerald", "sapphire", "teal", "jewel"],
  wine: ["burgundy", "wine", "bordeaux", "maroon"],
  black: ["black", "noir"],
  white: ["white", "optic"],
};

export function itemColors(i: Item): string[] {
  const t = `${i.title} ${i.description} ${i.styleTags.join(" ")}`.toLowerCase();
  return Object.entries(COLOR_WORDS).flatMap(([id, ws]) => (ws.some((w) => t.includes(w)) ? [id] : []));
}

const SIL_WORDS: Record<string, string[]> = {
  Wrap: ["wrap"],
  "Bias slip": ["slip", "bias"],
  Column: ["gown", "column", "floor-length", "maxi"],
  Pleated: ["pleat"],
  Tailored: ["suit", "blazer", "tailored", "jacket", "trouser"],
  Oversized: ["oversized", "relaxed", "slouchy", "wide-leg", "half-zip", "pullover"],
  "Fit-and-flare": ["sundress", "floral", "swishy", "fit-and-flare"],
};

export function itemSilhouette(i: Item): string {
  const t = `${i.title} ${i.description}`.toLowerCase();
  return SILHOUETTES.find((s) => (SIL_WORDS[s] ?? []).some((w) => t.includes(w))) ?? "";
}

export function itemCoverage(i: Item): Coverage {
  const t = `${i.title} ${i.description}`.toLowerCase();
  if (/(mini|strappy|backless|slip|sandal|cropped)/.test(t)) return "show-skin";
  if (/(gown|maxi|floor-length|high neck|turtleneck|trouser|suit|jacket|long sleeve)/.test(t)) return "more-coverage";
  return "balanced";
}

/** Proportions inferred from the private Fit Profile, used only when the user opts in. */
export function derivedShape(f?: FitProfile): string | null {
  if (!f?.bust || !f?.waist || !f?.hips) return null;
  const w = f.waist / f.bust;
  if (w <= 0.76) return "hourglass";
  if (f.hips / f.bust >= 1.06) return "pear";
  if (w >= 0.88) return "apple";
  return "straight";
}
const SHAPE_SIL: Record<string, string[]> = {
  hourglass: ["Wrap", "Fit-and-flare", "Pleated"],
  straight: ["Column", "Oversized", "Tailored"],
  pear: ["Fit-and-flare", "Column", "Bias slip"],
  apple: ["Column", "Oversized", "Bias slip"],
  athletic: ["Tailored", "Column", "Wrap"],
};

/* ---------- the outfit request ---------- */

export type LookRequest = { occasion: string; start: string; end: string; zip: string; budget: number; radius: number; days: number; size: string };
export type Slot = "main" | "bag" | "shoes" | "jewelry";
export const SLOT_LABEL: Record<Slot, string> = { main: "Outfit", bag: "Bag", shoes: "Shoes", jewelry: "Jewelry" };
const SLOT_CATS: Record<Slot, Item["category"][]> = { main: ["Dress", "Suit", "Top", "Bottom"], bag: ["Bag"], shoes: ["Shoes"], jewelry: ["Jewelry"] };

export type LookPiece = { slot: Slot; item: Item; price: number; why: string; options: number };
export type Look = { id: string; name: string; reason: string; pieces: LookPiece[]; total: number; missing: Slot[]; pickup: string; nextFree?: string };

const PALETTES = [
  { id: "warm-neutrals", name: "Warm neutrals", colors: ["cream", "camel", "gold", "olive", "terracotta", "white"] },
  { id: "jewel-tones", name: "Jewel tones", colors: ["jewel", "wine", "black", "denim"] },
  { id: "soft-blush", name: "Soft blush", colors: ["blush", "cream", "gold", "white"] },
];

const sizeOk = (i: Item, size: string) => !size || i.size === size || i.size === "One size" || i.category === "Shoes" || i.category === "Top" || i.category === "Jewelry";
const covLabel: Record<Coverage, string> = { "show-skin": "a bit more skin", balanced: "balanced coverage", "more-coverage": "more coverage" };
const fitLabel: Record<FitPref, string> = { fitted: "close to the body", regular: "true to size", relaxed: "easy and loose" };

/** Score one listing against the request + private preferences. */
function score(i: Item, req: LookRequest, p: StylingPrefs, shape: string | null) {
  const cols = itemColors(i);
  let s = 0;
  const why: string[] = [];
  const fav = cols.filter((c) => p.colors.includes(c));
  if (fav.length) { s += 4; why.push(`${fav.map((c) => FAMILY[c]?.name.toLowerCase() ?? c).join(" + ")}, one of your colors`); }
  if (p.undertone && p.undertone !== "unsure") {
    const key = p.undertone === "warm" ? "warm" : p.undertone === "cool" ? "cool" : null;
    if (key && cols.some((c) => FAMILY[c]?.[key])) { s += 3; why.push(`flattering against a ${p.undertone} undertone`); }
  }
  const sil = itemSilhouette(i);
  const wanted = [...p.silhouettes, ...(shape && p.bodyShape === "measurements" ? SHAPE_SIL[shape] ?? [] : [])];
  if (sil && wanted.includes(sil)) { s += 3; why.push(`the ${sil.toLowerCase()} cut you asked for`); }
  if (itemCoverage(i) === p.coverage) { s += 1.5; why.push(covLabel[p.coverage]); }
  if (i.garment?.fit === p.fit) { s += 1; why.push(`fits ${fitLabel[p.fit]}`); }
  if (i.occasions.some((o) => o.toLowerCase() === req.occasion.toLowerCase())) s += 3;
  s += Math.max(0, 2 - i.distance / 2);
  return { s, why };
}

function eligible(slot: Slot, pool: Item[], req: LookRequest, p: StylingPrefs, shape: string | null, used: Set<string>, palette: string[]) {
  return pool
    .filter((i) => SLOT_CATS[slot].includes(i.category) && !used.has(i.id) && sizeOk(i, req.size) && i.distance <= req.radius && !isRangeBlocked(i, req.start, req.end))
    .filter((i) => { const c = itemColors(i); return !c.length || c.some((x) => palette.includes(x)); })
    .map((i) => ({ item: i, ...score(i, req, p, shape) }))
    .sort((a, b) => b.s - a.s);
}

function reason(slots: LookPiece[], p: StylingPrefs, owned: string[], shape: string | null): string {
  const parts = slots.slice(0, 2).map((x) => x.why).filter((w) => w.length).flat().slice(0, 2);
  const body = parts.length ? `The ${slots[0]!.item.title.toLowerCase()} ${parts.join(", and ")}` : `The ${slots[0]!.item.title.toLowerCase()} suits ${slots[0]!.slot === "main" ? "the occasion" : "the look"}`;
  const extra: string[] = [];
  if (shape && p.bodyShape === "measurements") extra.push(`your ${BODY_SHAPES.find((b) => b.id === shape)?.name.toLowerCase() ?? "proportions"}`);
  if (owned.length) extra.push(`you already own ${owned.slice(0, 2).join(" and ")}`);
  return body + (extra.length ? `; ${extra.join("; ")}` : "") + ".";
}

/** Two or three distinct looks from real listings, budget and dates checked first. */
export function buildLooks(pool: Item[], req: LookRequest, p: StylingPrefs, owned: string[], fit?: FitProfile, picks: Partial<Record<string, number>> = {}): Look[] {
  const shape = p.bodyShape === "measurements" ? derivedShape(fit) : p.bodyShape && p.bodyShape !== "skip" ? p.bodyShape : null;
  // Pieces the user already owns are worn, not rented: match them to listings so they never land in a total.
  const ownedIds = new Set(pool.filter((i) => owned.some((o) => { const a = o.toLowerCase(); return i.title.toLowerCase().includes(a) || a.includes(i.title.toLowerCase()); })).map((i) => i.id));
  const used = new Set<string>(ownedIds);
  const looks: Look[] = [];
  for (const pal of PALETTES) {
    const pieces: LookPiece[] = [];
    const missing: Slot[] = [];
    let spent = 0;
    let nextFree: string | undefined;
    for (const slot of ["main", "jewelry", "bag", "shoes"] as Slot[]) {
      const cands = eligible(slot, pool, req, p, shape, used, pal.colors);
      if (!cands.length) { missing.push(slot); continue; }
      const start = picks[`${pal.id}:${slot}`] ?? 0;
      const ordered = [...cands.slice(start), ...cands.slice(0, start)];
      const pick = ordered.find((x) => spent + x.item.dailyRate * req.days <= req.budget);
      if (pick) { pieces.push({ slot, item: pick.item, price: pick.item.dailyRate * req.days, why: pick.why[0] ?? "", options: cands.length }); spent += pick.item.dailyRate * req.days; used.add(pick.item.id); }
      else {
        missing.push(slot);
        const nf = nextAvailable(ordered[0]!.item, req.start);
        if (nf > req.start && !nextFree) nextFree = nf;
      }
    }
    if (!pieces.length) continue;
    looks.push({
      id: pal.id, name: pal.name, pieces, total: spent, missing,
      ...(nextFree ? { nextFree } : {}),
      reason: reason(pieces, p, owned, shape),
      pickup: `Available for ${req.start === req.end ? "your date" : "your dates"} · pickup within ${req.radius} mi of ${req.zip}`,
    });
  }
  return looks;
}
