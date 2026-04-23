---
title: "The RAG patterns I keep reaching for"
description: "Not every RAG needs to be hybrid. Not every hybrid needs to be graph. Here's the decision tree I use when designing retrieval for enterprise AI — from vanilla pgvector to knowledge-graph traversal."
publishedAt: 2026-01-18
tags: ["RAG", "AI Systems", "pgvector", "Graph-RAG"]
readingTime: "8 min"
---

RAG discourse online is noisy. Every week someone on Twitter announces the new "RAG killer." Meanwhile, in enterprise, teams are still debugging chunking strategies and wondering why the model keeps hallucinating about their own documentation.

I've been building retrieval pipelines for Alfa Laval's Alva platform — multimodal document understanding, pgvector at scale, tool-use integration — and the mistake I see most often is **teams reaching for exotic architectures before they've exhausted the basics**.

Here's the decision tree I actually use.

## Step 1: Start with honest vector RAG

Ninety percent of enterprise use cases are solved by:

- A decent embedding model (`text-embedding-3-small` or -large from OpenAI)
- Reasonable chunking (512–1024 tokens, 10–20% overlap, respect semantic boundaries)
- PostgreSQL with `pgvector`
- A similarity search with top-k ≈ 5–10
- A prompt that says "Answer using only the provided context; if you can't, say so."

If this doesn't work for your corpus, it is almost always because **your chunks are bad** — not because you need a graph database.

## Step 2: Improve the chunking before you improve the architecture

The biggest quality leaps I've seen came from:

- **Structural chunking**: respect headings, paragraphs, list items. Don't blindly split every 512 tokens.
- **Chunk + summary pair**: store a small LLM-generated summary of each chunk alongside the chunk itself. Embed the summary, retrieve the chunk.
- **Metadata filtering**: attach document type, source, date, author. Filter *before* similarity search.
- **Query rewriting**: use a small model to expand the user query before retrieving.

This is free performance. Do it before you do anything exotic.

## Step 3: Hybrid search (sparse + dense)

When your users ask questions with specific IDs, jargon, product codes, acronyms — dense embeddings alone will struggle. Keyword search (BM25, full-text) complements them.

In pgvector-land: combine a full-text search score with a cosine similarity score. Tune the weight. Done.

## Step 4: Re-ranking

Retrieve 20, re-rank to top 5. A cross-encoder (like `bge-reranker-base` or a Cohere Rerank API call) sharpens what the top-k actually deserves. Cheap. Worth it.

## Step 5: *Now* consider graph-RAG

If — and only if — your domain is genuinely relational:

- Legal: entity relationships, clause references, citations
- Pharma / healthcare: drug interactions, genes, pathways
- Enterprise knowledge: org charts, approvals, dependencies
- Product catalogs: parts, compatibilities, variants

…then graph-based retrieval (Neo4j, Neptune, or pgvector + Apache AGE) earns its complexity. Build a knowledge graph, use it to *guide* the vector search or *expand* the retrieval context via traversal.

Most teams will not benefit from graph-RAG. If you're considering it, first prove that vanilla vector RAG is your bottleneck.

## Where I've landed for Alva

For the Alfabeta platform:

- **pgvector** on PostgreSQL (we're Azure-native, already running Flexible Server)
- **Per-document-type chunking** strategies (PDFs, slides, spreadsheets each get their own)
- **Azure OpenAI embeddings** (`text-embedding-3-large`)
- **Re-ranking layer** for high-stakes queries
- **No graph yet** — because vanilla + good chunking + re-ranking cleared the bar

That's not a concession to simplicity. That's the right architecture for the problem. The day we hit a use case where graph traversal actually helps, we'll add it. Not before.

## The takeaway

RAG architecture is not a flex. It's a tool. Start simple. Make the chunks good. Add hybrid search. Add re-ranking. *Then*, if your domain demands it, reach for the graph.

Every layer of complexity you add is a layer your ops team will eventually have to operate.

---

*Building enterprise RAG and unsure if you've over- or under-engineered it? I do architecture reviews — [book 30 minutes](/contact) and I'll tell you honestly.*
