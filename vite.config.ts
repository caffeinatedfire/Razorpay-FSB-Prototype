/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  // `npm run lan` (phone testing): no live-reload socket. When a phone sleeps or backgrounds the tab,
  // the socket drops and Vite's client reloads the page on return, which would cut a timed run short.
  server: process.env.COLLECT_LAN === '1' ? { ws: false } : {},
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx', 'tests/rules/**/*.test.ts'],
  },
});
