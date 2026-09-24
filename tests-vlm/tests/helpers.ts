import type { Page } from '@playwright/test';

// Identical navigation/session helpers as the baseline suite so the comparison
// is fair: both suites inject the session and differ ONLY in how they locate
// and assert UI elements (fixed selectors vs natural language + vision).

export const VARIANT = process.env.APP_VARIANT ?? '';

export function appUrl(path: string): string {
  return VARIANT ? `${path}?variant=${VARIANT}` : path;
}

export async function loginAs(page: Page, role: 'admin' | 'staff') {
  const session =
    role === 'admin'
      ? { username: 'admin', displayName: 'Alice Admin', role: 'admin' }
      : { username: 'staff', displayName: 'Sam Staff', role: 'staff' };
  await page.addInitScript((s) => {
    localStorage.setItem('shopmini.session', JSON.stringify(s));
  }, session);
}

export async function gotoProducts(page: Page, role: 'admin' | 'staff' = 'admin') {
  await loginAs(page, role);
  await page.goto(appUrl('/products'));
  await page.waitForLoadState('networkidle');
}
