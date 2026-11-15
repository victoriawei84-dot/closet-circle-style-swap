import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PostCard } from "@/routes/community";

export const Route = createFileRoute("/community-post/$id")({
  head: () => ({ meta: [
    { title: "Community look — SisUse" },
    { name: "description", content: "Explore an original SisUse community outfit and its tagged rental pieces." },
    { property: "og:title", content: "Community look — SisUse" },
    { property: "og:description", content: "Meet the woman behind the outfit and browse each tagged piece." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CommunityPost,
});

function CommunityPost() {
  const { id } = Route.useParams();
  const store = useStore();
  const post = store.allPosts.find((entry) => entry.id === id);
  return <div className="mx-auto max-w-xl space-y-5">
    <Link to="/community" className="text-sm underline">Community</Link>
    <h1 className="text-3xl">Community look</h1>
    {post ? <PostCard p={post} /> : <p className="text-muted-foreground">This look is no longer available.</p>}
  </div>;
}