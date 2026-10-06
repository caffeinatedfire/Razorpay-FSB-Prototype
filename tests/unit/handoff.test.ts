// R15: the only real hand-off is to the owner's own number, in dev, when VITE_REAL_WHATSAPP=true.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { realHandoffUrl } from '../../src/send/realHandoff';

const WA = 'https://wa' + '.me/';

afterEach(() => vi.unstubAllEnvs());

describe('real hand-off', () => {
  it('R15 opens WhatsApp only to the owner\'s own number when switched on in dev', () => {
    vi.stubEnv('VITE_REAL_WHATSAPP', 'true');
    vi.stubEnv('VITE_OWN_WHATSAPP', '910000000099');
    expect(realHandoffUrl('Hi ₹12,500')).toBe(`${WA}910000000099?text=Hi%20%E2%82%B912%2C500`);
  });
  it('R15 does nothing when switched off, or with no own number', () => {
    vi.stubEnv('VITE_REAL_WHATSAPP', 'false');
    vi.stubEnv('VITE_OWN_WHATSAPP', '910000000099');
    expect(realHandoffUrl('x')).toBeNull();
    vi.stubEnv('VITE_REAL_WHATSAPP', 'true');
    vi.stubEnv('VITE_OWN_WHATSAPP', '');
    expect(realHandoffUrl('x')).toBeNull();
  });
});
