## Goal

1. Add **continuous security scanning in GitHub Actions** that runs on every PR (and weekly on schedule).
2. Run an **advanced one-off security scan** locally in the sandbox (SAST + dependency + secrets) and report findings.

Note: Aikido already runs at the workspace level (visible in the Security tab) but only after merges/scans triggered by Lovable. CI adds **per-PR gating** before code lands.

---

## Part 1 — GitHub Actions CI workflow

Create `.github/workflows/security.yml` with these jobs, all running on `pull_request` + `push` to `main` + weekly `schedule`:

### Job 1: Dependency scanning
- **`bun audit`** (or `npm audit --audit-level=high`) — fail on high/critical CVEs in `package.json` deps.
- **OSV-Scanner** (`google/osv-scanner-action`) — broader vuln DB covering npm + lockfile transitive deps. Free, no token.

### Job 2: SAST (Static Application Security Testing)
- **CodeQL** (`github/codeql-action`) with `javascript-typescript` query pack. Catches XSS, injection, prototype pollution, hardcoded secrets, unsafe `dangerouslySetInnerHTML`, etc. Free for public repos and most private orgs. Results upload to GitHub Security tab.
- **Semgrep** (`semgrep/semgrep-action`) with `p/owasp-top-ten`, `p/react`, `p/typescript`, `p/supabase` rulesets. Free tier, no token required for OSS rules.

### Job 3: Secret scanning
- **Gitleaks** (`gitleaks/gitleaks-action`) — scans diff + history for leaked API keys, JWTs, service-role keys.
- Reinforces the existing `scripts/check-no-service-role.ts` guard.

### Job 4: Custom guards (already in repo)
- Run `bun run scripts/check-no-service-role.ts` to confirm no service-role refs in client bundle.
- Run `bun run lint` (eslint).

### Job 5: Basic DAST (lightweight)
- **OWASP ZAP Baseline Scan** (`zaproxy/action-baseline`) against the **published preview URL** `https://vivek-doba-portal.lovable.app`. Passive scan only (no active exploitation), runs ~2 min, flags missing security headers, mixed content, cookie flags, CSP issues, etc.
- Runs on `schedule` (weekly) only — not on every PR — because preview URL reflects deployed code, not PR code.

### Workflow shape

```text
.github/workflows/security.yml
├── on: pull_request, push (main), schedule (weekly)
├── job: dependencies      → bun audit + osv-scanner
├── job: sast              → codeql + semgrep
├── job: secrets           → gitleaks + service-role guard
├── job: lint              → eslint
└── job: dast (weekly)     → zap baseline against published URL
```

All jobs upload **SARIF** results so findings show in the GitHub **Security → Code scanning** tab.

---

## Part 2 — Run advanced scan now (in sandbox)

Execute in this turn (after approval):

1. `bun audit --audit-level=low` — full dep tree.
2. **OSV-Scanner** via `nix run nixpkgs#osv-scanner -- --lockfile=bun.lockb` (fallback to `package-lock.json` if needed).
3. **Semgrep** via `pip install semgrep` then `semgrep --config=p/owasp-top-ten --config=p/react --config=p/typescript --config=p/supabase --severity=WARNING --json src/ supabase/functions/`.
4. **Gitleaks** via `nix run nixpkgs#gitleaks -- detect --no-git --source=.`.
5. **Service-role guard**: `bun run scripts/check-no-service-role.ts`.
6. **Basic DAST**: `curl -sI https://vivek-doba-portal.lovable.app` to verify CSP/HSTS/X-Frame-Options headers from `public/_headers` are actually applied in production.

Aggregate findings into a markdown report at `/mnt/documents/security-scan-report.md` and surface top issues in chat. Cross-reference each finding against the existing `mem://security/hardening-stack` to skip already-accepted risks.

---

## Files created / modified

- **NEW** `.github/workflows/security.yml` (~120 lines)
- **NEW** `.gitleaks.toml` (allowlist for `VITE_SUPABASE_PUBLISHABLE_KEY` and other intentionally-public anon keys)
- **NEW** `/mnt/documents/security-scan-report.md` (one-off scan output)
- **NO changes** to application code unless the scans surface real vulnerabilities — in which case I'll fix them in the same turn.

## Out of scope

- Full active DAST (would need staging env + auth tokens).
- Container/IaC scanning (no Dockerfile / Terraform in this project).
- Paid scanners (Snyk, Sonar) — all chosen tools are free/OSS.
