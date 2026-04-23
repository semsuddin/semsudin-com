---
client: "Alfa Laval"
role: "AI Systems Architect"
period: "Feb 2021 – Present"
industry: "Manufacturing · Enterprise GenAI"
summary: "Architected Alva — a production multi-agent AI platform orchestrating 10+ LLMs through a unified chat interface. Built the full stack end-to-end: React UI, .NET 8 orchestrator, Python/FastAPI agent service, Azure infrastructure as code."
metrics:
  - label: "LLMs orchestrated"
    value: "10+"
  - label: "Services in pipeline"
    value: "7"
  - label: "Docker context reduced"
    value: "GB → MB"
  - label: "Architecture layers owned"
    value: "All"
stack:
  - "LlamaIndex"
  - "FastAPI"
  - ".NET 8"
  - "React"
  - "PostgreSQL"
  - "pgvector"
  - "Azure OpenAI"
  - "Bicep IaC"
  - "Azure DevOps"
  - "OpenTelemetry"
order: 1
featured: true
---

## The brief

Alfa Laval needed an enterprise-grade GenAI platform — not a prototype. One unified interface to route conversations across multiple LLM providers (OpenAI, Anthropic, Mistral, Meta, xAI, DeepSeek), with proper document understanding, tool use, and the observability that operations teams actually need.

## What I designed

A ReAct-style reasoning agent on **LlamaIndex** with **FastAPI**, fronted by a **.NET 8 orchestrator** following Clean Architecture, and a **React** UI. The orchestrator brokers streaming responses end-to-end so the user sees tokens as fast as the model produces them. The Python service handles tool-use: web search (Tavily), RAG retrieval, image generation (FLUX), analytics, and chart generation.

The **RAG pipeline** is the full stack: document parsing for PDF, DOCX, PPTX, XLSX, and images via OCR; chunking tuned per document type; embeddings via Azure OpenAI; vector retrieval from **PostgreSQL with pgvector**. Documents are processed async via **Azure Functions** so the chat API never blocks.

**Infrastructure is Bicep** — every resource, every RBAC assignment, every role grant parameterized per service identity (API, agent, MCP, RAG). **ACR prod isolation** uses an image-promotion pattern so prod only pulls verified Test images, never direct builds.

## What I shipped on the DevOps side

- **Unified CI/CD pipeline** across 7 services (BE, AI agent, UI, infra, MCP server, two RAG parsers) — single `Alva.yaml` with Detect / Build / Deploy / E2E stages.
- **Selective-component builds** — pipeline detects changed components and skips the rest, cutting build time significantly.
- **Parallel deploys** — fan-out across BE/AI/UI/MCP/RAG after infra, reducing wall time.
- **QA sign-off gate** between Test and Prod with partial-run handling for hotfixes.
- **Consolidated coverage reports** across .NET (xUnit) and Python (pytest) into a single Azure DevOps report.
- **Dockerfile optimization** — trimmed RAG service build context from multi-GB to MB via `.dockerignore` discipline.

## Outside core scope (range)

Delivered the **Admin Configuration Panel** — agents, models, terms, and policies CRUD with file upload for policy documents. React + .NET API + validation, merged to prod.

## Why it matters

Most enterprise GenAI stalls at the prototype. This one reached production because the architecture was designed for ops on day one: observability via OpenTelemetry and Application Insights, streaming latency management, structured error handling, identity-per-service, and an E2E test suite that catches regressions before customers see them.
