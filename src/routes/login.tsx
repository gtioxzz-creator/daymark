import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DaymarkLockup } from "@/components/mark";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const action =
        mode === "up"
          ? authClient.signUp.email({ email, password, name: email.split("@")[0] ?? "Javier" })
          : authClient.signIn.email({ email, password });
      const { error: fail } = await action;
      if (fail) {
        setError(fail.message ?? "That didn’t work.");
        return;
      }
      navigate({ to: "/" });
    } catch {
      setError("That didn’t work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-5 text-ink">
      <div className="w-full max-w-sm">
        <DaymarkLockup />
        <h1 className="mt-8 font-display text-title">Your account</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Sign in to keep the day when you switch phones. The room still works without it.
        </p>
        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
              >
                Continue with {provider.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-mist">Sign-in is disabled.</p>
          )}
        </div>
        <div className="my-6 flex items-center gap-3">
          <i className="h-px flex-1 bg-rule" />
          <span className="kicker">or email</span>
          <i className="h-px flex-1 bg-rule" />
        </div>
        <form className="space-y-2" onSubmit={onEmail}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "up" ? "Create account" : "Sign in"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-mist hover:text-ink"
          onClick={() => setMode(mode === "up" ? "in" : "up")}
        >
          {mode === "up" ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
        <Link to="/" className="mt-8 block text-sm text-mist hover:text-ink">
          Back to the day
        </Link>
      </div>
    </main>
  );
}
