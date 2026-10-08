import { useMemo, useState } from 'react';
import { hhmmToMinutes, toIstIso } from '../../clock';
import { amountDuePaise } from '../../domain/derive';
import type { Channel, Lang, Tone } from '../../domain/types';
import { formatINR } from '../../format';
import { downloadEvents, downloadTimings, logEvent } from '../../instrumentation';
import { BUSINESS_NAME_MAX, OWNER_NAME_MAX } from '../../store';
import { LANG_LABELS, TONE_LABELS, signOff } from '../../templates';
import { useApp } from '../App';
import { BottomNav, Header, Segmented, Sim } from '../components/Chrome';

export const PAYMENT_DELAY_MS = 10_000;

/** S6: the owner's rules and defaults, demo data, and the SIMULATED demo controls. */
export function Settings() {
  const { state, dispatch, clock, params } = useApp();
  const s = state.settings;
  const [confirmReset, setConfirmReset] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  const open = useMemo(
    () =>
      state.links.filter((l) => (l.status === 'created' || l.status === 'partially_paid') && !l.paidOffline),
    [state.links],
  );
  const [linkId, setLinkId] = useState(() => open[0]?.id ?? '');
  // A link paid or disputed in the meantime drops out of the list; fall back to the first open one.
  const chosen = open.find((l) => l.id === linkId) ?? open[0];
  const nameOf = (customerId: string) => state.customers.find((c) => c.id === customerId)?.name ?? 'Customer';

  const setWindow = (start: string, end: string) => {
    if (!start || !end || hhmmToMinutes(start) >= hhmmToMinutes(end)) {
      setTimeError('The start must be earlier than the end.');
      return;
    }
    setTimeError(null);
    dispatch({ type: 'SET_SETTINGS', patch: { quietStart: start, quietEnd: end } });
  };

  const simulatePayment = (delayMs: number) => {
    if (!chosen) return;
    const id = chosen.id;
    const who = nameOf(chosen.customerId);
    const fire = () => {
      dispatch({ type: 'SIMULATE_PAYMENT', linkId: id, at: toIstIso(clock.now()) });
      logEvent('paid_seen', clock, { linkId: id, simulated: true });
    };
    if (delayMs > 0) {
      window.setTimeout(fire, delayMs);
      setStatus(`SIMULATED: ${who}'s payment will arrive in ${delayMs / 1000} seconds.`);
    } else {
      fire();
      setStatus(`SIMULATED: ${who} paid.`);
    }
  };

  return (
    <>
      <div className="scroll">
        <Header title="Settings" />
        <main className="page" id="main">
          <section className="card stack" aria-labelledby="you-h">
            <h2 id="you-h" className="section" style={{ margin: 0 }}>You</h2>
            <label htmlFor="owner-name">Your name</label>
            <input id="owner-name" className="field" value={state.owner.name} maxLength={OWNER_NAME_MAX} autoComplete="off"
              onChange={(e) => dispatch({ type: 'SET_OWNER', patch: { name: e.target.value } })} />
            <label htmlFor="business-name">Business name</label>
            <input id="business-name" className="field" value={state.owner.business} maxLength={BUSINESS_NAME_MAX} autoComplete="off"
              onChange={(e) => dispatch({ type: 'SET_OWNER', patch: { business: e.target.value } })} />
            <p className="meta" style={{ margin: 0 }}>
              Messages end with: {signOff(state.owner.name, state.owner.business) || '(no sign-off)'}
            </p>
          </section>

          <section className="card stack" aria-labelledby="rules-h">
            <h2 id="rules-h" className="section" style={{ margin: 0 }}>Reminder rules</h2>
            <div className="row">
              <label htmlFor="quiet-start" className="grow">Send from</label>
              <input id="quiet-start" type="time" value={s.quietStart} onChange={(e) => setWindow(e.target.value, s.quietEnd)} />
            </div>
            <div className="row">
              <label htmlFor="quiet-end" className="grow">Until</label>
              <input id="quiet-end" type="time" value={s.quietEnd} onChange={(e) => setWindow(s.quietStart, e.target.value)} />
            </div>
            {timeError ? <p role="alert" className="alert hard" style={{ margin: 0 }}>{timeError}</p> : null}
            <div className="row">
              <label htmlFor="max-touches" className="grow">Reminders per link, at most</label>
              <select id="max-touches" className="field narrow" value={s.maxTouchesPerLink}
                onChange={(e) => dispatch({ type: 'SET_SETTINGS', patch: { maxTouchesPerLink: Number(e.target.value) } })}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="row">
              <label htmlFor="min-gap" className="grow">Hours between messages to one customer</label>
              <select id="min-gap" className="field narrow" value={s.minGapHours}
                onChange={(e) => dispatch({ type: 'SET_SETTINGS', patch: { minGapHours: Number(e.target.value) } })}>
                {[24, 48, 72].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </section>

          <section className="card stack" aria-labelledby="defaults-h">
            <h2 id="defaults-h" className="section" style={{ margin: 0 }}>Message defaults</h2>
            <Segmented<Tone> label="Default tone" value={s.tone}
              onChange={(v) => dispatch({ type: 'SET_SETTINGS', patch: { tone: v } })}
              options={[{ value: 'polite', label: TONE_LABELS.polite }, { value: 'firm', label: TONE_LABELS.firm }]} />
            <Segmented<Lang> label="Default language" value={s.lang}
              onChange={(v) => dispatch({ type: 'SET_SETTINGS', patch: { lang: v } })}
              options={(['en', 'hi', 'hinglish'] as Lang[]).map((l) => ({ value: l, label: LANG_LABELS[l], lang: l === 'hi' ? 'hi' : 'en' }))} />
            <Segmented<Channel> label="Default channel" value={s.channel}
              onChange={(v) => dispatch({ type: 'SET_SETTINGS', patch: { channel: v } })}
              options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'sms', label: 'SMS' }]} />
          </section>

          <section className="card stack">
            <div className="toggle">
              <label htmlFor="timed">
                <strong>Timed run</strong>
                <br />
                <span className="meta">Adds a Start button on Home. Times and taps stay on this phone (practice data).</span>
              </label>
              <input id="timed" type="checkbox" checked={s.timedRun}
                onChange={(e) => dispatch({ type: 'SET_SETTINGS', patch: { timedRun: e.target.checked } })} />
            </div>
          </section>

          <section className="card stack" aria-labelledby="demo-data">
            <h2 id="demo-data" className="section" style={{ margin: 0 }}>Demo data</h2>
            <p className="meta" style={{ margin: 0 }}>Puts every link back as it was in the synthetic fixtures. Your settings stay.</p>
            {confirmReset ? (
              <div className="row">
                <button type="button" className="btn grow" onClick={() => { dispatch({ type: 'RESET' }); setConfirmReset(false); setStatus('Demo data reset.'); }}>
                  Yes, reset
                </button>
                <button type="button" className="btn plain grow" onClick={() => setConfirmReset(false)}>
                  Keep my changes
                </button>
              </div>
            ) : (
              <button type="button" className="btn ghost" onClick={() => { setConfirmReset(true); setStatus(null); }}>
                Reset demo data
              </button>
            )}
          </section>

          <section className="card stack timed" aria-labelledby="demo-controls">
            <div className="row">
              <h2 id="demo-controls" className="section" style={{ margin: 0 }}>Demo controls</h2>
              <Sim />
            </div>
            <p className="meta" style={{ margin: 0 }}>These pretend something happened outside the app. Nothing real is paid or sent.</p>
            <label htmlFor="demo-link">Link</label>
            <select id="demo-link" className="field" value={chosen?.id ?? ''} onChange={(e) => setLinkId(e.target.value)}>
              {open.map((l) => (
                <option key={l.id} value={l.id}>
                  {nameOf(l.customerId)} · {formatINR(amountDuePaise(l))}
                </option>
              ))}
            </select>
            <button type="button" className="btn wide" disabled={!chosen} onClick={() => simulatePayment(0)}>
              Simulate: payment arrives
            </button>
            <button type="button" className="btn ghost wide" disabled={!chosen} onClick={() => simulatePayment(PAYMENT_DELAY_MS)}>
              Simulate: payment arrives in 10 s
            </button>
            <button
              type="button"
              className="btn ghost wide"
              disabled={!chosen}
              onClick={() => {
                if (!chosen) return;
                dispatch({ type: 'SIMULATE_DISPUTE', linkId: chosen.id, at: toIstIso(clock.now()) });
                setStatus(`SIMULATED: ${nameOf(chosen.customerId)} disputes it.`);
              }}
            >
              Simulate: customer disputes
            </button>
          </section>
          {status ? <p role="status" className="meta" style={{ margin: 0 }} data-testid="settings-status">{status}</p> : null}

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
