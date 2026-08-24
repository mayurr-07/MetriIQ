# Deployment notes

## SPA fallback is required

The application uses client-side routing. Every route below is served by the
same `index.html`; there are no server-rendered pages.

```
/                       landing page (public)
/login                  development access
/officer/*              inspection officer workspace
/admin/*                department admin workspace
/senior/*               senior officer workspace
/report, /report/*      consumer reporting (public)
```

Without a fallback rule, a direct visit or browser refresh on any path other
than `/` returns 404. Configuration for the common static hosts is included:

| Host | File | Status |
|---|---|---|
| Netlify | `public/_redirects` | included |
| Vercel | `public/vercel.json` | included |
| GitHub Pages | not included | see note below |
| Nginx / Apache | not included | see snippets below |

### GitHub Pages
GitHub Pages has no rewrite engine. The usual workaround is to copy
`dist/index.html` to `dist/404.html` after the build.

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Build output

`npm run build` emits a **single** `dist/index.html` with all JavaScript and CSS
inlined. This is a deliberate constraint of the project's existing
`vite-plugin-singlefile` configuration.

Consequences worth knowing before deploying:

- Route-level `React.lazy` splitting is implemented in `src/App.tsx`, but the
  single-file plugin inlines every dynamic chunk, so it produces **no
  first-load size reduction today**. It becomes effective immediately if the
  plugin is removed for a conventional multi-file deployment.
- There is no long-term asset caching, because there are no separate hashed
  asset files to cache.

## Environment configuration

The frontend currently reads **no environment variables** and contains no API
base URL, keys or secrets. All persistence is browser-local.

When a backend is introduced, add a single `VITE_API_BASE_URL` and consume it
inside the service layer (`src/services/**`) only — never directly in a
component.

## Data storage

All records are written to `localStorage` under keys registered in
`src/services/storage.ts`. Nothing is transmitted to any government system.
Clearing browser data removes every inspection, complaint and session.
