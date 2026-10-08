// Default action table from plan Appendix D2 (first matching row wins) and Home grouping (D4).

import { parseIso } from '../clock';
import { amountDuePaise, isOverdue } from '../domain/derive';
import type {
  Customer, Decision, OwnerSettings, PaymentLink, ReplyLog, TemplateKind, Tone,
} from '../domain/types';
import { chipReason, rankLink, type Reason } from '../rank';
import {
  r01QuietHours, r02TouchLimit, r03MinGap, r04Muted, r07Disputed, r08PromiseWait, r17PartPaymentAllowed, r18Expired,
  type RuleHit,
} from '../rules';

export interface DecideInput {
  link: PaymentLink;
  customer: Customer;
  customerLinks: PaymentLink[];
  lastReply: ReplyLog | null;
  settings: OwnerSettings;
  now: Date;
  /** When the owner asked to look at this link again (set on the Sent screen), ISO; null if none. */
  nextCheckAt: string | null;
}

export interface DecisionView extends Decision {
  reasonList: Reason[];
  chip: string;
  hits: RuleHit[];
  /** Why the link is waiting: a promise (R08) or the owner's next check. */
  waitKind: 'promise' | 'next_check' | null;
}

export function isSettled(link: PaymentLink): boolean {
  return link.status === 'paid' || link.status === 'cancelled' || link.paidOffline;
}

/** Row 3: links that are never chased: paid, cancelled, paid offline, or not yet overdue (D-21). */
export function isExcluded(link: PaymentLink, now: Date): boolean {
  if (isSettled(link)) return true;
  if (link.status === 'expired') return false; // row 4 handles it
  return !isOverdue(link, now);
}

export function decide(input: DecideInput): DecisionView | null {
  const { link, customer, customerLinks, lastReply, settings, now, nextCheckAt } = input;
  const ranked = rankLink(link, customerLinks, now, settings.maxTouchesPerLink);
  const base = {
    linkId: link.id,
    channel: settings.channel,
    tone: settings.tone,
    score: ranked.score,
    reasons: ranked.reasons.map((r) => r.text),
    reasonList: ranked.reasons,
    chip: chipReason(ranked.reasons),
    waitUntil: null as string | null,
    templateKind: null as TemplateKind | null,
    blocked: false,
    softBlocked: false,
    softReasons: [] as string[],
    waitKind: null as DecisionView['waitKind'],
  };
  const make = (action: Decision['action'], hits: RuleHit[], extra: Partial<DecisionView> = {}): DecisionView => ({
    ...base,
    action,
    hits,
    ruleHits: hits.map((h) => h.rule),
    blocked: hits.some((h) => h.severity === 'hard'),
    softBlocked: hits.some((h) => h.severity === 'soft'),
    softReasons: hits.filter((h) => h.severity === 'soft').map((h) => h.message),
    ...extra,
  });

  // A settled link (paid, cancelled, paid offline) is never anyone's to chase or hand over, so the
  // exclusion in row 3 is checked for settled links before rows 1 and 2 (D-21).
  if (isSettled(link)) return null;
  // 1. Muted (R04): HOLD, not shown on Home.
  const muted = r04Muted(customer);
  if (muted) return make('HOLD', [muted]);
  // 2. Disputed, or last reply "disputes" (R07): the owner takes over.
  const disputed = r07Disputed(customer, lastReply);
  if (disputed) return make('HAND_TO_ME', [disputed]);
  // 3. Not chaseable (R05): excluded.
  if (isExcluded(link, now)) return null;
  // 4. Expired (R18): reissue.
  const expired = r18Expired(link);
  if (expired) return make('REISSUE', [expired]);
  // 5. Promise not yet due (R08): wait until the day after the promised date.
  const promise = r08PromiseWait(link, customer.name, now);
  if (promise) return make('WAIT_UNTIL', [promise], { waitUntil: promise.waitUntil ?? null, waitKind: 'promise' });
  // 5b. The owner set a next check on the Sent screen and it has not arrived yet (D-21).
  if (nextCheckAt && parseIso(nextCheckAt).getTime() > now.getTime()) {
    return make('WAIT_UNTIL', [], { waitUntil: nextCheckAt, waitKind: 'next_check' });
  }
  // 6. Touch limit reached (R02): the owner takes over.
  const limit = r02TouchLimit(link, settings);
  if (limit) return make('HAND_TO_ME', [limit]);

  // Soft checks on any chase: quiet hours (R01) and the gap since this customer was last messaged (R03).
  const soft = [r01QuietHours(now, settings), r03MinGap(customerLinks, customer.name, now, settings)].filter(
    (h): h is RuleHit => h !== null,
  );
  const chase = (templateKind: TemplateKind, tone: Tone = settings.tone) =>
    make('CHASE_NOW', soft, { templateKind, tone });
  // 7. Promise passed and at least one touch.
  if (link.promisedDate && link.touchCount >= 1) return chase('post_promise');
  // 8. Part payment allowed (R17).
  if (r17PartPaymentAllowed(link)) return chase('part_payment');
  // 9 to 11. By touch count.
  if (link.touchCount === 0) return chase('first_reminder');
  if (link.touchCount === 1) return chase('follow_up', 'polite');
  return chase('follow_up', 'firm');
}

export interface HomeView {
  chaseToday: DecisionView[];      // CHASE_NOW, not hard-blocked, by score, at most 5
  needsYou: DecisionView[];        // HAND_TO_ME and REISSUE
  waiting: DecisionView[];         // WAIT_UNTIL, soonest first
  owedPaise: number;               // across overdue links
  overdueCount: number;
}

export interface HomeInput {
  links: PaymentLink[];
  customers: Customer[];
  replies: ReplyLog[];
  settings: OwnerSettings;
  nextCheckAt: Record<string, string>;
  now: Date;
}

export function lastReplyFor(replies: ReplyLog[], linkId: string): ReplyLog | null {
  const mine = replies.filter((r) => r.linkId === linkId);
  if (mine.length === 0) return null;
  return mine.reduce((a, b) => (parseIso(b.loggedAt).getTime() >= parseIso(a.loggedAt).getTime() ? b : a));
}

export function decideFor(input: HomeInput, link: PaymentLink): DecisionView | null {
  const customer = input.customers.find((c) => c.id === link.customerId);
  if (!customer) return null;
  return decide({
    link,
    customer,
    customerLinks: input.links.filter((l) => l.customerId === link.customerId),
    lastReply: lastReplyFor(input.replies, link.id),
    settings: input.settings,
    now: input.now,
    nextCheckAt: input.nextCheckAt[link.id] ?? null,
  });
}

export const CHASE_TODAY_MAX = 5;

export function buildHome(input: HomeInput): HomeView {
  const decisions = input.links
    .map((l) => decideFor(input, l))
    .filter((d): d is DecisionView => d !== null);
  const chaseToday = decisions
    .filter((d) => d.action === 'CHASE_NOW' && !d.blocked)
    .sort((a, b) => b.score - a.score || a.linkId.localeCompare(b.linkId))
    .slice(0, CHASE_TODAY_MAX);
  const needsYou = decisions.filter((d) => d.action === 'HAND_TO_ME' || d.action === 'REISSUE');
  const waiting = decisions
    .filter((d) => d.action === 'WAIT_UNTIL')
    .sort((a, b) => (a.waitUntil ?? '').localeCompare(b.waitUntil ?? ''));
  const overdue = input.links.filter((l) => isOverdue(l, input.now));
  return {
    chaseToday,
    needsYou,
    waiting,
    owedPaise: overdue.reduce((s, l) => s + amountDuePaise(l), 0),
    overdueCount: overdue.length,
  };
}
