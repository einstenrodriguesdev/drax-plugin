# Tech Decision Record

Status: draft
Owner: technical operations
Last reviewed:

An Architecture Decision Record (ADR) for the v1 stack, the isolated automation environment, and the security posture; each decision states context, the decision, status, and consequences.

## Context

| Layer | Current value | Owner | Risk | Immediate action |
|---|---|---|---|---|
| Domain | | | | |
| Frontend | | | | |
| Backend | | | | |
| Database | | | | |
| Hosting/server | | | | |
| Repository | | | | |
| CI/CD | | | | |
| Analytics | | | | |
| Payments | | | | |
| Auth | | | | |
| Email/newsletter | | | | |
| Social accounts | | | | |

## Decision Options

| Option | Posture | Advantage | Disadvantage | Cost/complexity | Choose when | Do not choose when |
|---|---|---|---|---|---|---|
| A | Use current product stack plus manual/export publishing | Lowest risk; no new infrastructure dependency. | Less autonomy; founder handles more upload steps. | Low | Current product stack is fragile or connection readiness is unknown. | Daily autonomous posting is required immediately. |
| B | Isolated VPS automation node | Good balance: Drax runs 24/7 on a separated Linux environment with its own env file, queue, logs, and timers. | Requires server hardening and operational maintenance. | Medium | Founder can operate a VPS and wants daily automation. | Founder cannot maintain SSH, backups, or secret rotation. |
| C | Production API-first publishing system | Strongest long-term foundation: service account boundaries, database queue, audit logs, API adapters, and dashboard. | Too heavy before v1 evidence; more code, review, and cost. | High | Multiple customers or high-value accounts need managed automation. | The first product is still proving demand. |

Custom answer:

## Decision

- Selected option:
- Decision status:
- Server:
- Database/state store:
- Queue:
- Scheduler:
- Secrets source:
- Log location:
- Backup policy:
- Rollback path:
- Revisit trigger:

## Consequences

- Positive consequences:
- Negative consequences/trade-offs accepted:
- Follow-up actions:

## Security Baseline

| Control | Current phase action | Future action | Standard reference |
|---|---|---|---|
| Secrets | Environment-only; never write secrets to artifacts, logs, prompts, or generated media. | Secret manager with rotation and scoped tokens. | NIST SSDF; OWASP secret-handling practice |
| App security | Apply OWASP ASVS Level 1 intent to any hosted surface. | ASVS Level 2 where customer data or auth risk increases. | OWASP ASVS 5.0 |
| Software delivery | Lock dependencies, validate package contents, and keep dry-run defaults. | SBOM, signed artifacts, SAST, and release approvals. | NIST SSDF |
| Platform accounts | Isolated test accounts before production accounts. | Least-privilege OAuth apps and formal app review. | Platform developer docs |
| Browser automation | Experimental only with screenshots, rate limits, and kill switch. | Replace with official APIs when gates pass. | Drax publishing gate |

## Paid Tool Introduction

| Tool category | Current action | Paid upgrade trigger | Candidate tools |
|---|---|---|---|
| Analytics | | | |
| SEO/research | | | |
| Scheduling/publishing | | | |
| Design/video | | | |
| Secrets/security | | | |
