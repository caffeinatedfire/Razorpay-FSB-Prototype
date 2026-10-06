// Rules from plan Appendix D1. Each is a pure function: it returns null when the rule passes,
// or a RuleHit when it fires. "hard" blocks the action; "soft" warns and needs a confirm tap.
// Time-based rules take `now` from the injected Clock (R14); money is integer paise (R13).

import { addDaysToDate, formatDayShort, parseIso } from '../clock';
import { amountDuePaise } from '../domain/derive';
import type { Channel, Customer, OwnerSettings, PaymentLink, ReplyLog } from '../domain/types';
import { formatINR } from '../format';

export type RuleId =
  | 'R01' | 'R02' | 'R03' | 'R04' | 'R05' | 'R06' | 'R07' | 'R08' | 'R09'
  | 'R10' | 'R11' | 'R12' | 'R13' | 'R14' | 'R15' | 'R16' | 'R17' | 'R18';

export interface RuleHit {
  rule: RuleId;
  severity: 'hard' | 'soft';
  message: string;
  /** For waits (R08): when chasing may resume, ISO. */
  waitUntil?: string;
}

export const LENGTH_LIMITS: Record<Channel, number> = { whatsapp: 500, sms: 320 };

/** R02 (hard): at most `maxTouchesPerLink` touches per link; the next chase becomes HAND_TO_ME. */
export function r02TouchLimit(link: PaymentLink, settings: Pick<OwnerSettings, 'maxTouchesPerLink'>): RuleHit | null {
  if (link.touchCount < settings.maxTouchesPerLink) return null;
  return {
    rule: 'R02', severity: 'hard',
    message: `${link.touchCount} of ${settings.maxTouchesPerLink} reminders sent. Time for a call from you.`,
  };
}

/** R04 (hard): a muted customer gets no chase. */
export function r04Muted(customer: Customer): RuleHit | null {
  return customer.muted ? { rule: 'R04', severity: 'hard', message: 'You muted this customer. Collect will not chase them.' } : null;
}

/** R05 (hard): only `created` or `partially_paid` links are chased; paid, cancelled and paid-offline links are not. */
export function r05Chaseable(link: PaymentLink): RuleHit | null {
  if ((link.status === 'created' || link.status === 'partially_paid') && !link.paidOffline) return null;
  return { rule: 'R05', severity: 'hard', message: 'Only unpaid links can be chased.' };
}

/**
 * R06 (hard): the link is re-read at send. If its status (or paid amount) changed since the
 * card was opened, the send is aborted with a plain message.
 */
export function r06StatusAtSend(opened: PaymentLink, current: PaymentLink): RuleHit | null {
  if (current.status === 'paid' || current.paidOffline) {
    return { rule: 'R06', severity: 'hard', message: 'Already paid. Nothing to send.' };
  }
  if (current.status === 'expired') {
    return { rule: 'R06', severity: 'hard', message: 'This link has expired. Create a fresh link instead.' };
  }
  if (current.status === 'cancelled') {
    return { rule: 'R06', severity: 'hard', message: 'This link was cancelled. Nothing to send.' };
  }
  if (current.status !== opened.status || current.amountPaidPaise !== opened.amountPaidPaise) {
    return {
      rule: 'R06', severity: 'hard',
      message: `A payment arrived. ${formatINR(amountDuePaise(current))} is now due. Check the message.`,
    };
  }
  return null;
}

/** R07 (hard): a disputed customer, or a last reply of "disputes", means no chase; the owner takes over. */
export function r07Disputed(customer: Customer, lastReply: ReplyLog | null): RuleHit | null {
  if (customer.disputed || lastReply?.kind === 'disputes') {
    return { rule: 'R07', severity: 'hard', message: `${customer.name} disputes this. Talk to them yourself.` };
  }
  return null;
}

/** R08 (soft): after a promised date, no chase before promisedDate plus 1 day. The owner may chase anyway. */
export function r08PromiseWait(link: PaymentLink, customerName: string, now: Date): RuleHit | null {
  if (!link.promisedDate) return null;
  const resume = addDaysToDate(link.promisedDate, 1);
  const resumeAt = parseIso(resume);
  if (now.getTime() >= resumeAt.getTime()) return null;
  return {
    rule: 'R08', severity: 'soft',
    message: `${customerName} promised to pay by ${formatDayShort(parseIso(link.promisedDate))}. Chase anyway?`,
    waitUntil: `${resume}T00:00:00+05:30`,
  };
}

const AMOUNT_RE = /₹\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?/g;

/** R09 (hard): the message shows the amount due, formatted, and every amount in it equals the amount due. */
export function r09AmountShown(text: string, link: PaymentLink): RuleHit | null {
  const due = formatINR(amountDuePaise(link));
  const found = text.match(AMOUNT_RE) ?? [];
  if (found.length > 0 && found.every((a) => a === due)) return null;
  return { rule: 'R09', severity: 'hard', message: `The message must show the amount due: ${due}.` };
}

const URL_RE = /(?:https?:\/\/|www\.)[^\s]+/gi;

/** URLs in a message, with trailing punctuation (including the Devanagari danda) removed. */
export function findUrls(text: string): string[] {
  return (text.match(URL_RE) ?? []).map((u) => u.replace(/[.,!?;:)\]'"।]+$/u, ''));
}

/** R10 (hard): the message contains exactly one URL and it equals the link's shortUrl. */
export function r10OneUrl(text: string, link: PaymentLink): RuleHit | null {
  const urls = findUrls(text);
  if (urls.length === 1 && urls[0] === link.shortUrl) return null;
  return { rule: 'R10', severity: 'hard', message: 'The message must include the payment link exactly once.' };
}

/** Message length in characters as a person counts them (code points). */
export function messageLength(text: string): number {
  return [...text].length;
}

/** R12 (hard): WhatsApp 500 characters, SMS 320. */
export function r12Length(text: string, channel: Channel): RuleHit | null {
  const n = messageLength(text);
  const limit = LENGTH_LIMITS[channel];
  if (n <= limit) return null;
  const name = channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
  return { rule: 'R12', severity: 'hard', message: `Too long for ${name}: ${n} of ${limit}.` };
}

/** R13 (hard): money is integer paise. */
export function r13IntegerPaise(paise: number): RuleHit | null {
  return Number.isSafeInteger(paise) ? null : { rule: 'R13', severity: 'hard', message: `Money must be integer paise, got ${paise}.` };
}

/** R17 (hard): the part-payment template only when acceptPartial, at least ₹5,000 due, and at least one touch. */
export const PART_PAYMENT_MIN_PAISE = 500_000;
export function r17PartPaymentAllowed(link: PaymentLink): boolean {
  return link.acceptPartial && amountDuePaise(link) >= PART_PAYMENT_MIN_PAISE && link.touchCount >= 1;
}

/** R18 (hard): an expired link is reissued, never extended or cancelled by the app. */
export function r18Expired(link: PaymentLink): RuleHit | null {
  return link.status === 'expired'
    ? { rule: 'R18', severity: 'hard', message: 'This link has expired. Create a fresh link instead.' }
    : null;
}

/** The hard message checks run before every send (R09, R10, R12). */
export function validateMessage(text: string, link: PaymentLink, channel: Channel): RuleHit[] {
  return [r09AmountShown(text, link), r10OneUrl(text, link), r12Length(text, channel)].filter(
    (h): h is RuleHit => h !== null,
  );
}
