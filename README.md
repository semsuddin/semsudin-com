# semsudin.com

Personal brand site for Šemsudin Sefić — AI Systems Architect. Built with Astro + Tailwind, deployed on Cloudflare Pages.

## Stack

- **Astro 6** (static with MDX content)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Cloudflare Pages** (hosting + DNS)
- **Cloudflare Pages Functions** (contact form handler)
- **Resend** (transactional email for contact form)

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produces dist/
npm run preview  # preview built site
```

## Project structure

```text
src/
├── components/       # Astro components (Hero, Pillars, CaseStudies, ...)
├── content/
│   ├── blog/         # Field notes (MDX/MD)
│   └── caseStudies/  # Client work
├── layouts/          # BaseLayout
├── pages/            # Routes
└── styles/           # global.css — design tokens + components

functions/api/        # Cloudflare Pages Functions (contact form)
public/               # Static assets (favicon, portrait, logos)
PLANNING.md           # Phase 2+ roadmap (auto-blog, lead capture, etc.)
```

## Content authoring

Blog posts: drop a new `.md` file in `src/content/blog/` with frontmatter:

```yaml
---
title: "Post title"
description: "One-line summary for cards + SEO"
publishedAt: 2026-04-23
tags: ["Topic A", "Topic B"]
readingTime: "5 min"
---
```

Case studies: `src/content/caseStudies/<slug>.md` — see existing entries for schema.

## Deployment

Connected to Cloudflare Pages → builds on every push to `main`.

Required env vars in Cloudflare Pages settings:

| Variable            | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `RESEND_API_KEY`    | Contact form delivery                         |
| `CONTACT_TO`        | Destination email (`sefic91@gmail.com`)       |
| `CONTACT_FROM`      | Verified sender (e.g. `hello@semsudin.com`)   |
| `TURNSTILE_SECRET`  | Optional captcha                              |

Analytics: Cloudflare Web Analytics — paste the token into `BaseLayout.astro` where marked `PLACEHOLDER_CF_ANALYTICS_TOKEN`.

## Design notes

- Editorial + terminal aesthetic — intentionally distinctive vs generic AI-gen sites
- Warm paper background (`#f8f5ef`), deep ink, burnt amber signal color
- Typography: Instrument Serif (display) + Inter (body) + JetBrains Mono (technical)
- Sharp corners, horizontal rules, asymmetric grids, numbered sections

## Roadmap

See [PLANNING.md](./PLANNING.md) for Phase 2 auto-blog pipeline, lead capture, productized offers.
