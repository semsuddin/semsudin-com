---
title: "AI agents in QA: past the hype, into the loop"
description: "Most 'AI for QA' tooling is bolted on. Here's what it looks like when AI agents are integrated into the development cycle — from test generation to self-healing to PR fixes."
publishedAt: 2026-02-22
tags: ["AI-Driven QA", "Test Automation", "AI Agents", "Playwright"]
readingTime: "6 min"
---

I'm tired of "AI for QA" demos that amount to a chatbot that writes a brittle Cypress test from a prompt. That's not the future. That's a toy.

The future — which I've been shipping at Mars Petcare across six apps — is AI as a *participant in the quality loop*. Not a tool you invoke. A collaborator that lives alongside your humans, watches the pipeline, and does work.

## What "AI in the QA loop" actually looks like

Four integrations that change how a team operates:

### 1. Test plan generation from UI exploration

An agent opens the app, navigates it, builds a site map, identifies user flows, and produces a test plan before a human has touched it. Not test code yet — a plan. Coverage gaps become visible before anyone writes a line of Playwright.

### 2. Test authoring from work items

When a ticket moves to "Ready for QA," an agent reads the acceptance criteria, reviews the related code changes, and proposes a Playwright test that validates the new behavior. The human reviews, tweaks, merges.

### 3. Self-healing on selector drift

Selectors break. Always. Instead of red CI nagging a human, an agent analyzes the DOM change, identifies the new locator, and patches the test. It opens a PR with the fix and a diff showing what moved. Humans approve.

### 4. Inline vulnerability + performance flagging

Agents crawl PRs for OWASP top-10 red flags, performance regressions, and obvious security mistakes. They comment inline. Sometimes they fix. Always they escalate.

## What this does to the team

Two things, and they surprised me:

**First,** manual QA effort collapses. Not to zero — humans are still needed for judgment, exploratory testing, accessibility, UX. But the mechanical layer (test authoring, maintenance, regression triage) goes from 70% of the team's time to 20%.

**Second,** the remaining QA work gets *harder* in a good way. Your humans are no longer writing `click(button).expect(modal)` loops. They're designing test strategy, critiquing agent output, catching the weird stuff AI misses. That's a better job.

## What it does *not* do

It does not replace senior QA judgment. It does not catch novel, spec-ambiguous defects well. It does not replace humans in user testing or accessibility work. Anyone selling you "fully autonomous QA" is selling you a regression waiting to happen.

## What you need to make this work

1. A strong deterministic test framework underneath. Mine is Playwright with strict TypeScript. You cannot build reliable AI-driven QA on a brittle foundation.
2. Proper CI with observable runs. Agents need to read CI output to learn.
3. A human review gate on every agent-authored change. Trust but verify.
4. Version-pinned model choices. Yes, model upgrades will regress your prompts. Test them like any other dependency.

## Where this goes

The top-of-funnel test authoring question is mostly solved within 18 months. The interesting work moves *up the stack*: AI agents that reason about test strategy, that prioritize what to cover, that propose architectural changes to make code more testable.

If you're still writing Playwright tests by hand in 2027, you're doing it for fun, not for velocity.

---

*If you're leading a QA org and want to pressure-test where AI fits, [book a call](/contact). I've done this end-to-end and can shortcut a lot of the learning.*
