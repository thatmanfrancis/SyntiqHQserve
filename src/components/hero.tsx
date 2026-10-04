import SectionLink from "@/components/section-link";
import Container from "./container";

const blue = "#2563eb";
const dark = "#1c1c21";
const sky = "#dbeafe";
const lime = "#c6f432";

// On phones the cards sit in a row you swipe through; from md up they're a 3-column grid
const cardStyle = "w-[85%] shrink-0 snap-center rounded-4xl p-7 sm:p-8 md:w-auto";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-3.75rem)] flex-col justify-center overflow-hidden pb-14 pt-10 sm:pb-16 sm:pt-12">
      {/* Faint vertical lines behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-size-[calc(100%/10)_100%] opacity-70 mask-[linear-gradient(to_bottom,black,transparent)]"
      />

      <Container className="relative">
        <h1
          aria-label="Websites that bring you customers, not just visitors."
          className="mx-auto font-semibold text-center text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-tight"
        >
          <span aria-hidden>
            Websites that bring{" "}
            <span className="whitespace-nowrap">
              y<Dot color={blue} />u
            </span>{" "}
            <br className="hidden sm:block" />
            <span className="whitespace-nowrap">
              cust<Dot color={lime} />mers,
            </span>{" "}
            not visitors.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted sm:ml-[52%] sm:mt-7">
          From healthcare to fintech, retail to real estate, we design and build fast,
          search-friendly websites and simple booking systems that turn visitors into paying
          customers.
        </p>

        <div className="relative -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mt-12 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          <article style={{ background: blue }} className={`${cardStyle} flex flex-col text-white`}>
            <p className="text-4xl font-semibold tracking-tight sm:text-5xl">~4 wks</p>
            <p className="mt-2 text-lg font-medium leading-snug">From first call to launch</p>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Clear milestones, async updates and a written timeline from day one.
            </p>
            <SectionLink
              id="contact"
              style={{ color: dark }}
              className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-base font-medium transition hover:opacity-90"
            >
              Get in touch
              <span
                style={{ background: dark }}
                className="flex size-8 items-center justify-center rounded-full text-white"
              >
                <ArrowIcon className="size-3.5" />
              </span>
            </SectionLink>
          </article>

          <article style={{ background: dark }} className={`${cardStyle} flex flex-col text-white`}>
            <p className="text-4xl font-semibold tracking-tight sm:text-5xl">100%</p>
            <p className="mt-2 text-lg font-medium leading-snug text-white/80">
              Yours. You own the code, design and accounts.
            </p>
            {/* Small tags, so these stay below 16px on purpose */}
            <ul className="mt-auto flex flex-wrap gap-2 pt-8 text-sm font-medium">
              {["SEO built in", "Senior team", "Fixed price"].map((item) => (
                <li key={item} className="rounded-full border border-white/20 px-3 py-1.5">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article style={{ background: sky, color: dark }} className={`${cardStyle} relative flex items-center`}>
            {/* Notches down the left edge, like a tear-off strip */}
            <div aria-hidden className="absolute inset-y-8 left-0 flex flex-col justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className="size-4 -translate-x-1/2 rounded-full bg-background" />
              ))}
            </div>
            <p className="pl-5 text-2xl font-medium leading-tight sm:text-3xl">
              Look the part.
              <br />
              Make it easy.
              <br />
              Leave the tech to us.
            </p>
          </article>

          <SectionLink
            id="contact"
            aria-label="Start a project"
            style={{ background: lime, color: dark }}
            className="absolute bottom-0 left-1/3 hidden size-20 -translate-x-1/2 translate-y-1/4 items-center justify-center rounded-full ring-10 ring-background transition hover:scale-105 md:flex"
          >
            <ArrowIcon className="size-7" />
          </SectionLink>
        </div>
      </Container>
    </section>
  );
}

// A coloured circle standing in for the "o" in a word
function Dot({ color }: { color: string }) {
  return (
    <span
      style={{ background: color }}
      className="mx-[0.03em] inline-block size-[0.4em] rounded-full align-[0.02em]"
    />
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 13 13 3M5 3h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
