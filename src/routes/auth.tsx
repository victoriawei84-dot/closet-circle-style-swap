import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { btn, input } from "@/components/ui-kit";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — SisUse" },
    { name: "description", content: "Sign in to your SisUse account." },
    { property: "og:title", content: "Sign in — SisUse" },
    { property: "og:description", content: "Your neighborhood's shared wardrobe." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setBusy(false); setErr(error.message); return; }
    const { data: fp } = await supabase.from("fit_profiles").select("user_id").eq("user_id", data.user.id).maybeSingle();
    setBusy(false);
    nav({ to: fp ? "/discover" : "/signup" });
  };
  return (
    <div className="mx-auto max-w-md space-y-8 py-10">
      <h1 className="text-center text-5xl">Welcome <em>back</em></h1>
      <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
        <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button onClick={submit} disabled={busy || !email || !password} className={btn + " w-full"}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center text-sm text-muted-foreground">New here? <Link to="/signup" className="underline">Create an account</Link></p>
      </div>
    </div>
  );
}
