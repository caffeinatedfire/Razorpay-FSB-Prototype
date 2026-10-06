# Capabilities (P0-T01)

Checked 2026-10-06T13:20+05:30 on the human's Windows 11 machine.

| Item | Result | Notes |
| --- | --- | --- |
| Node | v20.17.0 | Meets "20 or newer". Below 20.19, so Vite 7+, Vitest 4+ and jsdom 30 are out (D-12) |
| npm | 10.8.2 | |
| git | 2.55.0.windows.5 | |
| Web search tool | works | Test query "Razorpay payment links reminders" returned results |
| Web fetch tool | available | Used from P1 |
| `npx playwright install chromium` | succeeded | Chrome Headless Shell 153 for Playwright 1.63.0 |
| ffmpeg | not found | Optional. The demo ships as `out/demo.webm` only, unless the human installs ffmpeg |
| Shell | PowerShell and Git Bash | `package.json` scripts avoid shell-only syntax |
