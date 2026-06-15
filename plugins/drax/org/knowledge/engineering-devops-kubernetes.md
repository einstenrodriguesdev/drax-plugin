# Kubernetes & Container Orchestration Patterns
> Status: stub | Applies to: DevOps Engineer, CTO, Senior Backend Engineer
> Created: 2026-04-25 by HR agent

---

## Purpose

Reference for Kubernetes workload configuration, resource management, health probes, Helm chart patterns, and Kubernetes operational concerns relevant to a Conclave startup context.

---

## Core Kubernetes Objects — Required for Every Service

```yaml
# Deployment — defines the desired pod state
apiVersion: apps/v1
kind: Deployment
metadata:
  name: [service-name]
  namespace: [environment]
spec:
  replicas: 2                    # minimum 2 for HA in production
  selector:
    matchLabels:
      app: [service-name]
  template:
    metadata:
      labels:
        app: [service-name]
    spec:
      containers:
        - name: [service-name]
          image: registry/org/service:${IMAGE_TAG}   # never :latest in production
          resources:
            requests:
              cpu: "100m"         # REQUIRED — scheduler needs this
              memory: "128Mi"     # REQUIRED — OOMKill prevention
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:           # REQUIRED — pod restart on hang
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:          # REQUIRED — remove from LB rotation until ready
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

**Non-negotiables:**
- `resources.requests` and `resources.limits` — mandatory. Missing limits = node resource starvation risk.
- `livenessProbe` — mandatory. Detects deadlocked processes.
- `readinessProbe` — mandatory. Prevents traffic routing to pods not yet warmed up.
- Image tag = commit SHA — never `:latest` in staging or production.

---

## Namespace Strategy

| Namespace | Purpose |
|---|---|
| `production` | Live traffic — strict resource quotas |
| `staging` | Pre-production — same manifests as production |
| `development` | Developer testing — relaxed limits |
| `monitoring` | Prometheus, Grafana, alertmanager |

Apply ResourceQuota per namespace to prevent runaway resource consumption.

---

## HorizontalPodAutoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: [service-name]-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: [service-name]
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70   # scale up when avg CPU > 70%
```

---

## ConfigMaps vs Secrets

| Data type | Kubernetes object | Notes |
|---|---|---|
| Non-sensitive config (feature flags, URLs) | ConfigMap | Plain text — version controlled |
| Sensitive config (passwords, API keys, tokens) | Secret | Base64-encoded, not encrypted by default — use Sealed Secrets or Vault for encryption at rest |

**Never** mount a Secret from a plaintext value in a Deployment YAML committed to Git. Use external secret management: External Secrets Operator (pulls from Vault/AWS SSM) or Sealed Secrets (encrypted before commit).

---

## Helm Chart Structure

```
charts/[service-name]/
  Chart.yaml            # name, version, dependencies
  values.yaml           # default values (non-sensitive)
  values-staging.yaml   # environment overrides
  values-prod.yaml      # production overrides
  templates/
    deployment.yaml
    service.yaml
    ingress.yaml
    hpa.yaml
    configmap.yaml
```

Environment-specific values files: `helm upgrade --install [service] ./charts/[service] -f values-prod.yaml --set image.tag=$GITHUB_SHA`

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| Pod CrashLoopBackOff | Application error on startup; missing env var; OOMKill | `kubectl logs [pod] --previous`; check resource limits |
| Pod Pending forever | Insufficient node resources; PVC not bound | `kubectl describe pod [pod]`; check node capacity |
| Service unreachable | readinessProbe failing; wrong selector label | Check probe endpoint; verify label match |
| HPA not scaling | Metrics server not installed; resource requests not set | Install metrics-server; set cpu requests |

---

## Stub Note

This file is a stub. The following sections require expansion:
- Service mesh (Istio / Linkerd) patterns
- Persistent Volume configuration for stateful services
- Pod Disruption Budgets for zero-downtime upgrades
- Multi-cluster configuration and federation
- Network Policies for zero-trust pod communication
