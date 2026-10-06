# Build log

Append only. One entry per task (plan Appendix I1). Times IST.

### 2026-10-06T13:25+05:30 | P0-T01 to P0-T08 | scaffold, guard, logs
- Did: created the repo at D:\ISB\Razorpay\razorpay-collect-prototype with Vite 6 + React 19 + strict TypeScript, Vitest, Playwright and axe; wrote the guard with 11 tests, CLAUDE.md, decision log (D-01 to D-12), capabilities, sources log, evidence inbox and form-fields stub. P0-T07 skipped: no Track 2 repo exists.
- Why: P0 goal, a safe empty app whose `npm run check` passes (P0-A01 to P0-A04).
- Checks: npm run check -> pass (11 tests, 1 file); guard: ok
- Minutes: 12
- AI was wrong about: (1) the guard's first version matched the bare live-key prefix and so failed on IMPLEMENTATION_PLAN.md and on its own comment; changed to require a key-like character and ignore the plan's backticked test value (D-11). (2) I first reached for the latest Vite/Vitest/jsdom; their engines need Node 20.19+ and this machine has 20.17.0, so I pinned the previous majors (D-12).
- Commit: see `git log` (P0: scaffold)
