# Decision log

Format: `D-nn | date and time | decision | alternatives rejected | reason | decided by`.
Gate replies are appended as `GATE G# | time | the human's words, verbatim`.

## Decisions

D-01 | 2026-10-06T13:15+05:30 | Build for Track 1 | Track 2 | Merchant outreach got no replies, and the AI track depended on it | human

D-02 | 2026-10-06T13:15+05:30 | Job: collect, chasing overdue Payment Links | disputes, held payouts | Best fit to what can be evidenced from public sources and built in five days [Guessing]. Human's confirmation, verbatim, given 2026-10-06T13:16+05:30 in answer to "Which job?": "job: collect" | human

D-03 | 2026-10-06T13:15+05:30 | Public-source evidence only | invented interviews, scraped private groups | Honesty; the brief allows public information | agent, per ground rule 2

D-04 | 2026-10-06T13:15+05:30 | No AI at runtime | LLM-written messages | Auditable, cheap, and no risk of a wrong amount or tone sent to a customer | agent, per ground rule 8

D-05 | 2026-10-06T13:15+05:30 | The owner taps send | autonomous sending | Trust and the cost of a wrong message to a customer | agent

D-06 | 2026-10-06T13:15+05:30 | Static in-browser prototype | native app, backend | Fastest to demonstrate; a judge opens a link | agent

D-07 | 2026-10-06T13:15+05:30 | Simulated send sheet; real hand-off only to the owner's own number | real sends to customers | Safety and honesty | agent, per ground rule 3

D-08 | 2026-10-06T13:15+05:30 | `localStorage`, no native builds | database, server | Zero setup on Windows and in the browser | agent

D-09 | 2026-10-06T13:15+05:30 | Templates and rules in code | prompt-driven behaviour | Every rule is testable | agent, per ground rule 8

D-10 | 2026-10-06T13:15+05:30 | Hindi and Hinglish included | English only | Language is part of the merchant's reality [Likely]; costs about one hour; the human may drop it at G2 | agent

D-11 | 2026-10-06T13:21+05:30 | The guard's live-key check needs a key-like character after the prefix, and ignores the plan's own backticked description of the planted test value | literal prefix match everywhere; allowlisting whole files | The plan and CLAUDE.md name the prefix as prose, so a literal match fails the guard on the plan itself. A planted key (P0-A02) still fails; allowlisting whole files would let a real key hide in them | agent

D-12 | 2026-10-06T13:22+05:30 | Vite 6, Vitest 3, jsdom 26 | Vite 7/8, Vitest 4/5, jsdom 30 | The machine has Node 20.17.0; the newer majors require Node 20.19+ or 22+. Ground rule 10 forbids a global Node upgrade | agent

## Human answers before P0 (verbatim)

PRE-P0 | 2026-10-06T13:16+05:30 | Q: Where should the repo be created? A: "D:\ISB\Razorpay\ (Recommended)"

PRE-P0 | 2026-10-06T13:16+05:30 | Q: Which optional inputs from section 1 will you provide? A: "Let me decide rzp_test_ status when we reach phase P5,Own WhatsApp number,Google Form fields,Evidence notes"

PRE-P0 | 2026-10-06T13:16+05:30 | Q: Do the gate windows work? A: "Gate timing is suggestive, I may advance or delay as feasible in my schedule"

## Gate replies
