import { useState } from 'react';
import { DAY_MS, addDaysToDate, addMs, formatDayShort, istDate, parseIso, toIstIso } from '../../clock';
import { amountDuePaise } from '../../domain/derive';
import type { ReplyKind } from '../../domain/types';
import { formatINR } from '../../format';
import { logEvent } from '../../instrumentation';
import { go, useApp } from '../App';
import { Header } from '../components/Chrome';

const CHOICES: Array<{ kind: ReplyKind; label: string }> = [
  { kind: 'promised_date', label: 'Promised a date' },
  { kind: 'says_paid', label: 'Says they paid' },
  { kind: 'disputes', label: 'Disputes it' },
  { kind: 'no_reply', label: 'No reply yet' },
];

/** S4: one tap records what the customer said, and the result card shows the new plan. */
export function LogReply({ id }: { id: string }) {
  const { state, dispatch, clock } = useApp();
  const link = state.links.find((l) => l.id === id);
  const customer = state.customers.find((c) => c.id === link?.customerId);
  const today = istDate(clock.now());
  const [kind, setKind] = useState<ReplyKind | null>(null);
  const [promised, setPromised] = useState(() => addDaysToDate(today, 3));
  const [checkOn, setCheckOn] = useState(() => addDaysToDate(today, 2));
  const [result, setResult] = useState<string | null>(null);

  if (!link || !customer) {
    return (
      <div className="scroll">
        <Header back={() => go('/')} />
        <main className="page">
          <p className="empty">This link is not in the demo data.</p>
        </main>
      </div>
    );
  }

  const at = () => toIstIso(clock.now());
  const done = (k: ReplyKind, text: string) => {
    logEvent('reply_logged', clock, { linkId: link.id, kind: k });
    setResult(text);
  };
  const nineAm = (date: string) => `${date}T09:00:00+05:30`;

  return (
    <div className="scroll">
      <Header back={() => go('/')} title="Log a reply" />
      <main className="page" id="main">
        <p className="meta" style={{ margin: 0 }}>
          {customer.name} · {formatINR(amountDuePaise(link))} · {link.description}
        </p>

        {result ? (
          <section className="card stack" aria-labelledby="result-h" data-testid="reply-result">
            <h2 id="result-h" style={{ fontSize: 17, margin: 0 }}>Saved</h2>
            <p style={{ margin: 0 }}>{result}</p>
            <button type="button" className="btn wide" onClick={() => go('/')}>
              Back to list
            </button>
          </section>
        ) : (
          <>
            <fieldset className="card stack" style={{ margin: 0 }}>
              <legend className="sr-only">What did {customer.name} say?</legend>
              <p style={{ margin: 0, fontWeight: 700 }}>What did {customer.name} say?</p>
              {CHOICES.map((c) => (
                <button
                  key={c.kind}
                  type="button"
                  className="btn ghost wide"
                  aria-pressed={kind === c.kind}
                  style={kind === c.kind ? { background: 'var(--accent-soft)' } : undefined}
                  onClick={() => setKind(c.kind)}
                >
                  {c.label}
                </button>
              ))}
            </fieldset>

            {kind === 'promised_date' ? (
              <section className="card stack" aria-label="Promised date">
                <label htmlFor="promised">They promised to pay by</label>
                <input id="promised" type="date" value={promised} min={today} onChange={(e) => e.target.value && setPromised(e.target.value)} />
                <button
                  type="button"
                  className="btn wide"
                  onClick={() => {
                    dispatch({ type: 'LOG_REPLY', linkId: link.id, kind: 'promised_date', promisedDate: promised, at: at() });
                    done('promised_date', `Waiting until ${formatDayShort(parseIso(addDaysToDate(promised, 1)))}, the day after the promise. Collect will not chase ${customer.name} before then.`);
                  }}
                >
                  Save promise
                </button>
              </section>
            ) : null}

            {kind === 'says_paid' ? (
              <section className="card stack" aria-label="Says they paid">
                <p style={{ margin: 0 }}>
                  Check your bank or Razorpay first. Mark as paid offline? This only updates this app.
                </p>
                <button
                  type="button"
                  className="btn wide"
                  onClick={() => {
                    dispatch({ type: 'MARK_PAID_OFFLINE', linkId: link.id, at: at() });
                    done('says_paid', 'Marked paid offline. Collect stops chasing it, and Activity counts it as paid offline (marked by you).');
                  }}
                >
                  Mark as paid offline
                </button>
                <button
                  type="button"
                  className="btn ghost wide"
                  onClick={() => {
                    const tomorrow = toIstIso(addMs(parseIso(nineAm(today)), DAY_MS));
                    dispatch({ type: 'LOG_REPLY', linkId: link.id, kind: 'says_paid', nextCheckAt: tomorrow, at: at() });
                    done('says_paid', `Not marked paid. Back on your list on ${formatDayShort(parseIso(tomorrow))}, if the link is still unpaid.`);
                  }}
                >
                  Not yet: check again tomorrow
                </button>
              </section>
            ) : null}

            {kind === 'disputes' ? (
              <section className="card stack" aria-label="Disputes it">
                <p style={{ margin: 0 }}>Collect will stop chasing {customer.name} and move this link to Needs you.</p>
                <button
                  type="button"
                  className="btn wide"
                  onClick={() => {
                    dispatch({ type: 'LOG_REPLY', linkId: link.id, kind: 'disputes', at: at() });
                    done('disputes', `Moved to Needs you. Talk to ${customer.name} yourself; Collect will not send reminders.`);
                  }}
                >
                  Mark as disputed
                </button>
              </section>
            ) : null}

            {kind === 'no_reply' ? (
              <section className="card stack" aria-label="No reply yet">
                <label htmlFor="check-on">Check again on</label>
                <input id="check-on" type="date" value={checkOn} min={today} onChange={(e) => e.target.value && setCheckOn(e.target.value)} />
                <button
                  type="button"
                  className="btn wide"
                  onClick={() => {
                    dispatch({ type: 'LOG_REPLY', linkId: link.id, kind: 'no_reply', nextCheckAt: nineAm(checkOn), at: at() });
                    done('no_reply', `Back on your list on ${formatDayShort(parseIso(nineAm(checkOn)))}, if the link is still unpaid.`);
                  }}
                >
                  Save
                </button>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
