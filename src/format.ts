// Money is integer paise (R13). This is the only place paise become text.

function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
}

/** formatINR(1250000) -> "₹12,500"; formatINR(18435000) -> "₹1,84,350"; formatINR(1050) -> "₹10.50" */
export function formatINR(paise: number): string {
  if (!Number.isSafeInteger(paise)) throw new Error(`formatINR needs integer paise, got ${paise}`);
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const rem = abs % 100;
  const frac = rem === 0 ? '' : `.${String(rem).padStart(2, '0')}`;
  return `${sign}₹${groupIndian(String(rupees))}${frac}`;
}

/** Whole rupees to paise, for fixtures and settings input. */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isSafeInteger(rupees)) throw new Error(`rupeesToPaise needs whole rupees, got ${rupees}`);
  return rupees * 100;
}
