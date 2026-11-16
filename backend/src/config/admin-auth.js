import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'zenggrix_license_session';

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminAuth({ username, sessionSecret }) {
  return (request, response, next) => {
    const cookie = request.headers.cookie?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
    const token = cookie ? decodeURIComponent(cookie.slice(ADMIN_SESSION_COOKIE.length + 1)) : '';
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) {
      return response.status(401).json({ error: 'Please sign in to continue.' });
    }

    const expected = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
    if (!safeEqual(signature, expected)) {
      return response.status(401).json({ error: 'Please sign in to continue.' });
    }

    try {
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (claims.sub !== username || !Number.isInteger(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)) {
        return response.status(401).json({ error: 'Please sign in to continue.' });
      }
    } catch {
      return response.status(401).json({ error: 'Please sign in to continue.' });
    }

    return next();
  };
}
