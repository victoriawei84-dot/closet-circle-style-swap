import type { Item } from "./data";

/** Pieces worn directly against the skin need a lender sanitizing confirmation. */
export const needsSanitizing = (i: Pick<Item, "category">) => i.category === "Shoes" || i.category === "Jewelry";

/** "Sanitized by lender · Nov 14" — null when the lender hasn't confirmed since the last return. */
export const sanitizedLabel = (i: Pick<Item, "category" | "sanitizedAt">) => {
  if (!needsSanitizing(i) || !i.sanitizedAt) return null;
  const d = new Date(i.sanitizedAt + "T12:00:00");
  return `Sanitized by lender · ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

export const markSanitized = <T extends Item>(items: T[], id: string, date: string): T[] => items.map((i) => (i.id === id && needsSanitizing(i) ? { ...i, sanitizedAt: date } : i));
/** A returned rental clears the label until the lender confirms again. */
export const clearOnReturn = <T extends Item>(items: T[], id: string): T[] => items.map((i) => (i.id === id && i.sanitizedAt ? { ...i, sanitizedAt: undefined } : i));
