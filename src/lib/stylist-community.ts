import { taggedIds, type Post } from "./community";
import type { Item } from "./data";

export function similarCommunityLooks(posts: Post[], pieces: Item[], style: string, scene: string): Post[] {
  const tags = new Set([style.toLowerCase(), ...pieces.flatMap((item) => item.styleTags.map((tag) => tag.toLowerCase()))]);
  const words = scene.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  return posts.map((post) => ({ post, score:
    taggedIds(post).filter((id) => pieces.some((item) => item.id === id)).length * 5
    + post.styleTags.filter((tag) => tags.has(tag.toLowerCase())).length * 2
    + words.filter((word) => post.place?.toLowerCase().includes(word)).length,
  })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(({ post }) => post);
}