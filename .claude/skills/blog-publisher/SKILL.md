---
name: blog-publisher
description: >-
  Publish a blog post to this site's OWN Payload CMS in every configured locale
  from a single Markdown file — create, translate (OpenRouter), generate a cover,
  and publish. Use when asked to "publish a blog post", "write and publish an
  article", "post to the blog", or "translate and publish". Slug-immutable for
  SEO safety. Drives scripts/blog/publish.ts.
---

# Multi-locale Blog Publisher (Payload)

Publishes to the embedded Payload CMS (REST base `/api/payload`, or the offline
Local API). Locales come from `site.config.ts` `domain.locales`.

## When to use
"publish a blog post", "publish this article in all languages", the
`/daily-seo-content` routine.

## Post format (frontmatter + Markdown body)
```markdown
---
title: "Your title"
slug: your-slug
excerpt: "One-sentence summary (≤ 300 chars)."
category: guides
author: jane-doe
seo:
  metaTitle: "≤ 60 chars"
  metaDescription: "≤ 155 chars"
---

Your Markdown body…
```

## Publish (one command)
```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
set -a && source .env && set +a
pnpm exec payload run scripts/blog/publish.ts path/to/post.md
```
Pipeline: parse → Markdown→Lexical → create default-locale draft → translate to every
other locale (slug unchanged) → generate + attach a 1200×630 cover → publish. Prints
`{ id, slug, url, locales }`.

## Hard rules
- **Slug immutability:** NEVER change a published post's slug. Re-publishing passes the
  existing slug through verbatim (a Payload hook also enforces this). To change a slug
  deliberately, add a `redirects` entry (old → new) first.
- **Translate, don't break:** translation keeps code blocks, URLs, brand names, prices,
  and acronyms; only natural-language prose changes.

## GEO content rules (write posts that AI engines cite)
- Put the direct answer in the first ~200 words.
- Use question-format H2s ("How do I…", "What is…").
- Add a FAQ block (emits FAQPage JSON-LD).
- Name a real author with credentials (E-E-A-T → Article author Person + sameAs).
- Include at least one citable, specific statistic.

## Env vars
- `OPENROUTER_API_KEY` — translations + (optional) image gen. Default model `google/gemini-2.5-flash`.
- `DATABASE_URI`, `PAYLOAD_SECRET` — to reach the CMS (Local API).
- `PAYLOAD_API_KEY` + `NEXT_PUBLIC_SITE_URL` — only if publishing to a REMOTE deployment over REST.
