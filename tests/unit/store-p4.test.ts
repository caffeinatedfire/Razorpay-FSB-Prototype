// @vitest-environment node
// Store actions added in P4: undo (R16), reply logging (S4) and the SIMULATED demo controls.
import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../src/clock';
import { buildHome, decideFor, type HomeInput } from '../../src/decide';
import { recoveredThisWeek } from '../../src/domain/derive';
import type { PaymentLink } from '../../src/domain/types';
import { initialState, reducer, type AppState } from '../../src/store';

const NOW = new FixedClock('2026-10-06T11:00:00+05:30').now();
const AT = '2026-10-06T11:01:00+05:30';
const input = (s: AppState): HomeInput => ({ links: s.links, customers: s.customers, replies: s.replies, settings: s.settings, nextCheckAt: s.nextCheckAt, now: NOW });

function firstChase(s: AppState): PaymentLink {
  const d = buildHome(input(s)).chaseToday[0];
  return s.links.find((l) => l.id === d?.linkId) as PaymentLink;
}
function send(s: AppState, linkId: string): AppState {
  return reducer(s, { type: 'SEND_CONFIRMED', linkId, text: 'x', channel: 'whatsapp', lang: 'en', tone: 'polite', at: AT, nextCheckDays: 2, sentAtMs: 1_000 });
}

describe('undo (R16)', () => {
  it('R16 undo removes the touch and puts touchCount, last touch and next check back', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = send(s0, target.id);
    const s2 = reducer(s1, { type: 'UNDO_SEND', linkId: target.id, at: AT });
    const after = s2.links.find((l) => l.id === target.id) as PaymentLink;
    expect(after.touchCount).toBe(target.touchCount);
    expect(after.lastTouchAt).toBe(target.lastTouchAt);
    expect(s2.touches).toEqual(s0.touches);
    expect(s2.nextCheckAt[target.id]).toBeUndefined();
    expect(s2.lastSend).toBeNull();
    expect(s2.activity[0]?.detail).toContain('this app only');
  });
  it('R16 undo does nothing for another link or a second time', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = send(s0, target.id);
    expect(reducer(s1, { type: 'UNDO_SEND', linkId: 'plink_other', at: AT })).toBe(s1);
    const s2 = reducer(s1, { type: 'UNDO_SEND', linkId: target.id, at: AT });
    expect(reducer(s2, { type: 'UNDO_SEND', linkId: target.id, at: AT })).toBe(s2);
  });
});

describe('log a reply (S4)', () => {
  it('a promised date moves the link to waiting until the day after (R08)', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = reducer(send(s0, target.id), { type: 'LOG_REPLY', linkId: target.id, kind: 'promised_date', promisedDate: '2026-10-09', at: AT });
    const d = decideFor(input(s1), s1.links.find((l) => l.id === target.id) as PaymentLink);
    expect(d?.action).toBe('WAIT_UNTIL');
    expect(d?.waitKind).toBe('promise');
    expect(d?.waitUntil).toBe('2026-10-10T00:00:00+05:30');
  });
  it('"disputes" marks the customer disputed and hands the link to the owner (R07)', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = reducer(s0, { type: 'LOG_REPLY', linkId: target.id, kind: 'disputes', at: AT });
    expect(s1.customers.find((c) => c.id === target.customerId)?.disputed).toBe(true);
    expect(buildHome(input(s1)).needsYou.map((d) => d.linkId)).toContain(target.id);
  });
  it('marking paid offline stops the chase and counts as paid offline this week', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = reducer(s0, { type: 'MARK_PAID_OFFLINE', linkId: target.id, at: AT });
    expect(decideFor(input(s1), s1.links.find((l) => l.id === target.id) as PaymentLink)).toBeNull();
    const later = new FixedClock('2026-10-06T12:00:00+05:30').now();
    expect(recoveredThisWeek(s1.links, later).offlinePaise).toBe(target.amountPaise - target.amountPaidPaise);
  });
  it('"no reply" sets the next check', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = reducer(s0, { type: 'LOG_REPLY', linkId: target.id, kind: 'no_reply', nextCheckAt: '2026-10-08T09:00:00+05:30', at: AT });
    expect(s1.nextCheckAt[target.id]).toBe('2026-10-08T09:00:00+05:30');
  });
});

describe('demo controls (SIMULATED)', () => {
  it('a simulated payment marks the link paid with a SIMULATED activity line', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = reducer(s0, { type: 'SIMULATE_PAYMENT', linkId: target.id, at: AT });
    const after = s1.links.find((l) => l.id === target.id) as PaymentLink;
    expect(after.status).toBe('paid');
    expect(after.amountPaidPaise).toBe(after.amountPaise);
    expect(s1.activity[0]?.kind).toBe('paid');
    expect(s1.activity[0]?.detail).toContain('SIMULATED');
    expect(buildHome(input(s1)).chaseToday.map((d) => d.linkId)).not.toContain(target.id);
  });
  it('a simulated dispute moves the link to Needs you', () => {
    const s0 = initialState();
    const target = firstChase(s0);
    const s1 = reducer(s0, { type: 'SIMULATE_DISPUTE', linkId: target.id, at: AT });
    expect(buildHome(input(s1)).needsYou.map((d) => d.linkId)).toContain(target.id);
    expect(s1.activity[0]?.detail).toContain('SIMULATED');
  });
});
