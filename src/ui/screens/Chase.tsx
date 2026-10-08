import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDayMonth, formatDayShort, parseIso, systemMs, toIstIso } from '../../clock';
import { decideFor, lastReplyFor } from '../../decide';
import { amountDuePaise, daysOverdue } from '../../domain/derive';
import type { Channel, Lang, LinkStatus, PaymentLink, TemplateKind, Tone } from '../../domain/types';
import { formatINR } from '../../format';
import { logEvent } from '../../instrumentation';
import {
  LENGTH_LIMITS, formatHhmm, messageLength, r05Chaseable, r06StatusAtSend, r11BannedLanguage, validateMessage, type RuleHit,
} from '../../rules';
import { LANG_LABELS, TONE_LABELS, renderMessage } from '../../templates';
import { DEFAULT_NEXT_CHECK_DAYS } from '../../store';
import { go, useApp } from '../App';
import { Header, Segmented } from '../components/Chrome';
import { SendSheet } from '../components/SendSheet';

const STATUS_LABEL: Record<LinkStatus, string> = {
  created: 'Unpaid', partially_paid: 'Part paid', paid: 'Paid', expired: 'Expired', cancelled: 'Cancelled',
};

/** Template when the decision has none (a waiting or handed-over link opened from Home). */
function fallbackKind(link: PaymentLink): TemplateKind {
  if (link.promisedDate && link.touchCount >= 1) return 'post_promise';
  return link.touchCount === 0 ? 'first_reminder' : 'follow_up';
}

export function Chase({ id }: { id: string }) {
  const { state, dispatch, clock, now, homeInput } = useApp();
  const link = state.links.find((l) => l.id === id);
  const customer = state.customers.find((c) => c.id === link?.customerId);
  const decision = useMemo(() => (link ? decideFor(homeInput, link) : null), [homeInput, link]);

  // The link as it was when the card opened; compared again at send (R06).
  const opened = useRef<PaymentLink | undefined>(link);
  const kind: TemplateKind = decision?.templateKind ?? (link ? fallbackKind(link) : 'first_reminder');

  const [tone, setTone] = useState<Tone>(decision?.tone ?? state.settings.tone);
  const [lang, setLang] = useState<Lang>(state.settings.lang);
  const [channel, setChannel] = useState<Channel>(decision?.channel ?? state.settings.channel);
  const render = (t: Tone, l: Lang) =>
    link && customer
      ? renderMessage(kind, t, l, {
          name: customer.name, amountPaise: amountDuePaise(link), description: link.description, url: link.shortUrl,
          owner: state.owner.name, business: state.owner.business,
        })
      : '';
  const [text, setText] = useState(() => render(tone, lang));
  const [edited, setEdited] = useState(false);
  const [hard, setHard] = useState<RuleHit[]>([]);
  const [acked, setAcked] = useState<RuleHit['rule'][]>([]);
  const [threat, setThreat] = useState<RuleHit | null>(null);
  const [sheet, setSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const pendingSoft = decision?.hits.find((h) => h.severity === 'soft' && !acked.includes(h.rule))?.rule ?? null;
  useEffect(() => {
    if (pendingSoft) logEvent('soft_block_shown', clock, { rule: pendingSoft, linkId: id });
  }, [pendingSoft, clock, id]);

  useEffect(() => {
    if (link) logEvent('chase_open', clock, { linkId: link.id }); // once per open
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const due = amountDuePaise(link);
  const limit = LENGTH_LIMITS[channel];
  const length = messageLength(text);
  const settledHit = r05Chaseable(link) && link.status !== 'expired' ? r06StatusAtSend(link, link) : null;
  const decisionHard = decision?.hits.find((h) => h.severity === 'hard') ?? settledHit;
  // Soft rules (R01 quiet hours, R03 gap, R08 promise) are shown one at a time; each needs its own confirm.
  const soft = decision?.hits.find((h) => h.severity === 'soft' && !acked.includes(h.rule)) ?? null;
  const needsAck = soft !== null;
  const replies = state.replies.filter((r) => r.linkId === link.id);
  const lastReply = lastReplyFor(state.replies, link.id);
  const touches = state.touches.filter((t) => t.linkId === link.id);

  const changeTone = (t: Tone) => {
    setTone(t);
    setText(render(t, lang));
    setEdited(false);
    setHard([]);
    logEvent('tone_change', clock, { tone: t });
  };
  const changeLang = (l: Lang) => {
    setLang(l);
    setText(render(tone, l));
    setEdited(false);
    setHard([]);
    logEvent('lang_change', clock, { lang: l });
  };
  const changeChannel = (c: Channel) => {
    setChannel(c);
    setHard([]);
    logEvent('channel_change', clock, { channel: c });
  };

  const blockHard = (hits: RuleHit[]) => {
    setHard(hits);
    hits.forEach((h) => logEvent('hard_block_shown', clock, { rule: h.rule, linkId: link.id }));
  };

  const ack = (rule: RuleHit['rule']) => setAcked((a) => [...a, rule]);
  const waitUntil = (iso: string | undefined) => {
    if (iso) dispatch({ type: 'SET_NEXT_CHECK', linkId: link.id, at: iso });
    go('/');
  };

  const trySend = (skipThreatCheck = false) => {
    const current = state.links.find((l) => l.id === link.id) ?? link;
    const stale = r06StatusAtSend(opened.current ?? link, current);
    if (stale) return blockHard([stale]);
    const hits = validateMessage(text, current, channel);
    if (hits.length) return blockHard(hits);
    setHard([]);
    // R11 (soft): only the owner's own edits can introduce banned words; templates are tested clean.
    const r11 = edited && !skipThreatCheck ? r11BannedLanguage(text) : null;
    if (r11) {
      setThreat(r11);
      logEvent('soft_block_shown', clock, { rule: 'R11', linkId: link.id });
      return;
    }
    setThreat(null);
    setSheet(true);
  };

  const confirm = () => {
    const current = state.links.find((l) => l.id === link.id) ?? link;
    const stale = r06StatusAtSend(opened.current ?? link, current);
    if (stale) {
      setSheet(false);
      return blockHard([stale]);
    }
    dispatch({
      type: 'SEND_CONFIRMED', linkId: link.id, text, channel, lang, tone,
      at: toIstIso(clock.now()), nextCheckDays: DEFAULT_NEXT_CHECK_DAYS, sentAtMs: systemMs(),
    });
    logEvent('send_confirm', clock, { linkId: link.id, channel, lang, tone, edited, touch: link.touchCount + 1 });
    go(`/sent/${link.id}`);
  };

  const copy = () => {
    void navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <>
      <div className="scroll">
        <Header back={() => go('/')} />
        <main className="page" id="main">
          <section>
            <div className="row top">
              <h1 className="grow" style={{ fontSize: 20, margin: 0 }}>{customer.name}</h1>
              <div className="amt" style={{ fontSize: 20 }}>{formatINR(due)}</div>
            </div>
            <p className="meta" style={{ margin: '2px 0 0' }}>
              {link.description} · <span className="chip warn" style={{ marginTop: 0 }}>{STATUS_LABEL[link.status]}</span> ·{' '}
              {daysOverdue(link, now)} days overdue
            </p>
          </section>

          <section className="card" aria-labelledby="why-now">
            <h2 id="why-now" style={{ fontSize: 17, margin: 0 }}>Why now</h2>
            <ul className="reasons">
              {(decision?.reasons ?? []).slice(0, 3).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <ol className="meta" aria-label="Timeline" style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
              <li><strong>{formatDayMonth(parseIso(link.createdAt))}</strong> link sent</li>
              <li><strong>{formatDayMonth(parseIso(link.dueAt))}</strong> due</li>
              {touches.map((t, i) => (
                <li key={t.id}><strong>{formatDayMonth(parseIso(t.sentAt))}</strong> reminder {i + 1}</li>
              ))}
              {replies.map((r) => (
                <li key={r.id}>
                  <strong>{formatDayMonth(parseIso(r.loggedAt))}</strong>{' '}
                  {r.kind === 'promised_date' && r.promisedDate ? `promised ${formatDayShort(parseIso(r.promisedDate))}` : r.kind === 'disputes' ? 'disputes it' : r.kind === 'says_paid' ? 'says paid' : 'no reply'}
                </li>
              ))}
              <li><strong>today</strong> {link.status === 'paid' ? 'paid' : 'unpaid'}</li>
            </ol>
          </section>

          <section className="card stack" aria-label="Message">
            <Segmented<Tone> label="Tone" value={tone} onChange={changeTone} options={[{ value: 'polite', label: TONE_LABELS.polite }, { value: 'firm', label: TONE_LABELS.firm }]} />
            <Segmented<Lang>
              label="Language"
              value={lang}
              onChange={changeLang}
              options={(['en', 'hi', 'hinglish'] as Lang[]).map((l) => ({ value: l, label: LANG_LABELS[l], lang: l === 'hi' ? 'hi' : 'en' }))}
            />
            <label htmlFor="message" className="sr-only">Message</label>
            <textarea
              id="message"
              className="msg"
              lang={lang === 'hi' ? 'hi' : 'en'}
              value={text}
              onChange={(e) => {
                if (!edited) logEvent('message_edit', clock, { linkId: link.id });
                setEdited(true);
                setHard([]);
                setText(e.target.value);
              }}
            />
            <div className="row">
              <div className="grow">
                <Segmented<Channel> label="Channel" value={channel} onChange={changeChannel} options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'sms', label: 'SMS' }]} />
              </div>
              <span className={`counter${length > limit ? ' over' : ''}`} aria-live="polite">
                {length} / {limit}
              </span>
            </div>
          </section>

          {decisionHard ? (
            <div className="alert hard" role="alert">{decisionHard.message}</div>
          ) : null}
          {hard.map((h) => (
            <div className="alert hard" role="alert" key={h.rule}>{h.message}</div>
          ))}
          {!decisionHard && soft ? (
            <div className="alert soft stack" role="status" data-testid={`soft-${soft.rule}`}>
              <span>{soft.message}</span>
              {soft.rule === 'R01' ? (
                <>
                  <button type="button" className="btn wide" onClick={() => waitUntil(soft.waitUntil)}>
                    Remind me at {formatHhmm(state.settings.quietStart)}
                  </button>
                  <button type="button" className="btn ghost wide" onClick={() => ack('R01')}>
                    Send anyway
                  </button>
                </>
              ) : soft.rule === 'R03' ? (
                <div className="row">
                  <button type="button" className="btn ghost grow" onClick={() => waitUntil(soft.waitUntil)}>
                    Wait
                  </button>
                  <button type="button" className="btn grow" onClick={() => ack('R03')}>
                    Send anyway
                  </button>
                </div>
              ) : (
                <div className="row">
                  <button type="button" className="btn ghost grow" onClick={() => go('/')}>
                    Wait until {soft.waitUntil ? formatDayShort(parseIso(soft.waitUntil)) : 'later'}
                  </button>
                  <button type="button" className="btn grow" onClick={() => ack(soft.rule)}>
                    Chase anyway
                  </button>
                </div>
              )}
            </div>
          ) : null}
          {threat ? (
            <div className="alert soft stack" role="status" data-testid="soft-R11">
              <span>{threat.message}</span>
              <div className="row">
                <button type="button" className="btn ghost grow" onClick={() => setThreat(null)}>
                  Edit message
                </button>
                <button type="button" className="btn grow" onClick={() => trySend(true)}>
                  Send anyway
                </button>
              </div>
            </div>
          ) : null}
          {lastReply?.kind === 'promised_date' && decision?.templateKind === 'post_promise' ? (
            <p className="meta" style={{ margin: 0 }}>The promised date has passed. This message checks in on it.</p>
          ) : null}

          {!decisionHard && !needsAck && !threat ? (
            <button type="button" className="btn wide" onClick={() => trySend()}>
              {channel === 'whatsapp' ? 'Send on WhatsApp' : 'Send as SMS'}
            </button>
          ) : null}
          <div className="row">
            <button type="button" className="btn ghost grow" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" className="btn plain grow" onClick={() => go('/')}>
              Not now
            </button>
          </div>
        </main>
      </div>
      {sheet ? (
        <SendSheet customer={customer} channel={channel} text={text} onConfirm={confirm} onCancel={() => setSheet(false)} />
      ) : null}
    </>
  );
}
