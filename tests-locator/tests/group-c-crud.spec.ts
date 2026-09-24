import { expect, test } from '@playwright/test';
import { gotoProducts } from './helpers';

// Group C — CRUD lifecycle (create persists, update, delete + confirm dialog).
// Admin action icons in V0 order: [view, edit, delete] inside the actions cell
// (8th column for admin). Icon buttons carry no semantic markup, so structural
// nth-child selectors are the only locator option.

const ACTIONS_CELL = 'td:nth-child(8)';

test('C1: a created product survives a page reload (localStorage persistence)', async ({
  page,
}) => {
  await gotoProducts(page);
  await page.click("xpath=//button[text()='Add product']");
  const modal = page.locator('.modal.product-form');
  await modal.locator('label:nth-of-type(1) input').fill('Trail Mix 300g');
  await modal.locator('label:nth-of-type(2) input').fill('SNK-004');
  await modal.locator('label:nth-of-type(3) select').selectOption('Snack');
  await modal.locator('label:nth-of-type(4) input').fill('3.30');
  await modal.locator('label:nth-of-type(6) input').fill('44');
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Save']");
  await expect(page.locator('.product-table tbody tr')).toHaveCount(13);

  await page.reload();
  await expect(page.locator('.product-table tbody tr')).toHaveCount(13);
  await expect(page.locator('.product-table tbody tr:nth-child(13) td:nth-child(2)')).toHaveText(
    'SNK-004',
  );
});

test('C2: editing a product updates its row', async ({ page }) => {
  await gotoProducts(page);
  // 2nd row = Green Tea Bottle 500ml; edit = 2nd icon in the actions cell
  await page.click(`.product-table tbody tr:nth-child(2) ${ACTIONS_CELL} .icon-btn:nth-child(2)`);
  const modal = page.locator('.modal.product-form');
  await modal.locator('label:nth-of-type(1) input').fill('Green Tea Bottle 600ml');
  await modal.locator('label:nth-of-type(6) input').fill('99');
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Save']");
  await expect(page.locator('.product-table tbody tr:nth-child(2) td:nth-child(1)')).toHaveText(
    'Green Tea Bottle 600ml',
  );
  await expect(page.locator('.product-table tbody tr:nth-child(2) td:nth-child(6)')).toHaveText(
    '99',
  );
});

test('C3: deleting a product removes its row after confirmation', async ({ page }) => {
  await gotoProducts(page);
  // 1st row = Cola Classic; delete = 3rd icon in the actions cell
  await page.click(`.product-table tbody tr:nth-child(1) ${ACTIONS_CELL} .icon-btn:nth-child(3)`);
  await expect(page.locator('.modal.confirm p')).toContainText('Cola Classic 330ml');
  await page.click('.modal.confirm .btn-danger');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(11);
  await expect(page.locator('.product-table tbody tr:nth-child(1) td:nth-child(1)')).toHaveText(
    'Green Tea Bottle 500ml',
  );
});

test('C4: cancelling the delete confirmation keeps the row', async ({ page }) => {
  await gotoProducts(page);
  await page.click(`.product-table tbody tr:nth-child(1) ${ACTIONS_CELL} .icon-btn:nth-child(3)`);
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Cancel']");
  await expect(page.locator('.product-table tbody tr')).toHaveCount(12);
});
