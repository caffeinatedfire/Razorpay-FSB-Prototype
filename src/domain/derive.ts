import { DAY_MS, addDaysToDate, istDate, istParts, parseIso } from '../clock';
import type { PaymentLink } from './types';

export function amountDuePaise(link: PaymentLink): number {
  return link.amountPaise - link.amountPaidPaise;
}

export function daysOverdue(link: PaymentLink, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - parseIso(link.dueAt).getTime()) / DAY_MS));
}

export function isOverdue(link: PaymentLink, now: Date): boolean {
  return (
    daysOverdue(link, now) >= 1 &&
    (link.status === 'created' || link.status === 'partially_paid') &&
    !link.paidOffline
  );
}

/** Monday 00:00 IST of the week containing `now`. */
export function weekStart(now: Date): Date {
  const p = istParts(now);
  const daysSinceMonday = (p.weekday + 6) % 7;
  return parseIso(addDaysToDate(istDate(now), -daysSinceMonday));
}

/** Money recovered since Monday: through the link, and marked paid offline by the owner. */
export function recoveredThisWeek(links: PaymentLink[], now: Date): { viaLinkPaise: number; offlinePaise: number } {
  const from = weekStart(now).getTime();
  const to = now.getTime();
  let viaLinkPaise = 0;
  let offlinePaise = 0;
  for (const l of links) {
    if (!l.paidAt) continue;
    const t = parseIso(l.paidAt).getTime();
    if (t < from || t > to) continue;
    if (l.paidOffline) offlinePaise += amountDuePaise(l);
    else if (l.status === 'paid') viaLinkPaise += l.amountPaidPaise;
  }
  return { viaLinkPaise, offlinePaise };
}
