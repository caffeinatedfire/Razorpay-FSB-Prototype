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
