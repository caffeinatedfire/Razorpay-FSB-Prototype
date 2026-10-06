import { useEffect, useMemo, useState } from 'react';
import { formatDayShort, parseIso } from '../../clock';
import { buildHome, type DecisionView } from '../../decide';
import { amountDuePaise, daysOverdue, recoveredThisWeek } from '../../domain/derive';
import { formatINR } from '../../format';
import { downloadTimings, isRunActive, logEvent, startRun } from '../../instrumentation';
import { go, useApp } from '../App';
import { BottomNav, Header } from '../components/Chrome';

const SHOWN = 3;

export function Home() {
  const { state, clock, now, params, homeInput } = useApp();
  const home = useMemo(() => buildHome(homeInput), [homeInput]);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<'needs' | 'waiting' | null>(null);
  const [runner, setRunner] = useState('');
  const [running, setRunning] = useState(isRunActive());

  useEffect(() => logEvent('home_view', clock), [clock]);

  const linkOf = (d: DecisionView) => state.links.find((l) => l.id === d.linkId);
  const nameOf = (d: DecisionView) => {
    const link = linkOf(d);
    return state.customers.find((c) => c.id === link?.customerId)?.name ?? 'Customer';
  };
  const paid = recoveredThisWeek(state.links, now);
  const cards = showAll ? home.chaseToday : home.chaseToday.slice(0, SHOWN);
  const waitingOnPromise = home.waiting.every((d) => d.waitKind === 'promise');
  const waitingPaise = home.waiting
    .filter((d) => d.waitKind === 'promise')
    .reduce((s, d) => {
      const link = linkOf(d);
      return s + (link ? amountDuePaise(link) : 0);
    }, 0);

  const start = () => {
    startRun(runner, clock);
    setRunning(true);
  };

  return (
    <>
      <div className="scroll">
        <Header title="Collect" extra={<span className="tag">Concept prototype</span>} />
        <main className="page" id="main">
          {state.settings.timedRun ? (
            <section className="card timed" aria-label="Timed run">
              {running ? (
                <p style={{ margin: 0 }}>
                  <strong>Timed run in progress.</strong> Chase the top card and send it. Taps are counted (practice data).
                </p>
              ) : (
                <>
                  <label htmlFor="runner">Who is running it? (first name or a label)</label>
                  <div className="row">
                    <input id="runner" value={runner} onChange={(e) => setRunner(e.target.value)} autoComplete="off" />
                    <button type="button" className="btn" onClick={start}>
                      Start
                    </button>
                  </div>
                </>
              )}
            </section>
          ) : null}

          <section className="card summary" aria-label="Summary">
            <p className="big">{formatINR(home.owedPaise)} owed</p>
            <p className="small">across {home.overdueCount} overdue links</p>
          </section>

          {home.chaseToday.length === 0 ? (
            <p className="empty">
              Nothing to chase today. {formatINR(waitingPaise)} is waiting on promises.
            </p>
          ) : (
            <section aria-labelledby="chase-today" className="stack">
              <h2 className="section" id="chase-today">
                Chase today ({home.chaseToday.length})
                {home.chaseToday.length > SHOWN ? (
                  <button type="button" className="linkbtn" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
                    {showAll ? 'Show fewer' : 'See all'}
                  </button>
                ) : null}
              </h2>
              {cards.map((d) => {
                const link = linkOf(d);
                if (!link) return null;
                const name = nameOf(d);
                return (
                  <article className="card" key={d.linkId} data-testid="chase-card">
                    <div className="row top">
                      <div className="grow">
                        <div className="name">{name}</div>
                        <div className="meta">{daysOverdue(link, now)} days overdue</div>
                      </div>
                      <div className="amt">{formatINR(amountDuePaise(link))}</div>
                    </div>
                    <div className="row">
                      <span className="chip">{d.chip}</span>
                      <button type="button" className="btn" aria-label={`Chase ${name}`} onClick={() => go(`/chase/${link.id}`)}>
                        Chase
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          <Collapsible
            title="Needs you"
            summary={`${home.needsYou.length}${home.needsYou.length ? ' · ' + needsSummary(home.needsYou) : ''}`}
            open={open === 'needs'}
            onToggle={() => setOpen(open === 'needs' ? null : 'needs')}
            items={home.needsYou.map((d) => ({ id: d.linkId, name: nameOf(d), note: d.hits[0]?.rule === 'R18' ? 'expired link' : d.hits[0]?.rule === 'R07' ? 'disputes it' : 'reminders used up' }))}
          />
          <Collapsible
            title={waitingOnPromise ? 'Waiting on a promise' : 'Waiting'}
            summary={`${home.waiting.length}${home.waiting[0]?.waitUntil ? ` · until ${formatDayShort(parseIso(home.waiting[0].waitUntil))}` : ''}`}
            open={open === 'waiting'}
            onToggle={() => setOpen(open === 'waiting' ? null : 'waiting')}
            items={home.waiting.map((d) => ({
              id: d.linkId,
              name: nameOf(d),
              note: `${d.waitKind === 'promise' ? 'promise' : 'next check'} · until ${d.waitUntil ? formatDayShort(parseIso(d.waitUntil)) : ''}`,
            }))}
          />

          <p className="footer-line">Paid this week: {formatINR(paid.viaLinkPaise + paid.offlinePaise)}</p>
          {params.debug ? (
            <button type="button" className="btn ghost" onClick={downloadTimings}>
              Export timings.csv (debug)
            </button>
          ) : null}
        </main>
      </div>
      <BottomNav current="home" />
    </>
  );
}

function needsSummary(list: DecisionView[]): string {
  const disputes = list.filter((d) => d.ruleHits.includes('R07')).length;
  const expired = list.filter((d) => d.ruleHits.includes('R18')).length;
  const limit = list.filter((d) => d.ruleHits.includes('R02')).length;
  const parts: string[] = [];
  if (disputes) parts.push(disputes === 1 ? 'a dispute' : `${disputes} disputes`);
  if (expired) parts.push(expired === 1 ? 'an expired link' : `${expired} expired links`);
  if (limit) parts.push(limit === 1 ? 'reminders used up' : `${limit} with reminders used up`);
  return parts.join(', ');
}

function Collapsible({
  title, summary, open, onToggle, items,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  items: Array<{ id: string; name: string; note: string }>;
}) {
  const listId = `list-${title.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <section className="card">
      <h2 className="section" style={{ margin: 0 }}>
        <button type="button" className="collapsed" aria-expanded={open} aria-controls={listId} onClick={onToggle}>
          <span>
            {title} <span className="count">{summary}</span>
          </span>
          <span aria-hidden="true">{open ? '˄' : '›'}</span>
        </button>
      </h2>
      {open ? (
        <ul className="list" id={listId}>
          {items.length === 0 ? <li className="meta">None</li> : null}
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#/chase/${i.id}`}>
                <span className="name">{i.name}</span>
                <span className="meta">{i.note}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
