import { useEffect, useState } from 'react';
import { formatDayShort, istDate, parseIso } from '../../clock';
import { amountDuePaise } from '../../domain/derive';
import { formatINR } from '../../format';
import { endRun, type RunResult } from '../../instrumentation';
import { go, useApp } from '../App';
import { Header, Sim } from '../components/Chrome';

export function Sent({ id }: { id: string }) {
  const { state, dispatch, clock } = useApp();
  const link = state.links.find((l) => l.id === id);
  const customer = state.customers.find((c) => c.id === link?.customerId);
  const nextCheck = state.nextCheckAt[id];
  const [run, setRun] = useState<RunResult | null>(null);
  const [editing, setEditing] = useState(false);

  // The two-minute task ends when this screen appears (timed_end).
  useEffect(() => {
    const r = endRun(clock);
    if (r) setRun(r);
  }, [clock]);

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

  return (
    <div className="scroll">
      <Header title="Sent" extra={<Sim />} />
      <main className="page" id="main">
        <section className="card" aria-labelledby="ready">
          <h2 id="ready" style={{ fontSize: 20, margin: 0 }}>Ready in chat (SIMULATED)</h2>
          <p style={{ margin: '2px 0' }}>Nothing was sent to anyone.</p>
          <p className="meta" style={{ margin: 0 }}>
            {customer.name} · {formatINR(amountDuePaise(link))} · reminder {link.touchCount} of {state.settings.maxTouchesPerLink}
          </p>
        </section>

        <section className="card stack" aria-labelledby="next-check">
          <h2 id="next-check" style={{ fontSize: 17, margin: 0 }}>Next check</h2>
          <div className="row">
            {editing ? (
              <>
                <label htmlFor="next-date" className="sr-only">Next check date</label>
                <input
                  id="next-date"
                  type="date"
                  value={nextCheck ? istDate(parseIso(nextCheck)) : ''}
                  min={istDate(clock.now())}
                  onChange={(e) => {
                    if (e.target.value) dispatch({ type: 'SET_NEXT_CHECK', linkId: id, at: `${e.target.value}T09:00:00+05:30` });
                  }}
                />
                <button type="button" className="btn ghost" onClick={() => setEditing(false)}>
                  Done
                </button>
              </>
            ) : (
              <>
                <span className="chip" style={{ marginTop: 0 }}>{nextCheck ? formatDayShort(parseIso(nextCheck)) : 'not set'}</span>
                <button type="button" className="btn ghost" onClick={() => setEditing(true)}>
                  Change
                </button>
              </>
            )}
          </div>
          <p className="meta" style={{ margin: 0 }}>
            Collect will put {customer.name} back on your list then, if the link is still unpaid.
          </p>
        </section>

        <button type="button" className="btn wide" onClick={() => go('/')}>
          Back to list
        </button>
        {run ? (
          <p className="meta" style={{ textAlign: 'center', margin: 0 }} data-testid="run-readout">
            Run time: {Math.round(run.ms / 1000)} s, {run.taps} taps (practice data)
          </p>
        ) : null}
      </main>
    </div>
  );
}
