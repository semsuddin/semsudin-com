---
title: "Seven years, one client: what repeats me"
description: "The same client has kept hiring me across four different projects, from a Selenium migration to a multi-agent GenAI platform. Here's what I think actually drives that, and why most consultants never see it."
publishedAt: 2026-04-08
tags: ["Consulting", "Client Relationships", "Career"]
readingTime: "6 min"
---

In 2018 I started a QA automation rescue for Alfa Laval. It was supposed to be a short engagement. Eight years later I'm still contributing — now as the architect of their enterprise GenAI platform.

Four projects, one client, a steady expansion of scope. I've been asked often enough what I think drives it that I want to write the answer down. Partly for myself, partly because the pattern is not what most people assume.

## What it's not

It's not loyalty. Enterprises are ruthless about vendor decisions. Every project goes through procurement; every hire gets benchmarked; every renewal is justified against what else is on the market. If a new engineer with a shinier deck can demonstrate equal value at a lower rate, they win. That's the job of a CTO.

It's not price. I am not the cheapest person they could hire.

It's not being local. I'm in Sarajevo. They're in Sweden. Half the meetings are async.

It's not a contract lock-in. Every engagement has been a discrete scope of work with a clean exit.

So what is it?

## What actually repeats me

Three things, and they compound.

### 1. The handoff is clean

When I finish a project, I don't leave a crater. The framework I built on OneIB in 2021 was picked up by three other teams after I rotated off. The pipeline I wrote on AzSupport is still running, still understood by engineers who've never met me. The Bicep IaC on Alva has comments explaining the *why* of every non-obvious RBAC grant.

This sounds like table stakes. It is not. The number of senior engineers who leave behind code that requires them to be on call forever is enormous. Their mistake is that they confuse tribal knowledge with job security. It's the opposite. The engineer who can leave cleanly is the engineer a client brings back, because the client doesn't resent what you left behind.

### 2. The scope grows, but I refuse to own what I shouldn't

On the Alva project I ship end-to-end: Python agent, .NET orchestrator, React UI, Azure infra, CI/CD. I could keep expanding — "I'll also write the marketing site," "I'll also own the product roadmap." I don't. There are roles on the team owned by people better at those things than me, and my job is to make them look good, not to absorb their scope.

The principle: own as much as you can do excellently, refuse anything that would dilute your signal. Clients re-hire specialists. They don't re-hire generalists who stretched into areas where they were mediocre.

### 3. I tell them the truth early

If an architecture is wrong, I say it in week one, not month three when I'm sunk enough to be polite. If a deadline is unreasonable, I push back when I can still renegotiate. If a request is outside what I should be touching, I refer them to someone better.

Clients are used to vendors who say "yes" to stay in the room. They notice, vividly, the ones who say "no" to protect the outcome. The engineer who delivers a slightly disappointing truth in week one outperforms the engineer who delivers a catastrophically disappointing delay in month six, and every enterprise decision-maker knows this from experience.

## What this looks like in practice

When Alfa Laval asked if I could architect Alva, I could have overstated my LlamaIndex experience. I'd have sounded confident. I might have gotten the project.

I said something closer to: "I've done production RAG on a smaller scale, I'm strong on the architectural primitives, but this specific framework combination I'd be learning on the job in the first two weeks. If that's acceptable, let's do it. If you want someone already deep in LlamaIndex, I can recommend two people."

They said yes. The project shipped.

The lesson I took: the admission of a gap *was* the credential. It proved I could be trusted to tell them what I didn't know, which means they could trust what I said I did know.

## The uncomfortable part

Most consultants optimize for the *current* engagement. They want to extract the maximum value from this contract, this month, this retainer. That's a local maximum. The global maximum is optimizing for the *next* engagement you haven't pitched yet — which means the project you're on right now is a long, paid audition for it.

Once you see it that way, everything changes. You start writing better docstrings. You start declining scope creep. You start coaching the junior who might someday recommend you back. You stop treating your client's team as obstacles and start treating them as a referral network that will either champion you or warn the next hiring manager.

Seven years in, I don't particularly think of Alfa Laval as a "client." I think of them as a group of engineers I've been trying to leave better than I found, for a long time. That's the only strategy I know that actually compounds.

---

*Building something where the architect's long-term fit matters? [Let's talk](/contact). I take on engagements where repeating is the point.*
