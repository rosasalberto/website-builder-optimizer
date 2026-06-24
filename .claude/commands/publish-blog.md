---
description: Publish a Markdown post to the site's own Payload CMS in every locale (create → translate → cover → publish).
argument-hint: <path/to/post.md>
---

Publish the post at `$ARGUMENTS` using the `blog-publisher` skill:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
set -a && source .env && set +a
pnpm exec payload run scripts/blog/publish.ts $ARGUMENTS
```

Before publishing, verify the frontmatter (title, slug, excerpt, category, author, seo) and
that the body follows the GEO content rules (answer-first, question H2s, FAQ, named author,
a citable stat). NEVER change the slug of an already-published post. Report the returned
`{ id, slug, url, locales }` and confirm the post renders in each locale with correct
hreflang + Article JSON-LD.
