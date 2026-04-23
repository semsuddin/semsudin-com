---
title: "Image promotion, not direct builds: the prod isolation pattern enterprise AI needs"
description: "Most CI/CD pipelines let production pull whatever your build server last produced. That's fine for marketing sites. For enterprise AI platforms, it's a recipe for 2am rollbacks. Here's the pattern I use instead."
publishedAt: 2026-03-04
tags: ["DevOps", "CI/CD", "AI Systems", "Container Security"]
readingTime: "6 min"
---

A pattern I find myself re-implementing on every serious AI platform engagement: **production container registries should never receive direct builds from CI**. They should only accept *promoted images* that have already been verified in a staging environment.

This sounds like infrastructure pedantry. It is actually the difference between sleeping through your oncall rotation and not.

## The default most teams ship with

Here's the pipeline you see in most real-world AI teams:

```
git push → GitHub Actions / Azure Pipelines → docker build → push to prod registry → prod pulls :latest
```

The prod registry is fed *directly* from CI. Every green build becomes a potential prod image. The actual prod deploy is then gated by a manual approval or a merge to `main`, but the image that's about to run in production is the *exact same artifact* that CI just produced moments ago, from the same build process, against the same Dockerfile, with the same layer cache.

For a marketing site, this is fine. For a GenAI platform handling customer data and calling $0.03-per-token models, it is a ticking clock.

## What goes wrong

Four failure modes I've seen repeatedly:

### 1. Supply chain compromise with full blast radius

If a dependency in your image is compromised (`actions/checkout` typosquat, malicious npm package pulled into your Python container via pip transitive dep, etc.), your next CI build pushes that compromised image directly into prod. The blast radius is whatever your prod service can reach — usually customer data, API keys in envs, downstream services.

If prod could only pull from a *promoted* registry, the compromise sits in staging waiting for your E2E tests or security scans to notice. You get time.

### 2. "Mostly green" CI that ships a bad image anyway

Green CI is a signal, not a guarantee. Tests can pass on a broken image: environment-specific behavior, missing env vars that don't show up until runtime, ML model weights that load locally but fail on the prod GPU pool.

With direct-build-to-prod, "tests pass, ship it" means the first time a human confirms the image actually *runs* is when prod users hit it. With image promotion, you've already run the image through staging where problems surface an hour before they touch a customer.

### 3. The "what's actually in prod?" audit hole

In direct-build models, identifying exactly what's running in prod at a given moment is harder than it should be. Yes, you have a tag. Yes, the tag points to a digest. But that digest came from a CI run that pulled a `:latest` base image, installed packages from a `requirements.txt` that resolved at a specific time, ran against a cache that may or may not have been warm.

The reproducibility of that exact image, three months later, is not guaranteed. Promoted images pin digests explicitly. You know what's running because you promoted it on a specific day, from a specific source.

### 4. The rollback that isn't

You discover a prod issue. You want to roll back to yesterday's working image. In a direct-build model, you re-run yesterday's commit's pipeline. The build… produces a different digest. Because a transitive dep got a patch release overnight. Because your base image moved. Because your cache was purged.

The "rollback" is actually a re-deploy of a subtly different artifact. For most bugs, fine. For security incidents, horrifying.

Promoted images are retrievable *by digest*, forever (within your registry's retention policy). Rollback is a 30-second operation to re-promote an older image to the prod registry.

## The promotion pattern

What I actually ship on enterprise platforms:

```
git push → CI builds → pushes to STAGING registry (e.g. acrstaging.azurecr.io)
                              │
                              ▼
                     Staging environment pulls and runs
                              │
                              ▼
                       E2E + security scans
                              │
                              ▼
                      [QA sign-off gate]
                              │
                              ▼
            Promotion job copies STAGING → PROD registry
                              │
                              ▼
                     Prod environment pulls
```

Concretely, on Azure with ACR, this looks like:

- Two separate ACRs: `acrstaging` (permissive push, anyone in CI can write) and `acrprod` (locked down, only a promotion service principal can push to it)
- A promotion pipeline stage that uses `az acr import` or `docker pull + tag + push` with a scoped identity
- The promotion is gated on: E2E test suite green, security scan clean, QA lead approval (for bigger changes)
- Prod compute has IAM that can only pull from `acrprod`, not `acrstaging`

On AWS with ECR the pattern is identical — two separate ECR repos, a Lambda or CodeBuild that does the promotion, scoped IAM that gates what prod can pull.

## The part that's harder than it looks

**Identity scoping.** The whole point collapses if your CI service principal can write to prod. It can't. You need a separate identity that only the promotion stage has access to, and you need that identity's credentials short-lived (workload identity federation is the right primitive here).

**Cache coherence.** If staging runs image `sha256:abc...` and the promotion copies it to prod, you want prod running the *same digest*, not a rebuild. Use registry-level import, not re-build.

**Retention.** Promoted prod images should be retained longer than staging ones. You want a 30-day rollback window minimum, usually 90.

**Base image pinning.** The promotion guarantee is meaningless if your Dockerfile says `FROM python:3.12` instead of `FROM python:3.12.2-slim@sha256:...`. Pin the digest of your base.

## When to skip it

I don't use this pattern on personal projects, marketing sites, or toys. The machinery overhead isn't worth the protection you're buying against low-stakes incidents.

I always use it when:

- The image handles customer data
- The image makes paid external API calls (LLMs, payment processors)
- The image has production credentials in its environment
- You are regulated (finance, health, anything with compliance obligations)

For enterprise GenAI, all four are usually true. Which is why every serious platform I've shipped has image promotion, and every flimsy one I've seen from outside has direct-build-to-prod.

---

*Architecting a production AI platform and unsure your CI/CD is trustworthy? [Let's talk](/contact). I'll walk through what's safe, what's not, and what the gap would cost to close.*
