# Infrastructure as Code — Terraform Patterns
> Status: stub | Applies to: DevOps Engineer, CTO, CISO
> Created: 2026-04-25 by HR agent

---

## Purpose

Reference for Terraform module design, state management, workspace strategy, and GitOps integration for cloud infrastructure in a Conclave startup context.

---

## Core Principle: Everything in Code

No cloud resource is provisioned via the web console. If it exists in the cloud, it exists in a Terraform file. If it exists in a Terraform file, it is in version control. This is not aspirational — it is the baseline requirement. A resource provisioned outside of Terraform is a Snowflake by definition.

---

## Workspace Strategy

| Workspace | Contents | State backend |
|---|---|---|
| `core-infra` | VPC, subnets, security groups, IAM roles, ECR, RDS | S3 + DynamoDB lock |
| `app-infra` | EKS cluster, node groups, load balancers, Route53 | S3 + DynamoDB lock |
| `secrets-infra` | Vault cluster, KMS keys | S3 + DynamoDB lock |

Separate workspaces prevent lock contention (core-infra changes don't block app-infra deploys). Remote state references between workspaces: `data "terraform_remote_state"`.

---

## Module Structure

```
infrastructure/
  terraform/
    modules/
      vpc/              # reusable VPC module
      eks-cluster/      # EKS cluster + node group
      rds/              # RDS PostgreSQL instance
      ecr/              # ECR repository per service
    environments/
      staging/
        main.tf         # calls modules with staging values
        variables.tf
        terraform.tfvars
      production/
        main.tf         # same modules, production values
        variables.tf
        terraform.tfvars
    backend.tf          # S3 + DynamoDB remote state config
```

---

## Remote State Backend (S3 + DynamoDB)

```hcl
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "core-infra/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "company-terraform-locks"
  }
}
```

DynamoDB table prevents concurrent state modifications (lock). Required for team environments. Required even for solo environments — protects against accidental concurrent runs.

---

## IAM Least Privilege Pattern

Never use `AdministratorAccess` for application IAM roles. Every IAM role gets only the permissions it needs:

```hcl
resource "aws_iam_policy" "app_s3_read" {
  name = "${var.service_name}-s3-read"
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:ListBucket"]
      Resource = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"]
    }]
  })
}
```

CI/CD pipeline IAM role: separate from application IAM role. Pipeline role can push to ECR and update EKS deployments — cannot read production secrets or database.

---

## Terraform Plan → Apply Protocol

All changes go through: `terraform plan -out=tfplan` → human review → `terraform apply tfplan`

In CI/CD: automated `terraform plan` on pull request (post plan output as PR comment). Manual `terraform apply` on merge to main — not automated for production infrastructure changes. Infrastructure changes require slower review cadence than application code.

**Exception**: `terraform apply -auto-approve` is acceptable only for: tag updates to existing resources (e.g., updating a tag on an S3 bucket), changes that are purely additive with no potential state disruption.

---

## Drift Detection

Scheduled `terraform plan` run (weekly minimum) against production infrastructure. If plan output is non-empty (drift detected), open an incident ticket. Drift = manual change made outside Terraform = Snowflake Server in progress.

GitHub Actions scheduled workflow:
```yaml
on:
  schedule:
    - cron: '0 6 * * 1'   # Monday 6am
```

---

## Stub Note

This file is a stub. The following sections require expansion:
- Pulumi patterns (TypeScript alternative to HCL)
- Multi-cloud patterns (GCP, Azure equivalents)
- Terragrunt for DRY module composition at scale
- Cost estimation in Terraform plan (Infracost integration)
- Compliance scanning (Checkov, tfsec)
