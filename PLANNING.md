# Planning & Roadmap

Phase 1 (current, shipped) is the static brand site: hero, pillars, case studies, tech stack, contact, and a handful of seed blog posts. Phase 2 adds the auto-blog pipeline.

## Phase 2 — Auto-generated blog pipeline

Goal: keep the blog fresh without Semsudin manually writing every post, while keeping quality high and keeping his voice intact. Draft-in-PR model — AI writes, human reviews, human merges.

### Architecture

```
┌──────────────────────┐      ┌───────────────────┐     ┌──────────────────────┐
│ GitHub Actions cron  │ ───► │ Claude API (Opus) │ ──► │ PR opened on repo    │
│  (e.g. weekly Mon)   │      │  topic → draft    │     │  with new .md file   │
└──────────────────────┘      └───────────────────┘     └──────────┬───────────┘
                                                                    │
                                                                    ▼
                                                   ┌─────────────────────────────┐
                                                   │ Human review / edit / merge │
                                                   └─────────────┬───────────────┘
                                                                 │
                                                                 ▼
                                                   ┌─────────────────────────────┐
                                                   │ Cloudflare Pages auto-builds│
                                                   └─────────────────────────────┘
```

### Components

1. **Topic queue** — `content/blog/_topics.yaml` seeded monthly with ~4–8 topic ideas. Each entry:
   ```yaml
   - slug: "self-healing-tests-cost-analysis"
     angle: "Real numbers on what AI-driven QA saves a 10-engineer team"
     tone: "analytical, field-tested"
     inspiration: ["kinship experience", "playwright costs"]
     status: pending   # pending | drafted | published
   ```

2. **GitHub Actions cron** — `.github/workflows/autoblog.yml`, runs weekly.
   - Picks the next `pending` topic
   - Loads context: Semsudin's voice guide, 3 prior posts as style examples, the topic entry
   - Calls Claude Opus with a structured prompt
   - Writes to `src/content/blog/<slug>.md` with frontmatter
   - Updates `_topics.yaml` to `drafted`
   - Opens a PR with the draft for review

3. **Voice guide** — `.autoblog/voice.md`
   - Tone: direct, opinionated, first-person, non-promotional
   - Sentence rhythm: mix of short declaratives and longer analytical paragraphs
   - Never uses "In today's fast-paced world" or similar AI slop
   - Always includes one concrete anecdote from Semsudin's experience
   - Ends with a soft CTA linking to `/contact`
   - Code examples only when they earn their keep

4. **Prompt template** — `.autoblog/prompt.md`
   - System: "You are drafting a field note for Semsudin Sefić, an AI Systems Architect. Match his voice exactly."
   - Few-shot: 3 prior posts in full
   - Instruction: write 700–1200 words, structured with H2/H3, include one concrete example, end with a CTA paragraph
   - Frontmatter schema

5. **Quality gates before merging**
   - CI lint on word count (500–2000)
   - CI check that no slop phrases appear (e.g. "dive into", "unlock", "leverage", "synergy")
   - Human must approve; no auto-merge

### Implementation notes

- Use `anthropic` SDK directly from an Actions step
- Store `ANTHROPIC_API_KEY` as GitHub repo secret
- Use `peter-evans/create-pull-request` for the PR step
- Cache LLM responses by topic slug so re-runs don't re-bill

### Success criteria

- 1 draft PR per week, unattended
- Reader can't tell which posts are AI-drafted (after human edit)
- Semsudin spends ≤15 min per post polishing vs 2h writing from scratch

### When to build this

After the brand site has been live for 4–8 weeks, once Semsudin has written 2–3 more posts by hand to extend the voice guide corpus.

---

## Phase 3 — Lead capture + nurture

- Lead magnet: "AI QA Transformation Playbook" PDF, email-gated
- Mailing list via Buttondown or ConvertKit (lightweight, not Mailchimp)
- Drip sequence for new subscribers — 5 emails over 3 weeks, ending in consult offer

## Phase 4 — Social proof layer

- Testimonials from former clients/colleagues (ask Alfa Laval, System Verification, Mars Petcare contacts if willing)
- Case study PDFs for download (gated or ungated)
- Speaking / podcast appearances (actively pitch QA and GenAI podcasts)

## Phase 5 — Productized offers

If consulting demand exceeds capacity, productize:
- "AI Readiness Audit" — 2-week paid engagement → written architecture review
- "QA Transformation Sprint" — 4-week bootstrap to get AI-driven QA running
- "Fractional AI Architect" — recurring monthly retainer

---

## Operational

### Deployment

- Source of truth: this repo
- CI: Cloudflare Pages (auto-builds on push to `main`)
- DNS: Cloudflare (apex `semsudin.com` + `www.`)
- Analytics: Cloudflare Web Analytics (privacy-first, free)
- Email: Resend (transactional) — configured via Pages env vars

### Environment variables (Cloudflare Pages → Production & Preview)

```
RESEND_API_KEY      # Resend API key
CONTACT_TO          # sefic91@gmail.com
CONTACT_FROM        # hello@semsudin.com (verify domain in Resend)
TURNSTILE_SECRET    # optional, after adding captcha to form
```

### Local dev

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static build → dist/
npm run preview      # preview the built site
```
