#!/usr/bin/env node
// `npm run lan`: the Vite dev server on the local network, for opening Collect on a phone on the same Wi-Fi.
// Prints the URL(s) to type into the phone. Dev mode is the only mode that can use the real hand-off
// to the owner's own number (R15).

import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';

const PORT = Number(process.env.LAN_PORT || 5173);

const addrs = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a && a.family === 'IPv4' && !a.internal)
  .map((a) => a.address);

console.log('');
if (addrs.length === 0) {
  console.log('No local-network address found. Is Wi-Fi on? See README, "Open it on your phone".');
} else {
  console.log('Open one of these on your phone (same Wi-Fi):');
  for (const a of addrs) console.log(`  http://${a}:${PORT}/`);
}
console.log('');

const vite = spawn(process.execPath, [join('node_modules', 'vite', 'bin', 'vite.js'), '--host', '--port', String(PORT), '--strictPort'], {
  stdio: 'inherit',
});
vite.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => vite.kill(sig));
