import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Bookmark, BadgeCheck, Shirt, UserPlus, UserCheck, X, Plus, Sparkles, Star, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { users, getUser, getItem, ME } from "@/lib/data";
import { isVerified, taggedIds, pieceTags, verifiedPiece, SOURCE_LABEL, type PieceTag, postPoints, tasteTags, scorePost, recommendPeople, POST_CAP, type Post } from "@/lib/community";
import { useStore } from "@/lib/store";
import { Avatar, Chip, btn, btnGhost, input } from "@/components/ui-kit";
import { Plans, MakePlanButton } from "@/components/invite";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [
    { title: "Community — SisUse" },
    { name: "description", content: "An outfit feed from your neighbors: verified rental looks, owner styling and Closet Soulmates." },
    { property: "og:title", content: "Community outfit feed — SisUse" },
    { property: "og:description", content: "Real looks from neighborhood rentals, styling ideas and style-matched neighbors." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Community,
});

const needs = ["All", "Wedding Guest", "Graduation Photos", "Brunch", "Work", "Photo walk", "Under $40"];
const styles = ["Any style", "Romantic", "Minimal", "Silk", "Evening", "Tailored", "Quiet luxury", "Vintage", "Boho"];
const hoods = ["Anywhere", ...new Set(users.filter((u) => u.id !== ME).map((u) => u.neighborhood))];

function Community() {
  const s = useStore();
  const me = getUser(ME);
  const [tab, setTab] = useState<"foryou" | "saved">("foryou");
  const [need, setNeed] = useState("All");
  const [style, setStyle] = useState(styles[0]!);
  const [hood, setHood] = useState(hoods[0]!);
  const [composing, setComposing] = useState(false);
  const taste = { likedPosts: s.likedPosts, savedPosts: s.savedPosts, favorites: s.favorites, soulmates: s.soulmates };
  const w = tasteTags(me, s.allPosts, taste);

  const feed = useMemo(() => s.allPosts
    .filter((p) => tab === "foryou" || s.savedPosts.includes(p.id))
    .filter((p) => need === "All" || (need === "Under $40" ? taggedIds(p).every((id) => (getItem(id)?.dailyRate ?? 99) < 40) : p.occasion === need))
    .filter((p) => style === styles[0] || p.styleTags.includes(style))
    .filter((p) => hood === hoods[0] || getUser(p.userId).neighborhood === hood)
    .sort((a, b) => (a.userId === ME ? -1 : b.userId === ME ? 1 : scorePost(b, me, w, taste) - scorePost(a, me, w, taste))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.allPosts, tab, need, style, hood, s.likedPosts, s.savedPosts, s.favorites, s.soulmates]);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl">Community</h1>
          <p className="text-muted-foreground">Real looks from neighborhood closets. Like, save, and find your Closet Soulmates.</p>
        </div>
        <button onClick={() => setComposing(!composing)} className={btn}><Plus className="h-4 w-4" />Share a look</button>
      </section>

      {composing && <Composer onDone={() => setComposing(false)} />}

      <Plans />

      <Recommended w={w} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-muted p-1">
            {([["foryou", "For You"], ["saved", `Saved (${s.savedPosts.length})`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={cn("rounded-full px-4 py-1.5 text-sm", tab === k ? "bg-card shadow-soft" : "text-muted-foreground")}>{l}</button>
            ))}
          </div>
          <select aria-label="Style" className={input.replace("w-full", "w-auto") + " py-1.5"} value={style} onChange={(e) => setStyle(e.target.value)}>{styles.map((x) => <option key={x}>{x}</option>)}</select>
          <select aria-label="Neighborhood" className={input.replace("w-full", "w-auto") + " py-1.5"} value={hood} onChange={(e) => setHood(e.target.value)}>{hoods.map((x) => <option key={x}>{x}</option>)}</select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">{needs.map((n) => <Chip key={n} active={need === n} onClick={() => setNeed(n)}>{n}</Chip>)}</div>
        {feed.length ? (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">{feed.map((p) => <PostCard key={p.id} p={p} />)}</div>
        ) : (
          <p className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground">{tab === "saved" ? "Save looks with the bookmark to collect outfit inspiration here." : "No looks match these filters yet."}</p>
        )}
      </section>
    </div>
  );
}

export function PostCard({ p }: { p: Post }) {
  const s = useStore();
  const u = getUser(p.userId);
  const find = (id: string) => getItem(id) ?? s.allItems.find((i) => i.id === id);
  const tagged = pieceTags(p, (id) => find(id)?.ownerId).map((t) => ({ t, item: find(t.itemId) })).filter((x): x is { t: PieceTag; item: NonNullable<ReturnType<typeof find>> } => !!x.item);
  const reviewed = tagged.find((x) => x.t.source === "rented")?.item;
  const liked = s.likedPosts.includes(p.id), saved = s.savedPosts.includes(p.id);
  const verified = isVerified(p, s.myCompleted);
  const self = p.userId === ME;
  const pts = postPoints(p, verified, liked, saved);
  const likes = p.likes + (liked && !self ? 1 : 0);
  return (
    <article className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative">
        <img src={p.image} alt={p.caption} loading="lazy" className="aspect-[3/4] w-full object-cover" />
        {p.demo && <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] tracking-[-0.01em]">{p.kind === "rented" ? "Demo rental review" : p.kind === "together" ? "Demo outing post" : "Demo post"}</span>}
        <span className={cn("absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium", p.kind === "together" ? "bg-secondary text-secondary-foreground" : verified ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")}>
          {p.kind === "together" ? <><Users className="h-3 w-3" />Styled Together</> : verified ? <><BadgeCheck className="h-3 w-3" />Verified Rental</> : <><Shirt className="h-3 w-3" />Owner styling</>}
        </span>
        <button aria-label={saved ? "Unsave look" : "Save look"} onClick={() => { s.toggleSavePost(p.id); if (!saved) toast.success("Look saved to your inspiration"); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-soft">
          <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} />
        </button>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm leading-snug">{p.caption}</p>
        {p.review && <p className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">{reviewed && <span className="w-full">Review of {reviewed.title}</span>}<span>Condition {p.review.condition}/5</span><span>As described {p.review.accuracy}/5</span><span>Exchange {p.review.experience}/5</span></p>}
        <div className="flex flex-wrap gap-1">{p.styleTags.map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>)}</div>
        {p.place && <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{p.place}</p>}
        {tagged.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] tracking-[-0.01em] text-muted-foreground">Pieces in this look</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">{tagged.map(({ t, item }) => (
              <div key={item.id} className="relative w-28 shrink-0">
                <Link to="/item/$id" params={{ id: item.id }} className="block overflow-hidden rounded-xl bg-muted">
                  <img src={item.image} alt={`${item.title} product photo`} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                  <span className="block space-y-0.5 p-2"><span className="block truncate text-[11px] font-medium">{item.title}</span><span className="block text-[11px] text-muted-foreground">${item.dailyRate}/day</span>
                    <span className={cn("inline-block rounded-full px-1.5 py-0.5 text-[10px]", t.source === "rented" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")}>{SOURCE_LABEL[t.source]}</span>
                    {p.kind === "together" && <span className="block space-y-0.5 pt-1 text-[10px] leading-snug text-muted-foreground">
                      {t.wornBy && <span className="block">Worn by {getUser(t.wornBy).name}</span>}
                      <span className="block">{t.source === "rented" ? `Rented from ${getUser(item.ownerId).name}` : `From ${getUser(item.ownerId).name}'s closet`}</span>
                      {verifiedPiece(t, s.myCompleted) && <span className="block text-accent-foreground">Verified Rental</span>}
                    </span>}</span>
                </Link>
                <button aria-label={s.favorites.includes(item.id) ? `Unsave ${item.title}` : `Save ${item.title}`} onClick={() => { s.toggleFav(item.id); if (!s.favorites.includes(item.id)) toast.success(`${item.title} saved`); }} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/90">
                  <Heart className={cn("h-3.5 w-3.5", s.favorites.includes(item.id) && "fill-blush text-blush")} />
                </button>
              </div>))}</div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-xs font-medium">
            <Link to="/user/$id" params={{ id: u.id }} className="flex min-w-0 items-center gap-1"><Avatar id={u.id} size={24} /><span className="truncate">{self ? "You" : u.name}</span></Link>
            {p.coAuthorId && <Link to="/user/$id" params={{ id: p.coAuthorId }} className="flex min-w-0 items-center gap-1"><span className="text-muted-foreground">{"&"}</span><Avatar id={p.coAuthorId} size={24} /><span className="truncate">{getUser(p.coAuthorId).name}</span></Link>}
            {p.coAuthorId && !p.coAuthorAccepted && <span className="text-[10px] text-muted-foreground">waiting for {getUser(p.coAuthorId).name} to accept</span>}
          </div>
          <div className="flex items-center gap-2">
            {!self && <button aria-label={s.soulmates.includes(u.id) ? "Remove Soulmate" : "Save as Soulmate"} title="Save as Closet Soulmate" onClick={() => { s.toggleSoulmate(u.id); if (!s.soulmates.includes(u.id)) toast.success(`${u.name} saved as a Closet Soulmate`); }} className="text-muted-foreground">
              {s.soulmates.includes(u.id) ? <UserCheck className="h-4 w-4 text-accent-foreground" /> : <UserPlus className="h-4 w-4" />}
            </button>}
            <button aria-label="Like" onClick={() => s.toggleLike(p.id)} className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart key={String(liked)} className={cn("h-4 w-4", liked && "animate-heart fill-blush text-blush")} />{likes}
            </button>
          </div>
        </div>
        {verified && <p className="flex items-center gap-1 text-[11px] text-accent-foreground"><Sparkles className="h-3 w-3" />{pts} pts earned{pts >= POST_CAP ? " (max)" : ""}</p>}
      </div>
    </article>
  );
}

function Recommended({ w }: { w: Record<string, number> }) {
  const s = useStore();
  const me = getUser(ME);
  const recs = recommendPeople(me, w, [...s.soulmates, ...s.skipped]);
  const saved = users.filter((u) => s.soulmates.includes(u.id));
  const r = recs[0];
  return (
    <section className="grid gap-4 rounded-3xl bg-hero p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
      <div>
        <h2 className="text-3xl">Recommended for you</h2>
        {r ? (
          <div className="mt-3 overflow-hidden rounded-2xl bg-card shadow-soft sm:flex">
            <Link to="/user/$id" params={{ id: r.u.id }} className="block sm:w-2/5"><img src={r.u.avatar} alt={r.u.name} className="h-56 w-full object-cover sm:h-full" /></Link>
            <div className="flex-1 space-y-3 p-4">
              <div><p className="text-2xl font-medium">{r.u.name}</p><p className="text-xs text-muted-foreground">{r.u.neighborhood} · <Star className="inline h-3 w-3 fill-current" /> {r.u.rating}</p></div>
              <p className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{r.reason}</p>
              {r.reasons.length > 1 && <div className="flex flex-wrap gap-1">{r.reasons.slice(1).map((x) => <span key={x} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{x}</span>)}</div>}
              <div className="flex flex-wrap gap-1">{r.u.styleTags.map((t) => <span key={t} className={cn("rounded-full px-2 py-0.5 text-[11px]", w[t] ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>{t}</span>)}</div>
              <div className="flex gap-2">{r.closet.slice(0, 3).map((i) => <Link key={i.id} to="/item/$id" params={{ id: i.id }}><img src={i.image} alt={i.title} className="h-14 w-14 rounded-lg object-cover" /></Link>)}</div>
              <div className="flex gap-2">
                <button onClick={() => s.skipPerson(r.u.id)} className={btnGhost + " flex-1"}><X className="h-4 w-4" />Skip</button>
                <button onClick={() => { s.toggleSoulmate(r.u.id); toast.success(`${r.u.name} saved as a Closet Soulmate`); }} className={btn + " flex-1"}><Heart className="h-4 w-4" />Save as Soulmate</button>
              </div>
              <MakePlanButton toId={r.u.id} />
            </div>
          </div>
        ) : <p className="mt-3 text-sm text-muted-foreground">You've seen everyone nearby for now.</p>}
      </div>
      <div>
        <h3 className="text-2xl">Your Closet Soulmates</h3>
        {saved.length ? (
          <ul className="mt-3 space-y-2">{saved.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-xl bg-card/80 p-2">
              <Link to="/user/$id" params={{ id: u.id }} className="flex items-center gap-2 text-sm"><Avatar id={u.id} size={32} />{u.name}</Link>
              <button onClick={() => s.toggleSoulmate(u.id)} className="text-xs text-muted-foreground hover:underline">Remove</button>
            </li>))}</ul>
        ) : <p className="mt-3 text-sm text-muted-foreground">Save people from posts or cards — their closets rank higher in Discover.</p>}
        <p className="mt-4 text-xs text-muted-foreground">Your balance: <b className="text-foreground">{s.points} pts</b>{s.earned ? ` · ${s.earned} earned from your looks` : ""}</p>
      </div>
    </section>
  );
}

const tagPool = ["Romantic", "Minimal", "Silk", "Evening", "Tailored", "Quiet luxury", "Vintage", "Boho"];
const occasions = ["Wedding Guest", "Graduation Photos", "Brunch", "Work"];

function Composer({ onDone }: { onDone: () => void }) {
  const s = useStore();
  const completed = s.rentals.filter((r) => r.status === "Completed" && r.renterId === ME);
  const [tags, setTags] = useState<PieceTag[]>([]);
  const [photo, setPhoto] = useState("");
  const [caption, setCaption] = useState("");
  const [occasion, setOccasion] = useState(occasions[0]!);
  const [rv, setRv] = useState({ condition: 5, accuracy: 5, experience: 5 });
  const [style, setStyle] = useState<string[]>([]);
  const [mode, setMode] = useState<"solo" | "together">("solo");
  const [coAuthor, setCoAuthor] = useState("");
  const [outingId, setOutingId] = useState("");
  const co = coAuthor ? getUser(coAuthor) : null;
  const acceptedOutings = s.outings.filter((o) => o.status === "accepted" && (o.fromId === ME || o.toId === ME));
  const find = (id: string) => s.allItems.find((i) => i.id === id);
  const has = (id: string) => tags.some((t) => t.itemId === id);
  const toggle = (t: PieceTag) => setTags(has(t.itemId) ? tags.filter((x) => x.itemId !== t.itemId) : [...tags, t]);
  const firstRented = tags.find((t) => t.source === "rented");
  const primary = tags[0] && find(tags[0].itemId);
  const shownTags = style.length ? style : primary?.styleTags ?? [];

  const onFile = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => setPhoto(String(r.result)); r.readAsDataURL(f); };
  const publish = () => {
    if (!tags.length || !photo) return;
    if (mode === "together") {
      if (!coAuthor) return;
      s.addPost({ id: "mp" + Date.now(), userId: ME, kind: "together", coAuthorId: coAuthor, coAuthorAccepted: false, ...(outingId ? { outingId } : {}),
        image: photo, itemId: tags[0]!.itemId, tags, caption, styleTags: shownTags, occasion, likes: 0, saves: 0 });
      toast.success(`Outing post shared — ${getUser(coAuthor).name} can accept as co-author`);
      onDone();
      return;
    }
    s.addPost({ id: "mp" + Date.now(), userId: ME, kind: firstRented ? "rented" : "closet", ...(firstRented?.rentalId ? { rentalId: firstRented.rentalId, review: rv } : {}),
      image: photo, itemId: tags[0]!.itemId, tags, caption, styleTags: shownTags, occasion, likes: 0, saves: 0 });
    toast.success(firstRented ? "Posted! Your review shows on the rented piece's listing." : "Styling post shared");
    onDone();
  };
  const Pick = ({ t, label }: { t: PieceTag; label: string }) => {
    const item = find(t.itemId); if (!item) return null;
    return (
      <button type="button" onClick={() => toggle(t)} className={cn("flex w-full items-center gap-2 rounded-xl border p-2 text-left text-xs", has(t.itemId) ? "border-primary bg-secondary/50" : "border-border")}>
        <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="min-w-0 flex-1"><span className="block truncate font-medium">{item.title}</span><span className="text-muted-foreground">{label}</span></span>
        <span className="text-muted-foreground">{has(t.itemId) ? "Tagged ✓" : "Tag"}</span>
      </button>);
  };
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <label className="relative block cursor-pointer overflow-hidden rounded-2xl bg-muted">
          {photo ? <img src={photo} alt="Your outfit" className="aspect-[3/4] w-full object-cover" /> : <span className="grid aspect-[3/4] place-items-center p-4 text-center text-xs text-muted-foreground">Upload {mode === "together" ? "a photo from the outing" : "your outfit photo"}</span>}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <div className="space-y-4">
          <div className="flex rounded-full bg-muted p-1">
            {([["solo", "Solo look"], ["together", "Styled Together"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)} className={cn("rounded-full px-4 py-1.5 text-sm", mode === k ? "bg-card shadow-soft" : "text-muted-foreground")}>{l}</button>
            ))}
          </div>
          {mode === "together" && (
            <div className="space-y-2">
              <p className="font-display text-2xl">Who was in the photo?</p>
              <select className={input} value={coAuthor} onChange={(e) => setCoAuthor(e.target.value)}>
                <option value="">Choose a co-author…</option>
                {users.filter((u) => u.id !== ME).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {acceptedOutings.length > 0 && (
                <select className={input} value={outingId} onChange={(e) => setOutingId(e.target.value)}>
                  <option value="">Link one of your plans (optional)</option>
                  {acceptedOutings.map((o) => <option key={o.id} value={o.id}>{o.activity} · {o.time}</option>)}
                </select>
              )}
              <p className="text-xs text-muted-foreground">Both names appear on the post once they accept the co-author invite.</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="font-display text-2xl">Tag items in this look</p>
            <p className="text-xs text-muted-foreground">Tag only pieces neighbors can rent. Anything else in the photo can stay untagged.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5"><p className="text-xs font-medium">My Rentals</p>
                {completed.length ? completed.map((r) => <Pick key={r.id} t={{ itemId: r.itemId, source: "rented", rentalId: r.id }} label={`${SOURCE_LABEL.rented} · from ${getUser(r.ownerId).name}`} />) : <p className="text-xs text-muted-foreground">Finished rentals appear here.</p>}</div>
              <div className="space-y-1.5"><p className="text-xs font-medium">My Closet</p>
                {s.myItems.length ? s.myItems.map((i) => <Pick key={i.id} t={{ itemId: i.id, source: "closet" }} label={SOURCE_LABEL.closet} />) : <p className="text-xs text-muted-foreground">List a piece in My Closet to tag it.</p>}</div>
            </div>
            {mode === "together" && co && tags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium">Who wore each piece?</p>
                {tags.map((t) => { const it = find(t.itemId); return it ? (
                  <div key={t.itemId} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{it.title}</span>
                    <span className="flex shrink-0 gap-1">
                      <Chip active={(t.wornBy ?? ME) === ME} onClick={() => setTags(tags.map((x) => (x.itemId === t.itemId ? { ...x, wornBy: ME } : x)))}>You</Chip>
                      <Chip active={t.wornBy === co.id} onClick={() => setTags(tags.map((x) => (x.itemId === t.itemId ? { ...x, wornBy: co.id } : x)))}>{co.name}</Chip>
                    </span>
                  </div>
                ) : null; })}
              </div>
            )}
          </div>
          <textarea className={input} rows={2} placeholder="Styling notes — what did you pair it with?" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <div className="flex flex-wrap gap-1">{tagPool.map((t) => <Chip key={t} active={shownTags.includes(t)} onClick={() => setStyle(shownTags.includes(t) ? shownTags.filter((x) => x !== t) : [...shownTags, t])}>{t}</Chip>)}</div>
          <label className="block text-xs text-muted-foreground">Occasion<select className={input} value={occasion} onChange={(e) => setOccasion(e.target.value)}>{occasions.map((o) => <option key={o}>{o}</option>)}</select></label>
          {firstRented && (
            <div className="space-y-1"><p className="text-xs text-muted-foreground">Your review of {find(firstRented.itemId)?.title} — shown on its listing</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                {([["condition", "Item condition"], ["accuracy", "As described"], ["experience", "Rental exchange"]] as const).map(([k, l]) => (
                  <label key={k}>{l}<select className={input} value={rv[k]} onChange={(e) => setRv({ ...rv, [k]: +e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label>
                ))}
              </div></div>
          )}
          <div className="flex gap-2"><button disabled={caption.trim().length < 5 || !tags.length || !photo || (mode === "together" && !coAuthor)} onClick={publish} className={btn}>Publish</button><button onClick={onDone} className={btnGhost}>Cancel</button></div>
          {(!photo || !tags.length || (mode === "together" && !coAuthor)) && <p className="text-xs text-muted-foreground">Add a photo, {mode === "together" ? "a co-author and " : ""}tag at least one piece to publish.</p>}
        </div>
      </div>
    </section>
  );
}
