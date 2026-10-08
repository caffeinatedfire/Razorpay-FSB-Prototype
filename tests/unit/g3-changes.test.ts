// @vitest-environment node
// Changes agreed at G3: sender sign-off (D-26), tone labels (D-27), tap counting (D-28), Hindi danda (D-31).
import { describe, expect, it } from 'vitest';
import { amountDuePaise } from '../../src/domain/derive';
import type { Customer } from '../../src/domain/types';
import { eventsCsv, isTap } from '../../src/instrumentation';
import { findUrls, validateMessage } from '../../src/rules';
import { DEFAULT_OWNER, initialState, reducer } from '../../src/store';
import { KINDS, LANGS, TEMPLATES, TONE_LABELS, TONES, renderMessage, signOff } from '../../src/templates';
import { generate } from '../../scripts/gen-fixtures';

const slots = { name: 'Riya', amountPaise: 1250000, description: 'Catering advance', url: 'https://rzp.example/pay/k3x9qa' };

describe('sender sign-off (D-26)', () => {
  it('ends every message with the owner and business', () => {
    for (const lang of LANGS) {
      const text = renderMessage('first_reminder', 'polite', lang, { ...slots, owner: 'Asha', business: 'Brightline Studio' });
      expect(text.endsWith(' – Asha, Brightline Studio')).toBe(true);
    }
  });
  it('drops blank parts and adds nothing when both are blank', () => {
    expect(signOff('Asha', '')).toBe('– Asha');
    expect(signOff('', 'Brightline Studio')).toBe('– Brightline Studio');
    expect(signOff(' ', '')).toBe('');
    expect(renderMessage('first_reminder', 'polite', 'en', slots).endsWith('Thank you!')).toBe(true);
  });
  it('keeps every template, signed with the longest allowed names, within R09, R10 and R12 on every fixture link', () => {
    const f = generate();
    const owner = 'O'.repeat(30);
    const business = 'B'.repeat(40);
    for (const l of f.links.filter((x) => x.status === 'created' || x.status === 'partially_paid')) {
      const c = f.customers.find((x) => x.id === l.customerId) as Customer;
      for (const lang of LANGS) for (const tone of TONES) for (const kind of KINDS) {
        const text = renderMessage(kind, tone, lang, { name: c.name, amountPaise: amountDuePaise(l), description: l.description, url: l.shortUrl, owner, business });
        expect(validateMessage(text, l, 'sms'), `${lang} ${tone} ${kind} ${l.referenceId}`).toEqual([]);
      }
    }
  });
  it('the store has a synthetic default owner, caps the lengths and keeps names on reset', () => {
    let s = initialState();
    expect(s.owner).toEqual(DEFAULT_OWNER);
    s = reducer(s, { type: 'SET_OWNER', patch: { name: 'x'.repeat(50) } });
    expect(s.owner.name).toHaveLength(30);
    expect(reducer(s, { type: 'RESET' }).owner.name).toHaveLength(30);
  });
});

describe('tone labels (D-27)', () => {
  it('read Gentle and Firm', () => {
    expect(TONE_LABELS).toEqual({ polite: 'Gentle', firm: 'Firm' });
  });
});

describe('Hindi danda after the link (D-31)', () => {
  it('has a space between the link and "।" in every Hindi template', () => {
    for (const v of Object.values(TEMPLATES.hi)) {
      for (const t of [v.polite, v.firm].filter(Boolean) as string[]) {
        expect(t).toContain('{url} ।');
        expect(t).not.toContain('{url}।');
      }
    }
    const text = renderMessage('first_reminder', 'polite', 'hi', slots);
    expect(text.split(/\s+/)).toContain(slots.url);
    expect(findUrls(text)).toEqual([slots.url]);
  });
});

describe('tap counting (D-28)', () => {
  it('counts a press released within 10 px as a tap, and a scroll as no tap', () => {
    expect(isTap(100, 100, 100, 100)).toBe(true);
    expect(isTap(100, 100, 106, 108)).toBe(true);
    expect(isTap(100, 100, 100, 160)).toBe(false);
  });
  it('exports the event list as CSV', () => {
    const csv = eventsCsv([{ name: 'timed_end', at: '2026-10-06T11:00:40+05:30', t: 5, runId: 'run_1', data: { taps: 3, targets: 'Chase X | Send on WhatsApp' } }]);
    expect(csv.split('\n')[0]).toBe('run_id,name,at,t,data');
    expect(csv).toContain('run_1,timed_end,2026-10-06T11:00:40+05:30,5,');
    expect(csv).toContain('Send on WhatsApp');
  });
});
