import { test } from '../../fixture';
import { appUrl, gotoProducts, loginAs } from '../helpers';

// RQ3 — role-based UI access (VLM-based method). Mirrors the locator RBAC
// suite one-to-one: 8 visual presence/absence checks per role.
// On the clean build all 8 must pass; on the seeded-bugs build R1–R5 must
// FAIL — a failure = the VLM detected the seeded permission bug.

test('R1: staff must not see a delete icon in product rows', async ({ page, aiAssert }) => {
  await gotoProducts(page, 'staff');
  await aiAssert('the rows of the product table contain no trash/delete icon button');
});

test('R2: staff must not see the Cost column', async ({ page, aiAssert }) => {
  await gotoProducts(page, 'staff');
  await aiAssert('the product table has no column named "Cost"');
});

test('R3: staff must not see the Settings navigation entry', async ({ page, aiAssert }) => {
  await gotoProducts(page, 'staff');
  await aiAssert('the navigation menu contains no "Settings" entry');
});

test('R4: staff opening /settings directly must get an access-denied view', async ({
  page,
  aiAssert,
}) => {
  await loginAs(page, 'staff');
  await page.goto(appUrl('/settings'));
  await page.waitForLoadState('networkidle');
  await aiAssert('an access-denied (403) message is shown instead of a settings form');
});

test('R5: staff product form must not contain the Cost field', async ({
  page,
  aiTap,
  aiAssert,
}) => {
  await gotoProducts(page, 'staff');
  await aiTap('the pencil/edit icon in the first row of the product table');
  await aiAssert('the product dialog has no field labeled "Cost"');
});

test('R6: admin sees delete icons in product rows', async ({ page, aiAssert }) => {
  await gotoProducts(page, 'admin');
  await aiAssert('every row of the product table contains a trash/delete icon button');
});

test('R7: admin sees the Cost column', async ({ page, aiAssert }) => {
  await gotoProducts(page, 'admin');
  await aiAssert('the product table has a column named "Cost"');
});

test('R8: admin can open Settings and save', async ({ page, aiInput, aiTap, aiAssert }) => {
  await loginAs(page, 'admin');
  await page.goto(appUrl('/settings'));
  await page.waitForLoadState('networkidle');
  await aiInput('the "Store name" field of the settings form', { value: 'My Test Store' });
  await aiTap('the button that saves the settings');
  await aiAssert('a confirmation message "Settings saved" is visible');
});
