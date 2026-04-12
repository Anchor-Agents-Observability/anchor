## Dashboard Setup

Copy the local env template and fill in your service credentials:

```bash
cp .env.example .env
```

Required auth variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Enable Google and GitHub OAuth providers in Supabase Auth and add these callback URLs:

- Local: `http://localhost:3000/auth/callback`
- Deployed: `https://<your-domain>/auth/callback`

Start the dashboard:

```bash
npm install
npm run dev
```

The app redirects unauthenticated requests to `/sign-in`, then exchanges the Supabase OAuth code at `/auth/callback` before loading the protected dashboard routes.
