import { describe, it, expect } from "vitest";
import { priceRental, items } from "@/lib/data";
const dress = items.find((i) => i.id === "sage-slip")!;
describe("rental pricing", () => {
  it("counts days inclusively and adds cleaning + deposit", () => {
    expect(priceRental(dress, "2026-11-20", "2026-11-22")).toMatchObject({ days: 3, rental: 84, total: 84 + 12 + 80 });
  });
  it("100 points = $10 off", () => {
    expect(priceRental(dress, "2026-11-20", "2026-11-22", 250).discount).toBe(20);
  });
});
