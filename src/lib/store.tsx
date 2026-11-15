import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedPosts, isVerified, postPoints, type Post } from "./community";
import type { FitProfile } from "./fit";
import type { Block } from "./availability";
import { seedOutings, type Outing } from "./outings";
import { DEFAULT_STYLING, type StylingPrefs } from "./styling";
import { readSharedRecords, saveSharedListing, createSharedRequest, changeSharedStatus, isRealId } from "./shared-records";
import { toast } from "sonner";
import { markSanitized, clearOnReturn } from "./sanitize";
import { supabase } from "@/integrations/supabase/client";
import { ME, users, seedRentals, type Rental, type RentalStatus, type Item, items as seedItems, demoMyItems } from "./data";

type State = { favorites: string[]; soulmates: string[]; rentals: Rental[]; points: number; myItems: Item[]; requests: string[]; likedPosts: string[]; savedPosts: string[]; myPosts: Post[]; skipped: string[]; account?: { name: string; email: string }; fitProfile?: FitProfile; lenderQuestions: { itemId: string; text: string }[]; savedOutfits: { id: string; name: string; place: string; itemIds: string[] }[]; outings: Outing[]; styling: StylingPrefs; ownedPieces: string[] };
export type Profile = { display_name: string; bio: string; neighborhood: string; zip: string; size: string; style_tags: string[] };
const initial: State = { lenderQuestions: [], savedOutfits: [], likedPosts: [], savedPosts: [], myPosts: [], skipped: [], favorites: [], soulmates: [], rentals: seedRentals, points: 120, myItems: demoMyItems, requests: [], outings: seedOutings, styling: DEFAULT_STYLING, ownedPieces: [] };

type Ctx = State & {
  toggleFav: (id: string) => void; toggleSoulmate: (id: string) => void;
  requestRental: (r: Omit<Rental, "id" | "status" | "messages" | "renterId">) => Promise<string>;
  setStatus: (id: string, s: RentalStatus) => void; sendMessage: (id: string, text: string) => void;
  review: (id: string) => void; addItem: (i: Item) => Promise<void>; setBlocks: (itemId: string, blocks: Block[]) => void; markSanitized: (itemId: string) => void; postRequest: (t: string) => void; allItems: Item[];
  allPosts: Post[]; earned: number; myCompleted: string[]; toggleLike: (id: string) => void; toggleSavePost: (id: string) => void; addPost: (p: Post) => void; skipPerson: (id: string) => void;
  authUser: { id: string; email: string } | null; authReady: boolean; profile: Profile | null; isDemo: boolean;
  updateProfile: (p: Profile) => Promise<string | null>; signOut: () => Promise<void>;
  setAccount: (a: { name: string; email: string }) => void; setFitProfile: (f: FitProfile) => void; askLender: (itemId: string, text: string) => void; saveOutfit: (o: { name: string; place: string; itemIds: string[] }) => void;
  setStyling: (p: StylingPrefs) => void; setOwnedPieces: (a: string[]) => void;
  sendInvite: (o: { toId: string; activity: string; time: string; area: string; note?: string }) => string;
  respondInvite: (id: string, status: "accepted" | "declined" | "proposed", proposedTime?: string) => void;
  setMeetup: (id: string, spot: string) => void; outingMessage: (id: string, text: string) => void;
};
// Keep one context instance across hot reloads so provider and consumers never mismatch.
const g = globalThis as unknown as { __closetCtx?: React.Context<Ctx | null> };
const C = (g.__closetCtx ??= createContext<Ctx | null>(null));
const KEY = "closet-circle-v1";

const demoMe = { ...users[0]! };
/** Signed-in users start clean: no demo rentals or points. */
const fresh: State = { ...initial, rentals: [], points: 0, myItems: [], outings: [] };
const applyProfile = (p: Profile | null, email?: string) => {
  const me = users[0]!;
  if (!p) { Object.assign(me, demoMe); return; }
  Object.assign(me, { ...demoMe, name: p.display_name || email?.split("@")[0] || "You", bio: p.bio, neighborhood: p.neighborhood || "—", zip: p.zip, size: p.size || demoMe.size, styleTags: p.style_tags.length ? p.style_tags : [], rating: 0, reviews: 0, points: 0 });
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>(initial);
  const [shared, setShared] = useState<{ items: Item[]; rentals: Rental[] }>({ items: [], rentals: [] });
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = authUser ? `${KEY}:${authUser.id}` : KEY;

  useEffect(() => {
    const onUser = (u: { id: string; email?: string | undefined } | null) => { setAuthUser(u ? { id: u.id, email: u.email ?? "" } : null); setAuthReady(true); };
    supabase.auth.getUser().then(({ data }) => onUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") onUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  // Load this account's (or the guest demo's) saved state.
  useEffect(() => {
    if (!authReady) return;
    const base = authUser ? fresh : initial;
    try {
      const v = localStorage.getItem(key);
      const saved: State = v ? { ...base, ...JSON.parse(v) } : base;
      // Guest demo: make sure newer demo listings and orders appear for returning visitors.
      if (!authUser) {
        const addMissing = <T extends { id: string }>(have: T[], seed: T[]) => [...have, ...seed.filter((x) => !have.some((h) => h.id === x.id))];
        saved.myItems = addMissing(saved.myItems, demoMyItems); saved.rentals = addMissing(saved.rentals, seedRentals);
      }
      set(saved);
    } catch { set(base); }
    setLoadedKey(key);
  }, [key, authReady]);
  useEffect(() => { if (loadedKey === key) localStorage.setItem(key, JSON.stringify(s)); }, [s, key, loadedKey]);
  // Profile + private fit profile from Lovable Cloud.
  useEffect(() => {
    if (!authUser) { setProfile(null); applyProfile(null); return; }
    let live = true;
    (async () => {
      const [{ data: p }, { data: f }] = await Promise.all([
        supabase.from("profiles").select("display_name,bio,neighborhood,zip,size,style_tags").eq("id", authUser.id).maybeSingle(),
        supabase.from("fit_profiles").select("unit,height,bust,waist,hips").eq("user_id", authUser.id).maybeSingle(),
      ]);
      if (!live) return;
      const prof = p ?? { display_name: authUser.email.split("@")[0]!, bio: "", neighborhood: "", zip: "", size: "", style_tags: [] };
      applyProfile(prof, authUser.email); setProfile(prof);
      if (f) {
        const fp: FitProfile = { unit: f.unit === "cm" ? "cm" : "in" };
        (["height", "bust", "waist", "hips"] as const).forEach((k) => { if (f[k] != null) fp[k] = Number(f[k]); });
        set((x) => ({ ...x, fitProfile: fp }));
      }
    })();
    return () => { live = false; };
  }, [authUser?.id]);

  const refreshShared = async () => { setShared(await readSharedRecords(authUser?.id)); };
  useEffect(() => {
    if (!authReady) return;
    let live = true;
    const load = () => { void readSharedRecords(authUser?.id).then((result) => { if (live) setShared(result); }).catch((e) => { if (live) toast.error(e.message ?? "Could not load shared listings"); }); };
    setShared({ items: [], rentals: [] }); load();
    const interval = setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => { live = false; clearInterval(interval); window.removeEventListener("focus", load); };
  }, [authUser?.id, authReady]);
  const lenderIdentity = () => ({ id: authUser?.id ?? "", name: profile?.display_name || "Member", neighborhood: profile?.neighborhood ?? "", zip: profile?.zip ?? "" });
  const persistItem = (item: Item) => { void saveSharedListing(item, lenderIdentity()).then(refreshShared).catch((e) => toast.error(e.message)); };

  const tog = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const upd = (id: string, f: (r: Rental) => Rental) => set((p) => ({ ...p, rentals: p.rentals.map((r) => (r.id === id ? f(r) : r)) }));
  const myCompleted = s.rentals.filter((r) => r.status === "Completed" && r.renterId === ME).map((r) => r.id);
  const allPosts = [...s.myPosts, ...seedPosts];
  const earned = s.myPosts.reduce((a, p) => a + postPoints(p, isVerified(p, myCompleted), false, false), 0);
  const ctx: Ctx = {
    ...s, myItems: authUser ? shared.items.filter((item) => item.ownerId === authUser.id) : s.myItems, rentals: authUser ? shared.rentals : s.rentals, points: s.points + earned, earned, myCompleted, allPosts,
    toggleLike: (id) => set((p) => ({ ...p, likedPosts: tog(p.likedPosts, id) })),
    toggleSavePost: (id) => set((p) => ({ ...p, savedPosts: tog(p.savedPosts, id) })),
    addPost: (post) => set((p) => ({ ...p, myPosts: [post, ...p.myPosts] })),
    setAccount: (account) => set((p) => ({ ...p, account })),
    authUser, authReady, profile, isDemo: !authUser,
    updateProfile: async (p) => {
      if (!authUser) return "Sign in to edit your profile";
      const { error } = await supabase.from("profiles").upsert({ id: authUser.id, ...p });
      if (error) return error.message;
      applyProfile(p, authUser.email); setProfile(p); return null;
    },
    signOut: async () => { await supabase.auth.signOut(); },
    setFitProfile: (fitProfile) => {
      set((p) => ({ ...p, fitProfile }));
      if (authUser) void supabase.from("fit_profiles").upsert({ user_id: authUser.id, unit: fitProfile.unit, height: fitProfile.height ?? null, bust: fitProfile.bust ?? null, waist: fitProfile.waist ?? null, hips: fitProfile.hips ?? null }).then(({ error }) => { if (error) console.error("fit profile save failed", error.message); });
    },
    askLender: (itemId, text) => set((p) => ({ ...p, lenderQuestions: [{ itemId, text }, ...p.lenderQuestions] })),
    saveOutfit: (o) => set((p) => ({ ...p, savedOutfits: [{ id: "o" + Date.now(), ...o }, ...p.savedOutfits] })),
    setStyling: (styling) => set((p) => ({ ...p, styling })),
    setOwnedPieces: (ownedPieces) => set((p) => ({ ...p, ownedPieces })),
    sendInvite: (o) => {
      const id = "o" + Date.now();
      set((p) => ({ ...p, outings: [{ id, fromId: ME, toId: o.toId, activity: o.activity, time: o.time, area: o.area, ...(o.note ? { note: o.note } : {}), status: "pending" as const, messages: [] }, ...p.outings] }));
      return id;
    },
    respondInvite: (id, status, proposedTime) => set((p) => ({ ...p, outings: p.outings.map((x) => (x.id === id ? { ...x, status, ...(proposedTime ? { proposedTime } : {}) } : x)) })),
    setMeetup: (id, spot) => set((p) => ({ ...p, outings: p.outings.map((x) => (x.id === id ? { ...x, meetup: spot } : x)) })),
    outingMessage: (id, text) => set((p) => ({ ...p, outings: p.outings.map((x) => (x.id === id ? { ...x, messages: [...x.messages, { from: ME, text, at: "now" }] } : x)) })),
    skipPerson: (id) => set((p) => ({ ...p, skipped: [...p.skipped, id] })),
    allItems: [...shared.items, ...(!authUser ? s.myItems : []), ...seedItems],
    toggleFav: (id) => set((p) => ({ ...p, favorites: tog(p.favorites, id) })),
    toggleSoulmate: (id) => set((p) => ({ ...p, soulmates: tog(p.soulmates, id) })),
    requestRental: async (r) => {
      if (authUser) {
        if (!isRealId(r.itemId)) throw new Error("Demo listings cannot receive real rental requests");
        const id = await createSharedRequest(r, lenderIdentity()); await refreshShared(); return id;
      }
      const id = "r" + Date.now();
      set((p) => ({ ...p, points: p.points - (r.pointsUsed ?? 0), rentals: [{ ...r, id, renterId: ME, status: "Requested", messages: [] }, ...p.rentals] }));
      return id;
    },
    setStatus: (id, status) => {
      if (isRealId(id)) { void changeSharedStatus(id, status).then(refreshShared).catch((e) => toast.error(e.message)); return; }
      set((p) => {
      const r = p.rentals.find((x) => x.id === id);
      return { ...p, rentals: p.rentals.map((x) => (x.id === id ? { ...x, status } : x)), myItems: r && status === "Returned" ? clearOnReturn(p.myItems, r.itemId) : p.myItems };
    }); },
    markSanitized: (itemId) => { const item = shared.items.find((x) => x.id === itemId); if (item) { persistItem({ ...item, sanitizedAt: new Date().toISOString().slice(0, 10) }); return; } set((p) => ({ ...p, myItems: markSanitized(p.myItems, itemId, new Date().toISOString().slice(0, 10)) })); },
    sendMessage: (id, text) => upd(id, (r) => ({ ...r, messages: [...r.messages, { from: ME, text, at: "now" }] })),
    review: (id) => { upd(id, (r) => ({ ...r, reviewed: true })); set((p) => ({ ...p, points: p.points + 50 })); },
    setBlocks: (itemId, blocks) => { const item = shared.items.find((x) => x.id === itemId); if (item) { persistItem({ ...item, blocks }); return; } set((p) => ({ ...p, myItems: p.myItems.map((i) => (i.id === itemId ? { ...i, blocks } : i)) })); },
    addItem: async (i) => { if (authUser) { await saveSharedListing(i, lenderIdentity()); await refreshShared(); } else set((p) => ({ ...p, myItems: [i, ...p.myItems] })); },
    postRequest: (t) => set((p) => ({ ...p, requests: [t, ...p.requests] })),
  };
  return <C.Provider value={ctx}>{children}</C.Provider>;
}
export const useStore = () => useContext(C)!;
