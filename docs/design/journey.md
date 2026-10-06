# Journey: chasing one overdue link, today and with Collect

Evidence IDs point to `docs/evidence/coded.csv`. "Today" is pieced together from public reviews and Razorpay's docs. It is not observed behaviour, and no merchant was interviewed.

## Persona card (composite, fictional)

| | |
| --- | --- |
| Who | The owner of a one-person catering, coaching or design business that bills on credit. Composite and fictional: built from public reviews, not from a real person. |
| Tools | Razorpay Payment Links for billing; WhatsApp for talking to customers; maybe a ledger app or a notebook for dues |
| Where | On the phone, between jobs, rarely at a desk |
| Pressure | A handful of links are always a week or more overdue, and each is a customer they want to keep |
| Job statement | *When a customer has not paid a link I sent, I want to remind the right people, in my own words, at the right time, so I get paid without damaging the relationship.* |

## Step by step

| # | Today | Friction | Evidence | With Collect |
| --- | --- | --- | --- | --- |
| 1 | Notice that money is late, by memory, a ledger app or the Razorpay Dashboard | Razorpay's reminder controls live on the Dashboard; the app documents none | E-074, E-075, E-078 | Home opens on "₹ owed across n overdue links" |
| 2 | Decide whom to chase first | Nothing ranks overdue links; owners ask for per-bill due dates and filters | E-004, E-020, E-030 | "Chase today" shows at most 5 links, each with a plain reason ("Paid their last 3 links within 3 days") |
| 3 | Check it is still unpaid and what was said last time | Promises are not tracked; there is one due date per customer | E-008, E-004 | The Chase screen shows status, a timeline and any promise; status is re-read at send (R06) |
| 4 | Word the message | Owners want their own, gentler wording and Hindi; fixed sender names read badly | E-003, E-009, E-011, E-022, E-028, E-029 | A pre-filled message in English, Hindi or Hinglish, polite or firm, editable, with the amount and link checked (R09, R10) |
| 5 | Send it | SMS gets ignored or blocked; WhatsApp is asked for; automatic sends feel risky | E-001, E-002, E-035, E-007, E-018, E-019 (E-027 prefers SMS) | One tap opens WhatsApp with the message ready, and the owner sends it there (simulated in the prototype). SMS stays available |
| 6 | Send the next one, one by one | Sending one at a time is slow | E-010, E-021 | "Back to list": the next card is already ranked |
| 7 | Remember what the customer said | No place to log a promise; reminders repeat regardless | E-008 | One tap logs "Promised Fri 9 Oct"; the link waits until the day after (R08) |
| 8 | Know when it is paid | Automatic reminders keep going on fixed hours chosen by the system | E-074, E-086 | Paid links drop off the list and show a quiet "Paid" in Activity |

## Where Collect stops on purpose

It never sends without the owner's tap. It never extends, cancels or refunds a link. It hands disputes and expired links back to the owner ("Needs you").
