import type { Item, Rental } from "./data";

export type Block = { id: string; start: string; end: string };
/** Rentals that hold the item's dates. */
const HOLDS = new Set(["Confirmed", "Picked Up"]);

export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (day: string, n: number) => { const d = new Date(day + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
export const today = () => iso(new Date());
const overlap = (a1: string, a2: string, b1: string, b2: string) => a1 <= b2 && b1 <= a2;

/** Date ranges where the item can't be requested: owner blocks + single blocked days. */
export function unavailableRanges(item: Item): Block[] {
  return [...(item.blocks ?? []), ...item.blockedDates.map((d) => ({ id: "d-" + d, start: d, end: d }))];
}
export const isRangeBlocked = (item: Item, start: string, end: string) => unavailableRanges(item).some((b) => overlap(start, end, b.start, b.end));

/** First date on/after `from` that isn't inside a block. */
export function nextAvailable(item: Item, from: string): string {
  let d = from;
  for (let i = 0; i < 400; i++) { if (!isRangeBlocked(item, d, d)) return d; d = addDays(d, 1); }
  return d;
}
/** Confirmed rentals an owner block would collide with. */
export const blockConflicts = (rentals: Rental[], itemId: string, start: string, end: string) =>
  rentals.filter((r) => r.itemId === itemId && HOLDS.has(r.status) && overlap(start, end, r.start, r.end));

export const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
