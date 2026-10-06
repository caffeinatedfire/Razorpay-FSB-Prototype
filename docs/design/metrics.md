# How to measure Collect

Every baseline below is `assumed`. None comes from data. Each metric names the prototype event that would feed it (events in plan Appendix E). In production, Razorpay would also join its own Payment Link records (status, `amount_paid`, timestamps).

## North star

**Overdue value recovered within 14 days of the first Collect reminder.** That is the ₹ paid through the link within 14 days of the first `send_confirm`, as a share of the ₹ due at that moment.

- Why this one: it is money in the owner's account, it is measurable from Razorpay's own link data, and it rewards the right chase rather than more chasing.
- Baseline: `assumed` 35%, a placeholder for sizing a test. Razorpay can replace it with the real share for links on automatic reminders (assumption A1).
- Test: a randomised holdout of overdue links kept on today's automatic reminders (assumption A2).
- Events: `send_confirm` (start of window), `paid_seen` (recovery), with link amounts.

## Supporting metrics

| Metric | Definition | Baseline | Event |
| --- | --- | --- | --- |
| Days to paid | Median days from due date to `paid` for links chased through Collect | `assumed` 12 days | `send_confirm`, `paid_seen` |
| Chase-today completion | Share of "Chase today" cards per day that end in a send, a logged reply or "Not now" | `assumed` 60% | `home_view`, `chase_open`, `send_confirm`, `reply_logged` |
| Time per chase | Median seconds from opening a card to the simulated send | `assumed` 60 s | `chase_open`, `send_confirm` (and `timed_start`, `timed_end` in a timed run) |

## Guardrails

| Guardrail | Definition | Threshold | Event |
| --- | --- | --- | --- |
| Disputes after a chase | Links logged "Disputes it" within 7 days of a reminder, per 100 reminders | `assumed` ceiling 3 per 100 | `reply_logged` (kind `disputes`), `send_confirm` |
| Chasing someone who has paid | Sends stopped because the link had already been paid (R06), plus owner-marked "Says they paid", per 100 sends | `assumed` ceiling 2 per 100 | `hard_block_shown` (R06), `reply_logged` (kind `says_paid`) |
| Repeat business | Share of chased customers who receive another link from the same owner within 60 days, against unchased customers | `assumed` no drop | Razorpay link data (not in the prototype) |

Also watched, not a guardrail: how often the owner overrides a soft block (`soft_block_shown` followed by a send). A high rate means the defaults are wrong (A6).

## The two-minute task (P2-T06)

- **Starts** when the owner taps **Start** in Timed run mode on Home (`timed_start`).
- **Ends** when the Sent screen appears (`timed_end`).
- **Target:** 120 seconds or less on first use, and **8 taps or fewer**.
- Happy path as designed: Start, Chase (top card), Send on WhatsApp, Confirm (simulated): 4 taps. A language switch adds 1, and an edit adds a few.
- Tap count is the number of pointer events between `timed_start` and `timed_end`. Timings from the human's test runs are practice data from non-merchants and will be labelled so.
