# CI/CD Pipeline Design & Delivery Patterns
> Status: stub | Applies to: DevOps Engineer, CTO, QA Engineer
> Created: 2026-04-25 by HR agent

---

## Purpose

Reference for designing, implementing, and measuring CI/CD pipelines in a Conclave startup context. Covers pipeline stage design, deployment strategies, DORA measurement, and quality gate configuration.

---

## Pipeline Stage Model (GitHub Actions canonical)

Standard pipeline for a containerized application:

```
trigger: push to main OR pull_request

stages:
  1. lint          — ESLint/Prettier/Ruff/golangci-lint — fail fast on syntax
  2. unit-test     — Jest/pytest/go test — < 2 min target
  3. integration   — test database, external service mocks — < 5 min target
  4. build         — docker build, tag with $GITHUB_SHA
  5. push          — push image to container registry (ECR/GCR/DockerHub)
  6. deploy-staging — kubectl apply or ArgoCD sync
  7. smoke-test    — curl health endpoint, assert 200 OK
  8. deploy-prod   — triggered on main merge only, requires smoke-test PASS
```

**Gates:**
- Pull requests: stages 1–3 must pass before merge allowed
- Main branch: all 8 stages run in sequence
- Production deploy: blocked if smoke test fails on staging

---

## Deployment Strategies

| Strategy | How | When to use | Rollback |
|---|---|---|---|
| Rolling update | Replace pods one by one | Default — stateless services | Delete new pods, old pods restart |
| Blue-Green | Two identical environments, switch LB | Zero-downtime, easy rollback | Switch LB back to blue |
| Canary | Route X% traffic to new version | Risk mitigation for large changes | Route 0% to canary, delete |
| Feature flags | Code ships off, turned on independently | Decouples deploy from release | Toggle flag off |

**Kubernetes rolling update — key parameters:**
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0   # never reduce available pods below desired count
```

---

## DORA Four Metrics

| Metric | Measures | Elite target | How to instrument |
|---|---|---|---|
| Deployment Frequency | Speed | Multiple times/day | Count production deploys per day/week |
| Lead Time for Changes | Speed | < 1 hour | Time from commit merge to production deploy |
| Change Failure Rate | Stability | 0–5% | Deploys that cause production incident / total deploys |
| Time to Restore (MTTR) | Stability | < 1 hour | Time from incident open to service restored |

DORA data: source from GitHub Actions run history + incident tracking. Report monthly in `DEVOPS_REPORT.md`.

---

## Quality Gate Configuration

Every CI pipeline must enforce:

1. **Linting gate**: zero lint errors block merge (ESLint, Prettier, language-specific linters)
2. **Test gate**: unit + integration tests — no merge on red pipeline
3. **Coverage gate**: do not use line coverage % as the gate — use behavior coverage (100% of P0 user journeys have E2E tests)
4. **Security gate**: container image scan (Trivy) — block on CRITICAL vulnerabilities
5. **Secret scan gate**: GitGuardian or `git-secrets` pre-commit hook + CI check

---

## Container Image Tagging Convention

```
registry/org/service:${GITHUB_SHA}    # immutable — every build is unique
registry/org/service:latest           # mutable — used for development pull only
registry/org/service:v1.2.3           # semantic version tag for releases
```

Rollback = update Kubernetes deployment image tag to previous `$GITHUB_SHA`. No "rebuild to rollback" — image must already exist in registry.

---

## GitHub Actions Secrets Management

**Never** store secrets as plaintext in workflow YAML.
**Never** echo secrets to build logs.

Correct pattern:
```yaml
env:
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

For production: inject secrets at runtime from HashiCorp Vault or AWS Secrets Manager — not from GitHub Actions secrets (which are long-lived). Use `vault-action` or AWS SDK in the pipeline.

---

## Stub Note

This file is a stub. The following sections require expansion before this agent is fully loaded:
- Multi-cloud pipeline patterns (GCP Cloud Build, AWS CodePipeline)
- Monorepo CI strategy (affected-service detection)
- Pipeline cost optimization (caching layers, parallelism)
- Advanced canary with automated metric gates (Argo Rollouts)
