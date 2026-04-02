# Entrupy Frontend

Web client for Entrupy, built with **Next.js** (App Router), **React**, **Tailwind CSS**, and **Axios** for HTTP. It provides user registration and login, product flows, and admin screens wired to the backend API.

## Requirements

- Node.js 18+ (or a compatible runtime such as Bun)
- Backend API reachable at the URL configured for the client (see below)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (default: http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Configuration

The Axios instance in `backend_link.js` sets `baseURL` to the public API URL (currently the Render deployment). Change that value for local development (for example `http://127.0.0.1:8000/`) or switch to `process.env.NEXT_PUBLIC_API_BASE_URL` if you prefer per-environment builds (e.g. on Vercel).

The frontend origin must be allowed by the API’s CORS settings (origins must match what the browser sends, without a trailing slash).

## App structure (routes)

| Path | Role |
|------|------|
| `/` | Landing / welcome; entry to the app. |
| `/home` | Main user area after onboarding. |
| `/login`, `/register` | Authentication forms; API calls to `/login` and `/register`. |
| `/product/[pID]` | Product detail (dynamic segment). |
| `/admin_login`, `/admin` | Admin sign-in and admin UI. |

Shared layout and global styles live under `app/layout.js` and `app/globals.css`.

## Design choices

- **Next.js App Router** with client components (`"use client"`) where interactivity is required (forms, navigation).
- **Tailwind CSS** for layout and a consistent dark theme with a light accent (`#f5e6d3` on dark backgrounds).
- **Axios** centralizes API configuration (base URL, JSON headers) in one module so pages import a single `api` client.
- **Authentication UX**: login can store a token in a browser cookie for follow-up requests; align cookie usage with backend expectations (JWT in body vs. header) as you extend the app.
- **Separation of concerns**: UI routes live under `app/`; API details are not duplicated across pages beyond importing the shared client.

## Relation to the backend

The frontend expects the REST API described in the backend README: JSON request/response bodies, JWT `token` fields where the API requires authentication, and product endpoints under `/product_list` and `/product/{pID}`.

Deploying **frontend** (e.g. Vercel) and **backend** (e.g. Render) on different hosts requires correct CORS settings on the API and a correct public API URL in the frontend client configuration.
