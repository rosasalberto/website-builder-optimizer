import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FREE_WEBMAIL = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "gmx.com",
]);

interface Lead {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
}

function isBusinessEmail(email: string): boolean {
  const m = email.toLowerCase().match(/^[^@\s]+@([^@\s]+\.[^@\s]+)$/);
  if (!m) return false;
  return !FREE_WEBMAIL.has(m[1]);
}

/**
 * Lead-form handler. Forwards to a webhook (Zapier/Make/CRM) or Resend, or just
 * logs in dev. Generic + integration-agnostic — wire your destination via env.
 */
export async function POST(req: Request) {
  let body: Lead;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!isBusinessEmail(email)) {
    return NextResponse.json({ ok: false, error: "business_email_required" }, { status: 422 });
  }

  const lead = {
    name,
    email,
    company: (body.company ?? "").trim(),
    message: (body.message ?? "").trim(),
    submittedAt: new Date().toISOString(),
  };

  try {
    if (process.env.FORM_WEBHOOK_URL) {
      const res = await fetch(process.env.FORM_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.FORM_WEBHOOK_SECRET
            ? { "x-webhook-secret": process.env.FORM_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else if (process.env.RESEND_API_KEY) {
      // `resend` is an OPTIONAL dependency — the variable specifier keeps TS from
      // requiring it at build time when it isn't installed.
      const resendPkg = "resend";
      const mod = (await import(resendPkg).catch(() => null)) as {
        Resend: new (key: string) => { emails: { send: (o: unknown) => Promise<unknown> } };
      } | null;
      const Resend = mod?.Resend ?? null;
      if (Resend) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM || "leads@example.com",
          to: process.env.RESEND_TO || process.env.RESEND_FROM || "leads@example.com",
          subject: `New lead: ${lead.name} (${lead.company || "—"})`,
          text: `From: ${lead.name} <${lead.email}>\nCompany: ${lead.company}\n\n${lead.message}`,
        });
      }
    } else {
      console.log("[lead] (no destination configured)", lead);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] forward failed:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 502 });
  }
}
