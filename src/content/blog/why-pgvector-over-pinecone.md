---
title: "Why we picked pgvector over Pinecone"
description: "Every enterprise RAG project asks the same question: do we need a dedicated vector database? For Alva we chose pgvector. Here's the actual decision framework, not the marketing version."
publishedAt: 2026-02-10
tags: ["RAG", "pgvector", "Architecture Decisions", "AI Systems"]
readingTime: "7 min"
---

The default answer you hear at AI conferences right now is "use Pinecone, or Weaviate, or Qdrant." It's almost a reflex. Someone says "RAG" and the next five minutes are dedicated vector-database pitches.

We picked **pgvector** for the Alva platform at Alfa Laval. It's the right call for us, and it would be the right call for most enterprise teams reading this. Here's the reasoning I went through, not the polished version.

## What the decision actually looks like

When you're picking a vector store, you're balancing three things:

1. **Search performance at your scale** — will the thing be fast enough, now and a year from now?
2. **Operational overhead** — how many new systems will your ops team have to learn, monitor, back up, secure?
3. **Feature richness** — hybrid search, metadata filtering, namespaces, auth

Most RAG content online optimizes aggressively for #1 (performance) and #3 (features). Almost nobody weights #2 (operational overhead) properly, because the people writing the content aren't the ones who'll be paged at 2am when the vector store fails over badly.

## My scale calibration

pgvector is "good enough" up to a surprisingly high ceiling. Rough numbers from production experience:

- **Up to ~10M vectors at 1536 dimensions (OpenAI `text-embedding-3-small`)**: pgvector with HNSW indexing gives p95 query latency under 50ms on a modest Flexible Server. This covers the vast majority of enterprise knowledge bases.
- **10M-100M vectors**: pgvector with HNSW still works, but you'll be tuning index parameters and probably adding a read replica. Dedicated vector DBs start pulling ahead.
- **100M+ vectors**: you should probably be on a dedicated vector store. pgvector can handle it with aggressive partitioning but the operational burden starts to approach what a dedicated tool charges you to solve.

For Alva, our corpus was in the millions, not the tens of millions. pgvector is not remotely breaking a sweat.

## What we got for free by staying in Postgres

This is the part most "pick a vector DB" content undersells.

### 1. Transactional consistency with our relational data

Every document in our RAG pipeline has structured metadata: uploaded_by, uploaded_at, organization, access permissions, retention policy. That metadata already lives in Postgres tables. Having the embedding in the same database means a single query joins document metadata to embedding search results, with transactional consistency.

With a dedicated vector DB, you're managing two stores, synchronizing IDs between them, handling the case where the write to one succeeded but the other failed. Every enterprise team eventually has a bug from this. It's unnecessary.

### 2. Existing backups, auth, observability, SRE playbooks

Our Postgres is already backed up on a schedule. Already has role-based auth. Already has metrics dashboards in Azure Monitor. Already has a runbook our ops team knows.

Adding Pinecone means adding a new system with its own backup story, its own auth model, its own observability, its own runbooks. Multiply that across an enterprise's portfolio of systems and you see why ops teams resist new vendors.

### 3. Proper SQL for metadata filtering

A huge chunk of RAG quality comes from *metadata pre-filtering* before similarity search. "Find similar documents, but only where `org_id = X` and `uploaded_at > Y` and `document_type in ('policy', 'procedure')`."

In pgvector you write this in SQL and the query planner handles it:

```sql
SELECT id, content, embedding <=> $1 AS distance
FROM documents
WHERE org_id = $2
  AND uploaded_at > $3
  AND document_type = ANY($4)
ORDER BY embedding <=> $1
LIMIT 10;
```

Dedicated vector DBs all offer "metadata filtering" but the expressiveness, the composability, and the index behavior varies. SQL just works, and every engineer already knows it.

### 4. Standard ACID guarantees

When you delete a document for GDPR compliance, you want the embedding to go away in the same transaction. pgvector gives you that trivially. Separate vector DBs require application-level orchestration and eventual consistency guarantees you have to test.

## What we'd lose by picking Pinecone (or similar)

Let me be fair to the dedicated vector DBs.

**What we'd gain**: higher scale ceiling, sometimes lower p99 latency at very large scales, purpose-built APIs, some nice features like namespaces, built-in re-ranking in some products.

**What we'd lose**:

- A new vendor relationship (procurement, contract, security review)
- A new SLA to monitor
- Data residency questions (is our data crossing borders?)
- Egress costs to push embeddings back and forth
- A new query language / SDK in the app code
- A new failure mode (the vector DB is up but Postgres is down, or vice versa — what's the user-facing behavior?)
- An annual cost that, at our scale, exceeds the pgvector incremental infra cost by an order of magnitude

At our scale, the trade is bad. At much larger scale, it flips.

## The decision heuristic I actually used

Try pgvector first if:

- You're already running Postgres
- Your corpus is <50M vectors
- Your team is not specialized in vector databases
- You value operational simplicity over squeezing the last 10% of performance
- You want metadata filtering to be powerful and familiar

Pick a dedicated vector DB if:

- Your corpus is >100M vectors (be honest about current scale, not projected)
- You need features pgvector doesn't have (specific index types, built-in re-ranking, multi-tenancy with isolated namespaces at scale)
- You have an ops team comfortable running a new system
- Your latency budget genuinely can't absorb Postgres's additional overhead

Most enterprise teams are in the first bucket. They shouldn't be shopping for vector DBs. They should be using what they already run.

## The uncomfortable part

"Pick the exciting new tool" is a well-trodden career path. "Pick the boring thing that already exists" is a harder conversation with stakeholders who want the roadmap to sound innovative.

The trick is explaining that architectural restraint *is* the innovation. Alva ships to production because we didn't take on complexity we didn't need. Every team I've seen struggle with enterprise GenAI has a similar architectural bloat story — too many systems, too many integrations, too many vendors, not enough of a clear picture of what's actually in production.

pgvector is not cool. It just works. For RAG at enterprise scale, that's almost always the right trade.

---

*Architecting RAG and unsure whether you've over-engineered it? [Let's talk](/contact). I do architecture reviews and will tell you honestly where you have too much infrastructure, not too little.*
