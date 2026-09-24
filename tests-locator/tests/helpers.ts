import type { Page } from '@playwright/test';

// Variant under test (v0 = original). The harness sets APP_VARIANT for RQ1 runs.
export const VARIANT = process.env.APP_VARIANT ?? '';

export function appUrl(path: string): string {
  return VARIANT ? `${path}?variant=${VARIANT}` : path;
}

// Inject a session before first navigation (standard practice: skip UI login in
// tests that are not about the login form itself).
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
}
