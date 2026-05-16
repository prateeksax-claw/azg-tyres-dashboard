# Cloudflare Access Plan

## Goal

Keep the Tyres dashboard private. Only approved users should access it.

## Recommended first users

- Prateek
- Amal

## Pages app protection

1. Cloudflare Zero Trust → Access controls → Applications.
2. Create application for the Pages hostname.
3. Policy: Allow only approved email addresses.
4. Session duration: 12-24 hours.
5. Enable MFA if available.

## Future API protection

The backend API should run on the server and be published through Cloudflare Tunnel.

API protection steps:
1. Create API hostname, e.g. `tyres-dashboard-api.<domain>`.
2. Protect hostname with Cloudflare Access.
3. Require service token/JWT validation at API origin.
4. Reject requests that bypass Cloudflare.
5. Set CORS only for the Pages hostname.

## Why this matters

The dashboard will eventually show customer-level financial, GP, outstanding, and projection data. It must never be publicly accessible.
