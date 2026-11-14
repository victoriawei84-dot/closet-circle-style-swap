import { describe, it, expect } from "vitest";
import { buildOutfit } from "@/lib/stylist";
import { items } from "@/lib/data";
import { seedPosts, pieceTags } from "@/lib/community";

describe("separates in the AI stylist", () => {
  it("a top-based look always gets a bottom", () => {
    const onlySeparates = items.filter((i) => i.category !== "Dress" && i.category !== "Suit");
    const o = buildOutfit(onlySeparates, { occasion: "Everyday", style: "Minimal", size: "S", budget: 500, days: 1, radius: 5 });
    expect(o.slots.main?.category).toBe("Top");
    expect(o.slots.bottom?.category).toBe("Bottom");
  });
  it("a dress look never adds a bottom", () => {
    const dresses = items.filter((i) => i.category !== "Top" && i.category !== "Suit");
    const o = buildOutfit(dresses, { occasion: "Date", style: "Elegant", size: "S", budget: 500, days: 1, radius: 5 });
    expect(o.slots.main?.category).toBe("Dress");
    expect(o.slots.bottom).toBeUndefined();
  });
});

describe("community outfit tags", () => {
  it("every tagged piece links to a real listing", () => {
    for (const p of seedPosts) for (const t of pieceTags(p)) expect(items.some((i) => i.id === t.itemId)).toBe(true);
  });
  it("at least two seeded looks have no dress", () => {
    const noDress = seedPosts.filter((p) => pieceTags(p).every((t) => items.find((i) => i.id === t.itemId)?.category !== "Dress") && pieceTags(p).length >= 3);
    expect(noDress.length).toBeGreaterThanOrEqual(2);
  });
});
