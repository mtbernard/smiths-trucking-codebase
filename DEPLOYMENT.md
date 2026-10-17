# Smith's Trucking Company — Setup & Deployment Guide

## 1. Local environment setup

Requirements: **Node.js 20+** (or Bun 1.2+) and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
cp .env.example .env   # then fill in the values (see below)
npm run dev
```

The dev server runs at `http://localhost:8080`.

### Environment variables (.env)

| Variable | Used by | Where to get it |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser (public) | Your Lovable Cloud / Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser (public) | Publishable (anon) key — safe to expose |
| `SUPABASE_URL` | Server-side (SSR, server functions) | Same URL as above |
| `SUPABASE_PUBLISHABLE_KEY` | Server-side | Same publishable key as above |
| `LOVABLE_API_KEY` | AI features (chat + truck advisor) | Provided automatically on Lovable Cloud; self-hosted, use your own OpenAI-compatible key with the gateway base URL in `src/routes/api/chat.ts` / `src/lib/truck-advisor.functions.ts` |

Only the `VITE_*` values ever reach the browser. The publishable key is designed to be public; no service-role key or database password belongs in this repo.

## 2. What runs where

- **Frontend + SSR**: this codebase (TanStack Start / React 19 / Vite).
- **Database, auth, storage**: Lovable Cloud (hosted backend). It does not need to be deployed — you connect to it with the env vars above. Migrations live in `drizzle/`; apply any new migration to the cloud database before deploying code that depends on it. In particular, run `drizzle/migrations/0002_contact_settings.sql` in the Supabase SQL Editor to enable the admin contact editor.
- **AI (chatbot + truck advisor)**: called server-side from this codebase through the AI gateway configured in the env vars.

## 3. Deploying on Vercel

This project is pre-configured to build for **Cloudflare Workers** (the `nitro` target in `vite.config.ts` via `@lovable.dev/vite-tanstack-config`). To deploy on Vercel instead:

1. **Override the Nitro preset** — set the environment variable in your Vercel project settings (and locally in `.env` when testing):

   ```
   NITRO_PRESET=vercel
   ```

   Nitro reads this variable at build time and emits Vercel output instead of Cloudflare output.

2. **Import the repo into Vercel** (New Project → connect your Git repository) and set:

   - **Build command**: `npm run build`
   - **Install command**: `npm install`
   - All six environment variables from the table above in *Project Settings → Environment Variables*.

3. **Deploy**. With the `vercel` preset, the build produces `.vercel/output`; if you build locally you can also deploy it directly:

   ```sh
   npm run build
   npx vercel deploy --prebuilt
   ```

4. **Caveats to verify on your first deploy:**

   - The bundled `@lovable.dev/vite-tanstack-config` targets Cloudflare by default; if `NITRO_PRESET=vercel` is not picked up, pass the preset explicitly in `vite.config.ts` (`nitro: { preset: "vercel" }` inside the `vite` block of `defineConfig`).
   - Server routes (`/api/chat`) and server functions must stay server-rendered — do not switch the app to static-only output, or the AI chat and form submissions will stop working.
   - Add your deployed domain (or `localhost:3000`/`5173` during testing) to the backend's allowed redirect URLs if you use any OAuth flows.

## 4. Post-deployment checklist

- [ ] Home page loads and shows inventory (database connection OK).
- [ ] Contact form and credit application save rows (anon insert policies).
- [ ] Chat widget answers (AI key configured).
- [ ] `/auth` sign-in works and the admin dashboard at `/admin` is reachable for the admin account.
