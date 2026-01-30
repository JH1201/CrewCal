import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { acceptInvite, declineInvite, getInviteInfo } from "../lib/api";
import { getToken } from "../lib/auth";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const nav = useNavigate();
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getInviteInfo(token).then(setInfo).catch((e) => setError(e.message ?? String(e)));
  }, [token]);

  const isAuthed = !!getToken();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow p-5">
        <div className="text-xl font-semibold">Calendar Invitation</div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        {info && (
          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="text-zinc-500">Calendar:</span> <span className="font-medium">{info.calendarName}</span>
            </div>
            <div>
              <span className="text-zinc-500">Inviter:</span> <span className="font-medium">{info.inviterEmail}</span>
            </div>
            <div>
              <span className="text-zinc-500">Role:</span> <span className="font-medium">{info.role}</span>
            </div>
            <div>
              <span className="text-zinc-500">Invitee:</span> <span className="font-medium">{info.inviteeEmail}</span>
            </div>
            <div className="text-xs text-zinc-500">
              Status: {info.status} · Expires: {new Date(info.expiresAt).toLocaleString()}
            </div>

            {!isAuthed && (
              <div className="mt-4 text-sm text-zinc-600">
                이 초대를 수락/거절하려면 먼저 로그인해야 합니다.
                <div className="mt-2">
                  <button
                    className="rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-zinc-800"
                    onClick={() => nav("/login")}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}

            {isAuthed && info.status === "PENDING" && (
              <div className="pt-4 flex gap-2">
                <button
                  className="flex-1 rounded-md bg-black text-white py-2 text-sm hover:bg-zinc-800"
                  onClick={async () => {
                    try {
                      await acceptInvite(token!);
                      nav("/", { replace: true });
                    } catch (e: any) {
                      setError(e.message ?? String(e));
                    }
                  }}
                >
                  Accept
                </button>
                <button
                  className="flex-1 rounded-md border border-zinc-200 py-2 text-sm hover:bg-zinc-50"
                  onClick={async () => {
                    try {
                      await declineInvite(token!);
                      nav("/", { replace: true });
                    } catch (e: any) {
                      setError(e.message ?? String(e));
                    }
                  }}
                >
                  Decline
                </button>
              </div>
            )}

            {isAuthed && info.status !== "PENDING" && (
              <div className="pt-4">
                <button className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50" onClick={() => nav("/")}>
                  Go Home
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
