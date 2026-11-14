import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useStore, type Profile as P } from "@/lib/store";
import { FitProfileForm } from "@/components/fit-profile-form";
import { Chip, btn, btnGhost, input } from "@/components/ui-kit";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profile — SisUse" },
    { name: "description", content: "Edit your SisUse profile and private Fit Profile." },
    { property: "og:title", content: "Profile — SisUse" },
    { property: "og:description", content: "Manage your account and private measurements." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Profile,
});

const TAGS = ["Minimal", "Romantic", "Silk", "Evening", "Tailored", "Quiet luxury", "Vintage", "Boho"];
const schema = z.object({
  display_name: z.string().trim().min(1, "Add a name").max(60), bio: z.string().trim().max(280),
  neighborhood: z.string().trim().max(60), zip: z.string().trim().regex(/^(\d{5})?$/, "ZIP should be 5 digits"),
  size: z.string().trim().max(10), style_tags: z.array(z.string()).max(8),
});

function Profile() {
  const s = useStore();
  const nav = useNavigate();
  const [f, setF] = useState<P | null>(s.profile);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setF(s.profile); }, [s.profile]);

  if (!s.authReady) return <p className="text-muted-foreground">Loading…</p>;
  if (!s.authUser) return (
    <div className="mx-auto max-w-md space-y-4 py-10 text-center">
      <h1 className="text-5xl">Your <em>profile</em></h1>
      <p className="text-muted-foreground">You're browsing the demo. Sign in to edit your own profile and save a private Fit Profile.</p>
      <div className="flex justify-center gap-2"><Link to="/auth" className={btn}>Sign in</Link><Link to="/signup" className={btnGhost}>Create account</Link></div>
    </div>
  );
  const save = async () => {
    const r = schema.safeParse(f); if (!r.success) { toast.error(r.error.issues[0]!.message); return; }
    setBusy(true); const e = await s.updateProfile(r.data); setBusy(false);
    if (e) toast.error(e); else toast.success("Profile saved");
  };
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="text-5xl">Profile</h1><p className="text-muted-foreground">{s.authUser.email}</p></div>
        <button onClick={async () => { await s.signOut(); toast("Signed out"); nav({ to: "/", replace: true }); }} className={btnGhost}>Sign out</button>
      </div>
      {f && (
        <section className="space-y-3 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-3xl">Public profile</h2>
          <p className="text-xs text-muted-foreground">Neighbors can see this. Your email and measurements stay private.</p>
          <input className={input} placeholder="Display name" value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} />
          <textarea className={input} rows={2} placeholder="A line about your style" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input className={input} placeholder="Neighborhood" value={f.neighborhood} onChange={(e) => setF({ ...f, neighborhood: e.target.value })} />
            <input className={input} placeholder="ZIP" inputMode="numeric" value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value.slice(0, 5) })} />
            <input className={input} placeholder="Usual size" value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-1.5">{TAGS.map((t) => <Chip key={t} active={f.style_tags.includes(t)} onClick={() => setF({ ...f, style_tags: f.style_tags.includes(t) ? f.style_tags.filter((x) => x !== t) : [...f.style_tags, t] })}>{t}</Chip>)}</div>
          <button onClick={save} disabled={busy} className={btn}>{busy ? "Saving…" : "Save profile"}</button>
        </section>
      )}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-1 text-3xl">Fit Profile</h2>
        <p className="mb-5 text-sm text-muted-foreground">{s.fitProfile ? "Update your measurements anytime." : "Add your measurements to unlock personalized Fit Check on item pages."}</p>
        <FitProfileForm key={JSON.stringify(s.fitProfile)} value={s.fitProfile} onSave={(fp) => { s.setFitProfile(fp); toast.success("Fit Profile saved"); }} />
      </section>
    </div>
  );
}
