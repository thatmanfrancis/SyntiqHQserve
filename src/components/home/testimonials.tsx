import Image from "next/image";
import Container from "../container";
import Eyebrow from "./eyebrow";

type Testimonial = {
  quote: string;
  name: string;
  company: string;
  photo?: string;
  logo?: string;
};

// Placeholders only. Replace with real client quotes before launch, never invented ones.
const testimonials: Testimonial[] = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "John Doe",
    company: "Company Inc.",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "Jane Doe",
    company: "Company Inc.",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "John Doe",
    company: "Company Inc.",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "John Doe",
    company: "Company Inc.",
  },
];

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="dark bg-background py-20 text-foreground lg:py-28">
      <Container>
        <div className="reveal mx-auto max-w-2xl text-center">
          <Eyebrow label="Client feedback" />
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Kind Words From The People We Build For
          </h2>
        </div>

        {/* On phones the cards sit in a row you swipe through; from sm up they wrap into centred rows */}
        <ul className="-mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:flex-wrap sm:items-start sm:justify-center sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {testimonials.map((testimonial, i) => (
            <li
              key={i}
              className="reveal w-[85%] shrink-0 snap-center rounded-3xl border border-white/20 p-7 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <blockquote className="text-[15px] leading-relaxed text-foreground/85">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {testimonial.photo ? (
                    <Image
                      src={testimonial.photo}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#2563eb]">
                      {testimonial.name.charAt(0)}
                    </span>
                  )}
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                </div>

                {testimonial.logo ? (
                  <Image
                    src={testimonial.logo}
                    alt={testimonial.company}
                    width={96}
                    height={24}
                    className="h-6 w-auto"
                  />
                ) : (
                  <p className="text-sm font-semibold">{testimonial.company}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
