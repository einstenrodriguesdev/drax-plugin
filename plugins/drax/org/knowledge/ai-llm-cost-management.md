---
title: LLM Cost Management
version: stub
status: stub
applies_to: AI Engineer
created: 2026-04-25
review_by: 2026-07-25
---

# LLM Cost Management

> Stub created by HR agent during AI Engineer compilation (2026-04-25).
> Content to be populated by AI Engineer or HR during next research cycle.
> Sources to consult: OpenAI pricing documentation, Anthropic pricing documentation, Langfuse cost tracking docs, Medium AI Engineer cost stack 2025, production cost case studies.

---

## Scope

This document covers token budgeting, model routing, cost tracking, and cost optimization techniques for production LLM applications. It is loaded by the AI Engineer before finalizing any LLM integration or agent workflow architecture.

---

## Token Budgeting

> TO BE POPULATED

Key areas to cover:
- Token anatomy for a RAG call: system prompt tokens + context (retrieved chunks) tokens + user query tokens + output tokens
- Typical token breakdown by feature type: RAG Q&A, summarization, classification, agent multi-step
- Token counting before deploy: use `tiktoken` (OpenAI) or `anthropic.count_tokens` to measure actual token consumption per call on representative inputs — not estimates
- Context token vs. output token pricing asymmetry: input tokens cheaper than output tokens at OpenAI/Anthropic; output-heavy features (long form generation) have different cost profiles than retrieval-heavy features
- Per-call cost formula: (input_tokens × input_price_per_1k) + (output_tokens × output_price_per_1k)

---

## Model Routing Patterns

> TO BE POPULATED

Key areas to cover:
- Routing tiers (as of 2025 pricing landscape):
  - Tier 1 (classification, intent detection, binary decisions): GPT-4o-mini (~$0.15/1M input), Claude Haiku (~$0.25/1M input)
  - Tier 2 (summarization, extraction, structured output): GPT-4o-mini or Claude Sonnet 3.5
  - Tier 3 (complex reasoning, multi-step synthesis, high-stakes output): GPT-4o or Claude Sonnet
  - Tier 4 (frontier reasoning, research-grade output): o3, Claude Opus — justify every call
- Routing implementation: task_type field in LLM call wrapper → maps to model tier
- Dynamic routing: confidence-based escalation (Tier 1 output confidence < threshold → escalate to Tier 2)
- Routing at architecture time vs. runtime: most routing should be defined at architecture time, not inferred dynamically
- Routing documentation: every model assignment in AI_ENGINEER.md with rationale

---

## Cost-Per-Call Calculation

> TO BE POPULATED

Key areas to cover:
- Reference cost table (update quarterly — check provider pricing pages):
  - GPT-4o: $2.50/1M input, $10.00/1M output (as of mid-2025)
  - GPT-4o-mini: $0.15/1M input, $0.60/1M output
  - Claude Sonnet: $3.00/1M input, $15.00/1M output
  - Claude Haiku: $0.25/1M input, $1.25/1M output
- Cost calculation example: RAG call with 1,500 input tokens + 300 output tokens at GPT-4o-mini = ($0.15/1M × 1,500) + ($0.60/1M × 300) = $0.000225 + $0.000180 = $0.000405/call = $0.405/1,000 calls
- Context cost dominates in RAG: 50% or more of per-call cost is typically context (retrieved chunks) — top-k reduction is the highest-leverage cost lever
- Batch API pricing: OpenAI Batch API and Anthropic Batch API offer ~50% discount for non-real-time workloads (eval runs, background processing, bulk ingestion)

---

## Cost-Per-Feature Tracking

> TO BE POPULATED

Key areas to cover:
- Cost-per-feature vs. cost-per-call: cost-per-call is a building block; cost-per-feature (all LLM calls in a user session or workflow) is what maps to business budget
- Cost-per-user calculation: average LLM calls per user session × average cost per call = cost per user
- Unit economics gate: cost-per-user must be ≤ 10% of ARPU at target scale (heuristic — adjust for business model)
- Feature cost budget: set a monthly cost budget per feature in AI_ENGINEER.md before launch; track actuals in Langfuse
- Cost anomaly detection: sudden cost spike patterns (prompt injection causing long outputs, retry loop, runaway agent) and their Langfuse trace signatures

---

## Langfuse Cost Monitoring Setup

> TO BE POPULATED

Key areas to cover:
- Langfuse trace structure for cost tracking: model, usage.input, usage.output, usage.total (tokens), calculated_cost
- Daily cost dashboard: total cost per day, cost per feature/trace name, cost per model, P95 cost per call
- Alert configuration: daily budget alert (webhook → Slack/email when daily cost exceeds threshold)
- Cost by prompt version: comparing cost impact of prompt changes (longer few-shot examples increase input tokens)
- Self-hosted Langfuse (free tier for pre-PMF stage): setup on existing VPS; Langfuse OSS v3.x Docker Compose configuration
- Langfuse cloud vs. self-hosted: cost and data privacy tradeoff

---

## Optimization Techniques

> TO BE POPULATED

Key areas to cover:

### Caching
- Semantic caching: cache LLM responses for semantically similar queries (GPTCache, Redis with embedding similarity lookup)
- Exact match caching: cache responses for identical prompt + context combinations (Redis key = hash of prompt + context)
- Cache hit rate tracking: Langfuse custom metadata field; target ≥ 30% cache hit rate for query-heavy features
- Invalidation strategy: cache TTL by content freshness requirements

### Context Compression
- Chunk deduplication: remove redundant chunks before context assembly (cosine similarity > 0.95 → deduplicate)
- LLMLingua: token-level context compression (3–4× compression with <5% quality degradation on benchmarks)
- Summary-augmented retrieval: pre-generate chunk summaries at ingestion time; retrieve summaries first, expand only the top-1 chunk to full text

### Batching
- Embedding batch calls: OpenAI embeddings API accepts up to 2,048 inputs per request — always batch ingestion
- Background eval batching: use Batch API for CI eval runs (50% discount, no SLA requirement)
- Async processing: LLM calls for non-real-time features (report generation, batch summarization) use async queuing + Batch API

### Smaller Models for Sub-Tasks
- Intent classification before RAG: route to RAG pipeline only if intent classifier (Tier 1 model) determines it is a retrieval question — block small talk, out-of-scope queries from consuming full RAG pipeline cost
- Output structure extraction: after main LLM call, extract structured data using Tier 1 model rather than re-prompting the Tier 3 model

---

## References

- OpenAI pricing: https://openai.com/api/pricing/
- Anthropic pricing: https://www.anthropic.com/pricing
- Langfuse cost tracking: https://langfuse.com/docs/model-usage-and-cost
- OpenAI Batch API: https://platform.openai.com/docs/guides/batch
- LLMLingua context compression: https://llmlingua.com/
- GPTCache semantic caching: https://gptcache.readthedocs.io/
