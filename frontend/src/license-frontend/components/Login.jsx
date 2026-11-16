import { useState } from 'react';

export default function Login({ onLogin, busy, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function submit(event) {
    event.preventDefault();
    onLogin(username.trim(), password);
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-card p-7 shadow-card sm:p-9">
        <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl border border-brand-accent/20 bg-brand-accent-soft text-xl font-bold text-brand-accent">
          Z
        </div>
        <p className="eyebrow">Admin portal</p>
        <h1 className="mt-4 text-3xl font-bold">License console</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in to manage client subscriptions, license keys, and payment dates.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-200">
            Username
            <input
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 text-white outline-none transition focus:border-brand-accent"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 text-white outline-none transition focus:border-brand-accent"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-xs leading-5 text-slate-500">
          Admin access is configured on the backend environment.
        </p>
      </div>
    </div>
  );
}
