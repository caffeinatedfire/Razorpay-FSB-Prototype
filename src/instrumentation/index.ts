// Instrumentation (plan Appendix E). Events go to localStorage `collect.events` and are never sent anywhere.
// A timed run starts at `timed_start` (the Start tap) and ends at `timed_end` (the Sent screen appears).
// Its tap count is the number of pointer events between the two.

import { monotonicMs, systemMs, toIstIso, type Clock } from '../clock';

export const EVENTS_KEY = 'collect.events';

export type EventName =
  | 'app_open' | 'home_view' | 'chase_open' | 'message_edit' | 'lang_change' | 'tone_change'
  | 'channel_change' | 'send_confirm' | 'undo' | 'reply_logged' | 'paid_seen'
  | 'soft_block_shown' | 'hard_block_shown' | 'timed_start' | 'timed_end';

export interface LoggedEvent {
  name: EventName;
  /** App time (the demo clock), IST */
  at: string;
  /** Monotonic ms since page load */
  t: number;
  runId?: string;
  data?: Record<string, string | number | boolean>;
}

function store(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readEvents(): LoggedEvent[] {
  try {
    const raw = store()?.getItem(EVENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as LoggedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: LoggedEvent[]): void {
  try {
    store()?.setItem(EVENTS_KEY, JSON.stringify(events.slice(-2000)));
  } catch {
    // storage full or blocked: drop the event
  }
}

// The active run is kept in localStorage, not only in memory, so a page reload in the middle of a run
// (a pull-to-refresh, or the browser reloading a background tab) does not lose it. Times use the wall
// clock for the same reason; a run older than RUN_MAX_AGE_MS is treated as abandoned.
export const RUN_KEY = 'collect.run';
const RUN_MAX_AGE_MS = 30 * 60 * 1000;

interface ActiveRun { runId: string; label: string; startMs: number; startedAt: string; taps: number; targets?: string[] }

function readRun(): ActiveRun | null {
  try {
    const raw = store()?.getItem(RUN_KEY);
    const r = raw ? (JSON.parse(raw) as ActiveRun) : null;
    if (!r || typeof r.startMs !== 'number') return null;
    if (systemMs() - r.startMs > RUN_MAX_AGE_MS) {
      store()?.removeItem(RUN_KEY);
      return null;
    }
    return r;
  } catch {
    return null;
  }
}

function writeRun(r: ActiveRun | null): void {
  try {
    if (r) store()?.setItem(RUN_KEY, JSON.stringify(r));
    else store()?.removeItem(RUN_KEY);
  } catch {
    // storage blocked: the run then lives only as long as the page
  }
}

let currentRun: ActiveRun | null = readRun();

// A tap is a press and release within TAP_SLOP_PX of each other (D-28). A press that moves further,
// or is cancelled because the browser took it as a scroll, is not a tap.
export const TAP_SLOP_PX = 10;
const downs = new Map<number, { x: number; y: number; target: EventTarget | null }>();

/** A short, non-personal description of what was tapped: the control's label or text. */
export function describeTarget(target: EventTarget | null): string {
  const el = target instanceof Element ? target.closest('button, a, input, textarea, select, label, [role="button"]') : null;
  if (!el) return 'screen';
  const label = el.getAttribute('aria-label') ?? (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? `${el.tagName.toLowerCase()}#${el.id || el.type}` : el.textContent);
  return (label ?? '').replace(/\s+/g, ' ').trim().slice(0, 40) || el.tagName.toLowerCase();
}

/** Whether a press at (x0, y0) released at (x1, y1) counts as a tap. */
export function isTap(x0: number, y0: number, x1: number, y1: number): boolean {
  return Math.hypot(x1 - x0, y1 - y0) <= TAP_SLOP_PX;
}

function onDown(e: Event): void {
  const p = e as PointerEvent;
  if (!currentRun || p.isPrimary === false) return;
  downs.set(p.pointerId, { x: p.clientX, y: p.clientY, target: p.target });
}

function onUp(e: Event): void {
  const p = e as PointerEvent;
  const d = downs.get(p.pointerId);
  downs.delete(p.pointerId);
  if (!currentRun || !d || !isTap(d.x, d.y, p.clientX, p.clientY)) return;
  currentRun.taps += 1;
  currentRun.targets = [...(currentRun.targets ?? []), describeTarget(d.target)];
  writeRun(currentRun);
}

function onCancel(e: Event): void {
  downs.delete((e as PointerEvent).pointerId);
}

function listen(on: boolean): void {
  if (typeof document === 'undefined') return;
  const fn = on ? document.addEventListener.bind(document) : document.removeEventListener.bind(document);
  fn('pointerdown', onDown, true);
  fn('pointerup', onUp, true);
  fn('pointercancel', onCancel, true);
}

if (currentRun) listen(true);

export function logEvent(name: EventName, clock: Clock, data?: LoggedEvent['data']): void {
  const ev: LoggedEvent = { name, at: toIstIso(clock.now()), t: Math.round(monotonicMs()) };
  if (currentRun) ev.runId = currentRun.runId;
  if (data) ev.data = data;
  writeEvents([...readEvents(), ev]);
}

export function isRunActive(): boolean {
  return currentRun !== null;
}

/** Starts a timed run. The Start tap itself is not counted: counting starts after it. */
export function startRun(label: string, clock: Clock): string {
  listen(false);
  downs.clear();
  const startMs = systemMs();
  const startedAt = toIstIso(new Date(startMs));
  const runId = `run_${startedAt.replace(/[^0-9]/g, '').slice(0, 14)}_${Math.round(monotonicMs())}`;
  currentRun = { runId, label: label.trim() || 'unnamed', startMs, startedAt, taps: 0 };
  writeRun(currentRun);
  listen(true);
  logEvent('timed_start', clock, { label: currentRun.label });
  return runId;
}

export interface RunResult { runId: string; label: string; ms: number; taps: number; startedAt: string }

/** Ends the run when the Sent screen appears. Returns null if no run was active. */
export function endRun(clock: Clock): RunResult | null {
  if (!currentRun) return null;
  const r = currentRun;
  const result: RunResult = {
    runId: r.runId, label: r.label, ms: Math.max(0, systemMs() - r.startMs), taps: r.taps, startedAt: r.startedAt,
  };
  logEvent('timed_end', clock, {
    label: r.label, ms: result.ms, taps: result.taps, started_at: r.startedAt, targets: (r.targets ?? []).join(' | '),
  });
  listen(false);
  downs.clear();
  currentRun = null;
  writeRun(null);
  return result;
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** timings.csv: run_id, label, ms, taps, started_at (one row per finished run). */
export function timingsCsv(events: LoggedEvent[] = readEvents()): string {
  const rows = events
    .filter((e) => e.name === 'timed_end' && e.runId && e.data)
    .map((e) => [e.runId as string, String(e.data?.label ?? ''), Number(e.data?.ms ?? 0), Number(e.data?.taps ?? 0), String(e.data?.started_at ?? '')]);
  return ['run_id,label,ms,taps,started_at', ...rows.map((r) => r.map(csvCell).join(','))].join('\n') + '\n';
}

/** events.csv: every logged event, for explaining a run (D-28). */
export function eventsCsv(events: LoggedEvent[] = readEvents()): string {
  const rows = events.map((e) => [e.runId ?? '', e.name, e.at, e.t, e.data ? JSON.stringify(e.data) : '']);
  return ['run_id,name,at,t,data', ...rows.map((r) => r.map(csvCell).join(','))].join('\n') + '\n';
}

export function downloadTimings(): void {
  download('timings.csv', timingsCsv());
}

export function downloadEvents(): void {
  download('events.csv', eventsCsv());
}

function download(name: string, text: string): void {
  const blob = new Blob([text], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
