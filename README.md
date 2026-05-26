# Road Companion Pilot

AI-assisted road trip dashboard (Next.js).

## Git → Railway auto-deploy (use this every fix)

**One-time Railway setup**

1. [Railway dashboard](https://railway.com/dashboard) → your project → **roadZ** service.
2. **Settings** → **Source** (or **Connect Repo**):
   - Repo: **`eberjg/roadZ`**
   - Branch: **`main`**
   - Root directory: **`/`** (repo root)
   - **Enable automatic deploys** on push (on by default when connected).
3. **Settings** → **Networking** → generate/copy your **HTTPS** public URL.

After that, **every `git push` to `main` triggers a new Railway deploy.**

**Every fix workflow (local)**

```bash
# 1) Make code changes in Cursor
# 2) Validate locally
npm run lint
npm run build

# 3) Commit and push (or use the helper script)
git add -A
git commit -m "Describe your fix"
git push origin main
```

Or one command (runs lint + build, then commit + push):

```bash
chmod +x scripts/ship.sh   # first time only
./scripts/ship.sh "Your fix message here"
```

**Check deploy**

1. Railway → **Deployments** → latest should show **Building** then **Success**.
2. Open your public **https://** URL on phone/desktop after deploy finishes.

**Do not commit secrets.** API keys live only in Railway **Variables**, not in git.

---

## Deploy on Railway (first-time env vars)

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
