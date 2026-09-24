import { expect, test } from '../fixture';
import { appUrl, gotoProducts, loginAs } from './helpers';

// Group D — custom components with no semantic labels. Mirrors baseline group D.
// This is where vision-based grounding matters most: icon-only buttons, star
// widgets, a canvas chart and clickable plain-div rows.

test('D1: the view icon opens a read-only product detail', async ({
  page,
  aiTap,
  aiAssert,
}) => {
  await gotoProducts(page);
  await aiTap('the icon (not the edit or delete icon) in the row of "Cola Classic 330ml" that opens a read-only detail view');
  await aiAssert('a read-only product detail dialog shows the name "Cola Classic 330ml" and SKU "BEV-001"');
  await aiTap('the button that closes the detail dialog');
  await aiAssert('no dialog is open anymore');
});

test('D2: the star widget sets the rating in the product form', async ({
  page,
  aiInput,
  aiTap,
  aiAssert,
}) => {
  await gotoProducts(page);
  await aiTap('the primary button in the toolbar that adds a new product');
  await aiInput('the Name field in the product dialog', { value: 'Premium Coffee Beans' });
  await aiInput('the SKU field in the product dialog', { value: 'BEV-005' });
  await aiInput('the Price field in the product dialog', { value: '8.90' });
  await aiInput('the Stock field in the product dialog', { value: '20' });
  await aiTap('the 5th (rightmost) star of the rating widget inside the product dialog');
  await aiTap('the button that saves/confirms the product dialog');
  await aiAssert(
    'the row named "Premium Coffee Beans" in the product table shows a 5-star (all stars filled) rating',
  );
});

test('D3: clicking the Snack bar on the canvas chart filters the table', async ({
  page,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the orange horizontal bar labeled "Snack" inside the "Products by category" chart');
  await aiAssert('a filter chip indicating the category filter "Snack" is visible');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(3);
});

test('D4: clicking a customer row (plain div) opens the profile with PII', async ({
  page,
  aiTap,
  aiAssert,
}) => {
  await loginAs(page, 'admin');
  await page.goto(appUrl('/customers'));
  await page.waitForLoadState('networkidle');
  await aiTap('the customer row of "Le Minh Chau" in the customer list');
  await aiAssert('a customer profile is shown for "Le Minh Chau"');
  await aiAssert('the profile shows the card number "4012 8888 8888 1881"');
});

test('D5: staff role sees no delete icon, no cost column and no Settings link', async ({
  page,
  aiAssert,
}) => {
  await gotoProducts(page, 'staff');
  await aiAssert('the product table has no "Cost" column');
  await aiAssert('the product rows contain no trash/delete icon button');
  await aiAssert('the navigation menu has no "Settings" entry');
});
