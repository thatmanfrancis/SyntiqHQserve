"use client";

import { Suspense, useState, type FormEvent } from "react";
import SelectField from "./select-field";
import ServiceField from "./service-field";

const services = [
  { value: "NEW_WEBSITE", label: "New website" },
  { value: "BOOKING", label: "Booking & intake" },
  { value: "REDESIGN", label: "Redesign current site" },
  { value: "APP", label: "Web or mobile app" },
  { value: "CARE", label: "Monthly care & support" },
  { value: "OTHER", label: "Something else" },
];

const budgets = [
  { value: "UNDER_5K", label: "Under $5,000" },
  { value: "FROM_5K_TO_10K", label: "$5,000 – $10,000" },
  { value: "FROM_10K_TO_25K", label: "$10,000 – $25,000" },
  { value: "OVER_25K", label: "Over $25,000" },
  { value: "NOT_SURE", label: "Not sure yet" },
];

const fieldStyle =
  "peer w-full rounded-xl border border-border bg-white px-4 font-syne text-base text-[#1c1c21] outline-none transition focus:border-[#2563eb]";
// The label sits inside the field like a placeholder, then shrinks to the top once there's focus or text.
// Inputs use placeholder=" " so :placeholder-shown means "empty".
const floatingLabelStyle =
  "pointer-events-none absolute left-4 top-1.5 text-xs text-muted transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#2563eb]";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = Object.fromEntries(new FormData(event.currentTarget));
    // The custom dropdown can't use the browser's "required" check, so it's checked here
    if (!form.service) {
      setError("Please choose what you need.");
      setStatus("idle");
      return;
    }
    // The API treats a missing budget as "not given", but an empty string as invalid
    if (!form.budget) delete form.budget;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setStatus("idle");
        return;
      }

      setMessage(data.message);
      setStatus("sent");
    } catch {
      setError("Your message couldn't be sent. Please email contact@syntiqhq.com instead.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-center py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-[#c6f432] text-[#1c1c21]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
            <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-6 font-syne text-3xl font-semibold text-[#1c1c21]">Message received.</p>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
          {message} A confirmation is on its way to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="relative block">
        <input name="name" required maxLength={100} autoComplete="name" placeholder=" " className={`${fieldStyle} h-12 pt-5`} />
        <span className={floatingLabelStyle}>Name*</span>
      </label>

      <label className="relative block">
        <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder=" " className={`${fieldStyle} h-12 pt-5`} />
        <span className={floatingLabelStyle}>Email*</span>
      </label>

      <label className="relative block">
        <input name="company" maxLength={150} autoComplete="organization" placeholder=" " className={`${fieldStyle} h-12 pt-5`} />
        <span className={floatingLabelStyle}>Company (optional)</span>
      </label>

      <Suspense fallback={<SelectField name="service" label="What do you need?*" options={services} />}>
        <ServiceField options={services} />
      </Suspense>

      <div className="sm:col-span-2">
        <SelectField name="budget" label="Budget (optional)" options={budgets} />
      </div>

      <label className="relative block sm:col-span-2">
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder=" "
          className={`${fieldStyle} block resize-y pb-3 pt-6`}
        />
        <span className={floatingLabelStyle}>Message*</span>
      </label>

      {/* Hidden from people; bots that fill it in get ignored by the API */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "sending" ? "Sending..." : "Send message"}
          <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        {error && (
          <p role="alert" className="text-base text-danger">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
