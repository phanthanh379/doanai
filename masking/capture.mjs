// RQ4 step 1 — capture reference screenshots and auto-extract exact ground-truth
// bounding boxes (PII regions to mask + benchmark item boxes) via Playwright.
// Output: screens/orig/<screen>.png + generated/groundtruth.json
// Requires the app dev server on http://localhost:5173 (V0).

import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { SCREENS, VIEWPORT } from './targets.config.mjs';

const BASE = 'http://localhost:5173';
const OUT_IMG = 'screens/orig';
const OUT_GEN = 'generated';
mkdirSync(OUT_IMG, { recursive: true });
mkdirSync(OUT_GEN, { recursive: true });

const SESSIONS = {
  admin: JSON.stringify({ username: 'admin', displayName: 'Alice Admin', role: 'admin' }),
  staff: JSON.stringify({ username: 'staff', displayName: 'Sam Staff', role: 'staff' }),
};

function round(box) {
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    w: Math.round(box.width),
    h: Math.round(box.height),
  };
}

const browser = await chromium.launch();
const groundtruth = [];

for (const screen of SCREENS) {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();
  if (screen.role) {
    await page.addInitScript((s) => localStorage.setItem('shopmini.session', s), SESSIONS[screen.role]);
  }
  await page.goto(BASE + screen.url);
  await page.waitForSelector(screen.waitFor);
  await page.waitForTimeout(300); // fonts/canvas settle

  const entry = { id: screen.id, url: screen.url, role: screen.role, pii: [], items: [] };

  for (const p of screen.pii) {
    const box = await page.locator(p.selector).boundingBox();
    if (!box) throw new Error(`PII region not found: ${screen.id}/${p.id}`);
    entry.pii.push({ id: p.id, box: round(box) });
  }

  for (const item of screen.items) {
    const el = page.locator(item.selector);
    let box = await el.boundingBox();
    if (!box) throw new Error(`Benchmark item not found: ${screen.id}/${item.id}`);
    // `region` = sub-box relative to the element (e.g. one bar inside a canvas)
    if (item.region) {
      box = {
        x: box.x + item.region.x,
        y: box.y + item.region.y,
        width: item.region.w,
        height: item.region.h,
      };
    }
    entry.items.push({ id: item.id, desc: item.desc, box: round(box) });
  }

  await page.screenshot({ path: `${OUT_IMG}/${screen.id}.png` });
  groundtruth.push(entry);
  await ctx.close();
  console.log(
    `[capture] ${screen.id}: ${entry.items.length} items, ${entry.pii.length} PII regions`,
  );
}

await browser.close();
writeFileSync(`${OUT_GEN}/groundtruth.json`, JSON.stringify(groundtruth, null, 2));
const total = groundtruth.reduce((n, s) => n + s.items.length, 0);
console.log(`[capture] done — ${total} benchmark items across ${groundtruth.length} screens`);
