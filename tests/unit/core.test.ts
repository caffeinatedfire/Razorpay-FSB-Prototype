// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  DemoClock, FixedClock, addDaysToDate, clockFromSearch, formatDayShort, formatTime, istDate, toIstIso,
} from '../../src/clock';
import { buildHome, decide, type DecideInput } from '../../src/decide';
import { amountDuePaise, isOverdue, recoveredThisWeek } from '../../src/domain/derive';
import type { Customer, PaymentLink } from '../../src/domain/types';
import { formatINR } from '../../src/format';
import { timingsCsv, type LoggedEvent } from '../../src/instrumentation';
import { chipReason, paymentHistory, pPay, rankLink } from '../../src/rank';
import { validateMessage } from '../../src/rules';
import { DEFAULT_SETTINGS, initialState, reducer } from '../../src/store';
import { KINDS, LANGS, TONES, renderMessage } from '../../src/templates';
import { generate, serialise } from '../../scripts/gen-fixtures';

const NOW = new FixedClock('2026-10-06T11:00:00+05:30').now();

function link(over: Partial<PaymentLink> = {}): PaymentLink {
  return {
    id: 'plink_TESTTESTTEST01', referenceId: 'INV-TEST-001', customerId: 'cust_01',
    amountPaise: 1250000, amountPaidPaise: 0, currency: 'INR', status: 'created',
    createdAt: '2026-09-20T10:00:00+05:30', dueAt: '2026-09-27T10:00:00+05:30', expireBy: null, paidAt: null,
    acceptPartial: false, shortUrl: 'https://rzp.example/pay/k3x9qa', description: 'Logo design (Oct batch)',
    touchCount: 0, lastTouchAt: null, promisedDate: null, paidOffline: false, ...over,
  };
}
const cust: Customer = { id: 'cust_01', name: 'Greenleaf Cafe', phone: '+91 00000 00001', muted: false, disputed: false, tags: [] };
function input(l: PaymentLink, over: Partial<DecideInput> = {}): DecideInput {
  return { link: l, customer: cust, customerLinks: [l], lastReply: null, settings: DEFAULT_SETTINGS, now: NOW, nextCheckAt: null, ...over };
}

describe('clock and format', () => {
  it('formats paise with Indian grouping', () => {
    expect(formatINR(1250000)).toBe('₹12,500');
    expect(formatINR(18435000)).toBe('₹1,84,350');
    expect(formatINR(80000)).toBe('₹800');
    expect(formatINR(1050)).toBe('₹10.50');
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(-500000)).toBe('-₹5,000');
    expect(formatINR(1234567800)).toBe('₹1,23,45,678');
  });
  it('writes IST times and dates', () => {
    expect(toIstIso(NOW)).toBe('2026-10-06T11:00:00+05:30');
    expect(toIstIso(new FixedClock('2026-10-06T20:00:00Z').now())).toBe('2026-10-07T01:30:00+05:30');
    expect(istDate(new FixedClock('2026-10-06T20:00:00Z').now())).toBe('2026-10-07');
    expect(formatDayShort(NOW)).toBe('Tue 6 Oct');
    expect(formatTime(new FixedClock('2026-10-06T22:30:00+05:30').now())).toBe('10:30 PM');
    expect(addDaysToDate('2026-10-31', 1)).toBe('2026-11-01');
  });
  it('the demo clock starts at the demo instant and moves with real time', () => {
    let real = 1000;
    const c = new DemoClock('2026-10-06T11:00:00+05:30', () => real);
    expect(toIstIso(c.now())).toBe('2026-10-06T11:00:00+05:30');
    real += 61_000;
    expect(toIstIso(c.now())).toBe('2026-10-06T11:01:01+05:30');
  });
  it('?now= fixes the clock; no parameter starts the demo clock at Tue 6 Oct 11:00', () => {
    expect(toIstIso(clockFromSearch('?now=2026-10-06T22:30:00%2B05:30').now())).toBe('2026-10-06T22:30:00+05:30');
    expect(toIstIso(clockFromSearch('?now=garbage').now()).slice(0, 16)).toBe('2026-10-06T11:00');
  });
});

describe('ranking (D3)', () => {
  it('weights by days overdue', () => {
    expect([0, 3, 4, 7, 8, 14, 15, 30, 31].map(pPay)).toEqual([0.5, 0.5, 0.4, 0.4, 0.3, 0.3, 0.2, 0.2, 0.1]);
  });
  it('reads payment history from the last 3 paid links', () => {
    const paid = (due: string, paidAt: string) => link({ status: 'paid', dueAt: due, paidAt, amountPaidPaise: 1250000 });
    expect(paymentHistory([
      paid('2026-09-01T10:00:00+05:30', '2026-09-03T10:00:00+05:30'),
      paid('2026-08-01T10:00:00+05:30', '2026-08-02T10:00:00+05:30'),
      paid('2026-07-01T10:00:00+05:30', '2026-07-04T09:00:00+05:30'),
    ])).toBe('prompt');
    expect(paymentHistory([
      paid('2026-09-01T10:00:00+05:30', '2026-09-20T10:00:00+05:30'),
      paid('2026-08-01T10:00:00+05:30', '2026-08-25T10:00:00+05:30'),
    ])).toBe('late');
    expect(paymentHistory([])).toBe('none');
  });
  it('scores amount × pPay × history, with plain reasons', () => {
    const r = rankLink(link(), [link()], NOW, 3);
    expect(r.score).toBe(1250000 * 0.3);
    expect(r.reasons.map((x) => x.text)).toEqual(['₹12,500 due, 9 days overdue', 'No reminder sent yet']);
    expect(chipReason(r.reasons)).toBe('₹12,500 due, 9 days overdue');
    const touched = rankLink(link({ touchCount: 1, lastTouchAt: '2026-10-03T09:00:00+05:30' }), [], NOW, 3);
    expect(chipReason(touched.reasons)).toBe('You messaged them 3 days ago (1 of 3)');
  });
});

describe('default action table (D2)', () => {
  it('row 1: a muted customer is held', () => {
    expect(decide(input(link(), { customer: { ...cust, muted: true } }))?.action).toBe('HOLD');
  });
  it('row 2: a dispute goes to the owner', () => {
    expect(decide(input(link(), { customer: { ...cust, disputed: true } }))?.action).toBe('HAND_TO_ME');
  });
  it('row 3: paid, paid-offline and not-yet-overdue links are excluded', () => {
    expect(decide(input(link({ status: 'paid' })))).toBeNull();
    expect(decide(input(link({ paidOffline: true })))).toBeNull();
    expect(decide(input(link({ dueAt: '2026-10-09T10:00:00+05:30' })))).toBeNull();
    // A disputed customer's paid link is not handed over either.
    expect(decide(input(link({ status: 'paid' }), { customer: { ...cust, disputed: true } }))).toBeNull();
  });
  it('row 4: an expired link is reissued', () => {
    expect(decide(input(link({ status: 'expired' })))?.action).toBe('REISSUE');
  });
  it('row 5: a promise not yet due waits until the day after', () => {
    const d = decide(input(link({ promisedDate: '2026-10-09', touchCount: 1 })));
    expect(d?.action).toBe('WAIT_UNTIL');
    expect(d?.waitUntil).toBe('2026-10-10T00:00:00+05:30');
    expect(d?.softBlocked).toBe(true);
  });
  it('row 5b: a next check in the future waits; a past one does not', () => {
    expect(decide(input(link(), { nextCheckAt: '2026-10-08T11:00:00+05:30' }))?.action).toBe('WAIT_UNTIL');
    expect(decide(input(link(), { nextCheckAt: '2026-10-05T11:00:00+05:30' }))?.action).toBe('CHASE_NOW');
  });
  it('row 6: the touch limit hands the link to the owner', () => {
    expect(decide(input(link({ touchCount: 3 })))?.action).toBe('HAND_TO_ME');
  });
  it('rows 7 to 11 choose the template', () => {
    const kind = (l: PaymentLink) => {
      const d = decide(input(l));
      return `${d?.action} ${d?.templateKind} ${d?.tone}`;
    };
    expect(kind(link({ promisedDate: '2026-10-03', touchCount: 1 }))).toBe('CHASE_NOW post_promise polite');
    expect(kind(link({ acceptPartial: true, touchCount: 1 }))).toBe('CHASE_NOW part_payment polite');
    expect(kind(link())).toBe('CHASE_NOW first_reminder polite');
    expect(kind(link({ touchCount: 1 }))).toBe('CHASE_NOW follow_up polite');
    expect(kind(link({ touchCount: 2 }))).toBe('CHASE_NOW follow_up firm');
  });
});

describe('templates', () => {
  it('every template, in every language and tone, passes R09, R10 and R12 on every fixture link', () => {
    const f = generate();
    for (const l of f.links.filter((x) => x.status === 'created' || x.status === 'partially_paid')) {
      const c = f.customers.find((x) => x.id === l.customerId) as Customer;
      for (const lang of LANGS) for (const tone of TONES) for (const kind of KINDS) {
        const text = renderMessage(kind, tone, lang, { name: c.name, amountPaise: amountDuePaise(l), description: l.description, url: l.shortUrl });
        expect(validateMessage(text, l, 'sms'), `${lang} ${tone} ${kind} ${l.referenceId}`).toEqual([]);
      }
    }
  });
  it('renders the wireframe message', () => {
    expect(renderMessage('first_reminder', 'polite', 'en', { name: 'Greenleaf Cafe', amountPaise: 1250000, description: 'Logo design (Oct batch)', url: 'https://rzp.example/pay/k3x9qa' }))
      .toBe('Hi Greenleaf Cafe, a gentle reminder: ₹12,500 is pending for Logo design (Oct batch). You can pay here: https://rzp.example/pay/k3x9qa. Thank you!');
  });
});

describe('fixtures (Appendix C)', () => {
  const f = generate();
  it('are byte-identical across generations', () => {
    expect(serialise(generate())).toBe(serialise(f));
  });
  it('match the spec counts', () => {
    expect(f.customers).toHaveLength(14);
    expect(f.links).toHaveLength(30);
    const count = (p: (l: PaymentLink) => boolean) => f.links.filter(p).length;
    expect(count((l) => l.status === 'created' && isOverdue(l, NOW))).toBe(18);
    expect(count((l) => l.status === 'created' && !isOverdue(l, NOW))).toBe(1);
    expect(count((l) => l.status === 'partially_paid')).toBe(3);
    expect(count((l) => l.status === 'paid' && l.paidAt !== null)).toBe(5);
    expect(count((l) => l.status === 'expired')).toBe(3);
    expect(count((l) => l.touchCount === 1)).toBe(6);
    expect(count((l) => l.touchCount === 2)).toBe(3);
    expect(count((l) => l.touchCount === 3)).toBe(1);
    expect(count((l) => l.acceptPartial && l.amountPaise >= 500000)).toBeGreaterThanOrEqual(4);
    expect(f.customers.filter((c) => c.muted)).toHaveLength(1);
    expect(f.customers.filter((c) => c.disputed)).toHaveLength(1);
    const perCustomer = f.customers.map((c) => f.links.filter((l) => l.customerId === c.id).length);
    expect(perCustomer.filter((n) => n >= 3)).toHaveLength(3);
  });
  it('use only invented values in the allowed shapes', () => {
    for (const c of f.customers) expect(c.phone).toMatch(/^\+91 00000 000\d\d$/);
    for (const l of f.links) {
      expect(l.id).toMatch(/^plink_[A-Za-z0-9]{14}$/);
      expect(l.referenceId.length).toBeLessThanOrEqual(40);
      expect(l.shortUrl).toMatch(/^https:\/\/rzp\.example\/pay\/[a-z0-9]{6}$/);
      expect(Number.isInteger(l.amountPaise) && Number.isInteger(l.amountPaidPaise)).toBe(true);
      expect(l.amountPaise % 5000).toBe(0);
      expect(l.amountPaise).toBeGreaterThanOrEqual(80000);
      expect(l.amountPaise).toBeLessThanOrEqual(9500000);
    }
  });
  it('have one promise in the future and one passed by more than a day', () => {
    const promised = f.links.filter((l) => l.promisedDate).map((l) => l.promisedDate);
    expect(promised).toEqual(['2026-10-09', '2026-10-03']);
  });
  it('give Home at least 3 "Chase today" cards at the demo start', () => {
    const s = initialState();
    const home = buildHome({ links: s.links, customers: s.customers, replies: s.replies, settings: s.settings, nextCheckAt: {}, now: NOW });
    expect(home.chaseToday.length).toBeGreaterThanOrEqual(3);
    expect(home.chaseToday.length).toBeLessThanOrEqual(5);
    expect(home.overdueCount).toBe(21);
  });
});

describe('store', () => {
  it('a confirmed send adds one simulated touch and sets the next check two days out', () => {
    const s = initialState();
    const target = s.links.find((l) => l.status === 'created' && l.touchCount === 0) as PaymentLink;
    const next = reducer(s, {
      type: 'SEND_CONFIRMED', linkId: target.id, text: 'x', channel: 'whatsapp', lang: 'en', tone: 'polite',
      at: '2026-10-06T11:01:00+05:30', nextCheckDays: 2,
    });
    const after = next.links.find((l) => l.id === target.id) as PaymentLink;
    expect(after.touchCount).toBe(1);
    expect(after.lastTouchAt).toBe('2026-10-06T11:01:00+05:30');
    expect(next.touches.at(-1)?.simulated).toBe(true);
    expect(next.nextCheckAt[target.id]).toBe('2026-10-08T11:01:00+05:30');
    expect(next.activity[0]?.detail).toContain('SIMULATED');
  });
  it('reset puts the fixtures back but keeps settings', () => {
    let s = initialState();
    s = reducer(s, { type: 'SET_SETTINGS', patch: { timedRun: true } });
    s = reducer(s, { type: 'SEND_CONFIRMED', linkId: s.links[0]?.id as string, text: 'x', channel: 'sms', lang: 'en', tone: 'polite', at: '2026-10-06T11:01:00+05:30', nextCheckDays: 2 });
    const r = reducer(s, { type: 'RESET' });
    expect(r.links).toEqual(initialState().links);
    expect(r.settings.timedRun).toBe(true);
  });
  it('counts money paid this week (since Monday) via link', () => {
    const s = initialState();
    const paid = recoveredThisWeek(s.links, NOW);
    expect(paid.offlinePaise).toBe(0);
    expect(paid.viaLinkPaise).toBeGreaterThan(0);
  });
});

describe('instrumentation', () => {
  it('writes timings.csv from timed_end events', () => {
    const events: LoggedEvent[] = [
      { name: 'timed_start', at: '2026-10-06T11:00:00+05:30', t: 1, runId: 'run_1', data: { label: 'me' } },
      { name: 'timed_end', at: '2026-10-06T11:00:40+05:30', t: 40001, runId: 'run_1', data: { label: 'me, again', ms: 40000, taps: 3, started_at: '2026-10-06T19:00:00+05:30' } },
    ];
    expect(timingsCsv(events)).toBe('run_id,label,ms,taps,started_at\nrun_1,"me, again",40000,3,2026-10-06T19:00:00+05:30\n');
  });
});
