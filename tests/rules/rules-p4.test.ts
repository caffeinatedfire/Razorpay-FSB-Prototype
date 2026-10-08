// @vitest-environment node
// Rules added in P4, titled by rule ID, plus the template checks P4-A04 and P4-A05.
import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../src/clock';
import type { PaymentLink } from '../../src/domain/types';
import {
  BANNED, findBanned, formatHhmm, nextWindowStart, r01QuietHours, r03MinGap, r11BannedLanguage, r16CanUndo,
  validateMessage,
} from '../../src/rules';
import { DEFAULT_SETTINGS } from '../../src/store';
import { KINDS, LANGS, TONES, renderMessage } from '../../src/templates';

const at = (iso: string) => new FixedClock(iso).now();
function link(over: Partial<PaymentLink> = {}): PaymentLink {
  return {
    id: 'plink_TESTTESTTEST01', referenceId: 'INV-TEST-001', customerId: 'cust_01',
    amountPaise: 1250000, amountPaidPaise: 0, currency: 'INR', status: 'created',
    createdAt: '2026-09-20T10:00:00+05:30', dueAt: '2026-09-27T10:00:00+05:30', expireBy: null, paidAt: null,
    acceptPartial: false, shortUrl: 'https://rzp.example/pay/k3x9qa', description: 'Logo design (Oct batch)',
    touchCount: 0, lastTouchAt: null, promisedDate: null, paidOffline: false, ...over,
  };
}

describe('rules added in P4', () => {
  it('R01 lets a send through inside the 09:00 to 21:00 IST window', () => {
    expect(r01QuietHours(at('2026-10-06T09:00:00+05:30'), DEFAULT_SETTINGS)).toBeNull();
    expect(r01QuietHours(at('2026-10-06T20:59:00+05:30'), DEFAULT_SETTINGS)).toBeNull();
  });
  it('R01 warns outside the window and offers the next 9:00 AM', () => {
    const late = r01QuietHours(at('2026-10-06T22:30:00+05:30'), DEFAULT_SETTINGS);
    expect(late?.severity).toBe('soft');
    expect(late?.message).toBe('It is 10:30 PM. Most people prefer payment messages in the daytime.');
    expect(late?.waitUntil).toBe('2026-10-07T09:00:00+05:30');
    expect(r01QuietHours(at('2026-10-07T06:00:00+05:30'), DEFAULT_SETTINGS)?.waitUntil).toBe('2026-10-07T09:00:00+05:30');
    // 22:30 IST is 17:00 UTC: the rule must read IST, not UTC.
    expect(r01QuietHours(at('2026-10-06T17:00:00Z'), DEFAULT_SETTINGS)).not.toBeNull();
    expect(nextWindowStart(at('2026-10-06T21:00:00+05:30'), '09:00')).toBe('2026-10-07T09:00:00+05:30');
    expect(formatHhmm('09:00')).toBe('9:00 AM');
  });

  it('R03 allows a chase when the customer was last messaged 48 hours ago or more', () => {
    const links = [link({ lastTouchAt: '2026-10-04T11:00:00+05:30' }), link({ id: 'b', lastTouchAt: null })];
    expect(r03MinGap(links, 'Riya', at('2026-10-06T11:00:00+05:30'), DEFAULT_SETTINGS)).toBeNull();
    expect(r03MinGap([link()], 'Riya', at('2026-10-06T11:00:00+05:30'), DEFAULT_SETTINGS)).toBeNull();
  });
  it('R03 warns when any of the customer\'s links was touched under 48 hours ago', () => {
    const links = [link({ lastTouchAt: '2026-10-01T11:00:00+05:30' }), link({ id: 'b', lastTouchAt: '2026-10-05T15:00:00+05:30' })];
    const hit = r03MinGap(links, 'Riya', at('2026-10-06T11:00:00+05:30'), DEFAULT_SETTINGS);
    expect(hit?.severity).toBe('soft');
    expect(hit?.message).toBe('You messaged Riya 20 hours ago. Wait a little longer?');
    expect(hit?.waitUntil).toBe('2026-10-07T15:00:00+05:30');
  });

  it('R11 passes friendly owner edits, including words that merely contain a banned word', () => {
    expect(r11BannedLanguage('Hi Riya, a quick reminder, thank you for your courtesy!')).toBeNull();
    expect(r11BannedLanguage('Please pay before the fire sale ends')).toBeNull();
  });
  it('R11 warns on banned words in English, Hinglish and Hindi, ignoring case', () => {
    expect(r11BannedLanguage('This is your LAST WARNING')?.message).toBe('This could read as a threat. Try a friendlier wording.');
    expect(findBanned('pay now or else')).toBe('or else');
    expect(findBanned('warna kanooni kaarvai hogi')).toBe('kanooni');
    expect(findBanned('वरना पुलिस को बताएँगे')).toBe('पुलिस');
    expect(findBanned('Filed an fir today')).toBe('fir');
  });

  it('R16 allows undo within 10 seconds of the send', () => {
    expect(r16CanUndo(1_000, 1_000)).toBe(true);
    expect(r16CanUndo(1_000, 11_000)).toBe(true);
  });
  it('R16 refuses undo after 10 seconds', () => {
    expect(r16CanUndo(1_000, 11_001)).toBe(false);
    expect(r16CanUndo(5_000, 1_000)).toBe(false);
  });
});

describe('templates (P4-A04, P4-A05)', () => {
  const slots = { name: 'Riya', amountPaise: 1250000, description: 'Catering advance', url: 'https://rzp.example/pay/k3x9qa', owner: 'Asha', business: 'Brightline Studio' };
  it('R11 every template, in every language and tone, uses no banned word', () => {
    for (const lang of LANGS) for (const tone of TONES) for (const kind of KINDS) {
      const text = renderMessage(kind, tone, lang, slots);
      expect(findBanned(text), `${lang} ${tone} ${kind}`).toBeNull();
    }
    expect(Object.values(BANNED).flat().length).toBe(26);
  });
  it('the Hindi template renders Devanagari and passes R09, R10 and R12', () => {
    for (const tone of TONES) for (const kind of KINDS) {
      const text = renderMessage(kind, tone, 'hi', slots);
      expect(text).toMatch(/[ऀ-ॿ]/);
      expect(validateMessage(text, link(), 'whatsapp')).toEqual([]);
      expect(validateMessage(text, link(), 'sms')).toEqual([]);
    }
  });
});
