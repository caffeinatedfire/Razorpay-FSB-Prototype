# AI build log: Collect

Facts only, compiled from `docs/build-log.md`, `docs/decision-log.md` and the git history. Times are IST. Sections 4 and 5 are copied from the logs by `node scripts/ai-build-log.mjs`, word for word.

## 1. How AI was used

| Area | Tool | What the AI did | How it sped up or improved the work | Where I made the key decisions |
| --- | --- | --- | --- | --- |
| The plan | An AI planner chat, before this repo existed | Wrote `IMPLEMENTATION_PLAN.md`: phases, six human gates, rules R01 to R18, templates, evidence scheme | Every later step had an acceptance check and a stop rule written down before any code | I chose Track 1 and the Collect job (D-01, D-02) and set the gate times |
| Research and evidence | Claude Code | Read Razorpay's public docs; downloaded 15,738 public Play reviews through the store page's own data endpoint (D-13); coded 89 items; scored three jobs | One pass over thousands of reviews instead of reading them by hand; every row has a URL, a date and a quote of 20 words or fewer | I spot-checked 5 rows of my choosing at G1 and locked Collect only provisionally (D-16) |
| Design | Claude Code | Journey map, 7 wireframes, 12 product decisions, metrics, a 90-second storyboard | A full paper design to judge before any code | I kept Hindi and Hinglish and kept D-01 (G2) |
| Code | Claude Code | The React app, 18 rules as pure functions, the store, instrumentation, the demo recorder | Six screens, three languages and every rule tested inside two days | My G3 changes (sender sign-off, Gentle and Firm, a tap counter that ignores scrolls), the visual style (D-25), the sender name (D-36) |
| Tests and safety | Claude Code | Unit and rule tests titled by rule ID, end-to-end flows with accessibility checks, a guard against live keys, real-looking phone numbers and stray clocks | Bugs were caught by tests before I saw them, and the guard ran on every commit | I ran timed tests on my own phone and with people who had not seen the app |
| Fixtures | Claude Code | A seeded generator: 30 links, 14 invented customers, the same bytes on every run | A repeatable demo state | None needed |
| Note, video, logs | Claude Code | Drafted this log, the one-page note, the demo script and captions; recorded the video with a script | A draft in minutes, with every number traced to a file and line | I write the lines marked [YOU] in the note, and approve the content at G5 |

## 2. Timeline

Actual times are read from git commit times, not estimated. "Planned" is the plan's agent-hour estimate.

| Phase | Planned | Actual, from commits | Gate result |
| --- | --- | --- | --- |
| P0 Foundations | 0.75 h | about 0.1 h (plan written 13:15, scaffold committed 13:22, 6 Oct) | no gate |
| P1 Evidence and problem lock | 4 h | about 0.6 h (13:22 to 13:52, 6 Oct, including two corrections) | G1: approved with changes (provisional lock) |
| P2 Design and storyboard | 3 h | about 0.1 h (14:02 to 14:07, 6 Oct) | G2: approved with changes |
| P3 Happy-path build | 6 h | about 0.3 h (14:18 to 14:38, 6 Oct), then two fixes from phone testing (01:58 and 02:32, 7 Oct) | G3: approved with changes |
| P4 Edge states and rules | 5 h | about 0.25 h (15:57 to 16:11, 8 Oct), then G4 changes to 16:57 | G4: approved with changes |
| P5 Razorpay test-mode bridge | 3 h | cut at G3 (D-29) | none |
| P6 Demo, note and logs | 5 h | about 0.3 h (16:57 to 17:15, 8 Oct, last content commit); feature freeze `freeze-1` tagged at 16:10, 9 Oct, after a bug-fix morning with no bugs reported | G5 pending |
| P7 Package and submit | 2 h | not started | G6 pending |

Also done at my request between gates, on 7 Oct: the check of my Vercel deploy (17:24), moving working files out of git (17:35 to 17:53), and the restyle to the merchant app's colours (committed 23:15).

The "Minutes" lines in the build log before 8 Oct, 16:13 were estimates, not measurements; a correction entry says so. The commit times above are the reliable record.

## 3. Prompts that mattered

1. The start prompt, as written in section 0 of the plan: "Read IMPLEMENTATION_PLAN.md completely. Work autonomously through the phases in order, starting at the first phase whose Status is not done or cut. Stop at every gate in section 5 and at every stop-and-ask trigger in section 2. Do not start the next phase until I reply to a gate." The session that ran P0 is not in these logs, so whether it was sent word for word is not recorded here.
2. G1: "approved with changes: lock Collect provisionally". It kept the job but made the note state that the lock rests on 37 reviews.
3. "Use this color and layout scheme from razorpay app and fix the prototype". It changed the look, and the AI kept the parts of the plan's branding rule that protect honesty: no logo, and "not a Razorpay product" on Home (D-25).
4. "Add files such as evidence, logs etc that are not needed for the submission to git ignore and tell me how to delete them from git". It made the public repo hold only the product (D-24).
5. G3: "approved with changes: A, B1, C; cut P5; I can read Hindi; yes to the space before ।". It turned my testers' notes into changes and cut the Razorpay test-mode bridge (D-26 to D-31).

## 4. Where the AI was wrong

Every "AI was wrong about" line from the build log, in order. Where a fix followed, the line says what changed.

- **2026-10-06T13:25+05:30 · P0-T01 to P0-T08 · scaffold, guard, logs.** (1) the guard's first version matched the bare live-key prefix and so failed on IMPLEMENTATION_PLAN.md and on its own comment; changed to require a key-like character and ignore the plan's backticked test value (D-11). (2) I first reached for the latest Vite/Vitest/jsdom; their engines need Node 20.19+ and this machine has 20.17.0, so I pinned the previous majors (D-12).
- **2026-10-06T13:45+05:30 · P1-T01 to P1-T08 · evidence, problem, gate G1.** (1) the web-fetch tool returned nothing for the Play listing and summarised the App Store page in its own words, so I switched to raw page text for every quote; (2) my first Play pagination code read the wrong field for the next-page token and crashed; (3) my first shell heredoc mangled a backslash in Python (a gotcha the owner had already recorded), so scripts are written with the editor; (4) I first drafted the persona with an invented business name that implied a gender, then removed it; (5) I first mis-added the n=25 sensitivity scores in job-score.md (0.655/0.628 instead of 0.683/0.655) and fixed them before the gate.
- **2026-10-06T14:00+05:30 · P1 fix · request count and tool for the Play reviews.** the request count. I estimated it instead of adding up the script runs (2 + 10 + 2 debug + 42 + 6 + 64).
- **2026-10-06T14:06+05:30 · G1 changes, P1-T01 · provisional lock, inbox intake.** adding the status line pushed PROBLEM.md to 476 words, over the 450 limit; trimmed to 450.
- **2026-10-06T14:35+05:30 · P2-T01 to P2-T09 · design, storyboard, gate G2.** (1) S5 first showed "Recovered this week: ₹22,000 via link ₹17,000" next to an ₹18,000 link payment, which cannot add up; fixed to ₹40,000 (₹35,000 + ₹5,000), with Home's ₹22,000 as the figure before that payment; (2) the S2 length counter was a guess (134); measured as 146; (3) two decision rows cited evidence that did not support them (E-031/E-032 for "ledger apps do invoicing"; E-080 for owner behaviour); reworded.
- **2026-10-06T14:45+05:30 · housekeeping · separate from the MyProd project.** I started work from a Claude Code session opened in the MyProd folder, so the session's own files and scratch space sat under MyProd's name, and P0's first commit read the author name from MyProd's git config (it resolved to the global identity).
- **2026-10-06T14:22+05:30 · G2 changes · reply logged, timestamps corrected.** timestamps. The P2 entry above says 14:35 and the housekeeping entry 14:45, and G2.md said "Written: 14:35", but git shows the P2 commit at 14:07:16 and the housekeeping commits at 14:13 and 14:14, and the clock read 14:18 when the G2 reply arrived. Those times were estimated, not read from the clock. True times: P2 commit 14:07, housekeeping 14:13 to 14:14. From now on every entry time is read from the system clock (`date`). The "Minutes" figures in earlier entries are estimates too.
- **2026-10-06T14:29+05:30 · P3-T01 to P3-T06 · domain, clock, fixtures, rules, ranking, templates, store.** (1) my first action table followed the rows literally, so a disputed customer's paid link would have stayed in "Needs you"; settled links are now excluded first (D-21a). (2) My first "promise has passed" reason compared against now minus 24 hours rather than the IST day after the promise; replaced with the same day boundary R08 uses. (3) The first generator could place a touched link's earlier reminders before its due date; touched links now get a minimum number of overdue days.
- **2026-10-06T14:33+05:30 · P3-T07, P3-T08 · screens S1 to S3, send sheet, Activity, Settings stub, instrumentation.** (1) the Sent-screen evidence screenshot showed "Run time: 2 s", which is the test script's speed; the plan forbids presenting a scripted speed, so the e2e now masks that readout. (2) The production build still carried the dev-only button's label (no URL, no number, never rendered); the button is now gated on the dev flag and a build scan finds no hand-off code. (3) My first empty-state total used a type cast to dodge a missing link; rewritten.
- **2026-10-07T01:57+05:30 · P3 fix (during G3) · run label no longer asks for a name.** I wrote the first hint as "first name or a label", which invites testers' real names into a committed file.
- **2026-10-07T02:32+05:30 · P3 fix (during G3) · timed runs lost on the phone.** I kept the run only in memory and counted on the page never reloading. Vite's dev client reloads the page when its socket drops and comes back, which a phone does whenever the screen sleeps or the tab goes to the background. The e2e passed in desktop Chromium, where that never happens. Not proven: I could not run Firefox for Android here, so this is the likely cause, not a confirmed one.
- **2026-10-07T17:35+05:30 · housekeeping (during G3) · working files git-ignored.** my first script to write this entry crashed (it called rstrip on a file object), so the .gitignore commit went in without this entry; added in a follow-up commit.
- **2026-10-07T23:15+05:30 · restyle (during G3) · colour and layout from the merchant app.** (1) my first plan was to copy the app's button blue as is; white text on it is about 3.8:1 and would fail the axe check, so filled buttons use the app's darker blue. (2) My first colour-sampling script assumed Pillow; it was not installed.
- **2026-10-08T11:11+05:30 · G3 intake · timings and notes from the human.** my label hint said "not a name", but nothing stopped a name from being typed; the export kept three first names. Also, the tap counter counts the start of a scroll as a tap, which I listed as a known gap but did not fix before the human's runs, so the 9-tap median cannot be explained.
- **2026-10-08T16:00+05:30 · P4-T01 · G3 changes A, B1, C and the Hindi danda.** (1) my first edit script wrote real newlines into a TypeScript string in eventsCsv; the typecheck caught it. (2) I first meant to add owner fields to OwnerSettings, which Appendix C says to copy exactly; they live beside it instead.
- **2026-10-08T16:02+05:30 · P4-T02 · rules R01, R03, R11, R16; rule coverage.** my first script mangled the regex escapes for the lexicon (Python and TypeScript escaping stacked), which the typecheck caught; fixed by hand. In a JS template literal "\p" silently becomes "p", so the Unicode classes needed doubled backslashes.
- **2026-10-08T16:11+05:30 · P4-T03 to P4-T10 · Log reply, full Settings, quiet hours, undo, stale status, edge e2e.** (1) five of my new e2e tests first failed on ambiguous selectors ("Link" and "Message" each matched a section and its control); fixed in the tests, not the app. (2) The Activity line for a promise showed a raw ISO date; now "Fri 9 Oct". (3) The stale-status flow cannot happen by navigating to Settings while a card stays open, so the demo control schedules a payment 10 s ahead; this is how G4 step 1 will test it.
- **2026-10-08T16:12+05:30 · correction · "Minutes" in recent entries were invented.** I wrote minute counts from a sense of effort instead of reading the clock, after promising in the 14:22 entry on 6 Oct to read times from the clock. From now on, Minutes = end time minus start time, both from `date`, and the start time is written down.
- **2026-10-08T16:55+05:30 · G4 changes · 5-second demo payment, timings kept apart, remount bug.** (1) my new assertion first failed because the dev server's StrictMode logs effects twice at the same timestamp, which I had mistaken for the remount; the live (production) run showed the real remount after the send. (2) My first write of the G4 reply into the decision log turned "\r" and "\t" in the Windows paths into control characters; rewritten from a file so it is word for word.
- **2026-10-08T17:14+05:30 · P6-T02 to P6-T08 · numbers, demo video, note, audit, AI build log, README.** (1) the first recording was 96.3 s although the script timeline said 91.7 s: the video starts when the page opens and keeps running while the browser closes; it now trims the lead-in with Playwright's ffmpeg and reads the file's duration. (2) my duration probe used ffmpeg's null output, which this ffmpeg build lacks. (3) the caption bar first covered "Confirm (simulated)" and "Send anyway". (4) the storyboard's E-001 snippet ran on with "but everyone uses WhatsApp", which is not in the coded quote; the video shows only the verified words. (5) my draft caption "37 public reviews coded" would have hidden that 73 reviews were coded and 37 are about this job. (6) my first voice-over said "I coded thirty-seven reviews"; the AI coded them. (7) my first note said "only 14% chase purely by hand" and named a model for sessions I cannot verify; both reworded. (8) a new decisions.md row said "Testers read 'Polite' as formality", which no note says; replaced with the note's own words.

## 5. Decisions I made

My gate replies, copied word for word from the decision log.

> GATE G1 | 2026-10-06T13:59+05:30 | approved with changes: lock Collect provisionally
>
> uploaded evidence notes at docs/evidence/inbox/razorpay-track2-chat-notes

> GATE G2 | 2026-10-06T14:18+05:30 | approved with changes: keep Hindi and Hinglish, keep D-01

> GATE G3 | 2026-10-08T15:57+05:30 | approved with changes: A, B1, C; cut P5; I can read Hindi; yes to the space before ।

> GATE G4 | 2026-10-08T16:54+05:30 | (line breaks kept as in the reply)
> pushed
>
> 1. use friday for bugs
> 2. Updated
> "D:\ISB\Razorpay\razorpay-collect-prototype\docs\evidence\events.csv"
> "D:\ISB\Razorpay\razorpay-collect-prototype\docs\evidence\timings.csv"
> 3. Samik, CFI
> 4. Make it 5 seconds
>
>
> What next?

> GATE G4 | 2026-10-08T16:57+05:30 | answers to the agent's follow-up questions, verbatim: Demo sender: "Use "Samik, CFI"". New runs: "Me, after seeing the app". G4: "Approved with changes".

Other decisions recorded as mine in the decision log: D-01, D-02, D-16, D-18, D-19, D-24, D-25, D-26, D-27, D-28, D-29, D-30, D-31, D-33, D-34, D-36, D-37.

## 6. What I would not trust AI with here

Drafted from what went wrong above; I confirm or change these at G5.

1. **Numbers and times without a source.** The AI wrote minute counts from a sense of effort instead of the clock, and a storyboard quote ran past what the evidence contains. Every figure now has to point to a file and a line.
2. **Anything sent to a real person.** Collect never sends: the send step is simulated, and the only real hand-off is to my own number in a development build.
3. **Calling the evidence validation.** The reviews were found and coded by the same AI; its re-code agreeing with itself is not an independent check. My five-row spot check and the timed runs on my phone were the human checks.

## 7. Reproduce it

```
npm ci
npm run check
npm run dev
```
