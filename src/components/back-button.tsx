"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

// Goes to the previous page, or home if this is the first page opened in the tab
export default function BackButton({ className, children }: { className: string; children: ReactNode }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <button type="button" onClick={goBack} className={className}>
      {children}
    </button>
  );
}
