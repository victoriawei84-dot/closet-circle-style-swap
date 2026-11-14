import { isRangeBlocked } from "./availability";
import type { Item } from "./data";
import painted from "@/assets/spot-painted-ladies.jpg";
import ferry from "@/assets/spot-ferry-building.jpg";
import soho from "@/assets/spot-soho.jpg";
import central from "@/assets/spot-central-park.jpg";
import mission from "@/assets/look-sage-mission.jpg";
import dolores from "@/assets/look-floral-dolores.jpg";

export type Spot = { id: string; name: string; area: string; zip: string; image: string; pose: string };
/** Demo hotspot data — swap for a places API later (see getHotspots). */
const SPOTS: Record<string, Spot[]> = {
  sf: [
    { id: "painted", name: "Painted Ladies", area: "Alamo Square, San Francisco", zip: "94117", image: painted, pose: "Walk-away shot on the lawn, looking back over your shoulder" },
    { id: "ferry", name: "Ferry Building", area: "Embarcadero, San Francisco", zip: "94111", image: ferry, pose: "Side profile against the railing, hand on your bag strap" },
    { id: "balmy", name: "Balmy Alley murals", area: "Mission, San Francisco", zip: "94110", image: mission, pose: "Mid-stride along the wall, face turned to the murals" },
    { id: "dolores", name: "Dolores Park", area: "Mission Dolores, San Francisco", zip: "94114", image: dolores, pose: "Seated on the grass, cropped at the neck with the skyline behind" },
  ],
  nyc: [
    { id: "soho", name: "Greene Street cast-iron", area: "SoHo, New York", zip: "10012", image: soho, pose: "Crossing the cobblestones, back to the camera" },
    { id: "central", name: "Bow Bridge", area: "Central Park, New York", zip: "10024", image: central, pose: "Leaning on the bridge, phone hiding your face" },
  ],
};
export function getHotspots(place: string): { city: string; spots: Spot[] } {
  const q = place.toLowerCase();
  if (/new york|nyc|soho|central park|manhattan|brooklyn/.test(q)) return { city: "New York", spots: SPOTS["nyc"]! };
  return { city: "San Francisco", spots: SPOTS["sf"]! };
}

export type Prefs = { occasion: string; style: string; size: string; budget: number; days: number; radius: number; start?: string; end?: string };
export type Slot = "main" | "bottom" | "bag" | "shoes" | "accessory";
export type Outfit = { slots: Partial<Record<Slot, Item>>; total: number; name: string; reason: string; missing: Slot[] };

const OCC: Record<string, string[]> = { Date: ["Date night", "Cocktail"], Brunch: ["Brunch", "Garden party"], Travel: ["Brunch", "Weekend", "Work"], Party: ["Cocktail", "Gala", "Wedding"], "Everyday": ["Weekend", "Work", "Brunch"] };
const STY: Record<string, string[]> = { Minimal: ["Minimal", "Tailored"], French: ["Silk", "Minimal", "Quiet luxury"], Sweet: ["Romantic"], Vintage: ["Vintage", "Boho"], Street: ["Tailored", "Minimal"], Elegant: ["Evening", "Silk", "Quiet luxury"] };
const SLOT_CATS: Record<Slot, Item["category"][]> = { main: ["Dress", "Suit", "Top"], bottom: ["Bottom"], bag: ["Bag"], shoes: ["Shoes"], accessory: ["Accessory", "Jewelry"] };

const blocked = (i: Item, p: Prefs) => !!p.start && !!p.end && isRangeBlocked(i, p.start, p.end);
const sizeOk = (i: Item, p: Prefs) => !p.size || i.size === p.size || i.size === "One size" || i.category === "Shoes" || i.category === "Top" || i.category === "Accessory" || i.category === "Jewelry";

/** Rentable candidates for a slot, best first. Only real listings. */
export function candidates(slot: Slot, pool: Item[], p: Prefs): Item[] {
  return pool
    .filter((i) => SLOT_CATS[slot].includes(i.category) && sizeOk(i, p) && i.distance <= p.radius && !blocked(i, p))
    .map((i) => ({ i, s: (i.occasions.some((o) => (OCC[p.occasion] ?? []).includes(o)) ? 3 : 0) + i.styleTags.filter((t) => (STY[p.style] ?? []).includes(t)).length * 2 - i.dailyRate / 50 }))
    .sort((a, b) => b.s - a.s).map((x) => x.i);
}

/** Build an outfit within budget; `pick` lets the user swap a slot to a specific index. */
export function buildOutfit(pool: Item[], p: Prefs, pick: Partial<Record<Slot, number>> = {}): Outfit {
  const slots: Outfit["slots"] = {}; const missing: Slot[] = [];
  let spent = 0;
  for (const slot of ["main", "bottom", "bag", "shoes", "accessory"] as Slot[]) {
    // Separates: a top needs a bottom; dresses and suits don't. Accessories are a bonus, never "missing".
    if (slot === "bottom" && slots.main?.category !== "Top") continue;
    const c = candidates(slot, pool, p);
    const start = pick[slot] ?? 0;
    const ordered = [...c.slice(start), ...c.slice(0, start)];
    const it = ordered.find((i) => spent + i.dailyRate * p.days <= p.budget);
    if (it) { slots[slot] = it; spent += it.dailyRate * p.days; } else if (slot !== "accessory") missing.push(slot);
  }
  const main = slots.main;
  const name = main ? `${p.style} ${p.occasion.toLowerCase()} — ${main.title.split(" ").slice(-2).join(" ").toLowerCase()}` : "No full look yet";
  const reason = main ? `${main.title} reads ${p.style.toLowerCase()} and suits ${p.occasion.toLowerCase()}${slots.bag ? `; the ${slots.bag.title.toLowerCase()} keeps it polished` : ""}.` : "Nothing matches these filters — try a bigger budget or wider pickup range.";
  return { slots, total: spent, name, reason, missing };
}
