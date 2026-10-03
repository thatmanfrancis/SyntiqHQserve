import type { ReactNode } from "react";
import Container from "./container";

const blue = "#2563eb";
const lime = "#c6f432";

export const primaryButton =
  "inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]";
export const secondaryButton =
  "inline-flex items-center rounded-full border border-border px-6 py-3 text-base font-medium transition hover:border-foreground/40";

// Shared layout for the 404 and 500 pages. Zeros in the code become coloured dots, like the hero headline.
export default function StatusPage({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.75rem)] flex-col justify-center overflow-hidden py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-size-[calc(100%/10)_100%] opacity-70 mask-[linear-gradient(to_bottom,black,transparent)]"
      />

      <Container className="relative text-center">
        <p
          aria-label={`Error ${code}`}
          className="flex items-center justify-center gap-[0.04em] font-syne text-[clamp(5rem,14vw,9rem)] font-semibold leading-none tracking-tight"
        >
          {code.split("").map((char, i) =>
            char === "0" ? (
              <span
                key={i}
                aria-hidden
                style={{ background: i === 1 ? blue : lime }}
                className="inline-block size-[0.66em] rounded-full"
              />
            ) : (
              <span key={i} aria-hidden>
                {char}
              </span>
            ),
          )}
        </p>

        <h1 className="mx-auto mt-8 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">{description}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
      </Container>
    </section>
  );
}
