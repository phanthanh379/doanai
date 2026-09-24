import { CUSTOMERS } from '../data';
import { useRouter } from '../router';

// Fake-PII profile card. All values are fabricated. This screen is the primary
// masking target for the RQ4 grounding benchmark (blur/pixelate known regions).
export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const { navigate } = useRouter();
  const customer = CUSTOMERS.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div className="customer-detail">
        <h2>Customer not found</h2>
        <button className="btn" onClick={() => navigate('/customers')}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="customer-detail">
      <button className="btn back-btn" onClick={() => navigate('/customers')}>
        Back
      </button>
      <h2>Customer profile</h2>
      <div className="pii-card">
        <dl>
          <dt>Full name</dt>
          <dd className="pii-name">{customer.name}</dd>
          <dt>Phone</dt>
          <dd className="pii-phone">{customer.phone}</dd>
          <dt>Email</dt>
          <dd className="pii-email">{customer.email}</dd>
          <dt>Address</dt>
          <dd className="pii-address">{customer.address}</dd>
          <dt>Card number</dt>
          <dd className="pii-card-number">{customer.cardNumber}</dd>
          <dt>Loyalty points</dt>
          <dd>{customer.loyaltyPoints}</dd>
        </dl>
      </div>
    </div>
  );
}
