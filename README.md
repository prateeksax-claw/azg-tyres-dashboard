# AZG Tyres Dashboard

Premium management cockpit for Al Zaabi Group Tyres Division.

## Purpose

Provide executive and operational analytics across:

- sales vs budget/projection
- region/branch performance
- salesman accountability
- customer 360
- product/category/brand analytics
- GP and margin leakage
- collections and receivables
- projection/expectation shortfall
- action center
- future ETO and inventory intelligence

## Stack

- Frontend: Next.js, TypeScript, Tailwind, shadcn/ui, ECharts
- Backend: FastAPI + DuckDB semantic layer
- Hosting: Cloudflare Pages + Cloudflare Tunnel + Cloudflare Access
- Data: private ERP mirror outside GitHub

## Security rule

This repo must not contain real ERP databases, Excel uploads, WhatsApp exports, tokens, or raw customer financial datasets.

See `SECURITY.md` and `docs/github-plan.md`.
