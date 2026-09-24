import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Minimal client-side router. Keeps the `variant` query param across navigation
// so an experiment run stays on the same UI variant.

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({ path: '/', navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    const variant = new URLSearchParams(window.location.search).get('variant');
    const url = variant ? `${to}?variant=${variant}` : to;
    window.history.pushState({}, '', url);
    setPath(to);
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}
