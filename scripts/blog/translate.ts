/**
 * Transcreate post fields into a target locale via OpenRouter.
 * The slug is NEVER passed here — it stays identical across locales (SEO).
 */
export interface TranslatableFields {
  title: string;
  excerpt?: string;
  /** Markdown body. */
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export async function translateFields(
  fields: TranslatableFields,
  targetLocale: string,
  opts: { model?: string } = {},
): Promise<TranslatableFields> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  const model = opts.model || "google/gemini-2.5-flash";

  const system =
    `You are a native ${targetLocale} marketing copywriter. Transcreate (don't ` +
    `literally translate) the JSON fields into ${targetLocale}. Preserve Markdown ` +
    `structure, code blocks, URLs, brand names, prices, and acronyms (API, SEO, CMS). ` +
    `Return ONLY a JSON object with the same keys.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(fields) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as TranslatableFields;
}
