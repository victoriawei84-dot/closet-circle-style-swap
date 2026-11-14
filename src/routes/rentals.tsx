import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getUser, getItem, priceRental, ME, type Rental, type RentalStatus } from "@/lib/data";
import { fmt } from "@/lib/availability";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui-kit";

export const Route = createFileRoute("/rentals")({
  head: () => ({ meta: [
    { title: "Rentals — SisUse" },
    { name: "description", content: "Track what you borrow and what you lend: requests, pickups, returns and reviews." },
    { property: "og:title", content: "Rentals — SisUse" },
    { property: "og:description", content: "Borrowing and lending, from request to review." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Rentals,
});

export const statusTone: Record<RentalStatus, string> = { Requested: "bg-secondary text-secondary-foreground", Confirmed: "bg-accent text-accent-foreground", "Picked Up": "bg-primary text-primary-foreground", Returned: "bg-muted", Completed: "bg-muted text-muted-foreground", Declined: "bg-destructive/10 text-destructive" };

/** What the signed-in user should do next, depending on her side of the order. */
export function nextAction(r: Rental, lending: boolean): string {
  switch (r.status) {
    case "Requested": return lending ? "Accept or decline" : "Waiting for the owner";
    case "Confirmed": return "Meet for pickup";
    case "Picked Up": return lending ? "Waiting for return" : "Return by " + fmt(r.end);
    case "Returned": return lending ? "Check condition & release deposit" : "Owner checking condition";
    case "Completed": return r.reviewed ? "Done" : "Leave a review";
    case "Declined": return "Declined";
  }
}

function Rentals() {
  const { rentals, allItems } = useStore();
  const [tab, setTab] = useState<"borrow" | "lend">("borrow");
  const borrowing = rentals.filter((r) => r.renterId === ME);
  const lending = rentals.filter((r) => r.ownerId === ME);
  const list = tab === "borrow" ? borrowing : lending;
  const pending = lending.filter((r) => r.status === "Requested").length;
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">Rentals</h1>
      <div role="tablist" className="inline-flex rounded-full bg-muted p-1 text-sm">
        {([["borrow", `Borrowing (${borrowing.length})`], ["lend", `Lending (${lending.length})${pending ? ` · ${pending} new` : ""}`]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={"rounded-full px-5 py-2 transition " + (tab === k ? "bg-background shadow-soft" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">{tab === "borrow" ? "Nothing borrowed yet — find a piece in Discover." : "No requests for your pieces yet. List something in My Closet."}</p>}
      {list.map((r) => {
        const i = allItems.find((x) => x.id === r.itemId) ?? getItem(r.itemId);
        if (!i) return null;
        const other = getUser(tab === "borrow" ? r.ownerId : r.renterId);
        const p = priceRental(i, r.start, r.end, r.pointsUsed ?? 0);
        return (
          <Link key={r.id} to="/rentals/$id" params={{ id: r.id }} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition hover:shadow-soft">
            <img src={i.image} alt="" className="h-20 w-16 rounded-xl object-cover" />
            <div className="flex-1 space-y-0.5">
              <p className="font-medium">{i.title}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Avatar id={other.id} size={18} />{tab === "borrow" ? "Lender" : "Renter"}: {other.name} · {tab === "borrow" ? "" : "requested "}{fmt(r.start)} → {fmt(r.end)}</p>
              <p className="text-xs text-muted-foreground">{tab === "borrow" ? `Total $${p.total}` : `You earn $${p.rental}`} · Next: <span className="text-foreground">{nextAction(r, tab === "lend")}</span></p>
            </div>
            <span className={"rounded-full px-3 py-1 text-xs " + statusTone[r.status]}>{r.status}</span>
          </Link>);
      })}
    </div>
  );
}
