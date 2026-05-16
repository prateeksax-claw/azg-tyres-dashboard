# Cloudflare Pages Setup

## Project

- Project name: `azg-tyres-dashboard`
- GitHub repo: `prateeksax-claw/azg-tyres-dashboard`
- Production branch: `main`
- Framework preset: `Next.js (Static HTML Export)` or custom

## Build settings

Because this is a monorepo, use repo root as the root directory.

- Root directory: `/`
- Build command: `npm ci && npm run pages:build`
- Build output directory: `apps/web/out`
- Node version: `22`
- Deploy command: **leave blank**

Important: If Cloudflare shows a Deploy command like `npx wrangler deploy`, remove it. This is a Pages project, not a Worker deploy. Pages should upload the static output directory automatically after the build.

The current frontend is a static executive cockpit. The live API will be added behind Cloudflare Tunnel/Access in the next phase.

## Environment variables

Initial frontend does not need secrets.

Optional public values:

```txt
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Do not add ERP DB credentials, GitHub tokens, or Cloudflare API tokens as frontend variables.

## Security

`apps/web/public/_headers` adds baseline browser security headers. No static redirect rule is needed for v1 because the app currently serves the root dashboard page only.

Before exposing live ERP-backed API data:
1. Add Cloudflare Access to the Pages app.
2. Add Cloudflare Access to the API hostname.
3. Validate Cloudflare Access JWT at the API origin.
4. Keep DB mirror and `.env` only on the server, never in GitHub or Pages.

## CLI deployment option

If Wrangler is authenticated:

```bash
npm ci
npm run pages:build
npm run pages:deploy
```

Currently this server needs `wrangler login` or a scoped `CLOUDFLARE_API_TOKEN` before CLI deployment.


## Troubleshooting

### Error: Wrangler application detection logic has been run in the root of a workspace

Cause: Cloudflare is running `npx wrangler deploy` as a deploy command. That is wrong for this Git-connected Pages project.

Fix in Cloudflare Pages project settings:

- Build command: `npm ci && npm run pages:build`
- Build output directory: `apps/web/out`
- Deploy command: blank / none

Then retry deployment.
