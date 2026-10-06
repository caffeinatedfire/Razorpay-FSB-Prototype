import { useEffect, useRef, useState } from 'react';
import type { Channel, Customer } from '../../domain/types';
import { Sim } from './Chrome';

type HandoffModule = typeof import('../../send/realHandoff');

/**
 * The simulated send sheet. Nothing is sent to anyone (R15). In a dev build with
 * VITE_REAL_WHATSAPP=true, one extra button opens WhatsApp addressed to the owner's own number.
 */
export function SendSheet({
  customer, channel, text, onConfirm, onCancel,
}: {
  customer: Customer;
  channel: Channel;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [handoff, setHandoff] = useState<HandoffModule | null>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  useEffect(() => {
    // Dev builds only: production builds drop this import entirely.
    if (import.meta.env.DEV) {
      void import('../../send/realHandoff').then((m) => setHandoff(m));
    }
  }, []);

  const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
  const ownUrl = import.meta.env.DEV && handoff && channel === 'whatsapp' ? handoff.realHandoffUrl(text) : null;

  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="row">
          <h2 id="sheet-title">Send on {channelName}</h2>
          <Sim />
        </div>
        <p className="meta" style={{ margin: 0 }}>
          To: {customer.name} · {customer.phone} (fictional)
        </p>
        <div className="preview">{text}</div>
        <div className="alert info">
          In the real app this step opens {channelName} with the message ready, and you press send there. In this
          prototype nothing leaves your phone.
        </div>
        <button ref={confirmRef} type="button" className="btn wide" onClick={onConfirm}>
          Confirm (simulated)
        </button>
        {import.meta.env.DEV && ownUrl ? (
          <a className="btn ghost wide" href={ownUrl} target="_blank" rel="noreferrer">
            Dev test: open WhatsApp to my own number
          </a>
        ) : null}
        <button type="button" className="btn plain wide" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
