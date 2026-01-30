export type ViewMode = "month" | "week";

export type CalendarItem = {
  id: string;
  name: string;
  color: string;
  checked: boolean;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  reminder?: string;
  notes?: string;
};

export type ShareRole = "Viewer" | "Editor" | "Free/Busy";

export type CalendarShare = {
  id: string;
  calendarId: string;
  email: string;
  role: ShareRole;
  isOwner?: boolean;
};
