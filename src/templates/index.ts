// Message templates, copied from plan Appendix F. Messages are never written by a model (D-04).
// Slots: {name}, {amount}, {description}, {url}. When "firm" has no variant, the polite text is used.
// Changes agreed at G3: a space before "।" after the link (D-31), and a sender sign-off (D-26).

import type { Lang, TemplateKind, Tone } from '../domain/types';
import { formatINR } from '../format';

interface Variants { polite: string; firm: string | null }

export const TEMPLATES: Record<Lang, Record<TemplateKind, Variants>> = {
  en: {
    first_reminder: {
      polite: 'Hi {name}, a gentle reminder: {amount} is pending for {description}. You can pay here: {url}. Thank you!',
      firm: null,
    },
    follow_up: {
      polite: 'Hi {name}, following up on {amount} for {description}. Pay here when convenient: {url}. Thank you!',
      firm: 'Hi {name}, this is a second reminder for {amount} for {description}, now overdue. Please pay here today: {url}. Thank you.',
    },
    post_promise: {
      polite: 'Hi {name}, checking in on the payment you mentioned for {description}: {amount}. Pay here: {url}. Thank you!',
      firm: null,
    },
    part_payment: {
      polite: 'Hi {name}, if it is easier, you can pay {amount} in parts for {description}. Start with any amount here: {url}. Thank you!',
      firm: null,
    },
  },
  hinglish: {
    first_reminder: {
      polite: 'Namaste {name}, {description} ke {amount} abhi baaki hain. Aap yahan se pay kar sakte hain: {url}. Dhanyavaad!',
      firm: null,
    },
    follow_up: {
      polite: 'Namaste {name}, {description} ke {amount} ke liye ek aur reminder. Suvidha anusaar yahan pay karein: {url}. Dhanyavaad!',
      firm: 'Namaste {name}, {description} ke {amount} ka yeh doosra reminder hai, ab yeh pending hai. Kripya aaj yahan pay karein: {url}. Dhanyavaad.',
    },
    post_promise: {
      polite: 'Namaste {name}, {description} ke {amount} ke payment ke baare mein check kar rahe hain, jiska aapne zikr kiya tha. Yahan pay karein: {url}. Dhanyavaad!',
      firm: null,
    },
    part_payment: {
      polite: 'Namaste {name}, agar aasan ho to {description} ke {amount} aap kisht mein de sakte hain. Kisi bhi amount se shuru karein: {url}. Dhanyavaad!',
      firm: null,
    },
  },
  hi: {
    first_reminder: {
      polite: 'नमस्ते {name}, {description} के {amount} अभी बाकी हैं। आप यहाँ से भुगतान कर सकते हैं: {url} । धन्यवाद!',
      firm: null,
    },
    follow_up: {
      polite: 'नमस्ते {name}, {description} के {amount} के लिए एक और रिमाइंडर। सुविधानुसार यहाँ भुगतान करें: {url} । धन्यवाद!',
      firm: 'नमस्ते {name}, {description} के {amount} का यह दूसरा रिमाइंडर है, अब यह बकाया है। कृपया आज यहाँ भुगतान करें: {url} । धन्यवाद।',
    },
    post_promise: {
      polite: 'नमस्ते {name}, आपने {description} के {amount} के जिस भुगतान का ज़िक्र किया था, उसके बारे में पूछ रहे हैं। यहाँ भुगतान करें: {url} । धन्यवाद!',
      firm: null,
    },
    part_payment: {
      polite: 'नमस्ते {name}, अगर आसान हो तो {description} के {amount} आप किस्तों में दे सकते हैं। किसी भी राशि से शुरू करें: {url} । धन्यवाद!',
      firm: null,
    },
  },
};

export const LANGS: Lang[] = ['en', 'hi', 'hinglish'];
export const TONES: Tone[] = ['polite', 'firm'];
export const KINDS: TemplateKind[] = ['first_reminder', 'follow_up', 'post_promise', 'part_payment'];

export const TONE_LABELS: Record<Tone, string> = { polite: 'Gentle', firm: 'Firm' };

export const LANG_LABELS: Record<Lang, string> = { en: 'English', hi: 'हिन्दी', hinglish: 'Hinglish' };

/** The template text for a kind, tone and language. Firm falls back to polite where no firm text exists. */
export function templateText(kind: TemplateKind, tone: Tone, lang: Lang): string {
  const v = TEMPLATES[lang][kind];
  return tone === 'firm' && v.firm ? v.firm : v.polite;
}

export interface MessageSlots {
  name: string;
  amountPaise: number;
  description: string;
  url: string;
  /** The sender, for the sign-off (D-26). Omitted or blank: no sign-off. */
  owner?: string;
  business?: string;
}

/** "– Asha, Brightline Studio"; "– Asha" with no business; "" with neither. */
export function signOff(owner = '', business = ''): string {
  const parts = [owner.trim(), business.trim()].filter(Boolean);
  return parts.length ? `– ${parts.join(', ')}` : '';
}

/** Fills the slots. The amount is formatted only through formatINR (R13). */
export function renderMessage(kind: TemplateKind, tone: Tone, lang: Lang, slots: MessageSlots): string {
  const values: Record<string, string> = {
    name: slots.name,
    amount: formatINR(slots.amountPaise),
    description: slots.description,
    url: slots.url,
  };
  const body = templateText(kind, tone, lang).replace(/\{(name|amount|description|url)\}/g, (_, k: string) => values[k] ?? '');
  const sign = signOff(slots.owner, slots.business);
  return sign ? `${body} ${sign}` : body;
}
