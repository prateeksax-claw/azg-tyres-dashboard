# Basic Auth Setup

The Cloudflare Pages dashboard is protected by a Pages middleware using HTTP Basic Authentication.

## Environment variables

Set these in Cloudflare Pages:

```txt
DASHBOARD_BASIC_USER=<username>
DASHBOARD_BASIC_PASS=<strong password>
```

Do not commit these values to GitHub.

## Cloudflare steps

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Open **azg-tyres-dashboard**.
4. Go to **Settings → Environment variables**.
5. Add the variables for **Production**:
   - `DASHBOARD_BASIC_USER`
   - `DASHBOARD_BASIC_PASS`
6. Add the same variables for **Preview** if preview URLs should also be protected.
7. Save.
8. Redeploy latest production deployment.
9. Test in incognito: `https://azg-tyres-dashboard.pages.dev` should prompt for username/password.

## Security notes

- This is acceptable for v1 frontend protection.
- Cloudflare Access is stronger for long-term production because it supports identity, MFA, logs, and per-user revocation.
- Keep Basic Auth credentials unique to this dashboard and rotate periodically.
