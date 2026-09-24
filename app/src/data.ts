// Mock data + localStorage persistence. No real backend; all PII is fake.

export const CATEGORIES = ['Beverage', 'Snack', 'Household', 'Stationery'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  price: number;
  costPrice: number;
  stock: number;
  rating: number; // 1..5
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cardNumber: string; // fake PAN, masking target for RQ4
  loyaltyPoints: number;
}

const PRODUCTS_KEY = 'shopmini.products';
const SETTINGS_KEY = 'shopmini.settings';

export const SEED_PRODUCTS: Product[] = [
  { id: 'p01', name: 'Cola Classic 330ml', sku: 'BEV-001', category: 'Beverage', price: 0.9, costPrice: 0.55, stock: 120, rating: 5 },
  { id: 'p02', name: 'Green Tea Bottle 500ml', sku: 'BEV-002', category: 'Beverage', price: 1.2, costPrice: 0.7, stock: 80, rating: 3 },
  { id: 'p03', name: 'Orange Juice 1L', sku: 'BEV-003', category: 'Beverage', price: 2.5, costPrice: 1.6, stock: 45, rating: 4 },
  { id: 'p04', name: 'Potato Chips Sea Salt', sku: 'SNK-001', category: 'Snack', price: 1.8, costPrice: 1.0, stock: 60, rating: 4 },
  { id: 'p05', name: 'Dark Chocolate Bar 70%', sku: 'SNK-002', category: 'Snack', price: 2.2, costPrice: 1.3, stock: 35, rating: 5 },
  { id: 'p06', name: 'Salted Peanuts 200g', sku: 'SNK-003', category: 'Snack', price: 1.5, costPrice: 0.85, stock: 90, rating: 2 },
  { id: 'p07', name: 'Dish Soap Lemon 750ml', sku: 'HSH-001', category: 'Household', price: 3.1, costPrice: 1.9, stock: 40, rating: 3 },
  { id: 'p08', name: 'Paper Towels 2-pack', sku: 'HSH-002', category: 'Household', price: 4.0, costPrice: 2.4, stock: 25, rating: 4 },
  { id: 'p09', name: 'Laundry Detergent 2kg', sku: 'HSH-003', category: 'Household', price: 6.5, costPrice: 4.1, stock: 18, rating: 3 },
  { id: 'p10', name: 'Ballpoint Pen Blue', sku: 'STA-001', category: 'Stationery', price: 0.6, costPrice: 0.25, stock: 200, rating: 4 },
  { id: 'p11', name: 'Notebook A5 Dotted', sku: 'STA-002', category: 'Stationery', price: 2.8, costPrice: 1.5, stock: 55, rating: 5 },
  { id: 'p12', name: 'Sticky Notes 3x3', sku: 'STA-003', category: 'Stationery', price: 1.1, costPrice: 0.5, stock: 140, rating: 2 },
];

// All customer data below is fabricated (fake names, phones, Luhn-valid test PANs).
export const CUSTOMERS: Customer[] = [
  { id: 'c01', name: 'Nguyen Van An', phone: '0901 234 567', email: 'an.nguyen@example.com', address: '12 Ly Thuong Kiet, District 10, HCMC', cardNumber: '4539 1488 0343 6467', loyaltyPoints: 1250 },
  { id: 'c02', name: 'Tran Thi Bich', phone: '0912 345 678', email: 'bich.tran@example.com', address: '45 Nguyen Trai, District 5, HCMC', cardNumber: '5555 5555 5555 4444', loyaltyPoints: 830 },
  { id: 'c03', name: 'Le Minh Chau', phone: '0923 456 789', email: 'chau.le@example.com', address: '78 Vo Van Tan, District 3, HCMC', cardNumber: '4012 8888 8888 1881', loyaltyPoints: 2100 },
  { id: 'c04', name: 'Pham Quoc Dat', phone: '0934 567 890', email: 'dat.pham@example.com', address: '23 Tran Hung Dao, District 1, HCMC', cardNumber: '3782 822463 10005', loyaltyPoints: 460 },
  { id: 'c05', name: 'Hoang Thu Em', phone: '0945 678 901', email: 'em.hoang@example.com', address: '90 Cach Mang Thang 8, Tan Binh, HCMC', cardNumber: '6011 1111 1111 1117', loyaltyPoints: 1770 },
  { id: 'c06', name: 'Vu Gia Han', phone: '0956 789 012', email: 'han.vu@example.com', address: '156 Hai Ba Trung, District 1, HCMC', cardNumber: '4111 1111 1111 1111', loyaltyPoints: 95 },
];

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {
    /* fall through to seed */
  }
  return SEED_PRODUCTS.map((p) => ({ ...p }));
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export interface Settings {
  storeName: string;
  currency: 'USD' | 'VND' | 'EUR';
  lowStockThreshold: number;
}

export const DEFAULT_SETTINGS: Settings = {
  storeName: 'Mini Shop',
  currency: 'USD',
  lowStockThreshold: 20,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Settings) };
  } catch {
    /* fall through */
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function nextProductId(products: Product[]): string {
  const max = products.reduce((m, p) => Math.max(m, Number(p.id.replace(/\D/g, '')) || 0), 0);
  return 'p' + String(max + 1).padStart(2, '0');
}
