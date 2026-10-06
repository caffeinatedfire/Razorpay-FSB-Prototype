# Product decisions

Each decision gives the choice, the alternative rejected, and the reason. Evidence IDs are rows in `docs/evidence/coded.csv`; A-numbers are in `docs/assumptions.md`.

| # | Decision | Rejected alternative | Reason |
| --- | --- | --- | --- |
| P-1 | **The owner taps send on every message.** Collect prepares the message; the owner sends it | Automatic sending on a schedule (what Razorpay's reminders do today) | Reviewers object to messages sent without their say (E-007, E-018, E-019). A wrong amount or tone goes to a customer the owner wants to keep. Assumption A3 |
| P-2 | **Rank "Chase today" and show why** (amount due, days overdue, payment history, last touch, promise), with at most 5 links | A full overdue list sorted by date | The hard part of the job is deciding whom to chase first (E-004, E-020, E-030). Plain reasons let the owner overrule the ranking. The weights are placeholders (A8) |
| P-3 | **Hand off to the owner's own WhatsApp**, with SMS as an option | WhatsApp Business API sending from Razorpay; SMS and email only | Owners ask for WhatsApp (E-001, E-010, E-033), while one wants SMS kept (E-027). The Business API needs approved templates and business verification [Likely], and it would send as Razorpay rather than as the owner. Assumption A4 |
| P-4 | **Fixed templates, editable, with hard checks** on the amount and the link (R09, R10) and a soft check on threatening words (R11) | Messages written by an AI model | Auditable and cheap, with no risk of a wrong amount. Owners want their own wording (E-003, E-009, E-028), and editing gives them that |
| P-5 | **One-tap reply log; a promise pauses chasing** until the day after the promised date (R08) | A free-text notes field; no reply tracking | Owners ask for promised dates to be tracked (E-008). Structured replies drive the next action. Assumption A5 |
| P-6 | **Caps: 3 reminders per link, 48 hours between messages to one customer, quiet hours 09:00 to 21:00**, all soft or owner-adjustable except the cap | No limits | Mirrors Razorpay's own cap of 3 (E-074) and protects the relationship (E-019). The gap and hours are assumptions (A6) |
| P-7 | **Expired links and disputes go to "Needs you"**; Collect never extends, cancels or refunds a link (R18, R07) | Auto-extend expired links; keep chasing disputed customers | Money terms and disputes are the owner's call. Chasing a disputed customer damages the relationship |
| P-8 | **English, Hindi and Hinglish templates** | English only | A reviewer could not send Hindi reminders (E-022). Costs about an hour; the human decides at G2 (D-10) |
| P-9 | **Shaped as one entry inside the Razorpay app** ("Overdue links"), shown here as a stand-alone web prototype | A separate app | The Razorpay app already holds payment links and settlements (E-080), so the overdue list belongs next to them. The prototype is stand-alone only so a judge can open it from a link |

## What I chose not to build

| Not built | Why not |
| --- | --- |
| Autonomous sending | P-1: the owner taps send |
| AI-written messages, or AI reading the customer's reply | P-4: templates are auditable. Reading replies was the Track 2 idea, dropped with Track 2 (D-01) |
| WhatsApp Business API integration | P-3: needs template approval and verification, and sends as Razorpay, not as the owner |
| Bulk blasts to many customers at once | Owners asked for it (E-010, E-021), but a blast is exactly the automatic messaging others objected to (E-019). The ranked list makes one-by-one fast instead |
| Changes to the customer's payment page | Out of the merchant's job; Razorpay's checkout already handles payment |
| Cancelling, refunding or extending links | P-7: money terms stay with the owner, in Razorpay's existing screens |
| Late fees, interest or credit scoring of customers | Relationship risk; needs data and legal review. The 45-day MSMED rule applies only to some buyers (E-081, E-089) |
| Legal notices or threatening language | Banned by R11; harms the relationship |
| An analytics dashboard | One number on Home and a weekly line in Activity are enough for the job |
| Team or multi-user approvals | The persona works alone |
| Invoicing and GST features | Ledger and billing apps already do this; Khatabook, OkCredit and Vyapar appear throughout the evidence |
| Held-payout and dispute help | Different jobs, scored in P1; their fixes sit in Razorpay's risk and support processes (`job-score.md`) |
