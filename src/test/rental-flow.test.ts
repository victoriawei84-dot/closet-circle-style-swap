import { describe, expect, it } from "vitest";
import { lenderNextStatus, rentalHistory } from "../lib/rental-flow";
import type { Rental } from "../lib/data";
const rental: Rental = { id: "one", itemId: "piece", ownerId: "owner", renterId: "renter", start: "2026-11-20", end: "2026-11-22", status: "Requested", pickup: "Library", messages: [] };
describe("rental lifecycle", () => {
  it("confirms a request", () => expect(lenderNextStatus("Requested")).toBe("Confirmed"));
  it("records pickup before return", () => expect(lenderNextStatus("Confirmed")).toBe("Picked Up"));
  it("records return", () => expect(lenderNextStatus("Picked Up")).toBe("Returned"));
  it("completes a returned rental", () => expect(lenderNextStatus("Returned")).toBe("Completed"));
  it("keeps completed and declined rentals in lender history", () => expect(rentalHistory([rental, { ...rental, id: "two", status: "Completed" }, { ...rental, id: "three", status: "Declined" }], "owner", "lend")).toHaveLength(3));
  it("excludes another lender's requests", () => expect(rentalHistory([rental], "other", "lend")).toEqual([]));
  it("filters history by returned status", () => expect(rentalHistory([rental, { ...rental, id: "returned", status: "Returned" }], "owner", "lend", "Returned").map((r) => r.id)).toEqual(["returned"]));
});