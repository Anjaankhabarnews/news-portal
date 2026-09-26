"use client";

import Link from "next/link";
import { useEffect } from "react";
import { btn } from "@/components/ui/primitives";

/** Route-level error boundary (500s, failed data fetches, network errors). */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-16 md:py-24">
      <p className="t-kicker text-red">Something went wrong</p>
      <h1 className="t-h1 mt-2 max-w-2xl">We couldn't load this page right now.</h1>
      <p className="t-dek mt-4 max-w-xl text-lg">
        This is usually temporary — a network hiccup or a brief problem on our side. Please try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={btn("primary")}>
          Try again
        </button>
        <Link href="/" className={btn("outline")}>
          Go to the front page
        </Link>
      </div>
      {error.digest ? <p className="t-meta mt-8">Reference: {error.digest}</p> : null}
    </div>
  );
}
