const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function resolveApiUrl(value) {
  if (!value || typeof window === 'undefined') return value;
  try {
    const apiUrl = new URL(value);
    if (LOOPBACK_HOSTS.has(apiUrl.hostname) && LOOPBACK_HOSTS.has(window.location.hostname)) {
      apiUrl.hostname = window.location.hostname;
    }
    return apiUrl.toString().replace(/\/+$/, '');
  } catch {
    return value;
  }
}

export const API_URL = resolveApiUrl(configuredApiUrl);

export async function apiRequest(path, options = {}) {
  if (!API_URL) throw new Error('Set VITE_API_URL in the frontend environment.');
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Could not reach the backend at ${API_URL}. Check that it is running and that frontend VITE_API_URL points to the correct backend, then reload the page.`);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Request failed. Please try again.');
  return result;
}
