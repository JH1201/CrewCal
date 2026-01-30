export function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
export function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); }
export function addDays(d: Date, delta: number) { const x = new Date(d); x.setDate(x.getDate() + delta); return x; }
export function addMonths(d: Date, delta: number) { return new Date(d.getFullYear(), d.getMonth() + delta, 1); }
export function startOfWeek(d: Date, weekStartsOn = 0) {
  const x = startOfDay(d);
  const day = (x.getDay() - weekStartsOn + 7) % 7;
  return addDays(x, -day);
}
export function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
export function isSameMonth(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth(); }
export function getMonthGrid(anchor: Date, weekStartsOn = 0) {
  const first = startOfMonth(anchor);
  const firstDay = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(first); start.setDate(first.getDate() - firstDay);
  const days: Date[] = [];
  for (let i=0;i<42;i++){ const x=new Date(start); x.setDate(start.getDate()+i); days.push(x); }
  return { days };
}
export function formatMonthTitle(d: Date) { return d.toLocaleString("en-US",{month:"long"}); }
export function formatYear(d: Date) { return String(d.getFullYear()); }
export function formatDowShort(d: Date) { return d.toLocaleString("en-US",{weekday:"short"}); }
export function minutesSinceStartOfDay(d: Date) { return d.getHours()*60 + d.getMinutes(); }
export function snapMinutes(mins: number, step=30) { return Math.max(0, Math.min(24*60-step, Math.round(mins/step)*step)); }
export function pad2(n: number) { return String(n).padStart(2,"0"); }
export function fmtTime(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
