---
title: RAG Pipeline Design
version: stub
status: stub
applies_to: AI Engineer
created: 2026-04-25
review_by: 2026-07-25
---

# RAG Pipeline Design

> Stub created by HR agent during AI Engineer compilation (2026-04-25).
> Content to be populated by AI Engineer or HR during next research cycle.
> Sources to consult: Weaviate documentation (weaviate.io/blog), LangChain RAG documentation, RAGAS documentation (ragas.io), Anthropic/OpenAI embedding guides.

---

## Scope

This document covers the end-to-end design of Retrieval-Augmented Generation (RAG) pipelines for production deployment. It is loaded by the AI Engineer before designing or modifying any RAG pipeline.

---

## Chunking Strategy Decision Tree

> TO BE POPULATED

Key areas to cover:
- Fixed-size splitting: when it is acceptable (homogeneous short documents, pre-structured data), when it fails (long-form prose, legal documents, technical manuals with cross-references)
- Recursive character splitting: parameters (chunk size, overlap), boundary-aware behavior, recommended defaults by document type
- Semantic chunking: sentence-transformer-based splitting, computational cost tradeoff vs. retrieval quality gain, when the latency cost is justified
- Paragraph-aware splitting: HTML/Markdown structure preservation
- Decision tree: document length × document structure × retrieval latency budget → chunking method

---

## Embedding Model Selection Criteria

> TO BE POPULATED

Key areas to cover:
- OpenAI text-embedding-3-small vs. text-embedding-3-large: dimensionality, cost, quality tradeoff
- Sentence-transformers (open source): all-MiniLM-L6-v2, all-mpnet-base-v2 — use cases and limitations
- Domain-specific embedding models: when generic models fail (legal, medical, code)
- Dimensionality reduction: Matryoshka Representation Learning (MRL) — when to use
- Selection criteria matrix: domain × latency budget × cost constraints → model recommendation

---

## Similarity Metric Selection

> TO BE POPULATED

Key areas to cover:
- Cosine similarity: normalized vectors, best for most text embedding use cases, default recommendation
- Dot product: faster computation, requires normalized vectors for correct behavior; when to prefer
- Euclidean distance: magnitude-sensitive, rarely preferred for text; when it is appropriate
- Vector DB defaults and how to override

---

## Top-K and Reranking Patterns

> TO BE POPULATED

Key areas to cover:
- Top-k initial retrieval: recommended range (10–20 pre-rerank)
- MMR (Maximum Marginal Relevance): algorithm, lambda parameter, when to apply (redundant corpus)
- Cross-encoder reranking: higher quality, higher latency; when the quality gain justifies the cost
- Final top-k for context assembly: 3–5 (Stanford "lost in the middle" constraint)
- Hybrid search: dense + sparse (BM25) retrieval; when keyword matching supplements semantic retrieval

---

## Context Assembly Protocol

> TO BE POPULATED

Key areas to cover:
- Ordering: most relevant chunk first (lost-in-the-middle mitigation)
- Metadata injection: document source, date, section header — when to include in context
- Separator and delimiter design: preventing chunk boundary confusion in the LLM
- Token budget allocation: context tokens vs. output tokens vs. system prompt tokens
- Context compression: LLMLingua and similar approaches for context length reduction

---

## RAG Triad Evaluation Setup

> TO BE POPULATED

Key areas to cover:
- Context Relevance: definition, calculation method, acceptable threshold by use case
- Answer Faithfulness: definition, calculation method (claim extraction + grounding check), acceptable threshold
- Answer Relevance: definition, calculation method, acceptable threshold
- Combined score interpretation: which dimension is most critical by feature type (Q&A vs. summarization vs. decision support)
- Baseline dataset construction: sample size requirements, diversity requirements, golden answer curation

---

## RAGAS Configuration

> TO BE POPULATED

Key areas to cover:
- Installation and setup: `pip install ragas`
- Dataset format: `question`, `answer`, `contexts`, `ground_truth` JSONL schema
- Running an eval: `evaluate(dataset, metrics=[context_relevancy, faithfulness, answer_relevancy])`
- CI integration: how to run RAGAS in a GitHub Actions / CI pipeline
- Score interpretation and threshold-setting methodology
- Upgrading to LLM-as-judge scoring for higher precision at scale

---

## References

- Weaviate chunking strategies: https://weaviate.io/blog/chunking-strategies-for-rag
- RAGAS documentation: https://docs.ragas.io/
- Stanford "Lost in the Middle" (2023): https://arxiv.org/abs/2307.03172
- LangChain RAG documentation: https://python.langchain.com/docs/use_cases/question_answering/
- OpenAI Embeddings documentation: https://platform.openai.com/docs/guides/embeddings
