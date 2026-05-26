# Road Companion Pilot

AI-assisted road trip dashboard (Next.js).

## Deploy on Railway

1. Connect this repo in [Railway](https://railway.com/dashboard).
2. Add a **Web Service** from the GitHub repo (root = this folder if monorepo, else repo root).
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm run start`
5. Add environment variables (optional but recommended):

| Variable | Purpose |
|----------|---------|
| `MAPBOX_ACCESS_TOKEN` | Live routing (server) |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Map tiles (client) |
| `OPENWEATHER_API_KEY` | Live weather |
| `ROUTE_FORCE_FALLBACK` | `false` in production |
| `WEATHER_FORCE_MOCK` | `false` in production |

6. Open the generated **HTTPS** public URL on your iPhone.
7. Plan trip → **Enable GPS** → allow location.

Use Apple/Google Maps for turn-by-turn navigation. This app is a co-pilot for fuel, stops, fatigue, and weather.

## Local development

```bash
npm install
npm run dev
```

See `.env.example` for local env vars.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run test:e2e` — Playwright tests
