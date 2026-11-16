# Zenggrix licensing server

The licensing API is a dedicated backend module in the shared Node.js service. The Zenggrix website at `/licenses` is its frontend dashboard, hosted with the public website app. Client applications use a per-license key for online checks and a server-signed entitlement for offline checks.

## Setup

Install and run the complete backend from the `backend/` folder. Configure its `.env` and generate signing keys using [`../../README.md`](../../README.md). The frontend reads the backend origin from `frontend/.env.local` as `VITE_API_URL`; the license dashboard is at `/licenses`.

## Production deployment

1. Deploy `backend/` as a Node 20+ service with `npm start`. Configure `backend/.env.example` values in the hosting provider's secret/environment settings. Set `NODE_ENV=production`, `FRONTEND_URL` to the website origin, a unique administrator username/password, and a randomly generated session secret.
2. Set `MONGODB_URI` and `MONGODB_DB_NAME` to your persistent MongoDB deployment (MongoDB Atlas is suitable for managed hosting). Keep its database credentials in backend environment secrets.
3. Generate an RSA key pair once with `npm run keys` from the backend folder, store the private and public base64 values as server secrets, and back up the private key securely. Keep the same signing key across restarts and deployments; rotating it invalidates cached offline entitlements signed by the old key.
4. Set `VITE_API_URL` in the frontend host's build environment to the API's HTTPS URL, then rebuild and deploy the static website. Set `FRONTEND_URL` on the API to the exact production website origin. A custom API subdomain under the same site domain is recommended so the secure admin session cookie works consistently.
5. Use HTTPS for both deployments. The website build only receives the API URL; admin credentials, database, API keys, and the signing private key stay on the API.

The Vercel rewrites for `/licenses` and `/admin/content` serve the frontend app routes. Admin screens require the backend administrator login; route URLs are not secrets.

## Subscription modes and dashboard values

Sign in at `/licenses`, add a client, and choose a subscription policy. The **Policy** action can change the policy later.

| Value | What to enter | Validation / behavior |
|---|---|---|
| Client / business name | Customer or organization name | Required, up to 120 characters |
| Email | Contact email | Optional, valid email address |
| Software type | POS, ERP, Web app, Desktop app, Other | Required |
| Software name | Product or application name | Optional, up to 120 characters |
| Monthly rent | Agreed monthly price | Required, zero or more |
| Currency | PKR, USD, EUR, GBP, AED, SAR | Required |
| Paid through | Last date the client has paid for, inclusive | Required date |
| Subscription mode | Online-only or online + offline access | Select per client |
| Automatic check interval | 20, 21, 22, 23, 24, or 25 days | Offline mode only; default is 22 days |

**Online-only** means the client app must contact the API to verify access whenever it needs to use the licensed software. If it cannot connect, the app must not grant access using a saved token.

**Online + offline access** means the app can use its last valid signed entitlement while disconnected. The API recommends a refresh at the selected 20–25 day interval. The app should attempt that refresh automatically when it is idle and internet is available, and offer a **Check subscription** action in its own settings. The signed entitlement has a separate maximum offline lifetime controlled by `OFFLINE_GRACE_DAYS` (default 30; allowed range 1–90), also capped at that many days after the paid-through date. This is a maximum outage grace period, not a requirement to wait 30 days before checking or renewing.

### Computer fingerprint lock

A license without a fingerprint lock works on any number of computers. To limit it to one POS installation, first activate/check the POS online on its intended computer and copy the app's 64-character hexadecimal SHA-256 computer fingerprint. In the dashboard choose **Edit**, paste that fingerprint under **Computer fingerprint lock**, and save. No new license key is needed. The next online check must send the same fingerprint; a missing or different fingerprint receives `403 device_mismatch`. Leave the field blank to remove the lock. Fingerprints are normalized to lowercase.

```json
{
  "licenseKey": "zgx_CLIENT_KEY",
  "computerFingerprint": "64-character-hexadecimal-fingerprint"
}
```

Changing the lock or paid-through date only affects the next online check. A previously issued offline entitlement remains valid until its signed expiration; its signed claims include the fingerprint so a client can also compare it with the local fingerprint before allowing offline use. The license API cannot revoke a cached entitlement while the computer is disconnected.

### Password reset recovery

Every new license starts with **Password recovery disabled**. The admin may use **Allow password reset** in `/licenses` when a client has forgotten its app password. This authorizes only the client's password-reset/recovery screen—not the normal application or protected data. The client must still check its license and, for a fingerprint-locked subscription, send the matching fingerprint. Recovery checks are rate-limited.

The admin dashboard uses the existing authenticated license update endpoint:

```http
PATCH /api/licenses/CLIENT_LICENSE_ID
Content-Type: application/json

{"passwordRecoveryEnabled":true}
```

Set it to `false` to disable recovery immediately and invalidate any outstanding recovery ticket. The license list includes `passwordRecoveryEnabled`; newly created and older licenses without this field are treated as `false`.

The client calls `POST /api/licenses/recovery/check` from its **Zenggrix Access Check** action. If recovery is enabled, the response contains an RS256-signed, ten-minute, one-time `recoveryToken`. The POS should open only its password-reset flow, let the user/admin set and persist a new password, and then call `POST /api/licenses/recovery/complete` with that token. Completion consumes the grant and automatically turns the dashboard setting off. A later check is denied until the admin enables it again. The admin can also turn it off at any time, which revokes outstanding tickets. A second check issues a new ticket and invalidates the previously issued ticket.

Do not use the recovery result to skip the normal login and enter the full application. The licensing server does not store or change the POS password; the POS itself must implement the restricted reset screen, safely save the new password, and call completion only after that succeeds. If the POS cannot complete the reset, the admin must turn recovery off and enable it again to issue another ticket.

Recovery check request:

```http
POST https://YOUR-LICENSE-API/api/licenses/recovery/check
Content-Type: application/json

{
  "licenseKey": "zgx_CLIENT_KEY",
  "computerFingerprint": "64-character-hexadecimal-fingerprint"
}
```

Enabled response:

```json
{
  "status": "recovery_allowed",
  "recoveryAllowed": true,
  "recoveryToken": "SIGNED_ONE_TIME_TOKEN",
  "expiresAt": "2026-11-10T12:00:00.000Z",
  "recoveryScope": "password-reset-only"
}
```

If disabled, the check returns HTTP `403` with `status: "recovery_disabled"`. A wrong/missing fingerprint for a locked license returns `403 device_mismatch`; invalid or expired license keys also fail. The client must never treat an API/network failure as permission to recover.

After the POS has saved the new password:

```http
POST https://YOUR-LICENSE-API/api/licenses/recovery/complete
Content-Type: application/json

{"recoveryToken":"SIGNED_ONE_TIME_TOKEN"}
```

Successful completion returns `{"status":"recovery_completed","passwordRecoveryEnabled":false}`. A replayed, superseded, or admin-revoked token returns HTTP `409`; an invalid or expired token returns HTTP `401`.

The API returns the selected mode and interval in both the online response and signed token. Client apps must enforce these fields; the licensing server cannot run a timer or check connectivity inside a separately deployed POS/ERP application.

## Admin workflow

Sign in at `/licenses`, enter the client and payment details, then select Online-only or Online + offline access and (for offline access) its refresh interval. The API returns a unique `zgx_...` license key once; copy it to that client's application configuration. The license key and client API key are the same credential. The server stores only its SHA-256 hash, so an issued key cannot be viewed again; choose **Refresh key** to invalidate it and issue a new one-time key. Update the client's configuration after refreshing. An offline app may continue using its last signed entitlement until it expires. **Do not commit a client's key to a public repository.** Use **Add months** after payment; additional months accrue after the existing paid-through date, or from today if it has expired. Use **Edit** to correct the inclusive paid-through date or set/remove a computer lock, and **Policy** to change online/offline mode or the refresh interval. Disabling a license blocks its next online check.

## Client integration

Online request:

```http
POST https://YOUR-LICENSE-API/api/licenses/check
Content-Type: application/json

{"licenseKey":"zgx_CLIENT_KEY","computerFingerprint":"64-character-hexadecimal-fingerprint"}
```

The `computerFingerprint` field is required only when the subscription has a lock. An unlocked license ignores this optional field and remains usable from any computer. An active license returns `status`, `paidThrough`, and a signed `token` plus `offlineUntil`. A fingerprint mismatch returns `403` with `status: "device_mismatch"`; deny access just as for other forbidden subscription statuses. On each launch, check online when possible. Cache the token only in the client application's protected local storage; when the API cannot be reached, verify its RS256 signature using `GET /api/public-key`'s public key and enforce the token's `exp` before allowing the app to run. For a locked license, also require the signed `computerFingerprint` claim to match the local computer. If verification fails or the token expires, disable licensed functionality and require an online check. A successful online check after payment returns a fresh entitlement. Never trust a client-side date or an unsigned cached `active` flag.

For an offline-enabled client, save the successful response and its `nextCheckAt` in protected storage. Trigger the same check function at startup, when connectivity returns, and from the app's idle callback/timer. If the check is due but the app is busy, defer it until idle. Retry if the OS reports internet but the API is still unreachable. A successful response replaces the cached token and schedules the next check; `403`/`404` means the license is expired, disabled, or invalid and access must stop. In the client app's settings, a **Check subscription** button calls this same function immediately instead of waiting for `nextCheckAt`.

Example scheduling pattern for a browser/Electron renderer (connect `isAppBusy()` to the ERP's own active-work state and call `checkSubscription(true)` from its settings button):

```js
let checking = false;

async function checkSubscription(manual = false) {
  if (checking || isAppBusy() || !navigator.onLine) return;
  const cached = await loadEntitlement();
  const due = !cached || Date.now() >= Date.parse(cached.nextCheckAt);
  if (!manual && !due) return;

  checking = true;
  try {
    const response = await fetch(`${LICENSE_API_URL}/api/licenses/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: LICENSE_KEY,
        ...(COMPUTER_FINGERPRINT ? { computerFingerprint: COMPUTER_FINGERPRINT } : {}),
      }),
    });
    if (response.status === 403 || response.status === 404) {
      await disableLicensedFeatures();
      return;
    }
    if (!response.ok) throw new Error(`License API returned ${response.status}`);
    const result = await response.json();
    if (result.status !== 'active') throw new Error('Subscription is not active');
    await saveEntitlement(result);
    await enableLicensedFeatures();
  } catch (error) {
    if (!cached || cached.offlineAllowed !== true
      || !isEntitlementValid(cached.token, PINNED_LICENSE_PUBLIC_KEY)) {
      await disableLicensedFeatures();
    }
    // Keep the license due; the online event / idle timer will retry.
    console.error('Subscription refresh failed', error);
  } finally {
    checking = false;
  }
}

window.addEventListener('online', () => checkSubscription());
window.addEventListener('app-idle', () => checkSubscription());
window.setInterval(() => checkSubscription(), 60_000);
checkSubscription(); // On app launch; the 20–25 day policy is checked before calling the API.
```

In an ERP with a different runtime, use its equivalent network-reconnected, idle, and scheduled-timer events. Make the scheduler single-flight so idle, online, and timer events cannot start duplicate checks. The dashboard's schedule setting is delivered by the API; this sample uses `nextCheckAt` from the saved entitlement to decide when the automatic network request is due.

The check and public-key endpoints allow credential-free cross-origin requests so a client's web app can call the API from its own domain. Admin endpoints remain restricted to `FRONTEND_URL` and use an HTTP-only session cookie.

### Key and token formats

The client credential is **not encrypted or Base64-encoded plaintext**. It is generated as `zgx_` plus 32 cryptographically random bytes encoded with Base64URL without padding. Its random portion uses `A–Z`, `a–z`, `0–9`, `-`, and `_` (43 characters); the full key is 47 characters including `zgx_`. The server stores only a SHA-256 hexadecimal hash of the complete key and a short prefix for dashboard identification. A key cannot be recovered; refreshing replaces the hash, immediately invalidating the previous key for online checks.

Offline entitlements are JWT-shaped values with Base64URL-encoded header and claims and an **RS256** signature (RSA PKCS#1 v1.5 with SHA-256). They are signed, not encrypted: their claims are readable, and the signature lets clients verify server origin and integrity. The private key signs on the server; clients may use the public key to verify. The PEM signing keys are Base64-encoded only for storage in environment variables; that storage encoding is not encryption.

For a Node-based desktop client, bundle the public key returned by `/api/public-key` with the app (it is safe to expose), then verify the cached entitlement before allowing offline use:

```js
import { createPublicKey, verify } from 'node:crypto';

export function isEntitlementValid(token, publicKeyPem, now = Date.now()) {
  const [headerPart, payloadPart, signaturePart, extra] = token.split('.');
  if (!headerPart || !payloadPart || !signaturePart || extra) return false;
  try {
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    const claims = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    if (header.alg !== 'RS256' || claims.iss !== 'zenggrix-license-server') return false;
    const verified = verify(
      'RSA-SHA256',
      Buffer.from(`${headerPart}.${payloadPart}`),
      createPublicKey(publicKeyPem),
      Buffer.from(signaturePart, 'base64url'),
    );
    return verified && Number.isFinite(claims.exp) && claims.exp * 1000 > now;
  } catch {
    return false;
  }
}
```

In a browser client, use the Web Crypto API to import the same pinned RSA public key and verify the `RSASSA-PKCS1-v1_5` signature. When an online check returns `403` or `404`, deny access; use the cached entitlement only when the server cannot be reached. Store that token with the platform's protected storage where possible.

The entitlement is valid offline for no more than `OFFLINE_GRACE_DAYS` after issue, and never later than that many days after the paid-through date. An offline app cannot receive a disable or renewal while disconnected; it may keep working until its cached signed entitlement expires. This is a practical offline license check, not tamper-proof DRM: a client who controls the application/device can modify its local code.

API admin credentials live only in `backend/.env` (or the API host's environment secrets):

| Environment variable | Purpose |
|---|---|
| `ADMIN_USERNAME` | Dashboard login username |
| `ADMIN_PASSWORD` | Dashboard login password |
| `ADMIN_SESSION_SECRET` | Signs the eight-hour admin session; minimum 32 characters |
| `FRONTEND_URL` | Exact website origin allowed to call admin APIs |
| `VITE_API_URL` | Frontend build-time API base URL; configure in the website host, not the API |
| `LICENSE_PRIVATE_KEY_B64` | Server-only private signing key |
| `LICENSE_PUBLIC_KEY_B64` | Public verification key returned to client apps |
| `OFFLINE_GRACE_DAYS` | Maximum offline token lifetime, default 30 and range 1–90 |
| `MONGODB_URI` / `MONGODB_DB_NAME` | MongoDB connection string and database name |
| `PORT` / `NODE_ENV` | API listening port / production cookie and security behavior |

Do not expose the admin username/password, session secret, or private signing key in `VITE_*` variables: Vite embeds those variables in the public website bundle.

Useful endpoints:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service health |
| `GET` | `/api/public-key` | Public key for offline signature verification |
| `POST` | `/api/auth/login` | Admin login; sets an HTTP-only session cookie |
| `GET` | `/api/auth/session` | Check admin session |
| `POST` | `/api/auth/logout` | Clear admin session |
| `GET` | `/api/licenses` | List licenses (admin only) |
| `POST` | `/api/licenses` | Create license and issue one-time client key (admin only) |
| `POST` | `/api/licenses/:id/extend` | Add 1–36 paid months (admin only) |
| `POST` | `/api/licenses/:id/rotate-key` | Invalidate the current client key and return a replacement once (admin only) |
| `PATCH` | `/api/licenses/:id` | Edit paid-through date, fingerprint lock, password recovery, policy, or enabled state (admin only) |
| `POST` | `/api/licenses/check` | Online client license check |
| `POST` | `/api/licenses/recovery/check` | Check admin recovery permission and issue a one-time reset ticket |
| `POST` | `/api/licenses/recovery/complete` | Consume a reset ticket and automatically disable recovery |

Run API tests with `npm test`.
