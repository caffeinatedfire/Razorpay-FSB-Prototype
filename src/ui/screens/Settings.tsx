import { useState } from 'react';
import { downloadEvents, downloadTimings } from '../../instrumentation';
import { useApp } from '../App';
import { BottomNav, Header } from '../components/Chrome';

/** S6, a stub for P3: Timed run and Reset demo data. The full screen arrives in P4. */
export function Settings() {
  const { state, dispatch, params } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  return (
    <>
      <div className="scroll">
        <Header title="Settings" />
        <main className="page" id="main">
          <section className="card stack">
            <div className="toggle">
              <label htmlFor="timed">
                <strong>Timed run</strong>
                <br />
                <span className="meta">Adds a Start button on Home. Times and taps stay on this phone (practice data).</span>
              </label>
              <input
                id="timed"
                type="checkbox"
                checked={state.settings.timedRun}
                onChange={(e) => dispatch({ type: 'SET_SETTINGS', patch: { timedRun: e.target.checked } })}
              />
            </div>
          </section>

          <section className="card stack" aria-labelledby="demo-data">
            <h2 id="demo-data" style={{ fontSize: 17, margin: 0 }}>Demo data</h2>
            <p className="meta" style={{ margin: 0 }}>
              Puts every link back as it was in the synthetic fixtures. Your settings stay.
            </p>
            {confirmReset ? (
              <div className="row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    dispatch({ type: 'RESET' });
                    setConfirmReset(false);
                    setResetDone(true);
                  }}
                >
                  Yes, reset
                </button>
                <button type="button" className="btn plain" onClick={() => setConfirmReset(false)}>
                  Keep my changes
                </button>
              </div>
            ) : (
              <button type="button" className="btn ghost" onClick={() => { setConfirmReset(true); setResetDone(false); }}>
                Reset demo data
              </button>
            )}
            {resetDone ? <p role="status" className="meta" style={{ margin: 0 }}>Demo data reset.</p> : null}
          </section>

          <p className="meta" style={{ margin: 0 }}>
            Quiet hours, reminder limits, tone, language and the SIMULATED demo controls arrive in the next build.
          </p>
          {params.debug ? (
            <div className="row">
              <button type="button" className="btn ghost grow" onClick={downloadTimings}>
                Export timings.csv
              </button>
              <button type="button" className="btn ghost grow" onClick={downloadEvents}>
                Export events.csv
              </button>
            </div>
          ) : null}
        </main>
      </div>
      <BottomNav current="settings" />
    </>
  );
}
