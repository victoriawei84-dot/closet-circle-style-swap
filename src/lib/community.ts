import { items, users, ME, getItem, type User } from "./data";
import lookSageEvening from "@/assets/look-sage-evening.jpg";
import lookFloral24 from "@/assets/look-floral-24th.jpg";
import lookBurgundy from "@/assets/look-burgundy-mirror.jpg";
import lookSage from "@/assets/look-sage-mission.jpg";
import lookSuit from "@/assets/look-suit-mirror.jpg";
import lookFloral from "@/assets/look-floral-dolores.jpg";
import lookBlush from "@/assets/look-blush-hallway.jpg";
import lookAva from "@/assets/look-ava-satin.jpg";
import lookAvaMaya from "@/assets/look-ava-maya-walk.jpg";
import lookWork from "@/assets/look-work-blazer.jpg";
import lookWeekend from "@/assets/look-weekend-cardigan.jpg";
import lookSatinSkirt from "@/assets/look-satin-skirt-evening.jpg";

export type PieceSource = "rented" | "closet";
export type PieceTag = { itemId: string; source: PieceSource; rentalId?: string; /** Which person in the photo wore this piece. */ wornBy?: string };
export type PostKind = "rented" | "closet" | "together";
export type Post = {
  id: string; userId: string; kind: PostKind; image: string; caption: string; itemId: string;
  /** Extra tagged pieces worn in the photo — only listings that are available to rent. */
  alsoTagged?: string[];
  /** Explicit tags chosen in the composer. Rented tags carry their completed rental. */
  tags?: PieceTag[];
  /** Where it was shot, e.g. "Valencia St murals · 94110". */
  place?: string;
  /** Seeded sample content. */
  demo?: boolean;
  /** "Styled Together" posts: the second person in the photo, invited to co-author. */
  coAuthorId?: string; coAuthorAccepted?: boolean; outingId?: string;
  styleTags: string[]; occasion: string; rentalId?: string;
  review?: { condition: number; accuracy: number; experience: number };
  likes: number; saves: number; // seeded engagement from other accounts
};

/** Completed rentals by other neighbors — used to verify "I rented this" posts. */
export const communityRentals = [
  { id: "cr1", itemId: "sage-slip", renterId: "ines", status: "Completed" },
  { id: "cr2", itemId: "cream-bag", renterId: "maya", status: "Completed" },
  { id: "cr3", itemId: "floral-sun", renterId: "maya", status: "Completed" },
  { id: "cr6", itemId: "champagne-satin", renterId: "ava", status: "Completed" },
  { id: "cr5", itemId: "burgundy-zip", renterId: "maya", status: "Completed" },
  { id: "cr7", itemId: "burgundy-jacket", renterId: "ava", status: "Completed" },
  { id: "cr8", itemId: "black-shoulder-bag", renterId: "maya", status: "Completed" },
  { id: "cr9", itemId: "camel-blazer", renterId: "maya", status: "Completed" },
  { id: "cr10", itemId: "wide-trousers", renterId: "maya", status: "Completed" },
  { id: "cr11", itemId: "brown-loafers", renterId: "maya", status: "Completed" },
  { id: "cr12", itemId: "suede-hobo", renterId: "ines", status: "Completed" },
  { id: "cr13", itemId: "ballet-flats", renterId: "ines", status: "Completed" },
  { id: "cr14", itemId: "burgundy-zip", renterId: "ava", status: "Completed" },
  { id: "cr15", itemId: "block-heels", renterId: "ava", status: "Completed" },
];

export const seedPosts: Post[] = [
  { id: "p14", demo: true, userId: "maya", kind: "rented", rentalId: "cr9", image: lookWork, itemId: "camel-blazer", tags: [{ itemId: "camel-blazer", source: "rented", rentalId: "cr9" }, { itemId: "poplin-shirt", source: "rented" }, { itemId: "wide-trousers", source: "rented", rentalId: "cr10" }, { itemId: "leather-belt", source: "rented" }, { itemId: "brown-loafers", source: "rented", rentalId: "cr11" }, { itemId: "satin-clutch", source: "closet" }], place: "Salesforce Tower lobby · 94105", caption: "Work-event look, no dress needed: Lena's camel blazer, white poplin, wide-leg trousers, belt and loafers, plus my satin clutch. Every piece is rentable.", styleTags: ["Tailored", "Minimal", "Quiet luxury"], occasion: "Work event", review: { condition: 5, accuracy: 5, experience: 5 }, likes: 29, saves: 15 },
  { id: "p15", demo: true, userId: "ines", kind: "rented", rentalId: "cr12", image: lookWeekend, itemId: "suede-hobo", tags: [{ itemId: "cream-cardigan", source: "closet" }, { itemId: "straight-jeans", source: "closet" }, { itemId: "suede-hobo", source: "rented", rentalId: "cr12" }, { itemId: "ballet-flats", source: "rented", rentalId: "cr13" }, { itemId: "silk-scarf", source: "rented" }], place: "Liberty Hill Victorians · 94110", caption: "Weekend photo walk: my cream cardigan and straight jeans with Ava's suede hobo and ballet flats, and Maya's paisley scarf. Comfy all afternoon.", styleTags: ["Vintage", "Boho", "Minimal"], occasion: "Photo walk", review: { condition: 5, accuracy: 5, experience: 5 }, likes: 24, saves: 13 },
  { id: "p16", demo: true, userId: "ava", kind: "rented", rentalId: "cr14", image: lookSatinSkirt, itemId: "burgundy-zip", tags: [{ itemId: "burgundy-zip", source: "rented", rentalId: "cr14" }, { itemId: "satin-skirt", source: "closet" }, { itemId: "block-heels", source: "rented", rentalId: "cr15" }, { itemId: "satin-clutch", source: "rented" }, { itemId: "gold-hoops", source: "rented" }], place: "Hayes Valley wine bar · 94102", caption: "Date night in separates: Lena's burgundy half-zip tucked into my satin midi skirt, Maya's wine block heels, clutch and gold hoops.", styleTags: ["Silk", "Minimal", "Quiet luxury"], occasion: "Date night", review: { condition: 5, accuracy: 4, experience: 5 }, likes: 31, saves: 17 },
  { id: "p13", demo: true, userId: "ava", kind: "together", coAuthorId: "maya", coAuthorAccepted: true, outingId: "o1", image: lookAvaMaya, itemId: "burgundy-jacket", tags: [{ itemId: "burgundy-jacket", source: "rented", rentalId: "cr7", wornBy: "ava" }, { itemId: "black-shoulder-bag", source: "rented", rentalId: "cr8", wornBy: "maya" }], place: "Ritual Coffee, Valencia St · 94110", caption: "Saturday photo walk with Maya. I wore her burgundy wool jacket; she carried my black shoulder bag. Both pieces are up for rent.", styleTags: ["Vintage", "Minimal", "Quiet luxury"], occasion: "Photo walk", likes: 34, saves: 18 },
  { id: "p12", demo: true, userId: "ava", kind: "rented", rentalId: "cr6", image: lookAva, itemId: "champagne-satin", tags: [{ itemId: "champagne-satin", source: "rented", rentalId: "cr6" }, { itemId: "black-shoulder-bag", source: "closet" }], place: "Hayes Street · 94102", caption: "Maya's champagne satin slip with my black shoulder bag (you can rent it too!) and loafers. The satin is even prettier in person.", styleTags: ["Silk", "Minimal", "Quiet luxury"], occasion: "Brunch", review: { condition: 5, accuracy: 5, experience: 5 }, likes: 27, saves: 12 },
  { id: "p11", demo: true, userId: "maya", kind: "rented", rentalId: "cr5", image: lookBurgundy, itemId: "burgundy-zip", alsoTagged: ["crescent-bag"], place: "Home in Bernal Heights · 94110", caption: "Lena's burgundy half-zip with my green cable knit over the shoulders, a khaki wrap skirt and her crescent bag. Size M, roomy in the best way.", styleTags: ["Minimal", "Quiet luxury"], occasion: "Brunch", review: { condition: 5, accuracy: 5, experience: 5 }, likes: 23, saves: 9 },
  { id: "p1", demo: true, userId: "ines", kind: "rented", rentalId: "cr1", image: lookSage, itemId: "sage-slip", place: "Balmy Alley murals · 94110", caption: "Maya's sage slip, dressed down with a chunky cardigan and sneakers for a Mission walk. Fit exactly like the measurements said.", styleTags: ["Silk", "Minimal", "Romantic"], occasion: "Brunch", review: { condition: 5, accuracy: 5, experience: 5 }, likes: 14, saves: 6 },
  { id: "p3", demo: true, userId: "maya", kind: "rented", rentalId: "cr2", image: lookSuit, itemId: "cream-bag", alsoTagged: ["black-suit"], place: "Bedroom mirror · 94110", caption: "Lena's cream bag made the whole suit look expensive. Spotless condition, quick handoff at Mint Plaza.", styleTags: ["Quiet luxury", "Tailored", "Minimal"], occasion: "Work", review: { condition: 5, accuracy: 5, experience: 5 }, likes: 19, saves: 8 },
  { id: "p5", demo: true, userId: "maya", kind: "rented", rentalId: "cr3", image: lookFloral, itemId: "floral-sun", place: "Dolores Park · 94114", caption: "Inès's floral sundress + my pink cardigan for a windy picnic. Pockets!", styleTags: ["Vintage", "Romantic", "Boho"], occasion: "Brunch", review: { condition: 5, accuracy: 4, experience: 5 }, likes: 11, saves: 3 },
  { id: "p2", demo: true, userId: "maya", kind: "closet", image: lookBlush, itemId: "blush-pleat", alsoTagged: ["nude-heels"], place: "Getting ready · 94110", caption: "How I style my blush chiffon for a wedding: nude sandals, low bun, nothing else.", styleTags: ["Romantic", "Evening"], occasion: "Wedding Guest", likes: 32, saves: 11 },
  { id: "p9", demo: true, userId: "maya", kind: "closet", image: lookSageEvening, itemId: "sage-slip", alsoTagged: ["nude-heels"], place: "Bernal Hill · 94110", caption: "Same sage slip, evening edition: my nude strappy sandals and a cream wrap for the sunset on Bernal Hill.", styleTags: ["Minimal", "Silk"], occasion: "Wedding Guest", likes: 16, saves: 7 },
  { id: "p10", demo: true, userId: "ines", kind: "closet", image: lookFloral24, itemId: "floral-sun", place: "24th St · 94114", caption: "My ditsy floral sundress on a coffee run down 24th. Swishy skirt, real pockets.", styleTags: ["Vintage", "Boho"], occasion: "Brunch", likes: 12, saves: 4 },
];

/** A tagged piece is a verified rental when its own order is complete. */
export function verifiedPiece(t: PieceTag, myCompleted: string[]) {
  const rid = t.rentalId;
  return t.source === "rented" && !!rid && (communityRentals.some((r) => r.id === rid && r.status === "Completed") || myCompleted.includes(rid));
}

export const isVerified = (p: Post, myCompleted: string[]) =>
  (p.kind === "rented" && !!p.rentalId && (communityRentals.some((r) => r.id === p.rentalId && r.status === "Completed") || myCompleted.includes(p.rentalId)))
  || (p.kind === "together" && (p.tags ?? []).some((t) => verifiedPiece(t, myCompleted)));

/** Points rule: verified rental posts only. Like = 1 pt, save = 3 pts, capped at 50 per post. Self-engagement never counts. */
export const LIKE_PTS = 1, SAVE_PTS = 3, POST_CAP = 50;
export function postPoints(p: Post, verified: boolean, likedByMe: boolean, savedByMe: boolean) {
  if (!verified) return 0;
  const self = p.userId === ME;
  const likes = p.likes + (likedByMe && !self ? 1 : 0);
  const saves = p.saves + (savedByMe && !self ? 1 : 0);
  return Math.min(POST_CAP, likes * LIKE_PTS + saves * SAVE_PTS);
}

export type Taste = { likedPosts: string[]; savedPosts: string[]; favorites: string[]; soulmates: string[] };
/** Weighted tag profile: own style tags, then tags of liked (1) and saved (2) posts and saved items (2). */
export function tasteTags(me: User, all: Post[], t: Taste) {
  const w: Record<string, number> = {};
  const add = (tags: string[], n: number) => tags.forEach((x) => (w[x] = (w[x] ?? 0) + n));
  add(me.styleTags, 2);
  all.forEach((p) => { if (t.likedPosts.includes(p.id)) add(p.styleTags, 1); if (t.savedPosts.includes(p.id)) add(p.styleTags, 2); });
  items.forEach((i) => t.favorites.includes(i.id) && add(i.styleTags, 2));
  return w;
}
export function scorePost(p: Post, me: User, w: Record<string, number>, t: Taste) {
  let s = p.styleTags.reduce((a, x) => a + (w[x] ?? 0), 0);
  if (t.soulmates.includes(p.userId)) s += 6;
  if (t.favorites.includes(p.itemId)) s += 4;
  if (users.find((u) => u.id === p.userId)?.neighborhood === me.neighborhood) s += 1;
  return s + p.saves * 0.05;
}
/** Plain-English reasons two neighbors match: shared style tags, tags the viewer saves, same size, same area. */
export function sharedStyleReasons(me: User, other: User, w: Record<string, number>) {
  const out: string[] = [];
  const both = me.styleTags.filter((t) => other.styleTags.includes(t));
  both.slice(0, 2).forEach((t) => out.push(`You both like ${t.toLowerCase()} looks`));
  other.styleTags.filter((t) => (w[t] ?? 0) > 0 && !both.includes(t)).slice(0, 1).forEach((t) => out.push(`You both save ${t.toLowerCase()} looks`));
  if (me.size === other.size) out.push(`You wear the same size (${me.size})`);
  if (me.neighborhood === other.neighborhood) out.push(`Both nearby in ${me.neighborhood}`);
  return out.slice(0, 3);
}

export function recommendPeople(me: User, w: Record<string, number>, exclude: string[]) {
  return users.filter((u) => u.id !== ME && !exclude.includes(u.id)).map((u) => {
    const shared = u.styleTags.filter((x) => w[x]).sort((a, b) => (w[b] ?? 0) - (w[a] ?? 0));
    const reason = shared.length ? `You both save ${shared[0]!.toLowerCase()} looks` : `Lends nearby in ${u.neighborhood}`;
    return { u, reason, reasons: sharedStyleReasons(me, u, w), score: shared.reduce((a, x) => a + (w[x] ?? 0), 0), closet: items.filter((i) => i.ownerId === u.id) };
  }).sort((a, b) => b.score - a.score);
}
export const taggedItem = (p: Post) => getItem(p.itemId);
/** Every tagged piece with its source. Seed posts without explicit tags: an item the author owns is "closet", otherwise "rented" (or the primary item of a closet post). */
export function pieceTags(p: Post, ownerOf: (id: string) => string | undefined = (id) => getItem(id)?.ownerId): PieceTag[] {
  if (p.tags?.length) return p.tags;
  return [p.itemId, ...(p.alsoTagged ?? [])].map((id) => {
    const own = ownerOf(id) === p.userId || (p.kind === "closet" && id === p.itemId);
    return own ? { itemId: id, source: "closet" as const } : { itemId: id, source: "rented" as const, ...(id === p.itemId && p.rentalId ? { rentalId: p.rentalId } : {}) };
  });
}
export const taggedIds = (p: Post) => pieceTags(p).map((t) => t.itemId);
export const SOURCE_LABEL: Record<PieceSource, string> = { rented: "Rented for this look", closet: "From my closet" };
