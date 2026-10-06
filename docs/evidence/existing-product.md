# What Razorpay already does (P1-T02)

All pages read on 2026-10-06 (IST), public pages only. "App" means the Razorpay merchant app (Android `com.razorpay.payments.app`, iOS id1497250144).

## Sources

| # | Source | URL | Accessed |
| --- | --- | --- | --- |
| S1 | Payment Links: Send Reminders (docs) | https://razorpay.com/docs/payments/payment-links/reminders/ | 2026-10-06 |
| S2 | About Payment Links (docs) | https://razorpay.com/docs/payments/payment-links/ | 2026-10-06 |
| S3 | Resend a Payment Link (docs) | https://razorpay.com/docs/payments/payment-links/resend/ | 2026-10-06 |
| S4 | Create Payment Links on WhatsApp (docs) | https://razorpay.com/docs/payments/payment-links/whatsapp-bot/ | 2026-10-06 |
| S5 | Payment Link States (docs) | https://razorpay.com/docs/payments/payment-links/states/ | 2026-10-06 |
| S6 | Razorpay mobile app page | https://razorpay.com/payments-app/ | 2026-10-06 |
| S7 | Google Play listing (updated 30 Sept 2026) | https://play.google.com/store/apps/details?id=com.razorpay.payments.app | 2026-10-06 |
| S8 | App Store listing (version 3.0.7, "4 days ago") | https://apps.apple.com/in/app/razorpay-accept-payments-now/id1497250144 | 2026-10-06 |
| S9 | About Disputes (docs) | https://razorpay.com/docs/payments/disputes/ | 2026-10-06 |
| S10 | Settlements (docs) | https://razorpay.com/docs/payments/settlements/ | 2026-10-06 |

## The plan's 3 Oct facts, checked

| Plan said (3 Oct) | Today | Source |
| --- | --- | --- |
| Link reminders are automatic, SMS and email only | Confirmed: "Select the channel to send the reminders — SMS, email, or both." | S1 |
| At most 3 per link | Confirmed: "You can set a maximum of 3 reminders." | S1 |
| Sent only 11 AM to 12 PM and 3 PM to 5 PM | Confirmed: "Reminders are sent only between 11AM–12PM and 3PM–5PM." | S1 |
| WhatsApp is not listed | Confirmed for reminders. **Correction:** a WhatsApp bot exists to *create* links ("Send `Create <Amount>`"), installed from the Dashboard App Store. It does not send reminders | S1, S4 |
| Docs do not say whether reminders are configurable from the app | Confirmed. Reminder settings are on the Dashboard (account toggle, per-link toggle, at creation, in batch upload, by API). The app is not mentioned | S1 |
| (not in plan) | **Addition:** a link can be resent by hand from the Dashboard, by email or SMS, while it is in the Issued state. The app is not mentioned | S3 |
| (not in plan) | **Addition:** the redesigned app (versions 3.0.3 to 3.0.7, Aug to Oct 2026) puts "payments, settlements, QR codes, and payment links all a tap away". The app page says "Create and share payment links instantly"; a testimonial on it mentions cancelling payment links on the phone | S6, S8 |
| (not in plan) | Store listing: links can be shared "via an email, SMS, WhatsApp, Messenger etc." (sharing a new link, not chasing an overdue one) | S7 |

Not documented anywhere I could read: a list of overdue links ranked by who to chase, a reminder sent through the merchant's own WhatsApp, logging what the customer said (a promised date), or reminders from the app. I could not open the app itself (no account); the human can check this at G1, step 5.

## Coverage ratings (used in job-score.md)

| Job | Rating | Reason |
| --- | --- | --- |
| Collect (chasing overdue links) | 1 partly | Automatic SMS/email reminders (max 3, fixed hours) and manual resend exist on the Dashboard; nothing documented for deciding whom to chase, chasing on WhatsApp in the owner's voice, or logging promises, and nothing documented in the app |
| Dispute (card chargebacks) | 1 partly | Dashboard lets merchants view, accept, contest and submit evidence (S9); the app is not mentioned |
| Payout (held or late settlements) | 1 partly | Settlement cycle and Dashboard tracking are documented (S10) and the app shows settlements (S8); why funds are held, and how to get them released, is not covered in the docs read |
