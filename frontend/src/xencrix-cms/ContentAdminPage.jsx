import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import useSiteContent from '../site-content/SiteContentContext';

const SECTIONS = [
  { id: 'company', label: 'Company information', key: 'company' },
  { id: 'hero', label: 'Home page hero', key: 'hero' },
  { id: 'process', label: 'Process steps', key: 'process' },
  { id: 'services', label: 'Services', key: 'services' },
  { id: 'team', label: 'Team members', key: 'team' },
  { id: 'pages.home', label: 'Home page SEO', key: 'pages.home' },
  { id: 'pages.services', label: 'Services page', key: 'pages.services' },
  { id: 'pages.about', label: 'About page', key: 'pages.about' },
  { id: 'pages.contact', label: 'Contact page', key: 'pages.contact' },
];

function getSection(content, key) {
  return key.split('.').reduce((value, part) => value[part], content);
}

function replaceSection(content, key, value) {
  const result = structuredClone(content);
  const path = key.split('.');
  let target = result;
  for (const part of path.slice(0, -1)) target = target[part];
  target[path.at(-1)] = value;
  return result;
}

function AdminLogin({ onLogin, busy, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function submit(event) {
    event.preventDefault();
    onLogin(username.trim(), password);
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] place-items-center px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-card p-7 shadow-card sm:p-9">
        <p className="eyebrow">Website administration</p>
        <h1 className="mt-4 text-3xl font-bold">Content manager</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in with the backend <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code>.
          Saved changes appear on the live website without a rebuild.
        </p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-200">Username
            <input autoComplete="username" className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" onChange={(event) => setUsername(event.target.value)} required value={username} />
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="cms-admin-password">Password</label>
            <div className="mt-2 flex overflow-hidden rounded-xl border border-brand-border bg-brand-dark focus-within:border-brand-accent">
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                id="cms-admin-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="px-4 text-xs font-medium text-slate-400 hover:text-brand-accent"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button className="btn-primary w-full disabled:opacity-60" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}

export default function ContentAdminPage() {
  const { content, refresh } = useSiteContent();
  const [session, setSession] = useState('checking');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(SECTIONS[0].id);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const selectedSection = useMemo(() => SECTIONS.find((section) => section.id === selected), [selected]);

  useEffect(() => {
    apiRequest('/api/auth/session')
      .then(() => setSession('authenticated'))
      .catch(() => setSession('signed-out'));
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    setDraft(JSON.stringify(getSection(content, selectedSection.key), null, 2));
  }, [content, selectedSection]);

  async function login(loginUsername, loginPassword) {
    setBusy(true);
    setError('');
    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      setSession('authenticated');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
      setPassword('');
    }
  }

  async function saveSection(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const sectionData = JSON.parse(draft);
      const nextContent = replaceSection(content, selectedSection.key, sectionData);
      const result = await apiRequest('/api/cms/content', {
        method: 'PUT',
        body: JSON.stringify({ content: nextContent }),
      });
      await refresh();
      setUpdatedAt(result.updatedAt);
      setNotice(`${selectedSection.label} saved. Live website content is updated.`);
    } catch (saveError) {
      setError(saveError instanceof SyntaxError
        ? `Invalid JSON: ${saveError.message}`
        : saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      setSession('signed-out');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (session === 'checking') {
    return <div className="grid min-h-[calc(100vh-72px)] place-items-center text-sm text-slate-400">Connecting to content manager…</div>;
  }

  if (session === 'signed-out') {
    return <AdminLogin busy={busy} error={error} onLogin={login} />;
  }

  return (
    <section className="min-h-screen bg-brand-glow pt-28">
      <div className="container-x pb-20">
        <div className="flex flex-col justify-between gap-6 border-b border-brand-border pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Zenggrix · Website content</p>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Content manager</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Edit company details, home page, services, process, team, page descriptions and SEO.
              Saves are published through the CMS API without rebuilding the website.
            </p>
          </div>
          <div className="flex gap-3">
            <a className="btn-outline" href="/" target="_blank" rel="noreferrer">View website</a>
            <button className="btn-outline" disabled={busy} onClick={logout} type="button">Sign out</button>
          </div>
        </div>

        {(error || notice) && (
          <div className={`mt-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${error ? 'border-rose-900 bg-rose-950/50 text-rose-200' : 'border-brand-accent/30 bg-brand-accent-soft text-brand-accent'}`}>
            <p role={error ? 'alert' : 'status'}>{error || notice}</p>
            <button aria-label="Dismiss message" className="text-lg" onClick={() => { setError(''); setNotice(''); }} type="button">×</button>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <nav aria-label="Content sections" className="h-fit rounded-2xl border border-brand-border bg-brand-card p-3">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Editable sections</p>
            {SECTIONS.map((section) => (
              <button
                aria-current={selected === section.id ? 'page' : undefined}
                className={`mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${selected === section.id ? 'bg-brand-accent-soft font-semibold text-brand-accent' : 'text-slate-300 hover:bg-brand-dark hover:text-white'}`}
                key={section.id}
                onClick={() => { setSelected(section.id); setError(''); setNotice(''); }}
                type="button"
              >
                {section.label}
              </button>
            ))}
          </nav>

          <form className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-7" onSubmit={saveSection}>
            <div className="flex flex-col justify-between gap-3 border-b border-brand-border pb-5 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-semibold">{selectedSection.label}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Edit this section's JSON. Keep the existing field names and required values.</p>
              </div>
              {updatedAt && <p className="text-xs text-slate-500">Last saved {new Date(updatedAt).toLocaleString()}</p>}
            </div>
            <label className="sr-only" htmlFor="content-json">Section JSON</label>
            <textarea
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="mt-5 min-h-[440px] w-full resize-y rounded-xl border border-brand-border bg-brand-dark p-4 font-mono text-xs leading-6 text-slate-200 outline-none transition focus:border-brand-accent"
              id="content-json"
              onChange={(event) => setDraft(event.target.value)}
              spellCheck="false"
              value={draft}
            />
            <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-brand-border pt-5 sm:flex-row sm:items-center">
              <p className="text-xs leading-5 text-slate-500">The API validates every section and keeps the previous content if the edit is invalid.</p>
              <button className="btn-primary disabled:opacity-60" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save and publish'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
