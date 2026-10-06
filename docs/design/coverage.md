# Brief coverage

Each Track 1 element and judging criterion is mapped to where it will be shown: the note section (plan Appendix I5), the screen, and the video seconds (`storyboard.md`). "Note §" numbers follow the note template.

## The six Track 1 elements

| Track 1 element | Note section | Screen | Video | Backed by |
| --- | --- | --- | --- | --- |
| Who the merchant is and what they are trying to accomplish | §1 The job | S1 header and summary | 0 to 12 s | `PROBLEM.md` persona (composite, fictional) and job statement |
| How they handle it today, and where the friction is | §2 How it is done today | none (the "today" is shown on the title card) | 0 to 12 s | `journey.md` steps 1 to 8; `existing-product.md`; E-001, E-007, E-074 |
| Why mobile is the right surface | §3 Why mobile | S2 send on WhatsApp; S1 from the phone | 30 to 55 s | `PROBLEM.md` "Why mobile"; H4 (100% of 37, biased); E-074 shows Dashboard-only controls today |
| A clear flow that completes the task, ideally within two minutes | §4 The two-minute flow | S1, S2, send sheet, S3 (happy path: 4 taps), S4 | 12 to 70 s | `metrics.md` two-minute task definition; timed runs at G3; e2e tap count in P3 |
| Key product decisions and what was left out | §5 Decisions and what I left out | S2 (owner taps send), S6 caps, S4 promise | 30 to 55 s, 82 to 90 s | `decisions.md` P-1 to P-9 and the not-built table |
| How to measure whether it works | §6 How to measure it | S5 "Recovered this week" | 82 to 90 s | `metrics.md` north star, 3 supporting metrics, 3 guardrails, all baselines `assumed` |

## The five judging criteria

| Criterion | What will show it | Where |
| --- | --- | --- |
| Importance and clarity of the problem | A one-sentence job; a sourced friction table; Razorpay's own reminder limits; context on delayed MSME payments (E-087, B2B, labelled as such) | Note §1 and §2; `PROBLEM.md`; video 0 to 12 s |
| Depth of understanding of the merchant | 89 coded public items with URLs; the existing-product check; weak hypotheses reported as weak; assumptions A1 to A8, each with a check Razorpay could run | Note §2 and §7; `coded.csv`; `job-score.md`; `assumptions.md` |
| Product judgment and prioritisation | Nine decisions with rejected alternatives; twelve items not built; one job chosen over two more painful ones, with the reason stated | Note §5; `decisions.md`; `job-score.md` |
| How AI was used to speed up the build | The AI build log: evidence coding by script, design, code, tests, fixtures; gate decisions verbatim; where the AI was wrong | `docs/ai-build-log.md` (P6), built from `build-log.md` and `decision-log.md` |
| Clarity of the note and pitch | One page with a fixed word budget; a 90-second video; a cold-reader test at G5 | `note/note.pdf`, `out/demo.webm` (P6) |
