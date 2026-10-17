import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — Smith's Trucking Company" },
      { name: "description", content: "Sign in to manage Smith's Trucking inventory and customer requests." },
      { property: "og:title", content: "Staff Sign In — Smith's Trucking" },
      { property: "og:description", content: "Staff access to the Smith's Trucking dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg(error.message);
      nav({ to: "/admin" });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      setBusy(false);
      if (error) return setMsg(error.message);
      if (data.session) nav({ to: "/admin" });
      else setMsg("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-md border bg-card p-8 card-elev">
        <p className="eyebrow">Staff only</p>
        <h1 className="mt-1 text-4xl font-extrabold uppercase">{mode === "in" ? "Sign in" : "Create account"}</h1>
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input className="field" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className="field" type="password" required minLength={8} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          <button disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
        </form>
        {msg && <p className="mt-4 text-sm text-muted-foreground">{msg}</p>}
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-6 text-sm font-semibold text-primary">
          {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
