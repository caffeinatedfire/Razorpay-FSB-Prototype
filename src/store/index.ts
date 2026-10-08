// App state: a reducer plus localStorage persistence under `collect.v1` (plan P3-T06).
// Nothing here leaves the browser.

import fixtures from '../../fixtures/links.synthetic.json';
import { DAY_MS, addMs, formatDayShort, parseIso, toIstIso } from '../clock';
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
  /** The sender named in the sign-off (D-26). Kept beside the settings so Appendix C types stay as written. */
  owner: OwnerProfile;
  /** The most recent send, kept so it can be undone for 10 seconds (R16). */
  lastSend: LastSend | null;
  seq: number;
}

export interface LastSend {
  linkId: string;
  touchId: string;
  eventId: string;
  /** Real wall-clock ms of the send; the undo window is real time, not demo time. */
  sentAtMs: number;
  prev: { touchCount: number; lastTouchAt: string | null; nextCheckAt: string | null };
}

export interface OwnerProfile {
  name: string;
  business: string;
}

/** Demo sender: the builder's own name and organisation, by the human's decision at G4 (D-36). Customers stay invented. */
export const DEFAULT_OWNER: OwnerProfile = { name: 'Samik', business: 'CFI' };
export const OWNER_NAME_MAX = 30;
export const BUSINESS_NAME_MAX = 40;

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
    const what = r.kind === 'promised_date' ? `promised to pay by ${r.promisedDate ? formatDayShort(parseIso(r.promisedDate)) : 'a date'}` : r.kind === 'disputes' ? 'disputes it' : r.kind;
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
    owner: { ...DEFAULT_OWNER },
    lastSend: null,
    seq: 0,
  };
}

export type Action =
  | { type: 'SEND_CONFIRMED'; linkId: string; text: string; channel: Touch['channel']; lang: Touch['lang']; tone: Touch['tone']; at: string; nextCheckDays: number; sentAtMs?: number }
  | { type: 'UNDO_SEND'; linkId: string; at: string }
  | { type: 'LOG_REPLY'; linkId: string; kind: ReplyLog['kind']; at: string; promisedDate?: string; nextCheckAt?: string }
  | { type: 'MARK_PAID_OFFLINE'; linkId: string; at: string }
  | { type: 'SIMULATE_PAYMENT'; linkId: string; at: string }
  | { type: 'SIMULATE_DISPUTE'; linkId: string; at: string }
  | { type: 'SET_NEXT_CHECK'; linkId: string; at: string }
  | { type: 'SET_SETTINGS'; patch: Partial<OwnerSettings> }
  | { type: 'SET_OWNER'; patch: Partial<OwnerProfile> }
  | { type: 'RESET' };

export const DEFAULT_NEXT_CHECK_DAYS = 2;

function nameFor(state: AppState, linkId: string): string {
  const link = state.links.find((l) => l.id === linkId);
  return state.customers.find((c) => c.id === link?.customerId)?.name ?? 'Customer';
}

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
        lastSend: {
          linkId: link.id, touchId: touch.id, eventId: event.id, sentAtMs: action.sentAtMs ?? 0,
          prev: { touchCount: link.touchCount, lastTouchAt: link.lastTouchAt, nextCheckAt: state.nextCheckAt[link.id] ?? null },
        },
      };
    }
    case 'UNDO_SEND': {
      // R16: removes the simulated touch and puts the link back as it was. The caller checks the 10-second window.
      const last = state.lastSend;
      if (!last || last.linkId !== action.linkId) return state;
      const nextCheckAt = { ...state.nextCheckAt };
      if (last.prev.nextCheckAt) nextCheckAt[last.linkId] = last.prev.nextCheckAt;
      else delete nextCheckAt[last.linkId];
      const seq = state.seq + 1;
      return {
        ...state,
        seq,
        links: state.links.map((l) =>
          l.id === last.linkId ? { ...l, touchCount: last.prev.touchCount, lastTouchAt: last.prev.lastTouchAt } : l,
        ),
        touches: state.touches.filter((t) => t.id !== last.touchId),
        activity: [
          { id: `ev_local_${seq}`, at: action.at, kind: 'undo', linkId: last.linkId, detail: `Undid the reminder to ${nameFor(state, last.linkId)} (this app only)` },
          ...state.activity.filter((e) => e.id !== last.eventId),
        ],
        nextCheckAt,
        lastSend: null,
      };
    }
    case 'LOG_REPLY': {
      const link = state.links.find((l) => l.id === action.linkId);
      if (!link) return state;
      const seq = state.seq + 1;
      const reply: ReplyLog = {
        id: `reply_local_${seq}`, linkId: link.id, kind: action.kind,
        promisedDate: action.kind === 'promised_date' ? action.promisedDate ?? null : null, loggedAt: action.at,
      };
      const name = nameFor(state, link.id);
      const nextCheckAt = { ...state.nextCheckAt };
      let links = state.links;
      let customers = state.customers;
      let detail: string;
      if (action.kind === 'promised_date' && action.promisedDate) {
        const promised = action.promisedDate;
        links = links.map((l) => (l.id === link.id ? { ...l, promisedDate: promised } : l));
        delete nextCheckAt[link.id]; // the promise (R08) decides when to chase again
        detail = `${name} promised to pay by ${formatDayShort(parseIso(promised))}`;
      } else if (action.kind === 'disputes') {
        customers = customers.map((c) => (c.id === link.customerId ? { ...c, disputed: true } : c));
        detail = `${name} disputes it`;
      } else if (action.kind === 'says_paid') {
        if (action.nextCheckAt) nextCheckAt[link.id] = action.nextCheckAt;
        detail = `${name} says they paid`;
      } else {
        if (action.nextCheckAt) nextCheckAt[link.id] = action.nextCheckAt;
        detail = `No reply yet from ${name}`;
      }
      return {
        ...state, seq, links, customers, nextCheckAt,
        replies: [...state.replies, reply],
        activity: [{ id: `ev_local_${seq}`, at: action.at, kind: 'reply', linkId: link.id, detail }, ...state.activity],
      };
    }
    case 'MARK_PAID_OFFLINE': {
      const link = state.links.find((l) => l.id === action.linkId);
      if (!link) return state;
      const seq = state.seq + 1;
      return {
        ...state, seq,
        links: state.links.map((l) => (l.id === link.id ? { ...l, paidOffline: true, paidAt: action.at } : l)),
        replies: [...state.replies, { id: `reply_local_${seq}`, linkId: link.id, kind: 'says_paid', promisedDate: null, loggedAt: action.at }],
        activity: [
          { id: `ev_local_${seq}`, at: action.at, kind: 'paid_offline', linkId: link.id, detail: `${nameFor(state, link.id)}: ${formatINR(amountDuePaise(link))} marked paid offline by you (this app only)` },
          ...state.activity,
        ],
      };
    }
    case 'SIMULATE_PAYMENT': {
      const link = state.links.find((l) => l.id === action.linkId);
      if (!link || link.status === 'paid') return state;
      const seq = state.seq + 1;
      return {
        ...state, seq,
        links: state.links.map((l) =>
          l.id === link.id ? { ...l, status: 'paid', amountPaidPaise: l.amountPaise, paidAt: action.at } : l,
        ),
        activity: [
          { id: `ev_local_${seq}`, at: action.at, kind: 'paid', linkId: link.id, detail: `${nameFor(state, link.id)} paid ${formatINR(amountDuePaise(link))} via link (SIMULATED)` },
          ...state.activity,
        ],
      };
    }
    case 'SIMULATE_DISPUTE': {
      const link = state.links.find((l) => l.id === action.linkId);
      if (!link) return state;
      const seq = state.seq + 1;
      return {
        ...state, seq,
        customers: state.customers.map((c) => (c.id === link.customerId ? { ...c, disputed: true } : c)),
        replies: [...state.replies, { id: `reply_local_${seq}`, linkId: link.id, kind: 'disputes', promisedDate: null, loggedAt: action.at }],
        activity: [
          { id: `ev_local_${seq}`, at: action.at, kind: 'reply', linkId: link.id, detail: `${nameFor(state, link.id)} disputes it (SIMULATED)` },
          ...state.activity,
        ],
      };
    }
    case 'SET_NEXT_CHECK':
      return { ...state, nextCheckAt: { ...state.nextCheckAt, [action.linkId]: action.at } };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'SET_OWNER': {
      const owner = { ...state.owner, ...action.patch };
      return {
        ...state,
        owner: { name: owner.name.slice(0, OWNER_NAME_MAX), business: owner.business.slice(0, BUSINESS_NAME_MAX) },
      };
    }
    case 'RESET':
      // Data goes back to the fixtures; the owner's settings (including Timed run) and names stay.
      return { ...initialState(), settings: state.settings, owner: state.owner };
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
        return {
          ...parsed,
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          owner: { ...DEFAULT_OWNER, ...parsed.owner },
          lastSend: parsed.lastSend ?? null,
        };
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
