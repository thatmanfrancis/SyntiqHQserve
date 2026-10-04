import Image from "next/image";
import Link from "next/link";
import Container from "../container";

export default function AboutSplit() {
  return (
    <section className="relative overflow-hidden bg-[#eef3fc] py-20 lg:py-28">
      {/* Faint square grid behind the photo, fading out before the text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#d5dff0_1px,transparent_1px),linear-gradient(to_bottom,#d5dff0_1px,transparent_1px)] bg-size-[56px_56px] mask-[linear-gradient(to_right,black_30%,transparent_55%)]"
      />

      <Container className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Image
          src="/images/about-team.jpg"
          alt="A team chatting together in a bright office in Lagos"
          width={1600}
          height={1067}
          sizes="(min-width: 1024px) 36rem, 100vw"
          className="reveal mx-auto aspect-4/3 w-full max-w-xl rounded-3xl object-cover"
        />

        <div className="reveal max-w-lg">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[#1c1c21] sm:text-5xl lg:text-6xl">
            Built For Your Business. Made For Your People.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            A better first impression, an easier next step, and a partner who
            actually listens and makes it happen. No agency buzzwords, just a
            clear written plan and quick updates.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2563eb] py-3 pl-6 pr-4 text-base font-medium text-white transition hover:bg-[#1d4ed8]"
          >
            About the studio
            <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-3"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
