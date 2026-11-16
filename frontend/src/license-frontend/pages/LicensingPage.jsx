import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '../../lib/api';
import useLicenseApi from '../hooks/useLicenseApi';
import Login from '../components/Login';
import Modal from '../components/Modal';
const initialForm = {
  customerName: '',
  email: '',
  productType: 'POS',
  productName: '',
  monthlyPrice: '',
  currency: 'PKR',
  paidThrough: '',
  subscriptionMode: 'offline',
  refreshAfterDays: 22,
};

function formatPrice(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function dateLabel(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Icon({ children }) {
  return <span aria-hidden="true" className="text-brand-accent">{children}</span>;
}

export default function LicensingPage() {
  const request = useLicenseApi();
  const [session, setSession] = useState('checking');
  const [licenses, setLicenses] = useState([]);
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [newCredential, setNewCredential] = useState(null);
  const [extendTarget, setExtendTarget] = useState(null);
  const [months, setMonths] = useState('1');
  const [policyTarget, setPolicyTarget] = useState(null);
  const [policyMode, setPolicyMode] = useState('offline');
  const [policyDays, setPolicyDays] = useState(22);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ paidThrough: '', computerFingerprint: '' });
  const [copiedLabel, setCopiedLabel] = useState('');
  const copyTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const loadLicenses = useCallback(async () => {
    const result = await request('/api/licenses');
    setLicenses(result.licenses);
  }, []);

  useEffect(() => {
    if (!API_URL) {
      setError('Set VITE_API_URL in the frontend deployment environment.');
      setSession('unconfigured');
      return;
    }

    request('/api/auth/session')
      .then(async () => {
        await loadLicenses();
        setSession('authenticated');
      })
      .catch(() => setSession('signed-out'));
  }, [loadLicenses]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const monthlyByCurrency = licenses
      .filter((item) => item.active)
      .reduce((totals, item) => {
        totals[item.currency] = (totals[item.currency] || 0) + item.monthlyPrice;
        return totals;
      }, {});
    return {
      total: licenses.length,
      active: licenses.filter((item) => item.active && item.paidThrough >= today).length,
      due: licenses.filter((item) => item.active && item.paidThrough < today).length,
      monthly: Object.entries(monthlyByCurrency)
        .map(([currency, amount]) => formatPrice(amount, currency))
        .join(' · ') || formatPrice(0, 'PKR'),
    };
  }, [licenses]);

  async function login(username, password) {
    setLoginBusy(true);
    setError('');
    try {
      await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      await loadLicenses();
      setSession('authenticated');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoginBusy(false);
    }
  }

  async function logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLicenses([]);
      setSession('signed-out');
    }
  }

  async function createLicense(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await request('/api/licenses', {
        method: 'POST',
        body: JSON.stringify({ ...form, monthlyPrice: Number(form.monthlyPrice) }),
      });
      setLicenses((current) => [result.license, ...current]);
      setNewCredential(result);
      setShowCreate(false);
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function extendLicense(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await request(`/api/licenses/${extendTarget.id}/extend`, {
        method: 'POST',
        body: JSON.stringify({ months: Number(months) }),
      });
      setLicenses((current) => current.map((item) => item.id === result.license.id ? result.license : item));
      setNotice(`Subscription extended through ${dateLabel(result.license.paidThrough)}.`);
      setExtendTarget(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleLicense(license) {
    setError('');
    setNotice('');
    try {
      const result = await request(`/api/licenses/${license.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !license.active }),
      });
      setLicenses((current) => current.map((item) => item.id === result.license.id ? result.license : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function togglePasswordRecovery(license) {
    const enabled = !license.passwordRecoveryEnabled;
    if (enabled && !window.confirm(
      'Enable temporary password-reset recovery? The client must use the one-time grant only to show its password-reset flow, not to open the normal app. It expires in 10 minutes and turns off after reset completion.',
    )) return;
    setError('');
    setNotice('');
    try {
      const result = await request(`/api/licenses/${license.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ passwordRecoveryEnabled: enabled }),
      });
      setLicenses((current) => current.map((item) => item.id === result.license.id ? result.license : item));
      setNotice(enabled
        ? `Password reset recovery enabled for ${result.license.customerName}.`
        : `Password reset recovery disabled for ${result.license.customerName}.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function savePolicy(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await request(`/api/licenses/${policyTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          subscriptionMode: policyMode,
          refreshAfterDays: Number(policyDays),
        }),
      });
      setLicenses((current) => current.map((item) => item.id === result.license.id ? result.license : item));
      setNotice(`Subscription policy updated for ${result.license.customerName}.`);
      setPolicyTarget(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveLicenseDetails(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await request(`/api/licenses/${editTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          paidThrough: editForm.paidThrough,
          computerFingerprint: editForm.computerFingerprint.trim(),
        }),
      });
      setLicenses((current) => current.map((item) => item.id === result.license.id ? result.license : item));
      setNotice(`License details updated for ${result.license.customerName}.`);
      setEditTarget(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function rotateLicenseKey(license) {
    const confirmed = window.confirm(
      `Refresh the key for ${license.customerName}? The current key will stop working immediately. Any existing offline entitlement remains valid until it expires.`,
    );
    if (!confirmed) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await request(`/api/licenses/${license.id}/rotate-key`, { method: 'POST' });
      setLicenses((current) => current.map((item) => item.id === result.license.id ? result.license : item));
      setNewCredential({ ...result, operation: 'rotated' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function copy(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setError('');
      setCopiedLabel(label);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedLabel(''), 1000);
    } catch {
      setError('Clipboard access was blocked by the browser. Select and copy the value instead.');
    }
  }

  if (session === 'checking') {
    return <div className="grid min-h-[calc(100vh-72px)] place-items-center text-sm text-slate-400">Connecting to license server…</div>;
  }

  if (session === 'signed-out' || session === 'unconfigured') {
    return <Login busy={loginBusy} error={error} onLogin={login} />;
  }

  return (
    <section className="min-h-screen bg-brand-glow pt-28">
      <div className="container-x pb-20">
        <div className="flex flex-col justify-between gap-6 border-b border-brand-border pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow"><Icon>●</Icon> Zenggrix · License management</p>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">License console</h1>
            <p className="mt-2 text-sm text-slate-400">Manage clients, monthly subscriptions, and software access.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-outline" onClick={logout} type="button">Sign out</button>
            <button className="btn-primary" onClick={() => { setError(''); setShowCreate(true); }} type="button">
              <span aria-hidden="true">＋</span> Add client
            </button>
          </div>
        </div>

        {(error || notice) && (
          <div className={`mt-6 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${error ? 'border-rose-900 bg-rose-950/50 text-rose-200' : 'border-brand-accent/30 bg-brand-accent-soft text-brand-accent'}`}>
            <p role={error ? 'alert' : 'status'}>{error || notice}</p>
            <button aria-label="Dismiss message" className="text-lg" onClick={() => { setError(''); setNotice(''); }} type="button">×</button>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Clients', stats.total, 'All registered licenses'],
            ['Active', stats.active, 'Paid and enabled'],
            ['Payment due', stats.due, 'Past the paid-through date'],
            ['Monthly recurring', stats.monthly, 'Active plans · grouped by currency'],
          ].map(([label, value, caption]) => (
            <div className="rounded-2xl border border-brand-border bg-brand-card p-5" key={label}>
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-bold text-white">{value}</p>
              <p className="mt-2 text-xs text-slate-500">{caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
          <div className="flex flex-col gap-2 border-b border-brand-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Client subscriptions</h2>
              <p className="mt-1 text-sm text-slate-400">{licenses.length} license{licenses.length === 1 ? '' : 's'} in your account</p>
            </div>
            <span className="text-xs text-slate-500">Offline policy refresh: every 20–25 days</span>
          </div>
          {licenses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-accent-soft text-xl text-brand-accent">＋</div>
              <h3 className="mt-4 font-semibold text-white">No clients yet</h3>
              <p className="mt-2 text-sm text-slate-400">Create a license to issue a client-specific API key.</p>
              <button className="btn-primary mt-5" onClick={() => setShowCreate(true)} type="button">Add your first client</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-brand-dark/60 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Client / software</th>
                    <th className="px-6 py-4 font-medium">Monthly rent</th>
                    <th className="px-6 py-4 font-medium">Paid through</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {licenses.map((license) => {
                    const overdue = license.paidThrough < new Date().toISOString().slice(0, 10);
                    return (
                      <tr className="transition hover:bg-white/[0.02]" key={license.id}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{license.customerName}</p>
                          <p className="mt-1 text-xs text-slate-500">{license.productName || license.productType} · {license.email || 'No email'}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {license.subscriptionMode === 'online' ? 'Online only' : `Offline enabled · refresh every ${license.refreshAfterDays} days`}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{license.computerFingerprint ? 'Computer locked' : 'Any computer'}</p>
                          {license.passwordRecoveryEnabled && <p className="mt-1 text-xs font-medium text-amber-300">Password recovery enabled</p>}
                          <p className="mt-1 font-mono text-[11px] text-slate-600">{license.keyPrefix}…</p>
                        </td>
                        <td className="px-6 py-4 text-slate-200">{formatPrice(license.monthlyPrice, license.currency)}<span className="text-slate-500"> / mo</span></td>
                        <td className="px-6 py-4 text-slate-300">{dateLabel(license.paidThrough)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${!license.active ? 'bg-slate-700/60 text-slate-300' : overdue ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${!license.active ? 'bg-slate-400' : overdue ? 'bg-amber-300' : 'bg-emerald-300'}`} />
                            {!license.active ? 'Disabled' : overdue ? 'Payment due' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-brand-accent hover:text-brand-accent"
                              onClick={() => {
                                setError('');
                                setEditTarget(license);
                                setEditForm({
                                  paidThrough: license.paidThrough,
                                  computerFingerprint: license.computerFingerprint || '',
                                });
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${license.passwordRecoveryEnabled ? 'border-amber-400/40 text-amber-300 hover:border-rose-400 hover:text-rose-300' : 'border-brand-border text-slate-200 hover:border-brand-accent hover:text-brand-accent'}`}
                              onClick={() => togglePasswordRecovery(license)}
                              type="button"
                            >
                              {license.passwordRecoveryEnabled ? 'Disable recovery' : 'Allow password reset'}
                            </button>
                            <button
                              className="rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-brand-accent hover:text-brand-accent"
                              onClick={() => {
                                setError('');
                                setPolicyTarget(license);
                                setPolicyMode(license.subscriptionMode);
                                setPolicyDays(license.refreshAfterDays);
                              }}
                              type="button"
                            >
                              Policy
                            </button>
                            <button className="rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-brand-accent hover:text-brand-accent" onClick={() => { setError(''); setExtendTarget(license); setMonths('1'); }} type="button">Add months</button>
                            <button className="rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-brand-accent hover:text-brand-accent disabled:opacity-50" disabled={saving} onClick={() => rotateLicenseKey(license)} type="button">Refresh key</button>
                            <button className="rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-rose-400 hover:text-rose-300" onClick={() => toggleLicense(license)} type="button">{license.active ? 'Disable' : 'Enable'}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">
          Online-only licenses require a successful check whenever the client app is used. Offline-enabled licenses can use a signed cached entitlement for up to 30 days; client apps should refresh after the configured 20–25 day interval when they are idle and internet is available.
        </p>
      </div>

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Add a client">
          <form className="space-y-4" onSubmit={createLicense}>
            {error && <p role="alert" className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <label className="block text-sm font-medium text-slate-200">Client / business name
              <input autoFocus className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" maxLength="120" onChange={(event) => setForm({ ...form, customerName: event.target.value })} required value={form.customerName} />
            </label>
            <label className="block text-sm font-medium text-slate-200">Email <span className="text-slate-500">(optional)</span>
              <input className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" value={form.email} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-200">Software type
                <select className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" onChange={(event) => setForm({ ...form, productType: event.target.value })} value={form.productType}>
                  {['POS', 'ERP', 'Web app', 'Desktop app', 'Other'].map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-200">Software name <span className="text-slate-500">(optional)</span>
                <input className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" maxLength="120" onChange={(event) => setForm({ ...form, productName: event.target.value })} value={form.productName} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-200">Monthly rent
                <input className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" min="0" onChange={(event) => setForm({ ...form, monthlyPrice: event.target.value })} required step="0.01" type="number" value={form.monthlyPrice} />
              </label>
              <label className="block text-sm font-medium text-slate-200">Currency
                <select className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" onChange={(event) => setForm({ ...form, currency: event.target.value })} value={form.currency}>
                  {['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'].map((currency) => <option key={currency}>{currency}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-200">Paid through
              <input className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" min={new Date().toISOString().slice(0, 10)} onChange={(event) => setForm({ ...form, paidThrough: event.target.value })} required type="date" value={form.paidThrough} />
              <span className="mt-1 block text-xs text-slate-500">The client may use the software through this date.</span>
            </label>
            <label className="block text-sm font-medium text-slate-200">Subscription access mode
              <select className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" onChange={(event) => setForm({ ...form, subscriptionMode: event.target.value })} value={form.subscriptionMode}>
                <option value="offline">Online check + offline access</option>
                <option value="online">Online-only check (no offline access)</option>
              </select>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {form.subscriptionMode === 'offline'
                  ? 'App checks every 20–25 days when idle and connected; signed access can last up to 30 days offline.'
                  : 'App must verify the subscription online when it is used.'}
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-200">Automatic check interval (days)
              <select
                className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
                disabled={form.subscriptionMode === 'online'}
                onChange={(event) => setForm({ ...form, refreshAfterDays: Number(event.target.value) })}
                value={form.refreshAfterDays}
              >
                {[20, 21, 22, 23, 24, 25].map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
              <span className="mt-1 block text-xs text-slate-500">After this interval, client app checks automatically once idle and connected.</span>
            </label>
            <div className="flex justify-end gap-3 border-t border-brand-border pt-5">
              <button className="btn-outline" onClick={() => setShowCreate(false)} type="button">Cancel</button>
              <button className="btn-primary disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Creating…' : 'Create license'}</button>
            </div>
          </form>
        </Modal>
      )}

      {extendTarget && (
        <Modal onClose={() => setExtendTarget(null)} title="Extend subscription">
          <form className="space-y-5" onSubmit={extendLicense}>
            {error && <p role="alert" className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <p className="text-sm leading-6 text-slate-400">
              Add paid months for <strong className="text-white">{extendTarget.customerName}</strong>. The new period starts after the current paid-through date, or today if that date has passed.
            </p>
            <label className="block text-sm font-medium text-slate-200">Months to add
              <input autoFocus className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" max="36" min="1" onChange={(event) => setMonths(event.target.value)} required type="number" value={months} />
            </label>
            <div className="flex justify-end gap-3 border-t border-brand-border pt-5">
              <button className="btn-outline" onClick={() => setExtendTarget(null)} type="button">Cancel</button>
              <button className="btn-primary disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Saving…' : 'Confirm extension'}</button>
            </div>
          </form>
        </Modal>
      )}

      {policyTarget && (
        <Modal onClose={() => setPolicyTarget(null)} title="Subscription policy">
          <form className="space-y-5" onSubmit={savePolicy}>
            {error && <p role="alert" className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <p className="text-sm leading-6 text-slate-400">
              Update access rules for <strong className="text-white">{policyTarget.customerName}</strong>. The client app must read the returned policy and enforce it.
            </p>
            <label className="block text-sm font-medium text-slate-200">Subscription access mode
              <select className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent" onChange={(event) => setPolicyMode(event.target.value)} value={policyMode}>
                <option value="offline">Online check + offline access</option>
                <option value="online">Online-only check (no offline access)</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-200">Automatic check interval
              <select
                className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
                disabled={policyMode === 'online'}
                onChange={(event) => setPolicyDays(Number(event.target.value))}
                value={policyDays}
              >
                {[20, 21, 22, 23, 24, 25].map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-3 border-t border-brand-border pt-5">
              <button className="btn-outline" onClick={() => setPolicyTarget(null)} type="button">Cancel</button>
              <button className="btn-primary disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save policy'}</button>
            </div>
          </form>
        </Modal>
      )}

      {editTarget && (
        <Modal onClose={() => setEditTarget(null)} title="Edit license details">
          <form className="space-y-5" onSubmit={saveLicenseDetails}>
            {error && <p role="alert" className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <p className="text-sm leading-6 text-slate-400">
              Update the paid-through date or bind <strong className="text-white">{editTarget.customerName}</strong> to one POS computer. Changes take effect on the next online check; an already-issued offline entitlement remains valid until it expires.
            </p>
            <label className="block text-sm font-medium text-slate-200">Paid through
              <input
                autoFocus
                className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 outline-none focus:border-brand-accent"
                onChange={(event) => setEditForm({ ...editForm, paidThrough: event.target.value })}
                required
                type="date"
                value={editForm.paidThrough}
              />
              <span className="mt-1 block text-xs text-slate-500">This date is inclusive; past dates are allowed for corrections.</span>
            </label>
            <label className="block text-sm font-medium text-slate-200">Computer fingerprint lock <span className="text-slate-500">(optional)</span>
              <input
                className="mt-2 w-full rounded-xl border border-brand-border bg-brand-dark px-4 py-3 font-mono text-sm outline-none focus:border-brand-accent"
                maxLength="64"
                onChange={(event) => setEditForm({ ...editForm, computerFingerprint: event.target.value })}
                pattern="[A-Fa-f0-9]{64}"
                placeholder="Paste the 64-character fingerprint from the POS"
                spellCheck="false"
                value={editForm.computerFingerprint}
              />
              <span className="mt-1 block text-xs leading-5 text-slate-500">Leave blank to allow any computer. A lock blocks other fingerprints; existing offline access remains valid until its signed entitlement expires.</span>
            </label>
            <div className="flex justify-end gap-3 border-t border-brand-border pt-5">
              <button className="btn-outline" onClick={() => setEditTarget(null)} type="button">Cancel</button>
              <button className="btn-primary disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save details'}</button>
            </div>
          </form>
        </Modal>
      )}

      {newCredential && (
        <Modal onClose={() => setNewCredential(null)} title={newCredential.operation === 'rotated' ? 'License key refreshed' : 'License created'} wide>
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-400">
              {newCredential.operation === 'rotated'
                ? 'The previous key is invalid immediately. Copy this new key now and update the client application; it is shown only once and cannot be recovered later.'
                : 'Copy this client key now and store it securely in that client application. It is shown only once and cannot be recovered from the dashboard.'}
            </p>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Client license key</p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded-xl border border-brand-border bg-brand-dark p-3 font-mono text-xs leading-5 text-brand-accent">{newCredential.apiKey}</code>
                <button className="btn-outline shrink-0 px-3" onClick={() => copy(newCredential.apiKey, 'license')} type="button">{copiedLabel === 'license' ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Client API key <span className="normal-case tracking-normal">(same key used by the license API)</span></p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded-xl border border-brand-border bg-brand-dark p-3 font-mono text-xs leading-5 text-brand-accent">{newCredential.apiKey}</code>
                <button className="btn-outline shrink-0 px-3" onClick={() => copy(newCredential.apiKey, 'api')} type="button">{copiedLabel === 'api' ? 'Copied' : 'Copy API key'}</button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Check subscription API</p>
              <div className="flex flex-col gap-2">
                <pre className="overflow-x-auto rounded-xl border border-brand-border bg-brand-dark p-4 text-xs leading-6 text-slate-300"><code>{`POST ${API_URL}/api/licenses/check\nContent-Type: application/json\n\n${JSON.stringify({
                  licenseKey: newCredential.apiKey,
                  ...(newCredential.license.computerFingerprint
                    ? { computerFingerprint: newCredential.license.computerFingerprint }
                    : {}),
                }, null, 2)}`}</code></pre>
                <button className="btn-outline self-end px-3" onClick={() => copy(JSON.stringify({
                  licenseKey: newCredential.apiKey,
                  ...(newCredential.license.computerFingerprint
                    ? { computerFingerprint: newCredential.license.computerFingerprint }
                    : {}),
                }), 'request')} type="button">{copiedLabel === 'request' ? 'Copied' : 'Copy API request'}</button>
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100/80">
              {newCredential.license.subscriptionMode === 'offline'
                ? `Offline access is enabled. Schedule an automatic refresh every ${newCredential.license.refreshAfterDays} days while idle and online; validate the cached signed entitlement until its offlineUntil.`
                : 'Online-only mode is enabled. The client must require an online check and must not cache this as offline access.'}
              {newCredential.license.computerFingerprint
                ? ' This subscription is locked to the saved computer fingerprint.'
                : ' This subscription has no computer lock and can be used on multiple computers.'}
              {' '}Verify signed responses with <code>/api/public-key</code>. Never put the server's private signing key in a client app.
            </div>
            <div className="flex justify-end border-t border-brand-border pt-5">
              <button className="btn-primary" onClick={() => setNewCredential(null)} type="button">Done</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
