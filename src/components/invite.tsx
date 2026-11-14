import { useState } from "react";
import { CalendarPlus, Check, Clock, MapPin, Send, X } from "lucide-react";
import { toast } from "sonner";
import { ME, getUser, pickupSpots } from "@/lib/data";
import { ACTIVITIES, type Outing } from "@/lib/outings";
import { useStore } from "@/lib/store";
import { Avatar, Chip, btn, btnGhost, input } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

/** Ask a neighbor with similar style to meet up — an outfit photo walk, coffee, a vintage market. */
function PlanDialog({ toId, onClose }: { toId: string; onClose: () => void }) {
  const s = useStore();
  const other = getUser(toId);
  const [activity, setActivity] = useState(ACTIVITIES[0]!);
  const [custom, setCustom] = useState("");
  const [time, setTime] = useState("");
  const [area, setArea] = useState(other.neighborhood);
  const [note, setNote] = useState("");
  const label = activity === "Custom" ? custom.trim() : activity;
  const ready = !!label && !!time.trim();

  const send = () => {
    if (!ready) return;
    s.sendInvite({ toId, activity: label, time: time.trim(), area, ...(note.trim() ? { note: note.trim() } : {}) });
    toast.success(`Invite sent to ${other.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" onClick={onClose}>
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl">Make a plan with {other.name}</h2>
            <p className="text-sm text-muted-foreground">An invite is casual and separate from any rental.</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-2">
          <p className="text-sm">What should we do?</p>
          <div className="flex flex-wrap gap-2">{ACTIVITIES.map((a) => <Chip key={a} active={activity === a} onClick={() => setActivity(a)}>{a}</Chip>)}</div>
          {activity === "Custom" && <input className={input} placeholder="Your own outing — e.g. gallery hopping" value={custom} onChange={(e) => setCustom(e.target.value)} />}
        </div>
        <label className="block space-y-1 text-sm">Proposed time
          <input className={input} placeholder="Saturday, Nov 21 · 11:00" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">General area
          <input className={input} placeholder="Bernal Heights" value={area} onChange={(e) => setArea(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">Note (optional)
          <textarea className={input} rows={2} placeholder="Bring the burgundy jacket — I'd love to borrow it for the walk." value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <button disabled={!ready} onClick={send} className={btn}><Send className="h-4 w-4" />Send invite</button>
          <button onClick={onClose} className={btnGhost}>Cancel</button>
        </div>
        {!ready && <p className="text-xs text-muted-foreground">Add an activity and a proposed time to send.</p>}
      </div>
    </div>
  );
}

export function MakePlanButton({ toId }: { toId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={btnGhost}><CalendarPlus className="h-4 w-4" />Make a plan</button>
      {open && <PlanDialog toId={toId} onClose={() => setOpen(false)} />}
    </>
  );
}

const statusLabel: Record<Outing["status"], string> = { pending: "Waiting for a reply", proposed: "Suggested another time", accepted: "Planned", declined: "Declined" };

function OutingCard({ o }: { o: Outing }) {
  const s = useStore();
  const other = getUser(o.fromId === ME ? o.toId : o.fromId);
  const incoming = o.toId === ME;
  const [alt, setAlt] = useState("");
  const [msg, setMsg] = useState("");
  const [spot, setSpot] = useState(pickupSpots[0]!);
  const time = o.status === "proposed" && o.proposedTime ? o.proposedTime : o.time;

  return (
    <article className="space-y-3 rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar id={other.id} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{incoming ? `${other.name} invited you` : `You invited ${other.name}`}</p>
            <p className="truncate text-xs text-muted-foreground">{o.activity} · {time} · {o.area}</p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px]", o.status === "accepted" ? "bg-accent text-accent-foreground" : o.status === "declined" ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground")}>{statusLabel[o.status]}</span>
      </div>
      {o.note && <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">“{o.note}”</p>}

      {incoming && o.status === "pending" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { s.respondInvite(o.id, "accepted"); toast.success("Plan accepted — now pick a public meetup spot"); }} className={btn}><Check className="h-4 w-4" />Accept</button>
            <button onClick={() => s.respondInvite(o.id, "declined")} className={btnGhost}><X className="h-4 w-4" />Decline</button>
          </div>
          <div className="flex gap-2">
            <input className={input} placeholder="Suggest another time — e.g. Sunday, Nov 22 · 15:00" value={alt} onChange={(e) => setAlt(e.target.value)} />
            <button disabled={!alt.trim()} onClick={() => { s.respondInvite(o.id, "proposed", alt.trim()); toast.success("Sent with your time"); }} className={btnGhost}><Clock className="h-4 w-4" />Suggest</button>
          </div>
        </div>
      )}

      {incoming && o.status === "proposed" && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { s.respondInvite(o.id, "accepted"); toast.success("Plan accepted"); }} className={btn}><Check className="h-4 w-4" />Accept {o.proposedTime}</button>
          <button onClick={() => s.respondInvite(o.id, "declined")} className={btnGhost}><X className="h-4 w-4" />Decline</button>
        </div>
      )}

      {o.status === "accepted" && (
        <div className="space-y-2">
          {o.meetup ? (
            <p className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs text-secondary-foreground"><MapPin className="h-3.5 w-3.5" />Meet at <b>{o.meetup}</b></p>
          ) : (
            <div className="flex gap-2">
              <select className={input} value={spot} onChange={(e) => setSpot(e.target.value)}>{pickupSpots.map((p) => <option key={p}>{p}</option>)}</select>
              <button onClick={() => { s.setMeetup(o.id, spot); toast.success("Meetup spot shared"); }} className={btnGhost}><MapPin className="h-4 w-4" />Set spot</button>
            </div>
          )}
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl bg-muted/60 p-2">
            {o.messages.length ? o.messages.map((m, i) => (
              <p key={i} className="text-xs"><b>{m.from === ME ? "You" : getUser(m.from).name}</b> <span className="text-muted-foreground">{m.at}</span><br />{m.text}</p>
            )) : <p className="text-xs text-muted-foreground">Coordinate a public meetup spot here.</p>}
          </div>
          <div className="flex gap-2">
            <input className={input} placeholder="Message about the plan" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <button disabled={!msg.trim()} aria-label="Send message about the plan" onClick={() => { s.outingMessage(o.id, msg.trim()); setMsg(""); }} className={btnGhost}><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </article>
  );
}

/** Every plan the signed-in person sent or received. */
export function Plans() {
  const s = useStore();
  const mine = s.outings.filter((o) => o.fromId === ME || o.toId === ME);
  if (!mine.length) return null;
  const open = mine.filter((o) => o.status === "pending" || o.status === "proposed");
  const done = mine.filter((o) => o.status === "accepted" || o.status === "declined");
  return (
    <section className="rounded-3xl bg-hero p-5 md:p-6">
      <h2 className="text-3xl">Plans with your sisters</h2>
      <p className="text-sm text-muted-foreground">Casual invites for people with similar style — separate from any rental.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[...open, ...done].map((o) => <OutingCard key={o.id} o={o} />)}
      </div>
    </section>
  );
}
