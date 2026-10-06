# Assumptions register

Every item is `assumed`. None was tested. The last column says how Razorpay could test it on its own data.

| ID | Assumption | Status | Why we assume it | Check Razorpay could run |
| --- | --- | --- | --- | --- |
| A1 | A material share of Payment Link value is still unpaid after the due date | assumed | Reminders and "Partially Paid → send a reminder" exist in the product (E-074, E-077), which implies unpaid links are common | Share of links by count and value still `created` at 7, 14 and 30 days |
| A2 | A reminder at a time the owner picks recovers more than the automatic reminder | assumed | Automatic reminders go out only in two fixed windows (E-074); owners ask for control over timing (E-017, E-012) | Randomised test of owner-timed against automatic reminders, on recovery within 7 days |
| A3 | Owners prefer to approve each message over full automation | assumed | Reviewers object to automatic messages they did not approve (E-007, E-018, E-019) | Opt-in rates and later opt-outs for automatic and approve-first reminders |
| A4 | WhatsApp is the channel owners prefer for chasing | assumed | Requested in E-001, E-010, E-030, E-033; contradicted in E-027 | Link-open and payment rates by reminder channel |
| A5 | Logging a promised date reduces repeat chasing of promised links | assumed | One reviewer asks for promised dates to be tracked (E-008) | Touches per link with and without a logged promise |
| A6 | A cap of 3 touches and a 48-hour gap is about right | assumed | Mirrors Razorpay's own cap of 3 (E-074); the 48-hour gap has no evidence | Recovery by touch number and gap; customer complaint or block rate |
| A7 | A two-minute daily session is acceptable to owners | assumed | No evidence; owners run the business from the phone between jobs (composite persona) | Median session length and sessions per week among owners who use the feature |
| A8 | Ranking by amount due and days overdue approximates who is likely to pay | assumed | No evidence; the weights in the plan are placeholders | Back-test the score against actual payment after the due date |
