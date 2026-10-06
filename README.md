# Collect (concept prototype)

A phone-sized web app for chasing overdue payment links: who to chase today and why, a ready reminder in the owner's tone and language, and a log of what happened. It runs on synthetic data in the browser. **Nothing is ever sent to anyone**: the send step is a sheet labelled SIMULATED.

Built for Track 1 of the Razorpay x ISB AI PM Build Challenge. "Razorpay" is used here only as a plain-text reference; this is not a Razorpay product. The full README (what is real, simulated and assumed; known limits) comes in phase P6.

## Run it

```
npm ci
npm run dev
```

Then open http://localhost:5173/ . Add `?demo=1` to reset the demo data.

## Open it on your phone

1. Connect the computer and the phone to the same Wi-Fi.
2. On the computer, in this folder, run `npm run lan`.
3. It prints a line such as `http://192.168.1.23:5173/`. Type that address into the phone's browser.
4. To time yourself: on the phone, open Settings, turn on **Timed run**, go back to Home, type a label, tap **Start**, and chase the top card through to the Sent screen. The Sent screen shows the time and the tap count (practice data).
5. To export the times: open the same address with `?debug=1` at the end (for example `http://192.168.1.23:5173/?debug=1`) and tap **Export timings.csv** on Home. Save the file as `docs/evidence/timings.csv`.

Each timed run chases a card, so the next runner sees a different top card. To give every runner the same start, tap **Reset demo data** in Settings between runs (Timed run stays on).

**If the phone cannot open the address:**
- Windows may have asked whether Node.js can use the network. Allow it on **private** networks, then try again.
- Some Wi-Fi networks (offices, campuses, hotels) block phone-to-laptop traffic. Turn on the phone's hotspot, connect the computer to it, and run `npm run lan` again.
- If neither works, build a static copy with `npm run build` and drag the `dist` folder onto Netlify Drop (https://app.netlify.com/drop). `docs/deploy.md` (phase P7) will give the full steps. A hosted build never contains the real hand-off below.

## Optional: the real hand-off test (your own number only)

The prototype never messages a customer (rule R15). In a dev build you can check that WhatsApp opens with the message ready, addressed to **your own** number:

1. Create a file named `.env.local` in this folder (it is git-ignored and never committed or built) with:
   ```
   VITE_REAL_WHATSAPP=true
   VITE_OWN_WHATSAPP=91XXXXXXXXXX
   ```
   where the second line is your own WhatsApp number with country code, digits only.
2. Restart `npm run lan`.
3. On the phone, open a card, tap **Send on WhatsApp**. The SIMULATED sheet shows an extra button, **Dev test: open WhatsApp to my own number**. It opens WhatsApp with the message, addressed to you. Nobody else is messaged.

## Checks

```
npm run check      # typecheck, unit and rule tests, safety guard
npm run e2e        # Playwright happy path at 390 x 844, with accessibility checks
npm run fixtures:verify
```
