import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import Header from "@/components/header";
import StatusPage, { primaryButton, secondaryButton } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <StatusPage
          code="404"
          title="This page took a different route."
          description="The link may be old or mistyped. Let's get you back to something useful."
        >
          <BackButton className={primaryButton}>
            Go back
            <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
                <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </BackButton>
          <Link href="/#contact" className={secondaryButton}>
            Start a project
          </Link>
        </StatusPage>
      </main>
      <Footer />
    </>
  );
}
