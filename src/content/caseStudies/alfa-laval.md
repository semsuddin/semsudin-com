---
client: "Alfa Laval"
role: "QA Lead → Sr. SDET → AI Systems Architect"
period: "Feb 2018 – Present"
industry: "Industrial Manufacturing · Enterprise GenAI"
summary: "A seven-year, four-project engagement with Alfa Laval. From modernizing legacy test automation on the Anytime project to architecting their flagship GenAI platform (Alva), contributing across QA, DevSecOps, and AI systems."
metrics:
  - label: "Years engaged"
    value: "7+"
  - label: "Distinct projects"
    value: "4"
  - label: "Pipeline speed-up"
    value: "750%"
  - label: "LLMs orchestrated"
    value: "10+"
stack:
  - "LlamaIndex"
  - "FastAPI"
  - ".NET 8"
  - "C#"
  - "Playwright"
  - "Selenium"
  - "React"
  - "PostgreSQL"
  - "pgvector"
  - "Azure OpenAI"
  - "Azure DevOps"
  - "Bicep IaC"
  - "OpenTelemetry"
order: 1
featured: true
---

## Overview

Alfa Laval — the Swedish industrial giant in heat transfer, separation, and fluid handling — is the client I've contributed to longest. Across seven years I've delivered on four distinct initiatives, progressing from hands-on QA transformation into full AI systems architecture.

The common thread: shipping production-grade quality and production-grade AI at a company where downtime costs real money.

---

## Project 4 — Alva / Alfabeta Platform · AI Systems Architect (2024 – Present)

Alfa Laval's flagship enterprise GenAI platform. I architected the full stack end-to-end.

### What I shipped

- A **ReAct-style reasoning agent** on LlamaIndex with FastAPI, orchestrating **10+ LLMs** (GPT-4o, Claude Sonnet/Opus, Mistral, Llama, Grok, DeepSeek) through Azure AI Foundry
- **Full RAG pipeline** — document parsing (PDF, DOCX, PPTX, XLSX, OCR) → chunking → Azure OpenAI embeddings → pgvector retrieval
- **.NET 8 orchestrator** following Clean Architecture, brokering streaming responses end-to-end (Agent → API → React UI)
- **Azure infrastructure** — fully defined in Bicep IaC, with per-service RBAC, image-promotion pattern for ACR prod isolation, async Azure Functions for document embedding
- **Observability** — OpenTelemetry tracing, Application Insights, consolidated coverage across .NET (xUnit) and Python (pytest)
- **Unified CI/CD** across 7 services — single `Alva.yaml` with Detect / Build / Deploy / E2E stages, selective-component builds, parallel fan-out, QA sign-off gates
- **Admin Configuration Panel** — agents, models, terms, policies CRUD (React + .NET API)

**Why it matters:** most enterprise GenAI stalls at the prototype. This one reached production because it was designed for ops on day one.

---

## Project 3 — AzSupport · Senior SDET / DevSecOps (Feb 2022 – Mar 2023)

Supported cross-functional DevSecOps initiatives across Alfa Laval's Azure footprint.

- Set up **secure CI/CD pipelines** with automated tests and vulnerability scans baked into every deploy
- Configured **Azure DevOps agents** for diverse workloads (Windows, Linux, containerized)
- Collaborated with security specialists to embed OWASP and supply-chain best practices directly into pipelines
- Hardened test automation for regulated environments

---

## Project 2 — OneIB · Senior SDET (Feb 2021 – Feb 2022)

Built the scalable automation framework that became a reference implementation used across subsequent Alfa Laval projects.

- Developed a **C# + Playwright** framework for rapid UI and API validation
- Integrated into Azure DevOps CI/CD — parallelized execution, pull-request gated builds
- Reduced release cycle time by integrating automated validation at every merge
- Handed the framework pattern to the broader engineering org as a template

---

## Project 1 — Anytime · Test Automation Engineer (Feb 2018 – Feb 2020)

The first engagement — a rescue job on an aging test automation stack.

- Migrated from legacy tooling to a **Selenium-based C# framework**
- Rewrote test execution principles from the ground up — both solution architecture and test case management
- Established **Azure DevOps pipelines** for rapid feedback loops
- Result: **stability up ~300%**, **execution time down 750%**, initial setup time down by another 500%

---

## Why Alfa Laval keeps calling

Seven years, four projects, steadily expanding scope — from automation engineer to systems architect. The pattern isn't coincidence. When you build something that works, the next project lands on your desk.
