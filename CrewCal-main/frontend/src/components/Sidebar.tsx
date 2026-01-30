import type { CalendarSummary } from "../lib/api";
import { SidebarCalendarItem } from "./SidebarCalendarItem";

export function Sidebar({
  calendars,
  selectedCalIds,
  onToggle,
  onNewCalendar,
  onOpenShare,
  onDeleteCalendar,
}: {
  calendars: CalendarSummary[];
  selectedCalIds: number[];
  onToggle: (id: number) => void;
  onNewCalendar: () => void;
  onOpenShare: (calendarId: number) => void;
  onDeleteCalendar: (calendarId: number) => void;
}) {
  const myCalendars = calendars.filter((c) => c.role === "OWNER");
  const sharedCalendars = calendars.filter((c) => c.role !== "OWNER");

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3">
        <button
          className="w-full rounded-lg bg-black text-white py-2 text-sm hover:bg-zinc-800"
          onClick={onNewCalendar}
        >
          + New Calendar
        </button>
      </div>

      <div className="px-3 pb-3 overflow-auto">
        <section className="mt-2">
          <div className="text-xs text-zinc-500 mb-2 font-medium">MY CALENDARS</div>
          <div className="space-y-1">
            {myCalendars.map((c) => (
              <SidebarCalendarItem
                key={c.id}
                calendar={c}
                checked={selectedCalIds.includes(c.id)}
                onToggle={onToggle}
                onOpenShare={onOpenShare}
                onDelete={onDeleteCalendar}
              />
            ))}
            {myCalendars.length === 0 && <div className="text-sm text-zinc-400">No calendars</div>}
          </div>
        </section>

        <section className="mt-6">
          <div className="text-xs text-zinc-500 mb-2 font-medium">SHARED CALENDARS</div>
          <div className="space-y-1">
            {sharedCalendars.map((c) => (
              <SidebarCalendarItem
                key={c.id}
                calendar={c}
                checked={selectedCalIds.includes(c.id)}
                onToggle={onToggle}
                onOpenShare={() => {}}
                onDelete={() => {}}
              />
            ))}
            {sharedCalendars.length === 0 && <div className="text-sm text-zinc-400">No shared calendars</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
