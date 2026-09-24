import { useState } from 'react';
import { CATEGORIES, type Category, type Product } from '../data';
import { StarRating } from './StarRating';

// --- Add / Edit product form (modal) -------------------------------------

export interface ProductDraft {
  name: string;
  sku: string;
  category: Category;
  price: string;
  costPrice: string;
  stock: string;
  rating: number;
}

function toDraft(p?: Product): ProductDraft {
  return p
    ? {
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: String(p.price),
        costPrice: String(p.costPrice),
        stock: String(p.stock),
        rating: p.rating,
      }
    : { name: '', sku: '', category: 'Beverage', price: '', costPrice: '', stock: '', rating: 3 };
}

type Errors = Partial<Record<'name' | 'sku' | 'price' | 'stock', string>>;

function validate(d: ProductDraft): Errors {
  const errors: Errors = {};
  if (!d.name.trim()) errors.name = 'Name is required';
  if (!d.sku.trim()) errors.sku = 'SKU is required';
  const price = Number(d.price);
  if (d.price.trim() === '' || Number.isNaN(price) || price <= 0)
    errors.price = 'Price must be greater than 0';
  const stock = Number(d.stock);
  if (d.stock.trim() === '' || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))
    errors.stock = 'Stock must be a non-negative integer';
  return errors;
}

export function ProductFormModal({
  title,
  initial,
  saveLabel,
  isAdmin,
  onSave,
  onCancel,
}: {
  title: string;
  initial?: Product;
  saveLabel: string;
  isAdmin: boolean;
  onSave: (d: ProductDraft) => void;
  onCancel: () => void;
}) {
  void isAdmin; // role check intentionally unused on this build (seeded bug #5)
  const [draft, setDraft] = useState<ProductDraft>(() => toDraft(initial));
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = () => {
    const errs = validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(draft);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal product-form">
        <h3>{title}</h3>
        <label>
          Name
          <input value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        {errors.name && <div className="field-error">{errors.name}</div>}
        <label>
          SKU
          <input value={draft.sku} onChange={(e) => set('sku', e.target.value)} />
        </label>
        {errors.sku && <div className="field-error">{errors.sku}</div>}
        <label>
          Category
          <select
            value={draft.category}
            onChange={(e) => set('category', e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price ($)
          <input value={draft.price} onChange={(e) => set('price', e.target.value)} />
        </label>
        {errors.price && <div className="field-error">{errors.price}</div>}
        {/* SEEDED BUG #5 (RQ3): isAdmin check dropped — staff sees the Cost field */}
        <label>
          Cost ($)
          <input value={draft.costPrice} onChange={(e) => set('costPrice', e.target.value)} />
        </label>
        <label>
          Stock
          <input value={draft.stock} onChange={(e) => set('stock', e.target.value)} />
        </label>
        {errors.stock && <div className="field-error">{errors.stock}</div>}
        <div className="form-rating">
          Rating
          <StarRating value={draft.rating} onSelect={(n) => set('rating', n)} className="rating-input" />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Read-only product detail (modal) -------------------------------------

export function ProductViewModal({
  product,
  isAdmin,
  onClose,
}: {
  product: Product;
  isAdmin: boolean;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal product-view">
        <h3>Product details</h3>
        <dl>
          <dt>Name</dt>
          <dd>{product.name}</dd>
          <dt>SKU</dt>
          <dd>{product.sku}</dd>
          <dt>Category</dt>
          <dd>{product.category}</dd>
          <dt>Price</dt>
          <dd>${product.price.toFixed(2)}</dd>
          {isAdmin && (
            <>
              <dt>Cost</dt>
              <dd>${product.costPrice.toFixed(2)}</dd>
            </>
          )}
          <dt>Stock</dt>
          <dd>{product.stock}</dd>
          <dt>Rating</dt>
          <dd>
            <StarRating value={product.rating} />
          </dd>
        </dl>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Delete confirmation (modal) ------------------------------------------

export function ConfirmDeleteModal({
  productName,
  onConfirm,
  onCancel,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal confirm">
        <h3>Delete product</h3>
        <p>
          Delete "{productName}"? This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
