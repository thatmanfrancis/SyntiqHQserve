import Image from "next/image";
import Link from "next/link";
import Container from "./container";
import SectionLink from "./section-link";

// Each entry is one column. Add a link to a column, or add a whole new column, here.
const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Our Approach", href: "/approach" },
      { label: "What We Do", href: "/services" },
      { label: "Selected Work", href: "/work" },
      { label: "Pricing", href: "/pricing" },
      { label: "Questions & Answers", href: "/#faq" },
      { label: "About the Studio", href: "/about" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Doctors & Health Clinics", href: "/industries/healthcare" },
      { label: "Fintech & Finance", href: "/industries/finance" },
      { label: "Law Firms & Solicitors", href: "/industries/legal" },
      { label: "Real Estate & Property", href: "/industries/real-estate" },
      { label: "Restaurants & Hotels", href: "/industries/hospitality" },
      { label: "All industries →", href: "/industries" },
    ],
  },
  {
    title: "What We Build",
    links: [
      { label: "Business Websites", href: "/services/business-websites" },
      { label: "Online Booking", href: "/services/online-booking" },
      { label: "Website Redesigns", href: "/services/website-redesigns" },
      { label: "Web & Mobile Apps", href: "/services/apps" },
      { label: "Monthly Care", href: "/services/monthly-care" },
    ],
  },
  {
    title: "Get in Touch",
    links: [
      { label: "contact@syntiqhq.com ↗", href: "mailto:contact@syntiqhq.com" },
      { label: "Start a Project ↗", href: "/#contact" },
    ],
  },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    // Always dark, so the white logo works in light mode too
    <footer className="dark relative overflow-hidden bg-background text-foreground">
      <Container className="relative z-10 pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/">
              <Image
                src="/syntiqhqlogo.png"
                alt="SyntiqHQ"
                width={879}
                height={178}
                className="h-auto w-40"
              />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              A web design and development studio building fast, search-friendly
              websites and online booking for businesses in every industry.
            </p>
            <p className="mt-6 text-xs text-subtle">
              Working with clients worldwide.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-manrope text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-6 space-y-3">
                {column.links.map((link) => {
                  const className =
                    "inline-block text-sm text-muted transition duration-300 ease-out hover:translate-x-2 hover:text-foreground";

                  return (
                    <li key={link.href}>
                      {link.href.startsWith("/#") ? (
                        <SectionLink id={link.href.slice(2)} className={className}>
                          {link.label}
                        </SectionLink>
                      ) : (
                        <Link href={link.href} className={className}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile: links on top, copyright underneath. Desktop: one row */}
        <div className="mt-16 grid grid-cols-2 items-center gap-4 border-t border-border py-6 text-xs text-subtle md:flex md:justify-between">
          <p className="order-last col-span-2 md:order-0">
            © {new Date().getFullYear()} SyntiqHQ. All rights reserved.
          </p>
          <p className="flex gap-2">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="flex gap-2">
                {index > 0 && <span>·</span>}
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
          <a href="#" className="justify-self-end hover:text-foreground">
            Back to top ↑
          </a>
        </div>
      </Container>

      <Image
        src="/syntiqhqlogo.png"
        alt=""
        aria-hidden="true"
        width={879}
        height={178}
        className="pointer-events-none mx-auto h-auto w-[90%] max-w-6xl select-none pb-8 opacity-5"
      />
    </footer>
  );
}
