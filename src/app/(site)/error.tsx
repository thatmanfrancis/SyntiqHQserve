"use client";

import { useEffect } from "react";
import BackButton from "@/components/back-button";
import StatusPage, { primaryButton, secondaryButton } from "@/components/status-page";

// Shown inside the site layout, so the header and footer stay on screen
export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title="Something broke on our side."
      description="It's not you, it's us. Please try again in a moment, or go back."
    >
      <title>Something went wrong | SyntiqHQ</title>
      <button type="button" onClick={() => retry()} className={primaryButton}>
        Try again
        <span className="flex size-6 items-center justify-center rounded-full border border-white/60">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
            <path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <BackButton className={secondaryButton}>Go back</BackButton>
      {error.digest && (
        <p className="w-full pt-4 text-sm text-muted">Error reference: {error.digest}</p>
      )}
    </StatusPage>
  );
}
