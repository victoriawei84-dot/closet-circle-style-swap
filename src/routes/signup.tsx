import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { FitProfileForm } from "@/components/fit-profile-form";
import { btn, input } from "@/components/ui-kit";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [
    { title: "Join SisUse" },
    { name: "description", content: "Create your SisUse account and set up a private Fit Profile." },
    { property: "og:title", content: "Join SisUse" },
    { property: "og:description", content: "Rent from neighbors with fit you can trust." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Signup,
});

const schema = z.object({
  name: z.string().trim().min(1, "Add your name").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function Signup() {
  const s = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const signedIn = !!s.authUser;

  const submit = async () => {
    const r = schema.safeParse(f);
    if (!r.success) { setErr(r.error.issues[0]!.message); return; }
    setBusy(true); setErr("");
    const { data, error } = await supabase.auth.signUp({ email: r.data.email, password: r.data.password, options: { emailRedirectTo: `${window.location.origin}/signup`, data: { display_name: r.data.name } } });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    if (!data.session) setSent(true);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 py-6">
      <div className="text-center">
        <p className="tracking-luxe text-xs text-muted-foreground">Step {signedIn ? 2 : 1} of 2</p>
        <h1 className="mt-2 text-5xl">{signedIn ? <>Your <em>Fit Profile</em></> : "Join SisUse"}</h1>
        <p className="mt-2 text-muted-foreground">{signedIn ? "Four measurements help us estimate how each garment will fit you." : "Create your account to rent from neighbors."}</p>
      </div>
      {signedIn ? (
        <div className="rounded-3xl border border-border bg-card p-6">
          <FitProfileForm value={s.fitProfile} saveLabel="Save and finish"
            onSave={(fp) => { s.setFitProfile(fp); toast.success("Fit Profile saved"); nav({ to: "/discover" }); }}
            onSkip={() => { toast("You're all set. Add measurements anytime in Profile."); nav({ to: "/discover" }); }} />
        </div>
      ) : sent ? (
        <div className="space-y-2 rounded-3xl border border-border bg-card p-6 text-center">
          <p className="font-display text-3xl">Check your email</p>
          <p className="text-sm text-muted-foreground">We sent a confirmation link to {f.email}. Open it to finish signing up — then you'll set up your Fit Profile.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
          <input className={input} placeholder="First name" autoComplete="given-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={input} type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className={input} type="password" placeholder="Password (8+ characters)" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button onClick={submit} disabled={busy} className={btn + " w-full"}>{busy ? "Creating account…" : "Create account"}</button>
          <p className="text-center text-sm text-muted-foreground">Already a member? <Link to="/auth" className="underline">Sign in</Link></p>
        </div>
      )}
    </div>
  );
}
