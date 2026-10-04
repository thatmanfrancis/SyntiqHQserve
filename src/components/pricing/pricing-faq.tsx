import Container from "../container";
import Eyebrow from "../home/eyebrow";

const questions = [
  {
    question: "How does payment work?",
    answer:
      "One-time projects are paid in three stages: 40% to get started, 30% when you sign off the design, and the final 30% at launch. You never pay the full amount before you've seen the work.",
  },
  {
    question: "How do I pay?",
    answer:
      "We send an invoice for each stage, payable by bank transfer in US dollars. International clients are welcome.",
  },
  {
    question: "What changes the price?",
    answer:
      "Mainly the number of pages, how much content needs writing, and any extra features such as payments, client logins or connections to other software. We talk this through on a short call, then confirm one fixed price in your proposal.",
  },
  {
    question: "Can the price go up after we start?",
    answer:
      "No. The price in your signed proposal is the price you pay. If you ask for something outside the agreed scope, we quote it in writing first and only go ahead once you approve it.",
  },
  {
    question: "How does Monthly Care billing work?",
    answer:
      "Monthly Care is billed once a month with no long-term contract. You can pause or cancel with 30 days notice.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function PricingFaq() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="reveal">
          <Eyebrow label="Pricing questions" />
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
            Payments, Plainly Explained.
          </h2>
        </div>

        <ul className="reveal divide-y divide-border border-y border-border">
          {questions.map(({ question, answer }, i) => (
            <li key={question}>
              <details name="pricing-faq" className="group" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-5 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-syne text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-syne text-xl font-semibold text-[#1c1c21]">{question}</span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-[#1c1c21] transition group-open:rotate-45 group-open:border-transparent group-open:bg-[#2563eb] group-open:text-white">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="-mt-2 max-w-xl pb-6 pl-10 text-base leading-relaxed text-muted">{answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
