import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLoginUrl, login, signup } from "../lib/api";
import { setToken } from "../lib/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white shadow p-5">
        <div className="text-xl font-semibold">Calendar</div>
        <div className="text-sm text-zinc-500 mt-1">Sign in with Google or Email</div>

        <button
          className="mt-4 w-full rounded-md border border-zinc-200 py-2 text-sm hover:bg-zinc-50"
          onClick={() => (window.location.href = googleLoginUrl())}
        >
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-2 text-xs text-zinc-400">
          <div className="h-px flex-1 bg-zinc-200" />
          OR
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Email</div>
            <input className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <div className="text-xs text-zinc-500 mb-1">Password</div>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "signup" && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Display name</div>
              <input className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            className="w-full rounded-md bg-black text-white py-2 text-sm hover:bg-zinc-800"
            onClick={async () => {
              setError(null);
              try {
                const res =
                  mode === "login"
                    ? await login({ email, password })
                    : await signup({ email, password, displayName: displayName || email.split("@")[0] });
                setToken(res.token);
                nav("/", { replace: true });
              } catch (e: any) {
                setError(e.message ?? String(e));
              }
            }}
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>

          <button
            className="w-full text-sm text-zinc-600 hover:underline"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
