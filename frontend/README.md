# Zenggrix frontend

This is the single React/Vite app containing the public website, license dashboard, and website CMS editor.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Configure `VITE_API_URL` with the backend origin. This is a public build-time value; do not put usernames, passwords, session secrets, or private signing keys in `VITE_*` variables.

Routes:

- `/` — home
- `/services`, `/about`, `/contact` — public website pages
- `/admin/content` — website content editor

The license admin portal remains directly available at `/licenses` but is intentionally omitted from the navigation.

The public website requests content from `/api/cms/content` at runtime. Bundled JSON in `src/data/` is the fallback during backend outages. The frontend can be deployed separately as a static app from this folder; set this directory as the hosting build root and use `npm run build`.
