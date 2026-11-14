import { describe, it, expect } from "vitest";
import { postPoints, seedPosts } from "@/lib/community";
import { recommend, items } from "@/lib/data";

const base = { ...seedPosts[0]!, userId: "ines", likes: 0, saves: 0 };
describe("community points", () => {
  it("save is worth more than a like", () => {
    expect(postPoints(base, true, true, false)).toBe(1);
    expect(postPoints(base, true, false, true)).toBe(3);
  });
  it("caps at 50 and ignores unverified + self engagement", () => {
    expect(postPoints({ ...base, likes: 100 }, true, false, false)).toBe(50);
    expect(postPoints(base, false, true, true)).toBe(0);
    expect(postPoints({ ...base, userId: "me" }, true, true, true)).toBe(0);
  });
});
describe("discover ranking", () => {
  it("saved items rank higher among eligible listings", () => {
    const q = { occasion: "Wedding", size: "S", budget: 200, date: "2026-11-21" };
    const top = recommend(q, { soulmates: [], favorites: ["nude-heels"], savedPostItems: [] }, items)[0]!;
    expect(top.item.id).toBe("nude-heels");
    expect(top.reasons).toContain("On your wishlist");
  });
  it("filters out items over budget", () => {
    const r = recommend({ occasion: "", size: "S", budget: 40 }, { soulmates: [], favorites: [], savedPostItems: [] }, items);
    expect(r.every((x) => x.item.dailyRate * 2 <= 40)).toBe(true);
  });
});
