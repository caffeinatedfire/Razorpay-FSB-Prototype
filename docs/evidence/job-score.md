# Job score (P1-T05)

Formula (plan Appendix G), over first-hand rows (`app_review`, `forum`) in `coded.csv`:
`score = 0.30 × min(n/25, 1) + 0.25 × (mean pain / 3) + 0.25 × (share with mobile_signal ≥ 1) + 0.20 × (unmet / 2)`.
`unmet` comes from `existing-product.md`. Reproduce with `node scripts/job-score.mjs`.

## Scores as coded

| Job | n | 0.30 × min(n/25,1) | mean pain | 0.25 × pain/3 | mobile ≥ 1 | 0.25 × share | unmet | 0.20 × unmet/2 | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| collect | 37 | 0.30 × 1 = 0.300 | 1.351 | 0.113 | 37 of 37 | 0.250 | 1 | 0.100 | **0.763** |
| dispute | 18 | 0.30 × 0.72 = 0.216 | 2.889 | 0.241 | 3 of 18 | 0.042 | 1 | 0.100 | **0.598** |
| payout | 18 | 0.30 × 0.72 = 0.216 | 2.889 | 0.241 | 1 of 18 | 0.014 | 1 | 0.100 | **0.571** |

Check, collect: 0.300 + 0.113 + 0.250 + 0.100 = 0.763. Dispute: 0.216 + 0.241 + 0.042 + 0.100 = 0.599 (0.598 before rounding). Payout: 0.216 + 0.241 + 0.014 + 0.100 = 0.571.

**Recommendation under the switch rule: keep Collect.** Collect is first. The best alternative (dispute) is 0.164 *below* it, so no alternative beats it by more than 0.10. Both alternatives have 18 first-hand rows (at least 10, so they are scored; at least 15, so they could have triggered a switch).

## Why this lead is fragile (read before G1)

1. **Pain favours the alternatives by a lot.** Held settlements and disputes average 2.9 of 3: reviewers report money held for weeks or months. Collect averages 1.4: most ledger-app reviewers ask for features or praise reminders. Collect wins on the mobile term, not on pain.
2. **The mobile term is a coding choice.** I gave `mobile_signal ≥ 1` only when the text says the job is done on a phone, by SMS, call or WhatsApp, or through the app. Ledger-app reviewers describe sending reminders from the app, so every Collect row qualifies. Payout and dispute reviewers mostly describe tickets and email. If every app-store review counted as mobile, the scores become collect 0.763, dispute 0.807, payout 0.807. Collect would then be 0.044 behind: within 0.10, so still "keep" under the rule, but no longer first.
3. **n for the alternatives was capped by effort.** I coded 18 each. Raw keyword hits in the 15,738 downloaded reviews were 999 for payout, 32 for dispute and 510 for collect (see `sources-log.md`). These are loose keyword matches, not coded rows, and they include false positives and consumer complaints. With 25 coded rows each, the n term rises to 0.300. That gives dispute 0.683 and payout 0.655 as coded, so collect stays first. Under the sensitivity in point 2, both reach 0.891, a margin of 0.128 over collect. That would trigger a switch.
4. **Selection bias in Collect.** Every Collect row comes from reviews of credit-ledger and payment apps, so every reviewer already uses a tool. That is why H1 and H2 are low (below). Sellers who chase by hand and never install an app are invisible in this sample. Reddit, the obvious source for them, refused access (logged).

**My reading, for the human to judge.** On this evidence, held payouts and disputes hurt more. But the hurt sits with Razorpay's risk and support processes, which a merchant-facing two-minute phone flow cannot fix. Collect is the job most clearly *done by the merchant on a phone*, it happens repeatedly, and Razorpay's own product half-covers it (fixed-hour SMS/email, no WhatsApp, no prioritising). I recommend locking Collect **provisionally**. The note should say that Collect is the job that is most phone-native and most within a product's reach, not the most painful one.

## Hypotheses for Collect (37 first-hand rows)

| ID | Hypothesis | Result | Rows | Verdict |
| --- | --- | --- | --- | --- |
| H1 | Sellers chase by chat, call or visit rather than through a tool | 14% of 37 | E-002, E-005, E-010, E-021, E-034 | weak |
| H2 | Workaround is notebook, spreadsheet, memory or chat scroll | 3% of 37 | E-025 | weak |
| H3 | Relationship cost: hesitation, fear of losing the customer, or wording | 16% of 37 | E-003, E-007, E-018, E-019, E-028, E-029 | weak |
| H4 | Phone-first | 100% of 37 | all Collect rows | strong, but biased by the sample (all are phone-app reviews) |

What the rows do say clearly, without a hypothesis label: owners want reminders on WhatsApp rather than SMS (E-001, E-010, E-030, E-033; but E-027 objects to WhatsApp-only), want their own wording (E-003, E-009, E-011, E-028), want per-bill due dates and promised dates tracked (E-004, E-008, E-020), and dislike automatic messages they did not approve (E-007, E-018, E-019).
