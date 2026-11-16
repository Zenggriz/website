const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function isAllowedFrontendOrigin(origin, frontendUrl, allowLoopbackAliases = false) {
  if (!origin || origin === frontendUrl) return true;
  if (!allowLoopbackAliases) return false;

  try {
    const requestOrigin = new URL(origin);
    const configuredOrigin = new URL(frontendUrl);
    return requestOrigin.protocol === configuredOrigin.protocol
      && requestOrigin.port === configuredOrigin.port
      && LOOPBACK_HOSTS.has(requestOrigin.hostname)
      && LOOPBACK_HOSTS.has(configuredOrigin.hostname);
  } catch {
    return false;
  }
}
