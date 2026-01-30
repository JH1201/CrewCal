import { useEffect, useMemo, useState } from "react";
import {
  inviteUser,
  listMembers,
  listInvites,
  revokeInvite,
  changeMemberRole,
  removeMember,
  type MemberSummary,
  type InviteSummary,
} from "../lib/api";

const ROLES = ["EDITOR", "VIEWER", "FREEBUSY"] as const;

export function ShareModal({
  open,
  calendarId,
  calendarName,
  onClose,
}: {
  open: boolean;
  calendarId: number | null;
  calendarName: string | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"invite" | "members">("invite");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("VIEWER");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [invites, setInvites] = useState<InviteSummary[]>([]);
  const isOpen = open && calendarId != null;

  async function refresh() {
    if (!calendarId) return;
    const [m, i] = await Promise.all([listMembers(calendarId), listInvites(calendarId)]);
    setMembers(m);
    setInvites(i);
  }

  useEffect(() => {
    if (!isOpen) return;
    setTab("invite");
    setToken(null);
    setError(null);
    refresh().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, calendarId]);

  const owner = useMemo(() => members.find((m) => m.role === "OWNER"), [members]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl rounded-xl bg-white border border-zinc-200 shadow">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <div className="font-medium">
            Share: <span className="text-zinc-600">{calendarName ?? `#${calendarId}`}</span>
          </div>
          <button className="text-sm px-2 py-1 rounded-md hover:bg-zinc-100" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="px-4 pt-3 flex gap-2">
          <button
            className={[
              "text-sm px-3 py-1.5 rounded-md border",
              tab === "invite" ? "border-black bg-black text-white" : "border-zinc-200 hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setTab("invite")}
          >
            Invite
          </button>
          <button
            className={[
              "text-sm px-3 py-1.5 rounded-md border",
              tab === "members" ? "border-black bg-black text-white" : "border-zinc-200 hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setTab("members")}
          >
            Members
          </button>
        </div>

        <div className="p-4">
          {tab === "invite" ? (
            <div className="space-y-4">
              <div className="text-sm text-zinc-600">
                Owner: <span className="font-medium">{owner?.email ?? "-"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <div className="text-xs text-zinc-500 mb-1">Invitee Email</div>
                  <input
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Permission</div>
                  <select
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="FREEBUSY">FreeBusy</option>
                  </select>
                </div>
              </div>

              <button
                className="w-full rounded-md bg-black text-white py-2 text-sm hover:bg-zinc-800"
                onClick={async () => {
                  setError(null);
                  setToken(null);
                  try {
                    const res = await inviteUser(calendarId!, { email, role });
                    setToken(res.token);
                    await refresh();
                  } catch (e: any) {
                    setError(e.message ?? String(e));
                  }
                }}
              >
                Send Invite Email
              </button>

              {token && (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm">
                  <div className="text-xs text-zinc-500">Invite token</div>
                  <div className="font-mono break-all">{token}</div>
                  <div className="text-xs text-zinc-500 mt-2">메일에서도 동일 링크가 발송됩니다. (SMTP 설정 필요)</div>
                </div>
              )}

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="pt-2">
                <div className="text-xs text-zinc-500 mb-2">Pending Invites</div>
                <div className="space-y-2">
                  {invites.map((i) => (
                    <div key={i.id} className="rounded-lg border border-zinc-200 p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{i.inviteeEmail}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                          role: {i.role} · expires: {new Date(i.expiresAt).toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 font-mono break-all">token: {i.token}</div>
                      </div>
                      <button
                        className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 text-red-600"
                        onClick={async () => {
                          if (!confirm("Revoke this invite?")) return;
                          await revokeInvite(calendarId!, i.id);
                          await refresh();
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                  {invites.length === 0 && <div className="text-sm text-zinc-400">No pending invites</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-zinc-500">Members</div>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.userId} className="rounded-lg border border-zinc-200 p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.email}</div>
                      <div className="text-xs text-zinc-500 truncate">{m.displayName}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.role === "OWNER" ? (
                        <span className="text-xs px-2 py-1 rounded-md bg-zinc-100 border border-zinc-200">OWNER</span>
                      ) : (
                        <select
                          className="text-sm rounded-md border border-zinc-200 px-2 py-1"
                          value={m.role}
                          onChange={async (e) => {
                            await changeMemberRole(calendarId!, m.userId, e.target.value);
                            await refresh();
                          }}
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                          <option value="FREEBUSY">FreeBusy</option>
                        </select>
                      )}

                      {m.role !== "OWNER" && (
                        <button
                          className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 text-red-600"
                          onClick={async () => {
                            if (!confirm("Remove this member?")) return;
                            await removeMember(calendarId!, m.userId);
                            await refresh();
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {members.length === 0 && <div className="text-sm text-zinc-400">No members</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
