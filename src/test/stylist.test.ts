import { describe, it, expect } from "vitest";
import { buildOutfit } from "@/lib/stylist";
import { items } from "@/lib/data";

const p = { occasion: "Brunch", style: "Minimal", size: "S", budget: 500, days: 2, radius: 5 };
describe("AI stylist outfit builder", () => {
  it("uses only real listings and prices the rental period", () => {
    const o = buildOutfit(items, p);
    const picked = Object.values(o.slots);
    expect(picked.length).toBeGreaterThan(0);
    picked.forEach((i) => expect(items.some((x) => x.id === i!.id)).toBe(true));
    expect(o.total).toBe(picked.reduce((a, i) => a + i!.dailyRate * 2, 0));
  });
  it("stays within budget and reports missing slots", () => {
    const o = buildOutfit(items, { ...p, budget: 20 });
    expect(o.total).toBeLessThanOrEqual(20);
    expect(o.missing.length).toBeGreaterThan(0);
  });
  it("respects pickup range", () => {
    const o = buildOutfit(items, { ...p, radius: 1 });
    Object.values(o.slots).forEach((i) => expect(i!.distance).toBeLessThanOrEqual(1));
  });
});
