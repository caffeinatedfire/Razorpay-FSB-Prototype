# Collect: chasing overdue payment links in two minutes

Track 1, Razorpay in Your Pocket · Samik Gandhi · Concept prototype, not a Razorpay product

## 1. The job

A one-person catering, coaching or design business (composite, fictional) bills on credit and sends a Razorpay Payment Link after each job. Some links are always overdue. The job: remind the right customers, in my own words, at the right time, without losing them. I chose chasing overdue Razorpay Payment Links because it is a frequent job that fits on a phone and that I could evidence from public sources and build end to end in five days, not because it is the most painful problem a merchant has.

## 2. How it is done today, and where it hurts

Razorpay's reminders are automatic SMS and email, at most 3 per link, sent only 11 AM to 12 PM and 3 PM to 5 PM, and set up on the Dashboard. Nothing documented lets the owner choose whom to chase, use WhatsApp or log a promise from the app. In 37 public app-store reviews about chasing payments (89 items coded), owners say SMS gets ignored, ask for WhatsApp, want gentler wording of their own, and fear reminders sent through an app will "break relation". The evidence is thin: only 14% of 37 describe chasing by hand.

## 3. Why mobile

The owner works between jobs, away from a desk, and the customer lives on WhatsApp. All 37 reviewers chase from a phone app (a biased sample, since they are app reviews).

## 4. The two-minute flow

1. Home shows what is owed and up to 5 links to chase today, each with a plain reason.
2. **Chase** opens "Why now" and a ready message: Gentle or Firm; English, Hindi or Hinglish; signed by the owner.
3. Collect blocks a wrong amount or link, and asks again at night, within 48 hours of the last message, or before a promised date.
4. **Send on WhatsApp** opens a sheet marked SIMULATED; the owner confirms.
5. Sent sets a next check and offers Undo for 10 seconds.
6. **Log a reply**: a promise pauses chasing; a dispute goes to "Needs you".

Practice runs, not merchants: 3 first-use runs by non-merchants took a median 27.5 s from Start to Sent, and 9 taps by a counter that also counted scrolls (target 8). The designed path is 3 taps.

## 5. Product and AI decisions, and what I left out

- **The owner taps send**, not scheduled sending: one wrong message can cost a customer.
- **Fixed, editable templates with hard checks**, not AI-written text: no wrong amount, and every rule is tested.
- **Hand-off to the owner's own WhatsApp**, not the Business API: the message comes from the owner.

Left out: autonomous sending, AI messages, bulk blasts, late fees, credit scoring, legal notices, and cancelling or refunding links.

## 6. How to measure it

North star: overdue value recovered within 14 days of the first reminder. Baseline 35%, assumed; Razorpay can replace it with its own figure for links on automatic reminders and test Collect against a holdout. Guardrails: disputes after a chase, and reminders to customers who had already paid.

## 7. What is proven and what is not

Built: 6 screens, 18 rules each with a test, 3 languages, running in a phone browser. Not proven: it runs on synthetic data; no merchant was interviewed; the evidence is public reviews coded by an AI agent; no Razorpay API was called. The sign-off in messages is my own name, not a merchant's.

---

Prototype: https://rzp-fsb-cf-ptype.vercel.app/ · AI build log: https://github.com/caffeinatedfire/Razorpay-FSB-Prototype/blob/main/docs/ai-build-log.md · Built with Claude Code (Anthropic) for evidence coding, code, tests and drafts; React, Vite, TypeScript and Playwright; public Google Play and App Store reviews and Razorpay's public docs; hosted on Vercel.
