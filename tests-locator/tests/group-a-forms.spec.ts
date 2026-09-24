import { expect, test } from '@playwright/test';
import { appUrl, gotoProducts } from './helpers';

// Group A — data-entry forms (login form + product form validation).
// Selectors are intentionally fixed CSS/XPath (see KeHoach_DoAn.md §2): this
// suite measures locator brittleness, so no getByRole/getByLabel is used.

test('A1: login with valid credentials reaches the product list', async ({ page }) => {
  await page.goto(appUrl('/login'));
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.login-card button[type="submit"]');
  await expect(page.locator('.products-page > h2')).toHaveText('Products');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(12);
});

test('A2: login with a wrong password shows an error message', async ({ page }) => {
  await page.goto(appUrl('/login'));
  await page.fill('#username', 'admin');
  await page.fill('#password', 'wrong-pass');
  await page.click('.login-card button[type="submit"]');
  await expect(page.locator('.login-error')).toHaveText('Invalid username or password');
});

test('A3: add-product form creates a new row', async ({ page }) => {
  await gotoProducts(page);
  await page.click("xpath=//button[text()='Add product']");
  const modal = page.locator('.modal.product-form');
  await modal.locator('label:nth-of-type(1) input').fill('Energy Drink 250ml');
  await modal.locator('label:nth-of-type(2) input').fill('BEV-004');
  await modal.locator('label:nth-of-type(3) select').selectOption('Beverage');
  await modal.locator('label:nth-of-type(4) input').fill('1.75');
  await modal.locator('label:nth-of-type(5) input').fill('0.95');
  await modal.locator('label:nth-of-type(6) input').fill('50');
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Save']");
  await expect(page.locator('.product-table tbody tr')).toHaveCount(13);
  await expect(page.locator('.product-table tbody tr:nth-child(13) td:nth-child(1)')).toHaveText(
    'Energy Drink 250ml',
  );
});

test('A4: submitting an empty product form shows validation errors', async ({ page }) => {
  await gotoProducts(page);
  await page.click("xpath=//button[text()='Add product']");
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Save']");
  const errors = page.locator('.modal .field-error');
  await expect(errors).toHaveCount(4);
  await expect(errors.nth(0)).toHaveText('Name is required');
  await expect(errors.nth(1)).toHaveText('SKU is required');
  await expect(errors.nth(2)).toHaveText('Price must be greater than 0');
});

test('A5: a non-positive price is rejected with a field error', async ({ page }) => {
  await gotoProducts(page);
  await page.click("xpath=//button[text()='Add product']");
  const modal = page.locator('.modal.product-form');
  await modal.locator('label:nth-of-type(1) input').fill('Broken Item');
  await modal.locator('label:nth-of-type(2) input').fill('TST-001');
  await modal.locator('label:nth-of-type(4) input').fill('-5');
  await modal.locator('label:nth-of-type(6) input').fill('10');
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Save']");
  await expect(page.locator('.modal .field-error')).toHaveText('Price must be greater than 0');
  // The row must NOT be created
  await page.click("xpath=//div[contains(@class,'modal-actions')]/button[text()='Cancel']");
  await expect(page.locator('.product-table tbody tr')).toHaveCount(12);
});
