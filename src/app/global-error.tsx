"use client";

import { useEffect } from "react";
import StatusPage, { primaryButton, secondaryButton } from "@/components/status-page";
import "./globals.css";

// Only used when the root layout itself fails, so it has to render its own <html> and <body>
export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <title>Something went wrong | SyntiqHQ</title>
        <StatusPage
          code="500"
          title="Something broke on our side."
          description="It's not you, it's us. Please try again in a moment, or head back home."
        >
          <button type="button" onClick={() => retry()} className={primaryButton}>
            Try again
          </button>
          {/* A full page load, since the app itself failed to render */}
          <a href="/" className={secondaryButton}>
            Back to home
          </a>
        </StatusPage>
      </body>
    </html>
  );
}
