import { describe, it, expect } from "vitest";
import { items } from "@/lib/data";
import { buildLooks, type LookRequest, type StylingPrefs } from "@/lib/styling";

/** The brief's demo: wedding guest, under $60, warm undertone, defined waist, owns cream heels. */
const prefs: StylingPrefs = { undertone: "warm", skinTone: "sand", bodyShape: "hourglass", colors: ["olive", "gold", "cream"], silhouettes: ["Wrap"], coverage: "balanced", fit: "regular" };
const req: LookRequest = { occasion: "Wedding", start: "2026-11-21", end: "2026-11-21", zip: "94110", budget: 60, radius: 3, days: 1, size: "S" };

describe("personal styling", () => {
  const looks = buildLooks(items, req, prefs, ["cream heels"]);

  it("builds two or three distinct looks when inventory allows", () => {
    expect(looks.length).toBeGreaterThanOrEqual(2);
    expect(new Set(looks.map((l) => l.id)).size).toBe(looks.length);
  });

  it("suggests the olive wrap dress and gold earrings for the wedding demo", () => {
    const warm = looks.find((l) => l.name === "Warm neutrals")!;
    const ids = warm.pieces.map((p) => p.item.id);
    expect(ids).toContain("olive-wrap");
    expect(ids).toContain("gold-hoops");
    expect(warm.total).toBeLessThanOrEqual(60);
  });

  it("explains each look with the shopper's own preferences", () => {
    const warm = looks.find((l) => l.name === "Warm neutrals")!;
    expect(warm.reason).toMatch(/olive|gold|warm/i);
  });

  it("keeps pieces the shopper already owns out of the rental total", () => {
    const owned = buildLooks(items, req, prefs, ["nude strappy sandals"]);
    for (const l of owned) expect(l.pieces.map((p) => p.item.id)).not.toContain("nude-heels");
  });

  it("stays inside the stated budget on every look", () => {
    for (const l of looks) expect(l.total).toBeLessThanOrEqual(req.budget);
  });

  it("drops listings already booked for the requested dates", () => {
    const blocked = buildLooks([...items, { ...items[0]!, id: "booked-copy", blockedDates: ["2026-11-21"] }], req, prefs, []);
    expect(blocked.flatMap((l) => l.pieces.map((p) => p.item.id))).not.toContain("booked-copy");
  });

  it("drops listings outside the pickup radius", () => {
    const near = buildLooks(items, { ...req, radius: 1 }, prefs, []);
    for (const l of near) for (const p of l.pieces) expect(p.item.distance).toBeLessThanOrEqual(1);
  });
});
