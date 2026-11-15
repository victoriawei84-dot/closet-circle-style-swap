import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { getUser, ME } from "@/lib/data";
import { rentalHistory } from "@/lib/rental-flow";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/availability";

export const Route = createFileRoute("/rentals_/history")({
  head: () => ({ meta: [
    { title: "Rental history — SisUse" },
    { name: "description", content: "Track every SisUse rental, from request and pickup to return and completion." },
    { property: "og:title", content: "Rental history — SisUse" },
    { property: "og:description", content: "Your lending history, renters, dates and agreed rental prices." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: History,
});
function History() {
  const s = useStore();
  const [side, setSide] = useState<"lend" | "borrow">("lend");
  const [status, setStatus] = useState("All");
  const list = rentalHistory(s.rentals, s.authUser?.id ?? ME, side, status);
  return <div className="space-y-6">
    <Link to="/rentals" className="text-sm underline">All rentals</Link>
    <h1 className="text-4xl">Rental history</h1>
    {!s.authUser && <p className="text-sm text-muted-foreground">Demo rental history</p>}
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-2"><Button disabled={!s.authReady} variant={side === "lend" ? "default" : "outline"} onClick={() => setSide("lend")}>Lending</Button><Button disabled={!s.authReady} variant={side === "borrow" ? "default" : "outline"} onClick={() => setSide("borrow")}>Borrowing</Button></div>
      <label className="text-sm">Status <select disabled={!s.authReady} aria-label="Rental status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-input bg-background p-2">{["All", "Requested", "Confirmed", "Picked Up", "Returned", "Completed", "Declined"].map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p className="text-sm text-muted-foreground">{list.length} rentals</p>
    <div className="space-y-3">{list.map((rental) => {
      const item = s.allItems.find((piece) => piece.id === rental.itemId);
      const other = getUser(side === "lend" ? rental.renterId : rental.ownerId);
      return <Link key={rental.id} to="/rentals/$id" params={{ id: rental.id }} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 rounded-lg border border-border p-4 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
        {item && <img src={item.image} alt={item.title} className="h-20 w-16 rounded-md object-cover" />}
        <div className="min-w-0 space-y-1"><p className="font-medium">{item?.title ?? "Rental piece"}</p><p className="text-sm text-muted-foreground">{side === "lend" ? "Renter" : "Lender"}: {other.name}</p><p className="text-sm">{fmt(rental.start)} – {fmt(rental.end)}</p><p className="text-xs text-muted-foreground">{rental.createdAt ? `Requested ${fmt(rental.createdAt)}` : "Demo rental"}</p></div>
        <div className="col-start-2 text-sm sm:col-start-3"><p>{rental.status}</p>{rental.agreedPrice && <p className="mt-1 font-medium">Agreed total ${rental.agreedPrice.total.toFixed(2)}</p>}</div>
      </Link>;
    })}</div>
    {!list.length && <p className="text-muted-foreground">No rentals match this history view.</p>}
  </div>;
}