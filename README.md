# Zenggrix website

React and Vite site for Zenggrix Digital Solutions.

## Pages

- `/` — Home
- `/services` — Services
- `/about` — About and team
- `/contact` — Contact details and office map

Page metadata is managed centrally in `src/App.jsx` and `src/hooks/usePageMetadata.js`. Public canonical URLs and crawler access are maintained in `public/sitemap.xml` and `public/robots.txt`.

## Google Analytics 4

The current GA4 measurement ID is configured in the root `.env` file. Set or override `VITE_GA_MEASUREMENT_ID` in `.env.local` for local development or in the production deployment environment when needed. Analytics is not loaded until a visitor opts in; visitors can change their choice from **Analytics preferences** in the footer. Advertising and personalization signals are disabled.

## Development

```sh
npm install
npm run dev
```

Build the production site with `npm run build`.
