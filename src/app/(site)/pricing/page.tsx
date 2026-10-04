import type { Metadata } from "next";
import BackButton from "@/components/back-button";
import Container from "@/components/container";
import Eyebrow from "@/components/home/eyebrow";
import PlanFeatures from "@/components/pricing/plan-features";
import PricingFaq from "@/components/pricing/pricing-faq";
import SectionLink from "@/components/section-link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Clear, upfront website pricing in USD. Complete websites from $5,000, booking and intake upgrades from $3,500, and monthly care from $500.",
};

const plans = [
  {
    name: "The Complete Website",
    prefix: "From",
    price: "$5,000",
    terms: "One-time · Timeline agreed in your proposal",
    description: "A brand-new, modern website for businesses that have outgrown their current one.",
    features: [
      "Custom design tailored to your business and customers",
      "Fast loading on every phone, tablet and computer",
      "You own 100% of your website, code and accounts",
      "Clear pages that guide visitors to get in touch or buy",
      "Technical SEO built in: metadata, structured data, sitemap",
      "Help writing clear, friendly wording for your pages",
      "30 days of free support after launch",
    ],
    cta: "Start a conversation",
    service: "NEW_WEBSITE",
    popular: true,
  },
  {
    name: "The Booking & Intake Upgrade",
    prefix: "From",
    price: "$3,500",
    terms: "One-time · Timeline agreed in your proposal",
    description: "Online booking and intake added to the website you already have.",
    features: [
      "Online booking and appointment calendar",
      "Automatic confirmation emails and reminders",
      "Works on your existing website, no rebuild needed",
      "Syncs with your Google Calendar or Outlook",
      "Short intake questions so customers share key details upfront",
      "Zero disruption to your current email or domain",
    ],
    cta: "Upgrade your booking",
    service: "BOOKING",
    popular: false,
  },
  {
    name: "Monthly Care & Support",
    prefix: "",
    price: "$500",
    terms: "Per month · Cancel with 30 days notice",
    description: "We keep your website fast, secure and up to date while you run your business.",
    features: [
      "Monthly speed, security and backup checks",
      "Content updates whenever you need them",
      "Priority same-day help for urgent issues",
      "Direct contact on WhatsApp or email",
      "No long-term lock-in; pause or cancel when you need",
      "Quarterly performance and SEO check-ins",
    ],
    cta: "Ask about monthly care",
    service: "CARE",
    popular: false,
  },
];

// Real client words only, used with their permission. The block stays hidden while this is null.
const clientQuote: { quote: string; name: string; company: string } | null = null;

const arrowIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PricingPage() {
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
              <Eyebrow label="Clear & honest pricing" />
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl lg:text-6xl">
                Website Design Pricing, Upfront.
              </h1>
            </div>
            <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Zero surprise extra invoices. After a short 30-minute conversation, you get a clear
              proposal with a fixed price and an agreed timeline before any work starts.
            </p>
          </div>

          {/* Below lg the cards sit in a row you swipe through. pt-4 leaves room for the badge,
              since a horizontal scroller clips anything poking out of the top. */}
          <ul className="reveal -mx-4 mt-10 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-4 pb-2 pt-4 scrollbar-none md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0">
            {plans.map((plan) => (
              <li
                key={plan.name}
                className={`relative w-[85%] shrink-0 snap-center rounded-3xl p-7 sm:w-[55%] lg:w-auto ${plan.popular ? "dark bg-background text-foreground" : "border border-border bg-surface"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-7 rounded-full bg-[#c6f432] px-3 py-1 text-sm font-semibold text-[#1c1c21]">
                    Most popular
                  </span>
                )}

                <h2
                  className={`text-2xl font-semibold leading-tight ${plan.popular ? "text-white" : "text-[#1c1c21]"}`}
                >
                  {plan.name}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-muted">{plan.description}</p>

                <p className={`mt-6 flex items-baseline gap-2 ${plan.popular ? "text-white" : "text-[#1c1c21]"}`}>
                  {plan.prefix && <span className="text-base text-muted">{plan.prefix}</span>}
                  <span className="font-syne text-5xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-base text-muted">USD</span>
                </p>
                <p className="mt-2 text-sm text-muted">{plan.terms}</p>

                <SectionLink
                  id="contact"
                  service={plan.service}
                  className={`mt-6 flex items-center justify-center gap-3 rounded-full py-3 pl-6 pr-4 text-base font-medium transition ${plan.popular ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]" : "border border-border bg-white text-[#1c1c21] hover:border-[#2563eb]/40"}`}
                >
                  {plan.cta}
                  <span
                    className={`flex size-6 items-center justify-center rounded-full border ${plan.popular ? "border-white/60" : "border-[#1c1c21]/30"}`}
                  >
                    {arrowIcon}
                  </span>
                </SectionLink>

                <PlanFeatures features={plan.features} dark={plan.popular} />
              </li>
            ))}
          </ul>

          <div className="reveal mt-6 flex flex-col gap-6 rounded-3xl bg-[#eef3fc] p-7 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold text-[#1c1c21]">Web & Mobile Apps</h2>
              <p className="mt-2 text-base leading-relaxed text-muted">
                Custom web and mobile apps are quoted around what you actually need, and built by the
                same senior team you talk to.
              </p>
            </div>
            <SectionLink
              id="contact"
              service="APP"
              className="inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8] md:self-auto"
            >
              Tell us about your app
              <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
                {arrowIcon}
              </span>
            </SectionLink>
          </div>

          {clientQuote && (
            <figure className="reveal mx-auto mt-16 max-w-3xl text-center">
              <blockquote className="font-syne text-2xl font-semibold leading-snug text-[#1c1c21] sm:text-3xl">
                &ldquo;{clientQuote.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-base text-muted">
                <span className="font-semibold text-[#1c1c21]">{clientQuote.name}</span>, {clientQuote.company}
              </figcaption>
            </figure>
          )}
        </Container>
      </section>

      <PricingFaq />

      <section className="dark bg-background py-20 text-foreground lg:py-28">
        <Container className="reveal max-w-3xl text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#c6f432] text-[#1c1c21]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-6">
              <path
                fillRule="evenodd"
                d="M10 1.5 3 4.3v5c0 4.3 3 8 7 9.2 4-1.2 7-4.9 7-9.2v-5zm3.5 6.3a.75.75 0 0 0-1.1-1L9 10.3 7.6 8.9a.75.75 0 1 0-1.1 1.1l2 2a.75.75 0 0 0 1.1 0z"
              />
            </svg>
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Peace-of-Mind Guarantee
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Everything agreed in writing before we start. No hidden fees, no surprise invoices, and
            direct access to the team building your project.
          </p>
          <SectionLink
            id="contact"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
          >
            Have a question? Talk to us
            <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
              {arrowIcon}
            </span>
          </SectionLink>
        </Container>
      </section>
    </>
  );
}
