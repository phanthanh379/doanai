// Controlled UI variants for the robustness experiment (RQ1/RQ2).
// Variants change ONLY presentation (theme, layout, icons, labels, ordering) — never logic.
export type VariantId = 'v0' | 'v1' | 'v2' | 'v3';

export type ColumnId =
  | 'name'
  | 'sku'
  | 'category'
  | 'price'
  | 'cost'
  | 'stock'
  | 'rating'
  | 'actions';

export type ToolbarItem = 'search' | 'category' | 'rating' | 'add';
export type ActionId = 'view' | 'edit' | 'delete';

export interface VariantConfig {
  id: VariantId;
  theme: 'light' | 'dark';
  layout: 'sidebar' | 'topbar';
  iconSet: 'a' | 'b';
  chartPosition: 'top' | 'bottom';
  labels: {
    appTitle: string;
    addProduct: string;
    searchPlaceholder: string;
    saveButton: string;
  };
  productColumns: ColumnId[];
  toolbarOrder: ToolbarItem[];
  actionOrder: ActionId[];
}

const BASE_LABELS = {
  appTitle: 'Mini Shop Manager',
  addProduct: 'Add product',
  searchPlaceholder: 'Search products...',
  saveButton: 'Save',
};

const BASE_COLUMNS: ColumnId[] = [
  'name',
  'sku',
  'category',
  'price',
  'cost',
  'stock',
  'rating',
  'actions',
];

export const VARIANTS: Record<VariantId, VariantConfig> = {
  // V0 — original interface
  v0: {
    id: 'v0',
    theme: 'light',
    layout: 'sidebar',
    iconSet: 'a',
    chartPosition: 'top',
    labels: BASE_LABELS,
    productColumns: BASE_COLUMNS,
    toolbarOrder: ['search', 'category', 'rating', 'add'],
    actionOrder: ['view', 'edit', 'delete'],
  },
  // V1 — theme change: dark mode + different accent color
  v1: {
    id: 'v1',
    theme: 'dark',
    layout: 'sidebar',
    iconSet: 'a',
    chartPosition: 'top',
    labels: BASE_LABELS,
    productColumns: BASE_COLUMNS,
    toolbarOrder: ['search', 'category', 'rating', 'add'],
    actionOrder: ['view', 'edit', 'delete'],
  },
  // V2 — layout change: topbar navigation, reordered columns/toolbar/actions, chart moved
  v2: {
    id: 'v2',
    theme: 'light',
    layout: 'topbar',
    iconSet: 'a',
    chartPosition: 'bottom',
    labels: BASE_LABELS,
    productColumns: ['actions', 'name', 'category', 'sku', 'stock', 'price', 'cost', 'rating'],
    toolbarOrder: ['add', 'rating', 'category', 'search'],
    actionOrder: ['edit', 'view', 'delete'],
  },
  // V3 — icon & label change: different icon glyphs, renamed buttons/placeholders
  v3: {
    id: 'v3',
    theme: 'light',
    layout: 'sidebar',
    iconSet: 'b',
    chartPosition: 'top',
    labels: {
      appTitle: 'MiniStore Console',
      addProduct: 'Create item',
      searchPlaceholder: 'Type to find an item...',
      saveButton: 'Confirm',
    },
    productColumns: BASE_COLUMNS,
    toolbarOrder: ['search', 'category', 'rating', 'add'],
    actionOrder: ['view', 'edit', 'delete'],
  },
};

export function resolveVariant(): VariantConfig {
  const raw = new URLSearchParams(window.location.search).get('variant');
  if (raw && raw in VARIANTS) return VARIANTS[raw as VariantId];
  return VARIANTS.v0;
}
