---
title: LLM Evaluation
version: stub
status: stub
applies_to: AI Engineer
created: 2026-04-25
review_by: 2026-07-25
---

# LLM Evaluation

> Stub created by HR agent during AI Engineer compilation (2026-04-25).
> Content to be populated by AI Engineer or HR during next research cycle.
> Sources to consult: RAGAS documentation (ragas.io), DeepEval documentation, Arize Phoenix (arize.com), Langfuse evaluation docs, Anthropic/OpenAI evals guides.

---

## Scope

This document covers the methodology for evaluating LLM and RAG pipeline quality — from dataset construction through CI gate configuration. It is loaded by the AI Engineer before building any eval harness or establishing quality gates.

---

## Eval Dataset Construction Methodology

> TO BE POPULATED

Key areas to cover:
- Minimum dataset size by feature type: RAG Q&A (50 pairs), LLM integration (30 input/output pairs), agent workflows (20 multi-turn scenarios)
- Diversity requirements: topic coverage, difficulty distribution, edge cases, adversarial inputs
- Golden answer curation: who authors ground-truth answers, review process, staleness management
- Synthetic dataset generation: when to use LLM-generated datasets (speed vs. quality tradeoff), validation requirements for synthetic data
- Dataset versioning: how to version eval datasets alongside pipeline versions
- Production sampling: how to sample from production queries for eval dataset enrichment (PII scrubbing requirements)

---

## RAGAS Metrics

> TO BE POPULATED

Key areas to cover:

### Context Relevance
- Definition: proportion of retrieved context that is relevant to answering the question
- Calculation: LLM-as-judge scores each retrieved chunk for relevance to the question
- Acceptable thresholds by feature type: Q&A (≥0.70), decision support (≥0.80)
- Common causes of low score: naive chunking, over-broad retrieval, poor embedding model for domain

### Answer Faithfulness
- Definition: proportion of claims in the generated answer that are grounded in retrieved context
- Calculation: claim extraction from answer + grounding check against context
- Acceptable thresholds: Q&A (≥0.80), high-stakes decision support (≥0.90)
- Common causes of low score: LLM hallucinating beyond context, insufficient context retrieved, model confabulation on specific facts
- Relationship to Air Canada liability case: faithfulness score directly correlates with factual reliability risk

### Answer Relevance
- Definition: how well the generated answer addresses the original question
- Calculation: reverse-question generation + semantic similarity to original question
- Acceptable thresholds: Q&A (≥0.75), conversational (≥0.70)
- Common causes of low score: overly generic responses, answer addresses adjacent topic, prompt ambiguity

### Composite scoring and dashboard setup
- Weighted composite score construction
- Score trend visualization in Langfuse
- Threshold-setting methodology: start conservative, loosen based on user feedback data

---

## LLM-as-Judge Pattern

> TO BE POPULATED

Key areas to cover:
- When to use LLM-as-judge vs. deterministic metrics: subjective quality dimensions require LLM-as-judge; extractable facts can use deterministic checks
- Judge prompt design: rubric-based scoring (1–5 scale with criteria), binary classification (grounded / not grounded)
- Judge model selection: stronger model (GPT-4o / Claude Sonnet) for judge, cheaper model for feature
- Bias mitigation: position bias in pairwise comparison, self-evaluation bias (judge model = feature model)
- Calibration: human annotation subset to validate judge scores against human judgment
- Cost management: LLM-as-judge eval costs; sampling strategy for high-volume pipelines

---

## Evaluation-Driven Development

> TO BE POPULATED

Key areas to cover:
- Eval-first workflow: dataset before code (analogous to TDD)
- Iteration cycle: baseline score → identify lowest-scoring examples → diagnose root cause (chunking / retrieval / prompt / model) → fix → re-eval → compare delta
- Score regression protocol: which score drop triggers which investigation path
- Prompt A/B evaluation: how to compare prompt versions on the same eval dataset
- Chunking parameter grid search: systematic evaluation of chunk size + overlap combinations on eval set

---

## CI Eval Gate Setup

> TO BE POPULATED

Key areas to cover:
- GitHub Actions integration: eval script triggered on pipeline parameter changes (model change, chunking change, prompt change, index rebuild)
- Threshold enforcement: exit code 1 if any metric drops below baseline threshold → blocks deploy
- Eval dataset storage: versioned alongside code in `evals/[feature]/baseline.jsonl`
- Eval result storage: score history in `evals/[feature]/results/` — one file per run with timestamp
- Alert routing: score regression notification to AI Engineer and CTO
- Cost of running CI evals: RAGAS eval on 50 pairs costs approximately $0.05–0.15 at GPT-4o-mini judge pricing

---

## Baseline Thresholds by Feature Type

> TO BE POPULATED

Key areas to cover:
- Internal knowledge base Q&A (low stakes): CR ≥ 0.65, AF ≥ 0.75, AR ≥ 0.70
- Customer-facing chatbot (medium stakes): CR ≥ 0.72, AF ≥ 0.82, AR ≥ 0.75
- Decision support or compliance (high stakes): CR ≥ 0.80, AF ≥ 0.90, AR ≥ 0.80
- Reasoning for higher thresholds at higher stakes: Air Canada liability precedent

---

## References

- RAGAS documentation: https://docs.ragas.io/
- DeepEval documentation: https://docs.confident-ai.com/
- Arize Phoenix LLM evaluation: https://arize.com/llm-evaluation-platforms-top-frameworks/
- Langfuse evaluation docs: https://langfuse.com/docs/scores/overview
- Air Canada chatbot tribunal ruling (2024): public record — BC Civil Resolution Tribunal, Moffatt v. Air Canada
- Nature survey on AI production incidents (2023): https://www.nature.com/articles/s42256-023-00640-6
