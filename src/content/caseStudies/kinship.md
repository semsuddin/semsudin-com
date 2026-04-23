---
client: "Mars Petcare — Kinship & AdoptAPet"
role: "Senior QA Engineer · AI-Driven QA Lead"
period: "Oct 2023 – Mar 2025"
industry: "MarTech · Consumer"
summary: "Built a multi-app Playwright framework from scratch covering 6 projects across two Mars Petcare brands. Pioneered AI-driven QA agents that auto-generate test plans, create tests from work items, and self-heal failing suites."
metrics:
  - label: "Automated tests"
    value: "1000+"
  - label: "Apps covered"
    value: "6"
  - label: "Auth pass rate"
    value: "20% → 100%"
  - label: "Regions supported"
    value: "US + UK"
stack:
  - "Playwright"
  - "TypeScript"
  - "GitHub Actions"
  - "AWS S3"
  - "Slack API"
  - "Iterable API"
  - "Auth0"
  - "Back4App"
  - "Laravel Livewire"
  - "AI Agents (Claude/GPT)"
order: 2
featured: true
---

## The brief

Two Mars Petcare brands (Kinship and AdoptAPet) needed enterprise-grade test automation across web and mobile, with proper analytics verification, CRM audit trails, and CI/CD that doesn't waste compute on irrelevant changes.

## What I built

**Region-aware page object model** supporting US/UK variants with shared component inheritance — one test definition, multiple region executions. **Dual-auth strategy**: API-based and browser-based auth state generation for pre-authenticated flows across both apps. **Dual CRM verification pipeline** (Iterable + Central Profile API) for signup source attribution audits. **Custom Playwright reporters** for S3-hosted HTML reports and Slack CI notifications.

**CI/CD** with smart change detection — the pipeline only runs suites affected by the diff. Parallel matrix execution on self-hosted runners. Scheduled nightly and weekly runs for full regression coverage. Brought the AuthAAP authenticated tests from 20% flaky pass rate to 100% reliable.

## AI-driven QA — what most people aren't doing yet

Built custom AI agents integrated into the dev cycle:

- **Test plan generation** — agents explore the UI, map user flows, generate test plans automatically
- **Test authoring from work items** — agents read the ticket, understand the acceptance criteria, produce a Playwright test
- **Self-healing** — when a selector breaks, the agent analyzes the DOM change and updates the test
- **Pipeline progression** — agents move tickets through stages based on test outcomes
- **Security + performance scans** — agents flag OWASP top-10 vulns and performance regressions inline in PRs
- **Code fix proposals** — agents submit PRs for simple fixes directly

The outcome: substantially less manual QA effort, faster delivery, and regressions caught before they reach main.

## Why it matters

This isn't "AI that writes tests for you." It's AI integrated into the quality loop — as a collaborator that handles the mechanical work so humans can focus on the judgment calls. Most teams are still writing their first Playwright tests by hand. This is the next layer up.
