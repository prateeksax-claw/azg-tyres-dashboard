# Architecture

```txt
MSSQL ERP → local private mirror → DuckDB semantic views → FastAPI → Cloudflare Tunnel → Cloudflare Access → Next.js UI
```

GitHub stores code only. Real data stays on the secured server.
