// Synthetic fixtures (plan Appendix C). Seeded mulberry32, seed 7: the output is byte-identical
// on every run. Every name, business, phone number and URL here is invented.
//
//   npm run fixtures:gen      writes fixtures/links.synthetic.json
//   npm run fixtures:verify   prints the SHA-256 of two generations (and of the file on disk)

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DAY_MS, DEMO_START_ISO, HOUR_MS, addMs, istDate, parseIso, toIstIso } from '../src/clock';
import type { Customer, PaymentLink, ReplyLog, Touch } from '../src/domain/types';
import { renderMessage } from '../src/templates';

const SEED = 7;
const OUT = join(process.cwd(), 'fixtures', 'links.synthetic.json');

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Customers: invented first names and invented business names.
const CUSTOMERS: Array<Pick<Customer, 'name' | 'muted' | 'disputed' | 'tags'>> = [
  { name: 'Greenleaf Cafe', muted: false, disputed: false, tags: ['regular'] },
  { name: 'Nova Dental Clinic', muted: false, disputed: false, tags: [] },
  { name: 'Kiran', muted: false, disputed: false, tags: [] },
  { name: 'Brightpath Tutors', muted: false, disputed: false, tags: ['regular'] },
  { name: 'Lotus Boutique', muted: true, disputed: false, tags: [] },
  { name: 'Sunrise Events', muted: false, disputed: true, tags: [] },
  { name: 'Meera', muted: false, disputed: false, tags: [] },
  { name: 'Arjun', muted: false, disputed: false, tags: [] },
  { name: 'Pixelcraft Studio', muted: false, disputed: false, tags: [] },
  { name: 'Harbor Logistics', muted: false, disputed: false, tags: [] },
  { name: 'Anand', muted: false, disputed: false, tags: [] },
  { name: 'Spice Route Caterers', muted: false, disputed: false, tags: ['regular'] },
  { name: 'Riya', muted: false, disputed: false, tags: [] },
  { name: 'Blue Door Bakery', muted: false, disputed: false, tags: [] },
];

const DESCRIPTIONS = [
  'Logo design (Oct batch)',
  'Tuition fees for September',
  'Catering advance',
  'Monthly bookkeeping',
  'Website updates (September)',
  'Birthday cake order',
  'Photo shoot deposit',
  'Office lunch for 25',
  'Yoga classes, September',
  'Packaging labels print run',
  'Interior sketches, phase 1',
  'Event decor balance',
];

type Kind = 'overdue' | 'partial' | 'paid' | 'expired' | 'not_due';

interface Spec {
  c: number;               // customer index (1-based)
  kind: Kind;
  days?: number;           // days overdue (or days until due for not_due); random if absent
  rupees?: number;         // amount in rupees; random if absent
  touches?: number;
  lastTouchDaysAgo?: number;
  partial?: boolean;       // acceptPartial
  promised?: string;       // promised date, YYYY-MM-DD
  paidLateDays?: number;   // for paid links: days after due when paid
  desc?: number;           // index into DESCRIPTIONS
}

// 30 links: 18 created and overdue, 3 partially paid, 5 paid, 3 expired, 1 not yet overdue.
const SPECS: Spec[] = [
  // created, overdue (18)
  { c: 1, kind: 'overdue', days: 9, rupees: 12500, desc: 0 },
  { c: 2, kind: 'overdue', days: 5, rupees: 18000, desc: 3 },
  { c: 3, kind: 'overdue', days: 16, rupees: 4800, touches: 1, lastTouchDaysAgo: 3, desc: 8 },
  { c: 4, kind: 'overdue', desc: 1 },
  { c: 4, kind: 'overdue', touches: 1, lastTouchDaysAgo: 5, desc: 1 },
  { c: 12, kind: 'overdue', touches: 2, lastTouchDaysAgo: 4, desc: 2 },
  { c: 12, kind: 'overdue', desc: 7 },
  { c: 7, kind: 'overdue', days: 8, rupees: 6000, touches: 1, lastTouchDaysAgo: 4, promised: '2026-10-09', desc: 6 },
  { c: 8, kind: 'overdue', days: 20, rupees: 9500, touches: 1, lastTouchDaysAgo: 8, promised: '2026-10-03', desc: 4 },
  { c: 9, kind: 'overdue', days: 40, touches: 3, lastTouchDaysAgo: 6, desc: 10 },
  { c: 5, kind: 'overdue', desc: 11 },
  { c: 6, kind: 'overdue', touches: 1, lastTouchDaysAgo: 10, desc: 11 },
  { c: 14, kind: 'overdue', touches: 2, lastTouchDaysAgo: 6, desc: 5 },
  { c: 10, kind: 'overdue', rupees: 32000, touches: 1, lastTouchDaysAgo: 7, partial: true, desc: 9 },
  { c: 11, kind: 'overdue', desc: 3 },
  { c: 14, kind: 'overdue', days: 2, desc: 5 },
  { c: 13, kind: 'overdue', desc: 8 },
  { c: 3, kind: 'overdue', days: 30, desc: 8 },
  // partially paid (3)
  { c: 11, kind: 'partial', rupees: 24000, partial: true, desc: 9 },
  { c: 12, kind: 'partial', rupees: 15000, partial: true, touches: 2, lastTouchDaysAgo: 5, desc: 2 },
  { c: 2, kind: 'partial', rupees: 40000, partial: true, desc: 3 },
  // paid (5): three paid within 3 days of the due date, two paid more than 14 days late
  { c: 1, kind: 'paid', days: 3, paidLateDays: 2, desc: 0 },
  { c: 1, kind: 'paid', days: 33, paidLateDays: 1, desc: 0 },
  { c: 1, kind: 'paid', days: 63, paidLateDays: 3, desc: 0 },
  { c: 4, kind: 'paid', days: 50, paidLateDays: 18, desc: 1 },
  { c: 4, kind: 'paid', days: 80, paidLateDays: 21, desc: 1 },
  // expired (3)
  { c: 10, kind: 'expired', days: 35, desc: 9 },
  { c: 9, kind: 'expired', days: 25, desc: 10 },
  { c: 7, kind: 'expired', days: 18, desc: 6 },
  // created, not yet overdue (1)
  { c: 13, kind: 'not_due', days: 3, rupees: 7500, desc: 8 },
];

const ALNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const LOWER = 'abcdefghijklmnopqrstuvwxyz0123456789';

export interface FixtureFile {
  meta: { generator: string; seed: number; baseTime: string; note: string };
  customers: Customer[];
  links: PaymentLink[];
  touches: Touch[];
  replies: ReplyLog[];
}

export function generate(): FixtureFile {
  const rand = mulberry32(SEED);
  const pick = (chars: string, n: number) => Array.from({ length: n }, () => chars[Math.floor(rand() * chars.length)]).join('');
  const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  /** ₹800 to ₹95,000 in multiples of ₹50 */
  const rupeesRandom = () => 800 + 50 * int(0, (95000 - 800) / 50);

  const base = parseIso(DEMO_START_ISO);
  // Due times sit at 10:00 IST, so "N days overdue" holds at the 11:00 demo start.
  const dueAtFor = (daysAgo: number) => toIstIso(addMs(parseIso(`${istDate(addMs(base, -daysAgo * DAY_MS))}T10:00:00+05:30`), 0));

  const customers: Customer[] = CUSTOMERS.map((c, i) => ({
    id: `cust_${String(i + 1).padStart(2, '0')}`,
    name: c.name,
    phone: `+91 00000 000${String(i + 1).padStart(2, '0')}`,
    muted: c.muted,
    disputed: c.disputed,
    tags: c.tags,
  }));

  const links: PaymentLink[] = [];
  const touches: Touch[] = [];
  const replies: ReplyLog[] = [];

  SPECS.forEach((s, i) => {
    const n = i + 1;
    const customer = customers[s.c - 1] as Customer;
    let rupees = s.rupees ?? rupeesRandom();
    if (s.partial && rupees < 5000) rupees = 5000 + 50 * int(0, 200);
    // A touched link was overdue before its first touch: earlier touches sit 3 days apart.
    const minDays = s.touches ? (s.lastTouchDaysAgo ?? 3) + 3 * (s.touches - 1) + 1 : 1;
    const days = s.days ?? int(minDays, 45);
    const dueAt = s.kind === 'not_due' ? dueAtFor(-days) : dueAtFor(days);
    const createdAt = toIstIso(addMs(parseIso(dueAt), -7 * DAY_MS));
    const amountPaise = rupees * 100;
    let amountPaidPaise = 0;
    if (s.kind === 'partial') amountPaidPaise = 100 * 50 * Math.round((rupees * (0.2 + 0.4 * rand())) / 50);
    if (s.kind === 'paid') amountPaidPaise = amountPaise;
    const paidAt =
      s.kind === 'paid' ? toIstIso(addMs(parseIso(dueAt), (s.paidLateDays ?? 1) * DAY_MS + 3 * HOUR_MS)) : null;
    const status: PaymentLink['status'] =
      s.kind === 'partial' ? 'partially_paid' : s.kind === 'paid' ? 'paid' : s.kind === 'expired' ? 'expired' : 'created';
    const expireBy = s.kind === 'expired' ? toIstIso(addMs(parseIso(dueAt), 3 * DAY_MS)) : null;
    const touchCount = s.touches ?? 0;
    const lastTouchAt =
      touchCount > 0 ? toIstIso(addMs(base, -(s.lastTouchDaysAgo ?? 3) * DAY_MS - 2 * HOUR_MS)) : null;
    const description = DESCRIPTIONS[s.desc ?? 0] as string;

    const link: PaymentLink = {
      id: `plink_${pick(ALNUM, 14)}`,
      referenceId: `INV-2026-${String(n).padStart(3, '0')}`,
      customerId: customer.id,
      amountPaise,
      amountPaidPaise,
      currency: 'INR',
      status,
      createdAt,
      dueAt,
      expireBy,
      paidAt,
      acceptPartial: s.partial ?? false,
      shortUrl: `https://rzp.example/pay/${pick(LOWER, 6)}`,
      description,
      touchCount,
      lastTouchAt,
      promisedDate: s.promised ?? null,
      paidOffline: false,
    };
    links.push(link);

    // Touch history: the last touch at lastTouchAt, earlier ones 3 days apart. All simulated.
    for (let k = 0; k < touchCount; k++) {
      const sentAt = toIstIso(addMs(parseIso(lastTouchAt as string), -(touchCount - 1 - k) * 3 * DAY_MS));
      const kind = k === 0 ? 'first_reminder' : 'follow_up';
      const tone = k >= 2 ? 'firm' : 'polite';
      touches.push({
        id: `touch_${String(touches.length + 1).padStart(3, '0')}`,
        linkId: link.id,
        channel: 'whatsapp',
        sentAt,
        text: renderMessage(kind, tone, 'en', {
          name: customer.name,
          amountPaise: amountPaise - amountPaidPaise,
          description,
          url: link.shortUrl,
        }),
        lang: 'en',
        tone,
        simulated: true,
      });
    }
    if (s.promised) {
      replies.push({
        id: `reply_${String(replies.length + 1).padStart(3, '0')}`,
        linkId: link.id,
        kind: 'promised_date',
        promisedDate: s.promised,
        loggedAt: toIstIso(addMs(parseIso(lastTouchAt as string), 5 * HOUR_MS)),
      });
    }
    if (customer.disputed) {
      replies.push({
        id: `reply_${String(replies.length + 1).padStart(3, '0')}`,
        linkId: link.id,
        kind: 'disputes',
        promisedDate: null,
        loggedAt: toIstIso(addMs(parseIso(lastTouchAt ?? createdAt), 6 * HOUR_MS)),
      });
    }
  });

  return {
    meta: {
      generator: 'scripts/gen-fixtures.ts',
      seed: SEED,
      baseTime: DEMO_START_ISO,
      note: 'Synthetic data. Every name, business, phone number and link is invented. Phone numbers use +91 00000 000NN.',
    },
    customers,
    links,
    touches,
    replies,
  };
}

export function serialise(f: FixtureFile): string {
  return JSON.stringify(f, null, 2) + '\n';
}

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

const isMain = process.argv[1] && /gen-fixtures\.ts$/.test(process.argv[1]);
if (isMain) {
  if (process.argv.includes('--verify')) {
    const a = sha(serialise(generate()));
    const b = sha(serialise(generate()));
    console.log(`generation 1: ${a}`);
    console.log(`generation 2: ${b}`);
    if (existsSync(OUT)) console.log(`file on disk: ${sha(readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n'))}`);
    const onDiskOk = !existsSync(OUT) || sha(readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n')) === a;
    if (a !== b || !onDiskOk) {
      console.error('fixtures:verify FAILED: hashes differ');
      process.exit(1);
    }
    console.log('fixtures:verify ok: identical');
  } else {
    writeFileSync(OUT, serialise(generate()));
    console.log(`wrote ${OUT}`);
  }
}
