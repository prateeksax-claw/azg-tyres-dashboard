# Tyres Dashboard — GitHub Setup Plan

Created: 2026-05-16

## Recommendation

Create a fresh private GitHub repository for the dashboard, separate from the OpenClaw workspace repo.

Recommended repo name:
- `azg-tyres-dashboard`

Why separate:
- The OpenClaw workspace contains private data, DB mirrors, message context, generated reports, and operational scripts.
- The dashboard repo should contain only application code, semantic SQL, docs, tests, and safe sample/mock data.
- Real ERP data, `.env`, database mirrors, tokens, and WhatsApp data must never be committed.

## Current local GitHub readiness check

- `git` is installed.
- `node` and `npm` are installed.
- GitHub CLI `gh` is not installed.
- Current workspace has no remote configured.

Because `gh` is missing, there are two safe paths:

### Option A — preferred: Prateek creates the private repo and gives Titan repo access
1. Create private repo: `azg-tyres-dashboard`.
2. Add access for the GitHub identity/token Titan will use.
3. Titan adds remote and pushes initial scaffold.

### Option B — install/use GitHub CLI later
1. Install `gh` if needed.
2. Authenticate through GitHub device login or token.
3. Titan creates repo from CLI.

Do not paste long-lived personal tokens into group chats. If a token is needed, use a fine-grained PAT limited only to this repo.

## Fine-grained GitHub token permissions if token route is used

Minimum:
- Repository: `azg-tyres-dashboard` only
- Contents: Read and Write
- Metadata: Read
- Pull requests: Read and Write
- Actions: Read and Write only if GitHub Actions deployment is used

Optional later:
- Secrets: Read/Write if Titan will create GitHub Actions secrets directly

Avoid:
- Organization admin
- All repositories
- Delete repository
- Billing

## Repository privacy and security

Repo must be private.

Never commit:
- `.env`
- `.api-keys.json`
- SQLite DB mirrors
- Excel uploads containing customer financials
- generated WhatsApp attachments
- raw data exports
- real customer-level sample data unless explicitly approved

Allowed to commit:
- source code
- SQL semantic views
- documentation
- migrations
- tests
- type definitions
- anonymized or tiny mock sample data
- design tokens

## Proposed repo structure

```txt
azg-tyres-dashboard/
├── README.md
├── SECURITY.md
├── .gitignore
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── apps/
│   ├── web/                    # Next.js frontend, Cloudflare Pages
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   └── package.json
│   └── api/                    # FastAPI backend, private origin behind Cloudflare Tunnel
│       ├── app/
│       ├── dashboard_semantic/
│       ├── tests/
│       ├── pyproject.toml
│       └── README.md
├── packages/
│   ├── ui/                     # shared UI components/design tokens
│   ├── config/                 # eslint/tsconfig/tailwind config
│   └── types/                  # shared API/KPI types
├── semantic/
│   ├── dashboard_views.sql
│   ├── kpi_dictionary.md
│   └── data_contract.md
├── docs/
│   ├── architecture.md
│   ├── github-plan.md
│   ├── cloudflare-plan.md
│   ├── ux-design-system.md
│   └── data-security.md
└── mock-data/
    └── dashboard_sample_redacted.json
```

## Branching model

- `main`: production-ready, protected.
- `dev`: staging branch.
- feature branches: `feature/semantic-layer`, `feature/executive-cockpit`, etc.

Initial approach can be simple:
- Push scaffold to `main`.
- Use PRs once Cloudflare deployment is connected.

## GitHub Actions plan

Initial CI:
- frontend lint
- frontend typecheck
- frontend build
- backend tests
- backend formatting/lint later

Do not put production secrets into GitHub until deployment path is confirmed.

Future deployment:
- Cloudflare Pages can deploy directly from GitHub branch.
- Backend remains on existing server behind Cloudflare Tunnel, or later containerized.

## Initial commit scope

First commit should include:
- README
- security policy
- repo `.gitignore`
- design system docs
- KPI dictionary
- semantic SQL copy
- frontend scaffold
- API scaffold
- redacted mock data

First commit should not include:
- `data/tyres-mirror.db`
- real projection workbook
- real generated reports
- `.env`
- WhatsApp media

## Acceptance criteria for GitHub step

GitHub step is complete when:
1. Private repo exists.
2. Initial code scaffold is pushed.
3. README explains purpose, stack, and security boundaries.
4. CI runs on push.
5. Repo has no private data or secrets.
6. Cloudflare can be connected to repo in the next step.

## Immediate Titan tasks before access

- Prepare GitHub-ready scaffold locally.
- Copy safe semantic SQL/docs only.
- Create `.env.example` and security docs.
- Keep all real data outside repo.

## Input needed from Prateek

- GitHub username/org where repo should live.
- Repo name approval: `azg-tyres-dashboard`.
- Preferred access method:
  - invite/access to repo, or
  - fine-grained PAT for this repo only.
