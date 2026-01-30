import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CalendarEvent, CalendarItem, CalendarShare, ShareRole } from "../types";
import { uuid } from "../utils/id";
import NewCalendarModal from "../components/NewCalendarModal";
import ShareCalendarModal from "../components/ShareCalendarModal";
import EventEditorModal from "../components/EventEditorModal";

type CalendarCtx = {
  calendars: CalendarItem[];
  events: CalendarEvent[];
  shares: CalendarShare[];

  toggleCalendar: (id: string) => void;
  createCalendar: (name: string, color: string) => void;
  deleteCalendar: (id: string) => void;
  updateCalendarColor: (id: string, color: string) => void;

  openNewCalendar: () => void;
  openShare: (calendarId: string) => void;
  openCreateEventAt: (dt: Date) => void;
  openEditEvent: (e: CalendarEvent) => void;

  visibleCalendarIds: Set<string>;
};

const seedCalendars: CalendarItem[] = [
  { id: "c1", name: "My Calendar", color: "#3B82F6", checked: true },
  { id: "c2", name: "My Calendar", color: "#3B82F6", checked: true },
  { id: "c3", name: "My Calendar", color: "#3B82F6", checked: true },
  { id: "c4", name: "공유", color: "#22C55E", checked: true },
];

const seedEvents: CalendarEvent[] = [
  { id: "e1", calendarId: "c4", title: "안녕하세요", start: new Date("2026-01-08T09:00:00"), end: new Date("2026-01-08T10:00:00"), allDay: false },
  { id: "e2", calendarId: "c4", title: "aksud", start: new Date("2026-01-14T09:00:00"), end: new Date("2026-01-14T10:00:00"), allDay: false },
];

const CalendarContext = createContext<CalendarCtx | null>(null);

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used inside CalendarProvider");
  return ctx;
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [calendars, setCalendars] = useState<CalendarItem[]>(seedCalendars);
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents);

  const [shares, setShares] = useState<CalendarShare[]>([
    { id: "s_owner", calendarId: "c1", email: "jihoon001201@gmail.com", role: "Editor", isOwner: true },
  ]);

  // Modals (global)
  const [newCalOpen, setNewCalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCalendarId, setShareCalendarId] = useState<string | null>(null);

  const [eventOpen, setEventOpen] = useState(false);
  const [eventMode, setEventMode] = useState<"create" | "edit">("create");
  const [eventStart, setEventStart] = useState(new Date("2026-01-15T09:00:00"));
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const visibleCalendarIds = useMemo(() => new Set(calendars.filter((c) => c.checked).map((c) => c.id)), [calendars]);

  const activeShareCalendar = useMemo(() => calendars.find((c) => c.id === shareCalendarId) ?? null, [calendars, shareCalendarId]);
  const activeShares = useMemo(() => shares.filter((s) => s.calendarId === (shareCalendarId ?? "")), [shares, shareCalendarId]);

  const toggleCalendar = useCallback((id: string) => {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  }, []);

  const createCalendar = useCallback((name: string, color: string) => {
    setCalendars((prev) => [...prev, { id: uuid(), name: name || "My Calendar", color, checked: true }]);
  }, []);

  const deleteCalendar = useCallback((id: string) => {
    setCalendars((prev) => prev.filter((c) => c.id !== id));
    setEvents((prev) => prev.filter((e) => e.calendarId !== id));
    setShares((prev) => prev.filter((s) => s.calendarId !== id));
  }, []);

  const updateCalendarColor = useCallback((id: string, color: string) => {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
  }, []);

  const openNewCalendar = useCallback(() => setNewCalOpen(true), []);

  const openShare = useCallback((calendarId: string) => {
    setShareCalendarId(calendarId);
    setShares((prev) => {
      const hasOwner = prev.some((s) => s.calendarId === calendarId && s.isOwner);
      if (hasOwner) return prev;
      return [...prev, { id: uuid(), calendarId, email: "jihoon001201@gmail.com", role: "Editor", isOwner: true }];
    });
    setShareOpen(true);
  }, []);

  const openCreateEventAt = useCallback((dt: Date) => {
    setEventStart(dt);
    setEditingEvent(null);
    setEventMode("create");
    setEventOpen(true);
  }, []);

  const openEditEvent = useCallback((e: CalendarEvent) => {
    setEditingEvent(e);
    setEventStart(new Date(e.start));
    setEventMode("edit");
    setEventOpen(true);
  }, []);

  const saveEvent = useCallback((e: CalendarEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((x) => x.id === e.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = e;
        return next;
      }
      return [...prev, e];
    });
  }, []);

  const deleteEvent = useCallback((id: string) => setEvents((prev) => prev.filter((e) => e.id !== id)), []);

  const addShare = useCallback((email: string, role: ShareRole) => {
    if (!shareCalendarId) return;
    setShares((prev) => [...prev, { id: uuid(), calendarId: shareCalendarId, email, role }]);
  }, [shareCalendarId]);

  const value = useMemo<CalendarCtx>(
    () => ({
      calendars,
      events,
      shares,
      toggleCalendar,
      createCalendar,
      deleteCalendar,
      updateCalendarColor,
      openNewCalendar,
      openShare,
      openCreateEventAt,
      openEditEvent,
      visibleCalendarIds,
    }),
    [
      calendars,
      events,
      shares,
      toggleCalendar,
      createCalendar,
      deleteCalendar,
      updateCalendarColor,
      openNewCalendar,
      openShare,
      openCreateEventAt,
      openEditEvent,
      visibleCalendarIds,
    ]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}

      <NewCalendarModal
        visible={newCalOpen}
        onClose={() => setNewCalOpen(false)}
        onCreate={(name, color) => {
          createCalendar(name, color);
          setNewCalOpen(false);
        }}
      />

      <ShareCalendarModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        calendar={activeShareCalendar}
        shares={activeShares}
        onAddShare={addShare}
      />

      <EventEditorModal
        visible={eventOpen}
        mode={eventMode}
        onClose={() => setEventOpen(false)}
        calendars={calendars}
        initialStart={eventStart}
        event={editingEvent}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />
    </CalendarContext.Provider>
  );
}
