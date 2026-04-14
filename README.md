# Eyelens — Admin

React + Vite admin panel. Requires the **Eyelens API** repository.

## Setup

1. `cp .env.example .env`
2. Set `VITE_API_URL` to your API base (e.g. `http://localhost:5000/api` in dev).
3. `npm install`
4. `npm run dev` — default `http://localhost:3001`

Ensure the API’s `CLIENT_URLS` includes this app’s origin (e.g. `http://localhost:3001`) so cookies and CORS work.

## Build

```bash
npm run build
```

Deploy `dist/` behind nginx or your static host, with `/api/` proxied to the same backend as the storefront (see API repo `deploy/nginx.example.conf`).
