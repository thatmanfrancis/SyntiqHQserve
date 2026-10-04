import Container from "../container";
import ContactForm from "./contact-form";

const details = [
  {
    label: "Email",
    value: "contact@syntiqhq.com",
    href: "mailto:contact@syntiqhq.com",
    icon: (
      <>
        <path d="M3 4a2 2 0 0 0-2 2v1.16l8.44 4.22a1.25 1.25 0 0 0 1.12 0L19 7.16V6a2 2 0 0 0-2-2H3z" />
        <path d="m19 8.84-7.77 3.89a2.75 2.75 0 0 1-2.46 0L1 8.84V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.84z" />
      </>
    ),
  },
  {
    label: "Reply time",
    value: "Within 24 hours",
    icon: (
      <path
        fillRule="evenodd"
        d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM10.75 5a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06l-2.78-2.78z"
      />
    ),
  },
  {
    label: "Location",
    value: "Based in Nigeria. Working worldwide.",
    icon: (
      <path
        fillRule="evenodd"
        d="M10 1a7 7 0 0 0-7 7c0 4.9 6.1 10.4 6.4 10.6a.9.9 0 0 0 1.2 0C10.9 18.4 17 12.9 17 8a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      />
    ),
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="bg-surface py-20 lg:py-28">
      <Container className="grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="reveal max-w-lg">
          <p className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-sm font-medium text-[#1c1c21]">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="size-3.5 text-muted">
              <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
              <path d="M2.5 4.5 8 8.5l5.5-4" strokeLinejoin="round" />
            </svg>
            Contact
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl">
            How Can We Help You Today?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            Tell us a little about your business and what you need. 
          </p>

          <ul className="mt-10 space-y-6">
            {details.map((detail) => (
              <li key={detail.label} className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background text-[#2563eb]">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    {detail.icon}
                  </svg>
                </span>
                <div>
                  <p className="text-sm text-muted">{detail.label}:</p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="text-base font-semibold text-[#1c1c21] underline-offset-4 transition hover:text-[#2563eb] hover:underline"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="text-base font-semibold text-[#1c1c21]">{detail.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal rounded-3xl border border-border bg-background p-6 sm:p-8">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
