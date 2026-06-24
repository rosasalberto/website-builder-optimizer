---
name: geo-optimization
description: >-
  Generative Engine Optimization — make pages and blog posts citable by AI
  search (ChatGPT, Perplexity, Google AI Overviews, Claude). Use when asked to
  "optimize for AI search", "improve GEO", "make content citable", "why aren't
  we cited by ChatGPT", or when writing/reviewing blog content for AI visibility.
---

# Generative Engine Optimization (GEO)

GEO is an additional layer on top of SEO: structure content so answer engines can
extract and cite it. The template already ships the technical signals; this skill
governs the content patterns.

## Technical signals (already wired in the template)
- `llms.txt` at `/llms.txt` — machine-readable site map (core pages + recent posts).
- `robots.txt` explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, …).
- JSON-LD on every page: Organization, WebSite, Article, FAQPage, BreadcrumbList, **Speakable**.

## Content patterns (apply when writing)
1. **Answer-first** — the direct answer in the first ~200 words, before context.
2. **Question-format H2s** — match real queries ("How do I…", "What is…", "Why does…").
3. **Citable statistics** — specific, attributed numbers ("X improved Y by 18% (source, 2026)").
4. **FAQ block** — 5+ Q&As → FAQPage schema → highly cited.
5. **Named author + E-E-A-T** — real byline, credentials, external profile links (`sameAs`).
6. **Consistent heading hierarchy + 200–400-word sections** — chunked for passage extraction.

## How to apply
- New blog posts: enforce the 6 patterns above (the `blog-publisher` skill references these).
- Existing pages: add a FAQ section (use the `Faq` component → auto FAQPage JSON-LD), wrap the key answer in a selector and add `speakableLd([...selectors])`.
- Verify `/llms.txt` lists the page and JSON-LD validates (Rich Results Test).

## Note
GEO is structure + authority, not a single magic file. llms.txt helps but content
structure + E-E-A-T matter more. Spend effort there.
