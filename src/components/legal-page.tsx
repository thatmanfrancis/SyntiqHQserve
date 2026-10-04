import type { ReactNode } from "react";
import BackButton from "./back-button";
import Container from "./container";

// Shared layout for the privacy policy and terms. Write the body as plain <h2>, <p> and <ul>.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <section className="py-16 lg:py-24">
      <Container className="max-w-3xl">
        <BackButton className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white py-2 pl-2 pr-5 text-base font-medium text-[#1c1c21] transition hover:border-[#2563eb]/40">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
              <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Go back
        </BackButton>

        <h1 className="mt-10 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted">Last updated: {updated}</p>

        <div className="mt-12 space-y-5 text-base leading-relaxed text-muted [&_a]:font-semibold [&_a]:text-[#2563eb] [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#1c1c21] [&_li]:pl-1 [&_strong]:text-[#1c1c21] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>
      </Container>
    </section>
  );
}
