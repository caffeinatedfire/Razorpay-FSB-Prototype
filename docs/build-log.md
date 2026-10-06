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
