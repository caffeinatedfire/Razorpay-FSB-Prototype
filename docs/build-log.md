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
