import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../lib/auth";

export default function OAuthCallback() {
  const nav = useNavigate();
  const [sp] = useSearchParams();

  useEffect(() => {
    const token = sp.get("token");
    if (token) setToken(token);
    nav("/", { replace: true });
  }, [nav, sp]);

  return <div className="p-6 text-sm text-zinc-600">Signing in...</div>;
}
