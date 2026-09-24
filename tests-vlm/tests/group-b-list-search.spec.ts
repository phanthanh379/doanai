import { expect, test } from '../fixture';
import { gotoProducts } from './helpers';

// Group B — list, search and filters. Mirrors the baseline group B one-to-one.

test('B1: searching by name narrows the list to a single match', async ({
  page,
  aiInput,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiInput('the search box above the product table', { value: 'cola classic' });
  expect(await aiNumber('how many product rows does the table contain?')).toBe(1);
  await aiAssert('the only visible product row is "Cola Classic 330ml"');
});

test('B2: the category dropdown filters rows and shows a filter chip', async ({
  page,
  ai,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  // NOTE: native <select> options are OS-rendered; this is a known hard case
  // for vision-based agents — keep it, it is part of the experiment.
  await ai('set the category filter dropdown above the product table to "Snack"');
  await aiAssert('a filter chip indicating the category filter "Snack" is visible');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(3);
  await aiAssert('every visible row in the product table has the category "Snack"');
});

test('B3: the star widget filters by minimum rating', async ({
  page,
  aiTap,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiTap('the 4th star of the star-rating filter widget in the toolbar');
  await aiAssert('a filter chip reading "Rating: 4+" is visible');
  expect(await aiNumber('how many product rows does the table contain?')).toBe(7);
});

test('B4: a search with no matches shows the empty state, clearing restores all rows', async ({
  page,
  aiInput,
  aiAssert,
  aiNumber,
}) => {
  await gotoProducts(page);
  await aiInput('the search box above the product table', { value: 'zzz-nothing' });
  await aiAssert('the table shows a message that no products match the current filters');
  // mode 'clear' is required: an empty value alone does not clear the field.
  await aiInput('the search box above the product table', { value: '', mode: 'clear' });
  expect(await aiNumber('how many product rows does the table contain?')).toBe(12);
});
