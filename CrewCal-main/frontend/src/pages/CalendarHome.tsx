import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarSummary, EventItem } from "../lib/api";
import { createCalendar, listCalendars, listEvents, createEvent, updateEvent, deleteEvent, deleteCalendar } from "../lib/api";
import { Sidebar } from "../components/Sidebar";
import { Drawer } from "../components/Drawer";
import { SlidePanel } from "../components/SlidePanel";
import { ShareModal } from "../components/ShareModal";

type ViewMode = "dayGridMonth" | "timeGridWeek";

export default function CalendarHome() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [calendars, setCalendars] = useState<CalendarSummary[]>([]);
  const [selectedCalIds, setSelectedCalIds] = useState<number[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("dayGridMonth");

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"view" | "edit" | "create">("view");
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareCalendarId, setShareCalendarId] = useState<number | null>(null);

  const shareCalendarName = useMemo(() => {
    const c = calendars.find((x) => x.id === shareCalendarId);
    return c?.name ?? null;
  }, [calendars, shareCalendarId]);

  useEffect(() => {
    (async () => {
      const list = await listCalendars();
      setCalendars(list);
      setSelectedCalIds(list.map((x) => x.id));
    })().catch(console.error);
  }, []);

  async function refreshCalendars() {
    const list = await listCalendars();
    setCalendars(list);
    setSelectedCalIds((prev) => (prev.length ? prev.filter((id) => list.some((c) => c.id === id)) : list.map((x) => x.id)));
  }

  async function refetchEvents(range: { startStr: string; endStr: string }) {
    if (selectedCalIds.length === 0) {
      setEvents([]);
      return;
    }
    const res = await listEvents({
      calendarIds: selectedCalIds,
      from: new Date(range.startStr).toISOString(),
      to: new Date(range.endStr).toISOString(),
    });
    setEvents(res);
  }

  function toggleSelected(id: number) {
    setSelectedCalIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="h-screen flex">
      <aside className="hidden md:flex w-80 border-r border-zinc-200">
        <Sidebar
          calendars={calendars}
          selectedCalIds={selectedCalIds}
          onToggle={toggleSelected}
          onNewCalendar={async () => {
            const name = prompt("Calendar name?");
            if (!name) return;
            await createCalendar({ name });
            await refreshCalendars();
          }}
          onOpenShare={(calendarId) => {
            setShareCalendarId(calendarId);
            setShareOpen(true);
          }}
          onDeleteCalendar={async (calendarId) => {
            if (!confirm("Delete this calendar? (Owner only)")) return;
            await deleteCalendar(calendarId);
            await refreshCalendars();
          }}
        />
      </aside>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar
          calendars={calendars}
          selectedCalIds={selectedCalIds}
          onToggle={(id) => toggleSelected(id)}
          onNewCalendar={async () => {
            const name = prompt("Calendar name?");
            if (!name) return;
            await createCalendar({ name });
            await refreshCalendars();
          }}
          onOpenShare={(calendarId) => {
            setShareCalendarId(calendarId);
            setShareOpen(true);
            setDrawerOpen(false);
          }}
          onDeleteCalendar={async (calendarId) => {
            if (!confirm("Delete this calendar? (Owner only)")) return;
            await deleteCalendar(calendarId);
            await refreshCalendars();
          }}
        />
      </Drawer>

      <main className="flex-1 flex flex-col">
        <div className="h-14 px-3 sm:px-4 border-b border-zinc-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="md:hidden text-sm px-2 py-2 rounded-md hover:bg-zinc-100" onClick={() => setDrawerOpen(true)} aria-label="Open sidebar">
              ☰
            </button>

            <button
              className="text-sm px-3 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50"
              onClick={() => calendarRef.current?.getApi().prev()}
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              className="text-sm px-3 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50"
              onClick={() => calendarRef.current?.getApi().next()}
              aria-label="Next"
            >
              ›
            </button>
            <button
              className="text-sm px-3 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50"
              onClick={() => calendarRef.current?.getApi().today()}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-zinc-200 overflow-hidden">
              <button
                className={["text-sm px-3 py-1.5", viewMode === "dayGridMonth" ? "bg-zinc-100" : "hover:bg-zinc-50"].join(" ")}
                onClick={() => setViewMode("dayGridMonth")}
              >
                Month
              </button>
              <button
                className={["text-sm px-3 py-1.5", viewMode === "timeGridWeek" ? "bg-zinc-100" : "hover:bg-zinc-50"].join(" ")}
                onClick={() => setViewMode("timeGridWeek")}
              >
                Week
              </button>
            </div>

            <button
              className="text-sm px-3 py-1.5 rounded-md bg-black text-white hover:bg-zinc-800"
              onClick={() => {
                setPanelMode("create");
                setActiveEvent(null);
                setPanelOpen(true);
              }}
            >
              + New
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-2">
            <FullCalendar
              ref={(r) => (calendarRef.current = r)}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={viewMode}
              headerToolbar={false}
              height={"calc(100vh - 120px)"}
              events={events.map((e) => ({
                id: String(e.id),
                title: e.title,
                start: e.startAt,
                end: e.endAt,
                allDay: e.allDay,
              }))}
              datesSet={(arg) => {
                refetchEvents({ startStr: arg.startStr, endStr: arg.endStr }).catch(console.error);
              }}
              eventClick={(info) => {
                const id = Number(info.event.id);
                const found = events.find((x) => x.id === id) ?? null;
                setActiveEvent(found);
                setPanelMode("view");
                setPanelOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      <SlidePanel
        open={panelOpen}
        title={panelMode === "create" ? "Create Schedule" : panelMode === "edit" ? "Edit Schedule" : "Schedule Details"}
        onClose={() => setPanelOpen(false)}
      >
        <EventPanel
          calendars={calendars}
          selectedCalIds={selectedCalIds}
          mode={panelMode}
          event={activeEvent}
          onChangeMode={setPanelMode}
          onSaved={() => {
            const api = calendarRef.current?.getApi();
            if (api) {
              refetchEvents({ startStr: api.view.activeStart.toISOString(), endStr: api.view.activeEnd.toISOString() }).catch(console.error);
            }
            setPanelOpen(false);
          }}
        />
      </SlidePanel>

      <ShareModal
        open={shareOpen}
        calendarId={shareCalendarId}
        calendarName={shareCalendarName}
        onClose={() => {
          setShareOpen(false);
          setShareCalendarId(null);
        }}
      />
    </div>
  );
}

function EventPanel({
  calendars,
  selectedCalIds,
  mode,
  event,
  onChangeMode,
  onSaved,
}: {
  calendars: CalendarSummary[];
  selectedCalIds: number[];
  mode: "view" | "edit" | "create";
  event: EventItem | null;
  onChangeMode: (m: "view" | "edit" | "create") => void;
  onSaved: () => void;
}) {
  const defaultCalId = selectedCalIds[0] ?? calendars[0]?.id ?? 0;
  const [calendarId, setCalendarId] = useState<number>(event?.calendarId ?? defaultCalId);
  const [title, setTitle] = useState(event?.title ?? "");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startAt, setStartAt] = useState(event?.startAt ?? new Date().toISOString());
  const [endAt, setEndAt] = useState(event?.endAt ?? new Date(Date.now() + 60 * 60 * 1000).toISOString());
  const [note, setNote] = useState(event?.note ?? "");
  const [reminder, setReminder] = useState<number | "">(event?.reminderMinutesBefore ?? "");

  const readonly = mode === "view";

  return (
    <div className="space-y-4">
      {mode === "view" && (
        <div className="flex gap-2">
          <button className="text-sm px-3 py-2 rounded-md border border-zinc-200 hover:bg-zinc-50" onClick={() => onChangeMode("edit")}>
            Edit
          </button>
          {event && (
            <button
              className="text-sm px-3 py-2 rounded-md border border-zinc-200 hover:bg-zinc-50 text-red-600"
              onClick={async () => {
                if (!confirm("Delete this schedule?")) return;
                await deleteEvent(event.id);
                onSaved();
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs text-zinc-500">Calendar</div>
        <select
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          value={calendarId}
          onChange={(e) => setCalendarId(Number(e.target.value))}
          disabled={readonly}
        >
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.role})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-zinc-500">Subject</div>
        <input className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} disabled={readonly} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} disabled={readonly} />
        <span className="text-sm">All day</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <div className="text-xs text-zinc-500">Start (ISO)</div>
          <input className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-mono" value={startAt} onChange={(e) => setStartAt(e.target.value)} disabled={readonly} />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-zinc-500">End (ISO)</div>
          <input className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-mono" value={endAt} onChange={(e) => setEndAt(e.target.value)} disabled={readonly} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-zinc-500">Note</div>
        <textarea className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm min-h-[90px]" value={note} onChange={(e) => setNote(e.target.value)} disabled={readonly} />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-zinc-500">Notification (minutes before)</div>
        <input
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          value={reminder}
          onChange={(e) => setReminder(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="e.g. 10"
          disabled={readonly}
        />
      </div>

      {mode !== "view" && (
        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 rounded-md bg-black text-white py-2 text-sm hover:bg-zinc-800"
            onClick={async () => {
              if (mode === "create") {
                await createEvent({
                  calendarId,
                  title,
                  startAt,
                  endAt,
                  allDay,
                  note: note || null,
                  reminderMinutesBefore: reminder === "" ? null : Number(reminder),
                });
              } else if (mode === "edit" && event) {
                await updateEvent(event.id, {
                  title,
                  startAt,
                  endAt,
                  allDay,
                  note: note || null,
                  reminderMinutesBefore: reminder === "" ? null : Number(reminder),
                });
              }
              onSaved();
            }}
          >
            Save
          </button>
          <button className="flex-1 rounded-md border border-zinc-200 py-2 text-sm hover:bg-zinc-50" onClick={() => onChangeMode("view")}>
            Cancel
          </button>
        </div>
      )}

      <div className="text-xs text-zinc-500">
        * FreeBusy 권한 사용자는 서버에서 제목/메모가 마스킹되어 Busy로만 보입니다.
      </div>
    </div>
  );

  if (calendarId <= 0) {
    alert("먼저 캘린더를 선택하거나 생성해주세요.");
    return;
  }

  useEffect(() => {
    // 1) edit/view 모드에서 event가 있으면 event.calendarId를 우선 사용
    if (event?.calendarId) {
      setCalendarId(event.calendarId);
      return;
    }

    // 2) create 모드에서는 선택된 캘린더가 있으면 그걸 사용
    const next = selectedCalIds[0] ?? calendars[0]?.id ?? 0;

    // 3) 지금 값이 0이고 next가 유효하면 갱신
    if (calendarId === 0 && next !== 0) {
      setCalendarId(next);
    }

    // calendars가 바뀌어도 현재 calendarId가 목록에 없으면 next로 강제
    if (next !== 0 && !calendars.some((c) => c.id === calendarId)) {
      setCalendarId(next);
    }
  }, [event, calendars, selectedCalIds]);

}



