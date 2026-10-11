# Inkclusive web client

The client is a SvelteKit and TypeScript application. It provides the ProseMirror writing editor, grammar and gender-fair suggestions, document scanning, export, browser history, and the term-library admin interface.

## Main areas

- `/dashboard/editor` - write and revise text, review suggestions, and apply or ignore them.
- `/dashboard/scan` - upload PDF, DOCX, JPEG, or PNG documents for text extraction.
- `/dashboard/history` - view and clear writing sessions saved in browser IndexedDB.
- `/admin` - search and manage the gender-fair term library.
- `/api/extract/*` and `/api/docx` - SvelteKit server endpoints used for document import/export.
- `/api/verify` - checks the admin password configured on the SvelteKit server.

The editor calls the separate FastAPI service for grammar and gender-fair suggestions. The admin term actions call the backend's `/terms` endpoints. **The admin password prompt only protects the UI. The backend term endpoints are currently unauthenticated, so add backend authorization before exposing term editing publicly.**

## Setup

Use Node.js 20 or newer. Copy `.env.example` to `.env`, then set `PUBLIC_BACKEND_URL` to the backend base URL, including its trailing slash. Choose a private `ADMIN_PASSWORD` for the client-side admin prompt.

```sh
npm ci
npm run dev
```

The dev server normally runs at `http://localhost:5173`. For local backend setup, see the [backend README](../inkclusive-backend/README.md).

## Commands

```sh
npm run check       # Svelte and TypeScript diagnostics
npm run build       # production build
npm run preview     # serve the production build locally
npm test            # Vitest unit tests
npm run lint        # ESLint and Prettier checks
```

The app uses Tailwind CSS 4 through its Vite plugin, SvelteKit's Netlify adapter, ProseMirror, TanStack Table, Zod, PDF.js, Tesseract.js, Mammoth, and jsPDF. Tailwind's project setup is in `vite.config.ts`, `src/app.css`, and `tailwind.config.ts`, following the [Tailwind SvelteKit guide](https://tailwindcss.com/docs/installation/framework-guides/sveltekit).

## Configuration

| Variable | Purpose |
| --- | --- |
| `PUBLIC_BACKEND_URL` | Base URL of the FastAPI server; keep the trailing slash. This is public because the browser calls the API directly. |
| `ADMIN_PASSWORD` | Password compared by the SvelteKit `/api/verify` route. It does not authenticate requests to the backend's `/terms` endpoints. |

The Netlify build uses `npm run build` and publishes the adapter output as configured in `netlify.toml`.
