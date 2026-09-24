import { expect, test } from '@playwright/test';
import { appUrl, gotoProducts, loginAs } from './helpers';

// Group D — custom components with no semantic labels: icon-only buttons,
// star-rating widget, canvas chart, clickable div rows, role-based visibility.

const ACTIONS_CELL = 'td:nth-child(8)';

test('D1: the view icon opens a read-only product detail', async ({ page }) => {
  await gotoProducts(page);
  // 1st icon (eye glyph) of the 1st row
  await page.click(`.product-table tbody tr:nth-child(1) ${ACTIONS_CELL} .icon-btn:nth-child(1)`);
  const modal = page.locator('.modal.product-view');
  await expect(modal.locator('dd:nth-of-type(1)')).toHaveText('Cola Classic 330ml');
  await expect(modal.locator('dd:nth-of-type(2)')).toHaveText('BEV-001');
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Close']");
  await expect(modal).toHaveCount(0);
});

test('D2: the star widget sets the rating in the product form', async ({ page }) => {
  await gotoProducts(page);
  await page.click("xpath=//button[text()='Add product']");
  const modal = page.locator('.modal.product-form');
  await modal.locator('label:nth-of-type(1) input').fill('Premium Coffee Beans');
  await modal.locator('label:nth-of-type(2) input').fill('BEV-005');
  await modal.locator('label:nth-of-type(4) input').fill('8.90');
  await modal.locator('label:nth-of-type(6) input').fill('20');
  // click the 5th star of the rating input inside the form
  await modal.locator('.form-rating .stars > span:nth-child(5)').click();
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Save']");
  // rating is the 7th column; all 5 stars of the new row must be filled
  await expect(
    page.locator('.product-table tbody tr:nth-child(13) td:nth-child(7) .star.filled'),
  ).toHaveCount(5);
});

test('D3: clicking the Snack bar on the canvas chart filters the table', async ({ page }) => {
  await gotoProducts(page);
  // No DOM inside <canvas>: click fixed coordinates of the 2nd bar row (Snack).
  await page.locator('.chart-card canvas').click({ position: { x: 150, y: 56 } });
  await expect(page.locator('.filter-chips > span:nth-child(1)')).toContainText('Category: Snack');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(3);
});

test('D4: clicking a customer row (plain div) opens the profile with PII', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto(appUrl('/customers'));
  // 3rd row = Le Minh Chau
  await page.click('.customer-list > div:nth-child(3)');
  await expect(page.locator('.pii-card .pii-name')).toHaveText('Le Minh Chau');
  await expect(page.locator('.pii-card .pii-card-number')).toHaveText('4012 8888 8888 1881');
});

test('D5: staff role sees no delete icon, no cost column and no Settings link', async ({
  page,
}) => {
  await gotoProducts(page, 'staff');
  // staff column set has 7 columns (no Cost)
  await expect(page.locator('.product-table thead th')).toHaveCount(7);
  // actions cell (7th column for staff) contains only view + edit icons
  await expect(
    page.locator('.product-table tbody tr:nth-child(1) td:nth-child(7) .icon-btn'),
  ).toHaveCount(2);
  // no Settings entry in the nav
  await expect(page.locator('.nav-links > a')).toHaveCount(2);
});
