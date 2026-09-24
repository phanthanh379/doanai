import { useState } from 'react';
import { useAuth } from '../auth';
import { useRouter } from '../router';
import type { VariantConfig } from '../variants';

export function LoginPage({ cfg }: { cfg: VariantConfig }) {
  const { login } = useAuth();
  const { navigate } = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/products');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>{cfg.labels.appTitle}</h1>
        <p className="login-sub">Sign in to continue</p>
        <label>
          Username
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn btn-primary login-submit">
          Sign in
        </button>
        <p className="login-hint">
          Demo accounts: admin / admin123 · staff / staff123
        </p>
      </form>
    </div>
  );
}
