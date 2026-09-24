import { useEffect } from 'react';
import { AuthProvider, useAuth } from './auth';
import { Layout } from './components/Layout';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RouterProvider, useRouter } from './router';
import { resolveVariant } from './variants';

function AppRoutes() {
  const { path, navigate } = useRouter();
  const { session } = useAuth();
  const cfg = resolveVariant();

  useEffect(() => {
    document.documentElement.dataset.variant = cfg.id;
    document.documentElement.dataset.theme = cfg.theme;
    document.title = cfg.labels.appTitle;
  }, [cfg]);

  useEffect(() => {
    if (!session && path !== '/login') navigate('/login');
    else if (session && (path === '/' || path === '/login')) navigate('/products');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, path]);

  if (!session) return <LoginPage cfg={cfg} />;

  let page;
  if (path.startsWith('/customers/')) {
    page = <CustomerDetailPage customerId={path.split('/')[2]} />;
  } else if (path.startsWith('/customers')) {
    page = <CustomersPage />;
  } else if (path.startsWith('/settings')) {
    page = <SettingsPage />;
  } else {
    page = <ProductsPage cfg={cfg} />;
  }
  return <Layout cfg={cfg}>{page}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
