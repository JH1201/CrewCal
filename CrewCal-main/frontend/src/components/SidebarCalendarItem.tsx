import { useState } from "react";
import type { CalendarSummary } from "../lib/api";

type Props = {
  calendar: CalendarSummary;
  checked: boolean;
  onToggle: (id: number) => void;
  onOpenShare: (calendarId: number) => void;
  onDelete: (calendarId: number) => void;
};

export function SidebarCalendarItem({ calendar, checked, onToggle, onOpenShare, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showEdit = calendar.role === "OWNER";

  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-zinc-100">
      <label className="flex items-center gap-2 min-w-0">
        <input type="checkbox" checked={checked} onChange={() => onToggle(calendar.id)} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: calendar.color }} />
        <span className="truncate text-sm">{calendar.name}</span>
      </label>

      {showEdit && (
        <div className="relative">
          <button
            className="text-xs px-2 py-1 rounded-md border border-zinc-200 hover:bg-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Edit calendar"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-zinc-200 bg-white shadow">
              <button
                className="w-full text-left text-sm px-3 py-2 hover:bg-zinc-50"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenShare(calendar.id);
                }}
              >
                Share / Members
              </button>
              <button
                className="w-full text-left text-sm px-3 py-2 hover:bg-zinc-50 text-red-600"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(calendar.id);
                }}
              >
                Delete Calendar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
