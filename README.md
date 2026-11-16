# Zenggrix website and licensing platform

The repository is split into independently deployable frontend and backend projects for the MERN stack (MongoDB, Express, React, Node.js). The website and its license-management UI remain one React app; backend website-content and licensing APIs are separate modules in the backend service.

```text
.
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared website UI
│   │   ├── pages/               # Home, services, about, contact
│   │   ├── license-frontend/    # License admin dashboard and API hook
│   │   └── xencrix-cms/         # Website content admin UI
│   ├── .env.example
│   └── package.json
└── backend/
    ├── src/
    │   ├── config/              # Shared admin session authentication
    │   ├── xencrix-cms/         # Live website content API and defaults
    │   └── license-server/      # Subscription/license API
    ├── .env.example
    └── package.json
```

## Local development

Set up the backend and its signing keys using [`backend/README.md`](backend/README.md), then start it:

```sh
cd backend
npm install
cp .env.example .env
npm run keys
# Put the generated key values and strong admin credentials in .env
npm run dev
```

In another terminal, set up the frontend:

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL=http://localhost:8787` in `frontend/.env.local` and `FRONTEND_URL=http://localhost:5173` in `backend/.env`. Open the site at `http://localhost:5173`, the CMS at `/admin/content`, and license management at `/licenses`.

The CMS reads public site content from the backend at runtime. Admin edits are stored in the backend's MongoDB database and appear on the website without rebuilding it; the frontend's bundled JSON is used if the API is temporarily unavailable.

## Deployment

Deploy `frontend/` as a static Vite site and `backend/` as a Node.js service. In the frontend deployment, set `VITE_API_URL` to the backend's HTTPS origin. In the backend deployment, set `FRONTEND_URL` to the frontend origin, configure admin/signing secrets, and provide `MONGODB_URI` and `MONGODB_DB_NAME`. Use the same HTTPS site-domain family for the admin portal and API so the HTTP-only session cookie works in browsers.

See [`frontend/README.md`](frontend/README.md) for website hosting, and [`backend/README.md`](backend/README.md) for API, CMS fields, license API, and environment configuration.
