import { expect, test } from '../fixture';
import { gotoProducts } from './helpers';

// Group C — CRUD lifecycle. Mirrors the baseline group C one-to-one.

test('C1: a created product survives a page reload (localStorage persistence)', async ({
  page,
  ai,
  aiInput,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the primary button in the toolbar that adds a new product');
  await aiInput('the Name field in the product dialog', { value: 'Trail Mix 300g' });
  await aiInput('the SKU field in the product dialog', { value: 'SNK-004' });
  await ai('set the Category dropdown in the product dialog to "Snack"');
  await aiInput('the Price field in the product dialog', { value: '3.30' });
  await aiInput('the Stock field in the product dialog', { value: '44' });
  await aiTap('the button that saves/confirms the product dialog');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(13);

  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(13);
  await aiAssert('the product table contains a row with SKU "SNK-004"');
});

test('C2: editing a product updates its row', async ({ page, aiInput, aiTap, aiAssert }) => {
  await gotoProducts(page);
  await aiTap('the pencil/edit icon in the row of "Green Tea Bottle 500ml"');
  await aiInput('the Name field in the product dialog', { value: 'Green Tea Bottle 600ml' });
  await aiInput('the Stock field in the product dialog', { value: '99' });
  await aiTap('the button that saves/confirms the product dialog');
  await aiAssert('the product table contains a row named "Green Tea Bottle 600ml" with stock 99');
});

test('C3: deleting a product removes its row after confirmation', async ({
  page,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the trash/delete icon in the row of "Cola Classic 330ml"');
  await aiAssert('a confirmation dialog asking to delete "Cola Classic 330ml" is visible');
  await aiTap('the destructive button in the dialog that confirms the deletion');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(11);
  await aiAssert('no row named "Cola Classic 330ml" exists in the product table');
});

test('C4: cancelling the delete confirmation keeps the row', async ({
  page,
  aiTap,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the trash/delete icon in the row of "Cola Classic 330ml"');
  await aiTap('the button in the confirmation dialog that cancels the deletion');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(12);
});
