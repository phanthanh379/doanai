// RQ4 benchmark definition.
// Each screen lists:
//  - `pii`: regions to mask (selector-resolved at capture time → exact coordinates)
//  - `items`: element descriptions for the grounding benchmark. Selectors are used
//    ONLY to auto-extract ground-truth boxes; the VLM receives the description text.
// Total items: 40 (30–50 required by the plan).

// 1280x1100 = same viewport as tests-locator/tests-vlm configs (symmetric
// experiment conditions; the full product table fits in one screenshot —
// with 800px, 3 benchmark items sat below the fold and were unlocatable).
export const VIEWPORT = { width: 1280, height: 1100 };

export const SCREENS = [
  {
    id: 'products-admin',
    url: '/products',
    role: 'admin',
    waitFor: '.product-table tbody tr',
    pii: [], // no PII on this screen — serves as the unmasked grounding baseline
    items: [
      { id: 'search-box', desc: 'the search input above the product table', selector: '.toolbar > input.search-input' },
      { id: 'category-dropdown', desc: 'the category filter dropdown in the toolbar', selector: '.toolbar > select.category-filter' },
      { id: 'add-button', desc: 'the blue button that adds a new product', selector: '.toolbar > button.btn-primary' },
      { id: 'rating-filter-star4', desc: 'the 4th star of the star-rating filter in the toolbar', selector: '.toolbar > span.stars > span:nth-child(4)' },
      { id: 'chart-snack-bar', desc: 'the orange "Snack" bar inside the "Products by category" chart', selector: '.chart-card canvas', region: { x: 92, y: 43, w: 210, h: 22 } },
      { id: 'nav-products', desc: 'the "Products" entry in the navigation menu', selector: "xpath=//a[contains(@class,'nav-link')][.//span[text()='Products']]" },
      { id: 'nav-customers', desc: 'the "Customers" entry in the navigation menu', selector: "xpath=//a[contains(@class,'nav-link')][.//span[text()='Customers']]" },
      { id: 'nav-settings', desc: 'the "Settings" entry in the navigation menu', selector: "xpath=//a[contains(@class,'nav-link')][.//span[text()='Settings']]" },
      { id: 'logout-button', desc: 'the logout button at the bottom of the sidebar', selector: '.logout-btn' },
      { id: 'row1-name', desc: 'the product name "Cola Classic 330ml" in the table', selector: '.product-table tbody tr:nth-child(1) td:nth-child(1)' },
      { id: 'row1-view-icon', desc: 'the eye/view icon in the row of "Cola Classic 330ml"', selector: '.product-table tbody tr:nth-child(1) td:nth-child(8) .icon-btn:nth-child(1)' },
      { id: 'row1-edit-icon', desc: 'the pencil/edit icon in the row of "Cola Classic 330ml"', selector: '.product-table tbody tr:nth-child(1) td:nth-child(8) .icon-btn:nth-child(2)' },
      { id: 'row1-delete-icon', desc: 'the trash/delete icon in the row of "Cola Classic 330ml"', selector: '.product-table tbody tr:nth-child(1) td:nth-child(8) .icon-btn:nth-child(3)' },
      { id: 'row5-price', desc: 'the price cell of "Dark Chocolate Bar 70%"', selector: '.product-table tbody tr:nth-child(5) td:nth-child(4)' },
      { id: 'row9-stock', desc: 'the stock value of "Laundry Detergent 2kg"', selector: '.product-table tbody tr:nth-child(9) td:nth-child(6)' },
      { id: 'row12-rating', desc: 'the star rating of "Sticky Notes 3x3" (last row)', selector: '.product-table tbody tr:nth-child(12) td:nth-child(7)' },
      { id: 'header-cost', desc: 'the "Cost" column header of the product table', selector: "xpath=//table//th[text()='Cost']" },
      { id: 'table-footer', desc: 'the footer text showing how many products are listed', selector: '.table-footer' },
    ],
  },
  {
    id: 'customer-c01',
    url: '/customers/c01',
    role: 'admin',
    waitFor: '.pii-card',
    pii: [
      { id: 'pii-phone', selector: '.pii-card .pii-phone' },
      { id: 'pii-email', selector: '.pii-card .pii-email' },
      { id: 'pii-address', selector: '.pii-card .pii-address' },
      { id: 'pii-card-number', selector: '.pii-card .pii-card-number' },
    ],
    items: [
      { id: 'c01-back', desc: 'the "Back" button above the profile heading', selector: '.back-btn' },
      { id: 'c01-heading', desc: 'the "Customer profile" heading', selector: '.customer-detail h2' },
      { id: 'c01-name-value', desc: 'the customer\'s full name value in the profile card', selector: '.pii-card .pii-name' },
      { id: 'c01-phone-label', desc: 'the "Phone" label in the profile card', selector: "xpath=//dl//dt[text()='Phone']" },
      { id: 'c01-phone-value', desc: 'the phone number value in the profile card', selector: '.pii-card .pii-phone' },
      { id: 'c01-email-value', desc: 'the email address value in the profile card', selector: '.pii-card .pii-email' },
      { id: 'c01-card-label', desc: 'the "Card number" label in the profile card', selector: "xpath=//dl//dt[text()='Card number']" },
      { id: 'c01-card-value', desc: 'the card number value in the profile card', selector: '.pii-card .pii-card-number' },
      { id: 'c01-points-value', desc: 'the loyalty points value in the profile card', selector: "xpath=//dl//dt[text()='Loyalty points']/following-sibling::dd[1]" },
      { id: 'c01-nav-customers', desc: 'the "Customers" entry in the navigation menu', selector: "xpath=//a[contains(@class,'nav-link')][.//span[text()='Customers']]" },
    ],
  },
  {
    id: 'customer-c03',
    url: '/customers/c03',
    role: 'admin',
    waitFor: '.pii-card',
    pii: [
      { id: 'pii-phone', selector: '.pii-card .pii-phone' },
      { id: 'pii-email', selector: '.pii-card .pii-email' },
      { id: 'pii-address', selector: '.pii-card .pii-address' },
      { id: 'pii-card-number', selector: '.pii-card .pii-card-number' },
    ],
    items: [
      { id: 'c03-back', desc: 'the "Back" button above the profile heading', selector: '.back-btn' },
      { id: 'c03-name-value', desc: 'the customer\'s full name value in the profile card', selector: '.pii-card .pii-name' },
      { id: 'c03-address-label', desc: 'the "Address" label in the profile card', selector: "xpath=//dl//dt[text()='Address']" },
      { id: 'c03-address-value', desc: 'the address value in the profile card', selector: '.pii-card .pii-address' },
      { id: 'c03-card-value', desc: 'the card number value in the profile card', selector: '.pii-card .pii-card-number' },
      { id: 'c03-email-label', desc: 'the "Email" label in the profile card', selector: "xpath=//dl//dt[text()='Email']" },
      { id: 'c03-logout', desc: 'the logout button at the bottom of the sidebar', selector: '.logout-btn' },
    ],
  },
  {
    id: 'login',
    url: '/login',
    role: null,
    waitFor: '.login-card',
    pii: [],
    items: [
      { id: 'login-username', desc: 'the username input field', selector: '#username' },
      { id: 'login-password', desc: 'the password input field', selector: '#password' },
      { id: 'login-submit', desc: 'the button that submits the sign-in form', selector: '.login-card button[type="submit"]' },
      { id: 'login-title', desc: 'the application title on the sign-in card', selector: '.login-card h1' },
      { id: 'login-hint', desc: 'the demo accounts hint text at the bottom of the card', selector: '.login-hint' },
    ],
  },
];
