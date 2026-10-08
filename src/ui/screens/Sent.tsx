import { useEffect, useState } from 'react';
import { formatDayShort, istDate, parseIso, systemMs, toIstIso } from '../../clock';
import { amountDuePaise } from '../../domain/derive';
import { formatINR } from '../../format';
import { endRun, logEvent, type RunResult } from '../../instrumentation';
import { UNDO_WINDOW_MS, r16CanUndo } from '../../rules';
import { go, useApp } from '../App';
import { Header, Sim } from '../components/Chrome';

function undoSecondsLeft(sentAtMs: number): number {
  return r16CanUndo(sentAtMs, systemMs()) ? Math.ceil((UNDO_WINDOW_MS - (systemMs() - sentAtMs)) / 1000) : 0;
}

export function Sent({ id }: { id: string }) {
  const { state, dispatch, clock } = useApp();
  const link = state.links.find((l) => l.id === id);
  const customer = state.customers.find((c) => c.id === link?.customerId);
  const nextCheck = state.nextCheckAt[id];
  const [run, setRun] = useState<RunResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [editing, setEditing] = useState(false);
  const last = state.lastSend && state.lastSend.linkId === id ? state.lastSend : null;
  const [undoLeft, setUndoLeft] = useState(() => (last ? undoSecondsLeft(last.sentAtMs) : 0));

  // R16: a 10-second undo, counted in real time.
  useEffect(() => {
    if (!last) return;
    const tick = () => setUndoLeft(undoSecondsLeft(last.sentAtMs));
    tick();
    const t = window.setInterval(tick, 250);
    return () => window.clearInterval(t);
  }, [last]);

  // The two-minute task ends when this screen appears (timed_end).
  useEffect(() => {
    const r = endRun(clock);
    if (r) setRun(r);
    setChecked(true);
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

        {last && undoLeft > 0 ? (
          <section className="card stack" aria-label="Undo">
            <div className="row">
              <span>Undo · {undoLeft} s</span>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  if (!r16CanUndo(last.sentAtMs, systemMs())) return setUndoLeft(0);
                  dispatch({ type: 'UNDO_SEND', linkId: id, at: toIstIso(clock.now()) });
                  logEvent('undo', clock, { linkId: id });
                  go('/');
                }}
              >
                Undo
              </button>
            </div>
            <p className="meta" style={{ margin: 0 }}>Undo only updates this app. It cannot unsend a message.</p>
          </section>
        ) : null}

        <button type="button" className="btn wide" onClick={() => go(`/reply/${id}`)}>
          Log a reply
        </button>
        <button type="button" className="btn ghost wide" onClick={() => go('/')}>
          Back to list
        </button>
        {run ? (
          <p className="meta" style={{ textAlign: 'center', margin: 0 }} data-testid="run-readout">
            Run time: {Math.round(run.ms / 1000)} s, {run.taps} taps (practice data)
          </p>
        ) : checked && state.settings.timedRun ? (
          <p className="meta" style={{ textAlign: 'center', margin: 0 }} data-testid="run-missing">
            Timed run is on, but no run was active. To time one, tap Start on Home first.
          </p>
        ) : null}
      </main>
    </div>
  );
}
