"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ContactFormLabels {
  name: string;
  email: string;
  company: string;
  message: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  required: string;
  invalidEmail: string;
}

type Status = "idle" | "sending" | "success" | "error";

const inputCls =
  "w-full rounded-[var(--radius)] border border-line bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/**
 * Contact form. POSTs JSON to /api/form (handler owned elsewhere) and degrades
 * gracefully: client-side validation, a polite live region, and clear
 * loading / success / error states so a missing endpoint never breaks the UX.
 */
export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — bots fill hidden fields; humans never see this one.
    if (data.get("company_website")) return;

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setStatus("error");
      setError(labels.required);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setError(labels.invalidEmail);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: String(data.get("company") ?? "").trim(),
          message,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError(labels.error);
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className="rounded-[var(--radius)] border border-line bg-muted px-5 py-6 text-center text-base font-medium"
      >
        {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot: visually hidden, off the tab order, ignored by humans. */}
      <div aria-hidden className="absolute left-[-9999px]" hidden>
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            {labels.name}
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {labels.email}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="company" className="text-sm font-medium">
          {labels.company}
        </label>
        <input id="company" name="company" type="text" autoComplete="organization" className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          {labels.message}
        </label>
        <textarea id="message" name="message" required rows={5} className={cn(inputCls, "resize-y")} />
      </div>

      {status === "error" && error && (
        <p role="alert" className="text-sm font-medium text-[var(--color-brand)]">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? labels.sending : labels.submit}
      </Button>
    </form>
  );
}
