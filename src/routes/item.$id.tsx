import { sanitizedLabel } from "@/lib/sanitize";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, ShieldCheck, Star, MapPin, Clock, Ruler, Info } from "lucide-react";
import { toast } from "sonner";
import { isRangeBlocked, nextAvailable, addDays, fmt } from "@/lib/availability";
import { getItem, getUser, priceRental, pickupSpots, compatibility, users, ME } from "@/lib/data";
import { useStore } from "@/lib/store";
import { isVerified, pieceTags } from "@/lib/community";
import { Avatar, HeartButton, btn, btnGhost, input } from "@/components/ui-kit";
import { PreviewOnMe, FitCheckCard } from "@/components/preview-on-me";
import { isClothing } from "@/lib/fit";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params }) => { const item = getItem(params.id); return { title: item?.title ?? "Rental listing", desc: item?.description ?? "A piece from a SisUse member." }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Item"} — SisUse` },
    { name: "description", content: loaderData?.desc ?? "Rent this piece from a neighbor." },
    { property: "og:title", content: `${loaderData?.title ?? "Item"} — SisUse` },
    { property: "og:description", content: loaderData?.desc ?? "Rent this piece from a neighbor." },
    { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const store = useStore();
  const found = store.allItems.find((i) => i.id === id) ?? getItem(id);
  if (!found) return <p>Loading listing…</p>;
  return <LoadedItem item={found} />;
}
function LoadedItem({ item }: { item: import("@/lib/data").Item }) {
  const store = useStore();
  const owner = getUser(item.ownerId);
  const nav = useNavigate();
  const [start, setStart] = useState("2026-11-20");
  const [end, setEnd] = useState("2026-11-22");
  const [pickup, setPickup] = useState<string>(pickupSpots[0]!);
  const [usePts, setUsePts] = useState(false);
  const pts = usePts && !item.real ? Math.floor(store.points / 100) * 100 : 0;
  const p = priceRental(item, start, end, pts);
  const blocked = isRangeBlocked(item, start, end);
  const nextFree = nextAvailable(item, start);
  const mine = item.ownerId === (store.authUser?.id ?? ME);
  const isSoul = store.soulmates.includes(owner.id);
  const match = compatibility(users.find((u) => u.id === ME)!, owner);

  const request = async () => {
    try { const rid = await store.requestRental({ itemId: item.id, ownerId: owner.id, start, end, pickup, pointsUsed: p.discount * 10 });
    toast.success("Request sent to " + owner.name);
    nav({ to: "/rentals/$id", params: { id: rid } }); } catch (e) { toast.error(e instanceof Error ? e.message : "Request could not be sent"); }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative">
        <img src={item.image} alt={item.title} className="w-full rounded-3xl object-cover" />
        {item.gallery && item.gallery.length > 1 && <div className="mt-3 flex gap-2">{item.gallery.map((g) => <img key={g} src={g} alt="" className="h-20 w-20 rounded-xl object-cover" />)}</div>}
        <HeartButton active={store.favorites.includes(item.id)} onClick={() => store.toggleFav(item.id)} className="absolute right-4 top-4" />
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-normalst text-muted-foreground">{item.brand} · {item.category}</p>
          <h1 className="text-4xl font-semibold">{item.title}</h1>
          <p className="mt-2 text-muted-foreground">{item.description}</p>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{owner.neighborhood}, {owner.zip} · {item.distance} mi away (exact spot shared after confirmation)</p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Link to="/user/$id" params={{ id: owner.id }}><Avatar id={owner.id} size={52} /></Link>
          <div className="flex-1 text-sm">
            <Link to="/user/$id" params={{ id: owner.id }} className="font-medium">{owner.name}</Link>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-current" />{owner.rating} ({owner.reviews}) · {owner.responseRate}% response · <Clock className="h-3 w-3" />{owner.responseTime}</p>
            <p className="text-xs text-accent-foreground">{match}% style match</p>
          </div>
          <button onClick={() => { store.toggleSoulmate(owner.id); if (!isSoul) toast.success(`${owner.name} saved as a Closet Soulmate`); }} className={isSoul ? btnGhost : btn}>{isSoul ? "Soulmate ✓" : "Save Soulmate"}</button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl bg-muted p-4">
            <p className="mb-2 flex items-center gap-1 font-medium"><Ruler className="h-4 w-4" />Measurements · Size {item.size}</p>
            {Object.entries(item.measurements).map(([k, v]) => <p key={k} className="flex justify-between text-muted-foreground"><span>{k}</span><span>{v}</span></p>)}
          </div>
          <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Condition</p>
            {sanitizedLabel(item) && <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground"><ShieldCheck className="h-3 w-3" />{sanitizedLabel(item)}</p>}
            <p>{item.condition}</p><p>Flaws: {item.flaws}</p>{item.retail > 0 && <p>Original retail price ${item.retail}</p>}<p>Notice: {item.minNotice}</p>
          </div>
        </div>

        {isClothing(item.category) ? <PreviewOnMe item={item} /> : null}
        {isClothing(item.category) && <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Just the Fit Check</summary><div className="mt-2"><FitCheckCard item={item} /></div></details>}

        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="flex items-baseline justify-between"><span className="text-sm text-muted-foreground">Original rental price</span><span className="type-detail text-3xl">${item.dailyRate}<span className="text-sm text-muted-foreground"> / day</span></span></p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">Pick up<input type="date" className={input} value={start} onChange={(e) => setStart(e.target.value)} /></label>
            <label className="text-xs text-muted-foreground">Return<input type="date" className={input} value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></label>
          </div>
          <label className="block text-xs text-muted-foreground">Public meetup spot<select className={input} value={pickup} onChange={(e) => setPickup(e.target.value)}>{pickupSpots.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={usePts} onChange={(e) => setUsePts(e.target.checked)} />Use reward points ({store.points} pts)</label>
          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <Row l={`Rental subtotal ($${item.dailyRate} × ${p.days} ${p.days === 1 ? "day" : "days"})`} r={p.rental} />
            {p.cleaning > 0 && <Row l="Cleaning fee" r={p.cleaning} />}
            {p.discount > 0 && <Row l={`Points applied (${p.discount * 10} pts)`} r={-p.discount} />}
            {p.deposit > 0 && <Row l="Refundable deposit" r={p.deposit} />}
            <Row l="Final amount due" r={p.total} bold />
          </div>
          {blocked && <div className="rounded-xl bg-secondary p-3 text-sm"><p className="font-medium">Unavailable for selected dates</p><p className="text-muted-foreground">Next available: {fmt(nextFree)}. <button className="underline" onClick={() => { setStart(nextFree); setEnd(addDays(nextFree, 1)); }}>Use {fmt(nextFree)}–{fmt(addDays(nextFree, 1))}</button></p></div>}
          {mine && <p className="text-xs text-muted-foreground">This is your listing — manage dates in <Link to="/closet" className="underline">My Closet</Link>.</p>}
          {!item.real && <p className="text-xs text-muted-foreground">Demo listing · no real rental requests.</p>}
          {item.real && !store.authUser && <Link to="/auth" className={btnGhost}>Sign in to request this piece</Link>}
          <button disabled={blocked || mine || (!!store.authUser && !item.real) || (!!item.real && !store.authUser)} onClick={request} className={btn + " w-full"}>Request to rent</button>
          <p className="flex gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" />Free cancellation up to 48h before pickup. Condition photos at pickup & return; normal wear is never charged.</p>
          <p className="flex gap-1 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Prototype: no payment is taken. <Link to="/terms" className="underline">Rental terms</Link></p>
        </div>
      </div>
      <VisualReviews itemId={item.id} />
    </div>
  );
}

function VisualReviews({ itemId }: { itemId: string }) {
  const store = useStore();
  const ownerOf = (id: string) => store.allItems.find((i) => i.id === id)?.ownerId;
  const src = (p: (typeof store.allPosts)[number]) => pieceTags(p, ownerOf).find((t) => t.itemId === itemId)?.source;
  const looks = store.allPosts.filter((p) => src(p) === "rented" && isVerified(p, store.myCompleted));
  const styled = store.allPosts.filter((p) => src(p) === "closet");
  if (!looks.length && !styled.length) return null;
  return (
    <section className="md:col-span-2">
      {styled.length > 0 && <><h2 className="mb-3 text-3xl">Styled by the owner</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">{styled.map((p) => (
        <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <img src={p.image} alt={p.caption} className="aspect-[3/4] w-full object-cover" loading="lazy" />
          <div className="space-y-1 p-3 text-xs"><p className="font-medium">From my closet · {p.userId === ME ? "You" : getUser(p.userId).name}{p.demo ? " · demo" : ""}</p><p>{p.caption}</p></div>
        </div>))}</div></>}
      {looks.length > 0 && <h2 className="mb-3 text-3xl">Worn by renters</h2>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{looks.map((p) => (
        <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <img src={p.image} alt={p.caption} className="aspect-[3/4] w-full object-cover" loading="lazy" />
          <div className="space-y-1 p-3 text-xs"><p className="flex items-center gap-1 font-medium"><BadgeCheck className="h-3 w-3" />Verified Rental · {p.userId === ME ? "You" : getUser(p.userId).name}</p><p>{p.caption}</p>{p.review && <p className="text-muted-foreground">Condition {p.review.condition}/5 · As described {p.review.accuracy}/5 · Exchange {p.review.experience}/5</p>}</div>
        </div>))}</div>
    </section>
  );
}
const Row = ({ l, r, bold }: { l: string; r: number; bold?: boolean }) => (
  <p className={"flex justify-between " + (bold ? "pt-1 font-semibold" : "text-muted-foreground")}><span>{l}</span><span>{r < 0 ? "−" : ""}${Math.abs(r)}</span></p>
);
