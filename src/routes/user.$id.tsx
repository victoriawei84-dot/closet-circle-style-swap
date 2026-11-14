import { createFileRoute, notFound } from "@tanstack/react-router";
import { users, compatibility, getUser, ME } from "@/lib/data";
import { sharedStyleReasons, tasteTags } from "@/lib/community";
import { useStore } from "@/lib/store";
import { Avatar, ItemCard, btn, btnGhost } from "@/components/ui-kit";
import { MakePlanButton } from "@/components/invite";

export const Route = createFileRoute("/user/$id")({
  loader: ({ params }) => { const u = users.find((x) => x.id === params.id); if (!u) throw notFound(); return { name: u.name, bio: u.bio }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Closet"}'s closet — SisUse` },
    { name: "description", content: loaderData?.bio ?? "A neighborhood closet." },
    { property: "og:title", content: `${loaderData?.name ?? "Closet"}'s closet` },
    { property: "og:description", content: loaderData?.bio ?? "A neighborhood closet." },
  ] }),
  component: Profile,
});

function Profile() {
  const { id } = Route.useParams();
  const u = getUser(id);
  const s = useStore();
  const { allItems, soulmates, toggleSoulmate } = s;
  const mine = allItems.filter((i) => i.ownerId === id);
  const me = getUser(ME);
  const w = tasteTags(me, s.allPosts, { likedPosts: s.likedPosts, savedPosts: s.savedPosts, favorites: s.favorites, soulmates: s.soulmates });
  const reasons = id === ME ? [] : sharedStyleReasons(me, u, w);
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-hero p-8 text-center md:flex-row md:text-left">
        <Avatar id={id} size={112} />
        <div className="flex-1">
          <h1 className="text-4xl font-semibold">{u.name}</h1>
          <p className="text-muted-foreground">{u.bio}</p>
          <p className="mt-2 text-sm text-muted-foreground">{u.neighborhood} · ★ {u.rating} ({u.reviews} verified reviews) · {u.responseRate}% response · replies {u.responseTime}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1 md:justify-start">{u.styleTags.map((t) => <span key={t} className="rounded-full bg-card px-2 py-0.5 text-xs">{t}</span>)}</div>
          {reasons.length > 0 && <div className="mt-2 flex flex-wrap justify-center gap-1.5 md:justify-start">{reasons.map((r) => <span key={r} className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-secondary-foreground">{r}</span>)}</div>}
        </div>
        {id !== ME && <div className="text-center"><p className="font-display text-3xl">{compatibility(getUser(ME), u)}%</p><p className="mb-2 text-xs text-muted-foreground">style match</p>
          <button onClick={() => toggleSoulmate(id)} className={soulmates.includes(id) ? btnGhost : btn}>{soulmates.includes(id) ? "Soulmate ✓" : "Save as Soulmate"}</button>
          <div className="mt-2"><MakePlanButton toId={id} /></div></div>}
      </div>
      <h2 className="text-3xl">Closet · {mine.length} pieces</h2>
      <div className="columns-2 gap-4 md:columns-4">{mine.map((i) => <ItemCard key={i.id} item={i} />)}</div>
    </div>
  );
}
