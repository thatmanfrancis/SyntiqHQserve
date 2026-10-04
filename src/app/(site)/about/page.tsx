import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/back-button";
import Container from "@/components/container";
import Eyebrow from "@/components/home/eyebrow";
import SectionLink from "@/components/section-link";

export const metadata: Metadata = {
  title: "About the Studio",
  description:
    "SyntiqHQ fixes the website, booking and enquiry systems behind growing businesses, so the customers your marketing attracts actually get through.",
};

const blockers = [
  "Ads and posts that send people to a slow, confusing website",
  "Enquiries lost across DMs, missed calls and email threads",
  "Bookings that still depend on someone picking up the phone",
  "A website nobody on the team can update without help",
];

const standards = [
  {
    title: "Custom design",
    text: "Built around your business and your customers. No bloated templates.",
  },
  {
    title: "Found on Google",
    text: "Technical SEO on every page: metadata, structured data and a clean sitemap.",
  },
  {
    title: "Fast on any phone",
    text: "Most of your customers arrive on mobile, so every page is built to load quickly there first.",
  },
  {
    title: "100% yours",
    text: "You own the code, the design and every account. No lock-in, ever.",
  },
];

const promises = [
  {
    title: "You talk to the builders",
    text: "No sales reps or account managers passing notes along. The people you speak to are the people designing and building your project.",
  },
  {
    title: "Everything in writing",
    text: "A clear proposal with a fixed price, scope and timeline before any work starts. No surprise invoices.",
  },
  {
    title: "We stay after launch",
    text: "Free support for 30 days after launch, then optional monthly care if you want us to keep things running.",
  },
];

const industries = ["Healthcare", "Fintech", "Retail", "Hospitality", "Real estate", "Professional services"];

const arrowIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AboutPage() {
  return (
    <>
      <section className="pb-20 pt-16 lg:pb-28 lg:pt-24">
        <Container>
          <BackButton className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white py-2 pl-2 pr-5 text-base font-medium text-[#1c1c21] transition hover:border-[#2563eb]/40">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
                <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Go back
          </BackButton>

          <div className="mt-10 grid items-end gap-8 md:grid-cols-2 md:gap-16">
            <div>
              <Eyebrow label="About the studio" />
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl lg:text-6xl">
                We Fix the System Behind Your Business.
              </h1>
            </div>
            <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Plenty of business owners pour money into marketing while the website and booking behind
              it quietly turn customers away. We fix that foundation first, so every customer you
              attract has a clear, easy way to reach you.
            </p>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#eef3fc] py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <Image
            src="/images/process/strategic-scope.jpg"
            alt="Two professionals planning a project together on their laptops"
            width={1600}
            height={1067}
            sizes="(min-width: 1024px) 36rem, 100vw"
            className="reveal mx-auto aspect-4/3 w-full max-w-xl rounded-3xl object-cover"
          />

          <div className="reveal max-w-lg">
            <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
              More Marketing Won&apos;t Fix a Leaky System.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              These are the blocks we see holding good businesses back:
            </p>
            <ul className="mt-6 space-y-3">
              {blockers.map((blocker) => (
                <li key={blocker} className="flex items-start gap-3 text-base leading-snug text-[#1c1c21]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-3">
                      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                    </svg>
                  </span>
                  {blocker}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              We clear them with a fast website, simple online booking and enquiries that land in one
              place, so your marketing finally pays off.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="reveal max-w-2xl">
            <Eyebrow label="Our standards" />
            <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
              The Details Change. Our Standards Don&apos;t.
            </h2>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((standard, i) => (
              <li key={standard.title} className="reveal rounded-3xl border border-border bg-surface p-7">
                <span className="font-syne text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-xl font-semibold text-[#1c1c21]">{standard.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{standard.text}</p>
              </li>
            ))}
          </ul>

          <div className="reveal mt-14 flex flex-wrap items-center gap-3">
            <p className="mr-2 text-base text-muted">We work across industries:</p>
            {industries.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-border bg-white px-4 py-1.5 text-base text-[#1c1c21]"
              >
                {industry}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="reveal">
            <Eyebrow label="Working with us" />
            <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
              A Small, Senior Studio. A Hands-On Partner.
            </h2>
          </div>

          <ul className="reveal divide-y divide-border border-y border-border">
            {promises.map((promise) => (
              <li key={promise.title} className="py-6">
                <h3 className="text-xl font-semibold text-[#1c1c21]">{promise.title}</h3>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">{promise.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="dark bg-background py-20 text-foreground lg:py-28">
        <Container className="reveal max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Ready to Clear What&apos;s Holding You Back?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Tell us what&apos;s getting in the way. We&apos;ll reply within 24 hours with honest next
            steps, even if that means we&apos;re not the right fit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <SectionLink
              id="contact"
              className="inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
            >
              Start a project
              <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
                {arrowIcon}
              </span>
            </SectionLink>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-base font-medium text-white transition hover:border-white/60"
            >
              See pricing
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
