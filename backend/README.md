# Zenggrix backend

The backend runs the website CMS and license server as separate modules in one Node.js service. Website files are in `../frontend`; the license API implementation is in `src/license-server`; the website-content API is in `src/xencrix-cms`.

## Local setup

Requirements: Node.js 20 or newer and a running MongoDB instance (local or hosted).

```sh
cd backend
npm install
npm run setup
```

The setup command creates or completes the gitignored `backend/.env`, generating a random admin password, session secret, and matching license signing-key pair without overwriting already configured values. Open that local `.env` to retrieve the generated admin password; keep it and the private signing key secret. Confirm `MONGODB_URI` points to a running local MongoDB or a reachable hosted MongoDB.

```sh
npm run dev
```

From another terminal:

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL=http://localhost:8787` in `frontend/.env.local` and set `FRONTEND_URL=http://localhost:5173` in `backend/.env`. Visit `/admin/content` to edit the website content or `/licenses` to manage client subscriptions.

## Website content administration

The CMS seeds the MongoDB `siteContent` collection with `src/xencrix-cms/default-content.json`. The public website fetches `/api/cms/content` at runtime and immediately renders API content when available; bundled JSON remains the fallback if the backend is offline. Changes saved in `/admin/content` therefore appear on the website without rebuilding or redeploying the frontend.

Sign in using the API's `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Content is organized into `company`, `hero`, `process`, `services`, `team`, and `pages` JSON sections. These cover the company name/contact/social details, homepage copy and calls to action, service cards, process steps, team member profiles, and page intro/SEO metadata. The section editor accepts JSON; it validates the whole site-content schema before saving. Keep each content save under 512 KB. The content API is public read-only; updates require the admin session cookie.

## License server

The licensing routes and policy details are documented in [`src/license-server/README.md`](src/license-server/README.md). API login credentials are the same backend `.env` values used by the CMS dashboard. License keys and signed offline entitlements are stored/issued by the license module, not by the website frontend.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend listen port; defaults to `8787` |
| `FRONTEND_URL` | Exact website origin allowed to modify CMS/admin data |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | CMS and licensing portal login |
| `ADMIN_SESSION_SECRET` | Signs the eight-hour HTTP-only admin cookie; at least 32 chars |
| `LICENSE_PRIVATE_KEY_B64` | Private RSA key; server-only, never expose to frontend |
| `LICENSE_PUBLIC_KEY_B64` | Public RSA key served to client apps |
| `OFFLINE_GRACE_DAYS` | Offline entitlement ceiling (default 30; allowed 1–90) |
| `MONGODB_URI` | MongoDB connection URI, such as a local URI or hosted Atlas URI |
| `MONGODB_DB_NAME` | MongoDB database name; defaults to `zenggrix` |
| `NODE_ENV` | Set to `production` to enable Secure admin cookies |

Use a persistent MongoDB deployment (for example MongoDB Atlas) for production. Use HTTPS for both the website and backend; configure the frontend API URL through its build-time environment setting. When using cookie-based admin login across separate deployments, host the API and frontend on the same HTTPS site-domain family (for example `www.example.com` and `api.example.com`); unrelated third-party domains can block browser cookies.

Run backend tests with `npm test`.
