// The only module that reads the system time (R14). Everything else takes a Clock.
// India has one time zone with no daylight saving, so IST is a fixed +05:30 offset.

export interface Clock {
  now(): Date;
}

/** Real wall-clock time. Used for practice-run timestamps, never for rules in the demo. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date(Date.now());
  }
}

/** Always returns the same instant. Used by tests and by `?now=`. */
export class FixedClock implements Clock {
  private readonly ms: number;
  constructor(iso: string) {
    this.ms = parseIso(iso).getTime();
  }
  now(): Date {
    return new Date(this.ms);
  }
}

/** Starts at a fixed demo instant and then moves forward in real time. The hosted default. */
export class DemoClock implements Clock {
  private readonly startMs: number;
  private readonly realStartMs: number;
  constructor(startIso: string, private readonly realNow: () => number = () => Date.now()) {
    this.startMs = parseIso(startIso).getTime();
    this.realStartMs = realNow();
  }
  now(): Date {
    return new Date(this.startMs + (this.realNow() - this.realStartMs));
  }
}

export const DEMO_START_ISO = '2026-10-06T11:00:00+05:30';

/** `?now=<ISO>` fixes the clock; otherwise the demo clock starts at Tue 6 Oct 2026, 11:00 IST. */
export function clockFromSearch(search: string): Clock {
  const now = new URLSearchParams(search).get('now');
  if (now && isValidIso(now)) return new FixedClock(now);
  return new DemoClock(DEMO_START_ISO);
}

/** Real wall-clock milliseconds. Timed runs use it so a run survives a page reload. */
export function systemMs(): number {
  return Date.now();
}

/** Monotonic milliseconds since page load. */
export function monotonicMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// ---- IST helpers -------------------------------------------------------------

export const IST_OFFSET_MS = 330 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function isValidIso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(s) && !Number.isNaN(new Date(s).getTime());
}

/** Parses an ISO string. A bare date (YYYY-MM-DD) is read as midnight IST. */
export function parseIso(s: string): Date {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00+05:30` : s;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid ISO time: ${s}`);
  return d;
}

export interface IstParts {
  year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number;
}

export function istParts(d: Date): IstParts {
  const s = new Date(d.getTime() + IST_OFFSET_MS);
  return {
    year: s.getUTCFullYear(), month: s.getUTCMonth() + 1, day: s.getUTCDate(),
    hour: s.getUTCHours(), minute: s.getUTCMinutes(), second: s.getUTCSeconds(), weekday: s.getUTCDay(),
  };
}

const p2 = (n: number) => String(n).padStart(2, '0');

/** "2026-10-06T11:00:00+05:30" */
export function toIstIso(d: Date): string {
  const p = istParts(d);
  return `${p.year}-${p2(p.month)}-${p2(p.day)}T${p2(p.hour)}:${p2(p.minute)}:${p2(p.second)}+05:30`;
}

/** "2026-10-06" (the IST calendar date) */
export function istDate(d: Date): string {
  return toIstIso(d).slice(0, 10);
}

/** Minutes since IST midnight. */
export function istMinuteOfDay(d: Date): number {
  const p = istParts(d);
  return p.hour * 60 + p.minute;
}

export function addMs(d: Date, ms: number): Date {
  return new Date(d.getTime() + ms);
}

/** Adds whole days to an IST calendar date: ("2026-10-09", 1) -> "2026-10-10". */
export function addDaysToDate(date: string, days: number): string {
  return istDate(addMs(parseIso(date), days * DAY_MS));
}

/** "Tue 6 Oct" */
export function formatDayShort(d: Date): string {
  const p = istParts(d);
  return `${DAYS[p.weekday]} ${p.day} ${MONTHS[p.month - 1]}`;
}

/** "20 Sep" */
export function formatDayMonth(d: Date): string {
  const p = istParts(d);
  return `${p.day} ${MONTHS[p.month - 1]}`;
}

/** "11:00 AM", "10:30 PM" */
export function formatTime(d: Date): string {
  const p = istParts(d);
  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${h12}:${p2(p.minute)} ${p.hour < 12 ? 'AM' : 'PM'}`;
}

/** "HH:MM" -> minutes since midnight */
export function hhmmToMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) throw new Error(`Invalid HH:MM: ${hhmm}`);
  return Number(m[1]) * 60 + Number(m[2]);
}
