# Security Policy

This repository is private and must remain private.

Never commit:

- `.env` files
- database mirrors (`*.db`, `*.sqlite`, `*.duckdb`)
- raw ERP exports
- customer financial Excel files
- WhatsApp media/exports
- API keys or tokens
- Cloudflare/GitHub secrets

Allowed:

- application source code
- semantic SQL
- docs
- tests
- redacted/anonymized mock data

Production access must be protected with Cloudflare Access.
