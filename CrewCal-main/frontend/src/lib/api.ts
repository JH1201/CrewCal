import { getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

function headers() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res: Response) {
  if (!res.ok) throw new Error(await res.text());
  return res;
}

export type Me = { userId: number; email: string; displayName: string };

export type CalendarSummary = {
  id: number;
  name: string;
  color: string;
  role: "OWNER" | "EDITOR" | "VIEWER" | "FREEBUSY";
};

export type MemberSummary = {
  userId: number;
  email: string;
  displayName: string;
  role: "OWNER" | "EDITOR" | "VIEWER" | "FREEBUSY";
};

export type InviteSummary = {
  id: number;
  calendarId: number;
  inviteeEmail: string;
  role: string;
  status: string;
  token: string;
  expiresAt: string;
};

export type InviteInfo = {
  calendarId: number;
  calendarName: string;
  inviterEmail: string;
  role: string;
  status: string;
  expiresAt: string;
  inviteeEmail: string;
};

export type EventItem = {
  id: number;
  calendarId: number;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  note: string | null;
  reminderMinutesBefore: number | null;
};

export async function signup(payload: { email: string; password: string; displayName: string }) {
  const res = await handle(await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
  return res.json() as Promise<{ token: string; email: string; userId: number }>;
}

export async function login(payload: { email: string; password: string }) {
  const res = await handle(await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
  return res.json() as Promise<{ token: string; email: string; userId: number }>;
}

export async function me(): Promise<Me> {
  const res = await handle(await fetch(`${API_BASE}/auth/me`, { headers: headers() }));
  return res.json();
}

export function googleLoginUrl() {
  return `${API_BASE}/oauth2/authorization/google`;
}

export async function listCalendars(): Promise<CalendarSummary[]> {
  const res = await handle(await fetch(`${API_BASE}/calendars`, { headers: headers() }));
  return res.json();
}

export async function createCalendar(payload: { name: string; color?: string }) {
  const res = await handle(await fetch(`${API_BASE}/calendars`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }));
  return res.json() as Promise<{ id: number }>;
}

export async function deleteCalendar(calendarId: number) {
  await handle(await fetch(`${API_BASE}/calendars/${calendarId}`, {
    method: "DELETE",
    headers: headers(),
  }));
}

export async function listMembers(calendarId: number): Promise<MemberSummary[]> {
  const res = await handle(await fetch(`${API_BASE}/calendars/${calendarId}/members`, { headers: headers() }));
  return res.json();
}

export async function changeMemberRole(calendarId: number, userId: number, role: string) {
  await handle(await fetch(`${API_BASE}/calendars/${calendarId}/members/${userId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ role }),
  }));
}

export async function removeMember(calendarId: number, userId: number) {
  await handle(await fetch(`${API_BASE}/calendars/${calendarId}/members/${userId}`, {
    method: "DELETE",
    headers: headers(),
  }));
}

export async function listInvites(calendarId: number): Promise<InviteSummary[]> {
  const res = await handle(await fetch(`${API_BASE}/calendars/${calendarId}/invites`, { headers: headers() }));
  return res.json();
}

export async function inviteUser(calendarId: number, payload: { email: string; role: string }) {
  const res = await handle(await fetch(`${API_BASE}/calendars/${calendarId}/invites`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }));
  return res.json() as Promise<{ token: string }>;
}

export async function revokeInvite(calendarId: number, inviteId: number) {
  await handle(await fetch(`${API_BASE}/calendars/${calendarId}/invites/${inviteId}`, {
    method: "DELETE",
    headers: headers(),
  }));
}

export async function getInviteInfo(token: string): Promise<InviteInfo> {
  const res = await handle(await fetch(`${API_BASE}/invites/${token}`));
  return res.json();
}

export async function acceptInvite(token: string) {
  await handle(await fetch(`${API_BASE}/invites/${token}/accept`, { method: "POST", headers: headers() }));
}

export async function declineInvite(token: string) {
  await handle(await fetch(`${API_BASE}/invites/${token}/decline`, { method: "POST", headers: headers() }));
}

export async function listEvents(params: { calendarIds: number[]; from: string; to: string }): Promise<EventItem[]> {
  const q = new URLSearchParams({
    calendarIds: params.calendarIds.join(","),
    from: params.from,
    to: params.to,
  });
  const res = await handle(await fetch(`${API_BASE}/events?${q.toString()}`, { headers: headers() }));
  return res.json();
}

export async function createEvent(payload: {
  calendarId: number;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  note?: string | null;
  reminderMinutesBefore?: number | null;
}) {
  const res = await handle(await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }));
  return res.json() as Promise<{ id: number }>;
}

export async function updateEvent(eventId: number, payload: any) {
  await handle(await fetch(`${API_BASE}/events/${eventId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(payload),
  }));
}

export async function deleteEvent(eventId: number) {
  await handle(await fetch(`${API_BASE}/events/${eventId}`, {
    method: "DELETE",
    headers: headers(),
  }));
}
