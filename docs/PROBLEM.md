# The problem: chasing overdue Payment Links

Status: **provisionally locked at G1** (6 Oct); the note says so, with n = 37. Evidence: 89 coded items (73 first-hand reviews, 16 context pages) in `docs/evidence/coded.csv`. No merchant was interviewed.

## Who (composite, fictional)

The owner of a one-person catering, coaching or design business that bills on credit. They send a Razorpay Payment Link after each job and run the business from a phone. A handful of links are always a week or more overdue, each from a customer they want to keep.

## The job

*When a customer has not paid a link I sent, I want to remind the right people, in my own words, at the right time, so I get paid without damaging the relationship.*

## How it is done today

- **Razorpay's own reminders** are automatic SMS and email, at most 3 per link, sent only 11 AM to 12 PM and 3 PM to 5 PM, and set up on the Dashboard (E-074; `existing-product.md`). The owner can also resend a link from the Dashboard (E-075). Nothing documented lets the owner do any of this from the app, on WhatsApp, or by choosing whom to chase first.
- **Credit-ledger apps** (Khatabook, OkCredit, Vyapar) are where owners already chase dues. Reviewers describe sending reminders from the app by SMS or WhatsApp (E-001, E-015, E-025), sometimes one customer at a time (E-010, E-021).
- **Before any app**, one owner kept a paper register that was slow and missed entries (E-025).

## Where it hurts

| Friction | Evidence |
| --- | --- |
| SMS reminders get ignored or blocked; owners ask for WhatsApp | E-001, E-002, E-030, E-033, E-035 (but E-027 wants SMS kept) |
| Automatic messages the owner did not approve feel risky to the relationship | E-007, E-018, E-019 |
| Owners want their own, gentler wording | E-003, E-009, E-011, E-028, E-029 |
| One due date per customer; promises not tracked | E-004, E-008, E-020 |
| Sending one by one takes time | E-010, E-021 |
| Hindi reminders not possible | E-022 |

## Hypotheses, with counts (first-hand Collect rows, n = 37)

| ID | Claim | Result |
| --- | --- | --- |
| H1 | Chases by hand (chat, call, one by one) | 14% of 37, weak |
| H2 | Keeps track in notebook, memory or chat | 3% of 37, weak |
| H3 | Worries about the relationship or the wording | 16% of 37, weak |
| H4 | Does the job on the phone | 100% of 37 (every row is a phone-app review, so biased) |

## Why mobile

The owner is rarely at a desk. Ledger-app reviewers already chase from the phone (37 of 37 rows). WhatsApp is the channel they ask for (E-001, E-033), and a vendor blog calls it "the normal channel for client follow-ups" in India (E-082, context). Razorpay's own reminder controls are Dashboard-only (E-074).

## What the app already covers

Creating and sharing links, tracking payments and settlements (E-078, E-080). It does not document deciding whom to chase, WhatsApp reminders in the owner's voice, or logging a promise. Agent Studio lists no agent for a merchant's unpaid links (E-085). Coverage rating: partly (1).

## Limits of this evidence

All first-hand rows are app-store reviews of tools, so owners who chase purely by hand are missing; Reddit refused access. One AI agent coded every row; its blind re-code agreed on 17 of 17, which is not an independent check. Held settlements and disputes show far higher pain (mean 2.9 of 3 against 1.4 for Collect). Collect leads the job score mainly because it is phone-native (`job-score.md`), not because it hurts most. Nothing here is validated with merchants.
