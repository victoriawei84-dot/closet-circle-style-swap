import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { registerMember, type Item, type Rental } from "./data";

export const listingInput = z.object({
  title: z.string().trim().min(1).max(150), brand: z.string().max(100),
  category: z.enum(["Dress", "Top", "Bottom", "Suit", "Bag", "Shoes", "Jewelry", "Accessory"]),
  size: z.string().min(1).max(60), dailyRate: z.number().positive().max(10000),
  deposit: z.number().nonnegative().max(100000), cleaningFee: z.number().nonnegative().max(10000),
  retail: z.number().nonnegative().max(1000000), description: z.string().max(4000),
  condition: z.string().max(200), flaws: z.string().max(1000), minNotice: z.string().max(100),
  measurements: z.record(z.string().max(200)), occasions: z.array(z.string().max(80)).max(20), styleTags: z.array(z.string().max(80)).max(20),
});

export function isRealId(id: string) { return z.string().uuid().safeParse(id).success; }
export async function readSharedRecords(userId?: string) {
  const { data: rows, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const sharedItems = await Promise.all((rows ?? []).map(async (row) => {
    registerMember(row.owner_id, row.owner_name, row.neighborhood, row.zip);
    const { data } = await supabase.storage.from("listing-photos").createSignedUrl(row.photo_path, 3600);
    const details = row.details as unknown as Partial<Item>;
    return { ...details, id: row.id, ownerId: row.owner_id, title: row.title, dailyRate: Number(row.daily_rate), cleaningFee: Number(row.cleaning_fee), deposit: Number(row.deposit), image: data?.signedUrl ?? "", published: row.published, photoPath: row.photo_path, real: true, distance: 0, measurements: details.measurements ?? {}, blockedDates: details.blockedDates ?? [], occasions: details.occasions ?? [], styleTags: details.styleTags ?? [] } as Item;
  }));
  const sharedRentals: Rental[] = [];
  if (userId) {
    const { data, error } = await supabase.from("rental_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    for (const row of data ?? []) {
      registerMember(row.owner_id, row.owner_name); registerMember(row.renter_id, row.renter_name);
      sharedRentals.push({ id: row.id, itemId: row.listing_id, ownerId: row.owner_id, renterId: row.renter_id, start: row.start_date, end: row.end_date, status: row.status as Rental["status"], pickup: row.pickup, messages: [], real: true, agreedPrice: { dailyRate: Number(row.daily_rate), cleaning: Number(row.cleaning_fee), deposit: Number(row.deposit), total: Number(row.total) }, createdAt: row.created_at, updatedAt: row.updated_at });
    }
  }
  return { items: sharedItems, rentals: sharedRentals };
}

export async function saveSharedListing(item: Item, user: { id: string; name: string; neighborhood: string; zip: string }) {
  const validated = listingInput.parse(item);
  let photoPath = item.photoPath;
  if (!photoPath || item.image.startsWith("data:")) {
    const response = await fetch(item.image);
    const blob = await response.blob();
    if (!['image/jpeg','image/png','image/webp'].includes(blob.type) || blob.size > 8 * 1024 * 1024) throw new Error("Use a JPG, PNG or WebP photo under 8 MB");
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    photoPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("listing-photos").upload(photoPath, blob, { contentType: blob.type });
    if (error) throw error;
  }
  const details = { ...validated, ...(item.garment ? { garment: item.garment } : {}), blocks: item.blocks ?? [], blockedDates: item.blockedDates ?? [], ...(item.care ? { care: item.care } : {}), ...(item.sanitizedAt ? { sanitizedAt: item.sanitizedAt } : {}) } as unknown as Json;
  const record = { owner_id: user.id, owner_name: user.name, neighborhood: user.neighborhood, zip: user.zip, title: validated.title, daily_rate: validated.dailyRate, cleaning_fee: validated.cleaningFee, deposit: validated.deposit, photo_path: photoPath, details, published: item.published ?? true };
  const result = isRealId(item.id) ? await supabase.from("listings").update(record).eq("id", item.id).eq("owner_id", user.id).select("id").single() : await supabase.from("listings").insert(record).select("id").single();
  if (result.error) throw result.error;
}

export async function createSharedRequest(input: { itemId: string; start: string; end: string; pickup: string }, user: { id: string; name: string }) {
  z.object({ itemId: z.string().uuid(), start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), pickup: z.string().max(300) }).parse(input);
  const { data, error } = await supabase.from("rental_requests").insert({ listing_id: input.itemId, renter_id: user.id, renter_name: user.name, owner_id: user.id, owner_name: "", start_date: input.start, end_date: input.end, pickup: input.pickup }).select("id").single();
  if (error) throw error;
  return data.id;
}
export async function changeSharedStatus(id: string, status: Rental["status"]) {
  const { error } = await supabase.from("rental_requests").update({ status }).eq("id", id).select("id").single();
  if (error) throw error;
}