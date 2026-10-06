// Domain types, copied exactly from IMPLEMENTATION_PLAN.md Appendix C. Do not rename fields.

export type LinkStatus = 'created' | 'partially_paid' | 'paid' | 'expired' | 'cancelled';
export type Channel = 'whatsapp' | 'sms';
export type Tone = 'polite' | 'firm';
export type Lang = 'en' | 'hi' | 'hinglish';
export type TemplateKind = 'first_reminder' | 'follow_up' | 'post_promise' | 'part_payment';
export type ReplyKind = 'promised_date' | 'says_paid' | 'disputes' | 'no_reply';
export type ActionType = 'CHASE_NOW' | 'WAIT_UNTIL' | 'HAND_TO_ME' | 'REISSUE' | 'HOLD';

export interface Customer {
  id: string; name: string;
  phone: string;                 // fictional pattern '+91 00000 000NN'
  muted: boolean; disputed: boolean; tags: string[];
}

export interface PaymentLink {
  id: string;                    // 'plink_' + 14 chars, synthetic
  referenceId: string;           // 40 characters or fewer
  customerId: string;
  amountPaise: number;           // integer
  amountPaidPaise: number;       // integer
  currency: 'INR';
  status: LinkStatus;
  createdAt: string;             // ISO 8601 with +05:30
  dueAt: string;                 // ISO 8601; createdAt + 7 days unless set
  expireBy: string | null;
  paidAt: string | null;
  acceptPartial: boolean;
  shortUrl: string;              // fictional 'https://rzp.example/pay/xxxxxx', never a real host
  description: string;
  touchCount: number;
  lastTouchAt: string | null;
  promisedDate: string | null;   // ISO date
  paidOffline: boolean;          // local marker only, never sent anywhere
}

export interface Touch {
  id: string; linkId: string; channel: Channel; sentAt: string;
  text: string; lang: Lang; tone: Tone; simulated: true;
}

export interface ReplyLog {
  id: string; linkId: string; kind: ReplyKind;
  promisedDate: string | null; loggedAt: string;
}

export interface Decision {
  linkId: string; action: ActionType; templateKind: TemplateKind | null;
  channel: Channel; tone: Tone; waitUntil: string | null;
  score: number; reasons: string[]; ruleHits: string[];
  blocked: boolean;              // hard block
  softBlocked: boolean;          // warn and confirm
  softReasons: string[];
}

export interface OwnerSettings {
  quietStart: string;            // default '09:00'
  quietEnd: string;              // default '21:00'
  maxTouchesPerLink: number;     // default 3
  minGapHours: number;           // default 48
  tone: Tone;                    // default 'polite'
  lang: Lang;                    // default 'en'
  channel: Channel;              // default 'whatsapp'
  timedRun: boolean;             // default false
}

export interface ActivityEvent {
  id: string; at: string; kind: string; linkId?: string; detail: string;
}
