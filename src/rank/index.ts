// Ranking from plan Appendix D3. The weights are placeholders (assumption A8, `assumed`):
// score = amountDuePaise × pPay(daysOverdue) × historyFactor. Every score carries plain-English reasons.

import { DAY_MS, HOUR_MS, addDaysToDate, formatDayShort, parseIso } from '../clock';
import { amountDuePaise, daysOverdue } from '../domain/derive';
import type { PaymentLink } from '../domain/types';
import { formatINR } from '../format';

/** Chance-to-pay weight by days overdue (assumed). */
export function pPay(days: number): number {
  if (days <= 3) return 0.5;
  if (days <= 7) return 0.4;
  if (days <= 14) return 0.3;
  if (days <= 30) return 0.2;
  return 0.1;
}

export type HistoryKind = 'prompt' | 'late' | 'none';

/**
 * Looks at the customer's last 3 paid links (by paid time).
 * 'prompt' (×1.2): all 3 paid within 3 days of the due date.
 * 'late' (×0.9): two or more of them paid more than 14 days late.
 */
export function paymentHistory(customerLinks: PaymentLink[]): HistoryKind {
  const paid = customerLinks
    .filter((l) => l.status === 'paid' && l.paidAt)
    .sort((a, b) => parseIso(b.paidAt as string).getTime() - parseIso(a.paidAt as string).getTime())
    .slice(0, 3);
  const lateDays = paid.map((l) => (parseIso(l.paidAt as string).getTime() - parseIso(l.dueAt).getTime()) / DAY_MS);
  if (paid.length === 3 && lateDays.every((d) => d <= 3)) return 'prompt';
  if (lateDays.filter((d) => d > 14).length >= 2) return 'late';
  return 'none';
}

export function historyFactor(kind: HistoryKind): number {
  return kind === 'prompt' ? 1.2 : kind === 'late' ? 0.9 : 1.0;
}

export type ReasonKind = 'due' | 'history' | 'touch' | 'promise' | 'partial';
export interface Reason { kind: ReasonKind; text: string }

export interface Ranked {
  score: number;
  reasons: Reason[];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function sinceText(from: Date, now: Date): string {
  const ms = now.getTime() - from.getTime();
  if (ms < HOUR_MS) return 'less than an hour ago';
  if (ms < DAY_MS) return `${plural(Math.floor(ms / HOUR_MS), 'hour', 'hours')} ago`;
  return `${plural(Math.floor(ms / DAY_MS), 'day', 'days')} ago`;
}

export function rankLink(
  link: PaymentLink,
  customerLinks: PaymentLink[],
  now: Date,
  maxTouches: number,
): Ranked {
  const due = amountDuePaise(link);
  const days = daysOverdue(link, now);
  const hist = paymentHistory(customerLinks);
  const score = due * pPay(days) * historyFactor(hist);

  const reasons: Reason[] = [
    { kind: 'due', text: `${formatINR(due)} due, ${plural(days, 'day', 'days')} overdue` },
  ];
  if (link.promisedDate) {
    const d = formatDayShort(parseIso(link.promisedDate));
    const passed = now.getTime() >= parseIso(addDaysToDate(link.promisedDate, 1)).getTime();
    reasons.push({ kind: 'promise', text: passed ? `They promised to pay by ${d}` : `They promised to pay ${d}` });
  }
  if (hist === 'prompt') reasons.push({ kind: 'history', text: 'Paid their last 3 links within 3 days' });
  if (hist === 'late') reasons.push({ kind: 'history', text: 'Paid 2 of their last links more than 14 days late' });
  if (link.amountPaidPaise > 0) reasons.push({ kind: 'partial', text: `${formatINR(link.amountPaidPaise)} already paid` });
  reasons.push({
    kind: 'touch',
    text: link.lastTouchAt
      ? `You messaged them ${sinceText(parseIso(link.lastTouchAt), now)} (${link.touchCount} of ${maxTouches})`
      : 'No reminder sent yet',
  });
  return { score, reasons };
}

/** The one reason shown as a chip on a Home card: the most telling one, else the amount and age. */
export function chipReason(reasons: Reason[]): string {
  const order: ReasonKind[] = ['promise', 'history', 'partial', 'touch'];
  for (const k of order) {
    const r = reasons.find((x) => x.kind === k);
    if (r && !(k === 'touch' && r.text === 'No reminder sent yet')) return r.text;
  }
  return reasons[0]?.text ?? '';
}
