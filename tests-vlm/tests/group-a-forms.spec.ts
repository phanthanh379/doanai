import { expect, test } from '../fixture';
import { appUrl, gotoProducts } from './helpers';

// Group A — data-entry forms. Mirrors tests-locator/tests/group-a-forms.spec.ts
// one-to-one, but every interaction/assertion is expressed in natural language
// (intent + appearance), never via selectors.

test('A1: login with valid credentials reaches the product list', async ({
  page,
  aiInput,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await page.goto(appUrl('/login'));
  await page.waitForLoadState('networkidle');
  await aiInput('the username field of the sign-in form', { value: 'admin' });
  await aiInput('the password field of the sign-in form', { value: 'admin123' });
  await aiTap('the button that submits the sign-in form');
  await aiAssert('a page titled "Products" with a table of products is visible');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(12);
});

test('A2: login with a wrong password shows an error message', async ({
  page,
  aiInput,
  aiTap,
  aiAssert,
}) => {
  await page.goto(appUrl('/login'));
  await page.waitForLoadState('networkidle');
  await aiInput('the username field of the sign-in form', { value: 'admin' });
  await aiInput('the password field of the sign-in form', { value: 'wrong-pass' });
  await aiTap('the button that submits the sign-in form');
  await aiAssert('an error message saying the username or password is invalid is visible');
});

test('A3: add-product form creates a new row', async ({
  page,
  aiInput,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the primary button in the toolbar that adds a new product');
  await aiInput('the Name field in the product dialog', { value: 'Energy Drink 250ml' });
  await aiInput('the SKU field in the product dialog', { value: 'BEV-004' });
  // Category defaults to "Beverage", which is the desired value — leave it as is.
  await aiInput('the Price field in the product dialog', { value: '1.75' });
  await aiInput('the Cost field in the product dialog', { value: '0.95' });
  await aiInput('the Stock field in the product dialog', { value: '50' });
  await aiTap('the button that saves/confirms the product dialog');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(13);
  await aiAssert('the last row of the product table is a product named "Energy Drink 250ml"');
});

test('A4: submitting an empty product form shows validation errors', async ({
  page,
  aiTap,
  aiAssert,
}) => {
  await gotoProducts(page);
  await aiTap('the primary button in the toolbar that adds a new product');
  await aiTap('the button that saves/confirms the product dialog');
  await aiAssert(
    'the dialog shows validation error messages, including that the name is required and the SKU is required',
  );
  await aiAssert('an error message says the price must be greater than 0');
});

test('A5: a non-positive price is rejected with a field error', async ({
  page,
  aiInput,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the primary button in the toolbar that adds a new product');
  await aiInput('the Name field in the product dialog', { value: 'Broken Item' });
  await aiInput('the SKU field in the product dialog', { value: 'TST-001' });
  await aiInput('the Price field in the product dialog', { value: '-5' });
  await aiInput('the Stock field in the product dialog', { value: '10' });
  await aiTap('the button that saves/confirms the product dialog');
  await aiAssert('an error message says the price must be greater than 0');
  await aiTap('the button that cancels/closes the product dialog');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(12);
});
