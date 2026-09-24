import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// VLM-based suite (Midscene.js). Requires .env with MIDSCENE_MODEL_* variables.
// IMPORTANT for the experiment: never enable MIDSCENE_CACHE (it would distort
// flakiness measurements); keep workers=1 so API latency numbers are clean.
// When the experiment harness sets HARNESS_JSON, also emit machine-readable results.
const reporter: Array<[string] | [string, unknown]> = [
  ['list'],
  ['@midscene/web/playwright-reporter', { type: 'merged' }],
];
if (process.env.HARNESS_JSON) reporter.push(['json', { outputFile: process.env.HARNESS_JSON }]);

export default defineConfig({
  testDir: '.',
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  reporter,
  use: {
    baseURL: 'http://localhost:5173',
    // 1280x1100 so the full 13-row product table fits in one screenshot:
    // VLM perception is viewport-bound (aiNumber counts visible rows only).
    // Keep identical to tests-locator config for symmetric experiment conditions.
    viewport: { width: 1280, height: 1100 },
  },
  webServer: {
    command: 'npm run dev',
    cwd: '../app',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
