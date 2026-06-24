---
name: generator-discriminator-loop
description: >-
  The meta-pattern for self-critiquing creative/code work: a generator produces,
  an independent discriminator scores against a reference, the generator fixes,
  repeat until it passes. Use when building or improving pages, copy, or designs
  where quality is subjective and a reference/rubric exists. Pairs with
  website-page-builder-loop.
---

# Generator → Discriminator Loop

## When to use
Subjective-quality output (page layout, copy, design) with a rubric/reference and a
cheap iteration cost. NOT for objective pass/fail (use tests/typecheck for those).

## The loop
1. **Generator** produces a batch (a page, a section, a draft).
2. **Capture** the output (rendered HTML / screenshot / file).
3. **Discriminator** (a fresh agent, blind to the generator's reasoning) scores it
   against the rubric + reference and returns numbered blockers, each with the exact fix.
4. **Apply** the fixes.
5. Repeat until pass (≥ threshold) or the iteration cap.

## Cross-engine verification (codex)
Use `codex` as an INDEPENDENT second engine so the work isn't graded only by the
engine that produced it:
- **Mode A — fixer:** `codex --auto "Rewrite <file> to satisfy: <fix list>. Must pass <gate>. Don't edit outside this repo."`
- **Mode B — auditor (read-only):** `codex exec "Read <file> + rendered HTML. Score 0–100 on <dims>. Output ONLY JSON {dim:score,…,overall,blockers:[]}. Do NOT modify files."`
A page is accepted only when deterministic scripts pass AND the Claude discriminator ≥ threshold AND codex ≥ threshold. Divergence > 5 pts between engines → escalate to a human.

## Anti-homogenization guardrails (mandatory)
- **Rotate references** by section — never one reference for the whole page.
- **Cap at 5 iterations** — no convergence → escalate or swap reference.
- **Human gate every 3rd iteration** — "am I drifting?"
- **"Does better than reference" forcing function** — the discriminator must name ≥1 dimension where the current state beats the reference; if it can't, the reference is dominating and must be swapped.

## Failure modes
Discriminator drift (nitpicking by iter 4), contradictory blockers (show prior critique),
over-delegation (generator narrates *why* before *what*), homogenization (every SaaS site
looks identical — the guardrails above are the fix).
