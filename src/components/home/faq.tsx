"use client";

import SectionLink from "@/components/section-link";
import { useState } from "react";
import Container from "../container";
import Eyebrow from "./eyebrow";

const questions = [
  {
    question: "What kinds of businesses do you work with?",
    answer:
      "All kinds. We build for healthcare practices, fintech and financial services, law firms, real estate, hospitality, retail, education, startups and more. The industry changes the details; the goal is always the same: a website that brings you customers.",
  },
  {
    question: "I know what I want to achieve. Where do we start?",
    answer:
      "Start with a short conversation about your business, your customers and what isn't working today. We'll help you decide what to build and put the scope, cost and timeline in writing before any work begins.",
  },
  {
    question: "Do I need to understand the technical side?",
    answer:
      "No. We explain decisions in plain language and guide you through the content and feedback we need. You review designs and working preview links as the project develops.",
  },
  {
    question: "What should I budget for my project?",
    answer:
      "Booking and intake upgrades start from $3,500 USD and complete websites from $5,000 USD. Web and mobile apps are quoted around their requirements. Optional monthly care starts from $500 USD per month.",
  },
  {
    question: "How long will the project take?",
    answer:
      "It depends on the size of the project. A smaller website can be live in a few weeks, while larger websites, apps and integrations can take up to three months. You get a written schedule with clear milestones before work starts.",
  },
  {
    question: "Will my website be optimised for Google?",
    answer:
      "Yes. Every site ships with technical SEO built in: fast load times, clean page structure, unique titles and descriptions, structured data, a sitemap and mobile-first design, so search engines can understand and rank your pages.",
  },
  {
    question: "Who will I be working with?",
    answer:
      "A small senior team led by our founder, Francis. You get one clear point of contact and direct conversations with the people building your project, not account managers.",
  },
  {
    question: "Can we work together from different countries?",
    answer:
      "Yes. We work remotely with clients worldwide and agree on meeting times, updates and review milestones that fit your time zone before the project starts.",
  },
  {
    question: "What happens after launch?",
    answer:
      "You own everything: code, design, domain and accounts. You get a handover so you know how to manage your site, and you can add a monthly care plan for ongoing updates and support.",
  },
];

// Lets Google show these questions directly in search results
const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface py-20 lg:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Container className="grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="reveal max-w-lg lg:sticky lg:top-24">
          <Eyebrow label="Questions" />
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
            Good Questions. Straight Answers.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            Big decisions are easier when you know what to expect. Here&apos;s a
            good place to start.
          </p>

          <div className="dark mt-10 rounded-3xl bg-background p-7 text-foreground">
            <p className="font-syne text-2xl font-semibold">Still have a question?</p>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              Ask Francis directly. You&apos;ll get a real answer within 24 hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <SectionLink
                id="contact"
                className="inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
              >
                Ask a question
                <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </SectionLink>
              <a
                href="mailto:contact@syntiqhq.com"
                className="text-base text-white/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                contact@syntiqhq.com
              </a>
            </div>
          </div>
        </div>

        <ul>
          {questions.map((item, i) => {
            const isOpen = openIndex === i;
            const answerId = `faq-answer-${i}`;

            return (
              <li
                key={item.question}
                className={`reveal ${isOpen ? "border-b-2 border-[#2563eb]" : "border-b border-border"}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-start gap-4 py-6 text-left sm:gap-6"
                >
                  <span
                    className={`mt-1 w-7 shrink-0 text-sm font-semibold tabular-nums transition-colors ${isOpen ? "text-[#2563eb]" : "text-muted"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 text-xl font-semibold leading-snug transition-colors sm:text-2xl ${isOpen ? "text-[#2563eb]" : "text-[#1c1c21]"}`}
                  >
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-45 bg-[#2563eb] text-white" : "bg-[#dbeafe] text-[#2563eb]"}`}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                {/* Animating grid rows from 0fr to 1fr lets the answer open to its natural height */}
                <div
                  id={answerId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-7 pl-11 pr-12 text-base leading-relaxed text-muted sm:pl-13 sm:pr-14">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
