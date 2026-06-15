# Conclave Knowledge Library

> Domain knowledge for Conclave agents. Each doc is loaded on-demand via Read tool.
> Maintained by HR agent — updated when new agents are built or on 90-day review cycles.

---

## How to use this library

Agents load knowledge docs with the Read tool before executing decisions in that domain:

```
Read({ file_path: "~/.claude/knowledge/[doc-name].md" })
```

Each agent's `**DOMAIN KNOWLEDGE**` section lists which docs to load and when (REQUIRED / CONTEXTUAL).

---

## Operations

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [ops-process-frameworks.md](ops-process-frameworks.md) | Process Design & Standardization (DMAIC, RACI, SOP) | COO | stub |
| [ops-cadence-okr.md](ops-cadence-okr.md) | OKR Cascade & Operating Cadence | COO | stub |

---

## Marketing

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [marketing-paid-traffic.md](marketing-paid-traffic.md) | Paid Traffic Scaling | CMO, Traffic Manager, CRO, Analytics Attribution Specialist | stub |
| [marketing-funnel-frameworks.md](marketing-funnel-frameworks.md) | Funnel Frameworks | CMO, CRO, Design CTO, Analytics Attribution Specialist, SEO Manager, CRO Specialist, Content Strategist, Marketing Automation Specialist, Community Manager, BDR, Cold Outreach Specialist | stub |
| [marketing-copy-validation.md](marketing-copy-validation.md) | Copy Validation | CMO, Traffic Manager, Social Media Manager | stub |
| [marketing-content-strategy.md](marketing-content-strategy.md) | Content Strategy (Content Pillar Architecture, COPE Framework, Content Type Matrix, Topical Authority Threshold, Thought Leadership Architecture, ICP Awareness Stage model, B2B SaaS benchmarks) | CMO, Content Strategist, Social Media Manager, Art Director, Video Editor, SEO Manager, Community Manager | stub |
| [marketing-attribution.md](marketing-attribution.md) | Attribution & Analytics (attribution model comparison table, platform window defaults, cross-channel double-counting mechanics, three-column ROAS reconciliation protocol, blended ROAS formula, CAC payback calculation, attribution integrity checklist) | Analytics Attribution Specialist, CMO, Traffic Manager, Marketing Automation Specialist | stub |
| [marketing-brand-positioning.md](marketing-brand-positioning.md) | Brand Positioning | CMO, Creative Director, Art Director, SEO Manager, Community Manager, Cold Outreach Specialist, OSINT Specialist, Account Executive, Appointment Setter, Automation Receptionist | stub |

---

## Community Management

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [community-health-metrics.md](community-health-metrics.md) | Community Health Metrics & Member Classification (Community Health Score five-dimension framework — new member acquisition rate, 30-day return rate, P2P interaction ratio, question resolution rate, content contribution rate; Orbit Model four-level classification — Ambassador/Contributor/Participant/Observer; CQL four-factor behavioral checklist; weekly health signal interpretation table; platform-specific metric extraction protocols — Discord Server Insights, Circle Analytics, Discourse Data Explorer) | Community Manager | stub |
| [community-platform-ops.md](community-platform-ops.md) | Community Platform Operations & Moderation Architecture (platform comparison matrix — Discord/Slack/Circle/Discourse/Bettermode/Khoros; platform selection decision framework; Platform Moderation Triage Protocol — P1/P2/P3 severity taxonomy with response SLAs and escalation paths; new-member onboarding architecture with Fogg B=MAP design per platform type; Ambassador program design checklist; community seeding protocol — first 90 days; platform migration decision framework) | Community Manager | stub |

---

## Content Strategy

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [content-editorial-planning.md](content-editorial-planning.md) | Editorial Planning (sprint-based planning cycle, Content Type Matrix, production capacity methodology, executor assignment protocol, editorial calendar field definitions, quarterly planning protocol, governance rules) | Content Strategist, CMO | stub |
| [content-measurement-attribution.md](content-measurement-attribution.md) | Content Measurement & Attribution (pipeline vs. vanity metric classification, UTM governance protocol for content, attribution model selection table, content performance report structure, content ROI calculation, monthly review cadence) | Content Strategist, CMO, Analytics Attribution Specialist | stub |

---

## SEO & Organic Growth

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [seo-organic-strategy.md](seo-organic-strategy.md) | SEO Organic Strategy (Pillar-Cluster architecture model, Intent-Layer Keyword Segmentation — TOFU/MOFU/BOFU, keyword prioritization scoring, E-E-A-T signal architecture, GEO/AEO content checklist, programmatic SEO build gate) | SEO Manager, CMO, Content Strategist | stub |
| [seo-technical-audit.md](seo-technical-audit.md) | SEO Technical Audit (Screaming Frog crawl setup and interpretation, P1/P2/P3 severity taxonomy, Core Web Vitals measurement protocol — LCP/INP/CLS thresholds and fix classification, canonicalization audit methodology, crawl budget allocation framework, structured data validation checklist) | SEO Manager, CTO, Full Stack Developer | stub |

---

## Conversion Rate Optimization

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [cro-experimentation-framework.md](cro-experimentation-framework.md) | CRO Experimentation Framework (MDE selection, sample size calculation, SRM detection — chi-square protocol, peeking mitigation — sequential testing, novelty effect protocol, test conclusion decision tree, frequentist vs. Bayesian interpretation) | CRO Specialist, Analytics Attribution Specialist | stub |
| [cro-research-heuristics.md](cro-research-heuristics.md) | CRO Research Heuristics (ResearchXL 6-layer protocol — heuristic/technical/analytics/mouse-tracking/qualitative/user testing, LIFT Model scoring rubric — Value Proposition/Relevance/Clarity/Anxiety/Distraction/Urgency, PIE Framework scoring and tie-breaking, hypothesis statement template with dual-evidence requirement) | CRO Specialist | stub |

---

## Analytics & Measurement

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [analytics-measurement-framework.md](analytics-measurement-framework.md) | Analytics Measurement Framework (MTA / MMM / Incrementality decision tree, when to use each method, data requirements per model, incrementality test design protocol — geo-holdout vs. platform lift study, holdout sizing, test duration minimums, model selection decision table by business stage and spend level) | Analytics Attribution Specialist, CMO, Traffic Manager | stub |
| [analytics-tracking-plan.md](analytics-tracking-plan.md) | Analytics Tracking Plan (canonical event taxonomy schema, UTM parameter governance — approved values, naming tree, pre-launch validation checklist, UTM changelog, consent mode v2 configuration — basic vs. advanced, server-side GTM setup checklist, data gap audit methodology) | Analytics Attribution Specialist, CMO, Traffic Manager, Marketing Automation Specialist | stub |

---

## Creative Direction

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [creative-brief-framework.md](creative-brief-framework.md) | Creative Brief Framework (6-field gate, stage-gate review protocol — Concept / Execution / Pre-Publish, brief quality rubric, revision escalation rules) | Creative Director, Art Director, Video Editor | stub |
| [creative-campaign-architecture.md](creative-campaign-architecture.md) | Campaign Architecture (campaign phase taxonomy — Awareness/Consideration/Conversion, Brand Expression System — Big Idea/Channel Variants/Execution Units, channel-to-format mapping, production brief derivation, campaign integrity principles) | Creative Director, Art Director | stub |

---

## Design

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [design-visual-systems.md](design-visual-systems.md) | Visual Systems for Social Media Design (Brand Kit Enforcement, typography scale, visual hierarchy, Content Pillar Visual Mapping) | Social Media Designer, Performance Creative, Art Director, Motion Designer, Creative Director, Video Editor | stub |
| [design-social-media-formats.md](design-social-media-formats.md) | Social Media Format Specifications (per-platform dimension table, aspect ratio decision tree, safe zones, file formats, naming convention) | Social Media Designer, Performance Creative, Traffic Manager, Art Director, Video Editor | stub |

---

## Motion Design

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [motion-remotion-patterns.md](motion-remotion-patterns.md) | Remotion Core Patterns (useCurrentFrame, useVideoConfig, spring(), interpolate(), Sequence, Composition, calculateMetadata, render CLI) | Motion Designer | stub |
| [motion-content-templates.md](motion-content-templates.md) | Parametric Video Template Design (Zod schema patterns, data-driven videos, calculateMetadata, renderMediaOnLambda, dataset render, naming conventions, delivery log) | Motion Designer | stub |

---

## Video Production

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [video-post-production-workflow.md](video-post-production-workflow.md) | Post-Production Workflow (Assembly-to-Picture-Lock stages, color grading scope protocol, audio mixing levels, platform export spec table per codec/container/resolution/frame rate/bitrate/aspect ratio/file size, subtitle format requirements, proxy generation) | Video Editor | stub |
| [video-retention-editing.md](video-retention-editing.md) | Retention Editing (Hook-Body-CTA architecture with timing zones by format, retention curve interpretation for YouTube/Meta/TikTok, hook rate / hold rate calculation and benchmarks, cut-point correction protocol by retention drop signature, short-form vs. long-form pacing rules) | Video Editor | stub |

---

## Engineering

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [engineering-system-design.md](engineering-system-design.md) | System Design Principles | CTO | stub |
| [engineering-team-org.md](engineering-team-org.md) | Engineering Team Org | CTO | stub |
| [engineering-architecture-decisions.md](engineering-architecture-decisions.md) | Architecture Decision-Making | CTO | stub |
| [engineering-observability.md](engineering-observability.md) | Observability & Monitoring | CTO, DevOps Engineer | stub |
| [engineering-full-stack-patterns.md](engineering-full-stack-patterns.md) | Full Stack Implementation Patterns (REST/GraphQL contracts, ORM queries, frontend state, auth, CI/CD) | Full Stack Developer, CTO, DevOps Engineer | stub |
| [engineering-testing-strategy.md](engineering-testing-strategy.md) | Testing Strategy (Testing Trophy, unit/integration/E2E, coverage thresholds, red pipeline protocol) | Full Stack Developer, QA Engineer, CTO | stub |
| [engineering-qa-strategy.md](engineering-qa-strategy.md) | QA Strategy (BDD/Gherkin, Risk-Based Testing, defect taxonomy, DER, shift-left, Pre-Release Sign-Off criteria) | QA Engineer, Full Stack Developer, CTO, Product Manager | stub |
| [engineering-backend-patterns.md](engineering-backend-patterns.md) | Backend Engineering Patterns (API contract-first, DDD tactical patterns, CQRS, N+1 elimination, expand/contract migrations, external service integration) | Senior Backend Engineer, Full Stack Developer, CTO | stub |
| [engineering-security-backend.md](engineering-security-backend.md) | Backend Security Implementation (OWASP API Top 10 checklist, JWT/OAuth2, input validation, rate limiting, secrets management, parameterized queries) | Senior Backend Engineer, Full Stack Developer, QA Engineer, CTO, CISO, DevOps Engineer, AI Engineer | stub |
| [engineering-frontend-patterns.md](engineering-frontend-patterns.md) | Frontend Implementation Patterns (Atomic Design, component contracts, CSS architecture, state management) | Senior Frontend Engineer | stub |
| [engineering-frontend-performance.md](engineering-frontend-performance.md) | Frontend Performance (Core Web Vitals budget, Lighthouse CI, code-splitting, image optimization) | Senior Frontend Engineer | stub |
| [engineering-frontend-accessibility.md](engineering-frontend-accessibility.md) | Frontend Accessibility (WCAG 2.2 AA, ARIA, keyboard navigation, axe-core) | Senior Frontend Engineer | stub |
| [engineering-devops-cicd.md](engineering-devops-cicd.md) | CI/CD Pipeline Design & Delivery Patterns (8-stage model, deployment strategies, DORA metrics, quality gates, secrets in pipelines) | DevOps Engineer, CTO, QA Engineer | stub |
| [engineering-devops-kubernetes.md](engineering-devops-kubernetes.md) | Kubernetes & Container Orchestration Patterns (Deployment config, resources/probes, namespace strategy, HPA, Helm, common failures) | DevOps Engineer, CTO, Senior Backend Engineer | stub |
| [engineering-devops-iac.md](engineering-devops-iac.md) | Infrastructure as Code — Terraform Patterns (workspace strategy, module structure, remote state, IAM least privilege, plan/apply protocol, drift detection) | DevOps Engineer, CTO, CISO | stub |

---

## AI Engineering

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [ai-rag-pipeline-design.md](ai-rag-pipeline-design.md) | RAG Pipeline Design (chunking strategy decision tree, embedding model selection, similarity metrics, top-k and reranking patterns, context assembly, RAG Triad evaluation setup, RAGAS configuration) | AI Engineer, CTO | stub |
| [ai-llm-evaluation.md](ai-llm-evaluation.md) | LLM Evaluation (eval dataset construction, RAGAS metrics, LLM-as-judge pattern, evaluation-driven development, CI eval gate setup, baseline thresholds by feature type) | AI Engineer, CTO, QA Engineer | stub |
| [ai-llm-cost-management.md](ai-llm-cost-management.md) | LLM Cost Management (token budgeting, model routing patterns, cost-per-call calculation, cost-per-feature tracking, Langfuse cost monitoring, optimization techniques) | AI Engineer, CTO, COO | stub |

---

## Sales & Revenue

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [sales-conversational-routing.md](sales-conversational-routing.md) | Sales Conversational Routing (intake-tree design, contact capture rules, qualification outcomes, support-vs-sales separation, human fallback, routing metrics) | Automation Receptionist, Appointment Setter, SDR, Support Specialist | stub |
| [sales-appointment-setting.md](sales-appointment-setting.md) | Sales Appointment Setting (speed-to-lead SLA, qualification-lite, scheduling friction reduction, reminder cadence, no-show recovery, booking metrics) | Appointment Setter, Automation Receptionist, SDR, BDR, Account Executive, Outbound Performance Analyst | stub |
| [sales-pipeline-management.md](sales-pipeline-management.md) | Pipeline Management | CRO, RevOps Manager, BDR, Account Executive, Appointment Setter, Outbound Performance Analyst | stub |
| [sales-enterprise-frameworks.md](sales-enterprise-frameworks.md) | Enterprise Sales Frameworks | CRO, Account Executive | stub |
| [sales-negotiation.md](sales-negotiation.md) | Negotiation Frameworks | CRO, Account Executive | stub |
| [sales-forecasting.md](sales-forecasting.md) | Sales Forecasting | CRO, RevOps Manager, Account Executive | stub |
| [sales-lifecycle-governance.md](sales-lifecycle-governance.md) | Sales Lifecycle Governance (canonical stage map, entry / exit criteria, forward-only rules, cross-object sync, handoff SLAs, exception handling) | RevOps Manager, Marketing Automation Specialist, SDR, BDR, CRO, VP Sales, Sales Manager | stub |
| [sales-territory-capacity-planning.md](sales-territory-capacity-planning.md) | Sales Territory & Capacity Planning (segmentation taxonomy, coverage model, capacity assumptions, book construction, quota allocation, rebalance policy) | RevOps Manager, VP Sales, CRO, Sales Manager | stub |
| [sales-outbound-prospecting.md](sales-outbound-prospecting.md) | Outbound Prospecting (ICP-tiered account classification - Tier 1/2/3 with firmographic + technographic + intent signal criteria, multi-channel cadence architecture - email + phone + LinkedIn sequencing rules and delay cadencing, buyer intent signal taxonomy - Bombora / G2 / LinkedIn engagement signals, personalization formula - trigger event + pain hypothesis + social proof + CTA, A/B test design for outreach variants, sequence exit criteria and recycle protocol) | BDR, Cold Outreach Specialist, OSINT Specialist, Data Enrichment Specialist, Outbound Performance Analyst, VP Sales, CRO | stub |
| [sales-qualification-frameworks.md](sales-qualification-frameworks.md) | Sales Qualification Frameworks (BANT framework with question templates and disqualification signals, MEDDIC framework with BDR-scope vs. AE-scope field delineation, SPICED framework for PLG + sales-assist cycles, framework selection decision tree by deal size and cycle length, SQL handoff protocol - 5-field mandatory structure, MQL vs. SQL disqualification taxonomy, objection handling protocol) | BDR, AE, OSINT Specialist, VP Sales, CRO | stub |
| [sales-osint-lead-intelligence.md](sales-osint-lead-intelligence.md) | Sales OSINT Lead Intelligence (intelligence cycle for prospecting, source reliability grading, confidence notation, signal taxonomy, org-chart recovery, provenance logging, archive policy, legal guardrails) | OSINT Specialist, BDR, CRO | stub |
| [sales-data-enrichment.md](sales-data-enrichment.md) | Sales Data Enrichment (field taxonomy, waterfall source order, required fields by workflow, confidence and provenance, pre-handoff readiness, refresh cadence) | Data Enrichment Specialist, Sales Automation Specialist, RevOps Manager, BDR, SDR | stub |
| [sales-crm-data-hygiene.md](sales-crm-data-hygiene.md) | Sales CRM Data Hygiene (deduplication and entity resolution, field ownership, write-governance, stale-data management, exception logging) | Data Enrichment Specialist, RevOps Manager, Sales Automation Specialist, SDR | stub |
| [sales-performance-analytics.md](sales-performance-analytics.md) | Sales Performance Analytics (KPI taxonomy, segmentation and cohorts, funnel leakage logic, meeting-quality analysis, velocity decomposition, benchmark governance) | Outbound Performance Analyst, RevOps Manager, VP Sales, Sales Manager, CRO | stub |

---

## Customer Success

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [customer-success-management.md](customer-success-management.md) | Customer Success Management (success plan architecture, lifecycle playbooks, executive/business reviews, renewal readiness, expansion signal handling, voice-of-customer loop, core retention metrics) | Customer Success Manager, Director of Customer Success, VP Customer Success, Onboarding Specialist | stub |
| [customer-health-scoring.md](customer-health-scoring.md) | Customer Health Scoring (health factor taxonomy, segment-specific profiles, thresholds and CTAs, weekly risk-review discipline, health-score pitfalls, executive risk outputs) | Customer Success Manager, Onboarding Specialist, Director of Customer Success, VP Customer Success, RevOps Manager | stub |
| [customer-onboarding-implementation.md](customer-onboarding-implementation.md) | Customer Onboarding & Time-to-Value (pre-kickoff handoff, kickoff and success criteria, milestone planning, adoption ramp, onboarding escalation rules, completion and handoff to steady state) | Customer Success Manager, Onboarding Specialist, Director of Customer Success, VP Customer Success | stub |

---

## Cold Email Outreach

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [cold-email-infrastructure.md](cold-email-infrastructure.md) | Cold Email Infrastructure (dedicated sending domain naming and acquisition protocol, SPF/DKIM/DMARC configuration with policy progression — p=none to p=reject, inbox warmup protocol — week-by-week volume ceiling and complaint rate checkpoints, inbox rotation architecture — mailbox-to-contact ratio and platform configuration, Google/Yahoo/Outlook 2025 bulk sender mandate requirements, P1/P2/P3 deliverability severity taxonomy with response actions, MailReach and GlockApps pre-campaign placement testing, bounce rate classification and list hygiene thresholds) | Cold Outreach Specialist | stub |
| [cold-email-copywriting.md](cold-email-copywriting.md) | Cold Email Copywriting (hook type taxonomy and performance benchmarks — timeline-based 10.01% vs. problem-statement 4.39% reply rate, optimal email length — 6–8 sentences, subject line framework — specificity vs. curiosity gap, preview text discipline, CTA constraint formula — one ask / max 30 words / constrained action, personalization quality test — "Would a human have written this?", spintax architecture patterns — word/phrase/sentence level, three-layer personalization stack — spintax + AI icebreaker + ICP variable tokens, A/B test design rules — one variable per test / 50 touch minimum, sequence exit criteria by reply type) | Cold Outreach Specialist | stub |

---

## Finance

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [finance-saas-metrics.md](finance-saas-metrics.md) | SaaS Metrics & Benchmarks | CFO, CEO, COO | stub |
| [finance-fundraising.md](finance-fundraising.md) | Fundraising Mechanics | CFO, CEO | stub |
| [finance-runway-management.md](finance-runway-management.md) | Runway & Cash Management | CFO | stub |

---

## Strategy (CEO)

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [strategy-market-timing.md](strategy-market-timing.md) | Market Timing & Entry | CEO | stub |
| [strategy-product-market-fit.md](strategy-product-market-fit.md) | PMF Signals & Validation | CEO, CTO, CMO | stub |
| [strategy-hiring-sequence.md](strategy-hiring-sequence.md) | Hiring Sequence by Stage | CEO, COO | stub |
| [strategy-fundraising-narrative.md](strategy-fundraising-narrative.md) | Fundraising Narrative | CEO | stub |

---

## Security

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [security-compliance-roadmap.md](security-compliance-roadmap.md) | Compliance Roadmap (SOC2, ISO, GDPR) | CISO | stub |
| [security-incident-response.md](security-incident-response.md) | Incident Response Playbook | CISO | stub |

---

## Legal

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [legal-startup-structure.md](legal-startup-structure.md) | Startup Legal Structure | CLO | stub |
| [legal-ip-protection.md](legal-ip-protection.md) | IP Protection Frameworks | CLO | stub |
| [legal-employment-law.md](legal-employment-law.md) | Employment & Contractor Law | CLO | stub |

---

## Product & UX

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [product-discovery.md](product-discovery.md) | Product Discovery Frameworks (Opportunity Solution Tree, RICE, OKR Alignment Gate) | Product Manager | stub |
| [product-pmf-signals.md](product-pmf-signals.md) | PMF Signals & Measurement Protocol (Sean Ellis, cohort retention, North Star, Pivot/Persevere) | Product Manager, CEO, CTO | stub |
| [ux-conversion-design.md](ux-conversion-design.md) | Conversion Design Patterns | Design CTO, CRO Specialist | stub |
| [ux-onboarding-patterns.md](ux-onboarding-patterns.md) | Onboarding Design Patterns | Design CTO, Product Manager, CRO Specialist | stub |
| [ux-usability-testing.md](ux-usability-testing.md) | Usability Testing Methods | Design CTO | stub |

---

## Marketing Automation

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [automation-lead-scoring.md](automation-lead-scoring.md) | Lead Scoring Architecture (dual-track explicit + implicit scoring, firmographic criteria taxonomy, behavioral action scoring with conversion-proximity weights, MQL threshold definition, score decay protocol — signal decay + strategy-change decay, predictive scoring decision gate, recalibration protocol, sales alignment sign-off checklist) | Marketing Automation Specialist, CMO | stub |
| [automation-nurture-architecture.md](automation-nurture-architecture.md) | Nurture Stream Architecture (behavioral nurture DAG structure, entry trigger types, standard stream definitions — Awareness/Consideration/Evaluation/Acceleration/Re-engagement, branch condition taxonomy, exit condition hierarchy, stream priority conflict resolution, nurture-to-lifecycle handoff rule, progressive profiling form strategy) | Marketing Automation Specialist, Email Marketing Manager | stub |

---

## Email Marketing

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [email-lifecycle-automation.md](email-lifecycle-automation.md) | Email Lifecycle Automation (5-stage DAG — Welcome/Onboarding/Activation/Retention/Win-back, entry triggers, email count, delay intervals, behavioral branch logic, exit condition taxonomy, sequence priority conflict resolution, global suppression list rules) | Email Marketing Manager, Marketing Automation Specialist | stub |

---

## Status legend

| Status | Meaning |
|---|---|
| `stub` | File exists with schema, content not yet researched |
| `draft` | Research done, awaiting HR approval |
| `approved` | HR-approved, production-ready |
| `stale` | Older than 90 days, scheduled for review |

---

## Sales Operations Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [sales-automation-workflows.md](sales-automation-workflows.md) | Sales Automation Workflows (routing logic, owner assignment, sequence enrollment and unenrollment governance, workflow changelog, exception handling) | Sales Automation Specialist, SDR, RevOps Manager, VP Revenue Operations, Sales Manager, Director of Sales | stub |
| [sales-coaching-enablement.md](sales-coaching-enablement.md) | Sales Coaching & Enablement (ramp milestones, scorecard calibration, call review protocol, role-play cadence, playbook governance) | Sales Enablement Manager, Sales Manager, Director of Sales, VP Sales | stub |

---

## Support & Service

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [support-incident-triage.md](support-incident-triage.md) | Support Incident Triage (severity taxonomy, first-response routing, reproducibility checklist, customer-impact scoring) | Support Specialist, Support Engineer, Support Manager, Director of Customer Success, VP Customer Success | stub |
| [support-knowledge-operations.md](support-knowledge-operations.md) | Support Knowledge Operations (KCS loop, article standards, gap logging, self-serve deflection review) | Support Specialist, Support Manager, Customer Training Specialist, VP Customer Success | stub |
| [support-escalation-management.md](support-escalation-management.md) | Support Escalation Management (SLA / OLA mapping, engineering handoff packet, executive escalation thresholds) | Support Engineer, Support Manager, Director of Customer Success, VP Customer Success | stub |

---

## Product & UX Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [product-delivery-governance.md](product-delivery-governance.md) | Product Delivery Governance (roadmap intake, dependency log, RAID tracking, release-readiness review) | VP Product, Director of Product, Technical Program Manager, Product Manager | stub |
| [product-ux-research.md](product-ux-research.md) | Product UX Research (test plan design, interview protocol, synthesis standards, usability evidence thresholds) | UX Designer, Director of Product, VP Product | stub |

---

## Engineering Platform Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [engineering-reliability-operations.md](engineering-reliability-operations.md) | Engineering Reliability Operations (SLI/SLO, incident command, rollback policy, postmortem quality, error budget review) | VP Engineering, Director of Engineering, Engineering Manager, SRE, Platform Engineer, Staff Engineer, DevOps Engineer, Systems Administrator, Network Engineer | stub |
| [engineering-platform-governance.md](engineering-platform-governance.md) | Engineering Platform Governance (paved road standards, environment conventions, access model, service ownership) | VP Engineering, Director of Engineering, Platform Engineer, Cloud Architect, Solutions Architect, Staff Engineer | stub |
| [engineering-mobile-release-governance.md](engineering-mobile-release-governance.md) | Mobile Release Governance (beta gates, crash-free threshold, release notes, store submission checklist) | Android Developer, iOS Developer, Mobile Developer, Embedded Engineer | stub |

---

## Data & AI Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [data-warehouse-architecture.md](data-warehouse-architecture.md) | Data Warehouse Architecture (layering model, data contracts, lineage, semantic definitions, orchestration boundaries) | Chief Data Officer, VP Data, Analytics Engineer, Data Engineer, DBA, Director of Analytics | stub |
| [data-quality-governance.md](data-quality-governance.md) | Data Quality Governance (freshness, completeness, schema-drift handling, anomaly triage, issue ownership) | Chief Data Officer, VP Data, Analytics Engineer, Data Engineer, Data Analyst, Director of Analytics | stub |
| [mlops-lifecycle.md](mlops-lifecycle.md) | MLOps Lifecycle (feature / training / serving consistency, validation gates, registry discipline, drift review) | ML Engineer, Data Scientist, Director of Data Science, VP Data, LLM Engineer, AI Engineer | stub |

---

## Security Engineering Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [security-application-engineering.md](security-application-engineering.md) | Application Security Engineering (threat modeling, secure code review, dependency risk, release gates) | Application Security Engineer, DevSecOps Engineer, Security Engineer, Director of Security Engineering | stub |
| [security-detection-response.md](security-detection-response.md) | Security Detection & Response (telemetry coverage, alert tuning, containment playbooks, evidence retention) | Incident Responder, SOC Analyst, Security Engineer, Threat Intelligence Analyst, Director of Security Engineering | stub |
| [security-vulnerability-management.md](security-vulnerability-management.md) | Security Vulnerability Management (finding intake, severity scoring, remediation SLA, exception tracking) | Vulnerability Analyst, Security Engineer, DevSecOps Engineer, Director of Security Engineering, Compliance Analyst | stub |

---

## Finance, IT & Operations Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [finance-planning-analysis.md](finance-planning-analysis.md) | Finance Planning & Analysis (driver tree, rolling forecast, scenario pack, variance commentary) | Chief Financial Officer, VP Finance, FP&A Analyst, Director of FP&A, Business Operations Analyst | stub |
| [finance-close-controls.md](finance-close-controls.md) | Finance Close & Controls (close calendar, reconciliations, approvals, evidence trails, adjustment rules) | Chief Financial Officer, VP Finance, Controller, Director of FP&A | stub |
| [operations-service-governance.md](operations-service-governance.md) | Operations Service Governance (request intake, workflow ownership, escalation path, vendor and internal service review) | Director of Operations, Operations Manager, IT Manager, Procurement Manager, Business Operations Analyst | stub |

---

## People & Talent Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [people-talent-acquisition.md](people-talent-acquisition.md) | Talent Acquisition Operations (scorecards, structured interview kits, sourcing funnel, quality-of-hire review) | Chief Human Resources Officer, Director of Talent Acquisition, Technical Recruiter, HR Business Partner | stub |
| [people-learning-development.md](people-learning-development.md) | Learning & Development (curriculum architecture, manager enablement, learning transfer, Kirkpatrick evaluation) | Chief Human Resources Officer, Director of L&D, L&D Specialist, Customer Training Specialist | stub |
| [people-compensation-performance.md](people-compensation-performance.md) | Compensation & Performance (band architecture, promotion evidence, review cycle, pay-equity checks) | Chief Human Resources Officer, Compensation & Benefits Manager, HR Business Partner | stub |

---

## Legal & Compliance Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [legal-contract-lifecycle.md](legal-contract-lifecycle.md) | Contract Lifecycle Management (template hierarchy, clause playbooks, approval routing, signature control, obligation tracking) | Legal Counsel, Paralegal, Director of Legal Contracts, Director of Compliance | stub |

---

## Brand & Communications Extensions

| Doc | Title | Applies to | Status |
|---|---|---|---|
| [partnership-channel-programs.md](partnership-channel-programs.md) | Partnership & Channel Programs (partner tiers, payout logic, brief standards, attribution, fraud checks) | Affiliate Marketing Manager, Influencer Marketing Manager, VP Marketing, Director of Demand Generation | stub |
| [brand-communications-operations.md](brand-communications-operations.md) | Brand & Communications Operations (message house, comms calendar, announcement workflow, issue escalation) | Brand Strategist, PR Manager, Podcast Producer, VP Brand Communications, VP Marketing | stub |

---
