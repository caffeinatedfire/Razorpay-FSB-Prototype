// Instrumentation (plan Appendix E). Events go to localStorage `collect.events` and are never sent anywhere.
// A timed run starts at `timed_start` (the Start tap) and ends at `timed_end` (the Sent screen appears).
// Its tap count is the number of pointer events between the two.

import { SystemClock, monotonicMs, toIstIso, type Clock } from '../clock';

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

let currentRun: { runId: string; label: string; startT: number; startedAt: string; taps: number } | null = null;

function onPointer(e: Event): void {
  if (currentRun && (e as PointerEvent).isPrimary !== false) currentRun.taps += 1;
}

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
  if (currentRun) document.removeEventListener('pointerdown', onPointer, true);
  const realNow = new SystemClock().now();
  const runId = `run_${toIstIso(realNow).replace(/[^0-9]/g, '').slice(0, 14)}_${Math.round(monotonicMs())}`;
  currentRun = { runId, label: label.trim() || 'unnamed', startT: monotonicMs(), startedAt: toIstIso(realNow), taps: 0 };
  document.addEventListener('pointerdown', onPointer, true);
  logEvent('timed_start', clock, { label: currentRun.label });
  return runId;
}

export interface RunResult { runId: string; label: string; ms: number; taps: number; startedAt: string }

/** Ends the run when the Sent screen appears. Returns null if no run was active. */
export function endRun(clock: Clock): RunResult | null {
  if (!currentRun) return null;
  const r = currentRun;
  const result: RunResult = {
    runId: r.runId, label: r.label, ms: Math.round(monotonicMs() - r.startT), taps: r.taps, startedAt: r.startedAt,
  };
  logEvent('timed_end', clock, { label: r.label, ms: result.ms, taps: result.taps, started_at: r.startedAt });
  document.removeEventListener('pointerdown', onPointer, true);
  currentRun = null;
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

export function downloadTimings(): void {
  const blob = new Blob([timingsCsv()], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'timings.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
