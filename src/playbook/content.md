# The Enterprise GenAI Reliability Checklist

*Forty-two things to verify before shipping an AI system to production.*

---

By **Šemsudin Sefić** — AI Systems Architect
[semsudin.com](https://semsudin.com) · [hello@semsudin.com](mailto:hello@semsudin.com)

---

## Why this exists

Most enterprise GenAI projects fail at the same gate: **the transition from prototype to production**. The models work. The demos look great. The thing just can't be operated.

This checklist is what I actually run through when architecting or reviewing a production AI system. Forty-two items, six categories, each one representing a real incident I've seen in the wild or narrowly avoided.

If you check every box, you're not *guaranteed* a clean production rollout. But if you *can't* check most of these boxes, you're almost certainly going to have a bad month after launch.

---

## 1. Observability

Without this, every incident becomes a guessing game.

- [ ] **1.1** Every LLM call is traced end-to-end (OpenTelemetry, Langfuse, or equivalent). You can retrieve the exact prompt, response, token usage, and latency for any historical request within 90 days.
- [ ] **1.2** Every tool invocation by an agent is logged with input, output, and decision context. You can replay a failed reasoning chain.
- [ ] **1.3** RAG retrievals are logged — the query, the top-k chunks returned, the similarity scores. You can audit "why did the model answer with X" after the fact.
- [ ] **1.4** Cost per user, per feature, per tenant is measurable in near-real-time. You will get a cost surprise in production. Make it visible within minutes, not weeks.
- [ ] **1.5** Latency P50/P95/P99 is dashboarded for every user-facing AI operation. Degradation is paged within minutes.
- [ ] **1.6** Error rates are segmented by cause (model provider error, tool error, retrieval miss, parsing failure) so on-call can route the fix.
- [ ] **1.7** The frontend logs *perceived* latency (time-to-first-token, time-to-complete) separately from backend latency, since streaming means they diverge.

## 2. Reliability & resilience

Your model provider WILL have outages. Your RAG store WILL time out. Plan for it.

- [ ] **2.1** Every LLM call has a timeout. If you don't know the number, it's too high.
- [ ] **2.2** Every agent loop has a maximum iteration count. No infinite tool-calling loops.
- [ ] **2.3** At least one fallback model is configured for critical user flows (e.g., GPT-4o primary, Claude secondary). Failover tested under load, not just in a staging click.
- [ ] **2.4** Tool failures are catchable at the agent level. The agent degrades gracefully ("I couldn't complete the web search, but here's what I know") rather than erroring out.
- [ ] **2.5** Retry logic has bounded backoff and honors retry-after headers from providers. You are not DDOSing Anthropic at 3am.
- [ ] **2.6** Long-running operations (document processing, embedding generation) run asynchronously via a job queue, not in the request path.
- [ ] **2.7** There is a tested runbook for "our primary LLM provider is down." You have run this drill.

## 3. Identity & access

Service compromise should be survivable. Don't share identities.

- [ ] **3.1** Each service (API, agent service, RAG worker, admin panel, batch processor) has its own identity (service principal, workload identity, IAM role).
- [ ] **3.2** Permissions are scoped to what each service needs. The RAG worker cannot create users. The chat agent cannot delete data.
- [ ] **3.3** Secrets (API keys, DB passwords) are in a vault (Key Vault, Secrets Manager), not in envs, not in code, not in config files.
- [ ] **3.4** Secrets rotation is automated or scheduled. You know when each one last rotated.
- [ ] **3.5** LLM API keys are scoped per environment (separate keys for dev, staging, prod) so revocation of a leaked dev key doesn't take down prod.
- [ ] **3.6** Every production data mutation is audit-logged with actor, time, and intent.
- [ ] **3.7** PII (if you handle it) is classified and access is logged. You can answer "who has seen this customer's data in the last 30 days."

## 4. Data pipeline hygiene

RAG quality is 80% about the data, 20% about the retrieval.

- [ ] **4.1** Documents are versioned. When the source updates, the old embeddings are invalidated, not orphaned.
- [ ] **4.2** Chunking strategy is document-type aware (PDF structural, DOCX section-based, spreadsheets cell-grouped). Not a blanket 512-token slice.
- [ ] **4.3** Embeddings are regenerable from source. You have not lost the ability to re-embed your corpus if the model is deprecated.
- [ ] **4.4** Retrieval quality is evaluated with a fixed test set of queries. You know how a retrieval change affects quality *before* you ship it.
- [ ] **4.5** The RAG index is backed up on the same cadence as your primary database.
- [ ] **4.6** There is metadata filtering (by tenant, by document type, by date range) before similarity search. You are not doing naive top-k over an entire corpus.
- [ ] **4.7** For user-submitted documents: there is a content safety scan before embedding and storage.

## 5. CI/CD & deployment

Shipping safely is almost the entire job.

- [ ] **5.1** Every image promoted to production has been verified in staging. Prod registry only accepts promoted images, not direct CI builds.
- [ ] **5.2** Deployments are rollback-able by digest, not by redeploying a source commit.
- [ ] **5.3** Model provider version is pinned. You know exactly which `gpt-4o` snapshot is in prod.
- [ ] **5.4** Prompt changes go through the same review gates as code changes. Prompts are versioned with the code, not edited in a UI with no audit trail.
- [ ] **5.5** E2E tests run against the full agent loop, not just unit tests of individual tools.
- [ ] **5.6** Load tests verify the service holds up at 2-3× expected peak. Streaming responses do not starve under concurrency.
- [ ] **5.7** Deployment is progressive (canary, percentage rollout) for user-facing AI changes. A bad prompt reaches 100% of users gradually, not instantly.

## 6. Cost & abuse

AI services cost real money and attract creative abuse.

- [ ] **6.1** Per-user rate limits are in place. A single user cannot bill you $10K in a day.
- [ ] **6.2** Maximum tokens per request is capped. A malicious prompt cannot extract arbitrary context.
- [ ] **6.3** Prompt injection defenses are in place for user-facing chat surfaces. You have tested common injection patterns.
- [ ] **6.4** Output filtering exists for sensitive categories if you ship to regulated verticals (PII, medical, legal).
- [ ] **6.5** Cost alerts page on-call if daily spend exceeds N× rolling average.
- [ ] **6.6** Caching is in place for deterministic prompts. Identical queries don't pay for identical answers twice.
- [ ] **6.7** Batch / bulk operations run on cheaper or async pricing tiers, not the premium real-time path.

---

## Scoring

- **40-42 checked**: You are operationally ready. Ship with confidence.
- **35-39 checked**: Close. Identify the unchecked items and fix them before launch.
- **25-34 checked**: This is most teams. Your launch will surface the gaps within the first quarter. Prioritize.
- **< 25 checked**: You are shipping a demo, not a product. Do not put customer traffic on this yet.

---

## What to do next

If you went through this and discovered gaps, you're not alone — most enterprise AI projects have five to ten unchecked boxes on first review. The question is whether you close them before launch or after.

I do architecture reviews for enterprise AI systems in this exact format: a structured walkthrough of your current setup against this checklist, followed by a prioritized written report of what to close first, what can wait, and what you can safely accept as is.

If that would be useful, [book 30 minutes](https://calendly.com/sefic91/30min) and we'll find out.

---

*© 2026 Šemsudin Sefić · [semsudin.com](https://semsudin.com) · [hello@semsudin.com](mailto:hello@semsudin.com)*
