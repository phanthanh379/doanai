import { expect, test } from '@playwright/test';
import { appUrl, gotoProducts, loginAs } from '../helpers';

// RQ3 — role-based UI access (locator-based method).
// 8 scenarios asserting presence/absence of privileged UI for each role.
// On the clean build (app-v1.0) all 8 must pass; on the seeded-bugs build
// (branch rq3-seeded-bugs) R1–R5 must FAIL — a failure = bug detected.

test('R1: staff must not see a delete icon in product rows', async ({ page }) => {
  await gotoProducts(page, 'staff');
  // staff actions cell is the 7th column; only view + edit icons allowed
  await expect(
    page.locator('.product-table tbody tr:nth-child(1) td:nth-child(7) .icon-btn'),
  ).toHaveCount(2);
});

test('R2: staff must not see the Cost column', async ({ page }) => {
  await gotoProducts(page, 'staff');
  await expect(page.locator('.product-table thead th')).toHaveCount(7);
  await expect(page.locator("xpath=//table//th[text()='Cost']")).toHaveCount(0);
});

test('R3: staff must not see the Settings navigation entry', async ({ page }) => {
  await gotoProducts(page, 'staff');
  await expect(page.locator('.nav-links > a')).toHaveCount(2);
  await expect(page.locator("xpath=//a[contains(@class,'nav-link')]//span[text()='Settings']")).toHaveCount(0);
});

test('R4: staff opening /settings directly must get an access-denied view', async ({ page }) => {
  await loginAs(page, 'staff');
  await page.goto(appUrl('/settings'));
  await expect(page.locator('.denied h2')).toHaveText('403 — Access denied');
  await expect(page.locator('.settings-form')).toHaveCount(0);
});

test('R5: staff product form must not contain the Cost field', async ({ page }) => {
  await gotoProducts(page, 'staff');
  // open edit dialog on row 1 (2nd icon = edit for staff as well)
  await page.click('.product-table tbody tr:nth-child(1) td:nth-child(7) .icon-btn:nth-child(2)');
  await expect(page.locator("xpath=//div[contains(@class,'product-form')]//label[contains(., 'Cost')]")).toHaveCount(0);
});

test('R6: admin sees delete icons in product rows', async ({ page }) => {
  await gotoProducts(page, 'admin');
  await expect(
    page.locator('.product-table tbody tr:nth-child(1) td:nth-child(8) .icon-btn'),
  ).toHaveCount(3);
});

test('R7: admin sees the Cost column', async ({ page }) => {
  await gotoProducts(page, 'admin');
  await expect(page.locator("xpath=//table//th[text()='Cost']")).toHaveCount(1);
});

test('R8: admin can open Settings and save', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto(appUrl('/settings'));
  await page.fill('.settings-form label:nth-of-type(1) input', 'My Test Store');
  await page.click("xpath=//button[text()='Save settings']");
  await expect(page.locator('.toast')).toHaveText('Settings saved');
});
