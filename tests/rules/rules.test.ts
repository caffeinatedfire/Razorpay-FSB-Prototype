// @vitest-environment node
// Rule tests, titled by rule ID (plan Appendix D1). Each rule has a passing and a failing case.
import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FixedClock } from '../../src/clock';
import { daysOverdue } from '../../src/domain/derive';
import type { Customer, PaymentLink, ReplyLog } from '../../src/domain/types';
import { formatINR } from '../../src/format';
import {
  r02TouchLimit, r04Muted, r05Chaseable, r06StatusAtSend, r07Disputed, r08PromiseWait, r09AmountShown,
  r10OneUrl, r12Length, r13IntegerPaise, r17PartPaymentAllowed, r18Expired,
} from '../../src/rules';
import { renderMessage } from '../../src/templates';

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
function customer(over: Partial<Customer> = {}): Customer {
  return { id: 'cust_01', name: 'Greenleaf Cafe', phone: '+91 00000 00001', muted: false, disputed: false, tags: [], ...over };
}
const message = (l: PaymentLink) =>
  renderMessage('first_reminder', 'polite', 'en', { name: 'Greenleaf Cafe', amountPaise: l.amountPaise - l.amountPaidPaise, description: l.description, url: l.shortUrl });

describe('rules', () => {
  it('R02 allows a chase below the touch limit', () => {
    expect(r02TouchLimit(link({ touchCount: 2 }), { maxTouchesPerLink: 3 })).toBeNull();
  });
  it('R02 hands the link to the owner at the touch limit', () => {
    const hit = r02TouchLimit(link({ touchCount: 3 }), { maxTouchesPerLink: 3 });
    expect(hit?.severity).toBe('hard');
  });

  it('R04 chases a customer who is not muted', () => {
    expect(r04Muted(customer())).toBeNull();
  });
  it('R04 does not chase a muted customer', () => {
    expect(r04Muted(customer({ muted: true }))?.severity).toBe('hard');
  });

  it('R05 chases created and partially paid links', () => {
    expect(r05Chaseable(link())).toBeNull();
    expect(r05Chaseable(link({ status: 'partially_paid', amountPaidPaise: 100000 }))).toBeNull();
  });
  it('R05 does not chase a paid, cancelled, expired or paid-offline link', () => {
    expect(r05Chaseable(link({ status: 'paid' }))).not.toBeNull();
    expect(r05Chaseable(link({ status: 'cancelled' }))).not.toBeNull();
    expect(r05Chaseable(link({ status: 'expired' }))).not.toBeNull();
    expect(r05Chaseable(link({ paidOffline: true }))).not.toBeNull();
  });

  it('R06 lets the send through when the status has not changed', () => {
    expect(r06StatusAtSend(link(), link())).toBeNull();
  });
  it('R06 aborts with "Already paid" when the link was paid after the card opened', () => {
    const hit = r06StatusAtSend(link(), link({ status: 'paid', amountPaidPaise: 1250000 }));
    expect(hit?.message).toBe('Already paid. Nothing to send.');
  });
  it('R06 aborts with "This link has expired" when it expired after the card opened', () => {
    expect(r06StatusAtSend(link(), link({ status: 'expired' }))?.message).toBe('This link has expired. Create a fresh link instead.');
  });
  it('R06 aborts when a part payment arrived after the card opened', () => {
    const hit = r06StatusAtSend(link(), link({ status: 'partially_paid', amountPaidPaise: 500000 }));
    expect(hit?.severity).toBe('hard');
    expect(hit?.message).toContain('₹7,500');
  });

  it('R07 chases a customer with no dispute', () => {
    expect(r07Disputed(customer(), null)).toBeNull();
  });
  it('R07 hands a disputed customer, or a last reply of "disputes", to the owner', () => {
    expect(r07Disputed(customer({ disputed: true }), null)?.severity).toBe('hard');
    const reply: ReplyLog = { id: 'r1', linkId: 'plink_TESTTESTTEST01', kind: 'disputes', promisedDate: null, loggedAt: '2026-10-05T10:00:00+05:30' };
    expect(r07Disputed(customer(), reply)?.severity).toBe('hard');
  });

  it('R08 allows a chase from the day after the promised date', () => {
    expect(r08PromiseWait(link({ promisedDate: '2026-10-03' }), 'Arjun', NOW)).toBeNull();
    expect(r08PromiseWait(link({ promisedDate: '2026-10-05' }), 'Arjun', NOW)).toBeNull();
  });
  it('R08 warns before the day after the promised date, and says when to resume', () => {
    const hit = r08PromiseWait(link({ promisedDate: '2026-10-09' }), 'Meera', NOW);
    expect(hit?.severity).toBe('soft');
    expect(hit?.message).toBe('Meera promised to pay by Fri 9 Oct. Chase anyway?');
    expect(hit?.waitUntil).toBe('2026-10-10T00:00:00+05:30');
    // On the promised day itself, still waiting.
    expect(r08PromiseWait(link({ promisedDate: '2026-10-06' }), 'Meera', NOW)).not.toBeNull();
  });

  it('R09 passes a message that shows the amount due', () => {
    const l = link();
    expect(r09AmountShown(message(l), l)).toBeNull();
    const part = link({ status: 'partially_paid', amountPaidPaise: 500000 });
    expect(r09AmountShown(message(part), part)).toBeNull();
  });
  it('R09 blocks a message with no amount or a different amount', () => {
    const l = link();
    expect(r09AmountShown('Hi, please pay here: https://rzp.example/pay/k3x9qa', l)?.message).toBe('The message must show the amount due: ₹12,500.');
    expect(r09AmountShown(message(l).replace('₹12,500', '₹1,250'), l)).not.toBeNull();
    expect(r09AmountShown(`${message(l)} Also ₹500 extra.`, l)).not.toBeNull();
  });

  it('R10 passes a message with the link exactly once', () => {
    const l = link();
    expect(r10OneUrl(message(l), l)).toBeNull();
    const hi = renderMessage('first_reminder', 'polite', 'hi', { name: 'x', amountPaise: 1250000, description: 'y', url: l.shortUrl });
    expect(r10OneUrl(hi, l)).toBeNull();
  });
  it('R10 blocks a message with no link, two links, or a different link', () => {
    const l = link();
    expect(r10OneUrl('Hi, ₹12,500 is pending.', l)?.message).toBe('The message must include the payment link exactly once.');
    expect(r10OneUrl(`${message(l)} ${l.shortUrl}`, l)).not.toBeNull();
    expect(r10OneUrl(message(l).replace(l.shortUrl, 'https://example.com/pay'), l)).not.toBeNull();
    expect(r10OneUrl(`${message(l)} www.example.com`, l)).not.toBeNull();
  });

  it('R12 passes messages within the WhatsApp and SMS limits', () => {
    expect(r12Length('a'.repeat(500), 'whatsapp')).toBeNull();
    expect(r12Length('a'.repeat(320), 'sms')).toBeNull();
    expect(r12Length('क'.repeat(320), 'sms')).toBeNull();
  });
  it('R12 blocks messages over the limit', () => {
    expect(r12Length('a'.repeat(501), 'whatsapp')?.message).toBe('Too long for WhatsApp: 501 of 500.');
    expect(r12Length('a'.repeat(321), 'sms')?.message).toBe('Too long for SMS: 321 of 320.');
  });

  it('R13 formats integer paise', () => {
    expect(r13IntegerPaise(1250000)).toBeNull();
    expect(formatINR(1250000)).toBe('₹12,500');
  });
  it('R13 rejects floats', () => {
    expect(r13IntegerPaise(12500.5)?.severity).toBe('hard');
    expect(() => formatINR(12500.5)).toThrow();
  });

  it('R14 time rules read the injected clock in IST', () => {
    const l = link();
    expect(daysOverdue(l, new FixedClock('2026-10-06T11:00:00+05:30').now())).toBe(9);
    expect(daysOverdue(l, new FixedClock('2026-10-07T09:59:00+05:30').now())).toBe(9);
    expect(daysOverdue(l, new FixedClock('2026-10-07T10:00:00+05:30').now())).toBe(10);
    // 23:30 IST on the promised day is still the promised day in India (18:00 UTC).
    expect(r08PromiseWait(link({ promisedDate: '2026-10-09' }), 'Meera', new FixedClock('2026-10-09T23:30:00+05:30').now())).not.toBeNull();
    expect(r08PromiseWait(link({ promisedDate: '2026-10-09' }), 'Meera', new FixedClock('2026-10-10T00:00:00+05:30').now())).toBeNull();
  });
  it('R14 the guard fails on a system clock read outside src/clock.ts', () => {
    const dir = mkdtempSync(join(tmpdir(), 'collect-r14-'));
    try {
      mkdirSync(join(dir, 'src'), { recursive: true });
      writeFileSync(join(dir, 'src', 'rule.ts'), 'export const t = Date' + '.now();\n');
      const r = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'guard.mjs'), '--root', dir], { encoding: 'utf8' });
      expect(r.status).not.toBe(0);
      expect(r.stderr).toContain('R14');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('R17 offers the part-payment template when partial is allowed, ₹5,000 or more is due and one touch was sent', () => {
    expect(r17PartPaymentAllowed(link({ acceptPartial: true, touchCount: 1, amountPaise: 500000 }))).toBe(true);
  });
  it('R17 does not offer it without acceptPartial, under ₹5,000 due, or before the first touch', () => {
    expect(r17PartPaymentAllowed(link({ acceptPartial: false, touchCount: 1 }))).toBe(false);
    expect(r17PartPaymentAllowed(link({ acceptPartial: true, touchCount: 1, amountPaise: 499950 }))).toBe(false);
    expect(r17PartPaymentAllowed(link({ acceptPartial: true, touchCount: 0 }))).toBe(false);
    expect(r17PartPaymentAllowed(link({ acceptPartial: true, touchCount: 1, amountPaise: 600000, amountPaidPaise: 200000 }))).toBe(false);
  });

  it('R18 leaves a live link alone', () => {
    expect(r18Expired(link())).toBeNull();
  });
  it('R18 marks an expired link for reissue', () => {
    expect(r18Expired(link({ status: 'expired' }))?.message).toBe('This link has expired. Create a fresh link instead.');
  });
});
