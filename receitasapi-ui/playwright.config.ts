import { defineConfig } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: {
    baseURL: base,
    headless: true,
    viewport: { width: 1280, height: 720 },
    channel: 'chrome'
  }
});
