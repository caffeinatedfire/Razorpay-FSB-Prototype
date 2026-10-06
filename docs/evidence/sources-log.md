# Sources log

Every query run and every source tried, read or blocked (plan Appendix G). Times IST, 2026-10-06, approximate to within 5 minutes.
Raw downloads (which contain reviewer names) are kept outside the repo in `D:ISBRazorpayesearch-raw` and are not committed. Only coded rows with names removed enter `coded.csv`.

| When | Query or URL | Result | Rows coded |
| --- | --- | --- | --- |
| 13:20 | Web search "Razorpay payment links reminders" | Read; led to the docs and blog | 0 |
| 13:23 | https://razorpay.com/docs/payments/payment-links/reminders/ | Read (fetch tool, then raw page to check wording) | E-074 |
| 13:23 | https://razorpay.com/payments-app/ | Read | E-078 |
| 13:23 | https://razorpay.com/docs/payments/payment-links/ | Read | 0 (facts used in existing-product.md) |
| 13:23 | Google Play listing, Razorpay app, via fetch tool | Fetch tool returned no usable content (not an HTTP refusal); page then read with curl | 0 |
| 13:24 | https://razorpay.com/docs/payments/payment-links/manage/ | 404 | 0 |
| 13:24 | https://razorpay.com/docs/payments/dashboard/payment-links/ | 404 | 0 |
| 13:24 | Web search "Razorpay Payments app App Store apps.apple.com" | Found iOS id1497250144 | 0 |
| 13:25 | App Store listing id1497250144 (raw page) | Read: 4 reviews, release notes | E-072, E-073, E-080 |
| 13:25 | Google Play listing `com.razorpay.payments.app` (raw page) | Read: description, 3 reviews | E-079 |
| 13:26 | iTunes search API, country=in, for app ids | Read | 0 |
| 13:26 | Apple public review RSS feeds for 8 apps | Razorpay returned 50 reviews; the other 7 feeds returned empty | 0 |
| 13:27 | reddit.com search JSON | Refused (HTTP 403), attempt 1 | 0 |
| 13:27 | old.reddit.com search | Refused (HTTP 403), attempt 2 | 0 |
| 13:33 | reddit.com via fetch tool | Refused ("unable to fetch"), attempt 3: Reddit logged as **blocked** | 0 |
| 13:28 | Google Play public reviews, via the listing page's own "See all reviews" data endpoint (no login), sorted by most relevant and newest; Python urllib from the shell, up to 126 requests 1.5 s apart, none refused (one empty reply caused by my own pagination bug) | Khatabook 1,130; OkCredit 1,152; Vyapar 1,133; Razorpay 2,534; Paytm for Business 3,039; PhonePe Business 2,777; BharatPe 3,180; Cashfree 793 (15,738 total) | E-001 to E-071 |
| 13:29 | Keyword filters over those reviews | Raw hits: collect 510, payout 999, dispute 32 (loose matches) | see above |
| 13:30 | Play package ids tried and not found (404): com.khatabook.android, com.flobiz.android, com.instamojo.app, com.cashfree.payments, com.payu.merchant, com.payu.india.merchant, com.pinelabs.plutus, com.instamojo.android, com.mswipe.wisepos, com.ezetap.merchant | Not found | 0 |
| 13:31 | Web search "freelancer client payment pending reminder WhatsApp India reddit" | Vendor blogs; no Reddit results | 0 |
| 13:31 | Web search "customer not paying small business India how to ask for payment politely" | Generic non-Indian blogs; not coded | 0 |
| 13:31 | Web search "udhaar recovery shop customers not paying forum" | No forum threads found | 0 |
| 13:33 | Web search `site:reddit.com India small business customers not paying on time credit "WhatsApp"` | No Reddit results | 0 |
| 13:34 | help.zoho.com community thread on WhatsApp transaction messages (pages 1 to 3) | Page renders by script; no readable posts; skipped | 0 |
| 13:36 | https://razorpay.com/docs/payments/disputes/ | Read | E-083 |
| 13:36 | https://razorpay.com/docs/payments/settlements/ | Read | E-084 |
| 13:36 | Web search "MSME Samadhaan delayed payment 45 days official site msme.gov.in" | Found official pages | 0 |
| 13:37 | https://ramp.msme.gov.in/ramp/pdf-documents/scheme-guidelines/msefc.pdf | 404 | 0 |
| 13:37 | https://samadhaan.msme.gov.in/ | Read: Section 16, 45 days | E-081 |
| 13:37 | https://www.riffit.in/blog/payment-reminder-whatsapp-scripts-india | Read (vendor blog, context only) | E-082 |
| 13:38 | Payment Links docs: resend, whatsapp-bot, create, states (markdown versions) | Read | E-075, E-076, E-077 |

Not used: the Razorpay blog posts on reminders (marketing; the docs cover the facts), and generic US or UK "how to ask for payment" blogs (not Indian merchants).
| 14:02 | Human inbox: `docs/evidence/inbox/razorpay-track2-chat-notes.md` | Read. Chat notes, not coded items: "No forum data was collected in this chat." Used only as pointers to sources; each source re-read below | 0 directly |
| 14:03 | https://razorpay.com/agent-studio/ (raw page) | Read: 29 agent names; no collections agent for Payment Links | E-085 |
| 14:03 | https://razorpay.com/blog/automate-payment-reminders/ | Read | E-086 |
| 14:03 | The Rise, Delayed Payments Report 3.0 article | Read | E-087 |
| 14:03 | SME Street, Delayed Payments Report 3.0 article | Read; gives the MSME count as 6.4 crore where The Rise says 6.4 million, so the count is not used | E-088 |
| 14:03 | TaxGuru, Section 43B(h) article | Read | E-089 |
| 14:03 | Not re-read: newsroom launch post, Agentic Dashboard blog, MediaNama, RTO risk docs, Shopify thread | Not about chasing overdue links, or about AI agents dropped with Track 2 | 0 |
