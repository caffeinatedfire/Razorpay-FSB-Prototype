# Collect (concept prototype)

A phone-sized web app for small sellers who bill on credit: it shows who to chase today and why, prepares a reminder in the owner's tone and language, and records what the customer said. It runs on synthetic data in the browser. **Nothing is ever sent to anyone**: the send step is a sheet labelled SIMULATED.

Built for Track 1 of the Razorpay x ISB AI PM Build Challenge. This is not a Razorpay product; "Razorpay" is used only as a plain-text reference.

**Try it:** https://rzp-fsb-cf-ptype.vercel.app/ on a phone. Add `?demo=1` to reset the demo data, or `?now=2026-10-06T22:30:00%2B05:30` to see quiet hours.

## Run it

```
npm ci
npm run check
npm run dev
```

Then open http://localhost:5173/ . `npm run check` runs the type check, the unit and rule tests, the safety guard and the rule-coverage check.

## What it does

1. **Home** shows what is owed and up to 5 links to chase today, each with a plain reason, plus "Needs you" (disputes, expired links, reminders used up) and "Waiting" (promises and next checks).
2. **Chase** shows "Why now", the link's timeline and a ready message: Gentle or Firm; English, हिन्दी or Hinglish; WhatsApp or SMS; signed by the owner.
3. **Send** opens a SIMULATED sheet. Collect first checks the amount and the link (hard), and asks again at night, within 48 hours of the last message to that customer, before a promised date, or if an edit sounds threatening (soft).
4. **Sent** sets the next check and offers Undo for 10 seconds.
5. **Log a reply**: promised a date, says they paid, disputes it, or no reply yet.
6. **Activity** and **Settings**, including SIMULATED demo controls (a payment arrives, a customer disputes).

## What is real, simulated and assumed

| Item | Status | Where |
| --- | --- | --- |
| Customers, amounts, links, phone numbers (`+91 00000 000NN`), payment history | simulated (synthetic, seeded) | `scripts/gen-fixtures.ts`, `fixtures/links.synthetic.json` |
| Sending a message | simulated: nothing leaves the phone | `src/ui/components/SendSheet.tsx` |
| Payments arriving, disputes | simulated, from the demo controls | Settings → Demo controls |
| The sender's name in messages ("Samik, CFI") | real: the builder's own name, not a merchant's | Settings → You |
| Message templates and the 18 rules | real, each rule tested | `src/templates/`, `src/rules/`, `tests/rules/` |
| Ranking weights, caps (3 reminders, 48 hours, 9 AM to 9 PM), metric baselines | assumed | `src/rank/`, `src/store/` |
| Evidence that the problem exists | real public reviews and docs, coded by an AI agent; not interviews | summarised in the note |
| Timed runs | real practice data from 3 non-merchants; not merchants | summarised in the note |

## Known limits

- Not validated with merchants. No merchant was interviewed.
- Not tested against Razorpay's API: the test-mode bridge was cut. The link shape follows the public API docs.
- The tap target (8 or fewer) was missed in first-use practice runs: median 9, by a counter that also counted scrolls; that counter has since been fixed.
- Data lives in the browser's local storage. Clearing site data resets the demo.

## Open it on your phone during development

1. Connect the computer and the phone to the same Wi-Fi, and run `npm run lan` in this folder.
2. It prints a line such as `http://192.168.1.23:5173/`. Open that address on the phone.
3. If the phone cannot open it, Windows may need to allow Node.js on the network, or the Wi-Fi may block device-to-device traffic (common on campus networks). Use the phone's hotspot instead, or the hosted link above.

**Timed runs:** in Settings, turn on **Timed run**; on Home, type a label such as `tester-1` (not a name) and tap **Start**; chase the top card to the Sent screen. Open the app with `?debug=1` and tap **Export timings.csv** (and **Export events.csv** to see what each run tapped).

**Own-number hand-off (development only):** a git-ignored `.env.local` with `VITE_REAL_WHATSAPP=true` and `VITE_OWN_WHATSAPP=<your number, digits only>` adds a button on the send sheet that opens WhatsApp addressed to your own number. Production builds contain none of it.

## Other commands

```
npm run e2e              # Playwright flows at 390 x 844 with accessibility checks
npm run fixtures:verify  # the synthetic data is byte-identical on every run
npm run demo:record      # records out/demo.webm from the storyboard
npm run note:pdf         # renders note/note.md to a one-page PDF
```
