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

D-13 | 2026-10-06T13:28+05:30 | Read Google Play reviews through the store page's own public "See all reviews" data endpoint (no login; up to 126 requests, 1.5 s apart, by a Python script run from the shell, generic browser user-agent), and keep raw downloads out of the repo. Corrected 2026-10-06T14:00+05:30: this entry first said "about 60 spaced requests" | Only the 3 reviews shown on each listing page; Reddit (refused, 403) | Apple's review feeds returned nothing for 7 of 8 apps, and listing pages show only 3 reviews each, which is far below the 40-row floor. Flagged for the human at G1 as a judgment call under ground rule 6 | agent

D-14 | 2026-10-06T13:40+05:30 | Code `mobile_signal` 1 only when the text says the job is done on a phone, by SMS, call or WhatsApp, or through the app; a bare "this app is a fraud" is 0 | Counting every app-store review as mobile | The plan says never infer a device. The choice moves the job score, so job-score.md shows both versions | agent

D-15 | 2026-10-06T13:45+05:30 | Recommend a provisional lock on Collect at G1 | Recommend a switch to payouts or disputes | Collect wins the formula as coded and is the most phone-native job; the alternatives hurt more, but their fixes sit in Razorpay's risk and support processes. The human decides | agent

D-16 | 2026-10-06T14:05+05:30 | Collect is provisionally locked. The note states the lock is provisional, gives n = 37 first-hand Collect rows, and calls H1 to H3 weak | full lock; switch | Per the human's G1 reply | human

D-17 | 2026-10-06T14:05+05:30 | Use the human's chat notes only as pointers: re-read each cited source and code 5 of them as context rows (E-085 to E-089, origin human_inbox). Add no first-hand rows from them | coding the notes' own claims as evidence | The notes say no forum data was collected; several claims in them are tagged Likely | agent

D-18 | 2026-10-06T14:20+05:30 | Hindi and Hinglish stay in the product (English in P3; Hindi and Hinglish in P4-T05), confirming D-10. The storyboard's Hindi and Hinglish caption variants stay cut | drop both languages | Per the human's G2 reply "keep Hindi and Hinglish" | human

D-19 | 2026-10-06T14:20+05:30 | D-01 stays as written | rewording D-01's reason | Per the human's G2 reply "keep D-01" | human

D-20 | 2026-10-06T14:20+05:30 | G2 items the reply did not name are read as approved as proposed in the pack, or left as they are: all six screens kept; the north star stays "overdue value recovered within 14 days of the first Collect reminder", baseline `assumed` 35%; the title card shows "37 public reviews coded", not H1; the Play-review rows stay in (D-13 unchanged); the chat-notes file stays untracked, neither committed nor git-ignored; no extra forum search | asking again before P3 | The reply was "approved", which covers the pack's proposals. Where the pack asked for an explicit word (notes file, Play rows, forum search), nothing changes and nothing irreversible is done. The human can override any of these at G3 | agent

## Human answers before P0 (verbatim)

PRE-P0 | 2026-10-06T13:16+05:30 | Q: Where should the repo be created? A: "D:\ISB\Razorpay\ (Recommended)"

PRE-P0 | 2026-10-06T13:16+05:30 | Q: Which optional inputs from section 1 will you provide? A: "Let me decide rzp_test_ status when we reach phase P5,Own WhatsApp number,Google Form fields,Evidence notes"

PRE-P0 | 2026-10-06T13:16+05:30 | Q: Do the gate windows work? A: "Gate timing is suggestive, I may advance or delay as feasible in my schedule"

## Gate replies

GATE G1 | 2026-10-06T13:59+05:30 | approved with changes: lock Collect provisionally

uploaded evidence notes at docs/evidence/inbox/razorpay-track2-chat-notes

GATE G2 | 2026-10-06T14:18+05:30 | approved with changes: keep Hindi and Hinglish, keep D-01
