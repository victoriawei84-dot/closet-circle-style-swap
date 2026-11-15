import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarOff, Lock, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { needsSanitizing, sanitizedLabel } from "@/lib/sanitize";
import { toast } from "sonner";
import type { Item } from "@/lib/data";
import { addDays, blockConflicts, fmt, today, type Block } from "@/lib/availability";
import { useStore } from "@/lib/store";
import { btn, btnGhost, input } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

/** One of my listings, with private personal-use date blocks. */
export function ClosetListing({ item }: { item: Item }) {
  const s = useStore();
  const blocks = item.blocks ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(addDays(today(), 6));
  const [conflict, setConflict] = useState<string | null>(null);
  const t = today();
  const active = blocks.filter((b) => b.end >= t);
  const blockedNow = active.some((b) => b.start <= t);

  const save = (st: string, en: string) => {
    if (en < st) { setConflict("End date must be on or after the start date."); return; }
    const c = blockConflicts(s.rentals, item.id, st, en);
    if (c.length) { setConflict(`Overlaps a confirmed rental (${c.map((r) => `${fmt(r.start)}–${fmt(r.end)}`).join(", ")}). Choose another range.`); return; }
    const b: Block = { id: editing ?? "b" + Date.now(), start: st, end: en };
    s.setBlocks(item.id, editing ? blocks.map((x) => (x.id === editing ? b : x)) : [...blocks, b]);
    setConflict(null); setOpen(false); setEditing(null);
    toast.success(`Blocked ${fmt(st)}–${fmt(en)} for personal use`);
  };

  const [confirmSan, setConfirmSan] = useState(false);
  const [editListing, setEditListing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const san = sanitizedLabel(item);
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-3">
      <Link to="/item/$id" params={{ id: item.id }}><img src={item.image} alt="" className="h-28 w-22 rounded-xl object-cover" style={{ width: 88 }} /></Link>
      <div className="flex-1 space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/item/$id" params={{ id: item.id }} className="font-medium">{item.title}</Link>
          <span className={"rounded-full px-2.5 py-0.5 text-xs " + (blockedNow ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground")}>{blockedNow ? "Published · blocked now" : "Available"}</span>
        </div>
        <p className="text-xs text-muted-foreground">${item.dailyRate}/day · {item.care ?? "No care instructions"}</p>
        {item.real && <Button variant="outline" size="sm" onClick={() => { setDraft(item); setEditListing(!editListing); }}><Pencil className="h-3.5 w-3.5" />Edit listing</Button>}
        {editListing && <form className="grid gap-2" onSubmit={async (event) => { event.preventDefault(); setSaving(true); try { await s.addItem(draft); setEditListing(false); toast.success("Listing updated"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update listing"); } finally { setSaving(false); } }}>
          <label>Title<input className={input} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>Description<textarea className={input} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          <div className="grid grid-cols-2 gap-2"><label>Size<input className={input} value={draft.size} onChange={(event) => setDraft({ ...draft, size: event.target.value })} /></label><label>Daily rate<input type="number" min="0.01" step="0.01" className={input} value={draft.dailyRate} onChange={(event) => setDraft({ ...draft, dailyRate: Number(event.target.value) })} /></label></div>
          <label>Condition<input className={input} value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value })} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.published ?? true} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />Published</label>
          <label>Replace photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setDraft((value) => ({ ...value, image: String(reader.result) })); reader.readAsDataURL(file); }} /></label>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save listing"}</Button>
        </form>}
        {needsSanitizing(item) && (
          <div className="space-y-2 text-xs">
            {san ? <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-accent-foreground"><ShieldCheck className="h-3 w-3" />{san}</span>
              : <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">Not marked sanitized — renters won't see the label</span>}
            {!confirmSan ? <div><button onClick={() => setConfirmSan(true)} className={btnGhost + " py-1.5"}><ShieldCheck className="h-4 w-4" />{san ? "Mark sanitized again" : "Mark as sanitized"}</button></div> : (
              <div className="space-y-2 rounded-xl bg-muted/60 p-3">
                <p>I confirm I sanitized this piece today and it's ready for the next renter.</p>
                <div className="flex gap-2"><button onClick={() => { s.markSanitized(item.id); setConfirmSan(false); toast.success("Marked as sanitized"); }} className={btn + " py-1.5"}>Confirm</button><button onClick={() => setConfirmSan(false)} className={btnGhost + " py-1.5"}>Cancel</button></div>
              </div>
            )}
          </div>
        )}
        {active.map((b) => (
          <div key={b.id} className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><Lock className="h-3 w-3" />Personal use · {fmt(b.start)}–{fmt(b.end)}</span>
            <button aria-label="Edit block" onClick={() => { setEditing(b.id); setStart(b.start); setEnd(b.end); setOpen(true); setConflict(null); }}><Pencil className="h-3.5 w-3.5" /></button>
            <button aria-label="Remove block" onClick={() => { s.setBlocks(item.id, blocks.filter((x) => x.id !== b.id)); toast("Block removed"); }}><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {active.length > 0 && <p className="text-[11px] text-muted-foreground">Only you see "Personal use". Renters just see the dates as unavailable.</p>}
        {!open ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setEditing(null); setOpen(true); setConflict(null); }} className={btnGhost + " py-1.5"}><CalendarOff className="h-4 w-4" />Block dates</button>
            <button onClick={() => save(t, addDays(t, 6))} className={btnGhost + " py-1.5"}>Block next 7 days</button>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl bg-muted/60 p-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">From<input type="date" className={input} value={start} onChange={(e) => setStart(e.target.value)} /></label>
              <label className="text-xs text-muted-foreground">To<input type="date" className={input} value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></label>
            </div>
            <div className="flex gap-2"><button onClick={() => save(start, end)} className={btn + " py-1.5"}>{editing ? "Update block" : "Save block"}</button><button onClick={() => { setOpen(false); setConflict(null); }} className={btnGhost + " py-1.5"}>Cancel</button></div>
          </div>
        )}
        {conflict && <p role="alert" className="text-xs text-destructive">{conflict}</p>}
      </div>
    </div>
  );
}
