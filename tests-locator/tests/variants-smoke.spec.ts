import { expect, test } from '@playwright/test';
import { loginAs } from './helpers';

// Infrastructure smoke check (NOT part of the 18 experiment test cases):
// verifies that every UI variant can be selected via ?variant= and renders its
// distinguishing presentation change. Always runs on explicit variant URLs.

test('smoke: v0 renders light theme with sidebar layout', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/products?variant=v0');
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'v0');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.app.layout-sidebar')).toHaveCount(1);
});

test('smoke: v1 switches to dark theme', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/products?variant=v1');
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'v1');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.app.layout-sidebar')).toHaveCount(1);
});

test('smoke: v2 switches to topbar layout with reordered columns', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/products?variant=v2');
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'v2');
  await expect(page.locator('.app.layout-topbar')).toHaveCount(1);
  // V2 moves the actions column first → first header cell is empty, second is Name
  await expect(page.locator('.product-table thead th:nth-child(1)')).toHaveText('');
  await expect(page.locator('.product-table thead th:nth-child(2)')).toHaveText('Name');
  // chart moved below the table
  await expect(page.locator('.table-footer + .chart-card')).toHaveCount(1);
});

test('smoke: v3 renders alternate icons and renamed labels', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/products?variant=v3');
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'v3');
  await expect(page.locator('.toolbar button.btn-primary')).toHaveText('Create item');
  await expect(page.locator('.toolbar input.search-input')).toHaveAttribute(
    'placeholder',
    'Type to find an item...',
  );
  // navigation preserves the variant across pages
  await page.click("xpath=//a[contains(@class,'nav-link')]//span[text()='Customers']");
  await expect(page).toHaveURL(/variant=v3/);
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'v3');
});
