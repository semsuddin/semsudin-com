---
title: "Shipping GenAI that survives production"
description: "Most enterprise AI never reaches production. The ones that do share a playbook. Here's what I learned architecting a multi-agent platform at Alfa Laval."
publishedAt: 2026-03-10
tags: ["AI Systems", "GenAI", "Architecture", "Production"]
readingTime: "7 min"
---

The dirty secret of enterprise GenAI is that most of it never reaches production. Not because the models don't work — they do. Because the systems around the models can't be operated.

I've spent the last two years architecting Alfa Laval's Alva platform — a multi-agent system orchestrating 10+ LLMs through a unified chat interface with RAG, tool-use, and streaming. In the process I got tired of seeing competent teams ship demos that never graduated. Here's the pattern I see, and what to do about it.

## The prototype-to-production cliff

The typical GenAI project looks great in a Jupyter notebook. A LangChain pipeline wired to GPT-4o, a vector store, a prompt that gets the right answer most of the time. Shipped.

Then reality:

- Who watches the token spend?
- What happens when the model is down?
- How do you audit which documents fed which answer?
- How do non-engineers change the prompt?
- What's the rollback if the new prompt regresses?

These aren't edge cases. They're every day. And they're the reason your prototype dies on the first contact with ops.

## The five things I wish more teams did

### 1. Treat the agent loop like a service, not a script

A ReAct agent is a state machine that can loop indefinitely. Give it timeouts. Give it iteration caps. Give it structured error boundaries between tool calls. Log every decision so you can replay failures.

### 2. Stream end-to-end, or die trying

The difference between "AI feels magical" and "AI feels broken" is often 3 seconds of perceived latency. If you buffer the response at any layer, you've lost the war. Stream from the model → through your orchestrator → to the UI, without serializing.

### 3. Observability is not optional

OpenTelemetry from day one. Trace every LLM call, every tool invocation, every RAG retrieval. When something goes wrong in production — and it will — you need to see the exact prompt, exact tokens returned, exact chain of reasoning. Application Insights, Langfuse, Helicone — pick one, but pick.

### 4. Identity per service

One service account for your API, another for your agent, another for your RAG worker, another for your admin panel. Grant each only what it needs. When you get breached — and enterprise AI *will* eventually be a target — the blast radius stops at the service boundary.

### 5. Image promotion, not direct prod builds

Your production container registry should never receive a direct build from a pipeline. Build to a staging registry, run E2E tests, promote the verified image. The moment you let `prod:latest` be built by CI, you've traded reliability for velocity you didn't actually gain.

## The uncomfortable part

None of this is new. Backend engineers have known it for twenty years. The uncomfortable part is that the AI ecosystem currently rewards shipping demos, not shipping systems. If you want to be the person who makes enterprise AI real, you have to be willing to do unfashionable work.

Write boring pipelines. Stream boring responses. Log boring traces.

Your CTO will thank you six months in, when the competitor's flashy agent is in a rollback loop and yours is still serving customers.

---

*If this resonates, I [take on architecture work](/contact) for companies shipping enterprise GenAI. Multi-agent systems, RAG pipelines, CI/CD for AI services — all the unglamorous things that turn prototypes into products.*
