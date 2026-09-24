import { useState, type ReactElement } from 'react';
import { useAuth } from '../auth';
import { CATEGORIES, loadProducts, nextProductId, saveProducts, type Category, type Product } from '../data';
import { CategoryChart } from '../components/CategoryChart';
import { IconButton } from '../components/IconButton';
import { StarRating } from '../components/StarRating';
import { ConfirmDeleteModal, ProductFormModal, ProductViewModal, type ProductDraft } from '../components/modals';
import type { ColumnId, VariantConfig } from '../variants';

const COLUMN_HEADERS: Record<ColumnId, string> = {
  name: 'Name',
  sku: 'SKU',
  category: 'Category',
  price: 'Price',
  cost: 'Cost',
  stock: 'Stock',
  rating: 'Rating',
  actions: '',
};

type ModalState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'edit'; product: Product }
  | { kind: 'view'; product: Product }
  | { kind: 'delete'; product: Product };

export function ProductsPage({ cfg }: { cfg: VariantConfig }) {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';

  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [minRating, setMinRating] = useState(0);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  const update = (next: Product[]) => {
    setProducts(next);
    saveProducts(next);
  };

  const visible = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    if (category && p.category !== category) return false;
    if (minRating && p.rating < minRating) return false;
    return true;
  });

  // SEEDED BUG #2 (RQ3): role check dropped — staff also sees the Cost column
  const columns = cfg.productColumns;

  const draftToProduct = (d: ProductDraft, id: string): Product => ({
    id,
    name: d.name.trim(),
    sku: d.sku.trim(),
    category: d.category,
    price: Number(d.price),
    costPrice: Number(d.costPrice) || 0,
    stock: Number(d.stock),
    rating: d.rating,
  });

  const cell = (p: Product, col: ColumnId) => {
    switch (col) {
      case 'name':
        return <td key={col}>{p.name}</td>;
      case 'sku':
        return <td key={col}>{p.sku}</td>;
      case 'category':
        return <td key={col}>{p.category}</td>;
      case 'price':
        return <td key={col}>${p.price.toFixed(2)}</td>;
      case 'cost':
        return <td key={col}>${p.costPrice.toFixed(2)}</td>;
      case 'stock':
        return <td key={col}>{p.stock}</td>;
      case 'rating':
        return (
          <td key={col}>
            <StarRating value={p.rating} />
          </td>
        );
      case 'actions':
        return (
          <td key={col} className="actions-cell">
            {/* SEEDED BUG #1 (RQ3): role filter dropped — staff also sees delete */}
            {cfg.actionOrder
              .map((action) => (
                <IconButton
                  key={action}
                  icon={action}
                  set={cfg.iconSet}
                  onClick={() => {
                    if (action === 'view') setModal({ kind: 'view', product: p });
                    else if (action === 'edit') setModal({ kind: 'edit', product: p });
                    else setModal({ kind: 'delete', product: p });
                  }}
                />
              ))}
          </td>
        );
    }
  };

  const toolbarItems: Record<string, ReactElement> = {
    search: (
      <input
        key="search"
        className="search-input"
        placeholder={cfg.labels.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    ),
    category: (
      <select
        key="category"
        className="category-filter"
        value={category}
        onChange={(e) => setCategory(e.target.value as Category | '')}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    ),
    rating: (
      <StarRating
        key="rating"
        className="rating-filter"
        value={minRating}
        onSelect={(n) => setMinRating(n === minRating ? 0 : n)}
      />
    ),
    add: (
      <button key="add" className="btn btn-primary" onClick={() => setModal({ kind: 'add' })}>
        {cfg.labels.addProduct}
      </button>
    ),
  };

  const chart = (
    <CategoryChart products={products} selected={category} onSelect={setCategory} />
  );

  return (
    <div className="products-page">
      <h2>Products</h2>
      <div className="toolbar">{cfg.toolbarOrder.map((item) => toolbarItems[item])}</div>
      {(category || minRating > 0) && (
        <div className="filter-chips">
          {category && (
            <span className="filter-chip">
              Category: {category}
              <span className="chip-clear" onClick={() => setCategory('')}>
                ×
              </span>
            </span>
          )}
          {minRating > 0 && (
            <span className="filter-chip">
              Rating: {minRating}+
              <span className="chip-clear" onClick={() => setMinRating(0)}>
                ×
              </span>
            </span>
          )}
        </div>
      )}
      {cfg.chartPosition === 'top' && chart}
      <table className="product-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{COLUMN_HEADERS[c]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr key={p.id}>{columns.map((c) => cell(p, c))}</tr>
          ))}
          {visible.length === 0 && (
            <tr className="empty-row">
              <td colSpan={columns.length}>No products match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="table-footer">{visible.length} of {products.length} products</div>
      {cfg.chartPosition === 'bottom' && chart}

      {modal.kind === 'add' && (
        <ProductFormModal
          title="Add product"
          saveLabel={cfg.labels.saveButton}
          isAdmin={isAdmin}
          onCancel={() => setModal({ kind: 'none' })}
          onSave={(d) => {
            update([...products, draftToProduct(d, nextProductId(products))]);
            setModal({ kind: 'none' });
          }}
        />
      )}
      {modal.kind === 'edit' && (
        <ProductFormModal
          title="Edit product"
          initial={modal.product}
          saveLabel={cfg.labels.saveButton}
          isAdmin={isAdmin}
          onCancel={() => setModal({ kind: 'none' })}
          onSave={(d) => {
            update(products.map((p) => (p.id === modal.product.id ? draftToProduct(d, p.id) : p)));
            setModal({ kind: 'none' });
          }}
        />
      )}
      {modal.kind === 'view' && (
        <ProductViewModal
          product={modal.product}
          isAdmin={isAdmin}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
      {modal.kind === 'delete' && (
        <ConfirmDeleteModal
          productName={modal.product.name}
          onCancel={() => setModal({ kind: 'none' })}
          onConfirm={() => {
            update(products.filter((p) => p.id !== modal.product.id));
            setModal({ kind: 'none' });
          }}
        />
      )}
    </div>
  );
}
