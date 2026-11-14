import { describe, it, expect } from "vitest";
import { isRangeBlocked, nextAvailable, blockConflicts } from "@/lib/availability";
import { items, type Rental } from "@/lib/data";

const bag = { ...items[0]!, blockedDates: [], blocks: [{ id: "b", start: "2026-11-14", end: "2026-11-20" }] };

describe("owner date blocks", () => {
  it("rejects a request overlapping the block", () => expect(isRangeBlocked(bag, "2026-11-19", "2026-11-22")).toBe(true));
  it("allows a request after the block", () => expect(isRangeBlocked(bag, "2026-11-21", "2026-11-23")).toBe(false));
  it("next available date is the day after the block", () => expect(nextAvailable(bag, "2026-11-15")).toBe("2026-11-21"));
  it("flags a block that overlaps a confirmed rental, not a pending one", () => {
    const rs = [{ id: "a", itemId: bag.id, status: "Confirmed", start: "2026-12-05", end: "2026-12-06" }, { id: "b", itemId: bag.id, status: "Requested", start: "2026-12-10", end: "2026-12-11" }] as Rental[];
    expect(blockConflicts(rs, bag.id, "2026-12-01", "2026-12-12").map((r) => r.id)).toEqual(["a"]);
  });
});
