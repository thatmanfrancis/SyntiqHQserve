import Container from "../container";

const industries = [
  "Doctors & Health Clinics",
  "Fintech & Finance",
  "Law Firms & Solicitors",
  "Real Estate & Property",
  "Restaurants & Hotels",
  "Retail & E-commerce",
  "Consultants & Advisors",
  "Schools & Training",
  "Startups & SaaS",
  "Beauty & Wellness",
];

export default function IndustriesStrip() {
  return (
    <section className="pb-6">
      <Container>
        <div className="overflow-hidden py-6 mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          {/* The list is rendered twice so the loop has no gap when it wraps around */}
          <ul className="flex w-max animate-marquee items-center motion-reduce:animate-none">
            {[...industries, ...industries].map((industry, i) => (
              <li
                key={i}
                aria-hidden={i >= industries.length}
                className="flex items-center gap-12 whitespace-nowrap pr-12 font-syne text-xl font-semibold text-[#1c1c21]"
              >
                {industry}
                <span className="size-2 rounded-full bg-[#2563eb]" />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
