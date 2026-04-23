---
title: "The cost of self-healing QA (real numbers)"
description: "Everyone talks about AI-driven test automation. Almost nobody publishes the actual economics. Here's what self-healing tests cost and saved across 1000+ tests at Mars Petcare."
publishedAt: 2026-03-24
tags: ["AI-Driven QA", "Test Automation", "Economics", "Playwright"]
readingTime: "7 min"
---

The pitch for AI-driven QA goes like this: an agent watches your failing tests, figures out that a selector drifted, and auto-patches the test. You save engineering time. Everyone is happy.

The pitch leaves out the part where agents also make mistakes, cost money per run, and occasionally patch a test into silent uselessness.

I've been running this for about a year at Mars Petcare across six apps and roughly 1000 Playwright tests. Here is what it actually costs, what it saves, and when it's worth doing.

## The baseline (before)

Each engineer on the QA team was spending roughly **8 hours a week on maintenance toil**: selector updates, flake investigations, re-running builds to confirm a fix. Across a team of 4, that's 32 hours a week — close to a full FTE just keeping green what used to be green.

Failure modes broken down:

- **52%** of failures: selector drift (DOM change, new class names, dynamic IDs changing)
- **21%** of failures: timing / race condition flakes
- **15%** of failures: genuine regressions (the thing we wanted to catch)
- **12%** of failures: test bugs (bad assertion, wrong data)

Most of the work was on the 52% selector drift, which is the least intellectually interesting category.

## What the agents replaced

Three specific interventions:

1. **Selector self-healing** — when a test fails on an element-not-found error, agent pulls the current DOM, finds the closest match to the old selector, submits a PR with the fix.
2. **Flake quarantine** — agent re-runs intermittent failures 3 times, marks stably-failing as real, stably-passing as noise, and submits a retry annotation PR for the noise category.
3. **Test authoring from tickets** — when a ticket hits "Ready for QA," agent drafts a Playwright test that matches the acceptance criteria.

## The cost side

Per-month costs, at current usage:

| Item | Monthly |
|------|---------|
| LLM API calls (OpenAI + Claude mixed) | ~$180 |
| Agent infra (CF Workers + Lambda) | ~$25 |
| Storage (test artifacts, DOM snapshots) | ~$15 |
| Monitoring / observability | ~$20 |
| **Total** | **~$240** |

So about three grand a year to run the fleet.

## The savings side

Of the 8 hours/week/engineer baseline, I estimate the agents are reclaiming roughly **5 hours/week/engineer** — not all of it, because novel failures still need human judgment, and because PR review of agent output takes time too.

Five hours × 4 engineers × 48 weeks = **960 engineer-hours per year**.

At a fully-loaded cost of ~$100/hour (mid-range for senior QA), that's **~$96,000/year** in reclaimed time.

Net: ~$93,000/year positive. Roughly a 32× return on the AI spend.

## The catch

Two big ones.

### 1. Trust calibration takes months

For the first three months, the team did not trust agent-authored PRs. Reviews were slow and defensive. We shipped the same agent fixes humans were already making, and the humans double-checked everything. Net velocity: roughly break-even.

By month four, the team had internalized which patterns the agent reliably got right (simple selector updates, text matcher changes, waiting on attribute changes) versus which it got wrong (anything involving state, timing, multi-step flows). Reviews got fast for the reliable patterns. Velocity took off.

The lesson: **the savings don't compound until the humans have calibrated**. If you budget 0 months of trust-building, the agents lose you money.

### 2. Silent patch drift

The scariest category. The agent notices a test is failing, finds a "close enough" selector, patches the test, the test passes — but now the test is validating something subtly different than intended.

Example: the agent finds a button with the same text but in a different modal. The test passes, but it's no longer testing the flow you wrote it for.

Mitigation: every agent-authored PR has to explain *what it thinks changed* and *what it thinks the test still validates*. A human reads that claim and agrees or rejects. You cannot ship this without review. If you allow auto-merge, you'll eventually get a test suite that is 100% green and 40% wrong.

## When it's worth doing

Based on the math, self-healing QA pays off when:

- You have **at least ~500 automated tests** that currently see drift-driven maintenance
- You have **engineers who can review agent PRs competently** (so you need technical QA, not just manual testers)
- You have **a CI pipeline observable enough** for an agent to read, reason about, and act on (structured test output, flake history, DOM snapshots on failure)
- You have **tolerance for a 2-3 month calibration period** before savings show

It does *not* pay off when:

- Your suite is small (<200 tests) — the absolute dollar savings won't exceed the API cost + review overhead
- Your test suite is mostly flaky for *architectural* reasons (tests that need data setup, third-party services, test environment instability) — those aren't selector problems, and agents can't fix them
- You don't have a human review gate and think you'll turn on auto-merge to "really save time"

## The bottom line

Self-healing QA isn't magic. It's a targeted replacement of mechanical work, budgeted in dollars and hours, with real costs and real limits. At the scale we run it (1000+ tests, 4 engineers), the math is unambiguously positive — roughly a 32× return. At smaller scales it's a wash. At scales without proper CI observability, it's negative.

The "AI will replace your QA team" narrative is nonsense. The "AI will make your good QA team substantially more leveraged" narrative is true, and has numbers behind it.

---

*Running the math on AI-driven QA for your team? [Let's talk](/contact). I'll tell you honestly whether it's worth your scale.*
