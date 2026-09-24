import { expect, test } from '@playwright/test';
import { gotoProducts } from './helpers';

// Group B — list, search and filters.

test('B1: searching by name narrows the list to a single match', async ({ page }) => {
  await gotoProducts(page);
  await page.fill('.toolbar > input.search-input', 'cola classic');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.product-table tbody tr:nth-child(1) td:nth-child(1)')).toHaveText(
    'Cola Classic 330ml',
  );
});

test('B2: the category dropdown filters rows and shows a filter chip', async ({ page }) => {
  await gotoProducts(page);
  await page.selectOption('.toolbar > select.category-filter', 'Snack');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.filter-chips > span:nth-child(1)')).toContainText('Category: Snack');
  // every visible category cell reads "Snack" (category is the 3rd column)
  const cells = page.locator('.product-table tbody tr td:nth-child(3)');
  for (let i = 0; i < 3; i++) await expect(cells.nth(i)).toHaveText('Snack');
});

test('B3: the star widget filters by minimum rating', async ({ page }) => {
  await gotoProducts(page);
  // 4th star in the toolbar rating filter (custom widget, no semantic markup)
  await page.click('.toolbar > span.stars > span:nth-child(4)');
  await expect(page.locator('.filter-chips > span:nth-child(1)')).toContainText('Rating: 4+');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(7);
});

test('B4: a search with no matches shows the empty state, clearing restores all rows', async ({
  page,
}) => {
  await gotoProducts(page);
  await page.fill('.toolbar > input.search-input', 'zzz-nothing');
  await expect(page.locator('.product-table tbody tr.empty-row td')).toHaveText(
    'No products match the current filters.',
  );
  await page.fill('.toolbar > input.search-input', '');
  await expect(page.locator('.product-table tbody tr')).toHaveCount(12);
});
