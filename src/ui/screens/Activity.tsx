import { formatDayShort, formatTime, parseIso } from '../../clock';
import { recoveredThisWeek } from '../../domain/derive';
import { formatINR } from '../../format';
import { useApp } from '../App';
import { BottomNav, Header } from '../components/Chrome';

/** S5, minimal for P3: what happened, newest first, and what came in this week. */
export function Activity() {
  const { state, now } = useApp();
  const paid = recoveredThisWeek(state.links, now);
  const events = state.activity.filter((e) => parseIso(e.at).getTime() <= now.getTime()).slice(0, 40);

  return (
    <>
      <div className="scroll">
        <Header title="Activity" />
        <main className="page" id="main">
          <section className="card" aria-label="Recovered this week">
            <p style={{ margin: 0, fontWeight: 700 }}>Recovered this week: {formatINR(paid.viaLinkPaise + paid.offlinePaise)}</p>
            <p className="meta" style={{ margin: 0 }}>
              via link {formatINR(paid.viaLinkPaise)} · paid offline (marked by you) {formatINR(paid.offlinePaise)}
            </p>
          </section>
          <section className="card" aria-labelledby="timeline-h">
            <h2 id="timeline-h" style={{ fontSize: 17, margin: 0 }}>Timeline</h2>
            <ul className="timeline">
              {events.map((e) => (
                <li key={e.id}>
                  <div>
                    {e.kind === 'paid' ? <span className="chip ok" style={{ marginTop: 0, marginRight: 6 }}>Paid</span> : null}
                    {e.detail}
                  </div>
                  <div className="meta">
                    {formatDayShort(parseIso(e.at))}, {formatTime(parseIso(e.at))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
      <BottomNav current="activity" />
    </>
  );
}
