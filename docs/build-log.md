# Build log

Append only. One entry per task (plan Appendix I1). Times IST.

### 2026-10-06T13:25+05:30 | P0-T01 to P0-T08 | scaffold, guard, logs
- Did: created the repo at D:\ISB\Razorpay\razorpay-collect-prototype with Vite 6 + React 19 + strict TypeScript, Vitest, Playwright and axe; wrote the guard with 10 tests, CLAUDE.md, decision log (D-01 to D-12), capabilities, sources log, evidence inbox and form-fields stub. P0-T07 skipped: no Track 2 repo exists.
- Why: P0 goal, a safe empty app whose `npm run check` passes (P0-A01 to P0-A04).
- Checks: npm run check -> pass (10 tests, 1 file); guard: ok
- Minutes: 12
- AI was wrong about: (1) the guard's first version matched the bare live-key prefix and so failed on IMPLEMENTATION_PLAN.md and on its own comment; changed to require a key-like character and ignore the plan's backticked test value (D-11). (2) I first reached for the latest Vite/Vitest/jsdom; their engines need Node 20.19+ and this machine has 20.17.0, so I pinned the previous majors (D-12).
- Commit: see `git log` (P0: scaffold)

### 2026-10-06T13:45+05:30 | P1-T01 to P1-T08 | evidence, problem, gate G1
- Did: confirmed and extended the existing-product facts (10 sources); downloaded 15,738 public Play reviews for 8 merchant apps and the App Store page; coded 84 rows (37 collect, 18 dispute, 18 payout first-hand; 11 context); blind re-coded 17; scored the jobs; wrote PROBLEM.md, assumptions.md and the G1 pack. P1-T01: inbox was empty.
- Why: P1 goal, a sourced problem lock (P1-A01 to P1-A05).
- Checks: npm run guard -> guard: ok; node scripts/job-score.mjs -> KEEP COLLECT; PROBLEM.md 444 words outside tables
- Minutes: 25
- AI was wrong about: (1) the web-fetch tool returned nothing for the Play listing and summarised the App Store page in its own words, so I switched to raw page text for every quote; (2) my first Play pagination code read the wrong field for the next-page token and crashed; (3) my first shell heredoc mangled a backslash in Python (a gotcha the owner had already recorded), so scripts are written with the editor; (4) I first drafted the persona with an invented business name that implied a gender, then removed it; (5) I first mis-added the n=25 sensitivity scores in job-score.md (0.655/0.628 instead of 0.683/0.655) and fixed them before the gate.
- Commit: see `git log` (P1: evidence and problem lock)

### 2026-10-06T14:00+05:30 | P1 fix | request count and tool for the Play reviews
- Did: corrected G1.md, D-13 and sources-log.md. The Play reviews took up to 126 requests from a Python script, not "about 60"; I now also say the plan's web tools were not used for them.
- Why: the human asked at G1 which tool made the requests and how many.
- Checks: npm run check -> pass
- Minutes: 5
- AI was wrong about: the request count. I estimated it instead of adding up the script runs (2 + 10 + 2 debug + 42 + 6 + 64).
- Commit: see `git log`

### 2026-10-06T14:06+05:30 | G1 changes, P1-T01 | provisional lock, inbox intake
- Did: logged the G1 reply verbatim; marked PROBLEM.md as provisionally locked; read the human's notes; re-read 5 cited sources and coded them as E-085 to E-089 (context, human_inbox); updated existing-product.md (Agent Studio has no collections agent for links; the blog says the system picks reminder hours) and sources-log.md. Job score unchanged (context rows do not count).
- Why: G1 reply "approved with changes: lock Collect provisionally"; P1-T01.
- Checks: P1-A01 to P1-A05 re-run -> pass (89 rows; PROBLEM.md 450 words outside tables; guard: ok; KEEP COLLECT)
- Minutes: 10
- AI was wrong about: adding the status line pushed PROBLEM.md to 476 words, over the 450 limit; trimmed to 450.
- Commit: see `git log`

### 2026-10-06T14:35+05:30 | P2-T01 to P2-T09 | design, storyboard, gate G2
- Did: journey map with persona card; 7 wireframes (S1 to S6 plus the send sheet) rendered at 390 x 844 by scripts/render-wireframes.mjs; decisions (9, plus 12 not built); metrics (north star, 3 supporting, 3 guardrails, two-minute task); storyboard (90 s); coverage matrix; scripts/check-p2.mjs; G2 pack.
- Why: P2 goal, judge the product on paper before code (P2-A01 to P2-A05).
- Checks: node scripts/check-p2.mjs -> 5 of 5 pass; npm run check -> pass (10 tests); guard: ok
- Minutes: 30
- AI was wrong about: (1) S5 first showed "Recovered this week: ₹22,000 via link ₹17,000" next to an ₹18,000 link payment, which cannot add up; fixed to ₹40,000 (₹35,000 + ₹5,000), with Home's ₹22,000 as the figure before that payment; (2) the S2 length counter was a guess (134); measured as 146; (3) two decision rows cited evidence that did not support them (E-031/E-032 for "ledger apps do invoicing"; E-080 for owner behaviour); reworded.
- Commit: see `git log`

### 2026-10-06T14:45+05:30 | housekeeping | separate from the MyProd project
- Did: confirmed this repo is its own git repository (own .git, no remote, no alternates, no MyProd references in any file). Moved the raw research downloads from the session scratch folder (named after the MyProd folder the session was started in) to D:\ISB\Razorpay\research-raw\, outside the repo.
- Why: the human asked for no link to MyProd.
- Checks: npm run guard -> ok
- Minutes: 5
- AI was wrong about: I started work from a Claude Code session opened in the MyProd folder, so the session's own files and scratch space sat under MyProd's name, and P0's first commit read the author name from MyProd's git config (it resolved to the global identity).
- Commit: see `git log`

### 2026-10-06T14:22+05:30 | G2 changes | reply logged, timestamps corrected
- Did: copied the G2 reply word for word into the decision log; added D-18 (Hindi and Hinglish kept), D-19 (D-01 kept) and D-20 (how the unnamed G2 items were read); set P2 to done and P3 to in progress. Corrected G2.md's "Written" time.
- Why: gate protocol step 6; G2 reply "approved with changes: keep Hindi and Hinglish, keep D-01".
- Checks: P2-A01 to P2-A05 unaffected (no design file changed); npm run check -> see the P3 entries
- Minutes: 4
- AI was wrong about: timestamps. The P2 entry above says 14:35 and the housekeeping entry 14:45, and G2.md said "Written: 14:35", but git shows the P2 commit at 14:07:16 and the housekeeping commits at 14:13 and 14:14, and the clock read 14:18 when the G2 reply arrived. Those times were estimated, not read from the clock. True times: P2 commit 14:07, housekeeping 14:13 to 14:14. From now on every entry time is read from the system clock (`date`). The "Minutes" figures in earlier entries are estimates too.
- Commit: see `git log`

### 2026-10-06T14:29+05:30 | P3-T01 to P3-T06 | domain, clock, fixtures, rules, ranking, templates, store
- Did: types copied verbatim from Appendix C; `src/clock.ts` (System, Fixed and Demo clocks, IST helpers), `formatINR`; seeded fixture generator (30 links, 14 customers, SHA-256 identical across runs); rules R02, R04 to R10, R12, R13, R17, R18 as pure functions; ranking with plain reasons; the action table with Home grouping; English, Hindi and Hinglish template data with renderer and R09/R10/R12 validator; reducer with `collect.v1` persistence and `resetDemoData()`.
- Why: P3-T01 to P3-T06 (P3-A01, P3-A02).
- Checks: npm run check -> pass (64 tests, 3 files); fixtures:verify -> identical (94392ea4...); test:rules -> 28 passed, 13 rule IDs
- Minutes: about 9 (P3 ran 14:20 to 14:40 by the clock in total; the per-entry split is an estimate)
- AI was wrong about: (1) my first action table followed the rows literally, so a disputed customer's paid link would have stayed in "Needs you"; settled links are now excluded first (D-21a). (2) My first "promise has passed" reason compared against now minus 24 hours rather than the IST day after the promise; replaced with the same day boundary R08 uses. (3) The first generator could place a touched link's earlier reminders before its due date; touched links now get a minimum number of overdue days.
- Commit: see `git log` (P3: happy-path build)

### 2026-10-06T14:33+05:30 | P3-T07, P3-T08 | screens S1 to S3, send sheet, Activity, Settings stub, instrumentation
- Did: Home, Chase, Sent, the SIMULATED send sheet, a minimal Activity timeline, a Settings stub (Timed run, Reset demo data), hash routing, `?now=`, `?demo=1`, `?debug=1`, `?timed=1`; events in `collect.events`; Timed run with tap counting and `timings.csv` export; dev-only hand-off to the owner's own number (R15) with tests.
- Why: P3-T07, P3-T08 (and G3 steps 1 and 2).
- Checks: npm run check -> pass (66 tests, 4 files); clicked through Home, Chase, Hindi switch, sheet and Sent in the browser pane at 390 x 844; no console errors
- Minutes: about 7
- AI was wrong about: (1) the Sent-screen evidence screenshot showed "Run time: 2 s", which is the test script's speed; the plan forbids presenting a scripted speed, so the e2e now masks that readout. (2) The production build still carried the dev-only button's label (no URL, no number, never rendered); the button is now gated on the dev flag and a build scan finds no hand-off code. (3) My first empty-state total used a type cast to dodge a missing link; rewritten.
- Commit: see `git log` (P3: happy-path build)

### 2026-10-06T14:38+05:30 | P3-T09 to P3-T11 | e2e, LAN mode, README, gate G3
- Did: Playwright happy path at 390 x 844 with axe on S1, S2, the sheet and S3 and a no-sideways-scroll check; screenshots in `docs/evidence/p3/`; `npm run lan` and the README sections "Open it on your phone" and the own-number hand-off test; G3 pack.
- Why: P3-T09 to P3-T11 (P3-A03 to P3-A07).
- Checks: npm run e2e -> 1 passed, "3 taps from Start to Sent" (simulated run by the script); axe 0 critical or serious; LAN_PORT=5174 npm run lan printed http://10.0.105.105:5174/ and curl of it returned the app HTML; production build scan: no WhatsApp link, no owner number
- Minutes: about 4
- AI was wrong about: nothing failed here on the first run. I ran the LAN check on port 5174 because the browser pane's dev server held 5173, and stopped it afterwards.
- Commit: see `git log` (P3: happy-path build)

### 2026-10-07T01:57+05:30 | P3 fix (during G3) | run label no longer asks for a name
- Did: the Timed run label on Home now reads "Label for this run (for example tester-1; not a name)"; README and the e2e selector updated.
- Why: CLAUDE.md "No handles, usernames or real names anywhere", and the label is written into `timings.csv`, which goes into the repo (G3 step 1).
- Checks: npm run check -> see commit; npm run e2e -> see commit
- Minutes: 3
- AI was wrong about: I wrote the first hint as "first name or a label", which invites testers' real names into a committed file.
- Commit: see `git log`
