import type { ReactNode } from 'react';
import { useAuth } from '../auth';
import { Icon } from '../icons';
import { useRouter } from '../router';
import type { VariantConfig } from '../variants';

const NAV_ITEMS: Array<{ path: string; label: string; icon: 'products' | 'customers' | 'settings'; adminOnly?: boolean }> = [
  { path: '/products', label: 'Products', icon: 'products' },
  { path: '/customers', label: 'Customers', icon: 'customers' },
  { path: '/settings', label: 'Settings', icon: 'settings', adminOnly: true },
];

export function Layout({ cfg, children }: { cfg: VariantConfig; children: ReactNode }) {
  const { session, logout } = useAuth();
  const { path, navigate } = useRouter();

  return (
    <div className={`app layout-${cfg.layout}`}>
      <nav className="nav">
        <div className="brand">{cfg.labels.appTitle}</div>
        <div className="nav-links">
          {/* SEEDED BUG #3 (RQ3): adminOnly filter dropped — staff sees Settings */}
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={'nav-link' + (path.startsWith(item.path) ? ' active' : '')}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
            >
              <Icon name={item.icon} set={cfg.iconSet} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <div className="nav-spacer" />
        <div className="user-badge">
          {session?.displayName} <span className="role-tag">{session?.role}</span>
        </div>
        <button
          className="logout-btn"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <Icon name="logout" set={cfg.iconSet} />
          <span>Logout</span>
        </button>
      </nav>
      <main className="page">{children}</main>
    </div>
  );
}
