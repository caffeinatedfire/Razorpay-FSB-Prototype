// App state: a reducer plus localStorage persistence under `collect.v1` (plan P3-T06).
// Nothing here leaves the browser.

import fixtures from '../../fixtures/links.synthetic.json';
import { DAY_MS, addMs, parseIso, toIstIso } from '../clock';
import { amountDuePaise } from '../domain/derive';
import type {
  ActivityEvent, Customer, OwnerSettings, PaymentLink, ReplyLog, Touch,
} from '../domain/types';
import { formatINR } from '../format';

export const STORAGE_KEY = 'collect.v1';

export interface AppState {
  version: 1;
  customers: Customer[];
  links: PaymentLink[];
  touches: Touch[];
  replies: ReplyLog[];
  activity: ActivityEvent[];
  settings: OwnerSettings;
  /** linkId -> when the owner wants to look at it again (set on the Sent screen) */
  nextCheckAt: Record<string, string>;
  seq: number;
}

export const DEFAULT_SETTINGS: OwnerSettings = {
  quietStart: '09:00',
  quietEnd: '21:00',
  maxTouchesPerLink: 3,
  minGapHours: 48,
  tone: 'polite',
  lang: 'en',
  channel: 'whatsapp',
  timedRun: false,
};

interface FixtureShape {
  customers: Customer[];
  links: PaymentLink[];
  touches: Touch[];
  replies: ReplyLog[];
}

/** Activity seeded from the fixture history, so the timeline is not empty on first open. */
function seedActivity(f: FixtureShape): ActivityEvent[] {
  const nameOf = (linkId: string) => {
    const link = f.links.find((l) => l.id === linkId);
    return f.customers.find((c) => c.id === link?.customerId)?.name ?? 'Customer';
  };
  const events: ActivityEvent[] = [];
  for (const t of f.touches) {
    events.push({ id: `seed_${t.id}`, at: t.sentAt, kind: 'touch', linkId: t.linkId, detail: `Reminder to ${nameOf(t.linkId)} (SIMULATED)` });
  }
  for (const r of f.replies) {
    const what = r.kind === 'promised_date' ? `promised to pay by ${r.promisedDate}` : r.kind === 'disputes' ? 'disputes it' : r.kind;
    events.push({ id: `seed_${r.id}`, at: r.loggedAt, kind: 'reply', linkId: r.linkId, detail: `${nameOf(r.linkId)} ${what}` });
  }
  for (const l of f.links) {
    if (l.status === 'paid' && l.paidAt) {
      events.push({ id: `seed_paid_${l.id}`, at: l.paidAt, kind: 'paid', linkId: l.id, detail: `${nameOf(l.id)} paid ${formatINR(l.amountPaise)} via link` });
    }
  }
  return events.sort((a, b) => parseIso(b.at).getTime() - parseIso(a.at).getTime());
}

export function initialState(): AppState {
  const f = structuredClone(fixtures) as unknown as FixtureShape;
  return {
    version: 1,
    customers: f.customers,
    links: f.links,
    touches: f.touches,
    replies: f.replies,
    activity: seedActivity(f),
    settings: { ...DEFAULT_SETTINGS },
    nextCheckAt: {},
    seq: 0,
  };
}

export type Action =
  | { type: 'SEND_CONFIRMED'; linkId: string; text: string; channel: Touch['channel']; lang: Touch['lang']; tone: Touch['tone']; at: string; nextCheckDays: number }
  | { type: 'SET_NEXT_CHECK'; linkId: string; at: string }
  | { type: 'SET_SETTINGS'; patch: Partial<OwnerSettings> }
  | { type: 'RESET' };

export const DEFAULT_NEXT_CHECK_DAYS = 2;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SEND_CONFIRMED': {
      const link = state.links.find((l) => l.id === action.linkId);
      if (!link) return state;
      const seq = state.seq + 1;
      const customer = state.customers.find((c) => c.id === link.customerId);
      const touch: Touch = {
        id: `touch_local_${seq}`,
        linkId: link.id,
        channel: action.channel,
        sentAt: action.at,
        text: action.text,
        lang: action.lang,
        tone: action.tone,
        simulated: true,
      };
      const event: ActivityEvent = {
        id: `ev_local_${seq}`,
        at: action.at,
        kind: 'touch',
        linkId: link.id,
        detail: `Reminder to ${customer?.name ?? 'customer'} for ${formatINR(amountDuePaise(link))} (SIMULATED)`,
      };
      return {
        ...state,
        seq,
        links: state.links.map((l) =>
          l.id === link.id ? { ...l, touchCount: l.touchCount + 1, lastTouchAt: action.at } : l,
        ),
        touches: [...state.touches, touch],
        activity: [event, ...state.activity],
        nextCheckAt: {
          ...state.nextCheckAt,
          [link.id]: toIstIso(addMs(parseIso(action.at), action.nextCheckDays * DAY_MS)),
        },
      };
    }
    case 'SET_NEXT_CHECK':
      return { ...state, nextCheckAt: { ...state.nextCheckAt, [action.linkId]: action.at } };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'RESET':
      // Data goes back to the fixtures; the owner's settings (including Timed run) stay.
      return { ...initialState(), settings: state.settings };
    default:
      return state;
  }
}

// ---- persistence ------------------------------------------------------------

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadState(): AppState {
  const s = storage();
  try {
    const raw = s?.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.links)) {
        return { ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
      }
    }
  } catch {
    // fall through to fresh fixtures
  }
  return initialState();
}

export function saveState(state: AppState): void {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked: the app keeps working in memory
  }
}

/** Puts the synthetic fixtures back, keeping nothing from earlier sessions. */
export function resetDemoData(): AppState {
  const fresh = initialState();
  saveState(fresh);
  return fresh;
}
