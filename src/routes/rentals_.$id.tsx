import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Camera, Send, Star, Flag } from "lucide-react";
import { toast } from "sonner";
import { getUser, getItem, priceRental, ME, type RentalStatus } from "@/lib/data";
import { GarmentCare } from "@/components/garment-care";
import { fmt } from "@/lib/availability";
import { useStore } from "@/lib/store";
import { Avatar, DemoTag, btn, btnGhost, input } from "@/components/ui-kit";

export const Route = createFileRoute("/rentals_/$id")({
  head: () => ({ meta: [
    { title: "Rental details — SisUse" },
    { name: "description", content: "Pricing, pickup, messages and review for your rental." },
    { property: "og:title", content: "Rental details — SisUse" },
    { property: "og:description", content: "Pricing, pickup, messages and review for your rental." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: RentalDetail,
});

const steps: RentalStatus[] = ["Requested", "Confirmed", "Picked Up", "Returned", "Completed"];
const next: Partial<Record<RentalStatus, { to: RentalStatus; label: string; photo?: boolean }>> = {
  Requested: { to: "Confirmed", label: "Accept request" },
  Confirmed: { to: "Picked Up", label: "Confirm pickup", photo: true },
  "Picked Up": { to: "Returned", label: "Confirm return", photo: true },
  Returned: { to: "Completed", label: "Owner confirms condition & refunds deposit" },
};

function RentalDetail() {
  const { id } = Route.useParams();
  const s = useStore();
  const r = s.rentals.find((x) => x.id === id);
  const [msg, setMsg] = useState("");
  const [photo, setPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [rv, setRv] = useState({ condition: 5, accuracy: 5, communication: 5, reliability: 5, text: "" });
  if (!r) return <p>Rental not found. <Link to="/rentals" className="underline">Back</Link></p>;
  const item = s.allItems.find((i) => i.id === r.itemId) ?? getItem(r.itemId)!;
  const lending = r.ownerId === (s.authUser?.id ?? ME);
  const owner = getUser(r.ownerId);
  const other = getUser(lending ? r.renterId : r.ownerId);
  const computed = priceRental(item, r.start, r.end, r.pointsUsed ?? 0);
  const p = r.agreedPrice ? { ...computed, rental: r.agreedPrice.dailyRate * computed.days, cleaning: r.agreedPrice.cleaning, deposit: r.agreedPrice.deposit, total: r.agreedPrice.total } : computed;
  const idx = steps.indexOf(r.status);
  const n0 = next[r.status];
  // Only the lender accepts requests or confirms the returned condition.
  const n = n0 && (r.real ? lending : ((r.status === "Requested" || r.status === "Returned") ? lending : true)) ? n0 : undefined;
  const changeStatus = async (status: RentalStatus) => {
    setSaving(true); setStatusError("");
    try { await s.setStatus(r.id, status); setPhoto(false); toast.success(`Rental ${status.toLowerCase()}`); }
    catch (error) { setStatusError(error instanceof Error ? error.message : "Could not update this rental. Please retry."); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Link to="/rentals" className="text-sm text-muted-foreground">← All rentals</Link>
        <p className="text-xs text-muted-foreground">{lending ? `Lending to ${other.name}` : `Borrowing from ${other.name}`}</p>
        <div className="flex gap-4"><img src={item.image} alt="" className="h-32 w-24 rounded-2xl object-cover" />
          <div><h1 className="text-3xl font-semibold">{item.title}</h1><p className="text-sm text-muted-foreground">{fmt(r.start)} → {fmt(r.end)} · {p.days} days · Return by {fmt(r.end)}</p>
            <p className="text-sm text-muted-foreground">Meetup: {idx >= 1 ? r.pickup : `${owner.neighborhood} (exact spot after confirmation)`}</p></div></div>

        {r.status === "Declined" ? <p className="text-destructive">This request was declined.</p> : (
          <ol className="flex items-center">{steps.map((st, i) => (
            <li key={st} className="flex flex-1 flex-col items-center gap-1 text-[11px]">
              <span className={"grid h-8 w-8 place-items-center rounded-full " + (i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i < idx || r.status === "Completed" ? <Check className="h-4 w-4" /> : i + 1}</span>{st}
            </li>))}</ol>
        )}

        {n && (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            {!r.real && n.photo && <button onClick={() => setPhoto(true)} className={btnGhost}><Camera className="h-4 w-4" />{photo ? "Condition photos added ✓" : "Add condition photos"}</button>}
            <div className="flex flex-wrap gap-2">
              <button disabled={saving || (!r.real && n.photo && !photo)} onClick={() => changeStatus(n.to)} className={btn}>{saving ? "Saving…" : r.real && r.status === "Returned" ? "Complete rental" : n.label}</button>
              {r.status === "Requested" && lending && <button disabled={saving} onClick={() => changeStatus("Declined")} className={btnGhost}>Decline</button>}
            </div>
            {!r.real && <DemoTag>Demo · simulated owner actions & payments</DemoTag>}
          </div>
        )}

        {statusError && <p role="alert" className="text-sm text-destructive">{statusError}</p>}
        {r.real && <section className="space-y-3 border-t border-border pt-5"><h2 className="text-2xl">Rental timeline</h2><ol className="space-y-2">{(r.events ?? []).map((event) => <li key={event.at + event.status} className="flex flex-wrap justify-between gap-2 text-sm"><span>{event.status}</span><time className="text-muted-foreground" dateTime={event.at}>{new Date(event.at).toLocaleString()}</time></li>)}</ol><Link to="/rentals/history" className="text-sm underline">View rental history</Link></section>}

        {!r.real && r.status === "Completed" && !r.reviewed && !lending && (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-2xl">Review this rental · +50 pts</h2>
            <p className="text-xs text-muted-foreground">Reviews focus on the item and the exchange — never on appearance or body.</p>
            {(["condition", "accuracy", "communication", "reliability"] as const).map((k) => (
              <div key={k} className="flex items-center justify-between text-sm capitalize">{k === "accuracy" ? "Description accuracy" : k}
                <span className="flex">{[1, 2, 3, 4, 5].map((v) => <button key={v} aria-label={`${v} stars`} onClick={() => setRv({ ...rv, [k]: v })}><Star className={"h-5 w-5 " + (v <= rv[k] ? "fill-blush text-blush" : "text-muted-foreground")} /></button>)}</span></div>))}
            <textarea className={input} placeholder="How was the item and the exchange?" value={rv.text} onChange={(e) => setRv({ ...rv, text: e.target.value })} />
            <button disabled={rv.text.trim().length < 10} onClick={() => { s.review(r.id); toast.success("Thanks! +50 community points"); }} className={btn}>Submit review</button>
          </div>
        )}
        {r.reviewed && !lending && <div className="rounded-2xl bg-hero p-5"><p className="font-display text-2xl">Reviewed — thank you!</p>
          <p className="text-sm text-muted-foreground">You'll now see more picks from {owner.name}'s closet.</p>
          <div className="mt-3 flex gap-2">
            {!s.soulmates.includes(owner.id) && <button onClick={() => s.toggleSoulmate(owner.id)} className={btn}>Save {owner.name} as Soulmate</button>}
            <Link to="/user/$id" params={{ id: owner.id }} className={btnGhost}>Browse closet</Link></div></div>}

        {!r.real && !n && r.status === "Requested" && !lending && <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm"><span className="flex-1 text-muted-foreground">Waiting for {owner.name} to accept.</span><button onClick={() => { s.setStatus(r.id, "Declined"); toast("Request cancelled"); }} className={btnGhost}>Cancel request</button></div>}
        {r.status === "Returned" && !lending && <p className="text-sm text-muted-foreground">{owner.name} is checking the condition; your deposit is released after.</p>}
        <GarmentCare item={item} defaultArea={getUser(ME).zip || getUser(ME).neighborhood} />
        <button onClick={() => toast("Report submitted. Our team will follow up.")} className="flex items-center gap-1 text-xs text-muted-foreground"><Flag className="h-3 w-3" />Report a problem (damage, late return, behavior)</button>
      </div>

      <aside className="space-y-4">
        <div className="space-y-1 rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="mb-2 font-medium">{lending ? "Order summary" : "Pricing"}</p>
          <L a={`Rental (${p.days} days)`} b={p.rental} /><L a="Cleaning" b={p.cleaning} />{p.discount > 0 && <L a="Points" b={-p.discount} />}<L a="Deposit (refundable)" b={p.deposit} />
          <p className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>${p.total}</span></p>
        </div>
        {!r.real && <div className="flex h-96 flex-col rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-3"><Avatar id={other.id} size={32} /><span className="text-sm font-medium">{other.name}</span></div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {r.messages.length === 0 && <p className="text-xs text-muted-foreground">Say hi and coordinate pickup and return.</p>}
            {r.messages.map((m, i) => <p key={i} className={"max-w-[80%] rounded-2xl px-3 py-2 text-sm " + (m.from === ME ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>{m.text}</p>)}
          </div>
          <form className="flex gap-2 border-t border-border p-2" onSubmit={(e) => { e.preventDefault(); if (msg.trim()) { s.sendMessage(r.id, msg); setMsg(""); } }}>
            <input className={input} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message" /><button aria-label="Send" className={btn + " px-3"}><Send className="h-4 w-4" /></button>
          </form>
        </div>}
      </aside>
    </div>
  );
}
const L = ({ a, b }: { a: string; b: number }) => <p className="flex justify-between text-muted-foreground"><span>{a}</span><span>{b < 0 ? "−" : ""}${Math.abs(b)}</span></p>;
