# AGENTS.MD
> Operational contract for human and AI contributors in this repository.

## 0) Mission
Ship a reliable, demo-ready, multi-tenant LLM observability platform:
- Python SDK instrumentation
- Go gateway (auth/rate-limit/forwarding)
- Next.js dashboard
- OTel + ClickHouse + Grafana stack
- Terraform infra

Primary objective: maximize **signal**, minimize **risk**, keep changes **small and reversible**.

---

## 1) Global Engineering Principles
1. **Correctness > cleverness**  
   Prefer simple, explicit code over abstractions.
2. **Small diffs**  
   One focused change per PR.
3. **Secure by default**  
   No plaintext secrets, no tenant data leakage, no trust in client input.
4. **Fail safely**  
   Clear error paths, graceful degradation, no silent failure.
5. **Demo-first UX**  
   Fast happy path, helpful empty/loading/error states.
6. **Observability always**  
   Critical flows should be traceable and debuggable.

---

## 2) Repo Topology
- `src/` — Python SDK (`anchor`)
- `gateway/` — Go API gateway
- `dashboard/` — Next.js web app
- `configs/` — Collector/ClickHouse/Grafana configs
- `infra/` — Terraform (AWS)
- `docker-compose.yaml` — local stack orchestration

When editing, stay within one subsystem unless the task explicitly requires cross-boundary changes.

---

## 3) Definition of Done (DoD)
A task is done only if:
- [ ] Requirements implemented as requested
- [ ] No obvious regressions in touched code paths
- [ ] Error/empty/loading states handled (UI tasks)
- [ ] Tenant scoping preserved (all data access)
- [ ] Basic manual verification steps documented
- [ ] Changelog/PR summary explains impact and rollback approach

---

## 4) Change Scope Rules
### Allowed by default
- Focused feature additions
- Bug fixes
- Refactors with no behavior change (small only)
- Tests/docs aligned with change

### Forbidden unless explicitly requested
- Broad architectural rewrites
- Dependency churn unrelated to task
- Renaming large file trees
- Secret management changes without review

---

## 5) Coding Standards

## 5.1 Python (`src/`)
- Target readability and deterministic behavior.
- Prefer typed signatures and clear return contracts.
- Catch exceptions at boundaries; avoid swallowing unexpected errors silently.
- No network side effects in import-time code unless already established pattern.

## 5.2 Go (`gateway/`)
- Keep handlers thin; move logic into internal packages.
- Explicit status codes and error messages.
- Context timeouts for Redis/network operations.
- Avoid package-level mutable globals unless necessary.

## 5.3 TypeScript/Next.js (`dashboard/`)
- Prefer server-side data fetching for secure tenant data.
- Validate all server-action inputs.
- Keep client components lean; extract reusable UI where helpful.
- Always provide loading/empty/error UI for async data pages.

## 5.4 Terraform (`infra/`)
- Least privilege IAM.
- Explicit variables/outputs; avoid magic constants.
- Keep environment assumptions documented.

## 5.5 Comments & Documentation
- Every non-trivial function must include a short docstring explaining purpose and inputs/outputs.
- Complex logic blocks must include inline explanation of reasoning.
- No redundant comments (e.g., "increment i").
- Optimize for readability by future engineers, not verbosity.

---

## 6) Security & Multi-Tenancy Guardrails
1. Every query must be tenant/org scoped.
2. Never trust route params for authorization.
3. API keys shown once at creation; store hash only.
4. Redact secrets/tokens from logs.
5. Never commit `.env`, keys, credentials, state files with secrets.
6. Treat all externally supplied strings as untrusted.

---

## 7) Performance Guardrails
- Prefer incremental rendering and paginated queries.
- Avoid N+1 DB/query patterns.
- Keep dashboard first meaningful paint fast.
- For gateway paths, minimize per-request allocations and round trips.

---

## 8) Testing & Verification Policy
For every change, provide:
1. **What was tested**
2. **How it was tested** (manual + automated if available)
3. **What could not be tested** and why
4. **Risk assessment** (low/med/high) and rollback plan

Minimum checks by area:
- Python: relevant unit/integration tests
- Go: handler/middleware logic smoke
- Dashboard: route protection + happy path + empty/error states
- Infra/config: lint/plan-level sanity (if applicable)

---

## 9) Documentation Policy
When behavior changes, update one of:
- inline docs/comments
- `README` / `SETUP_GUIDE`
- runbook-style notes for operators/demo execution

Prefer concise docs with copy-paste commands.

---

## 10) Commit & PR Standards

## Commit format
`<type>(<scope>): <summary>`
- type: feat | fix | refactor | docs | chore | test
- scope: sdk | gateway | dashboard | infra | configs

Examples:
- `feat(dashboard): add empty-state CTA on overview`
- `fix(gateway): enforce tenant lookup before trace forwarding`

## PR must include
1. Problem statement
2. Change summary
3. Screenshots (UI)
4. Validation steps
5. Risk + rollback

---

## 11) Agent Workflow (for AI contributors)
1. Restate task and assumptions.
2. Inspect only relevant files first.
3. Propose minimal plan.
4. Implement focused diff.
5. Validate touched paths.
6. Ensure comments follow section 5.5 rules.
7. Summarize clearly with next steps.

Never do hidden broad edits. Call out uncertainty explicitly.

---

## 12) Demo-Readiness Checklist (MVP)
- Auth works end-to-end
- Protected routes enforced
- Core value flow < 60 seconds
- Tenant-safe data display
- Overview + traces + detail pages stable
- API key create/revoke UX clean
- Empty/loading/error states polished
- Seed/reset demo path documented

---

## 13) Escalation Triggers
Stop and ask before proceeding if:
- Requirement conflicts with security guardrails
- Data model migration may break existing records
- Task needs infra/secrets not available
- Requested scope exceeds safe incremental change
