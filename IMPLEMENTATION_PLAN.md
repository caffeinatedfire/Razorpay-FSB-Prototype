---
plan: razorpay-collect-prototype
version: 1
written: 2026-10-06T13:15+05:30
timezone: Asia/Kolkata
track: 1 (Razorpay in Your Pocket)
submit_by: 2026-10-11T12:00+05:30
official_deadline: 2026-10-13T23:59+05:30
audience: a human reader and an autonomous coding agent (Claude Code or similar)
---

# Implementation plan: "Collect", a two-minute overdue-payment chase for Razorpay's mobile app (Track 1)

**What gets built.** A phone-sized web app called Collect. A small-business owner who bills on credit opens it, sees which overdue Razorpay Payment Links to chase today and why, sends a pre-filled WhatsApp or SMS reminder in a few taps, logs what the customer said, and watches the link turn paid. Plain rules decide who to chase and when; the owner always taps send. It runs in the browser on synthetic data, so a judge can open it on a phone. An optional bridge connects it to Razorpay test mode.

**Why it is shaped this way.** Track 1 of the Razorpay x ISB AI PM Build Challenge asks for one merchant job done start to finish on mobile, ideally within two minutes. Submissions are judged on problem clarity, depth of merchant understanding, product judgment, how AI sped up the build, and clarity of the note and pitch [Certain: brief p. 2]. The submission is a one-page note, a 90-second video, a demonstrable prototype and an AI build log. Incomplete submissions are not evaluated and nothing can change after submitting [Certain: brief pp. 3 to 4]. AI shows up in how this is built, not in what runs: the agent's own logs and your gate decisions become the AI build log.

**Honest weak spot.** No merchant replied to outreach, so "depth of understanding of the merchant" will be the weakest criterion. This plan answers it with a sourced public-evidence table, three timed test runs you do yourself, and an assumptions register that says how Razorpay could check each claim on its own data. It never claims merchant validation.

**Starting state: Tue 6 Oct 2026, 13:00 IST.** Five days remain to submit by Sun 11 Oct, 12:00 IST. The official deadline is Tue 13 Oct, 23:59 IST; Mon 12 and Tue 13 Oct are buffer for form failures only [Certain]. Track 2 is dropped. Track 1 maps to the Full Stack Builder PPO [Certain: brief pp. 1 to 2], which you have said you accept.

**Contents.** 0 How to read and use this file. 1 Before you start. 2 Ground rules. 3 Phases and gates at a glance. 4 The phases P0 to P7. 5 The six human gates. Appendices: A commands and environment; B repository layout; C domain types and fixtures; D rules, default actions and ranking; E screens and instrumentation; F message templates; G evidence scheme and assumptions; H storyboard; I templates for logs, gates, note and AI build log; J Razorpay Payment Links cheat sheet; K `CLAUDE.md` content.

## 0. How to read and use this file

**Human, 60 seconds.** Read the table in section 3. Do the checklist in section 1. After that your job is the six gates in section 5: at each one the agent stops, tells you exactly what to look at, and waits for your reply. Your total attention is about 4 hours 15 minutes over five days `[Guessing]`. IDs such as P1-T03 are labels for the agent; you can ignore them.

**Start the agent.** In an empty folder, save this file as `IMPLEMENTATION_PLAN.md`, open Claude Code there, and send:

```
Read IMPLEMENTATION_PLAN.md completely. Work autonomously through the phases in order, starting at the first phase whose Status is not done or cut. Stop at every gate in section 5 and at every stop-and-ask trigger in section 2. Do not start the next phase until I reply to a gate.
```

**Agent.** Read sections 0 to 3, then the first unfinished phase in section 4 and the appendices it cites. This file is self-contained. If this file and your own idea disagree, this file wins. If this file is ambiguous, stop and ask the human.

**Conventions.**
- IDs: phases `P0` to `P7`, tasks `P1-T03`, acceptance checks `P1-A02`, rules `R01` to `R18`, decisions `D-01`, assumptions `A1` to `A8`, hypotheses `H1` to `H4`, evidence rows `E-001`, gates `G1` to `G6`.
- A task is done when its box is ticked and the acceptance checks that cover it pass. Phase status lives in one place: the `Status:` line under each phase heading (`not started`, `in progress`, `waiting at G#`, `done`, `cut`).
- All times are IST. "Agent hours" are wall-clock estimates for the agent; "your minutes" are the human's attention at a gate. Both are `[Guessing]`.
- Confidence tags: `[Certain]` verified, `[Likely]` strong evidence, `[Guessing]` filling a gap. Untagged statements in the phases are instructions.
- Commands work on Node 20 or newer in PowerShell, cmd and bash. No shell-only syntax in `package.json` scripts. The human is probably on Windows `[Likely]`.

**Working loop (every task).**
1. Restate the acceptance check the task serves.
2. For rules, validators and mappers, write the failing test first. For UI, write a component test or a Playwright check.
3. Implement the smallest change that passes.
4. Run `npm run check`. It must be green before ticking the box.
5. Tick the box in this file, then add a build-log entry (Appendix I).
6. Commit with the message format in Appendix I.

**Gate protocol (every gate).**
1. Confirm all acceptance checks for the phase pass.
2. Write `docs/gates/G#.md` from the gate template in Appendix I. Fill in every field.
3. Set the phase `Status:` to `waiting at G#`.
4. Print one message: `GATE G#: waiting for human. Open docs/gates/G#.md.` Then stop. Do nothing else, including prep work for the next phase. Bug fixes inside the finished phase are allowed.
5. The human replies with one of: `approved`, `approved with changes: <list>`, `rework: <what>`, `stop`.
6. Copy the human's reply word for word into `docs/decision-log.md` with the time (this becomes the "decisions I made" part of the AI build log). Then act on it. `approved with changes` means do the changes, re-run the acceptance checks, then continue without a second gate unless a change alters scope. `rework` means redo and gate again.
7. Silence is not approval. Never proceed on a guess about what the human would say.

**Resume protocol.** If the session restarts or the context fills: read this file, the last three entries of `docs/build-log.md`, `docs/decision-log.md` and `git log -10`, then continue from the first unticked task of the first unfinished phase. Do not redo ticked tasks. Do not trust memory of earlier sessions; trust the files.

## 1. Before you start (human, about 10 minutes)

Do these before the agent begins. Put anything you have into the repo folder once the agent has created it, or into a temporary folder you hand over.

- [ ] **Confirm the job.** The plan is written for one job: chasing overdue Razorpay Payment Links ("Collect"). Reply "job: collect" to the agent as your first message. If you want a different job (card disputes, held payouts), tell your planner chat now and ask for a regenerated plan. Do not swap jobs mid-run.
- [ ] **Put your availability on record.** Gates are timed for Tue 6 Oct 7 PM, Wed 7 Oct 9 AM and 8 PM, Thu 8 Oct 9 PM, Sat 10 Oct 2 PM and Sun 11 Oct by 12 PM. If you cannot meet one, tell the agent which windows you do have. The agent will not move the Fri 9 Oct, 12 PM freeze.
- [ ] **Machine.** Node 20 or newer, git, and Claude Code with web search and fetch turned on. About 1 GB free disk for browsers used in tests and the video.
- [ ] **Optional: evidence you already have.** Any coded forum or review notes from the Track 2 research (for example `step0-coded.json`) go in `docs/evidence/inbox/` of the new repo. The agent uses them only for the Collect job and marks them `origin: human_inbox`.
- [ ] **Optional: Razorpay test-mode keys** (`rzp_test_` only), for phase P5. Skip them if you do not have a Razorpay account; P5 is then cut.
- [ ] **Optional: your own WhatsApp number**, for the one real hand-off test at G3. It goes in `.env.local` and is never committed or hosted.
- [ ] **Optional: a Track 2 repo.** If a `razorpay-collections-agent` folder exists with phase P1 done, tell the agent its path. It may copy `src/clock.ts`, `src/format.ts` and the seeded fixture-generator pattern, nothing else.
- [ ] **Open the Google Form** from the brief, list its fields, and paste them into `docs/form-fields.md` once the repo exists. The agent cannot open it. If the form needs a file upload or a link for each item, write that down too.

## 2. Ground rules (apply to every phase)

1. **Autonomy with brakes.** Run each phase to its gate without asking. Stop only at gates and at the triggers below.
2. **No fabrication.** Never invent a quote, statistic, interview, merchant, source or timing. A composite example must be labelled "composite, fictional". Any number in any deliverable carries a tag: real, simulated or assumed, plus its source file.
3. **No real outbound messages.** The prototype never sends a WhatsApp message, SMS or email to a real person (R15). The WhatsApp button opens a simulated sheet. The only real hand-off is to the human's own number, from `.env.local`, in dev builds.
4. **Test mode only.** Razorpay keys must start `rzp_test_`. The string `rzp_live_` anywhere in the repo or its history fails `npm run guard`.
5. **Synthetic people only.** Customers, owners, phone numbers and businesses in fixtures are invented. Phone numbers use the fictional pattern `+91 00000 000NN`. No forum handles, usernames or real names appear anywhere in the repo, fixtures, note or video.
6. **Public sources only, politely.** Read public pages with the web tools. No logins, no paywall tricks, no mirrors, caches or proxies to get past a refusal. If a site refuses, log it in `docs/evidence/sources-log.md` and move on. Quote at most 20 words per source, verbatim and in quotation marks, with its URL.
7. **Time and money.** Time comes from the injected `Clock` (R14); no `Date.now()` or argument-less `new Date()` outside `src/clock.ts`. Money is integer paise, formatted with `formatINR` (R13).
8. **Rules in code.** The product contains no AI at runtime. Messages come from templates (Appendix F). Rules (Appendix D) decide eligibility, timing and limits, each with a test.
9. **Never weaken a test or a rule to get green.** Fix the cause or stop and ask.
10. **Stay in the sandbox.** Work only inside the repo folder. No global installs, no `sudo`, no deleting outside the repo, no changes to other folders, no pushing to any remote unless the human asks.
11. **Label the unreal.** Every simulated element shows the word SIMULATED on screen. Evidence rows show their source. Assumptions show `assumed`.
12. **Do not copy Razorpay's branding.** No Razorpay logo, mark or screenshots. The text "Razorpay" appears only as a plain-text reference. Visual design is neutral.

**Stop and ask the human when:**
- this file is ambiguous or two parts conflict;
- the Collect job is not the best-supported job at G1 (the human decides; a swap means a regenerated plan);
- a task needs a decision not written here: a new rule, a new action type, a new dependency with a native build step;
- a live key, a real person's data or a real outbound message would be involved;
- a test keeps failing after three honest attempts;
- a phase has used more than 125% of its agent-hour estimate: ask whether to apply its cut list;
- a source or tool refuses access and the task cannot continue without it.

## 3. Phases and gates at a glance

| Phase | What you get | Gate after it | Gate time (IST) | Agent hours | Your minutes | If late, cut |
| --- | --- | --- | --- | --- | --- | --- |
| P0 Foundations | Repo, guard rails, logs, templates | none | Tue 6 Oct, 3 PM ready | 0.75 | 0 | nothing |
| P1 Evidence and problem lock | A sourced one-page problem statement; a recommendation to lock or switch the job | G1 Problem lock | Tue 6 Oct, 7 PM | 4 | 30 | evidence target 60 to 40 rows |
| P2 Design and storyboard | Journey map, 6 wireframes, decisions, metrics, brief-coverage matrix | G2 Design sign-off | Wed 7 Oct, 9 AM | 3 | 30 | Hindi and Hinglish variants in the storyboard |
| P3 Happy-path build | Clickable Collect on fixtures, runs on your phone | G3 Your phone | Wed 7 Oct, 8 PM | 6 | 45 | screens 4 to 6 move to P4 |
| P4 Edge states and rules | All rules tested, all 6 screens, 3 languages, accessibility | none | Thu 8 Oct, 3 PM ready | 5 | 0 | undo; Activity screen detail |
| P5 Razorpay test-mode bridge (optional) | One real test-mode link round trip | G4 Feature-complete | Thu 8 Oct, 9 PM | 3 | 30 | whole phase |
| P6 Demo, note, video, logs | Frozen build, video, one-page note, AI build log, numbers audit | G5 Content review | Sat 10 Oct, 2 PM | 5 | 60 | video re-takes |
| P7 Package and submit prep | Deployable build, submission pack, fresh-clone proof | G6 Submit | Sun 11 Oct, by 12 PM | 2 | 60 | nothing |

Totals: agent about 28.75 hours; your attention 255 minutes (4 hours 15 minutes) `[Guessing]`.

**Dates that do not move.**
- Fri 9 Oct, 12:00: feature freeze (tag `freeze-1`). After it, only written bug fixes.
- Sat 10 Oct, 18:00: note, video and logs complete.
- Sun 11 Oct, 12:00: submit.
- Mon 12 and Tue 13 Oct: buffer for form failures only. No changes to the work.

**Global cut order** when time runs short, first to last:
1. P5 (the Razorpay test-mode bridge) is cut.
2. The undo feature (R16) and detail in the Activity screen.
3. The evidence target drops from 60 to 40 coded rows.
4. Firm-tone variants of the Hindi and Hinglish templates.
5. The second and third timed test runs at G3 drop to one.

**Never cut:** the evidence table with sources, the rule tests, the happy-path end-to-end test, the SIMULATED labels, the numbers audit, the note, the video, the AI build log.

**If behind at G3 (Wed 8 PM).** If the happy path is not clickable on the human's phone, switch to Squeezed mode: P4 shrinks to the rules R01 to R10 with tests and three edge states (promise, stale status, quiet hours), P5 is cut, and the schedule from P6 stays as dated.

## 4. Phases

## Phase P0: Foundations and guardrails

Status: done
Target: Tue 6 Oct, 3:00 PM IST (2026-10-06T15:00+05:30)
Agent hours: 0.75
Gate in: the human has sent "job: collect" and done the section 1 checklist
Gate out: P0-A01 to P0-A04 pass. No human gate.

**Goal.** An empty app whose `npm run check` passes, with guards, logs and templates in place so every later commit is traceable and safe.

**Tasks.**
- [x] P0-T01 Capability check. Record in `docs/capabilities.md`: Node version (20 or newer), npm, git, whether web search and web fetch tools work, whether `npx playwright install chromium` succeeds, whether `ffmpeg` exists (optional, for mp4). If a required item is missing, stop and ask.
- [x] P0-T02 Create the folder `razorpay-collect-prototype`, run `git init`, and write `.gitignore` for `node_modules`, `dist`, `out`, `.env`, `.env.local`, `test-results`, `playwright-report`, `*.local.json`.
- [x] P0-T03 Scaffold Vite, React and TypeScript (strict), plus `vitest`, `@testing-library/react`, `jsdom`, `@playwright/test` and `@axe-core/playwright` as dev dependencies. No server, no database, no package that needs a native build. Add `public/manifest.webmanifest` (name "Collect (concept prototype)", `display: standalone`, a neutral theme colour) and the mobile viewport meta tag.
- [x] P0-T04 Copy this file to `IMPLEMENTATION_PLAN.md`. Write `CLAUDE.md` from Appendix K. Create `docs/build-log.md`, `docs/decision-log.md` (seed D-01 to D-10 from Appendix I), `docs/gates/`, `docs/evidence/inbox/` and `docs/evidence/sources-log.md`. Create `docs/form-fields.md` if the human has not (leave the header and a "pending" line).
- [x] P0-T05 Create the `package.json` scripts listed in Appendix A.
- [x] P0-T06 Write `scripts/guard.mjs` with the checks in Appendix A. Add a test that plants `rzp_live_x` in a temp file and expects the guard to fail.
- [x] (skipped: no Track 2 repo exists) P0-T07 If the human gave the path of a Track 2 repo, copy only `src/clock.ts`, `src/format.ts` and the seeded generator pattern, then adapt them to Appendix C. Otherwise skip.
- [x] P0-T08 Commit `P0: scaffold` with a build-log entry.

**Acceptance (run these).**
- [x] P0-A01 `npm run check` exits 0.
- [x] P0-A02 The guard test passes: a planted `rzp_live_` string makes `npm run guard` exit non-zero.
- [x] P0-A03 `docs/capabilities.md` exists and names every item in P0-T01.
- [x] P0-A04 `docs/decision-log.md` contains D-01 to D-10, and D-02 carries the human's confirmation line ("job: collect", time, word for word).

**If late, cut.** Nothing. This phase is under an hour.

**Do not.** Install global packages. Add a backend. Add a UI library beyond React.

## Phase P1: Evidence and problem lock

Status: waiting at G1
Target: Tue 6 Oct, 7:00 PM IST (2026-10-06T19:00+05:30)
Agent hours: 4
Gate in: P0 done
Gate out: P1-A01 to P1-A05 pass, then gate G1. Next phase waits for the human's reply.

**Goal.** A one-page, sourced `docs/PROBLEM.md` that states who the merchant is, what job they are doing, how they do it today, where it hurts, and why mobile, backed by at least 40 coded public items, plus an honest recommendation to lock the Collect job or switch.

**Why now.** The brief judges importance and clarity of the problem and depth of merchant understanding. With no interviews, a transparent public-evidence table is the only defensible substitute, and its limits must be stated.

**Tasks.**
- [x] (inbox empty at 13:40; re-run when the human adds files) P1-T01 Intake. Read everything in `docs/evidence/inbox/`. Normalise each usable item into `docs/evidence/coded.csv` using the schema in Appendix G, with `origin: human_inbox`. Skip and log items with handles you cannot strip.
- [x] P1-T02 Existing-product check. Re-read these pages and record in `docs/evidence/existing-product.md` what Razorpay's mobile app and Payment Links already do for unpaid links, with URL and access date for each: `https://razorpay.com/payments-app/`, the Razorpay app listings on the App Store and Google Play (`com.razorpay.payments.app`), `https://razorpay.com/docs/payments/payment-links/reminders/` and `https://razorpay.com/docs/payments/payment-links/`. As read on 3 Oct 2026 `[Certain]`: link reminders are automatic, SMS and email only, at most 3 per link, sent only 11 AM to 12 PM and 3 PM to 5 PM; WhatsApp is not listed; the docs do not say whether reminders are configurable from the mobile app. Confirm or correct each point. Also read the public Razorpay disputes and settlements documentation pages that search turns up, for the other two jobs. Rate how much of each job the app and docs already cover: 0 fully, 1 partly, 2 not covered or not documented (Appendix G uses these ratings).
- [x] P1-T03 Mine public sources using the search plan in Appendix G. Target 60 coded rows in total, at least 25 first-hand rows (forum and app-review items) for the Collect job, at least 10 first-hand rows each for the two alternative jobs (card disputes, held payouts). Hard floor 40 total. Log every source tried, read or blocked, in `docs/evidence/sources-log.md`.
- [x] P1-T04 Code every item with the scheme in Appendix G. Then re-code a random 20% blind to the first pass and write the percentage agreement on the `job` field to `docs/evidence/agreement.json`.
- [x] P1-T05 Score the three jobs with the formula in Appendix G and compute H1 to H4 for the Collect job with their n. Write `docs/evidence/job-score.md` showing the arithmetic.
- [x] P1-T06 Write `docs/PROBLEM.md`: a composite fictional persona, a one-sentence job statement, how the job is done today (with evidence IDs), where it hurts (with evidence IDs), why mobile, what the app already covers, H1 to H4 with counts, and a "limits of this evidence" paragraph. At most 450 words outside tables.
- [x] P1-T07 Write `docs/assumptions.md` with assumptions A1 to A8 (Appendix G lists the starters) and, for each, the check Razorpay could run on its own data.
- [x] P1-T08 Prepare the G1 pack (section 5 describes it) and set status to `waiting at G1`.

**Acceptance (run these).**
- [x] P1-A01 `docs/evidence/coded.csv` has at least 40 rows, every row has a URL and an access date, and `npm run guard` finds no `@handle`, `u/handle` or username-like token in `docs/evidence/`.
- [x] P1-A02 `docs/PROBLEM.md` is 450 words or fewer outside tables, and every percentage in it is written with its n (for example "42% of 31").
- [x] P1-A03 `docs/evidence/existing-product.md` lists at least four sources with URL and access date, and gives the coverage rating with a one-line reason.
- [x] P1-A04 `docs/evidence/agreement.json` exists.
- [x] P1-A05 `docs/evidence/job-score.md` shows the arithmetic, and the recommendation follows the switch rule in Appendix G exactly.

**If late, cut.** The target drops from 60 to 40 rows. Below 40, do not invent: mark the problem lock "provisional", state n in `PROBLEM.md`, and ask the human at G1.

**Do not.** Invent items or quotes. Include usernames or handles. Read behind a login. Use a mirror or cache to get past a refusal. Start P2 before G1 is approved. If the best-supported job is not Collect, do not switch silently: present it at G1 and stop (a swap needs a regenerated plan).

## Phase P2: Design and storyboard

Status: not started
Target: Wed 7 Oct, 9:00 AM IST (2026-10-07T09:00+05:30), ready for review
Agent hours: 3
Gate in: G1 approved
Gate out: P2-A01 to P2-A05 pass, then gate G2.

**Goal.** Everything the human needs to judge the product on paper before code: today-versus-tomorrow journey, wireframes of six screens, decisions with rejected alternatives, metrics, the 90-second storyboard, and a matrix proving the six Track 1 elements are covered.

**Tasks.**
- [ ] P2-T01 Journey map in `docs/design/journey.md`: "Today" versus "With Collect", step by step, each friction point tagged with evidence IDs from `coded.csv`.
- [ ] P2-T02 Persona card (composite, labelled fictional) and the job statement, copied from `PROBLEM.md`.
- [ ] P2-T03 Wireframes for S1 to S6 (Appendix E) as static HTML in `docs/design/wireframes/`, exported to PNG at 390 by 844 with Playwright. Each PNG caption names the Track 1 element it supports.
- [ ] P2-T04 Decisions in `docs/design/decisions.md`: at least five product decisions, each stating the choice, the rejected alternative and the reason. Include "what I chose not to build" with at least six items (Appendix D lists starters).
- [ ] P2-T05 Metrics in `docs/design/metrics.md`: one north star, three supporting metrics, three guardrails, each with a definition, a baseline marked `assumed`, and the instrumentation event it would use (Appendix E lists the events).
- [ ] P2-T06 Define "the two-minute task": it starts when the human taps Start in Timed run mode on Home and ends when the Sent screen appears. Target: 120 seconds or less on first use and 8 taps or fewer. Write this in `docs/design/metrics.md`.
- [ ] P2-T07 Storyboard for the 90-second video from Appendix H, with captions drafted. Total must be 90 seconds or less.
- [ ] P2-T08 Brief-coverage matrix in `docs/design/coverage.md`: the six Track 1 elements (who and what; how they do it today and friction; why mobile; a flow that finishes the task, ideally in two minutes; key decisions and what was left out; how to measure) against the note section, screen and video seconds that cover each. Add a row for each of the five judging criteria with the evidence you will show.
- [ ] P2-T09 Prepare the G2 pack and set status to `waiting at G2`.

**Acceptance (run these).**
- [ ] P2-A01 Six PNGs exist at 390 by 844 in `docs/design/wireframes/`.
- [ ] P2-A02 `decisions.md` has at least 5 decisions and at least 6 not-building items.
- [ ] P2-A03 `metrics.md` states the north star, 3 supporting metrics, 3 guardrails and the two-minute task definition.
- [ ] P2-A04 `coverage.md` has all six elements and all five criteria filled, with no empty cell.
- [ ] P2-A05 The storyboard timings in `docs/design/storyboard.md` sum to 90 seconds or less.

**If late, cut.** Hindi and Hinglish variants in the storyboard captions.

**Do not.** Write app code. Introduce a feature not in Appendix E without stopping to ask.

## Phase P3: Happy-path build

Status: not started
Target: Wed 7 Oct, 8:00 PM IST (2026-10-07T20:00+05:30)
Agent hours: 6
Gate in: G2 approved
Gate out: P3-A01 to P3-A07 pass, then gate G3.

**Goal.** The core job works end to end on fixtures and runs on the human's phone: Home, Chase, Sent, with the simulated send sheet, the ranking and its reasons, and the timing instrumentation.

**Tasks.**
- [ ] P3-T01 Write `src/domain/types.ts` exactly as in Appendix C. Write `src/clock.ts` (`SystemClock`, `FixedClock`, `DemoClock`) and `src/format.ts` with `formatINR(paise)`, for example 1250000 becomes `₹12,500`.
- [ ] P3-T02 Write `scripts/gen-fixtures.ts` and generate `fixtures/links.synthetic.json` per Appendix C (seed 7, 30 links, 14 customers). Output must be byte-identical on every run. Add `fixtures:verify`, which prints the SHA-256 of two generations.
- [ ] P3-T03 Implement `src/rules/` for the rules needed by the happy path: R04, R05, R06, R07, R08, R09, R10, R12, R13, R14. Each is a pure function with a passing and a failing test whose title starts with its ID, for example `R05 does not chase a paid link`.
- [ ] P3-T04 Implement `src/rank/` (score and plain-English reasons) and `src/decide/` (default action table), both per Appendix D.
- [ ] P3-T05 Implement `src/templates/` for English, polite and firm, per Appendix F, with a renderer that fills slots and a validator for R09, R10 and R12.
- [ ] P3-T06 Implement the store: a reducer plus `localStorage` persistence under the key `collect.v1`, a `resetDemoData()` function, and a hosted-safe default of `DemoClock` starting at Tue 6 Oct 2026 11:00 IST. Allow a dev and demo override `?now=<ISO>`.
- [ ] P3-T07 Build screens S1 (Home), S2 (Chase) and S3 (Sent) per Appendix E, plus the simulated send sheet (labelled SIMULATED, no WhatsApp logo) and a minimal Activity timeline for S5. Bottom navigation: Home, Activity, Settings (Settings is a stub).
- [ ] P3-T08 Implement instrumentation and Timed run mode (Appendix E): events to `localStorage` key `collect.events`, a Start button on Home when Timed run is on, and a hidden `?debug=1` button that exports `timings.csv`.
- [ ] P3-T09 Playwright e2e `tests/e2e/happy-path.spec.ts` at 390 by 844: Home shows at least 3 "Chase today" cards; open the first; press Send; confirm in the simulated sheet; reach Sent; the link's `touchCount` is 1. Add an axe check for S1 to S3 and a no-horizontal-scroll assertion. Save screenshots to `docs/evidence/p3/`.
- [ ] P3-T10 Add `npm run lan`, which runs the Vite dev server with `--host` and prints the local-network URL, and a README section "Open it on your phone" with the steps and a fallback (`docs/deploy.md`, written in P7, covers static hosting).
- [ ] P3-T11 Prepare the G3 pack and set status to `waiting at G3`.

**Acceptance (run these).**
- [ ] P3-A01 `npm run test:rules` passes for R04 to R10, R12 to R14 as listed in P3-T03.
- [ ] P3-A02 `npm run fixtures:verify` prints identical hashes.
- [ ] P3-A03 `npm run e2e` passes the happy path, and instrumentation records 8 taps or fewer from Start to Sent.
- [ ] P3-A04 The axe check reports 0 critical or serious violations on S1 to S3.
- [ ] P3-A05 No horizontal scroll at 390 px on S1 to S3.
- [ ] P3-A06 `npm run check` exits 0.
- [ ] P3-A07 `npm run lan` prints a local-network URL, and fetching that URL returns the app's HTML. (The human opens it on a phone at G3.)

**If late, cut.** Screens S4 to S6 (they belong to P4 anyway). Settings stays a stub.

**Do not.** Add AI calls, a backend or a database. Send real messages. Use `Date.now()` outside `src/clock.ts`.

## Phase P4: Edge states, rules, languages and accessibility

Status: not started
Target: Thu 8 Oct, 3:00 PM IST (2026-10-08T15:00+05:30)
Agent hours: 5
Gate in: G3 approved (with any changes done)
Gate out: P4-A01 to P4-A07 pass. No separate gate: G4 follows P5, or follows P4 if P5 is cut, no later than Thu 9 PM.

**Goal.** The product behaves sensibly when things go sideways: quiet hours, promises, stale status, disputes, expired links, part payments, undo. All 18 rules are tested, all six screens exist, three languages render, and accessibility holds.

**Tasks.**
- [ ] P4-T01 Apply the human's G3 changes first and note them in the build log.
- [ ] P4-T02 Implement the remaining rules R01, R02, R03, R11, R15, R16, R17 and R18 with tests. Add `scripts/check-rule-coverage.mjs`, which fails unless every R01 to R18 has a test title starting with its ID, and add it to `npm run guard`.
- [ ] P4-T03 Build S4 (Log reply) and S6 (Settings) per Appendix E. Settings has quiet hours, max touches, minimum gap, default tone, default language, Reset demo data, Timed run toggle, and Demo controls: "Simulate: payment arrives" and "Simulate: customer disputes" for a chosen link.
- [ ] P4-T04 Home sections "Needs you" (hand-to-me and reissue) and "Waiting on a promise", with the date each is waiting for.
- [ ] P4-T05 Language and tone: English, Hindi (Devanagari) and Hinglish, polite and firm, switchable on S2. Check that Devanagari renders with the bundled system fonts at 390 px with no clipped glyphs.
- [ ] P4-T06 Edit handling: when the owner edits the message, run R09, R10, R12 as hard blocks and R11 as a soft warning, with plain-English messages (Appendix E).
- [ ] P4-T07 Stale status: sending re-reads the link; if "Simulate: payment arrives" was triggered after the card opened, the send is aborted and the card says "Already paid" (R06).
- [ ] P4-T08 Undo (R16): ten seconds on S3. The copy states plainly: "Undo only updates this app. It cannot unsend a message."
- [ ] P4-T09 Empty, error and offline states for S1 and S2. Respect `prefers-reduced-motion`. Tap targets at least 44 px. Text works at 200% browser zoom without loss of function.
- [ ] P4-T10 Playwright e2e specs: promise flow (log "Promised Friday", the link moves to Waiting with its date); paid flow; stale flow; quiet-hours flow using `?now=2026-10-06T22:30:00+05:30` (primary button reads "Remind me at 9:00 AM"); Hindi render; dispute flow (link moves to Needs you). Axe on all six screens. Save screenshots to `docs/evidence/p4/`.
- [ ] P4-T11 Update `docs/design/decisions.md` if any decision changed during the build, and add a D-entry for each change.

**Acceptance (run these).**
- [ ] P4-A01 `node scripts/check-rule-coverage.mjs` prints 18 of 18 rules covered.
- [ ] P4-A02 `npm run e2e` passes all specs in P4-T10.
- [ ] P4-A03 The axe check reports 0 critical or serious violations on S1 to S6.
- [ ] P4-A04 A test asserts the Hindi template renders Devanagari characters and passes R09, R10, R12.
- [ ] P4-A05 A test asserts every template, in every language and tone, passes R11 (the banned-language lexicon in Appendix F).
- [ ] P4-A06 `npm run guard` passes: no `Date.now(` outside `src/clock.ts`, no `wa.me` outside the real-hand-off module, no `rzp_live_`.
- [ ] P4-A07 `npm run check` exits 0.

**If late, cut.** Undo (R16) and its test; detail in the Activity screen.

**Do not.** Relax a rule to make a flow easier. Add a feature outside Appendix E.

## Phase P5: Razorpay test-mode bridge (optional)

Status: not started
Target: Thu 8 Oct, 8:00 PM IST (2026-10-08T20:00+05:30)
Agent hours: 3
Gate in: P4 done and the human supplied `rzp_test_` keys. Otherwise mark this phase `cut` and say so in the build log.
Gate out: P5-A01 to P5-A04 pass, then gate G4.

**Goal.** One real round trip on Razorpay test mode, so the note can say "tested against Razorpay's Payment Links API in test mode": a link is created, a status flows back when it is paid, and the app falls back to fixtures when the bridge is off.

**Tasks.**
- [ ] P5-T01 Read the Payment Links API docs at `https://razorpay.com/docs/api/payments/payment-links/`. Confirm Appendix J (endpoints and parameters) and write any difference to the decision log. Appendix J is `[Likely]` until this task is done.
- [ ] P5-T02 Create `bridge/` (Express, TypeScript, runs only on localhost) with a three-function Razorpay client: `createLink`, `fetchLink`, `resendNotification`. No cancel, refund or payout function exists. A test asserts the export list. The bridge refuses to start unless the key starts with `rzp_test_`.
- [ ] P5-T03 Write the mapper from the Razorpay link JSON to the domain `PaymentLink` (paise, Unix seconds to ISO).
- [ ] P5-T04 Add endpoints `POST /seed` (creates 3 test-mode links with `reference_id` `COLLECT-001` to `COLLECT-003`, using the human's own phone and email as the customer contact), `GET /links`, `GET /links/:id`, `POST /links/:id/notify`.
- [ ] P5-T05 Add the front-end switch `VITE_DATA_SOURCE=fixture|bridge`. Poll status for bridge links every 30 seconds. Fail closed: any bridge error shows a banner and the app keeps working on fixtures.
- [ ] P5-T06 Record one real round trip to `fixtures/razorpay/roundtrip.json`: create, notify, (human) open the short URL and pay with a test-mode method, the poll sees `paid`. A test replays the file to the same result.
- [ ] P5-T07 Make sure `dist/` never contains keys: the hosted build uses `fixture` only.
- [ ] P5-T08 Prepare the G4 pack and set status to `waiting at G4`.

**Acceptance (run these).**
- [ ] P5-A01 The bridge export-list test passes: three functions and nothing else.
- [ ] P5-A02 The replay test of `roundtrip.json` passes and makes no network request (the test fails on any outbound call).
- [ ] P5-A03 `npm run guard` passes, including a scan of `dist/` for `rzp_` and for the keys' values.
- [ ] P5-A04 With the bridge stopped, the app runs on fixtures and shows a banner, in a Playwright test.

**If late, cut.** The whole phase. The note then says "built on fixtures; the Razorpay link shape follows the public API docs", and G4 is held right after P4.

**Do not.** Use live keys. Export a cancel, refund or payout function. Send to any contact other than the human's own. Put a key into any file that is committed or built.

## Phase P6: Freeze, demo, note, video and logs

Status: not started
Target: Sat 10 Oct, 2:00 PM IST ready for review (2026-10-10T14:00+05:30)
Agent hours: 5
Gate in: G4 approved. Feature freeze is Fri 9 Oct, 12:00.
Gate out: P6-A01 to P6-A08 pass, then gate G5.

**Goal.** A frozen build, a demo that runs offline, a video of 90 seconds or less, a one-page note, a complete and honest AI build log, and an audit proving every number has a source.

**Tasks.**
- [ ] P6-T01 Fri 9 Oct, 12:00: tag `freeze-1`. From then on every commit message cites a bug ID from `docs/bugs.md`, written before the fix.
- [ ] P6-T02 Collect the measured numbers: the human's timings from G3 (`docs/evidence/timings.csv`), the e2e tap count, the evidence counts from `PROBLEM.md`. Write them to `docs/numbers.md` with tag (real, simulated, assumed), source file and line.
- [ ] P6-T03 Write `demo/run.ts`, a Playwright script that plays the storyboard in `docs/design/storyboard.md` at human pace on `?demo=1&now=...`, with an on-screen caption bar driven by `demo/captions.json`, and records video at 390 by 844. Never show a speed figure produced by the script: the on-screen counter, if any, shows taps, not seconds.
- [ ] P6-T04 Run it: `npm run demo:record` writes `out/demo.webm`. Check the duration is 90 seconds or less. If `ffmpeg` exists, also write `out/demo.mp4`. Write `docs/demo-script.md` with the exact clicks and the voice-over text, so the human can record a voice track if they choose.
- [ ] P6-T05 Draft the note from `PROBLEM.md`, `decisions.md`, `metrics.md` and `docs/numbers.md`, using the template in Appendix I, in `note/note.md`. Render `note/note.pdf` with Playwright and assert it is exactly one page. Mark any sentence the human must personalise with `[YOU]`.
- [ ] P6-T06 Write `docs/numbers-audit.md`: every number in the note beside the file and line it comes from and its tag. Zero unsourced.
- [ ] P6-T07 Compile `docs/ai-build-log.md` from `docs/build-log.md` and `docs/decision-log.md` using the template in Appendix I. Include AI use beyond code: coding the public evidence, drafting the note, generating fixtures, writing tests. State where AI was wrong and what was changed. The "decisions I made" section is the human's gate replies, copied word for word.
- [ ] P6-T08 README: what Collect is, three commands to run it, a table of what is real, simulated and assumed, known limits.
- [ ] P6-T09 Prepare the G5 pack and set status to `waiting at G5`.

**Acceptance (run these).**
- [ ] P6-A01 `git tag` lists `freeze-1`, and `git log freeze-1..HEAD --format=%s` shows only commits that cite a bug ID.
- [ ] P6-A02 From a fresh clone, after `npm ci`, `npm run build && npm run preview` serves the app and the demo script runs to its last frame. A Playwright check fails the run on any request to a non-local host.
- [ ] P6-A03 `out/demo.webm` is 90 seconds or less (the script prints its duration).
- [ ] P6-A04 `note/note.pdf` has exactly one page.
- [ ] P6-A05 `docs/numbers-audit.md` has 0 unsourced numbers.
- [ ] P6-A06 `docs/ai-build-log.md` has no section with a placeholder left in it, and its "decisions I made" section matches `docs/decision-log.md` word for word.
- [ ] P6-A07 `npm run check` exits 0.
- [ ] P6-A08 The words "SIMULATED" appear in the video frames that show the send sheet (a Playwright assertion on the DOM at that step).

**If late, cut.** Video re-takes first, then README polish. Never the numbers audit.

**Do not.** Add features. Show a key, a handle or a real phone number on screen. Present a scripted speed as a result. Write a quote the evidence does not contain.

## Phase P7: Package and submit prep

Status: not started
Target: Sat 10 Oct, 8:00 PM IST (2026-10-10T20:00+05:30), then the human submits by Sun 11 Oct, 12:00
Agent hours: 2
Gate in: G5 approved
Gate out: P7-A01 to P7-A05 pass, then gate G6. The human, not the agent, submits.

**Goal.** A deployable static build, a clean submission pack, proof that a stranger could run it, and a checklist that matches the form.

**Tasks.**
- [ ] P7-T01 Make `npm run build` produce a static `dist/` that works under a sub-path (`VITE_BASE`). Write `docs/deploy.md` with three options and exact steps: Netlify Drop (drag `dist/`), Vercel (`npx vercel --prod`), GitHub Pages. The human does the deploy. The agent never deploys and never asks for credentials.
- [ ] P7-T02 Fresh-clone test in a second folder: `git clone`, `npm ci`, `npm run check`, `npm run build`, `npm run preview`, run the demo script.
- [ ] P7-T03 Run `node scripts/guard.mjs --history`. It scans every commit for `rzp_live_`, `sk-ant-`, usernames and phone-like numbers.
- [ ] P7-T04 Build `submission/`: `note.pdf`, `demo.mp4` (or `demo.webm`), `ai-build-log.pdf` (rendered from the markdown), `README.md`, and `LINKS.md` with the placeholders `PROTOTYPE_URL` and `VIDEO_URL` for the human to fill.
- [ ] P7-T05 Write `docs/submission-checklist.md` mapping the brief's four deliverables, the human's `docs/form-fields.md`, file formats and sizes, and a "private-window test" for each link.
- [ ] P7-T06 Prepare the G6 pack and set status to `waiting at G6`.

**Acceptance (run these).**
- [ ] P7-A01 The fresh-clone test ran to the last frame of the demo with no errors.
- [ ] P7-A02 `node scripts/guard.mjs --history` exits 0.
- [ ] P7-A03 `submission/` contains the four deliverables and `LINKS.md`.
- [ ] P7-A04 `docs/submission-checklist.md` has a row for every field in `docs/form-fields.md`.
- [ ] P7-A05 `dist/` contains no `rzp_`, no `.env` content and no 10-digit mobile-like number (guard scan).

**If late, cut.** Nothing. If the form fails on Sunday, use Monday and Tuesday and change nothing about the work.

**Do not.** Submit anything. Ask for credentials. Edit the work after G6 except to fix a form or link failure.

## 5. Human gates

Six gates, about 4 hours 15 minutes of your attention in total. At each one the agent stops, writes `docs/gates/G#.md` and waits. Open that file first: it lists what changed, what to open, the steps below with expected results, and the decisions it needs from you. Reply in the Claude Code session with one of:

- `approved`
- `approved with changes: <list>`
- `rework: <what and why>`
- `stop`

Your reply is copied word for word into `docs/decision-log.md`. It becomes the "decisions I made" part of the AI build log, so write it in your own words and keep it honest. If you disagree with something, say so: that is the point of a gate.

### G1: Problem lock (Tue 6 Oct, 7:00 PM, about 30 minutes)

**You are checking** that the evidence is real and that Collect is the right job to spend four more days on.

**Open:** `docs/gates/G1.md`, `docs/PROBLEM.md`, `docs/evidence/job-score.md`, `docs/evidence/existing-product.md`, `docs/evidence/coded.csv`.

**Steps.**
1. Read `PROBLEM.md` (5 minutes). Can you say who the merchant is and what job they are doing in one sentence? Would you pitch this job to a Razorpay product manager?
2. Pick five row numbers yourself in `coded.csv` (not the agent's choice) and open each URL. Does the page say what the row claims? Two or more failures out of five means reply `rework: evidence`.
3. Open `job-score.md`. Does the arithmetic add up? Is Collect first, or within 0.10 of the top score? If another job beats it by more than 0.10 with at least 15 rows, the agent recommends a switch; a switch needs a regenerated plan, so ask your planner chat before replying.
4. Look at H1 to H4. Each has its n. Note any that are weak (below 25%) or rest on fewer than 25 rows.
5. Read `existing-product.md`. If you have the Razorpay app, spend five minutes checking whether unpaid links can be managed or reminded from it. If you find something the agent missed, say so in your reply.
6. Scan the evidence for anything unfair or misquoted.

**Decide.** Lock Collect; lock provisionally (fewer than 25 Collect rows, n will be stated in the note); or switch.

### G2: Design sign-off (Wed 7 Oct, 9:00 AM, about 30 minutes)

**You are checking** that the product on paper is what you would be proud to present, before any code exists.

**Open:** `docs/gates/G2.md`, the six PNGs in `docs/design/wireframes/`, `docs/design/coverage.md`, `decisions.md`, `metrics.md`, `storyboard.md`.

**Steps.**
1. Look at the six PNGs in order. Could a stranger finish the job from these screens alone?
2. Open `coverage.md`. Each of the six Track 1 elements and each of the five judging criteria should point to something real, not a promise.
3. Read `decisions.md`. Strike any decision you could not defend in front of a Razorpay product manager. Add any you would defend that is missing.
4. Read `metrics.md`. Is the north star something Razorpay could measure from its own data? Is every baseline marked `assumed`?
5. Read the storyboard. Is it 90 seconds or less? Does the first 12 seconds make the problem clear without jargon?
6. Check the not-building list. Is there something a judge would expect you to be asked about that is missing?

**Decide.** Any screen to drop; whether Hindi and Hinglish stay in (they cost about one hour); the wording of the north star.

### G3: Your phone (Wed 7 Oct, 8:00 PM, about 45 minutes)

**You are checking** that the core job works on a real phone and is quick enough.

**Open:** `docs/gates/G3.md`. Run `npm run lan`, then open the printed URL on your phone (same Wi-Fi). If the network blocks it, tell the agent; it will point you to the static-hosting fallback.

**Steps.**
1. Turn on Timed run in Settings. Do three timed runs from Start to Sent: one yourself and two by people who have not seen the app (friends or family; they are not merchants and the note will say so). Export the numbers from `?debug=1` and save them as `docs/evidence/timings.csv`.
2. Optional real hand-off test: put your own number in `.env.local` as the agent's README explains, press Send, and check WhatsApp opens with the message addressed to you. Nobody else is ever messaged.
3. Look for clipped text, tiny tap targets and anything that confuses you or your testers. If you read Hindi, check the Hindi and Hinglish text reads naturally.
4. Write your top five annoyances in `docs/evidence/g3-notes.md`. The agent turns them into changes.

**Pass bar** `[Guessing]`: the median first-use run is 120 seconds or less and 8 taps or fewer. If it is not, say what to cut.

**Decide.** Approve, or list changes; whether to keep phase P5 (only possible if you have `rzp_test_` keys).

### G4: Feature-complete (Thu 8 Oct, 9:00 PM, about 30 minutes)

Held when P5 finishes or is cut, whichever comes first, and no later than Thu 9 PM.

**You are checking** that everything promised exists and that you accept what was cut, before the Fri 9 Oct, 12:00 freeze.

**Open:** `docs/gates/G4.md` and the app.

**Steps.**
1. Run these six flows yourself: promise a date and see the link move to Waiting; simulate a payment arriving and see Paid; simulate a payment arriving after opening a card, then press Send (it must say "Already paid"); open the app with `?now=2026-10-06T22:30:00+05:30` and see "Remind me at 9:00 AM"; simulate a dispute and see the link move to Needs you; switch the message to Hindi and Hinglish.
2. If P5 was built: pay the test-mode link from its short URL and watch the status change in the app within a minute.
3. Read the list of what was cut and how the note will describe it. Is it honest?

**Decide.** Freeze Friday at noon, or spend Friday morning on bug fixes only. No new features after this gate.

### G5: Content review (Sat 10 Oct, 2:00 PM, about 60 minutes)

**You are checking** that the note, video and AI build log are true, are in your voice, and make sense to a stranger.

**Open:** `docs/gates/G5.md`, `note/note.pdf`, `out/demo.webm` (or `.mp4`), `docs/ai-build-log.md`, `docs/numbers-audit.md`, `docs/demo-script.md`.

**Steps.**
1. Read the note aloud once. Replace every `[YOU]` with your own words. It must sound like you.
2. Pick five numbers in the note and check each against its line in `numbers-audit.md`.
3. Watch the video muted, then read the captions. Confirm 90 seconds or less. Decide whether to record a voice track from `demo-script.md`.
4. Read the AI build log. Is each "decision I made" truly yours? Delete anything that is not and add any decision the agent missed.
5. Honesty scan: nothing says merchants validated the idea; every simulated element is labelled; no handle, no real phone number.
6. Cold-reader test: give the note to one person for 60 seconds, then ask four questions: who is the merchant, what does the app do, what was left out, what is proven. A wrong answer means rewrite that part.

**Decide.** Approve, or list edits.

### G6: Submit (Sun 11 Oct, by 12:00 PM, about 60 minutes)

**You are checking** that a stranger can open everything, then you submit yourself. The agent never submits.

**Open:** `docs/gates/G6.md`, `docs/deploy.md`, `docs/submission-checklist.md`, `submission/`.

**Steps.**
1. Deploy the static build with one of the three options in `deploy.md`. Open the prototype URL in a private window on phone data (a different network from your own Wi-Fi).
2. Upload the video, set the link permissions so anyone with the link can view, and test the link in a private window.
3. Fill the placeholders in `submission/LINKS.md`.
4. Open the Google Form and fill every field using `submission-checklist.md`. Check each attachment or link.
5. Submit by 12:00. Save the confirmation as `docs/evidence/submission.png`. Tell the agent "submitted" so it logs the time.

**Decide.** Submit now, or use a fresh-eyes pass only if you have found a blocking defect. Nothing can change after submitting [Certain: brief p. 4]. Mon 12 and Tue 13 Oct are for form failures only.

## Appendix A: Commands and environment

`package.json` scripts (cross-platform, no shell-only syntax):

| Script | Does |
| --- | --- |
| `dev` | Vite dev server on :5173 |
| `lan` | Vite dev server with `--host`; prints the local-network URL (used for phone testing; the only mode that can use the real hand-off) |
| `build` | Production build to `dist/` (honours `VITE_BASE`) |
| `preview` | Serves `dist/` |
| `typecheck` | `tsc --noEmit` |
| `test` | all vitest tests |
| `test:rules` | tests under `tests/rules/` |
| `e2e` | Playwright specs under `tests/e2e/` |
| `guard` | `node scripts/guard.mjs`; from P4 also `node scripts/check-rule-coverage.mjs` |
| `check` | `typecheck`, `test`, `guard` |
| `fixtures:gen`, `fixtures:verify` | generate the synthetic links; print two SHA-256 hashes that must match |
| `demo:record` | Playwright plays the storyboard and writes `out/demo.webm` (P6) |
| `note:pdf` | renders `note/note.md` to `note/note.pdf` and asserts one page (P6) |
| `bridge` | starts the localhost Razorpay test-mode bridge (P5 only) |

**`scripts/guard.mjs` fails on any of these.**
1. `rzp_live_` anywhere in the working tree. With `--history`, in any commit.
2. `sk-ant-` anywhere outside `.env` files.
3. `Date.now(` or `new Date()` with no argument, outside `src/clock.ts`.
4. `wa.me` outside `src/send/realHandoff.ts`.
5. Handle-like tokens in `docs/evidence/`: a word starting with `@` followed by 3 or more word characters, or `u/` followed by 3 or more word characters.
6. A standalone 10-digit Indian mobile-like number (`[6-9]` then 9 digits, not part of a longer run of digits, and ignoring text inside URLs) in `fixtures/`, `src/`, `docs/evidence/` or `dist/`.
7. A fixture phone number that does not match `+91 00000 000NN`.
8. `rzp_` or the text of `VITE_OWN_WHATSAPP` inside `dist/`.

**`.env.example`** (names only; real values go in `.env.local`, which is git-ignored):

```
VITE_DATA_SOURCE=fixture   # fixture | bridge (bridge: dev only, phase P5)
VITE_REAL_WHATSAPP=false   # true only in a local dev run
VITE_BASE=/                # set for sub-path hosting
RAZORPAY_KEY_ID=           # P5 only; must start rzp_test_
RAZORPAY_KEY_SECRET=       # P5 only
BRIDGE_PORT=3001
```

`VITE_OWN_WHATSAPP` (digits with country code, no plus sign) lives only in `.env.local`. The real hand-off module is wrapped in `import.meta.env.DEV` so production builds contain none of it.

## Appendix B: Repository layout

```
razorpay-collect-prototype/
  CLAUDE.md                  rules the agent loads every session (Appendix K)
  IMPLEMENTATION_PLAN.md     this file
  README.md
  docs/
    PROBLEM.md  assumptions.md  numbers.md  numbers-audit.md
    build-log.md  decision-log.md  bugs.md  capabilities.md
    demo-script.md  deploy.md  form-fields.md  submission-checklist.md  ai-build-log.md
    design/      journey.md  decisions.md  metrics.md  coverage.md  storyboard.md  wireframes/
    evidence/    inbox/  coded.csv  sources-log.md  existing-product.md
                 job-score.md  agreement.json  timings.csv  g3-notes.md  p3/  p4/
    gates/       G1.md ... G6.md
  fixtures/      links.synthetic.json  razorpay/roundtrip.json (P5)
  scripts/       guard.mjs  check-rule-coverage.mjs  gen-fixtures.ts
  src/
    clock.ts  format.ts
    domain/      types.ts  derive.ts
    rules/  rank/  decide/  templates/  store/  instrumentation/  send/
    ui/          screens/  components/
  bridge/        (P5)
  demo/          run.ts  captions.json
  note/          note.md  note.pdf
  tests/         rules/  unit/  e2e/
  submission/    note.pdf  demo.mp4  ai-build-log.pdf  README.md  LINKS.md
```

## Appendix C: Domain types and fixtures

Copy into `src/domain/types.ts` exactly. Do not rename fields.

```ts
export type LinkStatus = 'created' | 'partially_paid' | 'paid' | 'expired' | 'cancelled';
export type Channel = 'whatsapp' | 'sms';
export type Tone = 'polite' | 'firm';
export type Lang = 'en' | 'hi' | 'hinglish';
export type TemplateKind = 'first_reminder' | 'follow_up' | 'post_promise' | 'part_payment';
export type ReplyKind = 'promised_date' | 'says_paid' | 'disputes' | 'no_reply';
export type ActionType = 'CHASE_NOW' | 'WAIT_UNTIL' | 'HAND_TO_ME' | 'REISSUE' | 'HOLD';

export interface Customer {
  id: string; name: string;
  phone: string;                 // fictional pattern '+91 00000 000NN'
  muted: boolean; disputed: boolean; tags: string[];
}

export interface PaymentLink {
  id: string;                    // 'plink_' + 14 chars, synthetic
  referenceId: string;           // 40 characters or fewer
  customerId: string;
  amountPaise: number;           // integer
  amountPaidPaise: number;       // integer
  currency: 'INR';
  status: LinkStatus;
  createdAt: string;             // ISO 8601 with +05:30
  dueAt: string;                 // ISO 8601; createdAt + 7 days unless set
  expireBy: string | null;
  paidAt: string | null;
  acceptPartial: boolean;
  shortUrl: string;              // fictional 'https://rzp.example/pay/xxxxxx', never a real host
  description: string;
  touchCount: number;
  lastTouchAt: string | null;
  promisedDate: string | null;   // ISO date
  paidOffline: boolean;          // local marker only, never sent anywhere
}

export interface Touch {
  id: string; linkId: string; channel: Channel; sentAt: string;
  text: string; lang: Lang; tone: Tone; simulated: true;
}

export interface ReplyLog {
  id: string; linkId: string; kind: ReplyKind;
  promisedDate: string | null; loggedAt: string;
}

export interface Decision {
  linkId: string; action: ActionType; templateKind: TemplateKind | null;
  channel: Channel; tone: Tone; waitUntil: string | null;
  score: number; reasons: string[]; ruleHits: string[];
  blocked: boolean;              // hard block
  softBlocked: boolean;          // warn and confirm
  softReasons: string[];
}

export interface OwnerSettings {
  quietStart: string;            // default '09:00'
  quietEnd: string;              // default '21:00'
  maxTouchesPerLink: number;     // default 3
  minGapHours: number;           // default 48
  tone: Tone;                    // default 'polite'
  lang: Lang;                    // default 'en'
  channel: Channel;              // default 'whatsapp'
  timedRun: boolean;             // default false
}

export interface ActivityEvent {
  id: string; at: string; kind: string; linkId?: string; detail: string;
}
```

**Derived values** (define once in `src/domain/derive.ts`):
- `amountDuePaise = amountPaise - amountPaidPaise`
- `daysOverdue = max(0, floor((now - dueAt) / 1 day))`
- `isOverdue = daysOverdue >= 1 && status in (created, partially_paid) && !paidOffline`

**Fixture spec** (`scripts/gen-fixtures.ts`, seeded PRNG mulberry32, seed 7, output byte-identical on every run). Dates are relative to the demo base time Tue 6 Oct 2026, 11:00 IST.
- 14 customers with invented first names and invented business names (a fixed list in the generator). One muted, one disputed. Three customers have three or more links.
- 30 links: 18 `created` and overdue by 1 to 45 days; 3 `partially_paid`; 5 `paid` (with `paidAt`); 3 `expired`; 1 `created` and not yet overdue.
- Amounts: integer paise from ₹800 to ₹95,000 in multiples of ₹50. At least 4 links of ₹5,000 or more have `acceptPartial: true`.
- Touch history: 6 links with `touchCount` 1, 3 with 2, 1 with 3. Two links have a `promisedDate`: one in the future, one already passed by more than a day.
- Descriptions from a fixed list of 12 plain items such as "Logo design (Oct batch)", "Tuition fees for September", "Catering advance", "Monthly bookkeeping".
- `shortUrl` values use a fictional host. No real person, business, number or domain appears.

## Appendix D: Rules, default actions and ranking

**D1. Rules.** Each has at least one passing and one failing test whose title starts with its ID. "Hard" blocks the action. "Soft" warns and needs a confirm tap.

| ID | Type | Rule |
| --- | --- | --- |
| R01 | soft | Outside quiet hours (default 09:00 to 21:00 IST) the primary button reads "Remind me at 9:00 AM"; sending anyway needs a confirm |
| R02 | hard | At most 3 touches per link (owner setting); the next chase becomes HAND_TO_ME |
| R03 | soft | At least 48 hours between touches to the same customer across all their links |
| R04 | hard | A muted customer gets no chase |
| R05 | hard | Only `created` or `partially_paid` links are chased; paid, cancelled and `paidOffline` links are excluded |
| R06 | hard | Status is re-read at send; if it changed, abort and say "Already paid" or "This link has expired" |
| R07 | hard | A disputed customer, or a last reply of "disputes", means no chase; action is HAND_TO_ME |
| R08 | soft | After a promised date, no chase before promisedDate plus 1 day; the owner may "Chase anyway" |
| R09 | hard | The message shows the amount due, formatted, and it equals the link's amount due |
| R10 | hard | The message contains exactly one URL and it equals the link's `shortUrl` |
| R11 | soft | Banned-language check (Appendix F lexicon) on owner edits; all templates must pass in tests |
| R12 | hard | Length limits: WhatsApp 500 characters, SMS 320 |
| R13 | hard | Money is integer paise; formatted only through `formatINR`; no floats |
| R14 | hard | Every time-based rule reads the injected `Clock` in Asia/Kolkata; no `Date.now()` outside `src/clock.ts` |
| R15 | hard | No real outbound messages: the send sheet is simulated; the real hand-off works only in dev, only when `VITE_REAL_WHATSAPP=true`, and only to the owner's own number |
| R16 | hard | Undo within 10 seconds removes the Touch and reverses `touchCount`; the copy says it only updates this app |
| R17 | hard | The part-payment template is offered only when `acceptPartial` is true, amount due is at least ₹5,000 and `touchCount` is at least 1 |
| R18 | hard | An expired link gets action REISSUE; the app never extends or cancels a link |

**D2. Default action table** (first matching row wins).

| # | Condition | Action | Template |
| --- | --- | --- | --- |
| 1 | Customer muted (R04) | HOLD, not shown on Home | none |
| 2 | Customer disputed or last reply "disputes" (R07) | HAND_TO_ME | none |
| 3 | Not chaseable (R05) | excluded | none |
| 4 | Status `expired` (R18) | REISSUE | none |
| 5 | `promisedDate` set and now is before promisedDate plus 1 day (R08) | WAIT_UNTIL promisedDate plus 1 day | none |
| 6 | `touchCount` at or over the limit (R02) | HAND_TO_ME | none |
| 7 | Promise has passed and `touchCount` is 1 or more | CHASE_NOW | `post_promise` |
| 8 | R17 conditions met | CHASE_NOW | `part_payment` |
| 9 | `touchCount` 0 | CHASE_NOW | `first_reminder` |
| 10 | `touchCount` 1 | CHASE_NOW | `follow_up`, polite |
| 11 | `touchCount` 2 | CHASE_NOW | `follow_up`, firm |

**D3. Ranking** `[Guessing]` (placeholders, labelled assumptions): `score = amountDuePaise × pPay(daysOverdue) × historyFactor`. `pPay`: 0 to 3 days is 0.5; 4 to 7 is 0.4; 8 to 14 is 0.3; 15 to 30 is 0.2; over 30 is 0.1. `historyFactor`: 1.2 if the customer paid their last 3 links within 3 days of the due date; 0.9 if two or more of their last links were paid more than 14 days late; otherwise 1.0. Every score carries `reasons`, short plain-English strings such as "₹12,500 due, 9 days overdue", "Paid their last 3 links within 3 days", "You messaged them 3 days ago (1 of 3 reminders)", "They promised to pay Fri 9 Oct".

**D4. Home grouping.** "Chase today": CHASE_NOW and not hard-blocked, by score descending, at most 5, with the top 3 shown and a "See all" link. "Needs you": HAND_TO_ME and REISSUE. "Waiting on a promise": WAIT_UNTIL, with the date.

**D5. What I chose not to build** (starter list for `decisions.md`; add more): autonomous sending; AI-written messages; WhatsApp Business API integration; changes to the customer's payment page; an analytics dashboard; team or multi-user approvals; invoicing and GST features; late fees or credit scoring; legal-notice features; cancelling or refunding links; bulk blasts to many customers at once.

## Appendix E: Screens, parameters and instrumentation

Design: neutral, high-contrast, one accent colour, 16 px minimum body text, tap targets of at least 44 px, no Razorpay logo or marks. Phone viewport 390 by 844; on wide screens centre the app in a phone-shaped frame.

**URL parameters.** `now=<ISO>` fixes the clock. `demo=1` resets fixtures, turns on the caption bar (P6) and hides debug. `debug=1` shows the timings export. `timed=1` turns Timed run on.

**S1 Home.** Header "Collect" with a small "Concept prototype" label. A summary card: "₹{owed} owed across {n} overdue links". Section "Chase today ({k})" with up to 3 cards (customer, ₹ due, "{d} days overdue", one reason chip, button "Chase"). Sections "Needs you" and "Waiting on a promise" (collapsed, with counts and dates). A footer line "Paid this week: ₹{x}". Quiet-hours banner when R01 applies. Empty state: "Nothing to chase today. ₹{x} is waiting on promises." Timed run on: a bar "Start timed run" with a text field for who is running it.

**S2 Chase.** Top: customer, ₹ due, status chip, "{d} days overdue". "Why now": up to 3 reasons. Timeline: created, touches, replies. Message card: editable text, tone toggle (polite or firm), language selector (English, हिन्दी, Hinglish), channel control (WhatsApp, SMS), live counter against the length limit. Primary button "Send on WhatsApp" (or "Send as SMS"). Secondary "Copy". Tertiary "Not now". Soft or hard block messages appear above the buttons.

**S3 Sent.** "Ready in chat (SIMULATED). Nothing was sent to anyone." Next-check chip, default 2 days out, editable. A 10-second "Undo" with the R16 copy. Buttons "Log a reply" and "Back to list". If Timed run is on, show "Run time: {s} s, {n} taps (practice data)".

**S4 Log reply.** Four choices: "Promised a date" (date picker, default 3 days out), "Says they paid" ("Check your bank or Razorpay first. Mark as paid offline? This only updates this app."), "Disputes it" (marks the customer disputed; link moves to Needs you), "No reply yet" (next check). A result card shows the new plan and date.

**S5 Activity.** Timeline of events, newest first, and "Recovered this week: ₹{x}" with the split "via link" and "paid offline (marked by you)". A paid link appears with a quiet "Paid" confirmation, no confetti.

**S6 Settings.** Quiet hours, max touches, minimum gap, default tone, language, channel. Buttons "Reset demo data". Toggle "Timed run". "Demo controls": "Simulate: payment arrives" and "Simulate: customer disputes" for a chosen link. Everything under Demo controls is labelled SIMULATED.

**Messages for rule hits.**
- R01 soft: "It is {time}. Most people prefer payment messages in the daytime." Buttons "Remind me at 9:00 AM" and "Send anyway".
- R03 soft: "You messaged {name} {h} hours ago. Wait a little longer?" Buttons "Wait" and "Send anyway".
- R08 soft: "{name} promised to pay by {date}. Chase anyway?" Buttons "Wait until {date plus 1}" and "Chase anyway".
- R09 hard: "The message must show the amount due: ₹{x}."
- R10 hard: "The message must include the payment link exactly once."
- R12 hard: "Too long for {channel}: {n} of {limit}."
- R11 soft: "This could read as a threat. Try a friendlier wording."
- R06 hard: "Already paid. Nothing to send." or "This link has expired. Create a fresh link instead."

**Instrumentation events** (stored in `localStorage` key `collect.events`, never sent anywhere): `app_open`, `home_view`, `chase_open`, `message_edit`, `lang_change`, `tone_change`, `channel_change`, `send_confirm`, `undo`, `reply_logged`, `paid_seen`, `soft_block_shown`, `hard_block_shown`, `timed_start`, `timed_end`. Tap count for a run is the number of pointer events between `timed_start` and `timed_end`. `timings.csv` columns: `run_id`, `label`, `ms`, `taps`, `started_at`.

## Appendix F: Message templates and banned language

Slots in `{braces}` are filled by code: `{name}`, `{amount}` (for example `₹12,500`), `{description}`, `{url}`. Messages are never written by a model. `[Likely]` the Hindi and Hinglish read naturally; the human checks them at G3 and G5.

**English**

| Kind | Polite | Firm |
| --- | --- | --- |
| `first_reminder` | Hi {name}, a gentle reminder: {amount} is pending for {description}. You can pay here: {url}. Thank you! | not used |
| `follow_up` | Hi {name}, following up on {amount} for {description}. Pay here when convenient: {url}. Thank you! | Hi {name}, this is a second reminder for {amount} for {description}, now overdue. Please pay here today: {url}. Thank you. |
| `post_promise` | Hi {name}, checking in on the payment you mentioned for {description}: {amount}. Pay here: {url}. Thank you! | not used |
| `part_payment` | Hi {name}, if it is easier, you can pay {amount} in parts for {description}. Start with any amount here: {url}. Thank you! | not used |

**Hinglish**

| Kind | Polite | Firm |
| --- | --- | --- |
| `first_reminder` | Namaste {name}, {description} ke {amount} abhi baaki hain. Aap yahan se pay kar sakte hain: {url}. Dhanyavaad! | not used |
| `follow_up` | Namaste {name}, {description} ke {amount} ke liye ek aur reminder. Suvidha anusaar yahan pay karein: {url}. Dhanyavaad! | Namaste {name}, {description} ke {amount} ka yeh doosra reminder hai, ab yeh pending hai. Kripya aaj yahan pay karein: {url}. Dhanyavaad. |
| `post_promise` | Namaste {name}, {description} ke {amount} ke payment ke baare mein check kar rahe hain, jiska aapne zikr kiya tha. Yahan pay karein: {url}. Dhanyavaad! | not used |
| `part_payment` | Namaste {name}, agar aasan ho to {description} ke {amount} aap kisht mein de sakte hain. Kisi bhi amount se shuru karein: {url}. Dhanyavaad! | not used |

**Hindi (Devanagari)**

| Kind | Polite | Firm |
| --- | --- | --- |
| `first_reminder` | नमस्ते {name}, {description} के {amount} अभी बाकी हैं। आप यहाँ से भुगतान कर सकते हैं: {url}। धन्यवाद! | not used |
| `follow_up` | नमस्ते {name}, {description} के {amount} के लिए एक और रिमाइंडर। सुविधानुसार यहाँ भुगतान करें: {url}। धन्यवाद! | नमस्ते {name}, {description} के {amount} का यह दूसरा रिमाइंडर है, अब यह बकाया है। कृपया आज यहाँ भुगतान करें: {url}। धन्यवाद। |
| `post_promise` | नमस्ते {name}, आपने {description} के {amount} के जिस भुगतान का ज़िक्र किया था, उसके बारे में पूछ रहे हैं। यहाँ भुगतान करें: {url}। धन्यवाद! | not used |
| `part_payment` | नमस्ते {name}, अगर आसान हो तो {description} के {amount} आप किस्तों में दे सकते हैं। किसी भी राशि से शुरू करें: {url}। धन्यवाद! | not used |

When the owner picks "firm" for a kind with no firm variant, use the polite text. Firm never loosens the lexicon below.

**Banned-language lexicon (R11).** English: legal action, legal notice, court, police, FIR, defaulter, fraud, cheat, shame, blacklist, last warning, or else. Hinglish: kanooni, kanoon, court, police, dhokha, dhokebaaz, badnaam, FIR. Hindi: कानूनी, कोर्ट, पुलिस, धोखा, बदनाम, चेतावनी. Match case-insensitively on whole words. Add a test that renders every template in every language and tone and asserts none matches.

## Appendix G: Evidence coding scheme, hypotheses and assumptions

**What counts as evidence.** A public item (a forum thread, an app-store review, an article, an official page) that a stranger could open. Without merchant interviews this table is the only defence of "depth of merchant understanding", so it must be checkable and honest about its limits.

- **First-hand rows** are `forum` and `app_review` items, where a seller describes their own situation. The job targets in P1-T03 count first-hand rows only.
- **Context rows** are `article` and `official_docs` items. Code them, but show them separately in `PROBLEM.md`; they are never presented as merchant voices.
- Code one row per post or review, not per sentence. Do not code an item that is not about one of the three jobs; log it in `sources-log.md` instead.

**`docs/evidence/coded.csv` columns.**

| Column | Values |
| --- | --- |
| `id` | `E-001`, `E-002`, and so on |
| `origin` | `human_inbox` or `public_search` |
| `source_type` | `forum`, `app_review`, `article`, `official_docs` |
| `url` | the exact page |
| `accessed_on` | `YYYY-MM-DD` |
| `posted_on` | `YYYY-MM-DD` or `unknown` |
| `job` | `collect`, `dispute`, `payout` |
| `segment` | `shop`, `service`, `online_seller`, `professional`, `tutor`, `other`, `unknown` |
| `pain` | 1 mild annoyance or a question; 2 recurring time cost or delayed cash flow; 3 stated money or customer lost, or clear business damage |
| `device_or_channel` | any of `phone`, `desktop`, `whatsapp`, `call`, `in_person`, `unknown`, joined with `\|` |
| `tool_mentioned` | a product name only (for example a ledger app), never a person |
| `workaround` | `notebook`, `spreadsheet`, `memory`, `chat_scroll`, `none`, `other`, `unknown` |
| `stake_inr` | a rupee figure only if the author states one, otherwise blank |
| `mobile_signal` | 0 none; 1 phone, WhatsApp or an app is the channel or device; 2 explicitly on the go or phone-only |
| `quote` | at most 20 words, verbatim, in quotation marks; replace any name, number or email with `[redacted]` |
| `notes` | anything the coder wants a reviewer to know |

**Coding rules.**
- If something is not stated, code `unknown`. Never infer a segment or a device.
- Never record a username, handle, profile link or real name. If a row cannot be stripped, or the URL itself contains a handle (for example a path segment starting with `@`), skip it and log why.
- For an app-store review, `url` is the app's public listing page. Put the star rating and the review date in `notes`; together with the quote they let a reviewer find it.
- `job` is `collect` when a seller is waiting for money from a customer after a sale on credit, an invoice or a payment link; `dispute` for a card chargeback or payment dispute; `payout` for a settlement that is held, short or late.
- After the first pass, re-code a random 20% of rows without looking at the first codes. Write `{"field":"job","sample":n,"agree":k,"pct":x}` to `docs/evidence/agreement.json`. Below 80% agreement, tighten the rules above, re-code the whole table and write what changed to the build log.

**Search plan.** Use public pages only, through the web search and fetch tools. Stop trying a site after three refusals and log it as blocked. Source classes in order of value:

1. `docs/evidence/inbox/` items from the human.
2. Public app-store reviews of merchant apps: the Razorpay app, PhonePe Business, Paytm for Business, and credit-ledger apps such as Khatabook, OkCredit and Vyapar (look for reviews about reminders, udhaar or dues, and collection).
3. Public forum threads and answers (for example Reddit, Quora and merchant-community forums) from sellers, freelancers and shop owners in India.
4. Articles and official pages, as context rows only. For late payments to micro and small enterprises, any claim about the legal payment period must be checked on an official government page before it is cited `[Likely]`.

Starter queries (vary them; log each one):
- **Collect.** "customer not paying small business India how to ask", "freelancer client payment pending reminder WhatsApp India", "udhaar recovery shop customers not paying", "payment link not paid reminder India", "Khatabook reminder review", "OkCredit reminder customers pay late".
- **Disputes.** "chargeback evidence merchant India payment gateway", "customer raised chargeback small seller India", "payment dispute lost merchant Razorpay".
- **Payouts.** "settlement delayed payment gateway India merchant", "settlement on hold small seller India", "settlement amount less than expected payment gateway".

**Job score.** For each job, over its first-hand rows: `score = 0.30 × min(n / 25, 1) + 0.25 × (mean pain / 3) + 0.25 × (share of rows with mobile_signal of 1 or more) + 0.20 × (unmet / 2)`. `unmet` is the coverage rating from `existing-product.md` for that job: 0 fully covered, 1 partly covered, 2 not covered or not documented. Rate all three jobs in P1-T02 (read the public disputes and settlements documentation pages for the other two). Show every term in `job-score.md`. A job with fewer than 10 first-hand rows is marked "insufficient evidence" and cannot trigger a switch.

**Switch rule.** Recommend a switch only if another job's score is higher than Collect's by more than 0.10 and that job has at least 15 first-hand rows. Otherwise recommend keeping Collect and state the margin. Either way, the human decides at G1; a switch needs a regenerated plan.

**Hypotheses for Collect** (compute each with its n; below 25% or based on fewer than 25 rows is "weak" and must be called weak in the note):
- **H1 Manual chasing.** Share of Collect rows where the seller chases by chat, call or visit rather than through a tool.
- **H2 Memory and notes.** Share where the workaround is `notebook`, `spreadsheet`, `memory` or `chat_scroll`.
- **H3 Relationship cost.** Share where the seller says they hesitate, fear losing the customer, or do not know how to word the request. Code this in `notes` as `relationship`.
- **H4 Phone-first.** Share with `mobile_signal` of 1 or more.

**Assumptions register** (`docs/assumptions.md`; label every one `assumed`; the last column says how Razorpay could test it on its own data):

| ID | Assumption | Check Razorpay could run |
| --- | --- | --- |
| A1 | A material share of Payment Link value is still unpaid after the due date | Share of links by count and value still `created` at 7, 14 and 30 days |
| A2 | A reminder at a time the owner picks recovers more than the automatic reminder | Randomised test of owner-timed against automatic reminders, on recovery within 7 days |
| A3 | Owners prefer to approve each message over full automation | Opt-in rates and later opt-outs for automatic and approve-first reminders |
| A4 | WhatsApp is the channel owners prefer for chasing | Link-open and payment rates by reminder channel |
| A5 | Logging a promised date reduces repeat chasing of promised links | Touches per link with and without a logged promise |
| A6 | A cap of 3 touches and a 48-hour gap is about right | Recovery by touch number and gap; customer complaint or block rate |
| A7 | A two-minute daily session is acceptable to owners | Median session length and sessions per week among owners who use the feature |
| A8 | Ranking by amount due and days overdue approximates who is likely to pay | Back-test the score against actual payment after the due date |

## Appendix H: 90-second storyboard

Phone-sized, shot as a Playwright recording at 390 by 844. A thin bar shows "Concept prototype · synthetic data" for the whole video. The persona is labelled "composite, fictional" wherever it appears. Captions are 14 words or fewer. Any number in a caption is copied from `docs/numbers.md`, with the n it was computed from. The video never shows a speed figure produced by the script: a tap counter is allowed, a seconds counter is not.

| Seconds | Screen | What happens | Caption (draft; fill numbers only from `numbers.md`) |
| --- | --- | --- | --- |
| 0 to 12 | Title card | The persona (composite, fictional) and one line on the job. Two or three short evidence snippets, each with its source type | "Sellers sell on credit, then chase the money by hand." Then H1 with its n |
| 12 to 30 | S1 Home | The summary card; "Chase today" with one reason chip on each card; the tap counter appears | "Collect picks who to chase today, and says why." |
| 30 to 55 | S2 then S3 | Open the top card; show "Why now"; switch to Hinglish; tap Send on WhatsApp; the SIMULATED sheet is visible; confirm; the Sent screen | "You approve every message. Nothing sends without your tap." |
| 55 to 70 | S4, S1 | Log "Promised Friday"; the link moves to Waiting with its date. Reload with `?now=2026-10-06T22:30:00+05:30` (no `demo=1`, so state persists); the button reads "Remind me at 9:00 AM" | "It respects promises and quiet hours." |
| 70 to 82 | S6, S5 | In Demo controls (labelled SIMULATED) a payment arrives; Activity shows the quiet "Paid" line | "When the link is paid, the chasing stops." |
| 82 to 90 | End card | The north star with its `assumed` baseline; three "not built" items; "Built on synthetic data. Not validated with merchants." | "What I left out is as deliberate as what I built." |

`demo/captions.json` shape: `[{"startS": 0, "endS": 12, "text": "..."}]`, sorted, no overlaps, last `endS` at most 90.

## Appendix I: Templates

### I1. Build-log entry (`docs/build-log.md`, append only)

```
### 2026-10-07T14:05+05:30 | P3-T03 | rules R04 to R10
- Did: one line.
- Why: one line, tied to a plan ID.
- Checks: npm run check -> pass (N tests, M files)
- Minutes: 35
- AI was wrong about: what the first attempt got wrong and what changed (or "nothing")
- Commit: <short hash>
```

The "AI was wrong about" line is the raw material for the honest section of the AI build log. Record real misses, not tidy ones.

### I2. Commit message

```
P3-T03: implement rules R04 to R10

Pure functions with tests titled by rule ID. R07 hand-off covered.
Refs: P3-A01
```

After `freeze-1` the subject must cite a bug, for example `BUG-004: fix quiet-hours banner on S1`. Leave any co-author trailer your tooling adds.

### I3. Decision log (`docs/decision-log.md`)

Entry format: `D-nn | date and time | decision | alternatives rejected | reason | decided by (human or agent)`. Gate replies are appended as `GATE G# | time | the human's words, verbatim`. Seed these ten at P0, with today's date:

| ID | Decision | Rejected | Reason | By |
| --- | --- | --- | --- | --- |
| D-01 | Build for Track 1 | Track 2 | Merchant outreach got no replies, and the AI track depended on it | human |
| D-02 | Job: collect, chasing overdue Payment Links | disputes, held payouts | Best fit to what can be evidenced from public sources and built in five days `[Guessing]`; recorded with the human's "job: collect" reply | human |
| D-03 | Public-source evidence only | invented interviews, scraped private groups | Honesty; the brief allows public information | agent, per ground rule 2 |
| D-04 | No AI at runtime | LLM-written messages | Auditable, cheap, and no risk of a wrong amount or tone sent to a customer | agent, per ground rule 8 |
| D-05 | The owner taps send | autonomous sending | Trust and the cost of a wrong message to a customer | agent |
| D-06 | Static in-browser prototype | native app, backend | Fastest to demonstrate; a judge opens a link | agent |
| D-07 | Simulated send sheet; real hand-off only to the owner's own number | real sends to customers | Safety and honesty | agent, per ground rule 3 |
| D-08 | `localStorage`, no native builds | database, server | Zero setup on Windows and in the browser | agent |
| D-09 | Templates and rules in code | prompt-driven behaviour | Every rule is testable | agent, per ground rule 8 |
| D-10 | Hindi and Hinglish included | English only | Language is part of the merchant's reality `[Likely]`; costs about one hour; the human may drop it at G2 | agent |

### I4. Gate pack (`docs/gates/G#.md`)

Fill every field. A field with nothing to say gets "none", not a blank.

```
# G#: <name>
Phase: P#   Written: <time IST>   Agent hours used: x of y
## What changed (at most 10 bullets, plain language)
## Acceptance results
| ID | Result | Evidence (command and last line of its output) |
## Open these, in this order
## Your steps (copied from section 5 of the plan)
## Decisions I need from you
## Known gaps and risks
## Cuts applied so far, and what the note will say about each
## Reply with one of: approved | approved with changes: ... | rework: ... | stop
```

### I5. One-page note (`note/note.md`)

About 510 words, rendered to exactly one A4 page at 10.5 pt or larger. Heading budgets in words, in order:

1. **The job** (50). Who the merchant is and what they are trying to do. Include one first-person line marked `[YOU]` on why you chose it.
2. **How it is done today, and where it hurts** (90). The evidence with its n and source types, and what the existing app already covers.
3. **Why mobile** (40).
4. **The two-minute flow** (120). Six steps or fewer. The result of the timed runs labelled "3 runs by non-merchants on practice data", or the actual number of runs if fewer.
5. **Decisions and what I left out** (90). Three decisions with the rejected alternative, and the not-built list.
6. **How to measure it** (60). North star and its assumed baseline.
7. **What is proven and what is not** (60). The honest ledger: built on synthetic data, not validated with merchants, test-mode round trip only if P5 was built.

Footer: prototype link and video link (from `submission/LINKS.md`), and one line naming the tools, datasets and services used, because the brief asks for any of these to be clearly indicated [Certain: brief p. 3]. No Razorpay logo. No handles.

### I6. AI build log (`docs/ai-build-log.md`)

Written from `build-log.md` and `decision-log.md`. Facts only.

1. **How AI was used**: a table of area (research and evidence coding, design, code, tests, fixtures, note, video script, this plan), the tool, what the AI did, how it sped up or improved the work, and where the human made the key decisions. These are the four things the brief asks the log to cover [Certain: brief p. 3].
2. **Timeline**: one row per phase with planned against actual agent hours and the gate result.
3. **Prompts that mattered**: at most five, quoted from the real session, including the start prompt in section 0.
4. **Where the AI was wrong**: every "AI was wrong about" entry from the build log, with what was changed.
5. **Decisions I made**: the gate replies, word for word, from the decision log.
6. **What I would not trust AI with here**: three honest lines.
7. **Reproduce it**: the three commands from the README.

## Appendix J: Razorpay Payment Links cheat sheet `[Likely]`

Used only in phase P5. Treat as unverified until P5-T01 confirms each line against `https://razorpay.com/docs/api/payments/payment-links/`; record every difference in the decision log.

- Base URL `https://api.razorpay.com/v1`. HTTP Basic auth with the key id as user and the key secret as password. Test-mode keys start `rzp_test_`.
- Create: `POST /payment_links`. Useful fields: `amount` (paise, integer), `currency` (`INR`), `accept_partial`, `first_min_partial_amount`, `expire_by` (Unix seconds), `reference_id` (40 characters or fewer, unique per link), `description`, `customer` (`name`, `email`, `contact`), `notify` (`sms`, `email`), `reminder_enable`, `notes` (key-value pairs), `callback_url`, `callback_method`.
- Response fields used: `id` (starts `plink_`), `short_url`, `status` (`created`, `partially_paid`, `paid`, `expired`, `cancelled`), `amount`, `amount_paid`, `reference_id`, `created_at`, `expire_by` (Unix seconds).
- Fetch one: `GET /payment_links/{id}`. Fetch many: `GET /payment_links`.
- Update: `PATCH /payment_links/{id}`. Resend a notification: `POST /payment_links/{id}/notify_by/{medium}` where `medium` is `sms` or `email`.
- Cancel (`POST /payment_links/{id}/cancel`) exists in the API. The bridge must not expose it (P5-T02).
- There is no refund or payout call in scope. None is implemented.
- `[Guessing]` A link has no due date field. Collect's `dueAt` is an app concept: in bridge mode store it in `notes` as `collect_due_at`.
- `[Guessing]` The link JSON may have no paid timestamp. If so, derive `paidAt` from the poll time when status first reads `paid`, and write that choice to the decision log.
- `[Guessing]` Test-mode SMS and email may not be delivered. The round trip must not depend on delivery.
- Webhooks (for example a link-paid event) are not used: the bridge runs on localhost and polls every 30 seconds.
- Test payments: use the test methods listed in Razorpay's test-mode documentation. The human completes the payment from the short URL. The agent never enters payment details.

## Appendix K: `CLAUDE.md` content

Write this file to the repo root at P0-T04. It is loaded at the start of every session, so it is short and it repeats the rules that matter most.

```
# Collect prototype: rules for the agent
Read IMPLEMENTATION_PLAN.md at the start of every session. It wins over your own ideas.
Resume: last 3 entries of docs/build-log.md, docs/decision-log.md, git log -10; continue at
the first unticked task of the first unfinished phase. Trust files, not memory.

Honesty
- Never invent a quote, statistic, merchant, interview, source or timing.
- Composite examples are labelled "composite, fictional". Every number is tagged
  real, simulated or assumed, with its source file.
- No handles, usernames or real names anywhere. Public sources only; no mirrors or caches.

Safety
- The prototype never sends a real message (R15). Real hand-off only to the human's own number,
  from .env.local, in dev builds.
- Razorpay keys must start rzp_test_. Never write a key into a committed or built file.
- Synthetic data only. Phone numbers use +91 00000 000NN.
- Work only inside this folder. No global installs, no sudo, no pushing to a remote.

Code
- No AI at runtime. Messages come from templates. Rules are pure functions with tests
  titled by rule ID.
- Time only through src/clock.ts. Money is integer paise, formatted with formatINR.
- Never weaken a test or a rule to get green. Run npm run check before every commit.
- Every simulated element shows the word SIMULATED.

Process
- Phase status lives in the Status line under each phase heading in the plan.
- At a gate: write docs/gates/G#.md, set Status to "waiting at G#", print
  "GATE G#: waiting for human. Open docs/gates/G#.md." and stop. Silence is not approval.
- Copy the human's gate replies word for word into docs/decision-log.md.
- Add a build-log entry for every task, including an honest "AI was wrong about" line.
- Stop and ask when the plan is ambiguous, a rule or dependency is missing, a live key or real
  person would be involved, a test fails three times, or a phase passes 125% of its hours.
```
