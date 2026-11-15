import type { Rental, RentalStatus } from "./data";

export function rentalHistory(rentals: Rental[], userId: string, side: "lend" | "borrow", status = "All") {
  return rentals.filter((rental) => (side === "lend" ? rental.ownerId : rental.renterId) === userId && (status === "All" || rental.status === status))
    .sort((a, b) => (b.createdAt ?? b.start).localeCompare(a.createdAt ?? a.start));
}
export function lenderNextStatus(status: RentalStatus): RentalStatus | null {
  return ({ Requested: "Confirmed", Confirmed: "Picked Up", "Picked Up": "Returned", Returned: "Completed" } as Partial<Record<RentalStatus, RentalStatus>>)[status] ?? null;
}