import { useState } from 'react';
import { CUSTOMERS } from '../data';
import { useRouter } from '../router';

// Customer rows are plain <div>s (no links, no roles) — click navigates to the
// detail page that shows fake PII (masking target for RQ4).
export function CustomersPage() {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');

  const visible = CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="customers-page">
      <h2>Customers</h2>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search customers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="customer-list">
        {visible.map((c) => (
          <div key={c.id} className="customer-row" onClick={() => navigate(`/customers/${c.id}`)}>
            <span className="customer-name">{c.name}</span>
            <span className="customer-phone">{c.phone}</span>
            <span className="customer-points">{c.loyaltyPoints} pts</span>
          </div>
        ))}
        {visible.length === 0 && <div className="empty-note">No customers found.</div>}
      </div>
    </div>
  );
}
