// The only real hand-off (R15). Dev builds only, only when VITE_REAL_WHATSAPP=true, and only to the
// owner's OWN number from .env.local. It never addresses a customer. The caller imports this module
// behind `import.meta.env.DEV`, so production builds contain none of it.

export function ownNumber(): string | null {
  if (!import.meta.env.DEV || import.meta.env.VITE_REAL_WHATSAPP !== 'true') return null;
  const own = String(import.meta.env.VITE_OWN_WHATSAPP ?? '').replace(/\D/g, '');
  return own.length >= 11 ? own : null;
}

/** A WhatsApp link that opens a chat with the owner's own number, message pre-filled. Null when not allowed. */
export function realHandoffUrl(text: string): string | null {
  const own = ownNumber();
  return own ? `https://wa.me/${own}?text=${encodeURIComponent(text)}` : null;
}
